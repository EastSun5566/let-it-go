// import { LetItGo } from 'let-it-go';
import { LetItGo } from '../../../src';
import {
  RangeOption,
  createRangeInputs,
  bindColorInput,
  bindNumberInput,
  bindSwitch,
  bindRangeInputs,
  bindResetBtn,
} from './utils';

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
  }, {
    type: 'alpha',
    min: 0,
    max: 1,
  }];

createRangeInputs(
  document.getElementById('ranges-container'),
  rangeOptions,
);

document.addEventListener('DOMContentLoaded', () => {
  const snow = new LetItGo({ root: document.getElementById('let-it-go') });

  bindResetBtn(snow);
  bindSwitch(snow);
  bindNumberInput(snow);
  bindColorInput(snow);
  bindRangeInputs(snow, rangeOptions);
});
