import {
  Vec2D,
  Snowflake,
  assertIsAlphaRange,
  assertIsRadiusRange,
  assertIsRange,
  assertIsSnowflakeNumber,
  getRandom,
  normalizeRange,
  setStyleProps,
} from './utils';
import { DEFAULT_OPTIONS } from './constants';

import type { Range, Options } from './types';

export class LetItGo {
  readonly root: HTMLElement;

  #isGo = false;

  #number = 0;

  get number(): number {
    return this.#number;
  }

  set number(number: number) {
    assertIsSnowflakeNumber(number);

    this.#number = number;
    this.#createSnowflakes();
    this.#isDirty = true;
  }

  #velocityXRange: Range;

  get velocityXRange(): Range {
    return this.#velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertIsRange(range);

    const normalizedRange = normalizeRange(range);
    this.#velocityXRange = normalizedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.v.x = getRandom(...normalizedRange);
    });
    this.#isDirty = true;
  }

  #velocityYRange: Range;

  get velocityYRange(): Range {
    return this.#velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertIsRange(range);

    const normalizedRange = normalizeRange(range);
    this.#velocityYRange = normalizedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.v.y = getRandom(...normalizedRange);
    });
    this.#isDirty = true;
  }

  #radiusRange: Range;

  get radiusRange(): Range {
    return this.#radiusRange;
  }

  set radiusRange(range: Range) {
    assertIsRadiusRange(range);

    const normalizedRange = normalizeRange(range);
    this.#radiusRange = normalizedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.r = getRandom(...normalizedRange);
    });
    this.#isDirty = true;
  }

  #color: CanvasFillStrokeStyles['fillStyle'];

  get color(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#color;
  }

  set color(color: CanvasFillStrokeStyles['fillStyle']) {
    this.#color = color;
    this.#isDirty = true;
  }

  #alphaRange: Range;

  get alphaRange(): Range {
    return this.#alphaRange;
  }

  set alphaRange(range: Range) {
    assertIsAlphaRange(range);

    const normalizedRange = normalizeRange(range);
    this.#alphaRange = normalizedRange;
    this.#snowflakes.forEach((snowflake) => {
      snowflake.alpha = getRandom(...normalizedRange);
    });
    this.#isDirty = true;
  }

  #backgroundColor: CanvasFillStrokeStyles['fillStyle'];

  get backgroundColor(): CanvasFillStrokeStyles['fillStyle'] {
    return this.#backgroundColor;
  }

  set backgroundColor(backgroundColor: CanvasFillStrokeStyles['fillStyle']) {
    this.#backgroundColor = backgroundColor;
    this.#isDirty = true;
  }

  readonly style: Readonly<Partial<CSSStyleDeclaration>>;

  readonly canvas: HTMLCanvasElement;

  readonly #ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  #snowflakes: Snowflake[] = [];

  #lastUpdate: number | null = null;

  #requestID: number | null = null;

  #isDirty = true;

  #rootPositionWasApplied = false;

  #initialRootInlinePosition = '';

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
    assertIsSnowflakeNumber(number);

    this.root = root;
    this.canvas = root.ownerDocument.createElement('canvas');
    this.#number = number;
    this.#velocityXRange = normalizeRange(velocityXRange);
    this.#velocityYRange = normalizeRange(velocityYRange);
    this.#radiusRange = normalizeRange(radiusRange);
    this.#color = color;
    this.#alphaRange = normalizeRange(alphaRange);
    this.#backgroundColor = backgroundColor;
    this.style = Object.freeze({ ...style });

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
          this.#isDirty = true;
        }
      });
      resizeObserver.observe(this.root);
      this.#resizeObserver = resizeObserver;
    } catch (error) {
      console.warn('[let-it-go] ResizeObserver is not supported.', error);
    }

    this.canvas.width = this.root.clientWidth;
    this.canvas.height = this.root.clientHeight;

    const computedPosition = this.root.ownerDocument.defaultView
      ?.getComputedStyle(this.root).position;
    if (!computedPosition || computedPosition === 'static') {
      this.#initialRootInlinePosition = this.root.style.position;
      setStyleProps(this.root, { position: 'relative' });
      this.#rootPositionWasApplied = true;
    }
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
          getRandom(...this.#velocityXRange),
          getRandom(...this.#velocityYRange),
        ),
        r: getRandom(...this.#radiusRange),
        alpha: getRandom(...this.#alphaRange),
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

    const elapsed = timestamp - this.#lastUpdate;
    const dueSteps = Math.floor((elapsed * LetItGo.FRAME_RATE) / 1000);
    const steps = Math.min(dueSteps, LetItGo.MAX_CATCH_UP_STEPS);
    for (let index = 0; index < steps; index += 1) {
      this.#update();
    }
    if (steps > 0) {
      this.#isDirty = true;
      this.#lastUpdate = timestamp - (elapsed % LetItGo.FRAME_INTERVAL);
    }

    if (this.#isDirty) {
      this.#draw();
      this.#isDirty = false;
    }

    if (!this.#isGo) return;
    this.#requestID = requestAnimationFrame(this.#animate);
  };

  static readonly FRAME_RATE = 30;

  static readonly FRAME_INTERVAL = 1000 / LetItGo.FRAME_RATE;

  static readonly MAX_CATCH_UP_STEPS = 5;

  #startAnimate(): void {
    if (this.#isGo) return;

    this.#isGo = true;
    this.#lastUpdate = null;
    this.#isDirty = true;
    this.#requestID = requestAnimationFrame(this.#animate);
  }

  letItStop(): void {
    this.#isGo = false;

    if (this.#requestID !== null) {
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

    this.canvas.remove();

    if (this.#rootPositionWasApplied && this.root.style.position === 'relative') {
      this.root.style.position = this.#initialRootInlinePosition;
    }
    this.#rootPositionWasApplied = false;

    this.#ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#number = 0;
  }
}

export default LetItGo;
