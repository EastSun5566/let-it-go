import type { Options } from './types';

export const MAX_SNOWFLAKES = 10_000;

const requireDocument = (): Document => {
  if (typeof document === 'undefined') {
    throw new Error('[let-it-go] A DOM is required to create a LetItGo instance.');
  }

  return document;
};

const requireWindow = (): Window => {
  if (typeof window === 'undefined') {
    throw new Error('[let-it-go] A DOM is required to create a LetItGo instance.');
  }

  return window;
};

export const DEFAULT_OPTIONS: Readonly<Required<Options>> = Object.freeze({
  get root() {
    return requireDocument().body;
  },
  get number() {
    return Math.min(requireWindow().innerWidth, MAX_SNOWFLAKES);
  },
  velocityXRange: Object.freeze([-3, 3] as const),
  velocityYRange: Object.freeze([1, 5] as const),
  radiusRange: Object.freeze([0.5, 1] as const),
  color: '#ffffff',
  alphaRange: Object.freeze([0.8, 1] as const),
  backgroundColor: 'transparent',
  style: Object.freeze({
    zIndex: '-1',
    pointerEvents: 'none',
  }),
  renderer: 'main',
});
