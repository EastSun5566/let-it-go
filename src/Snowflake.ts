import { Vector2D } from './Vector';

export class Snowflake {
  p: Vector2D;

  v: Vector2D;

  r: number;

  color: string;

  alpha: number;

  constructor({
    p = new Vector2D(),
    v = new Vector2D(),
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

    if (p.y + r > height) {
      this.p.y = 0;
    }

    if (p.x + r > width) {
      this.p.x = 0;
    }

    if (p.x - r < 0) {
      this.p.x = width;
    }

    this.p = this.p.add(v);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const {
      p, r, color, alpha,
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

export default Snowflake;
