import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { LetItGo } from '../src';

import type { MainToWorkerMessage, WorkerToMainMessage } from '../src/worker';

const context = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  globalAlpha: 1,
  fillStyle: '#000000',
};

interface PostedMessage {
  message: MainToWorkerMessage;
  transfer: Transferable[];
}

class FakeWorker {
  static instances: FakeWorker[] = [];

  static constructorError: Error | null = null;

  readonly messages: PostedMessage[] = [];

  readonly listeners = {
    message: new Set<(event: MessageEvent<WorkerToMainMessage>) => void>(),
    error: new Set<(event: ErrorEvent) => void>(),
  };

  terminated = false;

  postError: Error | null = null;

  constructor() {
    if (FakeWorker.constructorError) throw FakeWorker.constructorError;
    FakeWorker.instances.push(this);
  }

  addEventListener(type: 'message' | 'error', listener: EventListener): void {
    this.listeners[type].add(listener as never);
  }

  removeEventListener(type: 'message' | 'error', listener: EventListener): void {
    this.listeners[type].delete(listener as never);
  }

  postMessage(message: MainToWorkerMessage, transfer: Transferable[] = []): void {
    if (this.postError) throw this.postError;
    this.messages.push({ message, transfer });
  }

  terminate(): void {
    this.terminated = true;
  }

  emitMessage(data: WorkerToMainMessage): void {
    for (const listener of this.listeners.message) {
      listener({ data } as MessageEvent<WorkerToMainMessage>);
    }
  }

  emitError(message = 'worker crashed'): void {
    const event = { message, preventDefault: vi.fn() } as unknown as ErrorEvent;
    for (const listener of this.listeners.error) listener(event);
  }
}

let animationFrames: Map<number, FrameRequestCallback>;
let resizeCallback: ResizeObserverCallback | undefined;
let disconnectResizeObserver: ReturnType<typeof vi.fn>;
let offscreenCanvas: OffscreenCanvas;

const createRoot = (): HTMLElement => {
  const root = document.createElement('div');
  Object.defineProperties(root, {
    clientWidth: { configurable: true, value: 640 },
    clientHeight: { configurable: true, value: 360 },
  });
  document.body.appendChild(root);
  return root;
};

const workerInstance = (): FakeWorker => {
  const worker = FakeWorker.instances.at(-1);
  if (!worker) throw new Error('Expected a Worker instance.');
  return worker;
};

const completeProbe = (worker: FakeWorker): void => {
  worker.emitMessage({ type: 'probe-result', supported: true, reason: null });
};

beforeEach(() => {
  FakeWorker.instances = [];
  FakeWorker.constructorError = null;
  animationFrames = new Map();
  resizeCallback = undefined;
  disconnectResizeObserver = vi.fn();
  offscreenCanvas = { width: 0, height: 0 } as OffscreenCanvas;

  vi.stubGlobal('Worker', FakeWorker);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:let-it-go-worker');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
  Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', {
    configurable: true,
    value: vi.fn(() => offscreenCanvas),
  });
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = animationFrames.size + 1;
    animationFrames.set(id, callback);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    animationFrames.delete(id);
  });
  vi.stubGlobal('ResizeObserver', vi.fn(function ResizeObserver(callback: ResizeObserverCallback) {
    resizeCallback = callback;
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: disconnectResizeObserver,
    };
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLCanvasElement.prototype as Partial<HTMLCanvasElement>).transferControlToOffscreen;
  document.body.innerHTML = '';
});

