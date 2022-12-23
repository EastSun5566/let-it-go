export type Range = [number, number];

export interface Options {
  root?: HTMLElement;
  number?: number;
  velocityXRange?: Range;
  velocityYRange?: Range;
  radiusRange?: Range;
  color?: CanvasFillStrokeStyles['fillStyle'];
  alphaRange?: Range;
}
