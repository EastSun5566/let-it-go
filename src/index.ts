/* eslint-disable no-underscore-dangle */
import {
  Vec2D,
  Snowflake,
  getRandomNumber,
  debounce,
} from './utils';

interface Options {
  root?: HTMLElement;
  number?: number;
  velocityXRange?: [number, number];
  velocityYRange?: [number, number];
  radiusRange?: [number, number];
  color?: string;
  alphaRange?: [number, number];
  fps?: number;
}

export class LetItGo {
  root: HTMLElement;

  private _number: number;

  get number(): number {
    return this._number;
  }

  set number(number: number) {
    this._number = number;
    this._createSnowflakes();
  }

  velocityXRange: [number, number];

  velocityYRange: [number, number];

  radiusRange: [number, number];

  private _color: string;

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = color;
    // eslint-disable-next-line no-param-reassign
    this.snowflakes.forEach((snowflake) => { snowflake.color = color; });
  }

  alphaRange: [number, number];

  fps: number;

  private readonly canvas = document.createElement('canvas');

  private readonly ctx: CanvasRenderingContext2D;

  private snowflakes: Snowflake[] = [];

  private intervalID: NodeJS.Timeout | null = null;

  private requestID: number | null = null;

  constructor({
    root = document.body,
    number = window.innerWidth,
    velocityXRange: [minVX, maxVX] = [-3, 3],
    velocityYRange: [minVY, maxVY] = [1, 5],
    radiusRange: [minR, maxR] = [0.5, 1],
    color = '#fff',
    alphaRange: [minA, maxA] = [0.8, 1],
    fps = 30,
  }: Readonly<Options> = {}) {
    this.root = root;
    this._number = number;
    this.velocityXRange = [minVX, maxVX];
    this.velocityYRange = [minVY, maxVY];
    this.radiusRange = [minR, maxR];
    this._color = color;
    this.alphaRange = [minA, maxA];
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
    const { number, color, canvas } = this;
    const [minVX, maxVX] = this.velocityXRange;
    const [minVY, maxVY] = this.velocityYRange;
    const [minR, maxR] = this.radiusRange;
    const [minA, maxA] = this.alphaRange;

    this.snowflakes = Array.from(
      { length: number },
      () => new Snowflake({
        p: new Vec2D(
          getRandomNumber(0, canvas.width),
          getRandomNumber(0, -canvas.height),
        ),
        v: new Vec2D(
          getRandomNumber(minVX, maxVX) || Number.MIN_VALUE,
          getRandomNumber(minVY, maxVY) || Number.MIN_VALUE,
        ),
        r: getRandomNumber(minR, maxR) || Number.MIN_VALUE,
        color,
        alpha: getRandomNumber(minA, maxA) || Number.MIN_VALUE,
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
    this.intervalID = setInterval(this._update, 1000 / this.fps);
    this.requestID = requestAnimationFrame(this._draw);
  }

  letItStop(): void {
    const { intervalID, requestID } = this;
    if (!intervalID || !requestID) return;

    clearInterval(intervalID);
    cancelAnimationFrame(requestID);
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
