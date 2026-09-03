import {
  Vec2D,
  Snowflake,
  assert,
  assertIsAlphaRange,
  assertIsRadiusRange,
  assertIsRange,
  getRandom,
  setStyleProps,
} from './utils';
import { DEFAULT_OPTIONS } from './constants';

import type { Range, Options } from './types';

export class LetItGo {
  readonly root = document.body;

  #isGo = false;

  #number = 0;

  get number(): number {
    return this.#number;
  }

  set number(number: number) {
    assert(number >= 0, 'Number must be positive');

    this.#number = number;
    this.#createSnowflakes();
  }

  #velocityXRange: Range;

  get velocityXRange(): Range {
    return this.#velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertIsRange(range);

    const _range = range.sort();
    this.#velocityXRange = _range;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.v.x = getRandom(..._range);
    });
  }

  #velocityYRange: Range;

  get velocityYRange(): Range {
    return this.#velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertIsRange(range);

    const sortedRange = range.sort();
    this.#velocityYRange = sortedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.v.y = getRandom(...sortedRange);
    });
  }

  #radiusRange: Range;

  get radiusRange(): Range {
    return this.#radiusRange;
  }

  set radiusRange(range: Range) {
    assertIsRadiusRange(range);

    const _range = range.sort();
    this.#radiusRange = _range;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.r = getRandom(..._range);
    });
  }

  #color: CanvasFillStrokeStyles['fillStyle'];

  get color(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#color;
  }

  set color(color: CanvasFillStrokeStyles['fillStyle']) {
    this.#color = color;
  }

  #alphaRange: Range;

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

  readonly canvas: HTMLCanvasElement = document.createElement('canvas');

  readonly #ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  #snowflakes: Snowflake[] = [];

  #lastUpdate: number | null = null;

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

    // TODO: use OffscreenCanvas when is possible
    // const ctx = this.canvas.transferControlToOffscreen().getContext('2d');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('[let-it-go] The 2d context canvas is not supported.');

    this.#ctx = ctx;

    this.#mountCanvas();

    this.#createSnowflakes();
    this.#startAnimate();
  }

  #resizeObserver: ResizeObserver | null = null;

  #mountCanvas(): void {
    try {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.canvas.width = entry.contentRect.width;
          this.canvas.height = entry.contentRect.height;
        }
      });
      resizeObserver.observe(this.root);
      this.#resizeObserver = resizeObserver;
    } catch (error) {
      console.warn('[let-it-go] ResizeObserver is not supported.', error);
    }

    this.canvas.width = this.root.clientWidth;
    this.canvas.height = this.root.clientHeight;

    setStyleProps(this.root, { position: 'relative' });
    setStyleProps(this.canvas, {
      position: 'absolute',
      top: '0',
      left: '0',
      ...this.style,
    });

    this.root.appendChild(this.canvas);
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
    const { width, height } = this.canvas;
    const ctx = this.#ctx;

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = this.#color;

    for (const snowflake of this.#snowflakes) {
      ctx.globalAlpha = snowflake.alpha;
      ctx.beginPath();
      snowflake.draw(ctx);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  #animate = (timestamp: number): void => {
    if (!this.#isGo) return;

    if (this.#lastUpdate === null) this.#lastUpdate = timestamp;

    let elapsed = timestamp - this.#lastUpdate;

    // Cap catch-up time so a background tab, device sleep, or debugger pause
    // does not freeze the page by replaying every missed fixed step at once.
    // Excess lag is discarded; ordinary short delays keep the fixed timestep.
    if (elapsed > LetItGo.MAX_CATCH_UP_TIME) {
      this.#lastUpdate = timestamp - LetItGo.MAX_CATCH_UP_TIME;
      elapsed = LetItGo.MAX_CATCH_UP_TIME;
    }

    const steps = Math.floor((elapsed * LetItGo.FRAME_RATE) / 1000);
    for (let i = 0; i < steps; i += 1) {
      this.#update();
    }
    this.#lastUpdate = timestamp - (elapsed % LetItGo.FRAME_INTERVAL);

    this.#draw();

    if (!this.#isGo) return;
    this.#requestID = requestAnimationFrame(this.#animate);
  };

  static readonly FRAME_RATE = 30;

  static readonly FRAME_INTERVAL = 1000 / LetItGo.FRAME_RATE;

  static readonly MAX_CATCH_UP_TIME = 1000;

  #startAnimate(): void {
    if (this.#isGo) return;

    this.#isGo = true;
    this.#lastUpdate = null;
    this.#requestID = requestAnimationFrame(this.#animate);
  }

  letItStop(): void {
    this.#isGo = false;

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

    if (this.canvas.parentNode) {
      this.root.removeChild(this.canvas);
    }

    this.#ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#number = 0;
  }
}

export default LetItGo;
