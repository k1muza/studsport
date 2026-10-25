import { evidenceFor, evidenceLabel, sourceMeasurements, sourceFor } from './evidence';
/* Lookup and formatting helpers. Reads only catalogue.ts and never contains product facts. */
import {
  products as ALL, vehicles, productTypes, finishes, availability, includes, company,
  type Product, type Thread, type ThreadDir, type Vehicle, type AvailabilityKey,
} from './catalogue';

export const n = (v: number) => String(Math.round(v * 100) / 100);
export const uniq = <T,>(a: T[]) => [...new Set(a)];

export const allProducts = () => ALL;

export function getProduct(key: string | null | undefined): Product | null {
  if (!key) return null;
  const k = String(key).toLowerCase();
  return ALL.find(p => p.slug === k || p.partNo.toLowerCase() === k || p.id === k) || null;
}

export const vehicle = (id: string): Vehicle => vehicles.find(v => v.id === id) || { id, label: id, make: id, model: '' };
export const typeLabel = (p: Product) => productTypes[p.type].label;
export const finishOf = (p: Product) => ({ ...finishes[p.finish], label: finishes[p.finish].label + (p.spec.status === 'illustrative' ? ' (visual finish; unconfirmed)' : '') });
export const href = (p: Product) => `/products/${p.slug}`;
export const sheetHref = (p: Product) => `/products/${p.slug}/spec-sheet`;

export function threadsOf(p: Product): Thread[] {
  if (p.template === 'profiled-fastener') return p.dims.sections.filter(s => s.kind === 'thread' && s.thread).map(s => s.thread!);
  return p.template === 'double-ended' ? [p.dims.threadA, p.dims.threadB] : [p.dims.thread];
}
export function allThreads(p: Product): Thread[] {
  const t = threadsOf(p).slice();
  if (p.template === 'stud-nut') {
    const nut = getProduct(p.assembly.nut);
    if (nut && nut.template === 'wheel-nut') t.push(nut.dims.thread);
  }
  return t;
}
export const thread = (t: Thread) => `M${t.dia} × ${t.pitch}${t.dir === 'UNSPECIFIED' ? ' (hand unconfirmed)' : ' '+t.dir}`;
export const threadShort = (t: Thread) => `M${t.dia}×${t.pitch}${t.dir === 'UNSPECIFIED' ? ' · hand TBC' : ' '+t.dir}`;
export const dirLong = (d: ThreadDir) => (d === 'LH' ? 'Left-hand (LH)' : d === 'RH' ? 'Right-hand (RH)' : 'Handedness unconfirmed');
export function threadLabel(p: Product) {
  const ts = threadsOf(p);
  if (ts.length === 2) {
    const a = thread(ts[0]), b = thread(ts[1]);
    return a === b ? a + ', both ends' : `${a} / ${b}`;
  }
  return thread(ts[0]);
}
export const sizes = (p: Product) => uniq(allThreads(p).map(t => 'M' + t.dia));
export const dirs = (p: Product) => uniq(allThreads(p).map(t => t.dir));
export const isLH = (p: Product) => dirs(p).includes('LH');
export const vehiclesOf = (p: Product) => uniq(p.applications.map(a => a.vehicle));
export const appsLabel = (p: Product) =>
  uniq(p.applications.map(a => { const v = vehicle(a.vehicle); return v.model ? v.label : `${v.label} ${a.model}`; })).join(' · ');

export const AVAIL_COLOR: Record<AvailabilityKey, string> = {
  'in-stock': 'oklch(0.72 0.14 150)',
  'on-request': 'oklch(0.80 0.13 85)',
  confirm: '#9aa1a7',
};
export function avail(p: Product) {
  const a = availability[p.availability];
  return { key: p.availability, label: a.label, note: p.fulfilment || a.note, color: AVAIL_COLOR[p.availability] };
}
export const price = (p: Product) => (p.price ? `$${p.price.amount.toFixed(2)}` : null);
export const priceLabel = (p: Product) => (p.price ? `${price(p)} ${p.price.unit}` : 'Price on quote');
export const related = (p: Product) => (p.related || []).map(getProduct).filter((q): q is Product => !!q);
export const variants = (p: Product) => (p.variantGroup ? ALL.filter(q => q.variantGroup === p.variantGroup) : [p]);
export const whatsapp = (p?: Product | null, qty?: number) =>
  company.whatsappLink + '?text=' + encodeURIComponent(`Hi StudSport, I'd like a quote for ${p ? p.partNo + ' (' + p.name + ')' : 'a part'}${qty ? ' × ' + qty : ''}.`);

