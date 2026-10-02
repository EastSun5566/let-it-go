import { Vec2D } from './Vector';

interface Options {
  p?: Vec2D;
  v?: Vec2D;
  r?: number;
  alpha?: number;
}

export class Snowflake {
  p: Vec2D;

  v: Vec2D;

  r: number;

  alpha: number;

  constructor({
    p = new Vec2D(),
    v = new Vec2D(),
    r = 0.5,
    alpha = 1,
  }: Options = {}) {
    this.p = p;
    this.v = v;
    this.r = r;
    this.alpha = alpha;
  }

  constrainStationaryPosition(width: number, height: number): void {
    if (this.v.x === 0) this.p.x = Math.min(Math.max(this.p.x, 0), width);
    if (this.v.y === 0) this.p.y = Math.min(Math.max(this.p.y, 0), height);
  }

  update({ width = 0, height = 0 } = {}): void {
    this.constrainStationaryPosition(width, height);
    const { p, r, v } = this;

    if (v.y >= 0 && p.y - r > height) {
      this.p.y = 0 - r;
    }

    if (v.y < 0 && p.y + r < 0) {
      this.p.y = height + r;
    }

    if (p.x - r > width) {
      this.p.x = 0 - r;
    }

    if (p.x + r < 0) {
      this.p.x = width + r;
    }

    this.p.add(v);
  }

  draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    const { p, r } = this;

    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  }
}
