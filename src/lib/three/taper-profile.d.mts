export declare function tipChamferRadius(
  y: number, y0: number, y1: number, majorRadius: number,
  tip: 'start' | 'end',
  chamfer: {lengthMm: number; tipDiameterMm: number},
): number;
export declare function plainTaperRings(
  y0: number, y1: number, radius: number, taperLengthMm: number,
  endRadius: number,
): [number, number][];
