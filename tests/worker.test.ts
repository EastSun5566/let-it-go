import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { workerMain } from '../src/worker';

import type {
  MainToWorkerMessage,
  WorkerOptions,
  WorkerToMainMessage,
} from '../src/worker';

interface TestWorkerScope {
  postMessage(message: WorkerToMainMessage): void;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<MainToWorkerMessage>) => void,
  ): void;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(requestId: number): void;
}

class FakeWorkerScope implements TestWorkerScope {
  readonly messages: WorkerToMainMessage[] = [];

  readonly callbacks = new Map<number, FrameRequestCallback>();

  readonly cancelledFrames: number[] = [];

  #messageListener: ((event: MessageEvent<MainToWorkerMessage>) => void) | null = null;

  #nextRequestId = 1;

  postMessage(message: WorkerToMainMessage): void {
    this.messages.push(message);
  }

  addEventListener(
    _type: 'message',
    listener: (event: MessageEvent<MainToWorkerMessage>) => void,
  ): void {
    this.#messageListener = listener;
  }

  requestAnimationFrame(callback: FrameRequestCallback): number {
    const requestId = this.#nextRequestId;
    this.#nextRequestId += 1;
    this.callbacks.set(requestId, callback);
    return requestId;
  }

  cancelAnimationFrame(requestId: number): void {
    this.callbacks.delete(requestId);
    this.cancelledFrames.push(requestId);
  }

  dispatch(message: MainToWorkerMessage): void {
    if (!this.#messageListener) throw new Error('Worker message listener is missing.');
    this.#messageListener({ data: message } as MessageEvent<MainToWorkerMessage>);
  }

  runAnimationFrame(timestamp: number): void {
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    callbacks.forEach((callback) => callback(timestamp));
  }
}

const defaultOptions: WorkerOptions = {
  number: 1,
  velocityXRange: [1, 1],
  velocityYRange: [0, 0],
  radiusRange: [1, 1],
  color: '#ffffff',
  alphaRange: [0.5, 0.5],
  backgroundColor: 'transparent',
};

const createContext = () => {
  const fillRectAlphas: number[] = [];
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(function fillRect(this: typeof context) {
      fillRectAlphas.push(this.globalAlpha);
    }),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalAlpha: 1,
    fillStyle: '#000000' as CanvasFillStrokeStyles['fillStyle'],
  };
  return { context, fillRectAlphas };
};

beforeEach(() => {
  class ProbeOffscreenCanvas {
    getContext(): object {
      return {};
    }
  }
  vi.stubGlobal('OffscreenCanvas', ProbeOffscreenCanvas);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('inline Worker renderer', () => {
  it('probes Worker RAF and the OffscreenCanvas 2D context', () => {
    const scope = new FakeWorkerScope();
    workerMain(scope);

    scope.dispatch({ type: 'probe' });

    expect(scope.messages).toEqual([
      { type: 'probe-result', supported: true, reason: null },
    ]);
    expect(scope.cancelledFrames).toEqual([1]);
    expect(scope.callbacks.size).toBe(0);
  });

  it('reports an unsupported OffscreenCanvas 2D context', () => {
    class UnsupportedOffscreenCanvas {
      getContext(): null {
        return null;
      }
    }
    vi.stubGlobal('OffscreenCanvas', UnsupportedOffscreenCanvas);
    const scope = new FakeWorkerScope();
    workerMain(scope);

    scope.dispatch({ type: 'probe' });

    expect(scope.messages[0]).toMatchObject({ type: 'probe-result', supported: false });
  });

  it('uses a fixed timestep, caps catch-up work, and resets drawing alpha', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const scope = new FakeWorkerScope();
    const { context, fillRectAlphas } = createContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as OffscreenCanvas;
    workerMain(scope);

    scope.dispatch({
      type: 'init',
      canvas,
      width: 100,
      height: 100,
      options: defaultOptions,
      running: true,
    });
    scope.runAnimationFrame(0);
    scope.runAnimationFrame(100);
    expect(context.arc).toHaveBeenLastCalledWith(53, 50, 1, 0, Math.PI * 2);

    scope.runAnimationFrame(10_000);
    expect(context.arc).toHaveBeenLastCalledWith(58, 50, 1, 0, Math.PI * 2);
    expect(fillRectAlphas.every((alpha) => alpha === 1)).toBe(true);
    expect(context.globalAlpha).toBe(1);
  });

  it('wraps snowflakes and cancels animation when stopped', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);
    const scope = new FakeWorkerScope();
    const { context } = createContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as OffscreenCanvas;
    workerMain(scope);
    scope.dispatch({
      type: 'init',
      canvas,
      width: 100,
      height: 100,
      options: { ...defaultOptions, velocityXRange: [10, 10] },
      running: true,
    });

    scope.runAnimationFrame(0);
    scope.runAnimationFrame(100);
    expect(context.arc).toHaveBeenLastCalledWith(19, 100, 1, 0, Math.PI * 2);

    scope.dispatch({ type: 'stop' });
    expect(scope.callbacks.size).toBe(0);
    expect(scope.cancelledFrames.at(-1)).toBeDefined();
  });

  it('updates options and backing dimensions through typed messages', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const scope = new FakeWorkerScope();
    const { context } = createContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as OffscreenCanvas;
    workerMain(scope);
    scope.dispatch({
      type: 'init',
      canvas,
      width: 100,
      height: 80,
      options: defaultOptions,
      running: false,
    });

    scope.dispatch({ type: 'resize', width: 320, height: 240 });
    scope.dispatch({ type: 'options', patch: { number: 2, color: '#123456' } });
    scope.dispatch({ type: 'start' });
    scope.runAnimationFrame(0);

    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
    expect(context.fillStyle).toBe('#123456');
    expect(context.arc).toHaveBeenCalledTimes(3);
  });
});
