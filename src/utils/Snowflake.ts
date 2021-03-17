import { Vec2D } from './Vector';

interface Options {
  p?: Vec2D;
  v?: Vec2D;
  r?: number;
  color?: CanvasFillStrokeStyles['fillStyle'];
  alpha?: number;
}

// eslint-disable-next-line import/prefer-default-export
export class Snowflake {
  p: Vec2D;

  v: Vec2D;

  r: number;

  color: CanvasFillStrokeStyles['fillStyle'];

  alpha: number;

  constructor({
    p = new Vec2D(),
    v = new Vec2D(),
    r = 0.5,
    color = '#ffffff',
    alpha = 1,
  }: Options = {}) {
    this.p = p;
    this.v = v;
    this.r = r;
    this.color = color;
    this.alpha = alpha;
  }

  update({ width = 0, height = 0 } = {}): void {
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
