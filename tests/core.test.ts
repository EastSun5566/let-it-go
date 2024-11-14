import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { LetItGo } from '../src';

// Mock canvas context
const mockCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  closePath: vi.fn(),
  globalAlpha: 1,
  fillStyle: '#000',
};

beforeEach(() => {
  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasContext);

  // Mock requestAnimationFrame & cancelAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 0));
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
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
  });

  it('should update number of snowflakes when setting number property', () => {
    const snow = new LetItGo();
    const newNumber = 50;
    snow.number = newNumber;
    expect(snow.number).toBe(newNumber);
  });

  it('should stop animation when calling letItStop', () => {
    const snow = new LetItGo();
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

    snow.letItStop();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should clean up', () => {
    const snow = new LetItGo();
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    snow.clear();

    expect(clearIntervalSpy).toHaveBeenCalled();
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

    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    snow.letItGoAgain();

    expect(setIntervalSpy).toHaveBeenCalled();
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
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
