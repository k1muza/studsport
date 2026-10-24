/* Pure JavaScript validator: run before a build or when importing supplier drawings.
   Checks intended geometry consistency, NOT safety, fitment, or metallurgy. */
export function inspectModels(doc) {
  const issues = [];
  if (doc?.schemaVersion !== 1 || doc?.unit !== 'mm') issues.push('Expected schemaVersion=1 and unit=mm');
  if (!Array.isArray(doc?.models)) return [...issues, 'models must be an array'];
  const seen = new Set();
  const positive = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;
  const nonnegative = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  const thread = (t, p, hasLength) => {
    if (!t || !positive(t.dia) || !positive(t.pitch) || !['RH','LH'].includes(t.dir) || typeof t.cls !== 'string' || !t.cls.trim()) issues.push(`${p}: invalid thread`);
    if (hasLength && !positive(t?.length)) issues.push(`${p}: invalid thread length`);
  };
  const close = (a,b) => Math.abs(a-b) <= 0.01;
  for (const m of doc.models) {
    const tag = String(m?.sku || 'unknown');
    if (!/^SS-\d+$/.test(tag)) issues.push(`${tag}: invalid part number`);
    if (seen.has(tag)) issues.push(`${tag}: duplicate model`);
    seen.add(tag);
    if (!['press-in-stud','stud-nut','double-ended','wheel-nut','profiled-fastener'].includes(m?.template)) {issues.push(`${tag}: invalid template`);continue;}
    if (!['illustrative','supplier-declared','verified'].includes(m?.verification?.status)) issues.push(`${tag}: invalid status`);
    if (!m?.source?.reference || !m?.source?.kind) issues.push(`${tag}: source provenance required`);
    if (m?.verification?.status === 'verified' && !(m.verification.geometryApproved && m.verification.fitmentApproved)) issues.push(`${tag}: verification approvals required`);
    const d=m.dimensions;
    if (!d || !positive(d.overall)) {issues.push(`${tag}: invalid dimensions`);continue;}
    if (m.template === 'profiled-fastener') {
      if (m.verification?.status !== 'supplier-declared') issues.push(`${tag}: supplier profile must remain supplier-declared until engineering approval`);
      if (!Array.isArray(d.sections) || !d.sections.length) {issues.push(`${tag}: missing profile sections`);continue;}
      const sum=d.sections.reduce((a,s)=>a+(s.length||0),0);
      if (!close(sum,d.overall)) issues.push(`${tag}: profile section lengths do not sum to overall`);
      if (!Array.isArray(d.uncertainties) || !Array.isArray(d.measurements)) issues.push(`${tag}: provenance and uncertainty notes required`);
      for (const [i,s] of d.sections.entries()) {
        if (!positive(s.length) || !positive(s.dia) || !['drawing','derived','schematic'].includes(s.basis)) issues.push(`${tag} section ${i}: invalid dimensions or basis`);
        if (!['head','knurl','plain','thread','hex','collar'].includes(s.kind)) issues.push(`${tag} section ${i}: invalid kind`);
        if (s.kind === 'knurl' && s.visualDepthMm != null &&
            (!(s.visualDepthMm > 0) || s.visualDepthMm >= s.dia / 2)) issues.push(`${tag} section ${i}: invalid visual knurl depth`);
        if (s.kind === 'knurl' && (!Number.isInteger(s.splines) || s.splines < 0)) issues.push(`${tag} section ${i}: invalid spline count`);
        if (s.kind === 'thread') {
          const t=s.thread;
          if (!t || !positive(t.dia) || !positive(t.pitch) || !['RH','LH','UNSPECIFIED'].includes(t.dir) || !t.cls || t.dia !== s.dia) issues.push(`${tag} section ${i}: invalid thread`);
        }
        if (s.kind === 'head' && s.headShape === 'double-flat' && !(positive(s.flatAcross) && s.flatAcross<s.dia)) issues.push(`${tag} section ${i}: invalid double-flat`);
      }
    } else if (m.template === 'press-in-stud' || m.template === 'stud-nut') {
      const h=d.head,k=d.knurl,s=d.shoulder,t=d.thread;
      if (!h || !positive(h.dia) || !positive(h.thickness) || !['d-flat','round'].includes(h.shape)) issues.push(`${tag}: invalid head`);
      if (h?.shape === 'd-flat' && !(positive(h.flatAcross) && h.flatAcross > h.dia/2 && h.flatAcross < h.dia)) issues.push(`${tag}: invalid flat dimension`);
      if (!k || !positive(k.dia) || !positive(k.length) || !Number.isInteger(k.splines) || k.splines < 2) issues.push(`${tag}: invalid knurl`);
      if (!s || !positive(s.dia) || !nonnegative(s.length)) issues.push(`${tag}: invalid shoulder`);
      thread(t,`${tag}.thread`,true);
      if (h && k && s && t && !close(d.overall,h.thickness+k.length+s.length+t.length)) issues.push(`${tag}: length mismatch H+K+S+T`);
      if (k && s && t && !(k.dia > s.dia && s.dia >= t.dia)) issues.push(`${tag}: knurl/shoulder/thread diameters inconsistent`);
    } else if (m.template === 'double-ended') {
      thread(d.threadA,`${tag}.threadA`,true);thread(d.threadB,`${tag}.threadB`,true);
      const c=d.collar;
      if (!c || !positive(c.length) || !['hex','round'].includes(c.shape) || !(c.shape==='hex' ? positive(c.af) : positive(c.dia))) issues.push(`${tag}: invalid collar`);
      if (c && d.threadA && d.threadB && !close(d.overall,d.threadA.length+c.length+d.threadB.length)) issues.push(`${tag}: length mismatch A+C+B`);
    } else {
      thread(d.thread,`${tag}.thread`,false);
      if (!positive(d.height) || !close(d.overall,d.height) || !positive(d.af) || d.af <= d.thread?.dia) issues.push(`${tag}: invalid nut geometry`);
      if (!d.seat || !['cone60','flat-flange'].includes(d.seat.type) || !positive(d.seat.dia) || (d.seat.type==='flat-flange' && !positive(d.seat.thickness))) issues.push(`${tag}: invalid nut seat`);
      if (typeof d.idGroove !== 'boolean') issues.push(`${tag}: idGroove must be boolean`);
    }
  }
  return issues;
}
