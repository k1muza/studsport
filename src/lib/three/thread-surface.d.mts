export interface SurfaceThread {
  y0: number; y1: number; pitch: number; dir: 'RH' | 'LH' | 'UNSPECIFIED';
  r?: number; rMaj?: number; rMin: number; tip?: 'start' | 'end';
  tipChamfer?: {lengthMm: number; tipDiameterMm: number}; runoutPitches?: number;
}
export function threadSurfaceRadius(s: SurfaceThread, y: number, angle: number, internal?: boolean): number;
export function threadEndRadius(s: SurfaceThread, end: 'start' | 'end'): number;
