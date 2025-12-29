import { describe, it, expect } from 'vitest';
import {
  assert,
  assertIsRange,
  assertIsRadiusRange,
  assertIsAlphaRange,
  getRandom,
  setStyleProps,
} from '../src/utils';

describe('Utility Functions', () => {
  describe('assert', () => {
    it('should not throw error when condition is true', () => {
      expect(() => assert(true)).not.toThrow();
      expect(() => assert(1 === 1)).not.toThrow();
      expect(() => assert('string')).not.toThrow();
    });

    it('should throw error when condition is false', () => {
      expect(() => assert(false)).toThrow('[let-it-go] internal error.');
      expect(() => assert(0)).toThrow('[let-it-go] internal error.');
      expect(() => assert(null)).toThrow('[let-it-go] internal error.');
      expect(() => assert(undefined)).toThrow('[let-it-go] internal error.');
    });

    it('should throw error with custom message', () => {
      expect(() => assert(false, 'custom error message')).toThrow('[let-it-go] custom error message');
    });
  });

  describe('assertIsRange', () => {
    it('should not throw for valid range', () => {
      expect(() => assertIsRange([0, 1])).not.toThrow();
      expect(() => assertIsRange([1, 10])).not.toThrow();
      expect(() => assertIsRange([-5, 5])).not.toThrow();
    });

    it('should throw error when range is not an array', () => {
      expect(() => assertIsRange(null as any)).toThrow('Range must be an array.');
      expect(() => assertIsRange({} as any)).toThrow('Range must be an array.');
      expect(() => assertIsRange(5 as any)).toThrow('Range must be an array.');
    });

    it('should throw error when range size is not 2', () => {
      expect(() => assertIsRange([1] as any)).toThrow('Range size must be 2.');
      expect(() => assertIsRange([1, 2, 3] as any)).toThrow('Range size must be 2.');
      expect(() => assertIsRange([] as any)).toThrow('Range size must be 2.');
    });

    it('should throw error when range values are not numbers', () => {
      expect(() => assertIsRange(['a', 'b'] as any)).toThrow('Range value must be a number.');
      expect(() => assertIsRange([1, 'b'] as any)).toThrow('Range value must be a number.');
      expect(() => assertIsRange([null, 5] as any)).toThrow('Range value must be a number.');
    });
  });

  describe('assertIsRadiusRange', () => {
    it('should not throw for valid radius range', () => {
      expect(() => assertIsRadiusRange([0, 1])).not.toThrow();
      expect(() => assertIsRadiusRange([1, 10])).not.toThrow();
      expect(() => assertIsRadiusRange([0.5, 2.5])).not.toThrow();
    });

    it('should throw error when radius values are negative', () => {
      expect(() => assertIsRadiusRange([-1, 5])).toThrow('Radius range value must be positive.');
      expect(() => assertIsRadiusRange([1, -5])).toThrow('Radius range value must be positive.');
      expect(() => assertIsRadiusRange([-1, -5])).toThrow('Radius range value must be positive.');
    });

    it('should allow zero as radius value', () => {
      expect(() => assertIsRadiusRange([0, 5])).not.toThrow();
    });
  });

  describe('assertIsAlphaRange', () => {
    it('should not throw for valid alpha range', () => {
      expect(() => assertIsAlphaRange([0, 1])).not.toThrow();
      expect(() => assertIsAlphaRange([0.5, 0.8])).not.toThrow();
      expect(() => assertIsAlphaRange([0.2, 1])).not.toThrow();
    });

    it('should throw error when alpha values are outside 0-1 range', () => {
      expect(() => assertIsAlphaRange([-0.1, 0.5])).toThrow('Alpha range value must be from 0 to 1.');
      expect(() => assertIsAlphaRange([0.5, 1.1])).toThrow('Alpha range value must be from 0 to 1.');
      expect(() => assertIsAlphaRange([2, 3])).toThrow('Alpha range value must be from 0 to 1.');
    });

    it('should allow boundary values 0 and 1', () => {
      expect(() => assertIsAlphaRange([0, 1])).not.toThrow();
      expect(() => assertIsAlphaRange([0, 0])).not.toThrow();
      expect(() => assertIsAlphaRange([1, 1])).not.toThrow();
    });
  });

  describe('getRandom', () => {
    it('should return a number within the specified range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandom(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('should return a number within negative range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandom(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(-5);
      }
    });

    it('should return the same number when min equals max', () => {
      const result = getRandom(5, 5);
      expect(result).toBe(5);
    });

    it('should return a number within decimal range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandom(0.5, 1.5);
        expect(result).toBeGreaterThanOrEqual(0.5);
        expect(result).toBeLessThanOrEqual(1.5);
      }
    });

    it('should handle very large ranges', () => {
      for (let i = 0; i < 10; i++) {
        const result = getRandom(0, 1000000);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1000000);
      }
    });

    it('should produce different values on multiple calls', () => {
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(getRandom(0, 1000));
      }
      // With a large range, we should get many unique values
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('setStyleProps', () => {
    it('should set style properties on element', () => {
      const element = document.createElement('div');
      
      setStyleProps(element, {
        position: 'absolute',
        top: '10px',
        left: '20px',
      });
      
      expect(element.style.position).toBe('absolute');
      expect(element.style.top).toBe('10px');
      expect(element.style.left).toBe('20px');
    });

    it('should handle empty style object', () => {
      const element = document.createElement('div');
      
      expect(() => setStyleProps(element, {})).not.toThrow();
    });

    it('should use default empty object when no style provided', () => {
      const element = document.createElement('div');
      
      expect(() => setStyleProps(element)).not.toThrow();
    });

    it('should set multiple style properties', () => {
      const element = document.createElement('div');
      
      setStyleProps(element, {
        width: '100px',
        height: '200px',
        backgroundColor: 'red',
        zIndex: '10',
      });
      
      expect(element.style.width).toBe('100px');
      expect(element.style.height).toBe('200px');
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.zIndex).toBe('10');
    });

    it('should handle numeric style values', () => {
      const element = document.createElement('div');
      
      setStyleProps(element, {
        opacity: '0.5',
      });
      
      expect(element.style.opacity).toBe('0.5');
    });

    it('should clear style property when value is empty or undefined', () => {
      const element = document.createElement('div');
      element.style.color = 'blue';
      
      setStyleProps(element, {
        color: '',
      });
      
      expect(element.style.color).toBe('');
    });

    it('should overwrite existing style properties', () => {
      const element = document.createElement('div');
      element.style.position = 'relative';
      
      setStyleProps(element, {
        position: 'absolute',
      });
      
      expect(element.style.position).toBe('absolute');
    });
  });
});
