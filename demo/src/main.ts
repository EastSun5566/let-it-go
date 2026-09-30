import { LetItGo } from 'let-it-go';

import {
  type RangeOption,
  createRangeInputs,
  bindColorInput,
  bindNumberInput,
  bindSwitch,
  bindRangeInputs,
  bindResetBtn,
  setupToggle,
} from './utils';

import 'bootswatch/dist/lux/bootstrap.min.css';
import './style.scss';

const rangeOptions: RangeOption[] = [
  {
    type: 'velocityX',
    label: 'Horizontal velocity',
    min: -100,
    max: 100,
  },
  {
    type: 'velocityY',
    label: 'Vertical velocity',
    min: -100,
    max: 100,
  },
  {
    type: 'radius',
    label: 'Radius',
    min: 0,
    max: 50,
    step: 0.1,
  },
  {
    type: 'alpha',
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.1,
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const rangesContainer = document.getElementById('ranges-container');
  const root = document.getElementById('let-it-go');
  if (!rangesContainer || !root) throw new Error('Missing required demo elements.');

  createRangeInputs(rangesContainer, rangeOptions);

  const snow = new LetItGo({
    root,
    renderer: 'worker',
  });

  setupToggle({ isShowPanel: false });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setSnowing = bindSwitch(snow, { isSnowing: !reducedMotion.matches });
  reducedMotion.addEventListener('change', ({ matches }) => setSnowing(!matches));

  bindResetBtn(snow, rangeOptions, () => setSnowing(!reducedMotion.matches));
  bindNumberInput(snow);
  bindColorInput(snow);
  bindRangeInputs(snow, rangeOptions);
});
