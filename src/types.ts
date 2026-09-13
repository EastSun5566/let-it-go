export type Range = readonly [number, number];
export type Style = Readonly<Partial<CSSStyleDeclaration>>;

export interface Options {
  root?: HTMLElement;
  number?: number;
  velocityXRange?: Range;
  velocityYRange?: Range;
  radiusRange?: Range;
  color?: CanvasFillStrokeStyles['fillStyle'];
  alphaRange?: Range;
  backgroundColor?: CanvasFillStrokeStyles['fillStyle'];
  style?: Style;
}
