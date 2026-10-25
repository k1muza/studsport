/**
 * Axial [radius, y] rings for a headed fastener or an internal double-flat drive.
 *
 * A head at the start of a stud is capped at the first end. Internal heads are
 * treated as local drive/shoulder features: their rings must remain inside
 * [start, end] and join the incoming/outgoing shafts without extra end caps.
 *
 * No dimensions are inferred here; this is *render geometry only*.
 */
export function headProfileRings({
  start, end, radius, chamfer = 0, incomingRadius = null, outgoingRadius = 0,
}) {
  if (![start, end, radius, chamfer, outgoingRadius].every(Number.isFinite) ||
      !(end > start) || !(radius > 0) || !(outgoingRadius >= 0) ||
      (incomingRadius !== null && (!Number.isFinite(incomingRadius) || incomingRadius < 0))) {
    throw new Error('Invalid head/profile geometry');
  }

  if (incomingRadius !== null) {
    if (chamfer > 0) {
      const c = Math.min(chamfer, (end-start)/4, radius/8);
      return [[incomingRadius,start],[radius-c,start],[radius,start+c],
        [radius,end-c],[radius-c,end],[outgoingRadius,end]];
    }
    // A ring-to-ring annular shoulder at each step; no artificial origin cap.
    return [
      [incomingRadius, start],
      [radius, start],
      [radius, end],
      [outgoingRadius, end],
    ];
  }

  // Preserve the chamfered first-head appearance for the original products.
  const c0 = Math.min(chamfer, (end - start) / 4);
  const c1 = Math.min(0.5, (end - start) / 4);
  return [
    [0, start],
    [radius - c0, start],
    [radius, start + c0],
    [radius, end - c1],
    [radius - c1, end],
    [outgoingRadius, end],
  ];
}
