import { createSnowflakeField } from './snowflake-field';

import type { Range } from './types';
import type { SnowflakeFieldFactory } from './snowflake-field';

export interface WorkerOptions {
  number: number;
  velocityXRange: Range;
  velocityYRange: Range;
  radiusRange: Range;
  color: string;
  alphaRange: Range;
  backgroundColor: string;
}

export type MainToWorkerMessage =
  | { type: 'probe' }
  | {
    type: 'init';
    canvas: OffscreenCanvas;
    width: number;
    height: number;
    pixelRatio: number;
    options: WorkerOptions;
    running: boolean;
    frameRate: number;
    frameInterval: number;
    maxCatchUpSteps: number;
  }
  | { type: 'options'; patch: Partial<WorkerOptions> }
  | {
    type: 'resize'; width: number; height: number; pixelRatio: number;
  }
  | { type: 'start' }
  | { type: 'stop' };

export type WorkerToMainMessage =
  | { type: 'probe-result'; supported: boolean; reason: string | null }
  | { type: 'ready' }
  | { type: 'error'; phase: MainToWorkerMessage['type']; message: string };

interface InlineWorkerScope {
  postMessage(message: WorkerToMainMessage): void;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<MainToWorkerMessage>) => void,
  ): void;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(requestId: number): void;
}

// The implementation deliberately avoids syntax that Babel rewrites using outer helpers.
// Its emitted function source must remain self-contained because it becomes the Blob Worker body.
// The snowflake field factory is passed in as a parameter for the same reason.
export function workerMain(
  createField: SnowflakeFieldFactory,
  inputScope?: InlineWorkerScope,
): void {
  const scope = inputScope || globalThis as unknown as InlineWorkerScope;
  let frameRate = 0;
  let frameInterval = 0;
  let maxCatchUpSteps = 0;

  const field = createField();
  let canvas: OffscreenCanvas | null = null;
  let context: OffscreenCanvasRenderingContext2D | null = null;
  let options: WorkerOptions | null = null;
  // width and height are CSS pixels; the canvas backing store is that times pixelRatio.
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let requestId: number | null = null;
  let lastUpdate: number | null = null;
  let running = false;
  let dirty = true;

  function draw(): void {
    if (!context || !options) return;
    field.draw(context, width, height, pixelRatio, options.color, options.backgroundColor);
  }

  function animate(timestamp: number): void {
    requestId = null;
    if (!running) return;
    if (lastUpdate === null) lastUpdate = timestamp;

    const elapsed = timestamp - lastUpdate;
    const dueSteps = Math.floor((elapsed * frameRate) / 1000);
    const steps = Math.min(dueSteps, maxCatchUpSteps);
    for (let index = 0; index < steps; index += 1) field.update(width, height);
    if (steps > 0) {
      dirty = true;
      lastUpdate = timestamp - (elapsed % frameInterval);
    }

    if (dirty) {
      draw();
      dirty = false;
    }

    if (running) requestId = scope.requestAnimationFrame(animate);
  }

  function start(): void {
    if (running || !context || !options) return;
    running = true;
    lastUpdate = null;
    dirty = true;
    requestId = scope.requestAnimationFrame(animate);
  }

  function stop(): void {
    running = false;
    if (requestId !== null) scope.cancelAnimationFrame(requestId);
    requestId = null;
  }

  function setOptions(patch: Partial<WorkerOptions>): void {
    if (!options) return;
    // Object spread would make the serialized function depend on a Babel helper outside the Worker body.
    options = Object.assign({}, options, patch); // eslint-disable-line prefer-object-spread
    if (patch.number !== undefined) field.allocate(options, width, height, !running);
    if (patch.velocityXRange) field.randomize('velocityX', patch.velocityXRange);
    if (patch.velocityYRange) field.randomize('velocityY', patch.velocityYRange);
    if (patch.radiusRange) field.randomize('radius', patch.radiusRange);
    if (patch.alphaRange) field.randomize('alpha', patch.alphaRange);
    dirty = true;
  }

  scope.addEventListener('message', (event) => {
    // Destructuring would make the serialized function depend on a Babel helper outside the Worker body.
    const data = event.data; // eslint-disable-line @typescript-eslint/prefer-destructuring
    try {
      switch (data.type) {
        case 'probe': {
          let supported = false;
          if (
            typeof scope.requestAnimationFrame === 'function'
            && typeof scope.cancelAnimationFrame === 'function'
            && typeof OffscreenCanvas !== 'undefined'
          ) {
            const animationFrame = scope.requestAnimationFrame(() => {});
            scope.cancelAnimationFrame(animationFrame);
            supported = new OffscreenCanvas(1, 1).getContext('2d') !== null;
          }
          scope.postMessage({
            type: 'probe-result',
            supported,
            reason: supported ? null : 'Worker RAF or OffscreenCanvas 2D context is unavailable.',
          });
          break;
        }
        case 'init':
          frameRate = data.frameRate;
          frameInterval = data.frameInterval;
          maxCatchUpSteps = data.maxCatchUpSteps;
          canvas = data.canvas;
          width = data.width;
          height = data.height;
          pixelRatio = data.pixelRatio;
          canvas.width = Math.round(width * pixelRatio);
          canvas.height = Math.round(height * pixelRatio);
          context = canvas.getContext('2d');
          if (!context) throw new Error('Worker 2D context is unavailable.');
          options = data.options;
          field.allocate(options, width, height, !data.running);
          if (data.running) start();
          else draw();
          scope.postMessage({ type: 'ready' });
          break;
        case 'options':
          setOptions(data.patch);
          break;
        case 'resize': {
          if (!canvas || !options) break;
          if (width === data.width && height === data.height && pixelRatio === data.pixelRatio) break;
          const wasEmpty = width === 0 || height === 0;
          width = data.width;
          height = data.height;
          pixelRatio = data.pixelRatio;
          canvas.width = Math.round(width * pixelRatio);
          canvas.height = Math.round(height * pixelRatio);
          // Snowflakes seeded in an empty canvas all start at (0, 0), so spread them out again.
          if (wasEmpty && width > 0 && height > 0) field.allocate(options, width, height, !running);
          else field.constrain(width, height);
          dirty = true;
          if (!running) {
            draw();
            dirty = false;
          }
          break;
        }
        case 'start':
          start();
          break;
        case 'stop':
          stop();
          break;
        default: {
          const exhaustive: never = data;
          throw new Error(`Unknown Worker message: ${JSON.stringify(exhaustive)}`);
        }
      }
    } catch (error) {
      scope.postMessage({
        type: 'error',
        phase: data.type,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export interface InlineWorker {
  worker: Worker;
  url: string;
}

export function createInlineWorker(): InlineWorker {
  if (
    typeof Worker === 'undefined'
    || typeof Blob === 'undefined'
    || typeof URL === 'undefined'
    || typeof URL.createObjectURL !== 'function'
  ) throw new Error('Inline Web Workers are unavailable.');

  const source = `(${workerMain.toString()})(${createSnowflakeField.toString()})`;
  const blob = new Blob([source], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    return { worker: new Worker(url), url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