export interface KV { k: string; v: string }

export function keyDims(p: Product): KV[] {
  if (p.template === 'profiled-fastener') return [{k:'Model L',v:n(p.dims.overall)}, {k:'Thread',v:threadShort(threadsOf(p)[0])}, {k:'Data',v:p.spec.status === 'pending' ? 'Supplier-declared' : 'Illustrative'}];
  if (p.template === 'wheel-nut') {
    const d = p.dims;
    return [{ k: 'Thread', v: threadShort(d.thread) }, { k: 'AF', v: n(d.af) }, { k: 'Seat', v: d.seat.type === 'cone60' ? '60° cone' : 'Flange' }];
  }
  if (p.template === 'double-ended') {
    const d = p.dims;
    return [{ k: 'L', v: n(d.overall) }, { k: 'Ends', v: `M${d.threadA.dia}/M${d.threadB.dia}` }, { k: 'Collar', v: d.collar.shape === 'hex' ? d.collar.af + ' AF' : 'Ø' + d.collar.dia }];
  }
  const d = p.dims;
  return [{ k: 'L', v: n(d.overall) }, { k: 'Thread', v: threadShort(d.thread) }, { k: 'Head', v: 'Ø' + n(d.head.dia) }];
}

const nutSeat = (s: { type: string; dia: number; thickness?: number }, withThickness: boolean) =>
  s.type === 'cone60' ? `60° cone, Ø${n(s.dia)}` : withThickness ? `Flat, Ø${n(s.dia)} × ${n(s.thickness!)} flange` : `Flat, Ø${n(s.dia)} flange`;

export function keySpecs(p: Product): KV[] {
  const F = finishOf(p).label, out: KV[] = [];
  if (p.template === 'profiled-fastener') {
    out.push({k:'Overall model length L',v:`${n(p.dims.overall)} mm (render only)`});
    const req = evidenceFor(p.partNo)?.requirement;
    if(req) out.push({k:'Requested nominal length',v:`${req.nominalLengthMm} mm · length basis unresolved`});
    out.push({k:'Thread',v:uniq(threadsOf(p).map(thread)).join(' / ')});
    out.push({k:'Source',v:evidenceLabel(p.partNo)});
    out.push({k:'Geometry',v:p.dims.sections.some(s=>s.basis==='schematic') ? 'Contains schematic regions' : 'Supplier dimensions; transitions simplified'});
    return out;
  }
  if (p.template === 'wheel-nut') {
    const d = p.dims;
    out.push({ k: 'Thread', v: `M${d.thread.dia} × ${d.thread.pitch}` }, { k: 'Direction', v: dirLong(d.thread.dir) }, { k: 'Across flats', v: `${n(d.af)} mm` }, { k: 'Height', v: `${n(d.height)} mm` },
      { k: 'Seat', v: nutSeat(d.seat, false) }, { k: 'LH identification', v: d.idGroove ? 'Groove on hex corners' : '—' }, { k: 'Finish', v: F });
    return out;
  }
  if (p.template === 'double-ended') {
    const d = p.dims, a = d.threadA, b = d.threadB;
    out.push({ k: 'Overall length L', v: `${n(d.overall)} mm` }, { k: 'Thread', v: `M${a.dia} × ${a.pitch} / M${b.dia} × ${b.pitch}` }, { k: 'Direction', v: a.dir === b.dir ? dirLong(a.dir) : `${a.dir} / ${b.dir}` },
      { k: 'Threaded length T', v: `${n(a.length)} / ${n(b.length)} mm` }, { k: 'Collar', v: d.collar.shape === 'hex' ? `${n(d.collar.af)} AF hex × ${n(d.collar.length)}` : `Ø${n(d.collar.dia)} × ${n(d.collar.length)}` },
      { k: 'Position', v: p.positions.join(' & ') }, { k: 'Finish', v: F });
    return out;
  }
  const d = p.dims;
  out.push({ k: 'Overall length L', v: `${n(d.overall)} mm` }, { k: 'Thread', v: `M${d.thread.dia} × ${d.thread.pitch}` }, { k: 'Direction', v: dirLong(d.thread.dir) },
    { k: 'Threaded length T', v: `${n(d.thread.length)} mm` }, { k: 'Knurl', v: `Ø${n(d.knurl.dia)} × ${n(d.knurl.length)} mm` }, { k: 'Head', v: `Ø${n(d.head.dia)} ${d.head.shape === 'd-flat' ? 'D-flat' : 'round'}` }, { k: 'Position', v: p.positions.join(' & ') });
  if (p.template === 'stud-nut') {
    const np = getProduct(p.assembly.nut);
    if (np && np.template === 'wheel-nut') out.push({ k: 'Nut', v: `${np.partNo}, ${n(np.dims.af)} AF` });
  }
  out.push({ k: 'Finish', v: F });
  return out;
}

