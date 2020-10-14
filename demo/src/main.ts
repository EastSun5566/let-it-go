import { LetItGo } from 'let-it-go';

const snow = new LetItGo({
  root: document.getElementById('root'),
});

const switchLabel = document.querySelector('[for="is-snow"]');
const switchInput = document.querySelector('#is-snow');

switchInput.addEventListener('change', ({ target }) => {
  if (!(target as HTMLInputElement).checked) {
    snow.letItStop();
    switchLabel.textContent = 'Let It Go!';
    return;
  }

  snow.letItGoAgain();
  switchLabel.textContent = 'Let It Stop!';
});
