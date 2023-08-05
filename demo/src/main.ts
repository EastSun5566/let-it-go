import { LetItGo } from '../../src';

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
    min: -100,
    max: 100,
  },
  {
    type: 'velocityY',
    min: -100,
    max: 100,
  },
  {
    type: 'radius',
    min: 0,
    max: 50,
  },
  {
    type: 'alpha',
    min: 0,
    max: 1,
    step: 0.1,
  },
];

document.addEventListener('DOMContentLoaded', () => {
  createRangeInputs(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.getElementById('ranges-container')!,
    rangeOptions,
  );

  const snow = new LetItGo({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    root: document.getElementById('let-it-go')!,
  });

  setupToggle({ isShowPanel: false });

  bindResetBtn(snow);
  bindSwitch(snow);
  bindNumberInput(snow);
  bindColorInput(snow);
  bindRangeInputs(snow, rangeOptions);
});
