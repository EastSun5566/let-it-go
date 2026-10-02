import {
  Vec2D,
  Snowflake,
  assert,
  assertIsAlphaRange,
  assertIsRadiusRange,
  assertIsRange,
  assertIsSnowflakeNumber,
  getRandom,
  normalizeRange,
  setStyleProps,
} from './utils';
import {
  DEFAULT_OPTIONS,
  MAX_SNOWFLAKES as MAX_SNOWFLAKE_COUNT,
} from './constants';
import { createInlineWorker } from './worker';

import type { Options, Range } from './types';
import type {
  MainToWorkerMessage,
  WorkerOptions,
  WorkerToMainMessage,
} from './worker';

interface RootPositionState {
  initialInlinePosition: string;
  mountedInstances: number;
}

type WorkerPhase = 'idle' | 'probing' | 'initializing' | 'ready';

const rootPositionStates = new WeakMap<HTMLElement, RootPositionState>();

export class LetItGo {
  readonly root: HTMLElement;

  #isGo = false;

  #isCleared = false;

  #number = 0;

  get number(): number {
    return this.#number;
  }

  set number(number: number) {
    assertIsSnowflakeNumber(number);

    this.#number = number;
    if (this.#usesMainRenderer()) this.#createSnowflakes();
    else this.#sendWorkerOptions({ number });
    this.#isDirty = true;
  }

  #velocityXRange: Range;

  get velocityXRange(): Range {
    return this.#velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertIsRange(range);

    const normalizedRange = normalizeRange(range);
    this.#velocityXRange = normalizedRange;
    if (this.#usesMainRenderer()) {
      this.#snowflakes.forEach((snowflake) => {
        snowflake.v.x = getRandom(...normalizedRange);
      });
    } else {
      this.#sendWorkerOptions({ velocityXRange: normalizedRange });
    }
    this.#isDirty = true;
  }

  #velocityYRange: Range;

  get velocityYRange(): Range {
    return this.#velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertIsRange(range);

    const normalizedRange = normalizeRange(range);
    this.#velocityYRange = normalizedRange;
    if (this.#usesMainRenderer()) {
      this.#snowflakes.forEach((snowflake) => {
        snowflake.v.y = getRandom(...normalizedRange);
      });
    } else {
      this.#sendWorkerOptions({ velocityYRange: normalizedRange });
    }
    this.#isDirty = true;
  }

  #radiusRange: Range;

  get radiusRange(): Range {
    return this.#radiusRange;
  }

  set radiusRange(range: Range) {
    assertIsRadiusRange(range);

    const normalizedRange = normalizeRange(range);
    this.#radiusRange = normalizedRange;
    if (this.#usesMainRenderer()) {
      this.#snowflakes.forEach((snowflake) => {
        snowflake.r = getRandom(...normalizedRange);
      });
    } else {
      this.#sendWorkerOptions({ radiusRange: normalizedRange });
    }
    this.#isDirty = true;
  }

  #color: CanvasFillStrokeStyles['fillStyle'];

  get color(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#color;
  }

  set color(color: CanvasFillStrokeStyles['fillStyle']) {
    this.#color = color;
    if (!this.#usesMainRenderer()) {
      if (typeof color === 'string') this.#sendWorkerOptions({ color });
      else this.#fallbackToMain('CanvasGradient and CanvasPattern require the main-thread renderer.');
    }
    this.#isDirty = true;
  }

  #alphaRange: Range;

  get alphaRange(): Range {
    return this.#alphaRange;
  }

  set alphaRange(range: Range) {
    assertIsAlphaRange(range);

    const normalizedRange = normalizeRange(range);
    this.#alphaRange = normalizedRange;
    if (this.#usesMainRenderer()) {
      this.#snowflakes.forEach((snowflake) => {
        snowflake.alpha = getRandom(...normalizedRange);
      });
    } else {
      this.#sendWorkerOptions({ alphaRange: normalizedRange });
    }
    this.#isDirty = true;
  }

  #backgroundColor: CanvasFillStrokeStyles['fillStyle'];

  get backgroundColor(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#backgroundColor;
  }

  set backgroundColor(backgroundColor: CanvasFillStrokeStyles['fillStyle']) {
    this.#backgroundColor = backgroundColor;
    if (!this.#usesMainRenderer()) {
      if (typeof backgroundColor === 'string') this.#sendWorkerOptions({ backgroundColor });
      else this.#fallbackToMain('CanvasGradient and CanvasPattern require the main-thread renderer.');
    }
    this.#isDirty = true;
  }

  readonly style: Readonly<Partial<CSSStyleDeclaration>>;

  #canvas: HTMLCanvasElement;

  get canvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  #ctx: CanvasRenderingContext2D | null = null;

  #snowflakes: Snowflake[] = [];

  #lastUpdate: number | null = null;

  #requestID: number | null = null;

  #isDirty = true;

  #rootPositionState: RootPositionState | null = null;

  #resizeObserver: ResizeObserver | null = null;

  #worker: Worker | null = null;

  #workerURL: string | null = null;

  #workerTimeout: ReturnType<typeof setTimeout> | null = null;

  #workerPhase: WorkerPhase = 'idle';

  #canvasTransferred = false;

  #didWarnAboutFallback = false;

  static readonly DEFAULT_OPTIONS = DEFAULT_OPTIONS;

  static readonly MAX_SNOWFLAKES = MAX_SNOWFLAKE_COUNT;

  static readonly WORKER_TIMEOUT = 2000;

  constructor({
    root = DEFAULT_OPTIONS.root,
    number = DEFAULT_OPTIONS.number,
    velocityXRange = DEFAULT_OPTIONS.velocityXRange,
    velocityYRange = DEFAULT_OPTIONS.velocityYRange,
    radiusRange = DEFAULT_OPTIONS.radiusRange,
    color = DEFAULT_OPTIONS.color,
    alphaRange = DEFAULT_OPTIONS.alphaRange,
    backgroundColor = DEFAULT_OPTIONS.backgroundColor,
    style = DEFAULT_OPTIONS.style,
    renderer = DEFAULT_OPTIONS.renderer,
  }: Readonly<Options> = {}) {
    assertIsRange(velocityXRange);
    assertIsRange(velocityYRange);
    assertIsRadiusRange(radiusRange);
    assertIsAlphaRange(alphaRange);
    assertIsSnowflakeNumber(number);
    assert(
      renderer === 'main' || renderer === 'worker',
      'Renderer must be either "main" or "worker".',
    );

    this.root = root;
    this.#canvas = root.ownerDocument.createElement('canvas');
    this.#number = number;
    this.#velocityXRange = normalizeRange(velocityXRange);
    this.#velocityYRange = normalizeRange(velocityYRange);
    this.#radiusRange = normalizeRange(radiusRange);
    this.#color = color;
    this.#alphaRange = normalizeRange(alphaRange);
    this.#backgroundColor = backgroundColor;
    this.style = Object.freeze({ ...style });

    if (renderer === 'main') {
      const context = this.#canvas.getContext('2d');
      if (!context) throw new Error('[let-it-go] The 2d context canvas is not supported.');
      this.#ctx = context;
    }

    this.#mountCanvas();
    this.#isGo = true;

    if (renderer === 'worker') this.#startWorkerRenderer();
    else this.#startMainRenderer();
  }

  #usesMainRenderer(): boolean {
    return this.#ctx !== null;
  }

  #applyCanvasPresentation(canvas: HTMLCanvasElement): void {
    setStyleProps(canvas, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      ...this.style,
    });
    canvas.setAttribute('aria-hidden', 'true');
  }

  #resizeCanvas(): void {
    if (this.#isCleared) return;

    const width = this.root.clientWidth;
    const height = this.root.clientHeight;
    if (this.#canvasTransferred) {
      if (this.#workerPhase === 'initializing' || this.#workerPhase === 'ready') {
        this.#postWorker({ type: 'resize', width, height });
      }
      return;
    }

    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.#snowflakes.forEach((snowflake) => snowflake.constrainStationaryPosition(width, height));
    this.#isDirty = true;
  }

  #mountCanvas(): void {
    try {
      const resizeObserver = new ResizeObserver(() => {
        this.#resizeCanvas();
      });
      resizeObserver.observe(this.root);
      this.#resizeObserver = resizeObserver;
    } catch (error) {
      console.warn('[let-it-go] ResizeObserver is not supported.', error);
    }

    this.#resizeCanvas();

    const existingRootPositionState = rootPositionStates.get(this.root);
    if (existingRootPositionState) {
      existingRootPositionState.mountedInstances += 1;
      this.#rootPositionState = existingRootPositionState;
    } else {
      const computedPosition = this.root.ownerDocument.defaultView
        ?.getComputedStyle(this.root).position;
      if (!computedPosition || computedPosition === 'static') {
        const rootPositionState = {
          initialInlinePosition: this.root.style.position,
          mountedInstances: 1,
        };
        rootPositionStates.set(this.root, rootPositionState);
        this.#rootPositionState = rootPositionState;
      }
    }

    if (this.#rootPositionState?.mountedInstances === 1) {
      setStyleProps(this.root, { position: 'relative' });
    }
    this.#applyCanvasPresentation(this.canvas);
    this.root.appendChild(this.canvas);
  }

  #snapshotWorkerOptions(): WorkerOptions {
    const color = this.#color;
    const backgroundColor = this.#backgroundColor;
    if (typeof color !== 'string' || typeof backgroundColor !== 'string') {
      throw new Error('CanvasGradient and CanvasPattern require the main-thread renderer.');
    }
    return {
      number: this.#number,
      velocityXRange: this.#velocityXRange,
      velocityYRange: this.#velocityYRange,
      radiusRange: this.#radiusRange,
      color,
      alphaRange: this.#alphaRange,
      backgroundColor,
    };
  }

  #startWorkerRenderer(): void {
    if (typeof this.canvas.transferControlToOffscreen !== 'function') {
      this.#fallbackToMain('OffscreenCanvas transfer is unavailable.');
      return;
    }

    try {
      this.#snapshotWorkerOptions();
      const { worker, url } = createInlineWorker();
      this.#worker = worker;
      this.#workerURL = url;
      this.#workerPhase = 'probing';
      worker.addEventListener('message', this.#handleWorkerMessage);
      worker.addEventListener('error', this.#handleWorkerError);
      this.#setWorkerTimeout('Worker capability probe timed out.');
      this.#postWorker({ type: 'probe' });
    } catch (error) {
      this.#fallbackToMain(error);
    }
  }

  #handleWorkerMessage = ({ data }: MessageEvent<WorkerToMainMessage>): void => {
    if (this.#isCleared) return;

    if (data.type === 'probe-result') {
      if (this.#workerPhase !== 'probing') return;
      this.#clearWorkerTimeout();
      this.#revokeWorkerURL();
      if (!data.supported) {
        this.#fallbackToMain(data.reason ?? 'Worker renderer is unsupported.');
        return;
      }
      this.#initializeWorkerRenderer();
      return;
    }

    if (data.type === 'ready') {
      if (this.#workerPhase !== 'initializing') return;
      this.#clearWorkerTimeout();
      this.#workerPhase = 'ready';
      return;
    }

    if (data.type === 'error') {
      this.#fallbackToMain(`Worker ${data.phase} failed: ${data.message}`);
    }
  };

  #handleWorkerError = (event: ErrorEvent): void => {
    event.preventDefault();
    this.#fallbackToMain(event.message || 'Worker renderer crashed.');
  };

  #initializeWorkerRenderer(): void {
    try {
      const options = this.#snapshotWorkerOptions();
      const offscreenCanvas = this.canvas.transferControlToOffscreen();
      this.#canvasTransferred = true;
      this.#workerPhase = 'initializing';
      this.#setWorkerTimeout('Worker renderer initialization timed out.');
      this.#postWorker({
        type: 'init',
        canvas: offscreenCanvas,
        width: this.root.clientWidth,
        height: this.root.clientHeight,
        options,
        running: this.#isGo,
        frameRate: LetItGo.FRAME_RATE,
        frameInterval: LetItGo.FRAME_INTERVAL,
        maxCatchUpSteps: LetItGo.MAX_CATCH_UP_STEPS,
      }, [offscreenCanvas]);
    } catch (error) {
      this.#fallbackToMain(error);
    }
  }

  #setWorkerTimeout(message: string): void {
    this.#clearWorkerTimeout();
    this.#workerTimeout = setTimeout(() => {
      this.#workerTimeout = null;
      this.#fallbackToMain(message);
    }, LetItGo.WORKER_TIMEOUT);
  }

  #clearWorkerTimeout(): void {
    if (this.#workerTimeout === null) return;
    clearTimeout(this.#workerTimeout);
    this.#workerTimeout = null;
  }

  #postWorker(message: MainToWorkerMessage, transfer: Transferable[] = []): void {
    if (!this.#worker || this.#isCleared) return;
    try {
      this.#worker.postMessage(message, transfer);
    } catch (error) {
      this.#fallbackToMain(error);
    }
  }

  #sendWorkerOptions(patch: Partial<WorkerOptions>): void {
    if (this.#workerPhase !== 'initializing' && this.#workerPhase !== 'ready') return;
    this.#postWorker({ type: 'options', patch });
  }

  #revokeWorkerURL(): void {
    if (!this.#workerURL) return;
    URL.revokeObjectURL(this.#workerURL);
    this.#workerURL = null;
  }

  #disposeWorker(): void {
    this.#clearWorkerTimeout();
    this.#revokeWorkerURL();
    if (this.#worker) {
      this.#worker.removeEventListener('message', this.#handleWorkerMessage);
      this.#worker.removeEventListener('error', this.#handleWorkerError);
      this.#worker.terminate();
      this.#worker = null;
    }
    this.#workerPhase = 'idle';
  }

  #replaceTransferredCanvas(): void {
    const previousCanvas = this.#canvas;
    const replacement = this.root.ownerDocument.createElement('canvas');
    replacement.width = this.root.clientWidth;
    replacement.height = this.root.clientHeight;
    this.#applyCanvasPresentation(replacement);
    previousCanvas.replaceWith(replacement);
    this.#canvas = replacement;
    this.#canvasTransferred = false;
  }

  #fallbackToMain(reason: unknown): void {
    this.#disposeWorker();
    if (this.#isCleared || this.#usesMainRenderer()) return;

    if (!this.#didWarnAboutFallback) {
      console.warn(
        '[let-it-go] Worker renderer unavailable; falling back to the main thread.',
        reason,
      );
      this.#didWarnAboutFallback = true;
    }

    if (this.#canvasTransferred) this.#replaceTransferredCanvas();

    const context = this.canvas.getContext('2d');
    if (!context) {
      console.error('[let-it-go] The 2d context canvas is not supported.');
      return;
    }
    this.#ctx = context;
    this.#startMainRenderer();
  }

  #startMainRenderer(): void {
    this.#createSnowflakes();
    this.#lastUpdate = null;
    this.#isDirty = true;
    if (this.#isGo && this.#requestID === null) {
      this.#requestID = requestAnimationFrame(this.#animate);
    } else if (!this.#isGo) {
      this.#draw();
      this.#isDirty = false;
    }
  }

  #createSnowflakes(): void {
    const { canvas } = this;

    this.#snowflakes = Array.from(
      { length: this.#number },
      () => {
        const velocity = new Vec2D(
          getRandom(...this.#velocityXRange),
          getRandom(...this.#velocityYRange),
        );
        let verticalStart: number;
        if (velocity.y > 0) {
          verticalStart = getRandom(-canvas.height, 0);
        } else if (velocity.y < 0) {
          verticalStart = getRandom(canvas.height, canvas.height * 2);
        } else {
          verticalStart = getRandom(0, canvas.height);
        }

        return new Snowflake({
          p: new Vec2D(getRandom(0, canvas.width), verticalStart),
          v: velocity,
          r: getRandom(...this.#radiusRange),
          alpha: getRandom(...this.#alphaRange),
        });
      },
    );
  }

  #update = (): void => {
    this.#snowflakes.forEach(
      (snowflake) => snowflake.update(this.canvas),
    );
  };

  #draw = (): void => {
    if (!this.#ctx) return;

    const { width, height } = this.canvas;
    const context = this.#ctx;

    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = this.#color;

    for (const snowflake of this.#snowflakes) {
      context.globalAlpha = snowflake.alpha;
      context.beginPath();
      snowflake.draw(context);
      context.fill();
    }

    context.globalAlpha = 1;
  };

  #animate = (timestamp: number): void => {
    this.#requestID = null;
    if (!this.#isGo || this.#isCleared) return;

    if (this.#lastUpdate === null) this.#lastUpdate = timestamp;

    const elapsed = timestamp - this.#lastUpdate;
    const dueSteps = Math.floor((elapsed * LetItGo.FRAME_RATE) / 1000);
    const steps = Math.min(dueSteps, LetItGo.MAX_CATCH_UP_STEPS);
    for (let index = 0; index < steps; index += 1) this.#update();
    if (steps > 0) {
      this.#isDirty = true;
      this.#lastUpdate = timestamp - (elapsed % LetItGo.FRAME_INTERVAL);
    }

    if (this.#isDirty) {
      this.#draw();
      this.#isDirty = false;
    }

    if (this.#isGo) this.#requestID = requestAnimationFrame(this.#animate);
  };

  static readonly FRAME_RATE = 30;

  static readonly FRAME_INTERVAL = 1000 / LetItGo.FRAME_RATE;

  static readonly MAX_CATCH_UP_STEPS = 5;

  letItStop(): void {
    if (this.#isCleared) return;
    this.#isGo = false;

    if (this.#workerPhase === 'initializing' || this.#workerPhase === 'ready') {
      this.#postWorker({ type: 'stop' });
    }
    if (this.#requestID !== null) {
      cancelAnimationFrame(this.#requestID);
      this.#requestID = null;
    }
  }

  letItGoAgain(): void {
    if (this.#isCleared || this.#isGo) return;
    this.#isGo = true;

    if (this.#workerPhase === 'initializing' || this.#workerPhase === 'ready') {
      this.#postWorker({ type: 'start' });
    } else if (this.#usesMainRenderer() && this.#requestID === null) {
      this.#lastUpdate = null;
      this.#isDirty = true;
      this.#requestID = requestAnimationFrame(this.#animate);
    }
  }

  clear(): void {
    if (this.#isCleared) return;
    this.#isCleared = true;
    this.#isGo = false;

    if (this.#requestID !== null) cancelAnimationFrame(this.#requestID);
    this.#requestID = null;
    this.#disposeWorker();
    this.#snowflakes = [];

    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    if (this.#ctx) this.#ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.remove();

    if (this.#rootPositionState) {
      this.#rootPositionState.mountedInstances -= 1;
      if (this.#rootPositionState.mountedInstances === 0) {
        rootPositionStates.delete(this.root);
        if (this.root.style.position === 'relative') {
          this.root.style.position = this.#rootPositionState.initialInlinePosition;
        }
      }
      this.#rootPositionState = null;
    }

    this.#number = 0;
  }
}

export default LetItGo;
