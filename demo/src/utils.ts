/* eslint-disable no-param-reassign */
import { LetItGo } from 'let-it-go';

export const setupToggle = ({
  isShowPanel = false,
}: { isShowPanel?: boolean } = {}): void => {
  const getWord = (isOpen: boolean) => (isOpen ? '👇' : '☝️');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const option = document.getElementById('option')!;

  let isShow = isShowPanel;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const toggle = document.getElementById('toggle')!;
  toggle.textContent = getWord(isShow);
  const hide = () => {
    option.style.transform = `translateY(${option.offsetHeight - toggle.offsetHeight - 16}px)`;
  };
  const show = () => {
    option.style.transform = 'translateY(0)';
  };

  toggle.addEventListener('click', () => {
    isShow = !isShow;
    toggle.textContent = getWord(isShow);

    if (isShow) {
      show();
      return;
    }

    hide();
  });

  if (!isShow) {
    hide();
    return;
  }

  show();
};

export const bindResetBtn = (snow: LetItGo): void => {
  document
    .querySelector<HTMLInputElement>('#reset')
    ?.addEventListener('click', () => {
      snow.letItGoAgain();

      const { DEFAULT_OPTIONS } = LetItGo;
      snow.number = DEFAULT_OPTIONS.number;
      snow.color = DEFAULT_OPTIONS.color;
      snow.velocityXRange = DEFAULT_OPTIONS.velocityXRange;
      snow.velocityYRange = DEFAULT_OPTIONS.velocityYRange;
      snow.radiusRange = DEFAULT_OPTIONS.radiusRange;
      snow.alphaRange = DEFAULT_OPTIONS.alphaRange;
    });
};

export const bindSwitch = (snow: LetItGo): void => {
  const getWord = (isChecked: boolean) => (isChecked ? '☃️' : '⛄️');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const switchInput = document.querySelector<HTMLInputElement>('#is-snow')!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const switchLabel = document.querySelector('[for="is-snow"]')!;

  let isSnow = true;
  switchInput.checked = isSnow;
  switchLabel.textContent = getWord(true);
  switchInput.addEventListener('change', ({ target }) => {
    isSnow = !isSnow;

    if (isSnow) {
      snow.letItGoAgain();
      (target as HTMLInputElement).checked = isSnow;
      switchLabel.textContent = getWord(isSnow);
      return;
    }

    snow.letItStop();
    switchLabel.textContent = getWord(isSnow);
    (target as HTMLInputElement).checked = isSnow;
  });
};

export const bindNumberInput = (snow: LetItGo): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const numberInput = document.querySelector<HTMLInputElement>('#number')!;

  numberInput.value = `${LetItGo.DEFAULT_OPTIONS.number}`;
  numberInput.addEventListener('input', ({ target }) => {
    snow.number = +(target as HTMLInputElement).value;
  });
};

export const bindColorInput = (snow: LetItGo): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const colorInput = document.querySelector<HTMLInputElement>('#color')!;

  colorInput.value = LetItGo.DEFAULT_OPTIONS.color as string;
  colorInput.addEventListener('input', ({ target }) => {
    snow.color = (target as HTMLInputElement).value;
  });
};

export interface RangeOption {
  type: string;
  min: number;
  max: number;
  step?: number
}

export const bindRangeInputs = (snow: LetItGo, rangeOptions: RangeOption[]): void => {
  rangeOptions.forEach(({ type }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let [v1, v2] = LetItGo.DEFAULT_OPTIONS[`${type}Range`] as [number, number];
    const updateLabel = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const label = document.querySelector<HTMLLabelElement>(`#${type}-range-label`)!;
      label.textContent = label.textContent?.replace(/\(.*\)/, `(${[v1, v2].sort().join(' to ')})`) || '';
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v1Input = document.querySelector<HTMLInputElement>(`#${type}-range-value-1`)!;

    v1Input.value = `${v1}`;
    v1Input.addEventListener('change', ({ target }) => {
      const { value } = target as HTMLInputElement;
      v1 = +value;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      snow[`${type}Range`] = [v1, v2];

      updateLabel();
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v2Input = document.querySelector<HTMLInputElement>(`#${type}-range-value-2`)!;

    v2Input.value = `${v2}`;
    v2Input.addEventListener('change', ({ target }) => {
      const { value } = target as HTMLInputElement;
      v2 = +value;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
  const template = ({
    type, min, max, step,
  }: RangeOption) => `
    <fieldset>
      <label id="${type}-range-label" class="form-label">↔️ ${type} ()</label>

      <input
        type="range"
        class="form-range"
        min="${min}"
        max="${max}"
        ${step && `step="${step}"`}
        value="0"
        id="${type}-range-value-1"
      >
      <input
        type="range"
        class="form-range"
        min="${min}"
        max="${max}"
        ${step && `step="${step}"`}
        value="0"
        id="${type}-range-value-2"
      >
    </fieldset>
  `;

  container.innerHTML = rangeOptions.map((option) => template(option)).join('');
};
