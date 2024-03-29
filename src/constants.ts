import { Options } from './types';

// eslint-disable-next-line import/prefer-default-export
export const DEFAULT_OPTIONS: Required<Options> = {
  root: document.body,
  number: window.innerWidth,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [0.5, 1],
  color: '#ffffff',
  alphaRange: [0.8, 1],
  backgroundColor: 'transparent',
  style: {
    zIndex: '-1',
    pointerEvents: 'none',
  },
};
