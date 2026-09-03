import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { LetItGo } from '../src';
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

beforeEach(() => {
  vi.useFakeTimers();

  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasContext);

  // Mock requestAnimationFrame & cancelAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (cb) => setTimeout(() => cb(Date.now()), 16),
  );
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(function ResizeObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }) as any;
});

afterEach(() => {
  vi.useRealTimers();
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
  });

  it('should update number of snowflakes when setting number property', () => {
    const snow = new LetItGo();
    const newNumber = 50;
    snow.number = newNumber;
    expect(snow.number).toBe(newNumber);
  });

  it('should stop animation when calling letItStop', () => {
    const snow = new LetItGo();
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    snow.letItStop();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should clean up', () => {
    const snow = new LetItGo();
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    snow.clear();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(snow.canvas);
    expect(document.body.contains(snow.canvas)).toBe(false);
  });

  it('should handle multiple clear calls safely', () => {
    const snow = new LetItGo();

    // First clear should work
    snow.clear();
    expect(document.body.contains(snow.canvas)).toBe(false);

    // Second clear should not throw
    expect(() => snow.clear()).not.toThrow();
  });

  it('should update velocity ranges correctly', () => {
    const snow = new LetItGo();
    const newVelocityX: [number, number] = [-2, 2];
    const newVelocityY: [number, number] = [1, 5];

    snow.velocityXRange = newVelocityX;
    snow.velocityYRange = newVelocityY;

    expect(snow.velocityXRange).toEqual(newVelocityX.sort());
    expect(snow.velocityYRange).toEqual(newVelocityY.sort());
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

    // Advance time so at least one animation frame exceeds the update interval.
    vi.advanceTimersByTime(100);

    snow.letItStop();

    expect(updateSpy).toHaveBeenCalled();
  });

  it('should catch up the correct number of fixed steps when a frame is delayed', () => {
    let rAFCallback: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rAFCallback = cb;
      return 1;
    });

    const snow = new LetItGo({ number: 1 });
    const updateSpy = vi.spyOn(Snowflake.prototype, 'update');
    updateSpy.mockClear();

    // Initialize lastUpdate with the first animation frame.
    rAFCallback!(16);

    // Simulate a delay spanning three update intervals.
    updateSpy.mockClear();
    rAFCallback!(16 + 3 * LetItGo.FRAME_INTERVAL + 5);

    expect(updateSpy).toHaveBeenCalledTimes(3);

    snow.letItStop();
  });

  it('should cap catch-up steps after a very long suspension', () => {
    let rAFCallback: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rAFCallback = cb;
      return 1;
    });

    const snow = new LetItGo({ number: 1 });
    const updateSpy = vi.spyOn(Snowflake.prototype, 'update');
    updateSpy.mockClear();

    // Initialize lastUpdate with the first animation frame.
    rAFCallback!(16);

    // Simulate the tab being suspended for one minute.
    updateSpy.mockClear();
    rAFCallback!(16 + 60_000);

    const maxUpdates = Math.ceil(LetItGo.MAX_CATCH_UP_TIME / LetItGo.FRAME_INTERVAL);
    expect(updateSpy.mock.calls.length).toBeLessThanOrEqual(maxUpdates);

    snow.letItStop();
  });

  it('should draw snowflakes inside the animation frame', () => {
    mockCanvasContext.beginPath.mockClear();
    mockCanvasContext.fill.mockClear();

    const snow = new LetItGo({ number: 3 });
    // Run one frame to exercise the draw loop with the existing RAF mock.
    vi.advanceTimersByTime(16);
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
      fillRect: vi.fn(function fillRect() {
        alphaValuesAtFillRect.push(this.globalAlpha);
      }),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(trackedContext);

    const snow = new LetItGo({ number: 1 });

    // Run two frames; the second frame must paint the background with alpha === 1.
    vi.advanceTimersByTime(16);
    vi.advanceTimersByTime(100);

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
    vi.advanceTimersByTime(16);

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
});
