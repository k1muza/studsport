/**
 * Visualization-only radial envelopes for axial chamfers and stepped shafts.
 * Dimensions are millimetres. Never infer an end diameter from a labelled angle.
 */
export function tipChamferRadius(y, y0, y1, majorRadius, tip, chamfer) {
  const { lengthMm, tipDiameterMm } = chamfer;
  if (![y,y0,y1,majorRadius,lengthMm,tipDiameterMm].every(Number.isFinite) ||
      y1<=y0 || majorRadius<=0 || lengthMm<=0 || lengthMm>=y1-y0 ||
      tipDiameterMm<=0 || tipDiameterMm>=2*majorRadius ||
      !['start','end'].includes(tip)) throw new Error('Invalid chamfer data');
  const distance = tip==='start' ? y-y0 : y1-y;
  const k=Math.min(1,Math.max(0,distance / lengthMm));
  return tipDiameterMm/2 + (majorRadius-tipDiameterMm/2)*k;
}
export function plainTaperRings(y0,y1,r,startOfTaperFromEnd,endR) {
  if (![y0,y1,r,startOfTaperFromEnd,endR].every(Number.isFinite) ||
      y1<=y0 || r<=0 || endR<=0 || startOfTaperFromEnd<=0 ||
      startOfTaperFromEnd>=y1-y0)
    throw new Error('Invalid shaft taper data');
  return [[r,y0],[r,y1-startOfTaperFromEnd],[endR,y1]];
}