export interface SpecGroup { group: string; rows: KV[] }

export function specGroups(p: Product): SpecGroup[] {
  const groups: { group: string; rows: [string, string][] }[] = [];
  groups.push({ group: 'General', rows: [['Part number', p.partNo], ['Product type', typeLabel(p)], ['Supplied as', includes[p.includes]], ['Position', p.positions.join(' & ')]] });
  if (p.template === 'profiled-fastener') {
    const declared = sourceMeasurements(p.partNo);
    if (declared.length) groups.push({group:'Source measurements (supplier-declared)',rows:declared.map(m=>[m.label,`${m.value}${m.basis==='derived' ? ' · calculated interpretation' : ''}`] as [string,string])});
    groups.push({group:'Rendering',rows:[['Model length',`${n(p.dims.overall)} mm · not a manufacturing specification`],['Local profile','Estimated transitions and spline teeth are for display only']]});
    groups.push({group:'Outstanding checks',rows:p.dims.uncertainties.map((issue,i)=>[`Issue ${i+1}`,issue] as [string,string])});
  } else if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const d = p.dims, H = d.head.thickness;
    groups.push({ group: 'Illustrative dimensions (mm)', rows: [
      ['Overall length L (incl. head)', n(d.overall)], ['Length under head Lu', n(d.overall - H)],
      ['Head Ø × thickness H', `${n(d.head.dia)} × ${n(H)}`], ['Head form', d.head.shape === 'd-flat' ? `D-flat, ${n(d.head.flatAcross!)} across flat` : 'Round'],
      ['Knurl Ø × length K', `${n(d.knurl.dia)} × ${n(d.knurl.length)}`], ['Knurl splines', String(d.knurl.splines)],
      ['Shoulder Ø × length S', `${n(d.shoulder.dia)} × ${n(d.shoulder.length)}`], ['Threaded length T', n(d.thread.length)],
      ['Check: H + K + S + T', `${n(H)} + ${n(d.knurl.length)} + ${n(d.shoulder.length)} + ${n(d.thread.length)} = ${n(H + d.knurl.length + d.shoulder.length + d.thread.length)}`]] });
    groups.push({ group: 'Thread', rows: [['Size', `M${d.thread.dia} × ${d.thread.pitch}`], ['Direction', dirLong(d.thread.dir)], ['Tolerance class', d.thread.cls]] });
    if (p.template === 'stud-nut') {
      const np = getProduct(p.assembly.nut);
      if (np && np.template === 'wheel-nut') {
        const nd = np.dims;
        groups.push({ group: `Illustrative nut pairing · ${np.partNo}`, rows: [['Thread', thread(nd.thread)], ['Across flats', `${n(nd.af)} mm`], ['Height', `${n(nd.height)} mm`], ['Seat', nutSeat(nd.seat, true)], ['Finish', finishes[np.finish].label], ['Clamp length shown (reference)', `${n(p.assembly.clampLength)} mm`]] });
      }
    }
  } else if (p.template === 'double-ended') {
    const d = p.dims, a = d.threadA, b = d.threadB, c = d.collar;
    groups.push({ group: 'Illustrative dimensions (mm)', rows: [['Overall length L', n(d.overall)], [`End A length (${a.role})`, n(a.length)], ['Collar length C', n(c.length)], [`End B length (${b.role})`, n(b.length)],
      ['Collar', c.shape === 'hex' ? `Hex, ${n(c.af)} AF` : `Round, Ø${n(c.dia)}`], ['Check: A + C + B', `${n(a.length)} + ${n(c.length)} + ${n(b.length)} = ${n(a.length + c.length + b.length)}`]] });
    groups.push({ group: 'Thread', rows: [[`End A · ${a.role}`, `${thread(a)} · ${a.cls}`], [`End B · ${b.role}`, `${thread(b)} · ${b.cls}`]] });
  } else {
    const d = p.dims;
    groups.push({ group: 'Illustrative dimensions (mm)', rows: [['Across flats', n(d.af)], ['Across corners (ref.)', n(d.af / Math.cos(Math.PI / 6))], ['Height', n(d.height)], ['Seat', d.seat.type === 'cone60' ? `60° cone, Ø${n(d.seat.dia)}` : `Flat flange, Ø${n(d.seat.dia)} × ${n(d.seat.thickness)}`]] });
    groups.push({ group: 'Thread', rows: [['Size', `M${d.thread.dia} × ${d.thread.pitch}`], ['Direction', dirLong(d.thread.dir)], ['Tolerance class', d.thread.cls], ['LH identification', d.idGroove ? 'Groove around hex corners' : '—']] });
  }
  const evidence = evidenceFor(p.partNo);
  if(evidence) {
    if(evidence.requirement) groups.push({group:'Sourcing requirement (not a physical part specification)',rows:[
      ['Nominal request',`M${evidence.requirement.diameterMm} × ${evidence.requirement.pitchMm} × ${evidence.requirement.nominalLengthMm}`],
      ['Length basis','Unresolved; do not equate nominal and overall length'],
      ['Handed variants','LH and RH requested separately; neither confirmed for this reference']
    ]});
    if(evidence.declaredDimensions.length) groups.push({group:'Manufacturer reference only',rows:evidence.declaredDimensions.map(d=>[d.label,`${d.value} · ${d.scope}`] as [string,string])});
    if(evidence.references.length) groups.push({group:'Candidate references · interchangeability unproven',rows:evidence.references.map(r=>[r.value,sourceFor(r.sourceId)?.issuer || r.sourceId] as [string,string])});
    groups.push({group:'Identification evidence',rows:[['Status',evidenceLabel(p.partNo)],['Assessment',evidence.uncertainties.join(' ')]]});
  }
  groups.push({ group: 'Material & finish', rows: [['Material', p.material], ['Property class', p.grade], ['Finish', finishOf(p).label]] });
  groups.push({ group: 'Data', rows: [['Specification revision', p.spec.status === 'pending' ? 'Supplier revision not supplied · imported '+p.spec.date : `Rev ${p.spec.revision} · ${p.spec.date}`], ['Data status', evidenceLabel(p.partNo)]] });
  return groups.map(g => ({ group: g.group, rows: g.rows.map(r => ({ k: r[0], v: r[1] })) }));
}

