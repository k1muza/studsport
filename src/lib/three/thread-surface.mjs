// Display profile, not a thread gauge. A rectangular (angle, axial) grid avoids
// clamped helical rows, degenerate end bands and discontinuous end-cap radii.
export function threadSurfaceRadius(s, y, angle, internal = false) {
  const major = s.r ?? s.rMaj;
  const minor = s.rMin;
  const hand = s.dir === 'LH' ? -1 : s.dir === 'RH' ? 1 : 0;
  const phase = (y - s.y0) / s.pitch - hand * angle / (2 * Math.PI);
  const f = phase - Math.floor(phase);
  // Truncated root and crest, with linear flanks.
  const tooth = Math.min(1, Math.max(0, (1 - Math.abs(2 * f - 1) - 0.125) / 0.75));
  let radius = minor + (major - minor) * tooth;
  const length = s.y1 - s.y0;
  if (internal) {
    const edge = Math.min(y - s.y0, s.y1 - y);
    return Math.max(radius, major + 0.6 - edge);
  }
  const run = Math.min(s.pitch * (s.runoutPitches ?? 1.25), length / 3);
  const fromJoin = s.tip === 'start' ? s.y1 - y : y - s.y0;
  const blend = Math.min(1, Math.max(0, fromJoin / run));
  radius = major - (major - radius) * (blend * blend * (3 - 2 * blend));
  const c = s.tipChamfer ?? {lengthMm: major - minor + 0.25, tipDiameterMm: (minor - 0.25) * 2};
  const fromTip = s.tip === 'start' ? y - s.y0 : s.y1 - y;
  const limit = c.tipDiameterMm / 2 + (major - c.tipDiameterMm / 2) * Math.min(1, Math.max(0, fromTip / c.lengthMm));
  return Math.min(radius, limit);
}

export function threadEndRadius(s, end) {
  return threadSurfaceRadius(s, end === 'start' ? s.y0 : s.y1, 0);
}
