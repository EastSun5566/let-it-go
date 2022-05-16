export * from './Vector';
export * from './Snowflake';

export function assert<TCond = unknown>(condition: TCond, message = 'internal error.'): asserts condition {
  if (!condition) throw Error(`[let-it-go] ${message}`);
}

export function getRandom(
  min: number,
  max: number,
): number {
  return Math.random() * (max - min) + min;
}

type Fn<TParams extends unknown[] = unknown[], TReturn = unknown> = (...params: TParams) => TReturn;

export function debounce<TFn extends Fn>(
  fn: TFn,
  ms = 250,
): (...params: Parameters<TFn>) => void {
  let timeoutID: NodeJS.Timeout;

  return (...params): void => {
    clearTimeout(timeoutID);

    timeoutID = setTimeout(() => fn(...params), ms);
  };
}

export function setStyleProps(
  element: HTMLElement,
  style: Partial<Record<keyof CSSStyleDeclaration, string | number>> = {},
): void {
  Object
    .entries(style)
    .forEach(([key, value]) => {
      element.style.setProperty(key, value === undefined ? null : `${value}`);
    });
}
