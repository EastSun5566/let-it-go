
/**
 * 2D Vector
 *
 * @export
 * @class Vector2D
 */
export class Vector2D {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  add({ x = 0, y = 0 } = {}): Vector2D {
    this.x += x;
    this.y += y;
    return this;
  }
}

export default Vector2D;
