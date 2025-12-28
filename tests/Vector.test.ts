import { describe, it, expect } from 'vitest';
import { Vec2D } from '../src/utils/Vector';

describe('Vec2D', () => {
  it('should create a vector with default values (0, 0)', () => {
    const vec = new Vec2D();
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
  });

  it('should create a vector with specified values', () => {
    const vec = new Vec2D(10, 20);
    expect(vec.x).toBe(10);
    expect(vec.y).toBe(20);
  });

  it('should add another vector correctly', () => {
    const vec1 = new Vec2D(5, 10);
    const vec2 = new Vec2D(3, 4);
    
    const result = vec1.add(vec2);
    
    expect(result.x).toBe(8);
    expect(result.y).toBe(14);
    // Should return the same instance (fluent API)
    expect(result).toBe(vec1);
  });

  it('should add vector with default values', () => {
    const vec = new Vec2D(5, 10);
    const emptyVec = new Vec2D();
    
    vec.add(emptyVec);
    
    expect(vec.x).toBe(5);
    expect(vec.y).toBe(10);
  });

  it('should handle negative values in addition', () => {
    const vec1 = new Vec2D(10, 20);
    const vec2 = new Vec2D(-5, -8);
    
    vec1.add(vec2);
    
    expect(vec1.x).toBe(5);
    expect(vec1.y).toBe(12);
  });

  it('should support chaining add operations', () => {
    const vec = new Vec2D(1, 2);
    
    vec.add(new Vec2D(3, 4)).add(new Vec2D(5, 6));
    
    expect(vec.x).toBe(9);
    expect(vec.y).toBe(12);
  });

  it('should handle decimal values', () => {
    const vec1 = new Vec2D(1.5, 2.5);
    const vec2 = new Vec2D(0.5, 0.5);
    
    vec1.add(vec2);
    
    expect(vec1.x).toBe(2);
    expect(vec1.y).toBe(3);
  });
});
