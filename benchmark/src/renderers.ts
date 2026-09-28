import { LetItGo } from 'let-it-go';

import {
  FRAME_INTERVAL,
  FRAME_RATE,
  MAX_CATCH_UP_STEPS,
  createScene,
  drawScene,
  resizeScene,
  setSceneOptions,
  updateScene,
} from './engine';
import type { WorkerToMainMessage } from './protocol';
import type {
  BenchmarkMode,
  BenchmarkRenderer,
  FailureMode,
  RendererStats,
  SceneOptions,
} from './types';

const cloneOptions = (options: SceneOptions): SceneOptions => structuredClone(options);

const readMainThreadHeap = (): number | null => {
  const { memory } = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };
  return memory?.usedJSHeapSize ?? null;
};

const mountCanvas = (root: HTMLElement): HTMLCanvasElement => {
  const canvas = root.ownerDocument.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
  });
  root.appendChild(canvas);
  return canvas;
};

class ProductionRenderer implements BenchmarkRenderer {
  readonly requestedMode = 'production-main' as const;

  readonly activeMode = 'production-main' as const;

  readonly workerSupported = false;

  readonly fallbackReason = null;

  readonly #instance: LetItGo;

  readonly #stats: RendererStats = { frames: 0, steps: 0, messages: 0 };

  #running = true;

  #cleared = false;

