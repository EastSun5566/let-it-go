import type { Range } from './types';

export interface SnowflakeSeed {
  number: number;
  velocityXRange: Range;
  velocityYRange: Range;
  radiusRange: Range;
  alphaRange: Range;
}

export type SnowflakeProperty = 'velocityX' | 'velocityY' | 'radius' | 'alpha';

export interface SnowflakeState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  alpha: number;
}

export interface SnowflakeField {
  readonly count: number;
  allocate(seed: SnowflakeSeed, width: number, height: number): void;
  randomize(property: SnowflakeProperty, range: Range): void;
  constrain(width: number, height: number): void;
  update(width: number, height: number): void;
  draw(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    color: CanvasFillStrokeStyles['fillStyle'],
    backgroundColor: CanvasFillStrokeStyles['fillStyle'],
  ): void;
  read(index: number): SnowflakeState;
  write(index: number, state: SnowflakeState): void;
}

export type SnowflakeFieldFactory = () => SnowflakeField;

// Snowflakes live in one flat Float64Array, six numbers per snowflake:
// x, y, velocityX, velocityY, radius, alpha.
// Both renderers share this factory. The Worker receives its source text through
// workerMain's first parameter, so the body must stay self-contained: no imports,
// no outer references, and no syntax a transpiler would rewrite into outer helpers.
export function createSnowflakeField(): SnowflakeField {
  const stride = 6;
  const xOffset = 0;
  const yOffset = 1;
  const velocityXOffset = 2;
  const velocityYOffset = 3;
  const radiusOffset = 4;
  const alphaOffset = 5;
  const propertyOffsets = {
    velocityX: velocityXOffset,
    velocityY: velocityYOffset,
    radius: radiusOffset,
    alpha: alphaOffset,
  };

  let data = new Float64Array(0);

  function random(range: Range): number {
    return Math.random() * (range[1] - range[0]) + range[0];
  }

  function allocate(seed: SnowflakeSeed, width: number, height: number): void {
    data = new Float64Array(seed.number * stride);
    for (let index = 0; index < data.length; index += stride) {
      const velocityX = random(seed.velocityXRange);
      const velocityY = random(seed.velocityYRange);
      let y: number;
      if (velocityY > 0) y = random([-height, 0]);
      else if (velocityY < 0) y = random([height, height * 2]);
      else y = random([0, height]);

      data[index + xOffset] = random([0, width]);
      data[index + yOffset] = y;
      data[index + velocityXOffset] = velocityX;
      data[index + velocityYOffset] = velocityY;
      data[index + radiusOffset] = random(seed.radiusRange);
      data[index + alphaOffset] = random(seed.alphaRange);
    }
  }

  function randomize(property: SnowflakeProperty, range: Range): void {
    const offset = propertyOffsets[property];
    for (let index = 0; index < data.length; index += stride) {
      data[index + offset] = random(range);
    }
  }

  function constrainAt(index: number, width: number, height: number): void {
    if (data[index + velocityXOffset] === 0) {
      data[index + xOffset] = Math.min(Math.max(data[index + xOffset] ?? 0, 0), width);
    }
    if (data[index + velocityYOffset] === 0) {
      data[index + yOffset] = Math.min(Math.max(data[index + yOffset] ?? 0, 0), height);
    }
  }

  function constrain(width: number, height: number): void {
    for (let index = 0; index < data.length; index += stride) constrainAt(index, width, height);
  }

  function update(width: number, height: number): void {
    for (let index = 0; index < data.length; index += stride) {
      constrainAt(index, width, height);
      const radius = data[index + radiusOffset] ?? 0;
      const velocityX = data[index + velocityXOffset] ?? 0;
      const velocityY = data[index + velocityYOffset] ?? 0;
      let x = data[index + xOffset] ?? 0;
      let y = data[index + yOffset] ?? 0;
      if (velocityY >= 0 && y - radius > height) y = -radius;
      if (velocityY < 0 && y + radius < 0) y = height + radius;
      if (x - radius > width) x = -radius;
      if (x + radius < 0) x = width + radius;

      data[index + xOffset] = x + velocityX;
      data[index + yOffset] = y + velocityY;
    }
  }

  function draw(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    color: CanvasFillStrokeStyles['fillStyle'],
    backgroundColor: CanvasFillStrokeStyles['fillStyle'],
  ): void {
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = color;

    for (let index = 0; index < data.length; index += stride) {
      context.globalAlpha = data[index + alphaOffset] ?? 1;
      context.beginPath();
      context.arc(
        data[index + xOffset] ?? 0,
        data[index + yOffset] ?? 0,
        data[index + radiusOffset] ?? 0,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    context.globalAlpha = 1;
  }

  // read/write give tests and debugging direct access to one snowflake.
  function read(index: number): SnowflakeState {
    const start = index * stride;
    return {
      x: data[start + xOffset] ?? 0,
      y: data[start + yOffset] ?? 0,
      velocityX: data[start + velocityXOffset] ?? 0,
      velocityY: data[start + velocityYOffset] ?? 0,
      radius: data[start + radiusOffset] ?? 0,
      alpha: data[start + alphaOffset] ?? 0,
    };
  }

  function write(index: number, state: SnowflakeState): void {
    const start = index * stride;
    data[start + xOffset] = state.x;
    data[start + yOffset] = state.y;
    data[start + velocityXOffset] = state.velocityX;
    data[start + velocityYOffset] = state.velocityY;
    data[start + radiusOffset] = state.radius;
    data[start + alphaOffset] = state.alpha;
  }

  return {
    get count() {
      return data.length / stride;
    },
    allocate,
    randomize,
    constrain,
    update,
    draw,
    read,
    write,
  };
}
