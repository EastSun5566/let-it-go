export * from './Vector';
export * from './Snowflake';

export const assert = <C = unknown>(condition: C, message: string): void | never => {
  if (!condition) throw Error(`[let-it-go] ${message}`);
};

export const getRandom = (
  min: number,
  max: number,
): number => Math.random() * (max - min) + min;

export const debounce = <F extends (...args: unknown[]) => unknown>(
  fn: F,
  ms = 250,
): (...args: Parameters<F>) => void => {
  let timeoutID: NodeJS.Timeout;

  return (...args): void => {
    clearTimeout(timeoutID);

    timeoutID = setTimeout(() => fn(...args), ms);
  };
};
