// import { LetItGo } from 'let-it-go';
import { LetItGo } from '../../src';

const INIT_OPTIONS = {
  init: true,
  number: window.innerWidth,
  color: '#ffffff',
};

document.addEventListener('DOMContentLoaded', () => {
  const snow = new LetItGo({
    root: document.getElementById('root'),
    number: INIT_OPTIONS.number,
    color: INIT_OPTIONS.color,
  });

  const switchInput = document.querySelector<HTMLInputElement>('#is-snow');
  switchInput.checked = INIT_OPTIONS.init;
  switchInput.addEventListener('change', ({ target }) => {
    const switchLabel = document.querySelector('[for="is-snow"]');

    if ((target as HTMLInputElement).checked) {
      snow.letItGoAgain();
      switchLabel.textContent = 'Let It Stop!';
      return;
    }

    snow.letItStop();
    switchLabel.textContent = 'Let It Go!';
  });

  const numberInput = document.querySelector<HTMLInputElement>('#number');
  numberInput.value = `${INIT_OPTIONS.number}`;
  numberInput.addEventListener('input', ({ target }) => {
    snow.number = +(target as HTMLInputElement).value;
  });

  const colorInput = document.querySelector<HTMLInputElement>('#color');
  colorInput.value = INIT_OPTIONS.color;
  colorInput.addEventListener('input', ({ target }) => {
    snow.color = (target as HTMLInputElement).value;
  });

  const rangeInput = document.querySelector<HTMLInputElement>('#x-range-1');
  rangeInput.addEventListener('change', ({ target }) => {
    console.log((target as HTMLInputElement).value);
  });
});
