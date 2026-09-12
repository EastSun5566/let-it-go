/* eslint-disable no-param-reassign */
import { LetItGo, type Range } from 'let-it-go';

type RangeOptionType = 'velocityX' | 'velocityY' | 'radius' | 'alpha';
type RangeProperty = `${RangeOptionType}Range`;

export interface RangeOption {
  type: RangeOptionType;
  label: string;
  min: number;
  max: number;
  step?: number;
}

const getElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing demo element: ${selector}`);
  return element;
};

const getRangeProperty = (type: RangeOptionType): RangeProperty => `${type}Range`;

const getDefaultSnowflakeNumber = (numberInput: HTMLInputElement): number => {
  const minimum = Number(numberInput.min);
  const maximum = Number(numberInput.max);

  return Math.max(minimum, Math.min(LetItGo.DEFAULT_OPTIONS.number, maximum));
};

const setRangeControlValues = ({
  type,
  label,
}: RangeOption, range: Range): void => {
  const [first, second] = range;
  getElement<HTMLInputElement>(`#${type}-range-value-1`).value = `${first}`;
  getElement<HTMLInputElement>(`#${type}-range-value-2`).value = `${second}`;

  const [minimum, maximum] = [first, second].sort((a, b) => a - b);
  getElement<HTMLLegendElement>(`#${type}-range-legend`).textContent = `${label} (${minimum} to ${maximum})`;
};

export const setupToggle = ({
  isShowPanel = false,
}: { isShowPanel?: boolean } = {}): void => {
  const controls = getElement<HTMLElement>('#option-controls');
  const toggle = getElement<HTMLButtonElement>('#toggle');

  const render = (isOpen: boolean) => {
    controls.hidden = !isOpen;
    toggle.textContent = isOpen ? '👇' : '☝️';
    toggle.setAttribute('aria-expanded', `${isOpen}`);
    toggle.setAttribute('aria-label', isOpen ? 'Hide snow controls' : 'Show snow controls');
  };

  let isOpen = isShowPanel;
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    render(isOpen);
  });

  render(isOpen);
};

export const bindResetBtn = (
  snow: LetItGo,
  rangeOptions: RangeOption[],
  resetSnowing: () => void,
): void => {
  getElement<HTMLButtonElement>('#reset').addEventListener('click', () => {
    const { DEFAULT_OPTIONS } = LetItGo;
    const numberInput = getElement<HTMLInputElement>('#number');
    const defaultNumber = getDefaultSnowflakeNumber(numberInput);

    snow.number = defaultNumber;
    snow.color = DEFAULT_OPTIONS.color;
    snow.velocityXRange = DEFAULT_OPTIONS.velocityXRange;
    snow.velocityYRange = DEFAULT_OPTIONS.velocityYRange;
    snow.radiusRange = DEFAULT_OPTIONS.radiusRange;
    snow.alphaRange = DEFAULT_OPTIONS.alphaRange;

    numberInput.value = `${defaultNumber}`;
    numberInput.setCustomValidity('');
    numberInput.removeAttribute('aria-invalid');
    getElement<HTMLInputElement>('#color').value = DEFAULT_OPTIONS.color as string;
    rangeOptions.forEach((option) => {
      setRangeControlValues(option, DEFAULT_OPTIONS[getRangeProperty(option.type)]);
    });
    resetSnowing();
  });
};

export const bindSwitch = (
  snow: LetItGo,
  { isSnowing = true }: { isSnowing?: boolean } = {},
): ((enabled: boolean) => void) => {
  const switchInput = getElement<HTMLInputElement>('#is-snow');
  const switchIcon = getElement<HTMLElement>('[data-snow-icon]');

  const setSnowing = (enabled: boolean): void => {
    switchInput.checked = enabled;
    switchIcon.textContent = enabled ? '☃️' : '⛄️';

    if (enabled) {
      snow.letItGoAgain();
    } else {
      snow.letItStop();
    }
  };

  switchInput.addEventListener('change', () => setSnowing(switchInput.checked));
  setSnowing(isSnowing);

  return setSnowing;
};

export const bindNumberInput = (snow: LetItGo): void => {
  const numberInput = getElement<HTMLInputElement>('#number');
  const defaultNumber = getDefaultSnowflakeNumber(numberInput);

  snow.number = defaultNumber;
  numberInput.value = `${defaultNumber}`;
  numberInput.addEventListener('input', () => {
    numberInput.setCustomValidity('');
    const number = numberInput.valueAsNumber;
    if (numberInput.checkValidity() && Number.isSafeInteger(number)) {
      numberInput.removeAttribute('aria-invalid');
      snow.number = number;
      return;
    }

    numberInput.setAttribute('aria-invalid', 'true');
  });
  numberInput.addEventListener('change', () => {
    const number = numberInput.valueAsNumber;
    if (!numberInput.checkValidity() || !Number.isSafeInteger(number)) {
      numberInput.setCustomValidity('Enter a whole number from 0 to 10,000.');
      numberInput.setAttribute('aria-invalid', 'true');
      numberInput.reportValidity();
    }
  });
};

export const bindColorInput = (snow: LetItGo): void => {
  const colorInput = getElement<HTMLInputElement>('#color');

  colorInput.value = LetItGo.DEFAULT_OPTIONS.color as string;
  colorInput.addEventListener('input', () => {
    snow.color = colorInput.value;
  });
};

export const bindRangeInputs = (snow: LetItGo, rangeOptions: RangeOption[]): void => {
  rangeOptions.forEach((option) => {
    const { type } = option;
    const property = getRangeProperty(type);
    const firstInput = getElement<HTMLInputElement>(`#${type}-range-value-1`);
    const secondInput = getElement<HTMLInputElement>(`#${type}-range-value-2`);

    const update = (): void => {
      const range: Range = [firstInput.valueAsNumber, secondInput.valueAsNumber];
      snow[property] = range;
      setRangeControlValues(option, range);
    };

    firstInput.addEventListener('input', update);
    secondInput.addEventListener('input', update);

    setRangeControlValues(option, LetItGo.DEFAULT_OPTIONS[property]);
  });
};

export const createRangeInputs = (
  container: HTMLElement,
  rangeOptions: RangeOption[],
): void => {
  const template = ({
    type, label, min, max, step = 1,
  }: RangeOption) => `
    <fieldset class="mb-3">
      <legend id="${type}-range-legend" class="form-label">${label}</legend>

      <label class="visually-hidden" for="${type}-range-value-1">${label} first endpoint</label>
      <input
        type="range"
        class="form-range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="0"
        id="${type}-range-value-1"
      >

      <label class="visually-hidden" for="${type}-range-value-2">${label} second endpoint</label>
      <input
        type="range"
        class="form-range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="0"
        id="${type}-range-value-2"
      >
    </fieldset>
  `;

  container.innerHTML = rangeOptions.map((option) => template(option)).join('');
};
