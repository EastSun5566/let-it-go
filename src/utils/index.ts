import type { Range, Style } from '../types';
import { MAX_SNOWFLAKES } from '../constants';

export * from './Vector';
export * from './Snowflake';

export function assert<TCond = unknown>(condition: TCond, message = 'internal error.'): asserts condition {
  if (!condition) throw Error(`[let-it-go] ${message}`);
}

export function assertIsRange(range: unknown): asserts range is Range {
  assert(Array.isArray(range), 'Range must be an array.');
  assert(range.length === 2, 'Range size must be 2.');
  assert(
    typeof range[0] === 'number'
      && Number.isFinite(range[0])
      && typeof range[1] === 'number'
      && Number.isFinite(range[1]),
    'Range value must be finite.',
  );
}

export function assertIsRadiusRange(range: unknown): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0), 'Radius range value must be non-negative.');
}

export function assertIsAlphaRange(range: unknown): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0 && value <= 1), 'Alpha range value must be from 0 to 1.');
}

export function assertIsSnowflakeNumber(number: unknown): asserts number is number {
  assert(
    typeof number === 'number'
      && Number.isSafeInteger(number)
      && number >= 0
      && number <= MAX_SNOWFLAKES,
    `Number must be a non-negative safe integer no greater than ${MAX_SNOWFLAKES.toLocaleString('en-US')}.`,
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
