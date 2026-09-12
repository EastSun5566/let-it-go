import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { LetItGo, MAX_SNOWFLAKES } from '../src';
import { Snowflake } from '../src/utils/Snowflake';

// Mock canvas context
const mockCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  globalAlpha: 1,
  fillStyle: '#000',
};

let animationFrames: Map<number, FrameRequestCallback>;
let nextAnimationFrameID: number;

const runAnimationFrame = (timestamp: number): void => {
  const callbacks = [...animationFrames.values()];
  animationFrames.clear();
  callbacks.forEach((callback) => callback(timestamp));
};

beforeEach(() => {
  animationFrames = new Map();
  nextAnimationFrameID = 1;

  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasContext);

  // Mock requestAnimationFrame & cancelAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback) => {
      const id = nextAnimationFrameID;
      nextAnimationFrameID += 1;
      animationFrames.set(id, callback);
      return id;
    },
  );
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    animationFrames.delete(id);
  });

  // Mock ResizeObserver
  globalThis.ResizeObserver = vi.fn(function ResizeObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('LetItGo', () => {
  it('should create instance with default options', () => {
    const snow = new LetItGo();
    expect(snow).toBeInstanceOf(LetItGo);
    expect(snow.number).toBe(LetItGo.DEFAULT_OPTIONS.number);
  });

  it('should create canvas element and append to root', () => {
    const snow = new LetItGo();
    expect(document.body.contains(snow.canvas)).toBe(true);
    expect(snow.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(snow.canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('should update number of snowflakes when setting number property', () => {
    const snow = new LetItGo();
    const newNumber = 50;
    snow.number = newNumber;
    expect(snow.number).toBe(newNumber);
  });

  it.each([
    -1,
    1.5,
    MAX_SNOWFLAKES + 1,
    Number.MAX_SAFE_INTEGER,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])(
    'should reject invalid snowflake count %s',
    (number) => {
      const expectedError = 'Number must be a non-negative safe integer no greater than 10,000.';
      expect(() => new LetItGo({ number })).toThrow(expectedError);

      const snow = new LetItGo({ number: 1 });
      expect(() => {
        snow.number = number;
      }).toThrow(expectedError);
      snow.clear();
    },
  );

  it('should stop animation when calling letItStop', () => {
    const snow = new LetItGo();
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    snow.letItStop();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should clean up', () => {
    const snow = new LetItGo();
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    snow.clear();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(document.body.contains(snow.canvas)).toBe(false);
  });

  it('should clean up a canvas that was reparented by the caller', () => {
    const snow = new LetItGo({ number: 0 });
    const newParent = document.createElement('div');
    document.body.appendChild(newParent);
    newParent.appendChild(snow.canvas);

    expect(() => snow.clear()).not.toThrow();
    expect(snow.canvas.isConnected).toBe(false);
  });

  it('should handle multiple clear calls safely', () => {
    const snow = new LetItGo();

    // First clear should work
    snow.clear();
    expect(document.body.contains(snow.canvas)).toBe(false);

    // Second clear should not throw
    expect(() => snow.clear()).not.toThrow();
  });

  it('should not restart animation after clear', () => {
    const snow = new LetItGo();
    snow.clear();

    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
    requestAnimationFrameSpy.mockClear();

    snow.letItGoAgain();

    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    expect(animationFrames.size).toBe(0);
  });

  it('should update velocity ranges correctly', () => {
    const snow = new LetItGo();
    const newVelocityX: [number, number] = [-2, 2];
    const newVelocityY: [number, number] = [1, 5];

    snow.velocityXRange = newVelocityX;
    snow.velocityYRange = newVelocityY;

    expect(snow.velocityXRange).toEqual([-2, 2]);
    expect(snow.velocityYRange).toEqual([1, 5]);
  });

  it('should sort ranges numerically without mutating caller data', () => {
    const input: [number, number] = [10, 2];
    const snow = new LetItGo({ number: 0, velocityXRange: input });

    expect(input).toEqual([10, 2]);
    expect(snow.velocityXRange).toEqual([2, 10]);
    expect(Object.isFrozen(snow.velocityXRange)).toBe(true);

    const setterInput: [number, number] = [8, 4];
    snow.velocityXRange = setterInput;
    expect(setterInput).toEqual([8, 4]);
    expect(snow.velocityXRange).toEqual([4, 8]);
  });

  it('should protect shared default range and style values from mutation', () => {
    expect(Object.isFrozen(LetItGo.DEFAULT_OPTIONS)).toBe(true);
    expect(Object.isFrozen(LetItGo.DEFAULT_OPTIONS.velocityXRange)).toBe(true);
    expect(Object.isFrozen(LetItGo.DEFAULT_OPTIONS.style)).toBe(true);
  });

  it('should update color property', () => {
    const snow = new LetItGo();
    const newColor = '#FF0000';

    snow.color = newColor;
    expect(snow.color).toBe(newColor);
  });

  it('should throw error for invalid radius range', () => {
    const snow = new LetItGo();
    expect(() => {
      snow.radiusRange = [-1, 5];
    }).toThrow();
  });

  it('should throw error for invalid alpha range', () => {
    const snow = new LetItGo();
    expect(() => {
      snow.alphaRange = [-0.5, 1.5];
    }).toThrow();
  });

  it('should restart animation when calling letItGoAgain', () => {
    const snow = new LetItGo();
    snow.letItStop();

    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    snow.letItGoAgain();

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should update snowflakes inside the animation frame', () => {
    const snow = new LetItGo();
    const updateSpy = vi.spyOn(Snowflake.prototype, 'update');

    // First frame initializes the timing baseline.
    runAnimationFrame(0);
    // Second frame has enough elapsed time to trigger an update.
    runAnimationFrame(100);

    snow.letItStop();

    expect(updateSpy).toHaveBeenCalled();
  });

  it('should draw snowflakes inside the animation frame', () => {
    mockCanvasContext.beginPath.mockClear();
    mockCanvasContext.fill.mockClear();

    const snow = new LetItGo({ number: 3 });
    // Run one frame to exercise the draw loop with the existing RAF mock.
    runAnimationFrame(0);
    snow.letItStop();

    expect(mockCanvasContext.fillStyle).toBe(snow.color);
    expect(mockCanvasContext.beginPath).toHaveBeenCalledTimes(3);
    expect(mockCanvasContext.fill).toHaveBeenCalledTimes(3);
  });

  it('should reset globalAlpha before drawing the background each frame', () => {
    const alphaValuesAtFillRect: number[] = [];
    const trackedContext = {
      ...mockCanvasContext,
      _alpha: 1,
      get globalAlpha() {
        return this._alpha;
      },
      set globalAlpha(value: number) {
        this._alpha = value;
      },
      fillRect: vi.fn(function fillRect(this: typeof trackedContext) {
        alphaValuesAtFillRect.push(this.globalAlpha);
      }),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(trackedContext);

    const snow = new LetItGo({ number: 1 });

    // Run two frames; the second frame must paint the background with alpha === 1.
    runAnimationFrame(0);
    runAnimationFrame(100);

    snow.letItStop();

    expect(alphaValuesAtFillRect.length).toBeGreaterThanOrEqual(2);
    expect(alphaValuesAtFillRect.every((alpha) => alpha === 1)).toBe(true);
  });

  it('should reset globalAlpha after drawing snowflakes each frame', () => {
    const trackedContext = {
      ...mockCanvasContext,
      _alpha: 1,
      get globalAlpha() {
        return this._alpha;
      },
      set globalAlpha(value: number) {
        this._alpha = value;
      },
    };

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(trackedContext);

    const snow = new LetItGo({ number: 1, alphaRange: [0.5, 0.5] });

    // Run one frame; after the draw loop the context alpha must be restored to 1.
    runAnimationFrame(0);

    snow.letItStop();

    expect(trackedContext.globalAlpha).toBe(1);
  });

  it('should use custom root element', () => {
    const customRoot = document.createElement('div');
    document.body.appendChild(customRoot);

    const snow = new LetItGo({ root: customRoot });

    expect(customRoot.contains(snow.canvas)).toBe(true);
    expect(document.body.contains(customRoot)).toBe(true);
  });

  it('should preserve an explicitly positioned custom root', () => {
    const customRoot = document.createElement('div');
    customRoot.style.position = 'absolute';
    document.body.appendChild(customRoot);

    const snow = new LetItGo({ root: customRoot, number: 0 });
    expect(customRoot.style.position).toBe('absolute');

    snow.clear();
    expect(customRoot.style.position).toBe('absolute');
  });

  it('should restore a static custom root position on clear', () => {
    const customRoot = document.createElement('div');
    document.body.appendChild(customRoot);

    const snow = new LetItGo({ root: customRoot, number: 0 });
    expect(customRoot.style.position).toBe('relative');

    snow.clear();
    expect(customRoot.style.position).toBe('');
  });

  it('should preserve a shared root position until every instance is cleared', () => {
    const customRoot = document.createElement('div');
    document.body.appendChild(customRoot);

    const firstSnow = new LetItGo({ root: customRoot, number: 0 });
    const secondSnow = new LetItGo({ root: customRoot, number: 0 });
    expect(customRoot.style.position).toBe('relative');

    firstSnow.clear();
    expect(customRoot.style.position).toBe('relative');

    secondSnow.clear();
    expect(customRoot.style.position).toBe('');
  });

  it('should preserve a root position changed by the caller after mount', () => {
    const customRoot = document.createElement('div');
    document.body.appendChild(customRoot);

    const snow = new LetItGo({ root: customRoot, number: 0 });
    customRoot.style.position = 'fixed';
    snow.clear();

    expect(customRoot.style.position).toBe('fixed');
  });

  it('should set initial canvas size based on root element', () => {
    const customRoot = document.createElement('div');
    // Mock client dimensions
    Object.defineProperties(customRoot, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 },
    });
    document.body.appendChild(customRoot);

    const snow = new LetItGo({ root: customRoot });

    expect(snow.canvas.width).toBe(800);
    expect(snow.canvas.height).toBe(600);
  });

  it('should resize the canvas and redraw on the next frame', () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    globalThis.ResizeObserver = vi.fn(function ResizeObserver(callback: ResizeObserverCallback) {
      resizeCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }) as any;
    mockCanvasContext.clearRect.mockClear();
    let rootWidth = 800;
    let rootHeight = 600;
    const customRoot = document.createElement('div');
    Object.defineProperties(customRoot, {
      clientWidth: { get: () => rootWidth },
      clientHeight: { get: () => rootHeight },
    });
    document.body.appendChild(customRoot);
    const snow = new LetItGo({ root: customRoot, number: 0 });

    runAnimationFrame(0);
    runAnimationFrame(10);
    expect(mockCanvasContext.clearRect).toHaveBeenCalledTimes(1);

    rootWidth = 320;
    rootHeight = 240;
    resizeCallback?.([
      { contentRect: { width: 280, height: 200 } } as ResizeObserverEntry,
    ], {} as ResizeObserver);
    runAnimationFrame(20);

    expect(snow.canvas.width).toBe(320);
    expect(snow.canvas.height).toBe(240);
    expect(mockCanvasContext.clearRect).toHaveBeenCalledTimes(2);
    snow.clear();
  });

  it('should catch up multiple animation steps after a delayed frame', () => {
    const updateSpy = vi.spyOn(Snowflake.prototype, 'update');
    const snow = new LetItGo({ number: 1 });

    runAnimationFrame(0);
    runAnimationFrame(100);
    snow.letItStop();

    expect(updateSpy).toHaveBeenCalledTimes(3);
  });

  it('should cap animation catch-up work after a long delay', () => {
    const updateSpy = vi.spyOn(Snowflake.prototype, 'update');
    const snow = new LetItGo({ number: 1 });

    runAnimationFrame(0);
    runAnimationFrame(10_000);
    snow.letItStop();

    expect(updateSpy).toHaveBeenCalledTimes(LetItGo.MAX_CATCH_UP_STEPS);
  });

  it('should skip drawing clean frames and redraw after an option changes', () => {
    mockCanvasContext.clearRect.mockClear();
    const snow = new LetItGo({ number: 0 });

    runAnimationFrame(0);
    expect(mockCanvasContext.clearRect).toHaveBeenCalledTimes(1);

    runAnimationFrame(10);
    expect(mockCanvasContext.clearRect).toHaveBeenCalledTimes(1);

    snow.backgroundColor = '#123456';
    runAnimationFrame(20);
    expect(mockCanvasContext.clearRect).toHaveBeenCalledTimes(2);
    snow.letItStop();
  });

  it('should preserve valid zero-valued snowflake options', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    mockCanvasContext.arc.mockClear();
    const snow = new LetItGo({
      number: 1,
      velocityXRange: [0, 0],
      velocityYRange: [0, 0],
      radiusRange: [0, 0],
      alphaRange: [0, 0],
    });

    runAnimationFrame(0);
    snow.letItStop();

    expect(mockCanvasContext.arc).toHaveBeenCalledWith(0, 0, 0, 0, Math.PI * 2);
    expect(mockCanvasContext.globalAlpha).toBe(1);
    randomSpy.mockRestore();
  });

  it.each([
    { velocityY: -1, expectedY: 150 },
    { velocityY: 0, expectedY: 50 },
    { velocityY: 1, expectedY: -50 },
  ])('should place a $velocityY vertical velocity snowflake on the correct side', ({
    velocityY,
    expectedY,
  }) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    mockCanvasContext.arc.mockClear();
    const customRoot = document.createElement('div');
    Object.defineProperties(customRoot, {
      clientWidth: { value: 100 },
      clientHeight: { value: 100 },
    });
    document.body.appendChild(customRoot);
    const snow = new LetItGo({
      root: customRoot,
      number: 1,
      velocityXRange: [0, 0],
      velocityYRange: [velocityY, velocityY],
      radiusRange: [1, 1],
      alphaRange: [1, 1],
    });

    runAnimationFrame(0);

    expect(mockCanvasContext.arc).toHaveBeenCalledWith(50, expectedY, 1, 0, Math.PI * 2);
    snow.clear();
  });
});
