export class Vec2D {
   
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
