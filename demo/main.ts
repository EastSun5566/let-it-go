// import { LetItGo } from 'let-it-go';

import { LetItGo } from '../src';

const snow = new LetItGo();

document
  .querySelector<HTMLInputElement>('#switch-input')
  .addEventListener('change', ({ target }) => {
    if ((target as HTMLInputElement).checked) snow.letItGoAgain();
    else snow.letItStop();
  });
