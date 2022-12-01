/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import {
  Vec2D,
  Snowflake,
  assert,
  getRandom,
  setStyleProps,
  // debounce,
} from './utils';

type Range = [number, number];

export interface Options {
  root?: HTMLElement;
  number?: number;
  velocityXRange?: Range;
  velocityYRange?: Range;
  radiusRange?: Range;
  color?: CanvasFillStrokeStyles['fillStyle'];
  alphaRange?: Range;
  fps?: number;
}

function assertIsRange(range: Range): asserts range is Range {
  assert(Array.isArray(range), 'Range must be an array.');
  assert(range.length === 2, 'Range size must be 2.');
  assert(range.every((value) => typeof value === 'number'), 'Range value must be a number.');
}

function assertIsRadiusRange(range: Range): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0), 'Radius range value must be positive.');
}

function assertIsAlphaRange(range: Range): asserts range is Range {
  assertIsRange(range);
  assert(range.every((value) => value >= 0 && value <= 1), 'Alpha range value must be from 0 to 1.');
}

export const DEFAULT_OPTIONS: Required<Omit<Options, 'color'> & { color: string }> = {
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
    this.createSnowflakes();
  }

  private _velocityXRange: Range;

  get velocityXRange(): Range {
    return this._velocityXRange;
  }

  set velocityXRange(range: Range) {
    assertIsRange(range);

    const _range = range.sort();
    this._velocityXRange = _range;
    this.snowflakes.forEach((snowflake) => { snowflake.v.x = getRandom(..._range); });
  }

  private _velocityYRange: Range;

  get velocityYRange(): Range {
    return this._velocityYRange;
  }

  set velocityYRange(range: Range) {
    assertIsRange(range);

    const _range = range.sort();
    this._velocityYRange = _range;
    this.snowflakes.forEach((snowflake) => { snowflake.v.y = getRandom(..._range); });
  }

  private _radiusRange: Range;

  get radiusRange(): Range {
    return this._radiusRange;
  }

  set radiusRange(range: Range) {
    assertIsRadiusRange(range);

    const _range = range.sort();
    this._radiusRange = _range;
    this.snowflakes.forEach((snowflake) => { snowflake.r = getRandom(..._range); });
  }

  private _color: CanvasFillStrokeStyles['fillStyle'];

  get color(): CanvasFillStrokeStyles['fillStyle'] {
    return this._color;
  }

  set color(color: CanvasFillStrokeStyles['fillStyle']) {
    this._color = color;
    this.snowflakes.forEach((snowflake) => { snowflake.color = color; });
  }

  private _alphaRange: Range;

  get alphaRange(): Range {
    return this._alphaRange;
  }

  set alphaRange(range: Range) {
    assertIsAlphaRange(range);

    const _range = range.sort();
    this._alphaRange = _range;
    this.snowflakes.forEach((snowflake) => {
      snowflake.alpha = getRandom(..._range);
    });
  }

  readonly fps: number;

  private readonly canvas = document.createElement('canvas');

  private readonly ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  private snowflakes: Snowflake[] = [];

  private intervalID: number | null = null;

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
    assertIsRange(velocityXRange);
    assertIsRange(velocityYRange);
    assertIsRadiusRange(radiusRange);
    assertIsAlphaRange(alphaRange);

    this.root = root;
    this._number = number;
    this._velocityXRange = velocityXRange.sort();
    this._velocityYRange = velocityYRange.sort();
    this._radiusRange = radiusRange.sort();
    this._color = color;
    this._alphaRange = alphaRange.sort();
    this.fps = fps;

    this.resizeCanvas();
    // window.addEventListener('resize', debounce(() => this.resizeCanvas()));

    const ctx = this.canvas.transferControlToOffscreen().getContext('2d');
    if (!ctx) throw new Error('[let-it-go] The 2d context canvas is not supported.');

    this.ctx = ctx;

    this.mountCanvas();
    this.createSnowflakes();
    this.init();
  }

  private resizeCanvas(): void {
    const { clientWidth, clientHeight } = this.root;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
  }

  private mountCanvas(): void {
    setStyleProps(this.root, { position: 'relative' });

    setStyleProps(this.canvas, {
      position: 'absolute',
      top: 0,
      left: 0,
      // zIndex: -1,
      pointerEvents: 'none',
    });

    this.root.appendChild(this.canvas);
  }

  private createSnowflakes(): void {
    const {
      _number,
      _color,
      canvas,
      _velocityXRange,
      _velocityYRange,
      _radiusRange,
      _alphaRange,
    } = this;

    this.snowflakes = Array.from(
      { length: _number },
      () => new Snowflake({
        p: new Vec2D(
          getRandom(0, canvas.width),
          getRandom(0, -canvas.height),
        ),
        v: new Vec2D(
          getRandom(..._velocityXRange) || Number.MIN_VALUE,
          getRandom(..._velocityYRange) || Number.MIN_VALUE,
        ),
        r: getRandom(..._radiusRange) || Number.MIN_VALUE,
        color: _color,
        alpha: getRandom(..._alphaRange) || Number.MIN_VALUE,
      }),
    );
  }

  private update = (): void => this.snowflakes.forEach(
    (snowflake) => snowflake.update(this.canvas),
  );

  private draw = (): void => {
    const { width, height } = this.canvas;

    this.ctx.clearRect(0, 0, width, height);
    this.snowflakes.forEach((snowflake) => snowflake.draw(this.ctx));

    requestAnimationFrame(this.draw);
  };

  private init(): void {
    if (this.isGo) return;

    this.intervalID = setInterval(this.update, 1000 / this.fps);
    this.requestID = requestAnimationFrame(this.draw);

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
    this.init();
  }

  clear(): void {
    this.letItStop();

    this.root.removeChild(this.canvas);

    // window.removeEventListener('resize', this.resizeCanvas);
  }
}

export default LetItGo;
