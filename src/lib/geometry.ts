/* One geometry derivation shared by the 3D mesh, the SVG drawing, viewer callouts and thumbnails.
   geom(p) turns a record's dimensions into an ordered list of axial segments, so they cannot disagree. */
import type { Product, Thread, ThreadDir, NutDims, FinishKey } from './catalogue';
import { getProduct, dirs, n, thread } from './products';

export type SegKind = 'head' | 'knurl' | 'plain' | 'thread' | 'hex' | 'collar';

/* Fields beyond kind/y0/y1/r are only meaningful for the segment kinds that set them. */
export interface Seg {
  kind: SegKind;
  y0: number;
  y1: number;
  r: number;
  // head
  shape: 'd-flat' | 'round';
  f: number | null;
  c: number;
  // knurl
  rIn: number;
  splines: number;
  taper: number;
  rNext: number;
  // thread
  rMin: number;
  pitch: number;
  dir: ThreadDir;
  tip: 'start' | 'end';
  t: Thread;
  // hex
  af: number;
}

export interface NutGeom {
  af: number;
  H: number;
  rc: number;
  c0: number;
  rB: number;
  t: Thread;
  seat: NutDims['seat'];
  idGroove: boolean;
  rMaj: number;
  rMin: number;
  partNo: string;
  finish: FinishKey;
  seatH: number;
  hex0: number;
  maxR: number;
  y0: number;
}

export interface Geom { L: number; segs: Seg[]; nut?: NutGeom; maxR: number }

const seg = (s: Partial<Seg> & Pick<Seg, 'kind' | 'y0' | 'y1' | 'r'>) => s as Seg;

export function nutGeom(np: Product): NutGeom {
  if (np.template !== 'wheel-nut') throw new Error(`${np.partNo} is not a nut`);
  const d = np.dims, t = d.thread, rB = t.dia / 2 + 0.7;
  const g = {
    af: d.af, H: d.height, rc: d.af / Math.sqrt(3), c0: (d.af / 2) * 0.96, rB, t, seat: d.seat, idGroove: !!d.idGroove,
    rMaj: t.dia / 2 + 0.1, rMin: t.dia / 2 - 0.541 * t.pitch, partNo: np.partNo, finish: np.finish, seatH: 0, hex0: 0, maxR: 0, y0: 0,
  };
  if (d.seat.type === 'cone60') { g.seatH = (d.seat.dia / 2 - rB) / Math.tan(Math.PI / 6); g.hex0 = g.seatH; }
  else { g.seatH = d.seat.thickness; g.hex0 = d.seat.thickness + 1.2; }
  g.maxR = Math.max(g.rc, d.seat.type === 'cone60' ? 0 : d.seat.dia / 2);
  return g;
}

const cache = new WeakMap<Product, Geom>();

export function geom(p: Product): Geom {
  const hit = cache.get(p);
  if (hit) return hit;
  const segs: Seg[] = [];
  const thr = (t: Thread, y0: number, y1: number, tip: 'start' | 'end') =>
    seg({ kind: 'thread', y0, y1, r: t.dia / 2, rMin: t.dia / 2 - 0.6134 * t.pitch * 0.92, pitch: t.pitch, dir: t.dir, tip, t });
  let g: Geom;
  if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const d = p.dims, H = d.head.thickness, K = d.knurl.length, S = d.shoulder.length, T = d.thread.length;
    segs.push(seg({ kind: 'head', y0: 0, y1: H, r: d.head.dia / 2, shape: d.head.shape, f: d.head.shape === 'd-flat' ? d.head.flatAcross! - d.head.dia / 2 : null, c: 0.8 }));
    let y = H;
    segs.push(seg({ kind: 'knurl', y0: y, y1: y + K, r: d.knurl.dia / 2, rIn: d.knurl.dia / 2 - 0.5, splines: d.knurl.splines, taper: Math.min(1.5, K * 0.12), rNext: S > 0 ? d.shoulder.dia / 2 : d.thread.dia / 2 }));
    y += K;
    if (S > 0) { segs.push(seg({ kind: 'plain', y0: y, y1: y + S, r: d.shoulder.dia / 2 })); y += S; }
    segs.push(thr(d.thread, y, y + T, 'end')); y += T;
    g = { L: y, segs, maxR: 0 };
    if (p.template === 'stud-nut') {
      const ng = nutGeom(getProduct(p.assembly.nut)!);
      ng.y0 = H + p.assembly.clampLength;
      g.nut = ng;
    }
  } else if (p.template === 'double-ended') {
    const d = p.dims, A = d.threadA, B = d.threadB, C = d.collar;
    let y = A.length;
    segs.push(thr(A, 0, y, 'start'));
    if (C.shape === 'hex') segs.push(seg({ kind: 'hex', y0: y, y1: y + C.length, af: C.af, r: C.af / Math.sqrt(3) }));
    else segs.push(seg({ kind: 'collar', y0: y, y1: y + C.length, r: C.dia / 2 }));
    y += C.length;
    segs.push(thr(B, y, y + B.length, 'end')); y += B.length;
    g = { L: y, segs, maxR: 0 };
  } else {
    const ng = nutGeom(p);
    ng.y0 = 0;
    g = { L: ng.H, segs: [], nut: ng, maxR: 0 };
  }
  g.maxR = Math.max(0, ...segs.map(s => s.r), g.nut ? g.nut.maxR : 0);
  cache.set(p, g);
  return g;
}

