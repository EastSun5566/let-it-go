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
// Drawing groups snowflakes by alpha, rounded to 1/32 steps, and fills each group
// with one path. This needs far fewer canvas calls than one fill per snowflake;
// overlapping snowflakes in the same group are filled once instead of stacking.
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
  const alphaLevels = 32;
  const propertyOffsets = {
    velocityX: velocityXOffset,
    velocityY: velocityYOffset,
    radius: radiusOffset,
    alpha: alphaOffset,
  };

  let data = new Float64Array(0);
  // order lists snowflake indexes sorted by alpha level; groupEnds[level] is where
  // that level's indexes end in order. Both are rebuilt lazily when alpha changes.
  let order = new Uint32Array(0);
  const groupEnds = new Uint32Array(alphaLevels + 1);
  let groupsDirty = true;

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
    groupsDirty = true;
  }

  function randomize(property: SnowflakeProperty, range: Range): void {
    const offset = propertyOffsets[property];
    for (let index = 0; index < data.length; index += stride) {
      data[index + offset] = random(range);
    }
    if (offset === alphaOffset) groupsDirty = true;
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

  function alphaLevelAt(index: number): number {
    return Math.round((data[index * stride + alphaOffset] ?? 0) * alphaLevels);
  }

  function regroup(): void {
    const count = data.length / stride;
    const counts = new Uint32Array(alphaLevels + 1);
    for (let index = 0; index < count; index += 1) {
      const level = alphaLevelAt(index);
      counts[level] = (counts[level] ?? 0) + 1;
    }

    const next = new Uint32Array(alphaLevels + 1);
    let end = 0;
    for (let level = 0; level <= alphaLevels; level += 1) {
      next[level] = end;
      end += counts[level] ?? 0;
      groupEnds[level] = end;
    }

    order = new Uint32Array(count);
    for (let index = 0; index < count; index += 1) {
      const level = alphaLevelAt(index);
      const position = next[level] ?? 0;
      order[position] = index;
      next[level] = position + 1;
    }
    groupsDirty = false;
  }

  function draw(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    color: CanvasFillStrokeStyles['fillStyle'],
    backgroundColor: CanvasFillStrokeStyles['fillStyle'],
  ): void {
    if (groupsDirty) regroup();

    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = color;

    let start = 0;
    for (let level = 0; level <= alphaLevels; level += 1) {
      const end = groupEnds[level] ?? start;
      if (end > start) {
        context.globalAlpha = level / alphaLevels;
        context.beginPath();
        for (let position = start; position < end; position += 1) {
          const index = (order[position] ?? 0) * stride;
          const x = data[index + xOffset] ?? 0;
          const y = data[index + yOffset] ?? 0;
          const radius = data[index + radiusOffset] ?? 0;
          // Start each circle at its own edge so no line joins it to the previous one.
          context.moveTo(x + radius, y);
          context.arc(x, y, radius, 0, Math.PI * 2);
        }
        context.fill();
      }
      start = end;
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
    groupsDirty = true;
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
