/**
 * Axially symmetric visual approximation of a thread when direction is unknown.
 * Alternates crests and grooves at the declared pitch, with no helical advance.
 * NOT a thread representation for manufacturing, torque or fitment verification.
 *
 * @param {number} y axial coordinate (mm)
 * @param {number} start start of the threaded section (mm)
 * @param {number} pitch pitch (mm)
 * @param {number} majorRadius outer/crest radius (mm)
 * @param {number} minorRadius inner/groove radius (mm)
 */
export function neutralThreadRadius(y, start, pitch, majorRadius, minorRadius) {
  const phase = (((y - start) / pitch) % 1 + 1) % 1;
  const tooth = 1 - Math.abs(2 * phase - 1);
  // Mild flats at the crest and in the valley improve readability on thumbnails.
  const profile = Math.max(0, Math.min(1, (tooth - 0.1) / 0.76));
  return minorRadius + (majorRadius - minorRadius) * profile;
}
