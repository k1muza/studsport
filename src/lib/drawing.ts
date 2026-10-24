/* Dimensioned engineering drawing (SVG string) generated from geom(p).
   Views: side, View A (head end / end A), View B (tip end / end B); nuts get side + end view. */
import type { Product } from './catalogue';
import { geom, type Seg, type NutGeom } from './geometry';
import { n, thread } from './products';

export const MONO = "'Martian Mono', ui-monospace, Menlo, Consolas, monospace";
export const ACC = 'oklch(0.68 0.17 45)';
const TAU = Math.PI * 2;

export interface DrawingOptions {
  layout?: 'wide' | 'stack';
  theme?: 'light' | 'dark';
  fs?: number;
  labels?: 'values' | 'generic';
  views?: 'all' | 'side';
  dims?: boolean;
  grid?: boolean;
  bg?: string | null;
}

type BBox = [number, number, number, number];
type Pt = [number, number];

export function drawingSVG(p: Product, opts?: DrawingOptions) {
  const o = { layout: 'wide', theme: 'light', fs: 3.2, labels: 'values', views: 'all', dims: true, grid: false, bg: null as string | null, ...opts };
  const g = geom(p), fs = o.fs, gen = o.labels === 'generic';
  const th = o.theme === 'dark'
    ? { ink: '#d9dcde', dim: '#aab1b7', thin: '#7f878e', bg: o.bg || '#17191c', cap: '#8b9298', grid: 'rgba(255,255,255,0.045)', acc: ACC }
    : { ink: '#15171a', dim: '#353c43', thin: '#59616a', bg: o.bg || '#ffffff', cap: '#5c646b', grid: 'rgba(21,23,26,0.07)', acc: 'oklch(0.55 0.16 45)' };
  const Wk = Math.max(0.4, fs * 0.15), Wt = Math.max(0.15, fs * 0.055);
  const esc = (s: string | number) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const f2 = (v: number) => +v.toFixed(2);
  const tw = (s: string) => String(s).length * fs * 0.7;

  const mkView = () => {
    const s: string[] = [];
    const bb: BBox = [Infinity, Infinity, -Infinity, -Infinity];
    const ext = (x: number, y: number) => { if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; };
    const line = (x1: number, y1: number, x2: number, y2: number, w?: number, col?: string, dash?: string) => {
      ext(x1, y1); ext(x2, y2);
      s.push(`<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`);
    };
    const poly = (pts: Pt[], w?: number, col?: string, fill?: string) => {
      pts.forEach(q => ext(q[0], q[1]));
      s.push(`<polygon points="${pts.map(q => f2(q[0]) + ',' + f2(q[1])).join(' ')}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}" stroke-linejoin="round"/>`);
    };
    const circle = (r: number, w?: number, col?: string, fill?: string, dash?: string) => {
      ext(-r, -r); ext(r, r);
      s.push(`<circle cx="0" cy="0" r="${f2(r)}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    };
    const path = (d: string, w: number, col: string, fill: string, r: number) => {
      ext(-r, -r); ext(r, r);
      s.push(`<path d="${d}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}" stroke-linejoin="round"/>`);
    };
    const hexagon = (rc: number, fill: string) => poly([0, 1, 2, 3, 4, 5].map(k => { const a = Math.PI / 2 + (k * Math.PI) / 3; return [rc * Math.cos(a), rc * Math.sin(a)] as Pt; }), Wk, th.ink, fill);
    const dshape = (r: number, f: number, fill: string) => { const w = Math.sqrt(r * r - f * f); path(`M${f2(-w)},${f2(-f)} L${f2(w)},${f2(-f)} A${f2(r)},${f2(r)} 0 1 1 ${f2(-w)},${f2(-f)} Z`, Wk, th.ink, fill, r); };
    const arc34 = (r: number, w?: number) => path(`M${f2(r)},0 A${f2(r)},${f2(r)} 0 1 1 0,${f2(-r)}`, w || Wt, th.thin, 'none', r);
    const text = (x: number, y: number, str: string, anchor?: 'start' | 'middle' | 'end', rot?: number, size?: number, col?: string, weight?: number) => {
      size = size || fs; anchor = anchor || 'middle';
      const w = String(str).length * size * 0.7;
      const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      if (rot) { ext(x - size, y - w / 2); ext(x + size * 0.3, y + w / 2); } else { ext(x0, y - size); ext(x0 + w, y + size * 0.3); }
      s.push(`<text x="${f2(x)}" y="${f2(y)}" font-family="${MONO.replace(/'/g, '')}" style="font-family:var(--font-mono),${MONO}" font-size="${f2(size)}" font-weight="${weight || 400}" fill="${col || th.ink}" text-anchor="${anchor}"${rot ? ` transform="rotate(${rot} ${f2(x)} ${f2(y)})"` : ''} paint-order="stroke" stroke="${o.bg === 'none' ? 'none' : th.bg}" stroke-width="${f2(size * 0.5)}" stroke-linejoin="round">${esc(str)}</text>`);
    };
    const arrow = (x: number, y: number, dx: number, dy: number) => {
      const a = fs * 0.85, b = fs * 0.2, px = -dy, py = dx;
      s.push(`<path d="M${f2(x)},${f2(y)} L${f2(x - dx * a + px * b)},${f2(y - dy * a + py * b)} L${f2(x - dx * a - px * b)},${f2(y - dy * a - py * b)} Z" fill="${th.dim}"/>`);
    };
    const cl = (x1: number, y1: number, x2: number, y2: number) => line(x1, y1, x2, y2, Wt, th.thin, `${f2(fs * 2.2)} ${f2(fs * 0.45)} ${f2(fs * 0.3)} ${f2(fs * 0.45)}`);
    const dimH = (x1: number, x2: number, y: number, label: string, fa: number, fb: number, sub?: string | null) => {
      const gp = fs * 0.35, ov = fs * 0.5, a = fs * 0.85;
      ([[x1, fa], [x2, fb]] as Pt[]).forEach(([x, f]) => { const sg = y < f ? -1 : 1; line(x, f + sg * gp, x, y + sg * ov, Wt, th.dim); });
      if (x2 - x1 >= a * 2.4) { line(x1, y, x2, y, Wt, th.dim); arrow(x1, y, -1, 0); arrow(x2, y, 1, 0); }
      else { line(x1 - a * 1.8, y, x2 + a * 1.8, y, Wt, th.dim); arrow(x1, y, 1, 0); arrow(x2, y, -1, 0); }
      text((x1 + x2) / 2, y - fs * 0.45, label);
      if (sub) text((x1 + x2) / 2, y + fs * 1.15, sub, 'middle', 0, fs * 0.82, th.cap);
    };
    const dimV = (x: number, y1: number, y2: number, label: string, fa: number, fb: number) => {
      const gp = fs * 0.35, ov = fs * 0.5, a = fs * 0.85;
      ([[y1, fa], [y2, fb]] as Pt[]).forEach(([y, f]) => { const sg = x < f ? -1 : 1; line(f + sg * gp, y, x + sg * ov, y, Wt, th.dim); });
      if (y2 - y1 >= a * 2.4) { line(x, y1, x, y2, Wt, th.dim); arrow(x, y1, 0, -1); arrow(x, y2, 0, 1); }
      else { line(x, y1 - a * 1.8, x, y2 + a * 1.8, Wt, th.dim); arrow(x, y1, 0, 1); arrow(x, y2, 0, -1); }
      text(x - fs * 0.45, (y1 + y2) / 2, label, 'middle', -90);
    };
    const leader = (x0: number, y0: number, x1: number, y1: number, label: string, dir: number) => {
      const dx = x0 - x1, dy = y0 - y1, l = Math.hypot(dx, dy) || 1;
      line(x1, y1, x0, y0, Wt, th.dim); arrow(x0, y0, dx / l, dy / l);
      const lw = tw(label) + fs * 0.8; line(x1, y1, x1 + dir * lw, y1, Wt, th.dim);
      text(x1 + dir * fs * 0.4, y1 - fs * 0.4, label, dir > 0 ? 'start' : 'end');
    };
    return { s, bb, line, poly, circle, hexagon, dshape, arc34, text, cl, dimH, dimV, leader };
  };
  type View = ReturnType<typeof mkView>;

  const cont = (s: Seg, top: boolean): Pt[] => {
    switch (s.kind) {
      case 'head': return top && s.f != null ? [[s.y0, s.f], [s.y1, s.f]] : [[s.y0, s.r - s.c], [s.y0 + s.c, s.r], [s.y1 - 0.4, s.r], [s.y1, s.r - 0.4]];
      case 'knurl': return [[s.y0, s.r], [s.y1 - s.taper, s.r], [s.y1, s.rNext]];
      case 'plain': return [[s.y0, s.r], [s.y1, s.r]];
      case 'collar': return [[s.y0, s.r - 0.6], [s.y0 + 0.6, s.r], [s.y1 - 0.6, s.r], [s.y1, s.r - 0.6]];
      case 'hex': { const c0 = (s.af / 2) * 0.96, ch = (s.r - c0) / 1.732; return [[s.y0, c0], [s.y0 + ch, s.r], [s.y1 - ch, s.r], [s.y1, c0]]; }
      case 'thread': { const c = s.r - (s.rMin - 0.25); return s.tip === 'end' ? [[s.y0, s.r], [s.y1 - c, s.r], [s.y1, s.r - c]] : [[s.y0, s.r - c], [s.y0 + c, s.r], [s.y1, s.r]]; }
    }
  };

  const nutSide = (V: View, ng: NutGeom, x0: number, hidden: boolean) => {
    const H = ng.H, rc = ng.rc, c0 = ng.c0, ch = (rc - c0) / 1.732;
    let top: Pt[];
    if (ng.seat.type === 'cone60') top = [[x0, ng.rB], [x0 + ng.seatH, ng.seat.dia / 2], [x0 + ng.seatH, c0], [x0 + ng.seatH + ch, rc], [x0 + H - ch, rc], [x0 + H, c0]];
    else { const fR = ng.seat.dia / 2, t = ng.seat.thickness; top = [[x0, fR - 0.5], [x0 + 0.5, fR], [x0 + t, fR], [x0 + ng.hex0, rc], [x0 + H - ch, rc], [x0 + H, c0]]; }
    V.poly(top.map(q => [q[0], -q[1]] as Pt).concat(top.slice().reverse()), Wk, th.ink, o.bg === 'none' ? 'none' : th.bg);
    const hx0 = x0 + ng.hex0;
    V.line(hx0 + ch * 0.5, -rc / 2, x0 + H - ch * 0.5, -rc / 2); V.line(hx0 + ch * 0.5, rc / 2, x0 + H - ch * 0.5, rc / 2);
    if (ng.seat.type === 'cone60') V.line(x0 + ng.seatH, -c0, x0 + ng.seatH, c0);
    else { V.line(x0 + ng.seat.thickness, -ng.seat.dia / 2, x0 + ng.seat.thickness, ng.seat.dia / 2); V.line(hx0, -rc, hx0, rc, Wt, th.thin); }
    if (ng.idGroove) {
      const m = x0 + (hx0 - x0 + H) / 2;
      [-0.6, 0.6].forEach(dx => {
        V.line(m + dx, -rc, m + dx, -rc + 1.2, Wt, th.ink); V.line(m + dx, rc, m + dx, rc - 1.2, Wt, th.ink);
        V.line(m + dx, -rc / 2 - 0.6, m + dx, -rc / 2 + 0.6, Wt, th.ink); V.line(m + dx, rc / 2 - 0.6, m + dx, rc / 2 + 0.6, Wt, th.ink);
      });
    }
    if (hidden) {
      const dash = `${f2(fs * 0.9)} ${f2(fs * 0.45)}`;
      [ng.rMin, ng.rMaj].forEach((r, i) => { V.line(x0, -r, x0 + H, -r, i ? Wt : Wk * 0.7, th.thin, dash); V.line(x0, r, x0 + H, r, i ? Wt : Wk * 0.7, th.thin, dash); });
    }
  };

  const L = (k: string, v: string) => (gen ? k : v);

  const sideView = () => {
    const V = mkView();
    if (!g.segs.length) {
      const ng = g.nut!;
      nutSide(V, ng, 0, true); V.cl(-fs * 1.4, 0, ng.H + fs * 1.4, 0);
      if (o.dims) {
        V.dimH(0, ng.H, ng.maxR + fs * 2.4, L('H', n(ng.H)), ng.maxR, ng.rc);
        if (ng.seat.type === 'cone60') V.dimV(-fs * 2.6, -ng.seat.dia / 2, ng.seat.dia / 2, L('Øs', 'Ø' + n(ng.seat.dia)), ng.seatH, ng.seatH);
        else V.dimV(-fs * 2.6, -ng.seat.dia / 2, ng.seat.dia / 2, L('Øf', 'Ø' + n(ng.seat.dia)), 0.5, 0.5);
        V.dimH(0, ng.seatH, -(ng.maxR + fs * 2.4), L('s', n(ng.seatH)), -(ng.seat.type === 'cone60' ? ng.rB : ng.seat.dia / 2), -(ng.seat.dia / 2));
      }
      return V;
    }
    const segs = g.segs, Lt = g.L;
    const top: Pt[] = [], bot: Pt[] = [];
    segs.forEach(s => { top.push(...cont(s, true)); bot.push(...cont(s, false)); });
    V.poly(top.map(q => [q[0], -q[1]] as Pt).concat(bot.slice().reverse()), Wk, th.ink, o.bg === 'none' ? 'none' : th.bg);
    segs.forEach((s, i) => {
      const t = cont(s, true), b = cont(s, false), nx = segs[i + 1];
      if (nx) { const nt = cont(nx, true), nb = cont(nx, false); V.line(s.y1, -Math.max(t[t.length - 1][1], nt[0][1]), s.y1, Math.max(b[b.length - 1][1], nb[0][1])); }
      if (s.kind === 'head') V.line(s.y0 + s.c, -(s.f != null ? s.f : s.r), s.y0 + s.c, s.r);
      if (s.kind === 'knurl' && s.splines > 0) {
        const x2 = s.y1 - s.taper; V.line(x2, -s.r, x2, s.r);
        const step = Math.max(2, Math.round(s.splines / 14));
        for (let k = 1; (k * step * TAU) / s.splines < Math.PI - 0.05; k++) { const yy = s.r * Math.cos((k * step * TAU) / s.splines); V.line(s.y0 + 0.3, yy, x2 - 0.3, yy, Wt, th.thin); }
      }
      if (s.kind === 'thread') {
        const c = s.r - (s.rMin - 0.25), xr = s.tip === 'end' ? s.y0 : s.y1, xt = s.tip === 'end' ? s.y1 - c : s.y0 + c;
        V.line(xt, -s.r, xt, s.r);
        V.line(Math.min(xr, xt), -s.rMin, Math.max(xr, xt), -s.rMin, Wt, th.thin); V.line(Math.min(xr, xt), s.rMin, Math.max(xr, xt), s.rMin, Wt, th.thin);
      }
      if (s.kind === 'hex') { const ch = (s.r - (s.af / 2) * 0.96) / 1.732; V.line(s.y0 + ch, -s.r / 2, s.y1 - ch, -s.r / 2); V.line(s.y0 + ch, s.r / 2, s.y1 - ch, s.r / 2); }
      if (s.kind === 'collar') { V.line(s.y0 + 0.6, -s.r, s.y0 + 0.6, s.r, Wt, th.thin); V.line(s.y1 - 0.6, -s.r, s.y1 - 0.6, s.r, Wt, th.thin); }
    });
    if (g.nut) nutSide(V, g.nut, g.nut.y0, false);
    V.cl(-fs * 1.4, 0, Lt + fs * 1.4, 0);
    if (!o.dims) return V;
    const maxTop = Math.max(...top.map(q => q[1]), g.nut ? g.nut.maxR : 0), maxBot = Math.max(...bot.map(q => q[1]), g.nut ? g.nut.maxR : 0);
    const head = segs.find(s => s.kind === 'head');
    const yTip = -top[top.length - 1][1];
    let ya = -(maxTop + fs * 2.4);
    if (g.nut) { V.dimH(g.nut.y0, g.nut.y0 + g.nut.H, ya, L('Hn', n(g.nut.H)), -g.nut.maxR, -g.nut.c0, null); ya -= fs * 2.8; }
    if (head && head.y0 === 0) { V.dimH(head.y1, Lt, ya, L('Lu', 'Lu ' + n(Lt - head.y1)), -(head.f != null ? head.f : head.r), yTip); ya -= fs * 2.8; }
    V.dimH(0, Lt, ya, L('L', 'L ' + n(Lt)), -top[0][1], yTip);
    const yb = maxBot + fs * 2.4;
    const letters: Partial<Record<Seg['kind'], string>> = { head: 'H', knurl: 'K', plain: 'S', hex: 'C', collar: 'C' };
    segs.forEach((s, i) => {
      // Schematic section lengths are NOT supplier dimensions; do not put false
      // precision into the drawing's dimension chain.
      if (p.template === 'profiled-fastener' && s.basis === 'schematic') return;
      const b = cont(s, false), pv = segs[i - 1], nx = segs[i + 1];
      const fa = Math.max(b[0][1], pv ? cont(pv, false).slice(-1)[0][1] : 0), fb = Math.max(b[b.length - 1][1], nx ? cont(nx, false)[0][1] : 0);
      const letter = s.kind === 'thread' ? (segs.length === 3 && p.template === 'double-ended' ? (s.tip === 'start' ? 'A' : 'B') : 'T') : letters[s.kind]!;
      V.dimH(s.y0, s.y1, yb, gen ? letter : n(s.y1 - s.y0), fa, fb, gen ? null : letter);
    });
    segs.filter(s => s.kind === 'thread').forEach(s => {
      const c = s.r - (s.rMin - 0.25), lab = L('Ød×P', `M${s.t.dia}×${s.t.pitch} ${s.t.dir}`);
      if (s.tip === 'end') V.dimV(Lt + fs * 2.6, -s.r, s.r, lab, s.y1 - c, s.y1 - c);
      else V.dimV(-fs * 2.6 - fs * 1.1, -s.r, s.r, lab, c, c);
    });
    if (gen) {
      const kn = segs.find(s => s.kind === 'knurl');
      if (kn) V.leader((kn.y0 + kn.y1) / 2, -kn.r, (kn.y0 + kn.y1) / 2 - fs * 2, -maxTop - fs * 0.9, 'Øk', -1);
      if (head) V.dimV(-fs * 2.6, -head.r, head.r, 'Øh', 0.4, 0.4);
    }
    return V;
  };

  const endView = (from: 'start' | 'end') => {
    const V = mkView(), fill = o.bg === 'none' ? 'none' : th.bg;
    const items: { s?: Seg; nut?: NutGeom; near: number }[] = [];
    g.segs.forEach(s => items.push({ s, near: from === 'end' ? s.y1 : -s.y0 }));
    if (g.nut) items.push({ nut: g.nut, near: from === 'end' ? g.nut.y0 + g.nut.H : -g.nut.y0 });
    items.sort((a, b) => a.near - b.near);
    const dash = `${f2(fs * 0.6)} ${f2(fs * 0.4)}`;
    items.forEach(it => {
      if (it.nut) {
        const ng = it.nut;
        if (from === 'start' && ng.seat.type !== 'cone60') V.circle(ng.seat.dia / 2, Wk, th.ink, fill);
        V.hexagon(ng.rc, fill); V.circle(ng.c0, Wk, th.ink, 'none');
        if (!g.segs.length) { V.circle(ng.rMin, Wk, th.ink, fill); V.arc34(ng.rMaj, Wt); }
        return;
      }
      const s = it.s!;
      if (s.kind === 'head') {
        if (s.shape === 'double-flat') {
          const f = s.f!, w = Math.sqrt(s.r * s.r - f * f);
          V.poly([[-f,-w],[-f,w],[f,w],[f,-w]], Wk, th.ink, fill); // schematic two-flat silhouette
        } else if (s.f != null) V.dshape(s.r, s.f, fill);
        else { V.circle(s.r, Wk, th.ink, fill); V.circle(s.r - s.c, Wt, th.thin); }
      }
      else if (s.kind === 'knurl') { V.circle(s.r, Wk, th.ink, fill); V.circle(s.rIn, Wt, th.thin, 'none', dash); }
      else if (s.kind === 'plain' || s.kind === 'collar') V.circle(s.r, Wk, th.ink, fill);
      else if (s.kind === 'hex') { V.hexagon(s.r, fill); V.circle((s.af / 2) * 0.96, Wk, th.ink, 'none'); }
      else if (s.kind === 'thread') { V.circle(s.r, Wk, th.ink, fill); if ((from === 'end' && s.tip === 'end') || (from === 'start' && s.tip === 'start')) V.arc34(s.rMin, Wt); }
    });
    const R = g.maxR;
    V.cl(-R - fs, 0, R + fs, 0); V.cl(0, -R - fs, 0, R + fs);
    if (!o.dims) return V;
    const yb = R + fs * 2.4;
    const near = items[items.length - 1];
    if (!g.segs.length) {
      const ng = g.nut!;
      V.dimH(-ng.af / 2, ng.af / 2, ng.rc + fs * 2.4, `${n(ng.af)} AF`, ng.rc / 2, ng.rc / 2);
      const a = -Math.PI / 4;
      V.leader(ng.rMaj * Math.cos(a), ng.rMaj * Math.sin(a), ng.rc + fs * 0.8, -ng.rc - fs * 0.8, `${thread(ng.t)} - ${ng.t.cls}`, 1);
    } else if (from === 'start') {
      const s = near.s;
      if (s && s.kind === 'head' && s.basis !== 'schematic') {
        V.dimH(-s.r, s.r, yb, 'Ø' + n(s.r * 2), 0, 0);
        if (s.f != null) { const w = Math.sqrt(s.r * s.r - s.f * s.f); V.dimV(-R - fs * 2.4, -s.f, s.shape === 'double-flat' ? s.f : s.r, n(s.shape === 'double-flat' ? 2*s.f : s.f + s.r), -w, 0); }
      }
      const hx = g.segs.find(q => q.kind === 'hex'), co = g.segs.find(q => q.kind === 'collar');
      if (hx) V.dimH(-hx.af / 2, hx.af / 2, yb, `${n(hx.af)} AF`, hx.r / 2, hx.r / 2);
      if (co) V.dimH(-co.r, co.r, yb, 'Ø' + n(co.r * 2), 0, 0);
    } else {
      if (g.nut) V.dimH(-g.nut.af / 2, g.nut.af / 2, yb, `${n(g.nut.af)} AF`, g.nut.rc / 2, g.nut.rc / 2);
      else { const kn = g.segs.find(q => q.kind === 'knurl'); if (kn && kn.basis !== 'schematic') V.dimH(-kn.r, kn.r, yb, `Ø${n(kn.r * 2)}${kn.splines ? ' · '+kn.splines+' spl' : ''}`, 0, 0); }
    }
    return V;
  };

  const caption = (V: View, t: string) => { const cx = (V.bb[0] + V.bb[2]) / 2; V.text(cx, V.bb[3] + fs * 2.4, t, 'middle', 0, fs * 0.78, th.cap, 500); };
  const views: View[] = [];
  const sv = sideView(); views.push(sv);
  if (o.views === 'all') {
    if (!g.segs.length) { caption(sv, 'SIDE VIEW'); const ev = endView('end'); caption(ev, 'END VIEW · TOP FACE'); views.push(ev); }
    else {
      const isDE = p.template === 'double-ended' || (p.template === 'profiled-fastener' && g.segs[0]?.kind === 'thread');
      const a = endView('start'), b = endView('end');
      caption(a, isDE ? 'VIEW A · END A' : 'VIEW A · HEAD END'); caption(sv, 'SIDE VIEW'); caption(b, isDE ? 'VIEW B · END B' : 'VIEW B · TIP END');
      views.length = 0;
      if (o.layout === 'wide') views.push(a, sv, b); else views.push(sv, a, b);
    }
  }
  const gap = fs * 6, placed: { V: View; dx: number; dy: number }[] = [];
  if (o.layout === 'wide' || views.length === 1) {
    let cx = 0;
    views.forEach(V => { const dx = cx - V.bb[0]; placed.push({ V, dx, dy: 0 }); cx = V.bb[2] + dx + gap; });
  } else {
    const [first, ...rest] = views;
    placed.push({ V: first, dx: -first.bb[0], dy: 0 });
    const asc = Math.max(...rest.map(V => -V.bb[1]));
    const dy = first.bb[3] + gap * 0.7 + asc;
    let cx = 0;
    const row: { V: View; dx: number; dy: number }[] = [];
    rest.forEach(V => { const dx = cx - V.bb[0]; row.push({ V, dx, dy }); cx = V.bb[2] + dx + gap; });
    const rowW = cx - gap, fw = first.bb[2] - first.bb[0], shift = (fw - rowW) / 2;
    row.forEach(r => { r.dx += shift; placed.push(r); });
  }
  let bb: BBox = [Infinity, Infinity, -Infinity, -Infinity];
  placed.forEach(({ V, dx, dy }) => { bb = [Math.min(bb[0], V.bb[0] + dx), Math.min(bb[1], V.bb[1] + dy), Math.max(bb[2], V.bb[2] + dx), Math.max(bb[3], V.bb[3] + dy)]; });
  const m = fs * 1.6;
  const x = bb[0] - m, y = bb[1] - m, w = bb[2] - bb[0] + 2 * m, h = bb[3] - bb[1] + 2 * m;
  // Deterministic id so server and client markup match.
  const uid = `g-${p.slug}-${o.layout}-${o.labels}-${o.views}-${o.theme}-${Math.round(fs * 100)}`;
  const grid = o.grid
    ? `<defs><pattern id="${uid}" width="5" height="5" patternUnits="userSpaceOnUse" x="${f2(x)}" y="${f2(y)}"><path d="M5 0H0V5" fill="none" stroke="${th.grid}" stroke-width="0.12"/></pattern></defs><rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="url(#${uid})"/>`
    : '';
  const body = placed.map(({ V, dx, dy }) => `<g transform="translate(${f2(dx)} ${f2(dy)})">${V.s.join('')}</g>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f2(x)} ${f2(y)} ${f2(w)} ${f2(h)}" width="100%" style="display:block;height:auto;overflow:visible" role="img" aria-label="Technical drawing of ${esc(p.partNo)}, dimensions in millimetres">${grid}${body}</svg>`;
  return { svg, w, h, fs };
}
