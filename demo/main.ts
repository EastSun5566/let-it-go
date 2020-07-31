import { LetItGo } from 'let-it-go';

const snow = new LetItGo();

document
  .querySelector<HTMLInputElement>('#switch-input')
  .addEventListener('change', ({ target }) => {
    if ((target as HTMLInputElement).checked) snow.letItGoAgain();
    else snow.letItStop();
  });
