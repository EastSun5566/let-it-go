/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import {
  Vec2D,
  Snowflake,
  assert,
  assertIsAlphaRange,
  assertIsRadiusRange,
  assertIsRange,
  getRandom,
  setStyleProps,
  isOffscreenCanvasSupported,
} from './utils';
import { DEFAULT_OPTIONS } from './constants';

import type { Range, Options } from './types';

export class LetItGo {
  readonly root = DEFAULT_OPTIONS.root;

  #isGo = false;

  #number = DEFAULT_OPTIONS.number;

  get number(): number {
    return this.#number;
  }

  set number(number: number) {
    assert(number >= 0, 'Number must be positive');

    this.#number = number;
    this.#createSnowflakes();
  }

  #velocityXRange: Range = DEFAULT_OPTIONS.velocityXRange;

  get velocityXRange(): Range {
    return this.#velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertIsRange(range);

    const _range = range.sort();
    this.#velocityXRange = _range;
    this.#snowflakes.forEach((snowflake) => { snowflake.v.x = getRandom(..._range); });
  }

  #velocityYRange: Range = DEFAULT_OPTIONS.velocityYRange;

  get velocityYRange(): Range {
    return this.#velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertIsRange(range);

    const sortedRange = range.sort();
    this.#velocityYRange = sortedRange;
    this.#snowflakes.forEach((snowflake) => { snowflake.v.y = getRandom(...sortedRange); });
  }

  #radiusRange: Range = DEFAULT_OPTIONS.radiusRange;

  get radiusRange(): Range {
    return this.#radiusRange;
  }

  set radiusRange(range: Range) {
    assertIsRadiusRange(range);

    const _range = range.sort();
    this.#radiusRange = _range;
    this.#snowflakes.forEach((snowflake) => { snowflake.r = getRandom(..._range); });
  }

  #color: CanvasFillStrokeStyles['fillStyle'] = DEFAULT_OPTIONS.color;

  get color(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#color;
  }

  set color(color: CanvasFillStrokeStyles['fillStyle']) {
    this.#color = color;
    this.#snowflakes.forEach((snowflake) => { snowflake.color = color; });
  }

  #alphaRange: Range = DEFAULT_OPTIONS.alphaRange;

  get alphaRange(): Range {
    return this.#alphaRange;
  }

  set alphaRange(range: Range) {
    assertIsAlphaRange(range);

    const sortedRange = range.sort();
    this.#alphaRange = sortedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.alpha = getRandom(...sortedRange);
    });
  }

  backgroundColor: CanvasFillStrokeStyles['fillStyle'];

  style = DEFAULT_OPTIONS.style;

  readonly canvasElement: HTMLCanvasElement = document.createElement('canvas');

  readonly canvas: HTMLCanvasElement | OffscreenCanvas;

  readonly #ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  #snowflakes: Snowflake[] = [];

  #intervalID: number | null = null;

  #requestID: number | null = null;

  static readonly DEFAULT_OPTIONS = DEFAULT_OPTIONS;

  constructor({
    root = DEFAULT_OPTIONS.root,
    number = DEFAULT_OPTIONS.number,
    velocityXRange = DEFAULT_OPTIONS.velocityXRange,
    velocityYRange = DEFAULT_OPTIONS.velocityYRange,
    radiusRange = DEFAULT_OPTIONS.radiusRange,
    color = DEFAULT_OPTIONS.color,
    alphaRange = DEFAULT_OPTIONS.alphaRange,
    backgroundColor = DEFAULT_OPTIONS.backgroundColor,
    style = DEFAULT_OPTIONS.style,
  }: Readonly<Options> = {}) {
    assertIsRange(velocityXRange);
    assertIsRange(velocityYRange);
    assertIsRadiusRange(radiusRange);
    assertIsAlphaRange(alphaRange);

    this.root = root;
    this.#number = number;
    this.#velocityXRange = velocityXRange.sort();
    this.#velocityYRange = velocityYRange.sort();
    this.#radiusRange = radiusRange.sort();
    this.#color = color;
    this.#alphaRange = alphaRange.sort();
    this.backgroundColor = backgroundColor;
    this.style = style;

    this.canvas = isOffscreenCanvasSupported()
      ? this.canvasElement.transferControlToOffscreen()
      : this.canvasElement;

    const ctx = this.canvas.getContext('2d');
    assert(ctx, 'The 2d context canvas is not supported.');

    this.#ctx = ctx as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    this.#mountCanvas();

    this.#createSnowflakes();
    this.#startAnimate();
  }

  #resizeObserver: ResizeObserver | null = null;

  #mountCanvas(): void {
    const { root, canvas, canvasElement } = this;

    try {
      const resizeObserver = new ResizeObserver((entries) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
        }
      });
      resizeObserver.observe(root);
      this.#resizeObserver = resizeObserver;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[let-it-go] ResizeObserver is not supported.', error);
    }

    canvas.width = root.clientWidth;
    canvas.height = root.clientHeight;

    setStyleProps(root, { position: 'relative' });
    setStyleProps(canvasElement, {
      position: 'absolute',
      top: '0',
      left: '0',
      ...this.style,
    });

    this.root.appendChild(canvasElement);
  }

  #createSnowflakes(): void {
    const { canvas } = this;

    this.#snowflakes = Array.from(
      { length: this.#number },
      () => new Snowflake({
        p: new Vec2D(
          getRandom(0, canvas.width),
          getRandom(0, -canvas.height),
        ),
        v: new Vec2D(
          getRandom(...this.#velocityXRange) || Number.MIN_VALUE,
          getRandom(...this.#velocityYRange) || Number.MIN_VALUE,
        ),
        r: getRandom(...this.#radiusRange) || Number.MIN_VALUE,
        color: this.#color,
        alpha: getRandom(...this.#alphaRange) || Number.MIN_VALUE,
      }),
    );
  }

  #update = (): void => {
    this.#snowflakes.forEach(
      (snowflake) => snowflake.update(this.canvas),
    );
  };

  #draw = (): void => {
    if (!this.#isGo) return;

    const { width, height } = this.canvas;

    this.#ctx.clearRect(0, 0, width, height);
    this.#ctx.fillStyle = this.backgroundColor;
    this.#ctx.fillRect(0, 0, width, height);
    this.#snowflakes.forEach((snowflake) => snowflake.draw(this.#ctx));

    this.#requestID = requestAnimationFrame(this.#draw);
  };

  static readonly FRAME_RATE = 30;

  static readonly FRAME_INTERVAL = 1000 / LetItGo.FRAME_RATE;

  #startAnimate(): void {
    if (this.#isGo) return;

    this.#intervalID = setInterval(this.#update, LetItGo.FRAME_INTERVAL);
    this.#requestID = requestAnimationFrame(this.#draw);

    this.#isGo = true;
  }

  letItStop(): void {
    this.#isGo = false;

    if (this.#intervalID) {
      clearInterval(this.#intervalID);
      this.#intervalID = null;
    }

    if (this.#requestID) {
      cancelAnimationFrame(this.#requestID);
      this.#requestID = null;
    }
  }

  letItGoAgain(): void {
    this.#startAnimate();
  }

  clear(): void {
    this.letItStop();

    this.#snowflakes = [];

    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    this.#ctx.reset();
    if (this.canvasElement.parentNode) {
      this.root.removeChild(this.canvasElement);
    }
  }
}

export default LetItGo;
