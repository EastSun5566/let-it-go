// import { LetItGo } from 'let-it-go';
import { LetItGo } from '../../src';

const DEFAULT_OPTIONS = {
  init: true,
  number: window.innerWidth,
  color: '#ffffff',
};

document.addEventListener('DOMContentLoaded', () => {
  const snow = new LetItGo({
    root: document.getElementById('root'),
    number: DEFAULT_OPTIONS.number,
    color: DEFAULT_OPTIONS.color,
  });

  const switchInput = document.querySelector<HTMLInputElement>('#is-snow');
  switchInput.checked = DEFAULT_OPTIONS.init;

  switchInput.addEventListener('change', ({ target }) => {
    const switchLabel = document.querySelector('[for="is-snow"]');

    if (target.checked) {
      snow.letItGoAgain();
      switchLabel.textContent = 'Let It Stop!';
      return;
    }

    snow.letItStop();
    switchLabel.textContent = 'Let It Go!';
  });

  const numberInput = document.querySelector<HTMLInputElement>('#number');
  numberInput.value = `${DEFAULT_OPTIONS.number}`;

  numberInput.addEventListener('input', ({ target }) => {
    snow.number = +target.value;
  });

  const colorInput = document.querySelector<HTMLInputElement>('#color');
  colorInput.value = DEFAULT_OPTIONS.color;

  colorInput.addEventListener('input', ({ target }) => {
    snow.color = target.value;
  });
});
