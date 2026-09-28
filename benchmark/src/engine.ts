import type { Range, SceneOptions } from './types';

export const FRAME_RATE = 30;
export const FRAME_INTERVAL = 1000 / FRAME_RATE;
export const MAX_CATCH_UP_STEPS = 5;

interface SnowflakeState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  alpha: number;
}

export interface SceneState {
  flakes: SnowflakeState[];
  options: SceneOptions;
  width: number;
  height: number;
  random: () => number;
}

export interface DrawingContext {
  globalAlpha: number;
  fillStyle: string | CanvasGradient | CanvasPattern;
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  beginPath(): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  fill(): void;
}

const randomInRange = (random: () => number, [min, max]: Range): number => random() * (max - min) + min;

export const createSeededRandom = (initialSeed: number): (() => number) => {
  let seed = initialSeed >>> 0;
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const createFlake = (scene: SceneState): SnowflakeState => {
  const velocityX = randomInRange(scene.random, scene.options.velocityXRange);
  const velocityY = randomInRange(scene.random, scene.options.velocityYRange);
  let y: number;
  if (velocityY > 0) y = randomInRange(scene.random, [-scene.height, 0]);
  else if (velocityY < 0) y = randomInRange(scene.random, [scene.height, scene.height * 2]);
  else y = randomInRange(scene.random, [0, scene.height]);

  return {
    x: randomInRange(scene.random, [0, scene.width]),
    y,
    velocityX,
    velocityY,
    radius: randomInRange(scene.random, scene.options.radiusRange),
    alpha: randomInRange(scene.random, scene.options.alphaRange),
  };
};

export const createScene = (
  options: SceneOptions,
  width: number,
  height: number,
  seed: number,
): SceneState => {
  const scene: SceneState = {
    flakes: [],
    options: structuredClone(options),
    width,
    height,
    random: createSeededRandom(seed),
  };
  scene.flakes = Array.from({ length: options.number }, () => createFlake(scene));
  return scene;
};

export const setSceneOptions = (scene: SceneState, patch: Partial<SceneOptions>): void => {
  scene.options = { ...scene.options, ...structuredClone(patch) };
  if (patch.number !== undefined) {
    scene.flakes = Array.from({ length: patch.number }, () => createFlake(scene));
  }
  if (patch.velocityXRange) {
    scene.flakes.forEach((flake) => {
      flake.velocityX = randomInRange(scene.random, patch.velocityXRange as Range);
    });
  }
  if (patch.velocityYRange) {
    scene.flakes.forEach((flake) => {
      flake.velocityY = randomInRange(scene.random, patch.velocityYRange as Range);
    });
  }
  if (patch.radiusRange) {
    scene.flakes.forEach((flake) => {
      flake.radius = randomInRange(scene.random, patch.radiusRange as Range);
    });
  }
  if (patch.alphaRange) {
    scene.flakes.forEach((flake) => {
      flake.alpha = randomInRange(scene.random, patch.alphaRange as Range);
    });
  }
};

export const resizeScene = (scene: SceneState, width: number, height: number): void => {
  scene.width = width;
  scene.height = height;
};

export const updateScene = (scene: SceneState): void => {
  for (const flake of scene.flakes) {
    if (flake.velocityY >= 0 && flake.y - flake.radius > scene.height) flake.y = -flake.radius;
    if (flake.velocityY < 0 && flake.y + flake.radius < 0) flake.y = scene.height + flake.radius;
    if (flake.x - flake.radius > scene.width) flake.x = -flake.radius;
    if (flake.x + flake.radius < 0) flake.x = scene.width + flake.radius;
    flake.x += flake.velocityX;
    flake.y += flake.velocityY;
  }
};

export const drawScene = (scene: SceneState, context: DrawingContext): void => {
  context.globalAlpha = 1;
  context.clearRect(0, 0, scene.width, scene.height);
  context.fillStyle = scene.options.backgroundColor;
  context.fillRect(0, 0, scene.width, scene.height);
  context.fillStyle = scene.options.color;
  for (const flake of scene.flakes) {
    context.globalAlpha = flake.alpha;
    context.beginPath();
    context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
};