  constructor(root: HTMLElement, options: SceneOptions, seed: number) {
    const originalRandom = Math.random;
    let randomState = seed >>> 0;
    Math.random = () => {
      randomState += 0x6D2B79F5;
      let value = randomState;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
    };
    try {
      this.#instance = new LetItGo({
        root,
        ...options,
        style: { zIndex: '0', pointerEvents: 'none' },
      });
    } finally {
      Math.random = originalRandom;
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.#instance.canvas;
  }

  get options(): SceneOptions {
    return {
      number: this.#instance.number,
      velocityXRange: this.#instance.velocityXRange,
      velocityYRange: this.#instance.velocityYRange,
      radiusRange: this.#instance.radiusRange,
      alphaRange: this.#instance.alphaRange,
      color: String(this.#instance.color),
      backgroundColor: String(this.#instance.backgroundColor),
    };
  }

  get stats(): RendererStats {
    return { ...this.#stats };
  }

  get running(): boolean {
    return this.#running;
  }

  get cleared(): boolean {
    return this.#cleared;
  }

  setOptions(patch: Partial<SceneOptions>): void {
    if (patch.number !== undefined) this.#instance.number = patch.number;
    if (patch.velocityXRange) this.#instance.velocityXRange = patch.velocityXRange;
    if (patch.velocityYRange) this.#instance.velocityYRange = patch.velocityYRange;
    if (patch.radiusRange) this.#instance.radiusRange = patch.radiusRange;
    if (patch.alphaRange) this.#instance.alphaRange = patch.alphaRange;
    if (patch.color !== undefined) this.#instance.color = patch.color;
    if (patch.backgroundColor !== undefined) this.#instance.backgroundColor = patch.backgroundColor;
  }

  async refreshStats(): Promise<RendererStats> {
    return this.stats;
  }

  async measureMemory(): Promise<number | null> {
    return readMainThreadHeap();
  }

  start(): void {
    if (this.#cleared) return;
    this.#instance.letItGoAgain();
    this.#running = true;
  }

  stop(): void {
    this.#instance.letItStop();
    this.#running = false;
  }

  resize(): void {
    // Production LetItGo owns its ResizeObserver.
  }

  async clear(): Promise<void> {
    if (this.#cleared) return;
    this.#instance.clear();
    this.#running = false;
    this.#cleared = true;
  }
}

class MainPrototypeRenderer implements BenchmarkRenderer {
  readonly activeMode = 'prototype-main' as const;

  readonly canvas: HTMLCanvasElement;

  readonly #context: CanvasRenderingContext2D;

  readonly #scene: ReturnType<typeof createScene>;

  readonly #resizeObserver: ResizeObserver;

  readonly #stats: RendererStats = { frames: 0, steps: 0, messages: 0 };

  #requestId: number | null = null;

  #lastUpdate: number | null = null;

  #running = false;

  #cleared = false;

  #dirty = true;

  constructor(
    readonly requestedMode: BenchmarkMode,
    readonly workerSupported: boolean,
    readonly fallbackReason: string | null,
    readonly root: HTMLElement,
    options: SceneOptions,
    seed: number,
  ) {
    this.canvas = mountCanvas(root);
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Main-thread 2D canvas context is unavailable.');
    this.#context = context;
    this.canvas.width = root.clientWidth;
    this.canvas.height = root.clientHeight;
    this.#scene = createScene(options, this.canvas.width, this.canvas.height, seed);
    this.#resizeObserver = new ResizeObserver(() => this.resize());
    this.#resizeObserver.observe(root);
    this.start();
  }

  get options(): SceneOptions {
    return cloneOptions(this.#scene.options);
  }

  get stats(): RendererStats {
    return { ...this.#stats };
  }

  get running(): boolean {
    return this.#running;
  }

  get cleared(): boolean {
    return this.#cleared;
  }

  #animate = (timestamp: number): void => {
    if (!this.#running) return;
    if (this.#lastUpdate === null) this.#lastUpdate = timestamp;
    const elapsed = timestamp - this.#lastUpdate;
    const dueSteps = Math.floor((elapsed * FRAME_RATE) / 1000);
    const steps = Math.min(dueSteps, MAX_CATCH_UP_STEPS);
    for (let index = 0; index < steps; index += 1) updateScene(this.#scene);
    if (steps > 0) {
      this.#stats.steps += steps;
      this.#dirty = true;
      this.#lastUpdate = timestamp - (elapsed % FRAME_INTERVAL);
    }
    if (this.#dirty) {
      drawScene(this.#scene, this.#context);
      this.#stats.frames += 1;
      this.#dirty = false;
    }
    if (this.#running) this.#requestId = requestAnimationFrame(this.#animate);
  };

  setOptions(patch: Partial<SceneOptions>): void {
    if (this.#cleared) return;
    setSceneOptions(this.#scene, patch);
    this.#dirty = true;
  }

  async refreshStats(): Promise<RendererStats> {
    return this.stats;
  }

  async measureMemory(): Promise<number | null> {
    return readMainThreadHeap();
  }

  start(): void {
    if (this.#running || this.#cleared) return;
    this.#running = true;
    this.#lastUpdate = null;
    this.#dirty = true;
    this.#requestId = requestAnimationFrame(this.#animate);
  }

  stop(): void {
    this.#running = false;
    if (this.#requestId !== null) cancelAnimationFrame(this.#requestId);
    this.#requestId = null;
  }

  resize(): void {
    if (this.#cleared) return;
    const width = this.root.clientWidth;
    const height = this.root.clientHeight;
    if (width === this.canvas.width && height === this.canvas.height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    resizeScene(this.#scene, width, height);
    this.#dirty = true;
  }

  async clear(): Promise<void> {
    if (this.#cleared) return;
    this.stop();
    this.#resizeObserver.disconnect();
    this.#context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.remove();
    this.#cleared = true;
  }
}

interface PendingRequest {
  resolve: (message: WorkerToMainMessage) => void;
  reject: (error: Error) => void;
  timeoutId: number;
}

class WorkerPrototypeRenderer implements BenchmarkRenderer {
  readonly requestedMode = 'prototype-worker' as const;

  readonly activeMode = 'prototype-worker' as const;

  readonly workerSupported = true;

  readonly fallbackReason = null;

  readonly canvas: HTMLCanvasElement;

  readonly #worker: Worker;

  readonly #root: HTMLElement;

  readonly #resizeObserver: ResizeObserver;

  readonly #pending = new Map<number, PendingRequest>();

  #options: SceneOptions;

  #stats: RendererStats = { frames: 0, steps: 0, messages: 0 };

  #nextRequestId = 1;

  #running = true;

  #cleared = false;

  private constructor(
    root: HTMLElement,
    worker: Worker,
    canvas: HTMLCanvasElement,
    options: SceneOptions,
  ) {
    this.#root = root;
    this.#worker = worker;
    this.canvas = canvas;
    this.#options = cloneOptions(options);
    this.#worker.addEventListener('message', this.#handleMessage);
    this.#worker.addEventListener('error', this.#handleWorkerError);
    this.#resizeObserver = new ResizeObserver(() => this.resize());
    this.#resizeObserver.observe(root);
  }

  static async create(
    root: HTMLElement,
    options: SceneOptions,
    seed: number,
    failureMode: FailureMode,
  ): Promise<WorkerPrototypeRenderer> {
    if (failureMode === 'unsupported') throw new Error('Worker rendering was forced unsupported.');
    if (typeof Worker === 'undefined') throw new Error('Worker is unavailable.');
    if (typeof HTMLCanvasElement.prototype.transferControlToOffscreen !== 'function') {
      throw new Error('transferControlToOffscreen is unavailable.');
    }
    if (failureMode === 'constructor') throw new Error('Worker construction was forced to fail.');

    const worker = new Worker(new URL('./renderer.worker.ts', import.meta.url), { type: 'module' });
    const probeRequestId = 1;
    const probe = await new Promise<WorkerToMainMessage>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Worker probe timed out.')), 2_000);
      const onMessage = ({ data }: MessageEvent<WorkerToMainMessage>): void => {
        if (data.type !== 'probe-result' || data.requestId !== probeRequestId) return;
        window.clearTimeout(timeout);
        worker.removeEventListener('message', onMessage);
        resolve(data);
      };
      worker.addEventListener('message', onMessage);
      worker.postMessage({
        type: 'probe',
        requestId: probeRequestId,
        failureMode: failureMode === 'probe' ? 'probe' : 'none',
      });
    }).catch((error: unknown) => {
      worker.terminate();
      throw error;
    });
    if (probe.type !== 'probe-result' || !probe.supported) {
      worker.terminate();
      throw new Error(probe.type === 'probe-result' ? probe.reason ?? 'Worker probe failed.' : 'Worker probe failed.');
    }

    const canvas = mountCanvas(root);
    canvas.width = root.clientWidth;
    canvas.height = root.clientHeight;
    const renderer = new WorkerPrototypeRenderer(root, worker, canvas, options);
    try {
      const offscreen = canvas.transferControlToOffscreen();
      const requestId = renderer.#nextRequestId;
      renderer.#nextRequestId += 1;
      const readyPromise = renderer.#waitFor(requestId, 2_000);
      worker.postMessage({
        type: 'init',
        requestId,
        canvas: offscreen,
        width: canvas.width,
        height: canvas.height,
        options,
        seed,
        failureMode: failureMode === 'init' || failureMode === 'context' ? failureMode : 'none',
      }, [offscreen]);
      const ready = await readyPromise;
      if (ready.type !== 'ready') throw new Error('Worker did not acknowledge initialization.');
      return renderer;
    } catch (error) {
      renderer.#disposeTransferredCanvas();
      throw error;
    }
  }

  get options(): SceneOptions {
    return cloneOptions(this.#options);
  }

  get stats(): RendererStats {
    return { ...this.#stats };
  }

  get running(): boolean {
    return this.#running;
  }

  get cleared(): boolean {
    return this.#cleared;
  }

  #handleMessage = ({ data }: MessageEvent<WorkerToMainMessage>): void => {
    if (data.type === 'stats') this.#stats = { ...data.stats };
    if ('requestId' in data && data.requestId !== null) {
      const pending = this.#pending.get(data.requestId);
      if (!pending) return;
      window.clearTimeout(pending.timeoutId);
      this.#pending.delete(data.requestId);
      if (data.type === 'error') pending.reject(new Error(`${data.phase}: ${data.message}`));
      else pending.resolve(data);
    }
  };

  #handleWorkerError = (event: ErrorEvent): void => {
    const error = new Error(event.message || 'Worker runtime error.');
    for (const pending of this.#pending.values()) {
      window.clearTimeout(pending.timeoutId);
      pending.reject(error);
    }
    this.#pending.clear();
  };

  #waitFor(requestId: number, timeoutMs: number): Promise<WorkerToMainMessage> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.#pending.delete(requestId);
        reject(new Error(`Worker request ${requestId} timed out.`));
      }, timeoutMs);
      this.#pending.set(requestId, { resolve, reject, timeoutId });
    });
  }

  #disposeTransferredCanvas(): void {
    this.#resizeObserver.disconnect();
    this.#worker.terminate();
    this.canvas.remove();
    this.#cleared = true;
    this.#running = false;
  }

  setOptions(patch: Partial<SceneOptions>): void {
    if (this.#cleared) return;
    this.#options = cloneOptions({ ...this.#options, ...patch });
    this.#worker.postMessage({ type: 'options', patch });
  }

  async refreshStats(): Promise<RendererStats> {
    if (this.#cleared) return this.stats;
    const requestId = this.#nextRequestId;
    this.#nextRequestId += 1;
    const responsePromise = this.#waitFor(requestId, 1_000);
    this.#worker.postMessage({ type: 'stats', requestId });
    const response = await responsePromise;
    if (response.type === 'stats') this.#stats = { ...response.stats };
    return this.stats;
  }

  async measureMemory(): Promise<number | null> {
    if (this.#cleared) return null;
    const requestId = this.#nextRequestId;
    this.#nextRequestId += 1;
    const responsePromise = this.#waitFor(requestId, 1_000);
    this.#worker.postMessage({ type: 'memory', requestId });
    const response = await responsePromise;
    if (response.type !== 'memory' || response.bytes === null) return null;
    const mainBytes = readMainThreadHeap();
    return mainBytes === null ? null : mainBytes + response.bytes;
  }

  start(): void {
    if (this.#running || this.#cleared) return;
    this.#worker.postMessage({ type: 'start' });
    this.#running = true;
  }

  stop(): void {
    if (!this.#running || this.#cleared) return;
    this.#worker.postMessage({ type: 'stop' });
    this.#running = false;
  }

  resize(): void {
    if (this.#cleared) return;
    this.#worker.postMessage({
      type: 'resize',
      width: this.#root.clientWidth,
      height: this.#root.clientHeight,
    });
  }

  async clear(): Promise<void> {
    if (this.#cleared) return;
    this.#resizeObserver.disconnect();
    const requestId = this.#nextRequestId;
    this.#nextRequestId += 1;
    const responsePromise = this.#waitFor(requestId, 500);
    this.#worker.postMessage({ type: 'clear', requestId });
    try {
      const response = await responsePromise;
      if (response.type !== 'ack') throw new Error('Worker did not acknowledge clear.');
    } finally {
      this.#worker.terminate();
      this.canvas.remove();
      this.#cleared = true;
      this.#running = false;
    }
  }
}

export interface RendererFactoryResult {
  renderer: BenchmarkRenderer;
  fallbackReason: string | null;
}

export const createRenderer = async (
  mode: BenchmarkMode,
  root: HTMLElement,
  options: SceneOptions,
  seed: number,
  failureMode: FailureMode,
): Promise<RendererFactoryResult> => {
  if (mode === 'production-main') {
    return { renderer: new ProductionRenderer(root, options, seed), fallbackReason: null };
  }
  if (mode === 'prototype-main') {
    return {
      renderer: new MainPrototypeRenderer(mode, false, null, root, options, seed),
      fallbackReason: null,
    };
  }

  try {
    const renderer = await WorkerPrototypeRenderer.create(root, options, seed, failureMode);
    return { renderer, fallbackReason: null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const supported = failureMode !== 'unsupported'
      && typeof Worker !== 'undefined'
      && typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function';
    return {
      renderer: new MainPrototypeRenderer(mode, supported, reason, root, options, seed),
      fallbackReason: reason,
    };
  }
};
