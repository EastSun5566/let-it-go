import type { Range } from './types';

export interface WorkerOptions {
  number: number;
  velocityXRange: Range;
  velocityYRange: Range;
  radiusRange: Range;
  color: CanvasFillStrokeStyles['fillStyle'];
  alphaRange: Range;
  backgroundColor: CanvasFillStrokeStyles['fillStyle'];
}

export type MainToWorkerMessage =
  | { type: 'probe' }
  | {
    type: 'init';
    canvas: OffscreenCanvas;
    width: number;
    height: number;
    options: WorkerOptions;
    running: boolean;
  }
  | { type: 'options'; patch: Partial<WorkerOptions> }
  | { type: 'resize'; width: number; height: number }
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

interface WorkerSnowflake {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  alpha: number;
}

// The implementation deliberately avoids syntax that Babel rewrites using outer helpers.
// Its emitted function source must remain self-contained because it becomes the Blob Worker body.
export function workerMain(inputScope?: InlineWorkerScope): void {
  const scope = inputScope || globalThis as unknown as InlineWorkerScope;
  const frameRate = 30;
  const frameInterval = 1000 / frameRate;
  const maxCatchUpSteps = 5;

  let canvas: OffscreenCanvas | null = null;
  let context: OffscreenCanvasRenderingContext2D | null = null;
  let options: WorkerOptions | null = null;
  let snowflakes: WorkerSnowflake[] = [];
  let width = 0;
  let height = 0;
  let requestId: number | null = null;
  let lastUpdate: number | null = null;
  let running = false;
  let dirty = true;

  function randomInRange(range: Range): number {
    return Math.random() * (range[1] - range[0]) + range[0];
  }

  function createSnowflake(): WorkerSnowflake {
    if (!options) throw new Error('Worker options are unavailable.');

    const velocityY = randomInRange(options.velocityYRange);
    let y: number;
    if (velocityY > 0) y = randomInRange([-height, 0]);
    else if (velocityY < 0) y = randomInRange([height, height * 2]);
    else y = randomInRange([0, height]);

    return {
      x: randomInRange([0, width]),
      y,
      velocityX: randomInRange(options.velocityXRange),
      velocityY,
      radius: randomInRange(options.radiusRange),
      alpha: randomInRange(options.alphaRange),
    };
  }

  function createSnowflakes(): void {
    if (!options) return;
    snowflakes = Array.from({ length: options.number }, createSnowflake);
  }

  function update(): void {
    snowflakes.forEach((snowflake) => {
      if (snowflake.velocityY >= 0 && snowflake.y - snowflake.radius > height) {
        snowflake.y = -snowflake.radius;
      }
      if (snowflake.velocityY < 0 && snowflake.y + snowflake.radius < 0) {
        snowflake.y = height + snowflake.radius;
      }
      if (snowflake.x - snowflake.radius > width) snowflake.x = -snowflake.radius;
      if (snowflake.x + snowflake.radius < 0) snowflake.x = width + snowflake.radius;

      snowflake.x += snowflake.velocityX;
      snowflake.y += snowflake.velocityY;
    });
  }

  function draw(): void {
    if (!context || !options) return;

    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = options.color;

    snowflakes.forEach((snowflake) => {
      if (!context) return;
      context.globalAlpha = snowflake.alpha;
      context.beginPath();
      context.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
  }

  function animate(timestamp: number): void {
    requestId = null;
    if (!running) return;
    if (lastUpdate === null) lastUpdate = timestamp;

    const elapsed = timestamp - lastUpdate;
    const dueSteps = Math.floor((elapsed * frameRate) / 1000);
    const steps = Math.min(dueSteps, maxCatchUpSteps);
    for (let index = 0; index < steps; index += 1) update();
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
    if (patch.number !== undefined) createSnowflakes();
    if (patch.velocityXRange) {
      snowflakes.forEach((snowflake) => {
        snowflake.velocityX = randomInRange(patch.velocityXRange as Range);
      });
    }
    if (patch.velocityYRange) {
      snowflakes.forEach((snowflake) => {
        snowflake.velocityY = randomInRange(patch.velocityYRange as Range);
      });
    }
    if (patch.radiusRange) {
      snowflakes.forEach((snowflake) => {
        snowflake.radius = randomInRange(patch.radiusRange as Range);
      });
    }
    if (patch.alphaRange) {
      snowflakes.forEach((snowflake) => {
        snowflake.alpha = randomInRange(patch.alphaRange as Range);
      });
    }
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
          canvas = data.canvas;
          width = data.width;
          height = data.height;
          canvas.width = width;
          canvas.height = height;
          context = canvas.getContext('2d');
          if (!context) throw new Error('Worker 2D context is unavailable.');
          options = data.options;
          createSnowflakes();
          if (data.running) start();
          else draw();
          scope.postMessage({ type: 'ready' });
          break;
        case 'options':
          setOptions(data.patch);
          break;
        case 'resize':
          if (!canvas) break;
          width = data.width;
          height = data.height;
          canvas.width = width;
          canvas.height = height;
          dirty = true;
          break;
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

  const blob = new Blob([`(${workerMain.toString()})()`], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    return { worker: new Worker(url), url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
