/**
 * 2D vector
 *
 * @export
 * @class Vector2D
 */
export class Vector2D {
  /**
   * Creates an instance of Vector2D.
   * @param {number} [x=0]
   * @param {number} [y=0]
   * @memberof Vector2D
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  /**
   * add operator
   *
   * @param {Vector2D} { x = 0, y = 0 }
   * @returns {Vector2D}
   * @memberof Vector2D
   */
  add({ x = 0, y = 0 }: Vector2D): Vector2D {
    this.x += x;
    this.y += y;

    return this;
  }
}

export default Vector2D;
