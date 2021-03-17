import { LetItGo } from 'let-it-go';
import {
  RangeOption,
  createRangeInputs,
  bindColorInput,
  bindNumberInput,
  bindSwitch,
  bindRangeInputs,
  bindResetBtn,
  setupToggle,
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
    step: 0.1,
  }];

document.addEventListener('DOMContentLoaded', () => {
  createRangeInputs(
    document.getElementById('ranges-container'),
    rangeOptions,
  );

  const snow = new LetItGo({ root: document.getElementById('let-it-go') });

  setupToggle();

  bindResetBtn(snow);
  bindSwitch(snow);
  bindNumberInput(snow);
  bindColorInput(snow);
  bindRangeInputs(snow, rangeOptions);
});
