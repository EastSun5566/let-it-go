import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import { createSnowflakeField } from '../src/snowflake-field';

import type { SnowflakeSeed, SnowflakeState } from '../src/snowflake-field';

const seed: SnowflakeSeed = {
  number: 1,
  velocityXRange: [1, 1],
  velocityYRange: [0, 0],
  radiusRange: [1, 1],
  alphaRange: [1, 1],
};

const createFlake = (state: Partial<SnowflakeState>) => {
  const field = createSnowflakeField();
  field.allocate(seed, 0, 0);
  field.write(0, {
    x: 0, y: 0, velocityX: 0, velocityY: 0, radius: 0.5, alpha: 1, ...state,
  });
  return field;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSnowflakeField', () => {
  describe('allocate', () => {
    it('allocates the requested number of snowflakes', () => {
      const field = createSnowflakeField();
      expect(field.count).toBe(0);

      field.allocate({ ...seed, number: 3 }, 100, 100);
      expect(field.count).toBe(3);

      field.allocate({ ...seed, number: 0 }, 100, 100);
      expect(field.count).toBe(0);
    });

    it('seeds every property from its range', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const field = createSnowflakeField();
      field.allocate({
        number: 1,
        velocityXRange: [-2, 2],
        velocityYRange: [0, 0],
        radiusRange: [1, 3],
        alphaRange: [0.5, 1],
      }, 200, 100);

      expect(field.read(0)).toEqual({
        x: 100, y: 50, velocityX: 0, velocityY: 0, radius: 2, alpha: 0.75,
      });
    });

    it.each([
      { velocityY: 1, expectedY: -50 },
      { velocityY: 0, expectedY: 50 },
      { velocityY: -1, expectedY: 150 },
    ])('starts a $velocityY vertical velocity snowflake on the correct side', ({ velocityY, expectedY }) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const field = createSnowflakeField();
      field.allocate({ ...seed, velocityYRange: [velocityY, velocityY] }, 100, 100);

      expect(field.read(0).y).toBe(expectedY);
    });
  });

  it('randomizes one property without touching the others', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const field = createSnowflakeField();
    field.allocate({ ...seed, number: 2 }, 100, 100);
    const before = field.read(1);

    field.randomize('radius', [4, 6]);

    expect(field.read(0).radius).toBe(5);
    expect(field.read(1)).toEqual({ ...before, radius: 5 });
  });

  describe('update', () => {
    it.each([
      {
        position: [80, 80], size: [40, 40], radius: 1, expected: [40, 40],
      },
      {
        position: [-1, -1], size: [40, 40], radius: 1, expected: [0, 0],
      },
      {
        position: [80, 80], size: [0, 0], radius: 1, expected: [0, 0],
      },
      {
        position: [80, 80], size: [2, 2], radius: 10, expected: [2, 2],
      },
    ])('constrains stationary centers safely: %j', ({
      position, size, radius, expected,
    }) => {
      const field = createFlake({ x: position[0], y: position[1], radius });
      field.update(size[0] ?? 0, size[1] ?? 0);
      field.update(size[0] ?? 0, size[1] ?? 0);
      expect([field.read(0).x, field.read(0).y]).toEqual(expected);
      field.constrain(100, 100);
      expect([field.read(0).x, field.read(0).y]).toEqual(expected);
    });

    it.each([
      { velocity: [0, 1], position: [80, -20], expected: [40, -19] },
      { velocity: [1, 0], position: [80, 80], expected: [0, 40] },
      { velocity: [0, -1], position: [80, 80], expected: [40, 79] },
    ])('only constrains stationary axes: %j', ({ velocity, position, expected }) => {
      const field = createFlake({
        x: position[0], y: position[1], velocityX: velocity[0], velocityY: velocity[1], radius: 1,
      });
      field.update(40, 40);
      expect([field.read(0).x, field.read(0).y]).toEqual(expected);
    });

    it.each([
      {
        name: 'moves by its velocity',
        state: {
          x: 10, y: 20, velocityX: 1, velocityY: 2,
        },
        expected: [11, 22],
      },
      {
        name: 'does not wrap inside the bounds',
        state: {
          x: 50, y: 50, velocityX: 1, velocityY: 1, radius: 2,
        },
        expected: [51, 51],
      },
      {
        // y - radius (106 - 5) > height, so y resets to -radius before moving.
        name: 'wraps below the canvas',
        state: {
          x: 50, y: 106, velocityY: 1, radius: 5,
        },
        expected: [50, -4],
      },
      {
        name: 'wraps an upward snowflake above the canvas',
        state: {
          x: 50, y: -6, velocityY: -1, radius: 5,
        },
        expected: [50, 104],
      },
      {
        name: 'keeps the staggered start of a downward snowflake above the canvas',
        state: {
          x: 50, y: -20, velocityY: 1, radius: 5,
        },
        expected: [50, -19],
      },
      {
        name: 'wraps past the right edge',
        state: {
          x: 106, y: 50, velocityX: 1, radius: 5,
        },
        expected: [-4, 50],
      },
      {
        name: 'wraps past the left edge',
        state: {
          x: -6, y: 50, velocityX: -1, radius: 5,
        },
        expected: [104, 50],
      },
    ])('$name', ({ state, expected }) => {
      const field = createFlake(state);
      field.update(100, 100);
      expect([field.read(0).x, field.read(0).y]).toEqual(expected);
    });
  });

  describe('draw', () => {
    // Records each filled path as its alpha plus the circles it contains.
    const createContext = () => {
      const fills: { alpha: number; circles: number[][] }[] = [];
      let circles: number[][] = [];
      const context = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(() => {
          circles = [];
        }),
        moveTo: vi.fn(),
        arc: vi.fn((x: number, y: number, radius: number) => {
          circles.push([x, y, radius]);
        }),
        fill: vi.fn(function fill(this: { globalAlpha: number }) {
          fills.push({ alpha: this.globalAlpha, circles });
        }),
        globalAlpha: 1,
        fillStyle: '' as CanvasFillStrokeStyles['fillStyle'],
      };
      return { context, fills };
    };

    const createFieldWithAlphas = (alphas: number[]) => {
      const field = createSnowflakeField();
      field.allocate({ ...seed, number: alphas.length }, 100, 100);
      alphas.forEach((alpha, index) => {
        field.write(index, {
          x: index * 10, y: index * 20, velocityX: 0, velocityY: 0, radius: index + 1, alpha,
        });
      });
      return field;
    };

    const draw = (
      field: ReturnType<typeof createSnowflakeField>,
      context: ReturnType<typeof createContext>['context'],
    ) => field.draw(context as unknown as CanvasRenderingContext2D, 100, 100, '#fff', '#000');

    it('draws the background, then the snowflakes in the snowflake color', () => {
      const { context } = createContext();
      draw(createFieldWithAlphas([1]), context);

      expect(context.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
      expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
      expect(context.fillStyle).toBe('#fff');
      expect(context.globalAlpha).toBe(1);
    });

    it('fills snowflakes that share a rounded alpha level with one path', () => {
      const { context, fills } = createContext();
      // 0.51 rounds to the same 1/32 level as 0.5.
      draw(createFieldWithAlphas([0.5, 0.25, 0.51]), context);

      expect(fills).toEqual([
        { alpha: 0.25, circles: [[10, 20, 2]] },
        { alpha: 0.5, circles: [[0, 0, 1], [20, 40, 3]] },
      ]);
    });

    it('starts each circle at its own edge so circles are not joined by lines', () => {
      const { context } = createContext();
      draw(createFieldWithAlphas([1, 1]), context);

      expect(context.moveTo.mock.calls).toEqual([[1, 0], [12, 20]]);
    });

    it('regroups after alpha values change', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const field = createFieldWithAlphas([0.25, 0.75]);
      const first = createContext();
      draw(field, first.context);
      expect(first.fills.map(({ alpha }) => alpha)).toEqual([0.25, 0.75]);

      field.randomize('alpha', [1, 1]);
      const second = createContext();
      draw(field, second.context);
      expect(second.fills).toEqual([{ alpha: 1, circles: [[0, 0, 1], [10, 20, 2]] }]);

      field.allocate({ ...seed, number: 3, alphaRange: [0.5, 0.5] }, 100, 100);
      const third = createContext();
      draw(field, third.context);
      expect(third.fills).toHaveLength(1);
      expect(third.fills[0]?.circles).toHaveLength(3);
    });
  });
});
