import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Snowflake } from '../src/utils/Snowflake';
import { Vec2D } from '../src/utils/Vector';

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
  vi.clearAllMocks();
});

describe('Snowflake', () => {
  it('should create a snowflake with default values', () => {
    const snowflake = new Snowflake();
    
    expect(snowflake.p).toBeInstanceOf(Vec2D);
    expect(snowflake.p.x).toBe(0);
    expect(snowflake.p.y).toBe(0);
    expect(snowflake.v).toBeInstanceOf(Vec2D);
    expect(snowflake.v.x).toBe(0);
    expect(snowflake.v.y).toBe(0);
    expect(snowflake.r).toBe(0.5);
    expect(snowflake.color).toBe('#ffffff');
    expect(snowflake.alpha).toBe(1);
  });

  it('should create a snowflake with custom values', () => {
    const position = new Vec2D(100, 200);
    const velocity = new Vec2D(2, 3);
    const snowflake = new Snowflake({
      p: position,
      v: velocity,
      r: 2,
      color: '#ff0000',
      alpha: 0.5,
    });
    
    expect(snowflake.p).toBe(position);
    expect(snowflake.v).toBe(velocity);
    expect(snowflake.r).toBe(2);
    expect(snowflake.color).toBe('#ff0000');
    expect(snowflake.alpha).toBe(0.5);
  });

  describe('update', () => {
    it('should update position by adding velocity multiplied by deltaTime', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(10, 20),
        v: new Vec2D(1, 2),
      });
      
      snowflake.update({ width: 100, height: 100, deltaTime: 1 });
      
      expect(snowflake.p.x).toBe(11);
      expect(snowflake.p.y).toBe(22);
    });

    it('should use default deltaTime of 1/60 when not provided', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(10, 20),
        v: new Vec2D(60, 120),
      });
      
      snowflake.update({ width: 100, height: 100 });
      
      // With deltaTime = 1/60: x = 10 + 60 * (1/60) = 11, y = 20 + 120 * (1/60) = 22
      expect(snowflake.p.x).toBe(11);
      expect(snowflake.p.y).toBe(22);
    });

    it('should wrap snowflake vertically when it goes below canvas', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(50, 106), // p.y - r (106 - 5) > height (100) -> 101 > 100 = true
        v: new Vec2D(0, 1),
        r: 5,
      });
      
      snowflake.update({ width: 100, height: 100, deltaTime: 1 });
      
      // Position gets velocity added first: 106 + 1 * 1 = 107
      // Then wrapping check: (107 - 5) > 100 -> true, so reset to -r = -5
      expect(snowflake.p.y).toBe(-5);
    });

    it('should wrap snowflake horizontally when it goes beyond right edge', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(106, 50), // p.x - r (106 - 5) > width (100) -> 101 > 100 = true
        v: new Vec2D(1, 0),
        r: 5,
      });
      
      snowflake.update({ width: 100, height: 100, deltaTime: 1 });
      
      // Position gets velocity added first: 106 + 1 * 1 = 107
      // Then wrapping check: (107 - 5) > 100 -> true, so reset to -r = -5
      expect(snowflake.p.x).toBe(-5);
    });

    it('should wrap snowflake horizontally when it goes beyond left edge', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(-6, 50), // p.x + r (-6 + 5) < 0
        v: new Vec2D(-1, 0),
        r: 5,
      });
      
      snowflake.update({ width: 100, height: 100, deltaTime: 1 });
      
      // Position gets velocity added first: -6 + (-1) * 1 = -7
      // Then wrapping check: (-7 + 5) < 0 -> true, so reset to width + r = 105
      expect(snowflake.p.x).toBe(105);
    });

    it('should handle update with no dimensions provided (defaults to 0)', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(10, 20),
        v: new Vec2D(60, 120),
        r: 0.5,
      });
      
      snowflake.update();
      
      // When width and height default to 0, deltaTime defaults to 1/60:
      // p.x += v.x * deltaTime: 10 + 60 * (1/60) = 11
      // p.y += v.y * deltaTime: 20 + 120 * (1/60) = 22
      // p.y - r (22 - 0.5) > 0 -> true, so p.y = 0 - 0.5 = -0.5
      // p.x - r (11 - 0.5) > 0 -> true, so p.x = 0 - 0.5 = -0.5
      expect(snowflake.p.x).toBe(-0.5);
      expect(snowflake.p.y).toBe(-0.5);
    });

    it('should not wrap when snowflake is within bounds', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(50, 50),
        v: new Vec2D(1, 1),
        r: 2,
      });
      
      snowflake.update({ width: 100, height: 100, deltaTime: 1 });
      
      expect(snowflake.p.x).toBe(51);
      expect(snowflake.p.y).toBe(51);
    });
  });

  describe('draw', () => {
    it('should draw snowflake with correct context methods', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(50, 75),
        r: 3,
        color: '#ffffff',
        alpha: 0.8,
      });
      
      snowflake.draw(mockCanvasContext as any);
      
      expect(mockCanvasContext.save).toHaveBeenCalled();
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.arc).toHaveBeenCalledWith(50, 75, 3, 0, Math.PI * 2);
      expect(mockCanvasContext.closePath).toHaveBeenCalled();
      expect(mockCanvasContext.fillStyle).toBe('#ffffff');
      expect(mockCanvasContext.globalAlpha).toBe(0.8);
      expect(mockCanvasContext.fill).toHaveBeenCalled();
      expect(mockCanvasContext.restore).toHaveBeenCalled();
    });

    it('should draw snowflake with custom color', () => {
      const snowflake = new Snowflake({
        p: new Vec2D(100, 150),
        color: '#00ff00',
      });
      
      snowflake.draw(mockCanvasContext as any);
      
      expect(mockCanvasContext.fillStyle).toBe('#00ff00');
    });

    it('should call context methods in correct order', () => {
      const snowflake = new Snowflake();
      const callOrder: string[] = [];
      
      const orderedMockContext = {
        save: vi.fn(() => callOrder.push('save')),
        beginPath: vi.fn(() => callOrder.push('beginPath')),
        arc: vi.fn(() => callOrder.push('arc')),
        closePath: vi.fn(() => callOrder.push('closePath')),
        fill: vi.fn(() => callOrder.push('fill')),
        restore: vi.fn(() => callOrder.push('restore')),
        fillStyle: '',
        globalAlpha: 1,
      };
      
      snowflake.draw(orderedMockContext as any);
      
      expect(callOrder).toEqual(['save', 'beginPath', 'arc', 'closePath', 'fill', 'restore']);
    });
  });
});