describe('Worker renderer lifecycle', () => {
  it('does not create a Worker for the default main-thread renderer', () => {
    const snow = new LetItGo({ root: createRoot(), number: 0 });

    expect(FakeWorker.instances).toHaveLength(0);
    expect(snow.canvas).toBeInstanceOf(HTMLCanvasElement);
    snow.clear();
  });

  it('falls back on an unsupported probe without replacing the canvas', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const snow = new LetItGo({ root: createRoot(), number: 0, renderer: 'worker' });
    const initialCanvas = snow.canvas;
    const worker = workerInstance();

    worker.emitMessage({ type: 'probe-result', supported: false, reason: 'unsupported' });

    expect(snow.canvas).toBe(initialCanvas);
    expect(worker.terminated).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledOnce();
    expect(animationFrames.size).toBe(1);
    snow.clear();
  });

  it('falls back when CSP or the Worker constructor blocks startup', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    FakeWorker.constructorError = new DOMException('blocked', 'SecurityError');

    const snow = new LetItGo({ root: createRoot(), number: 0, renderer: 'worker' });

    expect(FakeWorker.instances).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
    expect(animationFrames.size).toBe(1);
    snow.clear();
  });

  it('falls back when the capability probe times out', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const snow = new LetItGo({ root: createRoot(), number: 0, renderer: 'worker' });
    const worker = workerInstance();

    vi.advanceTimersByTime(LetItGo.WORKER_TIMEOUT);

    expect(worker.terminated).toBe(true);
    expect(animationFrames.size).toBe(1);
    snow.clear();
  });

  it.each(['init failure', 'runtime crash'])('%s after transfer replaces the unusable canvas once', (failure) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = createRoot();
    const snow = new LetItGo({ root, number: 0, renderer: 'worker' });
    const transferredCanvas = snow.canvas;
    const worker = workerInstance();
    completeProbe(worker);

    if (failure === 'init failure') {
      worker.emitMessage({ type: 'error', phase: 'init', message: 'no context' });
    } else {
      worker.emitError();
    }

    expect(snow.canvas).not.toBe(transferredCanvas);
    expect(snow.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(root.querySelectorAll('canvas')).toHaveLength(1);
    expect(root.style.position).toBe('relative');
    expect(warning).toHaveBeenCalledOnce();
    snow.clear();
    expect(root.style.position).toBe('');
  });

  it('initializes from the latest validated state after probe-time changes', () => {
    const root = createRoot();
    const snow = new LetItGo({ root, number: 10, renderer: 'worker' });
    const worker = workerInstance();
    const range: [number, number] = [10, 2];

    snow.number = 4;
    snow.velocityXRange = range;
    range[0] = 999;
    snow.letItStop();
    Object.defineProperties(root, {
      clientWidth: { configurable: true, value: 480 },
      clientHeight: { configurable: true, value: 270 },
    });
    resizeCallback?.([], {} as ResizeObserver);
    completeProbe(worker);

    const init = worker.messages.find(({ message }) => message.type === 'init')?.message;
    expect(init).toMatchObject({
      type: 'init',
      frameRate: LetItGo.FRAME_RATE,
      frameInterval: LetItGo.FRAME_INTERVAL,
      maxCatchUpSteps: LetItGo.MAX_CATCH_UP_STEPS,
      width: 480,
      height: 270,
      options: { number: 4, velocityXRange: [2, 10] },
      running: false,
    });
    expect(Object.isFrozen(snow.velocityXRange)).toBe(true);

    snow.number = 6;
    expect(worker.messages.at(-1)?.message).toEqual({ type: 'options', patch: { number: 6 } });
    worker.emitMessage({ type: 'ready' });
    snow.letItGoAgain();
    expect(worker.messages.at(-1)?.message).toEqual({ type: 'start' });
    snow.clear();
  });

  describe.each(['color', 'backgroundColor'] as const)('%s with non-string fill styles', (option) => {
    it.each([
      ['gradient', { addColorStop: vi.fn() } as CanvasGradient],
      ['pattern', { setTransform: vi.fn() } as CanvasPattern],
    ] as const)('uses the original main-thread canvas at construction with a %s', (_name, style) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const root = createRoot();
      const snow = new LetItGo({
        root, number: 0, renderer: 'worker', [option]: style,
      });

      expect(FakeWorker.instances).toHaveLength(0);
      expect(HTMLCanvasElement.prototype.transferControlToOffscreen).not.toHaveBeenCalled();
      expect(snow[option]).toBe(style);
      expect(root.querySelectorAll('canvas')).toHaveLength(1);
      expect(warning).toHaveBeenCalledOnce();
      expect(animationFrames.size).toBe(1);
      snow.clear();
      expect(root.style.position).toBe('');
    });

    it.each(['probing', 'initializing', 'ready'] as const)('falls back safely when set during %s', (phase) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const root = createRoot();
      const snow = new LetItGo({ root, number: 0, renderer: 'worker' });
      const originalCanvas = snow.canvas;
      const worker = workerInstance();
      if (phase !== 'probing') completeProbe(worker);
      if (phase === 'ready') worker.emitMessage({ type: 'ready' });
      const style = { addColorStop: vi.fn() } as CanvasGradient;

      snow[option] = style;

      expect(snow[option]).toBe(style);
      expect(worker.terminated).toBe(true);
      expect(worker.messages.some(({ message }) => message.type === 'options')).toBe(false);
      expect(snow.canvas === originalCanvas).toBe(phase === 'probing');
      expect(root.querySelectorAll('canvas')).toHaveLength(1);
      expect(warning).toHaveBeenCalledOnce();
      expect(animationFrames.size).toBe(1);
      worker.emitMessage({ type: 'ready' });
      snow[option] = '#abcdef';
      expect(warning).toHaveBeenCalledOnce();
      snow.clear();
      expect(root.style.position).toBe('');
      expect(animationFrames.size).toBe(0);
    });
  });

  it('sends normalized option changes and resize messages after initialization', () => {
    const root = createRoot();
    const snow = new LetItGo({ root, number: 0, renderer: 'worker' });
    const worker = workerInstance();
    completeProbe(worker);
    worker.emitMessage({ type: 'ready' });

    const range: [number, number] = [8, 3];
    snow.alphaRange = [1, 0.5];
    snow.velocityYRange = range;
    range[0] = 100;
    Object.defineProperties(root, {
      clientWidth: { configurable: true, value: 320 },
      clientHeight: { configurable: true, value: 240 },
    });
    resizeCallback?.([], {} as ResizeObserver);

    expect(worker.messages.map(({ message }) => message).slice(-3)).toEqual([
      { type: 'options', patch: { alphaRange: [0.5, 1] } },
      { type: 'options', patch: { velocityYRange: [3, 8] } },
      { type: 'resize', width: 320, height: 240 },
    ]);
    expect(snow.canvas.width).toBe(640);
    expect(snow.canvas.style.width).toBe('100%');
    snow.clear();
  });

  it.each(['probing', 'initializing', 'ready', 'fallback'] as const)('ignores setters and late events after clear during %s', (phase) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = createRoot();
    const snow = new LetItGo({ root, number: 1, renderer: 'worker' });
    const worker = workerInstance();
    if (phase !== 'probing') completeProbe(worker);
    if (phase === 'ready') worker.emitMessage({ type: 'ready' });
    if (phase === 'fallback') worker.emitError();
    const before = {
      number: 0,
      velocityXRange: snow.velocityXRange,
      velocityYRange: snow.velocityYRange,
      radiusRange: snow.radiusRange,
      alphaRange: snow.alphaRange,
      color: snow.color,
      backgroundColor: snow.backgroundColor,
    };
    snow.clear();
    const messageCount = worker.messages.length;
    const random = vi.spyOn(Math, 'random');
    warning.mockClear();
    context.clearRect.mockClear();
    context.fill.mockClear();
    for (const invalid of [false, true]) {
      expect(() => {
        snow.number = invalid ? Number.NaN : 100;
        snow.velocityXRange = [invalid ? Number.NaN : 1, 2];
        snow.velocityYRange = [invalid ? Number.POSITIVE_INFINITY : 1, 2];
        snow.radiusRange = [invalid ? -1 : 1, 2];
        snow.alphaRange = [invalid ? 2 : 0, 1];
        snow.color = { addColorStop: vi.fn() } as CanvasGradient;
        snow.backgroundColor = { setTransform: vi.fn() } as CanvasPattern;
      }).not.toThrow();
    }
    snow.clear();
    snow.letItGoAgain();
    worker.emitMessage({ type: 'probe-result', supported: true, reason: null });
    worker.emitMessage({ type: 'ready' });
    worker.emitError();
    resizeCallback?.([], {} as ResizeObserver);
    expect(snow).toMatchObject(before);
    expect(random).not.toHaveBeenCalled();
    expect(worker.messages).toHaveLength(messageCount);
    expect(context.clearRect).not.toHaveBeenCalled();
    expect(context.fill).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
    expect(animationFrames.size).toBe(0);
    expect(root.querySelectorAll('canvas')).toHaveLength(0);
    expect(worker.terminated).toBe(true);
  });

  it('clear is repeatable and ignores late Worker messages', () => {
    const root = createRoot();
    const snow = new LetItGo({ root, number: 0, renderer: 'worker' });
    const worker = workerInstance();

    snow.clear();
    snow.clear();
    worker.emitMessage({ type: 'probe-result', supported: true, reason: null });
    worker.emitError('late crash');

    expect(worker.terminated).toBe(true);
    expect(disconnectResizeObserver).toHaveBeenCalledOnce();
    expect(root.querySelectorAll('canvas')).toHaveLength(0);
    expect(HTMLCanvasElement.prototype.transferControlToOffscreen).not.toHaveBeenCalled();
  });

  it('clear during initialization terminates the Worker and removes the transferred canvas', () => {
    const root = createRoot();
    const snow = new LetItGo({ root, number: 0, renderer: 'worker' });
    const worker = workerInstance();
    completeProbe(worker);

    snow.clear();
    worker.emitMessage({ type: 'ready' });
    worker.emitError('late initialization crash');

    expect(worker.terminated).toBe(true);
    expect(root.querySelectorAll('canvas')).toHaveLength(0);
    expect(root.style.position).toBe('');
  });
});
