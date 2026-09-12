import type { Range, Style } from '../types';

export * from './Vector';
export * from './Snowflake';

export function assert<TCond = unknown>(condition: TCond, message = 'internal error.'): asserts condition {
  if (!condition) throw Error(`[let-it-go] ${message}`);
}

export function assertIsRange(range: unknown): asserts range is Range {
  assert(Array.isArray(range), 'Range must be an array.');
  assert(range.length === 2, 'Range size must be 2.');
  assert(range.every((value) => typeof value === 'number' && Number.isFinite(value)), 'Range value must be finite.');
}

export function assertIsRadiusRange(range: unknown): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0), 'Radius range value must be positive.');
}

export function assertIsAlphaRange(range: unknown): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0 && value <= 1), 'Alpha range value must be from 0 to 1.');
}

export function assertIsSnowflakeNumber(number: unknown): asserts number is number {
  assert(
    typeof number === 'number' && Number.isSafeInteger(number) && number >= 0,
    'Number must be a non-negative safe integer.',
  );
}

export function normalizeRange(range: Range): Range {
  const [first, second] = range;
  return Object.freeze(first <= second ? [first, second] : [second, first]) as Range;
}

export function getRandom(
  min: number,
  max: number,
): number {
  return Math.random() * (max - min) + min;
}

export function setStyleProps(
  element: HTMLElement,
  style: Style = {},
): void {
  Object
    .entries(style)
    .forEach(([key, value]) => {
      // @ts-ignore

      element.style[key] = value || '';
    });
}