export interface CompareRow { k: string; cells: { v: string; diff: boolean; self: boolean }[] }

export function compare(p: Product, list: Product[]): CompareRow[] {
  const specs = list.map(q => keySpecs(q));
  const keys = uniq(specs.flat().map(s => s.k));
  const val = (i: number, k: string) => (specs[i].find(s => s.k === k) || { v: '—' }).v;
  const me = list.indexOf(p);
  return keys
    .map(k => ({ k, cells: list.map((_, i) => ({ v: val(i, k), diff: i !== me && val(i, k) !== val(me, k), self: i === me })) }))
    .filter(r => new Set(r.cells.map(c => c.v)).size > 1 || ['Thread', 'Overall length L'].includes(r.k));
}

function hay(p: Product) {
  return [p.name, p.partNo, p.partNo.replace('-', ''), typeLabel(p), p.summary, evidenceFor(p.partNo)?.familyId,
    ...(evidenceFor(p.partNo)?.references.map(r=>r.value) || []), ...(evidenceFor(p.partNo)?.aliases || []),
    ...p.applications.map(a => { const v = vehicle(a.vehicle); return `${v.label} ${v.make} ${a.model}`; }),
    ...allThreads(p).map(t => `m${t.dia}x${t.pitch} m${t.dia} ${t.dir} ${t.dir === 'LH' ? 'left-hand left hand' : t.dir === 'RH' ? 'right-hand right hand' : 'hand unconfirmed'}`)]
    .join(' ').toLowerCase().replace(/×/g, 'x');
}

export function search(q: string, list: Product[] = ALL): Product[] {
  const toks = String(q || '').toLowerCase().replace(/×/g, 'x').replace(/\s*x\s*(?=\d)/g, 'x').split(/\s+/).filter(Boolean);
  return toks.length ? list.filter(p => { const h = hay(p); return toks.every(t => h.includes(t)); }) : list;
}
