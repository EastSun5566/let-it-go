/* eslint-disable no-param-reassign */
import { LetItGo } from 'let-it-go';

const { DEFAULT_OPTIONS } = LetItGo;

export const bindResetBtn = (snow: LetItGo): void => {
  const resetBtn = document.querySelector<HTMLInputElement>('#reset');
  resetBtn.addEventListener('click', () => {
    snow.letItGoAgain();

    snow.number = DEFAULT_OPTIONS.number;
    snow.color = DEFAULT_OPTIONS.color;
    snow.velocityXRange = DEFAULT_OPTIONS.velocityXRange;
    snow.velocityYRange = DEFAULT_OPTIONS.velocityYRange;
    snow.radiusRange = DEFAULT_OPTIONS.radiusRange;
    snow.alphaRange = DEFAULT_OPTIONS.alphaRange;
  });
};

export const bindSwitch = (snow: LetItGo): void => {
  const stop = 'Let It Stop ⛄️';
  const go = 'Let It Go ☃️';

  const switchInput = document.querySelector<HTMLInputElement>('#is-snow');
  const switchLabel = document.querySelector('[for="is-snow"]');
  switchInput.checked = true;
  switchLabel.textContent = stop;
  switchInput.addEventListener('change', ({ target }) => {
    if ((target as HTMLInputElement).checked) {
      snow.letItGoAgain();
      switchLabel.textContent = stop;
      return;
    }

    snow.letItStop();
    switchLabel.textContent = go;
  });
};

export const bindNumberInput = (snow: LetItGo): void => {
  const numberInput = document.querySelector<HTMLInputElement>('#number');
  numberInput.value = `${DEFAULT_OPTIONS.number}`;
  numberInput.addEventListener('input', ({ target }) => {
    snow.number = +(target as HTMLInputElement).value;
  });
};

export const bindColorInput = (snow: LetItGo): void => {
  const colorInput = document.querySelector<HTMLInputElement>('#color');
  colorInput.value = DEFAULT_OPTIONS.color;
  colorInput.addEventListener('input', ({ target }) => {
    snow.color = (target as HTMLInputElement).value;
  });
};

export interface RangeOption {
  type: string;
  min: number;
  max: number;
}

export const bindRangeInputs = (snow: LetItGo, rangeOptions: RangeOption[]): void => {
  rangeOptions.forEach(({ type }) => {
    let [v1, v2] = DEFAULT_OPTIONS[`${type}Range`] as [number, number];
    const updateLabel = () => {
      const label = document.querySelector<HTMLLabelElement>(`#${type}-range-label`);
      label.textContent = label.textContent.replace(/\(.*\)/, `(${[v1, v2].sort().join(' to ')})`);
    };

    const v1Input = document.querySelector<HTMLInputElement>(`#${type}-range-value-1`);
    v1Input.value = `${v1}`;
    v1Input.addEventListener('change', ({ target }) => {
      const { value } = target as HTMLInputElement;
      v1 = +value;
      snow[`${type}Range`] = [v1, v2];

      updateLabel();
    });

    const v2Input = document.querySelector<HTMLInputElement>(`#${type}-range-value-2`);
    v2Input.value = `${v2}`;
    v2Input.addEventListener('change', ({ target }) => {
      const { value } = target as HTMLInputElement;
      v2 = +value;
      snow[`${type}Range`] = [v1, v2];

      updateLabel();
    });

    updateLabel();
  });
};

export const createRangeInputs = (
  container: HTMLElement,
  rangeOptions: RangeOption[],
): void => {
  const template = ({ type, min, max }: RangeOption) => `
  <fieldset class="form-group">
      <label id="${type}-range-label">❄️ ${type} range ()</label>

      <input
        type="range"
        class="custom-range"
        min="${min}"
        max="${max}"
        value="0"
        id="${type}-range-value-1"
      />
      <input
        type="range"
        class="custom-range"
        min="${min}"
        max="${max}"
        value="0"
        id="${type}-range-value-2"
      />
    </fieldset>
  `;

  container.innerHTML = rangeOptions.map((option) => template(option)).join();
};
