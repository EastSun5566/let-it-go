/* eslint-disable max-classes-per-file */
export const getRandomNumber = (
  min: number,
  max: number,
): number => Math.random() * (max - min) + min;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <F extends (...args: any[]) => any>(
  fn: F,
  ms = 250,
): (...args: Parameters<F>) => void => {
  let timeoutID: NodeJS.Timeout;

  return (...args): void => {
    clearTimeout(timeoutID);

    timeoutID = setTimeout(() => fn(...args), ms);
  };
};

export class Vec2D {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  add({ x = 0, y = 0 }: Vec2D): Vec2D {
    this.x += x;
    this.y += y;

    return this;
  }
}

export class Snowflake {
  p: Vec2D;

  v: Vec2D;

  r: number;

  color: string;

  alpha: number;

  constructor({
    p = new Vec2D(),
    v = new Vec2D(),
    r = 0.5,
    color = '#fff',
    alpha = 1,
  } = {}) {
    this.p = p;
    this.v = v;
    this.r = r;
    this.color = color;
    this.alpha = alpha;
  }

  update({ width = window.innerWidth, height = window.innerHeight } = {}): void {
    const { p, r, v } = this;

    if (p.y - r > height) {
      this.p.y = 0 - r;
    }

    if (p.x - r > width) {
      this.p.x = 0 - r;
    }

    if (p.x + r < 0) {
      this.p.x = width + r;
    }

    this.p.add(v);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const {
      p,
      r,
      color,
      alpha,
    } = this;

    ctx.save();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();

    ctx.restore();
  }
}
