/**
 * 2D vector
 *
 * @export
 * @class Vec2D
 */
export class Vec2D {
  /**
   * Creates an instance of Vec2D.
   * @param {number} [x=0]
   * @param {number} [y=0]
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  /**
   * add operator
   *
   * @param {Vec2D} { x = 0, y = 0 }
   * @returns {Vec2D}
   */
  add({ x = 0, y = 0 }: Vec2D): Vec2D {
    this.x += x;
    this.y += y;

    return this;
  }
}

export default Vec2D;
