import { LetItGo } from 'let-it-go';

import type {
  BenchmarkMode,
  BenchmarkRenderer,
  RendererStats,
  SceneOptions,
} from './types';

const readMainThreadHeap = (): number | null => {
  const { memory } = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };
  return memory?.usedJSHeapSize ?? null;
};

interface WorkerObservation {
  ready: Promise<void>;
  failureReason: string | null;
  restore(): void;
}

const observeNextWorker = (): WorkerObservation => {
  const NativeWorker = window.Worker;
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  let settled = false;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const observation: WorkerObservation = {
    ready,
    failureReason: null,
    restore: () => {
      window.Worker = NativeWorker;
    },
  };

  window.Worker = class BenchmarkWorker extends NativeWorker {
    constructor(scriptURL: string | URL, options?: WorkerOptions) {
      super(scriptURL, options);
      this.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
        if (!data || typeof data !== 'object' || !('type' in data)) return;
        const message = data as {
          type: string;
          supported?: boolean;
          reason?: string | null;
          message?: string;
        };
        if (message.type === 'ready' && !settled) {
          settled = true;
          resolveReady();
        }
        if (message.type === 'probe-result' && message.supported === false && !settled) {
          settled = true;
          observation.failureReason = message.reason ?? 'Production Worker probe failed.';
          rejectReady(new Error(observation.failureReason));
        }
        if (message.type === 'error') {
          observation.failureReason = message.message ?? 'Production Worker failed.';
          if (!settled) {
            settled = true;
            rejectReady(new Error(observation.failureReason));
          }
        }
      });
      this.addEventListener('error', (event) => {
        observation.failureReason = event.message || 'Production Worker crashed.';
        if (!settled) {
          settled = true;
          rejectReady(new Error(observation.failureReason));
        }
      });
    }
  } as typeof Worker;

  return observation;
};

class ProductionRenderer implements BenchmarkRenderer {
  readonly workerSupported: boolean;

  readonly #instance: LetItGo;

  readonly #observation: WorkerObservation | null;

  readonly #startupFallbackReason: string | null;

  readonly #stats: RendererStats = { frames: 0, steps: 0, messages: 0 };

  #running = true;

  #cleared = false;

  private constructor(
    readonly requestedMode: BenchmarkMode,
    workerSupported: boolean,
    instance: LetItGo,
    observation: WorkerObservation | null = null,
    startupFallbackReason: string | null = null,
  ) {
    this.workerSupported = workerSupported;
    this.#instance = instance;
    this.#observation = observation;
    this.#startupFallbackReason = startupFallbackReason;
  }

  static async create(
    mode: BenchmarkMode,
    root: HTMLElement,
    options: SceneOptions,
    seed: number,
  ): Promise<ProductionRenderer> {
    const renderer = mode === 'production-worker' ? 'worker' : 'main';
    const transferSupported = typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function';
    const observation = renderer === 'worker' && transferSupported ? observeNextWorker() : null;
    const originalRandom = Math.random;
    let randomState = seed >>> 0;
    Math.random = () => {
      randomState += 0x6D2B79F5;
      let value = randomState;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
    };

    let instance: LetItGo;
    try {
      instance = new LetItGo({
        root,
        ...options,
        renderer,
        style: { zIndex: '0', pointerEvents: 'none' },
      });
    } finally {
      Math.random = originalRandom;
    }

    if (renderer === 'main') {
      return new ProductionRenderer(mode, false, instance);
    }
    if (!transferSupported || !observation) {
      return new ProductionRenderer(
        mode,
        false,
        instance,
        null,
        'OffscreenCanvas transfer is unavailable.',
      );
    }

    try {
      await Promise.race([
        observation.ready,
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('Production Worker startup timed out.')), 2_500);
        }),
      ]);
      return new ProductionRenderer(mode, true, instance, observation);
    } catch (error) {
      observation.failureReason ??= error instanceof Error ? error.message : String(error);
      return new ProductionRenderer(
        mode,
        transferSupported,
        instance,
        observation,
        observation.failureReason,
      );
    } finally {
      observation.restore();
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.#instance.canvas;
  }

  get activeMode(): BenchmarkMode {
    return this.requestedMode === 'production-worker'
      && this.#observation
      && !this.#observation.failureReason
      ? 'production-worker'
      : 'production-main';
  }

  get fallbackReason(): string | null {
    return this.#observation?.failureReason ?? this.#startupFallbackReason;
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

export interface RendererFactoryResult {
  renderer: BenchmarkRenderer;
  fallbackReason: string | null;
}

export const createRenderer = async (
  mode: BenchmarkMode,
  root: HTMLElement,
  options: SceneOptions,
  seed: number,
): Promise<RendererFactoryResult> => {
  const renderer = await ProductionRenderer.create(mode, root, options, seed);
  return { renderer, fallbackReason: renderer.fallbackReason };
};
