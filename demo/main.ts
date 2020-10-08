import { LetItGo } from 'let-it-go';

const snow = new LetItGo({
  root: document.getElementById('root'),
});

document
  .querySelector<HTMLInputElement>('#switch-input')
  .addEventListener('change', ({ target }) => {
    if (!(target as HTMLInputElement).checked) {
      snow.letItStop();
      return;
    }

    snow.letItGoAgain();
  });
