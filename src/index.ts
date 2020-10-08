/* eslint-disable no-underscore-dangle */
import { Vec2D, Snowflake, getRandomNumber } from './utils';

export class LetItGo {
  root: HTMLElement;

  number: number;

  velocityXRange: [number, number];

  velocityYRange: [number, number];

  radiusRange: [number, number];

  color: string;

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
  } = {}) {
    this.root = root;
    this.number = number;
    this.velocityXRange = [minVX, maxVX];
    this.velocityYRange = [minVY, maxVY];
    this.radiusRange = [minR, maxR];
    this.color = color;
    this.alphaRange = [minA, maxA];
    this.fps = fps;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('The 2d context canvas is not supported.');

    this.ctx = ctx;

    this._mountCanvas();
    this._createSnowflakes();
    this._init();
  }

  private _mountCanvas(): void {
    const resizeCanvas = (): void => {
      const { root } = this;

      const isBody = (el: HTMLElement): boolean => el === document.body;

      this.canvas.width = isBody(root) ? window.innerWidth : root.clientWidth;
      this.canvas.height = isBody(root) ? window.innerHeight : root.clientWidth;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    this.root.prepend(this.canvas);
  }

  private _createSnowflakes(): void {
    const { color, canvas } = this;
    const [minVX, maxVX] = this.velocityXRange;
    const [minVY, maxVY] = this.velocityYRange;
    const [minR, maxR] = this.radiusRange;
    const [minA, maxA] = this.alphaRange;

    this.snowflakes = Array.from(
      { length: this.number },
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
  }
}

export default LetItGo;