/* Measurement rules. Run as a publish check (see catalogue-check.ts) before a record goes live. */
export function validate(p: Product): string[] {
  const out: string[] = [];
  if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const d = p.dims;
    const s = d.head.thickness + d.knurl.length + d.shoulder.length + d.thread.length;
    if (Math.abs(s - d.overall) > 0.01) out.push(`L ${d.overall} ≠ H+K+S+T (${s})`);
    if (d.knurl.dia <= d.shoulder.dia) out.push('Knurl Ø must exceed shoulder Ø');
    if (d.shoulder.dia < d.thread.dia) out.push('Shoulder Ø below thread Ø');
    if (d.head.shape === 'd-flat' && !(d.head.flatAcross! > d.head.dia / 2 && d.head.flatAcross! < d.head.dia)) out.push('D-flat dimension out of range');
    if (p.template === 'stud-nut') {
      const np = getProduct(p.assembly.nut);
      if (!np || np.template !== 'wheel-nut') out.push('Nut record missing');
      else {
        const a = d.thread, b = np.dims.thread;
        if (a.dia !== b.dia || a.pitch !== b.pitch || a.dir !== b.dir) out.push('Nut thread does not match stud');
        if (d.head.thickness + p.assembly.clampLength + np.dims.height > d.overall) out.push('Nut beyond stud end');
      }
    }
  } else if (p.template === 'double-ended') {
    const d = p.dims, s = d.threadA.length + d.collar.length + d.threadB.length;
    if (Math.abs(s - d.overall) > 0.01) out.push(`L ${d.overall} ≠ A+C+B (${s})`);
  } else if (p.dims.height !== p.dims.overall) out.push('Nut height ≠ overall');
  if (p.name.includes(' RH') && dirs(p).join() === 'LH') out.push('Name says RH, thread is LH');
  if (p.name.includes(' LH') && !dirs(p).includes('LH')) out.push('Name says LH, thread is RH');
  return out;
}

/* Viewer dimension overlay: linear dims (lin) and leader callouts (lead), in axial coordinates. */
export interface LinCallout { t: 'lin'; a: number; b: number; ra: number; rb: number; s: number; lvl: number; label: string; key?: boolean; minor?: boolean }
export interface LeadCallout { t: 'lead'; y: number; r: number; s: number; lvl: number; label: string; key?: boolean; minor?: boolean; dir: number }
export type Callout = LinCallout | LeadCallout;

export function callouts(p: Product): Callout[] {
  const g = geom(p), out: Callout[] = [];
  if (p.template === 'wheel-nut') {
    const ng = g.nut!;
    out.push({ t: 'lin', a: 0, b: ng.H, ra: ng.maxR, rb: ng.rc, s: -1, lvl: 0, label: `H ${n(ng.H)}` });
    out.push({ t: 'lead', y: (ng.hex0 + ng.H) / 2, r: ng.rc, s: 1, lvl: 0, label: `${n(ng.af)} AF`, key: true, dir: 1 });
    out.push({ t: 'lead', y: ng.H, r: (ng.rB + ng.c0) / 2, s: 1, lvl: 1, label: thread(ng.t), dir: -1 });
    out.push({ t: 'lead', y: ng.seatH / 2, r: ng.seat.type === 'cone60' ? (ng.seat.dia / 2 + ng.rB) / 2 : ng.seat.dia / 2, s: -1, lvl: 1, label: ng.seat.type === 'cone60' ? '60° cone seat' : `Ø${n(ng.seat.dia)} flange`, minor: true, dir: -1 });
    return out;
  }
  const head = g.segs.find(s => s.kind === 'head'), kn = g.segs.find(s => s.kind === 'knurl'), hx = g.segs.find(s => s.kind === 'hex' || s.kind === 'collar');
  const ths = g.segs.filter(s => s.kind === 'thread'), te = ths.find(s => s.tip === 'end')!, ts = ths.find(s => s.tip === 'start');
  out.push({ t: 'lin', a: 0, b: g.L, ra: g.segs[0].r, rb: te.rMin, s: 1, lvl: g.nut ? 2 : 1, label: `L ${n(g.L)}`, key: true });
  out.push({ t: 'lin', a: te.y0, b: te.y1, ra: te.r, rb: te.rMin, s: -1, lvl: 0, label: `T ${n(te.y1 - te.y0)}` });
  if (ts) out.push({ t: 'lin', a: ts.y0, b: ts.y1, ra: ts.rMin, rb: ts.r, s: -1, lvl: 0, label: `T ${n(ts.y1 - ts.y0)}` });
  if (head && p.template !== 'double-ended') out.push({ t: 'lead', y: head.y1 * 0.5, r: head.r, s: -1, lvl: 1, label: `Ø${n(p.dims.head.dia)} head`, dir: -1 });
  if (kn) out.push({ t: 'lead', y: (kn.y0 + kn.y1) / 2, r: kn.r, s: -1, lvl: 0, label: `Ø${n(kn.r * 2)} knurl`, minor: true, dir: -1 });
  out.push({ t: 'lead', y: g.nut ? te.y1 - 8 : te.y0 + (te.y1 - te.y0) * 0.62, r: te.r, s: 1, lvl: 0, label: thread(te.t), key: true, dir: 1 });
  if (ts) out.push({ t: 'lead', y: ts.y0 + (ts.y1 - ts.y0) * 0.4, r: ts.r, s: 1, lvl: 0, label: thread(ts.t), key: true, dir: -1 });
  if (hx) out.push({ t: 'lead', y: (hx.y0 + hx.y1) / 2, r: hx.r, s: -1, lvl: 1, label: hx.kind === 'hex' ? `${n(hx.af)} AF collar` : `Ø${n(hx.r * 2)} collar`, dir: 1 });
  if (g.nut) out.push({ t: 'lead', y: g.nut.y0 + g.nut.H / 2, r: g.nut.rc, s: 1, lvl: 1, label: `${g.nut.partNo} · ${n(g.nut.af)} AF`, dir: -1 });
  return out;
}
