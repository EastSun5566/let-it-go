/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import {
  Vec2D,
  Snowflake,
  assert,
  getRandom,
  debounce,
} from './utils';

type Range = [number, number];

export interface Options {
  root?: HTMLElement;
  number?: number;
  velocityXRange?: Range;
  velocityYRange?: Range;
  radiusRange?: Range;
  color?: string;
  alphaRange?: Range;
  fps?: number;
}

export const assertRange = (range: Range): void | never => {
  assert(Array.isArray(range), 'range must be array');
  assert(range.length === 2, 'range size must be 2');
  assert(range.every((value) => typeof value === 'number'), 'range value must be number');
};

export const assertRadiusRange = (range: Range): void | never => {
  assertRange(range);
  assert(range.every((value) => value >= 1), 'radius range value must be positive');
};

export const assertAlphaRange = (range: Range): void | never => {
  assertRange(range);
  assert(range.every((value) => value >= 0 || value <= 1), 'alpha range value must be from 0 to 1');
};

const DEFAULT_OPTIONS: Readonly<Required<Options>> = {
  root: document.body,
  number: window.innerWidth,
  velocityXRange: [-3, 3],
  velocityYRange: [1, 5],
  radiusRange: [0.5, 1],
  color: '#ffffff',
  alphaRange: [0.8, 1],
  fps: 30,
};

export class LetItGo {
  readonly root: HTMLElement;

  private isGo = false;

  private _number: number;

  get number(): number {
    return this._number;
  }

  set number(number: number) {
    this._number = number;
    this._createSnowflakes();
  }

  private _velocityXRange: Range;

  get velocityXRange(): Range {
    return this._velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertRange(range);

    this._velocityXRange = range.sort();
    this.snowflakes.forEach((snowflake) => { snowflake.v.x = getRandom(...this._velocityXRange); });
  }

  private _velocityYRange: Range;

  get velocityYRange(): Range {
    return this._velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertRange(range);

    this._velocityYRange = range.sort();
    this.snowflakes.forEach((snowflake) => { snowflake.v.y = getRandom(...this._velocityYRange); });
  }

  private _radiusRange: Range;

  get radiusRange(): Range {
    return this._radiusRange;
  }

  set radiusRange(range: Range) {
    assertRadiusRange(range);

    this._radiusRange = range.sort();
    this.snowflakes.forEach((snowflake) => { snowflake.r = getRandom(...this._radiusRange); });
  }

  private _color: string;

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = color;
    this.snowflakes.forEach((snowflake) => { snowflake.color = color; });
  }

  private _alphaRange: Range;

  get alphaRange(): Range {
    return this._alphaRange;
  }

  set alphaRange(range: Range) {
    assertAlphaRange(range);

    this._alphaRange = range.sort();
    this.snowflakes.forEach((snowflake) => { snowflake.alpha = getRandom(...this.alphaRange); });
  }

  readonly fps: number;

  private readonly canvas = document.createElement('canvas');

  private readonly ctx: CanvasRenderingContext2D;

  private snowflakes: Snowflake[] = [];

  private intervalID: NodeJS.Timeout | null = null;

  private requestID: number | null = null;

  static readonly DEFAULT_OPTIONS = DEFAULT_OPTIONS;

  constructor({
    root = DEFAULT_OPTIONS.root,
    number = DEFAULT_OPTIONS.number,
    velocityXRange = DEFAULT_OPTIONS.velocityXRange,
    velocityYRange = DEFAULT_OPTIONS.velocityYRange,
    radiusRange = DEFAULT_OPTIONS.radiusRange,
    color = DEFAULT_OPTIONS.color,
    alphaRange = DEFAULT_OPTIONS.alphaRange,
    fps = DEFAULT_OPTIONS.fps,
  }: Readonly<Options> = {}) {
    assertRange(velocityXRange);
    assertRange(velocityYRange);
    assertRadiusRange(radiusRange);
    assertAlphaRange(alphaRange);

    this.root = root;
    this._number = number;
    this._velocityXRange = velocityXRange.sort();
    this._velocityYRange = velocityYRange.sort();
    this._radiusRange = radiusRange.sort();
    this._color = color;
    this._alphaRange = alphaRange.sort();
    this.fps = fps;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('[let-it-go] The 2d context canvas is not supported.');

    this.ctx = ctx;

    this._mountCanvas();
    this._createSnowflakes();
    this._init();
  }

  private _resizeCanvas(): void {
    const { clientWidth, clientHeight } = this.root;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
  }

  private _mountCanvas(): void {
    this.root.style.position = 'relative';

    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';

    this._resizeCanvas();
    window.addEventListener('resize', debounce(() => this._resizeCanvas()));

    this.root.appendChild(this.canvas);
  }

  private _createSnowflakes(): void {
    const {
      number,
      color,
      canvas,
      velocityXRange,
      velocityYRange,
      radiusRange,
      alphaRange,
    } = this;

    this.snowflakes = Array.from(
      { length: number },
      () => new Snowflake({
        p: new Vec2D(
          getRandom(0, canvas.width),
          getRandom(0, -canvas.height),
        ),
        v: new Vec2D(
          getRandom(...velocityXRange) || Number.MIN_VALUE,
          getRandom(...velocityYRange) || Number.MIN_VALUE,
        ),
        r: getRandom(...radiusRange) || Number.MIN_VALUE,
        color,
        alpha: getRandom(...alphaRange) || Number.MIN_VALUE,
      }),
    );
  }

  private _update = (): void => this.snowflakes.forEach(
    (snowflake) => snowflake.update(this.canvas),
  );

  private _draw = (): void => {
    const { width, height } = this.canvas;

    this.ctx.clearRect(0, 0, width, height);
    this.snowflakes.forEach((snowflake) => snowflake.draw(this.ctx));

    requestAnimationFrame(this._draw);
  };

  private _init(): void {
    if (this.isGo) return;

    this.intervalID = setInterval(this._update, 1000 / this.fps);
    this.requestID = requestAnimationFrame(this._draw);

    this.isGo = true;
  }

  letItStop(): void {
    const { intervalID, requestID } = this;

    if (intervalID) {
      clearInterval(intervalID);
      this.intervalID = null;
    }

    if (requestID) {
      cancelAnimationFrame(requestID);
      this.requestID = null;
    }

    this.isGo = false;
  }

  letItGoAgain(): void {
    this._init();
  }

  clear(): void {
    this.letItStop();

    this.root.removeChild(this.canvas);

    window.removeEventListener('resize', this._resizeCanvas);
  }
}

export default LetItGo;
