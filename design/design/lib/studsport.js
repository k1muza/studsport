/* StudSport rendering library.
   Reads window.SS_DATA (data/catalogue.js) and provides:
   - lookup / formatting helpers (SS.*)
   - SS.geom(p): one geometry derivation shared by the 3D model AND the 2D drawings
   - SS.drawingSVG(p, opts): dimensioned engineering drawing (SVG string)
   - <ss-viewer sku>, <ss-thumb sku>, <ss-drawing sku> custom elements */
(function () {
'use strict';
if (window.SS && window.SS.__loaded) return;
const SS = window.SS = Object.assign(window.SS || {}, { __loaded: true });
const DATA = () => window.SS_DATA;
const TAU = Math.PI * 2;
const MONO = "'Martian Mono', ui-monospace, Menlo, Consolas, monospace";
const ACC = 'oklch(0.68 0.17 45)';
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const n = v => String(Math.round(v * 100) / 100);
const uniq = a => [...new Set(a)];
SS.n = n;
SS.onReady = cb => { const t = () => window.SS_DATA ? cb() : setTimeout(t, 25); t(); };

/* ---------- lookup & formatting ---------- */
SS.products = () => DATA().products;
SS.company = () => DATA().company;
SS.get = key => { if (!key) return null; const k = String(key).toLowerCase(); return DATA().products.find(p => p.slug === k || p.partNo.toLowerCase() === k || p.id === k) || null; };
SS.vehicle = id => DATA().vehicles.find(v => v.id === id) || { id, label: id, make: id, model: '' };
SS.typeLabel = p => DATA().productTypes[p.type].label;
SS.finishOf = p => DATA().finishes[p.finish];
SS.href = p => 'Product.dc.html?p=' + p.slug;
SS.threadsOf = p => { const d = p.dims; return p.template === 'double-ended' ? [d.threadA, d.threadB] : [d.thread]; };
SS.allThreads = p => { const t = SS.threadsOf(p).slice(); if (p.assembly) t.push(SS.get(p.assembly.nut).dims.thread); return t; };
SS.thread = t => `M${t.dia} × ${t.pitch} ${t.dir}`;
SS.threadShort = t => `M${t.dia}×${t.pitch} ${t.dir}`;
SS.dirLong = d => d === 'LH' ? 'Left-hand (LH)' : 'Right-hand (RH)';
SS.threadLabel = p => { const ts = SS.threadsOf(p); if (ts.length === 2) { const a = SS.thread(ts[0]), b = SS.thread(ts[1]); return a === b ? a + ', both ends' : `${a} / ${b}`; } return SS.thread(ts[0]); };
SS.sizes = p => uniq(SS.allThreads(p).map(t => 'M' + t.dia));
SS.dirs = p => uniq(SS.allThreads(p).map(t => t.dir));
SS.isLH = p => SS.dirs(p).includes('LH');
SS.vehiclesOf = p => uniq(p.applications.map(a => a.vehicle));
SS.appsLabel = p => uniq(p.applications.map(a => { const v = SS.vehicle(a.vehicle); return v.model ? v.label : `${v.label} ${a.model}`; })).join(' · ');
const AV_COL = { 'in-stock': 'oklch(0.72 0.14 150)', 'on-request': 'oklch(0.80 0.13 85)', 'confirm': '#9aa1a7' };
SS.avail = p => { const a = DATA().availability[p.availability]; return { key: p.availability, label: a.label, note: p.fulfilment || a.note, color: AV_COL[p.availability] }; };
SS.price = p => p.price ? `$${p.price.amount.toFixed(2)}` : null;
SS.related = p => (p.related || []).map(SS.get).filter(Boolean);
SS.variants = p => p.variantGroup ? DATA().products.filter(q => q.variantGroup === p.variantGroup) : [p];
SS.whatsapp = (p, qty) => DATA().company.whatsappLink + '?text=' + encodeURIComponent(`Hi StudSport, I'd like a quote for ${p ? p.partNo + ' (' + p.name + ')' : 'a part'}${qty ? ' × ' + qty : ''}.`);

SS.keyDims = p => {
  const d = p.dims;
  if (p.template === 'wheel-nut') return [{ k: 'Thread', v: SS.threadShort(d.thread) }, { k: 'AF', v: n(d.af) }, { k: 'Seat', v: d.seat.type === 'cone60' ? '60° cone' : 'Flange' }];
  if (p.template === 'double-ended') return [{ k: 'L', v: n(d.overall) }, { k: 'Ends', v: `M${d.threadA.dia}/M${d.threadB.dia}` }, { k: 'Collar', v: d.collar.shape === 'hex' ? d.collar.af + ' AF' : 'Ø' + d.collar.dia }];
  return [{ k: 'L', v: n(d.overall) }, { k: 'Thread', v: SS.threadShort(d.thread) }, { k: 'Head', v: 'Ø' + n(d.head.dia) }];
};
const headLabel = h => `Ø${n(h.dia)} ${h.shape === 'd-flat' ? 'D-flat' : 'round'}`;
SS.keySpecs = p => {
  const d = p.dims, F = SS.finishOf(p).label, out = [];
  if (p.template === 'wheel-nut') {
    out.push({ k: 'Thread', v: `M${d.thread.dia} × ${d.thread.pitch}` }, { k: 'Direction', v: SS.dirLong(d.thread.dir) }, { k: 'Across flats', v: `${n(d.af)} mm` }, { k: 'Height', v: `${n(d.height)} mm` },
      { k: 'Seat', v: d.seat.type === 'cone60' ? `60° cone, Ø${n(d.seat.dia)}` : `Flat, Ø${n(d.seat.dia)} flange` }, { k: 'LH identification', v: d.idGroove ? 'Groove on hex corners' : '—' }, { k: 'Finish', v: F });
    return out;
  }
  if (p.template === 'double-ended') {
    const a = d.threadA, b = d.threadB;
    out.push({ k: 'Overall length L', v: `${n(d.overall)} mm` }, { k: 'Thread', v: `M${a.dia} × ${a.pitch} / M${b.dia} × ${b.pitch}` }, { k: 'Direction', v: a.dir === b.dir ? SS.dirLong(a.dir) : `${a.dir} / ${b.dir}` },
      { k: 'Threaded length T', v: `${n(a.length)} / ${n(b.length)} mm` }, { k: 'Collar', v: d.collar.shape === 'hex' ? `${n(d.collar.af)} AF hex × ${n(d.collar.length)}` : `Ø${n(d.collar.dia)} × ${n(d.collar.length)}` },
      { k: 'Position', v: p.positions.join(' & ') }, { k: 'Finish', v: F });
    return out;
  }
  out.push({ k: 'Overall length L', v: `${n(d.overall)} mm` }, { k: 'Thread', v: `M${d.thread.dia} × ${d.thread.pitch}` }, { k: 'Direction', v: SS.dirLong(d.thread.dir) },
    { k: 'Threaded length T', v: `${n(d.thread.length)} mm` }, { k: 'Knurl', v: `Ø${n(d.knurl.dia)} × ${n(d.knurl.length)} mm` }, { k: 'Head', v: headLabel(d.head) }, { k: 'Position', v: p.positions.join(' & ') });
  if (p.assembly) { const np = SS.get(p.assembly.nut); out.push({ k: 'Nut', v: `${np.partNo}, ${n(np.dims.af)} AF` }); }
  out.push({ k: 'Finish', v: F });
  return out;
};
SS.specGroups = p => {
  const d = p.dims, D = DATA(), groups = [];
  groups.push({ group: 'General', rows: [['Part number', p.partNo], ['Product type', SS.typeLabel(p)], ['Supplied as', D.includes[p.includes]], ['Position', p.positions.join(' & ')]] });
  if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const H = d.head.thickness;
    groups.push({ group: 'Dimensions (mm)', rows: [
      ['Overall length L (incl. head)', n(d.overall)], ['Length under head Lu', n(d.overall - H)],
      ['Head Ø × thickness H', `${n(d.head.dia)} × ${n(H)}`], ['Head form', d.head.shape === 'd-flat' ? `D-flat, ${n(d.head.flatAcross)} across flat` : 'Round'],
      ['Knurl Ø × length K', `${n(d.knurl.dia)} × ${n(d.knurl.length)}`], ['Knurl splines', String(d.knurl.splines)],
      ['Shoulder Ø × length S', `${n(d.shoulder.dia)} × ${n(d.shoulder.length)}`], ['Threaded length T', n(d.thread.length)],
      ['Check: H + K + S + T', `${n(H)} + ${n(d.knurl.length)} + ${n(d.shoulder.length)} + ${n(d.thread.length)} = ${n(H + d.knurl.length + d.shoulder.length + d.thread.length)}`]] });
    groups.push({ group: 'Thread', rows: [['Size', `M${d.thread.dia} × ${d.thread.pitch}`], ['Direction', SS.dirLong(d.thread.dir)], ['Tolerance class', d.thread.cls]] });
    if (p.assembly) { const np = SS.get(p.assembly.nut), nd = np.dims; groups.push({ group: `Matching nut · ${np.partNo}`, rows: [['Thread', SS.thread(nd.thread)], ['Across flats', `${n(nd.af)} mm`], ['Height', `${n(nd.height)} mm`], ['Seat', nd.seat.type === 'cone60' ? `60° cone, Ø${n(nd.seat.dia)}` : `Flat, Ø${n(nd.seat.dia)} × ${n(nd.seat.thickness)} flange`], ['Finish', D.finishes[np.finish].label], ['Clamp length shown (reference)', `${n(p.assembly.clampLength)} mm`]] }); }
  } else if (p.template === 'double-ended') {
    const a = d.threadA, b = d.threadB, c = d.collar;
    groups.push({ group: 'Dimensions (mm)', rows: [['Overall length L', n(d.overall)], [`End A length (${a.role})`, n(a.length)], ['Collar length C', n(c.length)], [`End B length (${b.role})`, n(b.length)],
      ['Collar', c.shape === 'hex' ? `Hex, ${n(c.af)} AF` : `Round, Ø${n(c.dia)}`], ['Check: A + C + B', `${n(a.length)} + ${n(c.length)} + ${n(b.length)} = ${n(a.length + c.length + b.length)}`]] });
    groups.push({ group: 'Thread', rows: [[`End A · ${a.role}`, `${SS.thread(a)} · ${a.cls}`], [`End B · ${b.role}`, `${SS.thread(b)} · ${b.cls}`]] });
  } else {
    groups.push({ group: 'Dimensions (mm)', rows: [['Across flats', n(d.af)], ['Across corners (ref.)', n(d.af / Math.cos(Math.PI / 6))], ['Height', n(d.height)], ['Seat', d.seat.type === 'cone60' ? `60° cone, Ø${n(d.seat.dia)}` : `Flat flange, Ø${n(d.seat.dia)} × ${n(d.seat.thickness)}`]] });
    groups.push({ group: 'Thread', rows: [['Size', `M${d.thread.dia} × ${d.thread.pitch}`], ['Direction', SS.dirLong(d.thread.dir)], ['Tolerance class', d.thread.cls], ['LH identification', d.idGroove ? 'Groove around hex corners' : '—']] });
  }
  groups.push({ group: 'Material & finish', rows: [['Material', p.material], ['Property class', p.grade], ['Finish', SS.finishOf(p).label]] });
  groups.push({ group: 'Data', rows: [['Specification revision', `Rev ${p.spec.revision} · ${p.spec.date}`], ['Data status', 'Illustrative sample, verify before use']] });
  return groups.map(g => ({ group: g.group, rows: g.rows.map(r => ({ k: r[0], v: r[1] })) }));
};
SS.compare = (p, list) => {
  const specs = list.map(q => SS.keySpecs(q)); const keys = uniq(specs.flat().map(s => s.k));
  const val = (i, k) => (specs[i].find(s => s.k === k) || { v: '—' }).v;
  const me = list.indexOf(p);
  return keys.map(k => ({ k, cells: list.map((q, i) => ({ v: val(i, k), diff: i !== me && val(i, k) !== val(me, k), self: i === me })) }))
    .filter(r => new Set(r.cells.map(c => c.v)).size > 1 || ['Thread', 'Overall length L'].includes(r.k));
};
SS.hay = p => [p.name, p.partNo, p.partNo.replace('-', ''), SS.typeLabel(p), p.summary,
  ...p.applications.map(a => { const v = SS.vehicle(a.vehicle); return `${v.label} ${v.make} ${a.model}`; }),
  ...SS.allThreads(p).map(t => `m${t.dia}x${t.pitch} m${t.dia} ${t.dir} ${t.dir === 'LH' ? 'left-hand left hand' : 'right-hand right hand'}`)].join(' ').toLowerCase().replace(/×/g, 'x');
SS.search = (q, list) => {
  list = list || SS.products();
  const toks = String(q || '').toLowerCase().replace(/×/g, 'x').replace(/\s*x\s*(?=\d)/g, 'x').split(/\s+/).filter(Boolean);
  return toks.length ? list.filter(p => { const h = SS.hay(p); return toks.every(t => h.includes(t)); }) : list;
};

/* ---------- geometry (single source for 3D + drawings) ---------- */
SS.nutGeom = np => {
  const d = np.dims, t = d.thread, rB = t.dia / 2 + 0.7;
  const g = { af: d.af, H: d.height, rc: d.af / Math.sqrt(3), c0: d.af / 2 * 0.96, rB, t, seat: d.seat, idGroove: !!d.idGroove, rMaj: t.dia / 2 + 0.1, rMin: t.dia / 2 - 0.541 * t.pitch, partNo: np.partNo, finish: np.finish };
  if (d.seat.type === 'cone60') { g.seatH = (d.seat.dia / 2 - rB) / Math.tan(Math.PI / 6); g.hex0 = g.seatH; }
  else { g.seatH = d.seat.thickness; g.hex0 = d.seat.thickness + 1.2; }
  g.maxR = Math.max(g.rc, d.seat.type === 'cone60' ? 0 : d.seat.dia / 2);
  return g;
};
SS.geom = p => {
  if (p.__geom) return p.__geom;
  const d = p.dims, segs = [];
  const thr = (t, y0, y1, tip) => ({ kind: 'thread', y0, y1, r: t.dia / 2, rMin: t.dia / 2 - 0.6134 * t.pitch * 0.92, pitch: t.pitch, dir: t.dir, tip, t });
  let g;
  if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const H = d.head.thickness, K = d.knurl.length, S = d.shoulder.length, T = d.thread.length;
    segs.push({ kind: 'head', y0: 0, y1: H, r: d.head.dia / 2, shape: d.head.shape, f: d.head.shape === 'd-flat' ? d.head.flatAcross - d.head.dia / 2 : null, c: 0.8 });
    let y = H;
    segs.push({ kind: 'knurl', y0: y, y1: y + K, r: d.knurl.dia / 2, rIn: d.knurl.dia / 2 - 0.5, splines: d.knurl.splines, taper: Math.min(1.5, K * 0.12), rNext: S > 0 ? d.shoulder.dia / 2 : d.thread.dia / 2 });
    y += K;
    if (S > 0) { segs.push({ kind: 'plain', y0: y, y1: y + S, r: d.shoulder.dia / 2 }); y += S; }
    segs.push(thr(d.thread, y, y + T, 'end')); y += T;
    g = { L: y, segs };
    if (p.template === 'stud-nut') { const np = SS.get(p.assembly.nut); const ng = SS.nutGeom(np); ng.y0 = H + p.assembly.clampLength; g.nut = ng; }
  } else if (p.template === 'double-ended') {
    const A = d.threadA, B = d.threadB, C = d.collar; let y = A.length;
    segs.push(thr(A, 0, y, 'start'));
    if (C.shape === 'hex') segs.push({ kind: 'hex', y0: y, y1: y + C.length, af: C.af, r: C.af / Math.sqrt(3) });
    else segs.push({ kind: 'collar', y0: y, y1: y + C.length, r: C.dia / 2 });
    y += C.length; segs.push(thr(B, y, y + B.length, 'end')); y += B.length;
    g = { L: y, segs };
  } else {
    const ng = SS.nutGeom(p); ng.y0 = 0; g = { L: ng.H, segs: [], nut: ng };
  }
  g.maxR = Math.max(0, ...segs.map(s => s.r), g.nut ? g.nut.maxR : 0);
  Object.defineProperty(p, '__geom', { value: g, enumerable: false, configurable: true });
  return g;
};
SS.validate = p => {
  const d = p.dims, out = [];
  if (p.template === 'press-in-stud' || p.template === 'stud-nut') {
    const s = d.head.thickness + d.knurl.length + d.shoulder.length + d.thread.length;
    if (Math.abs(s - d.overall) > 0.01) out.push(`L ${d.overall} ≠ H+K+S+T (${s})`);
    if (d.knurl.dia <= d.shoulder.dia) out.push('Knurl Ø must exceed shoulder Ø');
    if (d.shoulder.dia < d.thread.dia) out.push('Shoulder Ø below thread Ø');
    if (d.head.shape === 'd-flat' && !(d.head.flatAcross > d.head.dia / 2 && d.head.flatAcross < d.head.dia)) out.push('D-flat dimension out of range');
    if (p.assembly) { const np = SS.get(p.assembly.nut); if (!np) out.push('Nut record missing'); else { const a = d.thread, b = np.dims.thread; if (a.dia !== b.dia || a.pitch !== b.pitch || a.dir !== b.dir) out.push('Nut thread does not match stud'); if (d.head.thickness + p.assembly.clampLength + np.dims.height > d.overall) out.push('Nut beyond stud end'); } }
  } else if (p.template === 'double-ended') {
    const s = d.threadA.length + d.collar.length + d.threadB.length; if (Math.abs(s - d.overall) > 0.01) out.push(`L ${d.overall} ≠ A+C+B (${s})`);
  } else if (d.height !== d.overall) out.push('Nut height ≠ overall');
  if (p.name.includes(' RH') && SS.dirs(p).join() === 'LH') out.push('Name says RH, thread is LH');
  if (p.name.includes(' LH') && !SS.dirs(p).includes('LH')) out.push('Name says LH, thread is RH');
  return out;
};
SS.callouts = p => {
  const g = SS.geom(p), d = p.dims, out = [];
  if (p.template === 'wheel-nut') {
    const ng = g.nut;
    out.push({ t: 'lin', a: 0, b: ng.H, ra: ng.maxR, rb: ng.rc, s: -1, lvl: 0, label: `H ${n(ng.H)}` });
    out.push({ t: 'lead', y: (ng.hex0 + ng.H) / 2, r: ng.rc, s: 1, lvl: 0, label: `${n(ng.af)} AF`, key: true, dir: 1 });
    out.push({ t: 'lead', y: ng.H, r: (ng.rB + ng.c0) / 2, s: 1, lvl: 1, label: SS.thread(ng.t), dir: -1 });
    out.push({ t: 'lead', y: ng.seatH / 2, r: ng.seat.type === 'cone60' ? (ng.seat.dia / 2 + ng.rB) / 2 : ng.seat.dia / 2, s: -1, lvl: 1, label: ng.seat.type === 'cone60' ? '60° cone seat' : `Ø${n(ng.seat.dia)} flange`, minor: true, dir: -1 });
    return out;
  }
  const head = g.segs.find(s => s.kind === 'head'), kn = g.segs.find(s => s.kind === 'knurl'), hx = g.segs.find(s => s.kind === 'hex' || s.kind === 'collar');
  const ths = g.segs.filter(s => s.kind === 'thread'), te = ths.find(s => s.tip === 'end'), ts = ths.find(s => s.tip === 'start');
  out.push({ t: 'lin', a: 0, b: g.L, ra: g.segs[0].r, rb: te.rMin, s: 1, lvl: g.nut ? 2 : 1, label: `L ${n(g.L)}`, key: true });
  out.push({ t: 'lin', a: te.y0, b: te.y1, ra: te.r, rb: te.rMin, s: -1, lvl: 0, label: `T ${n(te.y1 - te.y0)}` });
  if (ts) out.push({ t: 'lin', a: ts.y0, b: ts.y1, ra: ts.rMin, rb: ts.r, s: -1, lvl: 0, label: `T ${n(ts.y1 - ts.y0)}` });
  if (head) out.push({ t: 'lead', y: head.y1 * 0.5, r: head.r, s: -1, lvl: 1, label: `Ø${n(d.head.dia)} head`, dir: -1 });
  if (kn) out.push({ t: 'lead', y: (kn.y0 + kn.y1) / 2, r: kn.r, s: -1, lvl: 0, label: `Ø${n(kn.r * 2)} knurl`, minor: true, dir: -1 });
  out.push({ t: 'lead', y: g.nut ? te.y1 - 8 : te.y0 + (te.y1 - te.y0) * 0.62, r: te.r, s: 1, lvl: 0, label: SS.thread(te.t), key: true, dir: 1 });
  if (ts) out.push({ t: 'lead', y: ts.y0 + (ts.y1 - ts.y0) * 0.4, r: ts.r, s: 1, lvl: 0, label: SS.thread(ts.t), key: true, dir: -1 });
  if (hx) out.push({ t: 'lead', y: (hx.y0 + hx.y1) / 2, r: hx.r, s: -1, lvl: 1, label: hx.kind === 'hex' ? `${n(hx.af)} AF collar` : `Ø${n(hx.r * 2)} collar`, dir: 1 });
  if (g.nut) out.push({ t: 'lead', y: g.nut.y0 + g.nut.H / 2, r: g.nut.rc, s: 1, lvl: 1, label: `${g.nut.partNo} · ${n(g.nut.af)} AF`, dir: -1 });
  return out;
};

/* ---------- 2D engineering drawing ---------- */
SS.drawingSVG = (p, opts) => {
  const o = Object.assign({ layout: 'wide', theme: 'light', fs: 3.2, labels: 'values', views: 'all', dims: true, grid: false, bg: null }, opts);
  const g = SS.geom(p), fs = o.fs, gen = o.labels === 'generic';
  const th = o.theme === 'dark'
    ? { ink: '#d9dcde', dim: '#aab1b7', thin: '#7f878e', bg: o.bg || '#17191c', cap: '#8b9298', grid: 'rgba(255,255,255,0.045)', acc: ACC }
    : { ink: '#15171a', dim: '#353c43', thin: '#59616a', bg: o.bg || '#ffffff', cap: '#5c646b', grid: 'rgba(21,23,26,0.07)', acc: 'oklch(0.55 0.16 45)' };
  const Wk = Math.max(0.4, fs * 0.15), Wt = Math.max(0.15, fs * 0.055);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const f2 = v => +v.toFixed(2);
  const tw = s => String(s).length * fs * 0.7;
  const mkView = () => {
    const V = { s: [], bb: [Infinity, Infinity, -Infinity, -Infinity] };
    V.ext = (x, y) => { const b = V.bb; if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; };
    V.line = (x1, y1, x2, y2, w, col, dash) => { V.ext(x1, y1); V.ext(x2, y2); V.s.push(`<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`); };
    V.poly = (pts, w, col, fill) => { pts.forEach(q => V.ext(q[0], q[1])); V.s.push(`<polygon points="${pts.map(q => f2(q[0]) + ',' + f2(q[1])).join(' ')}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}" stroke-linejoin="round"/>`); };
    V.circle = (r, w, col, fill, dash) => { V.ext(-r, -r); V.ext(r, r); V.s.push(`<circle cx="0" cy="0" r="${f2(r)}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`); };
    V.path = (d, w, col, fill, r) => { V.ext(-r, -r); V.ext(r, r); V.s.push(`<path d="${d}" fill="${fill || 'none'}" stroke="${col || th.ink}" stroke-width="${f2(w || Wk)}" stroke-linejoin="round"/>`); };
    V.hexagon = (rc, fill) => V.poly([0, 1, 2, 3, 4, 5].map(k => { const a = Math.PI / 2 + k * Math.PI / 3; return [rc * Math.cos(a), rc * Math.sin(a)]; }), Wk, th.ink, fill);
    V.dshape = (r, f, fill) => { const w = Math.sqrt(r * r - f * f); V.path(`M${f2(-w)},${f2(-f)} L${f2(w)},${f2(-f)} A${f2(r)},${f2(r)} 0 1 1 ${f2(-w)},${f2(-f)} Z`, Wk, th.ink, fill, r); };
    V.arc34 = (r, w) => V.path(`M${f2(r)},0 A${f2(r)},${f2(r)} 0 1 1 0,${f2(-r)}`, w || Wt, th.thin, 'none', r);
    V.text = (x, y, s, anchor, rot, size, col, weight) => {
      size = size || fs; anchor = anchor || 'middle'; const w = String(s).length * size * 0.7;
      const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      if (rot) { V.ext(x - size, y - w / 2); V.ext(x + size * 0.3, y + w / 2); } else { V.ext(x0, y - size); V.ext(x0 + w, y + size * 0.3); }
      V.s.push(`<text x="${f2(x)}" y="${f2(y)}" font-family="${MONO}" font-size="${f2(size)}" font-weight="${weight || 400}" fill="${col || th.ink}" text-anchor="${anchor}"${rot ? ` transform="rotate(${rot} ${f2(x)} ${f2(y)})"` : ''} paint-order="stroke" stroke="${o.bg === 'none' ? 'none' : th.bg}" stroke-width="${f2(size * 0.5)}" stroke-linejoin="round">${esc(s)}</text>`);
    };
    V.arrow = (x, y, dx, dy) => { const a = fs * 0.85, b = fs * 0.2, px = -dy, py = dx; V.s.push(`<path d="M${f2(x)},${f2(y)} L${f2(x - dx * a + px * b)},${f2(y - dy * a + py * b)} L${f2(x - dx * a - px * b)},${f2(y - dy * a - py * b)} Z" fill="${th.dim}"/>`); };
    V.cl = (x1, y1, x2, y2) => V.line(x1, y1, x2, y2, Wt, th.thin, `${f2(fs * 2.2)} ${f2(fs * 0.45)} ${f2(fs * 0.3)} ${f2(fs * 0.45)}`);
    V.dimH = (x1, x2, y, label, f1, f2_, sub) => {
      const gp = fs * 0.35, ov = fs * 0.5, a = fs * 0.85;
      [[x1, f1], [x2, f2_]].forEach(([x, f]) => { const sg = y < f ? -1 : 1; V.line(x, f + sg * gp, x, y + sg * ov, Wt, th.dim); });
      if (x2 - x1 >= a * 2.4) { V.line(x1, y, x2, y, Wt, th.dim); V.arrow(x1, y, -1, 0); V.arrow(x2, y, 1, 0); }
      else { V.line(x1 - a * 1.8, y, x2 + a * 1.8, y, Wt, th.dim); V.arrow(x1, y, 1, 0); V.arrow(x2, y, -1, 0); }
      V.text((x1 + x2) / 2, y - fs * 0.45, label);
      if (sub) V.text((x1 + x2) / 2, y + fs * 1.15, sub, 'middle', 0, fs * 0.82, th.cap);
    };
    V.dimV = (x, y1, y2, label, f1, f2_) => {
      const gp = fs * 0.35, ov = fs * 0.5, a = fs * 0.85;
      [[y1, f1], [y2, f2_]].forEach(([y, f]) => { const sg = x < f ? -1 : 1; V.line(f + sg * gp, y, x + sg * ov, y, Wt, th.dim); });
      if (y2 - y1 >= a * 2.4) { V.line(x, y1, x, y2, Wt, th.dim); V.arrow(x, y1, 0, -1); V.arrow(x, y2, 0, 1); }
      else { V.line(x, y1 - a * 1.8, x, y2 + a * 1.8, Wt, th.dim); V.arrow(x, y1, 0, 1); V.arrow(x, y2, 0, -1); }
      V.text(x - fs * 0.45, (y1 + y2) / 2, label, 'middle', -90);
    };
    V.leader = (x0, y0, x1, y1, label, dir) => {
      const dx = x0 - x1, dy = y0 - y1, l = Math.hypot(dx, dy) || 1;
      V.line(x1, y1, x0, y0, Wt, th.dim); V.arrow(x0, y0, dx / l, dy / l);
      const lw = tw(label) + fs * 0.8; V.line(x1, y1, x1 + dir * lw, y1, Wt, th.dim);
      V.text(x1 + dir * fs * 0.4, y1 - fs * 0.4, label, dir > 0 ? 'start' : 'end');
    };
    return V;
  };
  const cont = (s, top) => {
    switch (s.kind) {
      case 'head': return top && s.f != null ? [[s.y0, s.f], [s.y1, s.f]] : [[s.y0, s.r - s.c], [s.y0 + s.c, s.r], [s.y1 - 0.4, s.r], [s.y1, s.r - 0.4]];
      case 'knurl': return [[s.y0, s.r], [s.y1 - s.taper, s.r], [s.y1, s.rNext]];
      case 'plain': return [[s.y0, s.r], [s.y1, s.r]];
      case 'collar': return [[s.y0, s.r - 0.6], [s.y0 + 0.6, s.r], [s.y1 - 0.6, s.r], [s.y1, s.r - 0.6]];
      case 'hex': { const c0 = s.af / 2 * 0.96, ch = (s.r - c0) / 1.732; return [[s.y0, c0], [s.y0 + ch, s.r], [s.y1 - ch, s.r], [s.y1, c0]]; }
      case 'thread': { const cl = s.r - (s.rMin - 0.25); return s.tip === 'end' ? [[s.y0, s.r], [s.y1 - cl, s.r], [s.y1, s.r - cl]] : [[s.y0, s.r - cl], [s.y0 + cl, s.r], [s.y1, s.r]]; }
    }
    return [];
  };
  const nutSide = (V, ng, x0, hidden) => {
    const H = ng.H, rc = ng.rc, c0 = ng.c0, ch = (rc - c0) / 1.732;
    let top;
    if (ng.seat.type === 'cone60') top = [[x0, ng.rB], [x0 + ng.seatH, ng.seat.dia / 2], [x0 + ng.seatH, c0], [x0 + ng.seatH + ch, rc], [x0 + H - ch, rc], [x0 + H, c0]];
    else { const fR = ng.seat.dia / 2, t = ng.seat.thickness; top = [[x0, fR - 0.5], [x0 + 0.5, fR], [x0 + t, fR], [x0 + ng.hex0, rc], [x0 + H - ch, rc], [x0 + H, c0]]; }
    V.poly(top.map(q => [q[0], -q[1]]).concat(top.slice().reverse().map(q => [q[0], q[1]])), Wk, th.ink, o.bg === 'none' ? 'none' : th.bg);
    const hx0 = x0 + ng.hex0;
    V.line(hx0 + ch * 0.5, -rc / 2, x0 + H - ch * 0.5, -rc / 2); V.line(hx0 + ch * 0.5, rc / 2, x0 + H - ch * 0.5, rc / 2);
    if (ng.seat.type === 'cone60') V.line(x0 + ng.seatH, -c0, x0 + ng.seatH, c0);
    else { V.line(x0 + ng.seat.thickness, -ng.seat.dia / 2, x0 + ng.seat.thickness, ng.seat.dia / 2); V.line(hx0, -rc, hx0, rc, Wt, th.thin); }
    if (ng.idGroove) { const m = x0 + (hx0 - x0 + H) / 2; [-0.6, 0.6].forEach(dx => { V.line(m + dx, -rc, m + dx, -rc + 1.2, Wt, th.ink); V.line(m + dx, rc, m + dx, rc - 1.2, Wt, th.ink); V.line(m + dx, -rc / 2 - 0.6, m + dx, -rc / 2 + 0.6, Wt, th.ink); V.line(m + dx, rc / 2 - 0.6, m + dx, rc / 2 + 0.6, Wt, th.ink); }); }
    if (hidden) { const dash = `${f2(fs * 0.9)} ${f2(fs * 0.45)}`; [ng.rMin, ng.rMaj].forEach((r, i) => { V.line(x0, -r, x0 + H, -r, i ? Wt : Wk * 0.7, th.thin, dash); V.line(x0, r, x0 + H, r, i ? Wt : Wk * 0.7, th.thin, dash); }); }
  };
  const L = (k, v) => gen ? k : v;
  const sideView = () => {
    const V = mkView();
    if (!g.segs.length) {
      const ng = g.nut; nutSide(V, ng, 0, true); V.cl(-fs * 1.4, 0, ng.H + fs * 1.4, 0);
      if (o.dims) {
        V.dimH(0, ng.H, ng.maxR + fs * 2.4, L('H', n(ng.H)), ng.maxR, ng.rc);
        if (ng.seat.type === 'cone60') V.dimV(-fs * 2.6, -ng.seat.dia / 2, ng.seat.dia / 2, L('Øs', 'Ø' + n(ng.seat.dia)), ng.seatH, ng.seatH);
        else V.dimV(-fs * 2.6, -ng.seat.dia / 2, ng.seat.dia / 2, L('Øf', 'Ø' + n(ng.seat.dia)), 0.5, 0.5);
        V.dimH(0, ng.seatH, -(ng.maxR + fs * 2.4), L('s', n(ng.seatH)), -(ng.seat.type === 'cone60' ? ng.rB : ng.seat.dia / 2), -(ng.seat.type === 'cone60' ? ng.seat.dia / 2 : ng.seat.dia / 2));
      }
      return V;
    }
    const segs = g.segs, Lt = g.L;
    const top = [], bot = [];
    segs.forEach(s => { top.push(...cont(s, true)); bot.push(...cont(s, false)); });
    V.poly(top.map(q => [q[0], -q[1]]).concat(bot.slice().reverse().map(q => [q[0], q[1]])), Wk, th.ink, o.bg === 'none' ? 'none' : th.bg);
    segs.forEach((s, i) => {
      const t = cont(s, true), b = cont(s, false), nx = segs[i + 1];
      if (nx) { const nt = cont(nx, true), nb = cont(nx, false); V.line(s.y1, -Math.max(t[t.length - 1][1], nt[0][1]), s.y1, Math.max(b[b.length - 1][1], nb[0][1])); }
      if (s.kind === 'head') V.line(s.y0 + s.c, -(s.f != null ? s.f : s.r), s.y0 + s.c, s.r);
      if (s.kind === 'knurl') { const x2 = s.y1 - s.taper; V.line(x2, -s.r, x2, s.r); const step = Math.max(2, Math.round(s.splines / 14)); for (let k = 1; k * step * TAU / s.splines < Math.PI - 0.05; k++) { const yy = s.r * Math.cos(k * step * TAU / s.splines); V.line(s.y0 + 0.3, yy, x2 - 0.3, yy, Wt, th.thin); } }
      if (s.kind === 'thread') { const cl = s.r - (s.rMin - 0.25), xr = s.tip === 'end' ? s.y0 : s.y1, xt = s.tip === 'end' ? s.y1 - cl : s.y0 + cl; V.line(xt, -s.r, xt, s.r); V.line(Math.min(xr, xt), -s.rMin, Math.max(xr, xt), -s.rMin, Wt, th.thin); V.line(Math.min(xr, xt), s.rMin, Math.max(xr, xt), s.rMin, Wt, th.thin); }
      if (s.kind === 'hex') { const ch = (s.r - s.af / 2 * 0.96) / 1.732; V.line(s.y0 + ch, -s.r / 2, s.y1 - ch, -s.r / 2); V.line(s.y0 + ch, s.r / 2, s.y1 - ch, s.r / 2); }
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
    if (head) { V.dimH(head.y1, Lt, ya, L('Lu', 'Lu ' + n(Lt - head.y1)), -(head.f != null ? head.f : head.r), yTip); ya -= fs * 2.8; }
    V.dimH(0, Lt, ya, L('L', 'L ' + n(Lt)), -top[0][1], yTip);
    const yb = maxBot + fs * 2.4;
    const letters = { head: 'H', knurl: 'K', plain: 'S', hex: 'C', collar: 'C' };
    segs.forEach((s, i) => {
      const b = cont(s, false), pv = segs[i - 1], nx = segs[i + 1];
      const f1 = Math.max(b[0][1], pv ? cont(pv, false).slice(-1)[0][1] : 0), f2b = Math.max(b[b.length - 1][1], nx ? cont(nx, false)[0][1] : 0);
      const letter = s.kind === 'thread' ? (segs.length === 3 && p.template === 'double-ended' ? (s.tip === 'start' ? 'A' : 'B') : 'T') : letters[s.kind];
      V.dimH(s.y0, s.y1, yb, gen ? letter : n(s.y1 - s.y0), f1, f2b, gen ? null : letter);
    });
    segs.filter(s => s.kind === 'thread').forEach(s => {
      const cl = s.r - (s.rMin - 0.25), lab = L('Ød×P', `M${s.t.dia}×${s.t.pitch} ${s.t.dir}`);
      if (s.tip === 'end') V.dimV(Lt + fs * 2.6, -s.r, s.r, lab, s.y1 - cl, s.y1 - cl);
      else V.dimV(-fs * 2.6 - fs * 1.1, -s.r, s.r, lab, cl, cl);
    });
    if (gen) { const kn = segs.find(s => s.kind === 'knurl'); if (kn) V.leader((kn.y0 + kn.y1) / 2, -kn.r, (kn.y0 + kn.y1) / 2 - fs * 2, -maxTop - fs * 0.9, 'Øk', -1); if (head) V.dimV(-fs * 2.6, -head.r, head.r, 'Øh', 0.4, 0.4); }
    return V;
  };
  const endView = from => {
    const V = mkView(), items = [], fill = o.bg === 'none' ? 'none' : th.bg;
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
      const s = it.s;
      if (s.kind === 'head') { if (s.f != null) V.dshape(s.r, s.f, fill); else { V.circle(s.r, Wk, th.ink, fill); V.circle(s.r - s.c, Wt, th.thin); } }
      else if (s.kind === 'knurl') { V.circle(s.r, Wk, th.ink, fill); V.circle(s.rIn, Wt, th.thin, 'none', dash); }
      else if (s.kind === 'plain' || s.kind === 'collar') V.circle(s.r, Wk, th.ink, fill);
      else if (s.kind === 'hex') { V.hexagon(s.r, fill); V.circle(s.af / 2 * 0.96, Wk, th.ink, 'none'); }
      else if (s.kind === 'thread') { V.circle(s.r, Wk, th.ink, fill); if ((from === 'end' && s.tip === 'end') || (from === 'start' && s.tip === 'start')) V.arc34(s.rMin, Wt); }
    });
    const R = g.maxR;
    V.cl(-R - fs, 0, R + fs, 0); V.cl(0, -R - fs, 0, R + fs);
    if (!o.dims) return V;
    const yb = R + fs * 2.4;
    const near = items[items.length - 1];
    if (!g.segs.length) {
      const ng = g.nut; V.dimH(-ng.af / 2, ng.af / 2, ng.rc + fs * 2.4, `${n(ng.af)} AF`, ng.rc / 2, ng.rc / 2);
      const a = -Math.PI / 4; V.leader(ng.rMaj * Math.cos(a), ng.rMaj * Math.sin(a), ng.rc + fs * 0.8, -ng.rc - fs * 0.8, `${SS.thread(ng.t)} - ${ng.t.cls}`, 1);
    } else if (from === 'start') {
      const s = near.s;
      if (s.kind === 'head') { V.dimH(-s.r, s.r, yb, 'Ø' + n(s.r * 2), 0, 0); if (s.f != null) { const w = Math.sqrt(s.r * s.r - s.f * s.f); V.dimV(-R - fs * 2.4, -s.f, s.r, n(s.f + s.r), -w, 0); } }
      const hx = g.segs.find(q => q.kind === 'hex'), co = g.segs.find(q => q.kind === 'collar');
      if (hx) V.dimH(-hx.af / 2, hx.af / 2, yb, `${n(hx.af)} AF`, hx.r / 2, hx.r / 2);
      if (co) V.dimH(-co.r, co.r, yb, 'Ø' + n(co.r * 2), 0, 0);
    } else {
      if (g.nut) V.dimH(-g.nut.af / 2, g.nut.af / 2, yb, `${n(g.nut.af)} AF`, g.nut.rc / 2, g.nut.rc / 2);
      else { const kn = g.segs.find(q => q.kind === 'knurl'); if (kn) V.dimH(-kn.r, kn.r, yb, `Ø${n(kn.r * 2)} · ${kn.splines} spl`, 0, 0); }
    }
    return V;
  };
  const caption = (V, t) => { const cx = (V.bb[0] + V.bb[2]) / 2; V.text(cx, V.bb[3] + fs * 2.4, t, 'middle', 0, fs * 0.78, th.cap, 500); };
  const views = [];
  const sv = sideView(); views.push(sv);
  if (o.views === 'all') {
    if (!g.segs.length) { caption(sv, 'SIDE VIEW'); const ev = endView('end'); caption(ev, 'END VIEW · TOP FACE'); views.push(ev); }
    else {
      const isDE = p.template === 'double-ended';
      const a = endView('start'), b = endView('end');
      caption(a, isDE ? 'VIEW A · END A' : 'VIEW A · HEAD END'); caption(sv, 'SIDE VIEW'); caption(b, isDE ? 'VIEW B · END B' : 'VIEW B · TIP END');
      views.length = 0; if (o.layout === 'wide') views.push(a, sv, b); else views.push(sv, a, b);
    }
  }
  const gap = fs * 6, placed = [];
  if (o.layout === 'wide' || views.length === 1) { let cx = 0; views.forEach(V => { const dx = cx - V.bb[0]; placed.push({ V, dx, dy: 0 }); cx = V.bb[2] + dx + gap; }); }
  else {
    const [first, ...rest] = views; placed.push({ V: first, dx: -first.bb[0], dy: 0 });
    const asc = Math.max(...rest.map(V => -V.bb[1])); const dy = first.bb[3] + gap * 0.7 + asc;
    let cx = 0; const row = []; rest.forEach(V => { const dx = cx - V.bb[0]; row.push({ V, dx, dy }); cx = V.bb[2] + dx + gap; });
    const rowW = cx - gap, fw = first.bb[2] - first.bb[0], shift = (fw - rowW) / 2;
    row.forEach(r => { r.dx += shift; placed.push(r); });
  }
  let bb = [Infinity, Infinity, -Infinity, -Infinity];
  placed.forEach(({ V, dx, dy }) => { bb = [Math.min(bb[0], V.bb[0] + dx), Math.min(bb[1], V.bb[1] + dy), Math.max(bb[2], V.bb[2] + dx), Math.max(bb[3], V.bb[3] + dy)]; });
  const m = fs * 1.6; const x = bb[0] - m, y = bb[1] - m, w = bb[2] - bb[0] + 2 * m, h = bb[3] - bb[1] + 2 * m;
  const uid = 'g' + Math.random().toString(36).slice(2, 8);
  const grid = o.grid ? `<defs><pattern id="${uid}" width="5" height="5" patternUnits="userSpaceOnUse" x="${f2(x)}" y="${f2(y)}"><path d="M5 0H0V5" fill="none" stroke="${th.grid}" stroke-width="0.12"/></pattern></defs><rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="url(#${uid})"/>` : '';
  const body = placed.map(({ V, dx, dy }) => `<g transform="translate(${f2(dx)} ${f2(dy)})">${V.s.join('')}</g>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f2(x)} ${f2(y)} ${f2(w)} ${f2(h)}" width="100%" style="display:block;height:auto;overflow:visible" role="img" aria-label="Technical drawing of ${esc(p.partNo)}, dimensions in millimetres">${grid}${body}</svg>`;
  return { svg, w, h, fs };
};

/* ---------- 3D ---------- */
let threeP = null;
SS.three = () => threeP || (threeP = import(THREE_URL));
function patch(T, M, N, fn, shift) {
  const cols = N + 1, pos = new Float32Array(M * cols * 3);
  for (let i = 0; i < M; i++) for (let j = 0; j <= N; j++) {
    const v = fn(i, j), ph = v[2] !== undefined ? v[2] : j / N * TAU, k = (i * cols + j) * 3;
    pos[k] = v[0] * Math.sin(ph); pos[k + 1] = v[1]; pos[k + 2] = v[0] * Math.cos(ph);
  }
  const idx = [];
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < N; j++) { const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1; idx.push(a, b, c, b, d, c); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const nr = geo.attributes.normal.array; shift = shift || 0;
  for (let i = 0; i < M; i++) { const i2 = i + shift; if (i2 < 0 || i2 >= M) continue; const a = (i * cols + N) * 3, b = (i2 * cols) * 3; let x = nr[a] + nr[b], y = nr[a + 1] + nr[b + 1], z = nr[a + 2] + nr[b + 2]; const l = Math.hypot(x, y, z) || 1; nr[a] = nr[b] = x / l; nr[a + 1] = nr[b + 1] = y / l; nr[a + 2] = nr[b + 2] = z / l; }
  return geo;
}
function lathe(T, pts, N, mod) { const out = []; for (let s = 0; s < pts.length - 1; s++) { const A = pts[s], B = pts[s + 1]; out.push(patch(T, 2, N, (i, j) => { const P = i ? B : A, ph = j / N * TAU; return [mod ? mod(P[0], ph) : P[0], P[1], ph]; })); } return out; }
function hexR(af, ph) { const s = Math.PI / 3; const a = ((ph % s) + s) % s - s / 2; return af / 2 / Math.cos(a); }
function threadGeo(T, s, internal) {
  const p = s.pitch, sg = s.dir === 'LH' ? -1 : 1, R = 10, N = 72;
  const len = s.y1 - s.y0, nP = Math.ceil(len / p) + 4, M = nP * R + 1, base = s.y0 - 2 * p, off = sg < 0 ? p : 0;
  const rTip = s.rMin - 0.25, run = 1.6 * p;
  return patch(T, M, N, (i, j) => {
    const ph = j / N * TAU, y = base + i * p / R + sg * p * ph / TAU + off;
    let tri = 1 - Math.abs(2 * ((i % R) / R) - 1); tri = Math.min(1, tri * 1.18);
    const yc = Math.min(s.y1, Math.max(s.y0, y)); let r;
    if (internal) { r = s.rMin + (s.rMaj - s.rMin) * tri; const de = Math.min(yc - s.y0, s.y1 - yc); r = Math.max(r, s.rMaj + 0.6 - de); }
    else {
      r = s.rMin + (s.r - s.rMin) * tri;
      const dRun = s.tip === 'end' ? yc - s.y0 : s.y1 - yc;
      if (dRun < run) { const t = Math.max(0, dRun / run), k = t * t * (3 - 2 * t); r = s.r - (s.r - r) * k; }
      r = Math.min(r, rTip + (s.tip === 'end' ? s.y1 - yc : yc - s.y0));
    }
    return [r, yc, ph];
  }, sg * R);
}
function knurlGeo(T, s) {
  const N = s.splines * 6, ys = [s.y0, s.y1 - s.taper, s.y1];
  return patch(T, 3, N, (i, j) => { const ph = j / N * TAU; if (i === 2) return [s.rNext, ys[2], ph]; const f = (ph * s.splines / TAU) % 1; const tri = 1 - Math.abs(2 * f - 1); return [s.rIn + (s.r - s.rIn) * Math.min(1, tri * 1.6), ys[i], ph]; });
}
function hexGeo(T, y0, y1, af, o) {
  const N = 96, M = Math.max(2, Math.ceil((y1 - y0) / 0.2) + 1), c0 = af / 2 * 0.96, k = 1.732, ym = (y0 + y1) / 2;
  return patch(T, M, N, (i, j) => { const ph = j / N * TAU, y = y0 + (y1 - y0) * i / (M - 1); let r = hexR(af, ph); if (o.bot) r = Math.min(r, c0 + (y - y0) * k); if (o.top) r = Math.min(r, c0 + (y1 - y) * k); if (o.groove && Math.abs(y - ym) < 0.7) r = Math.min(r, af / 2 * 1.035); return [r, y, ph]; });
}
function nutGeos(T, ng) {
  const out = [], c0 = ng.c0, rB = ng.rB, H = ng.H;
  if (ng.seat.type === 'cone60') { out.push(...lathe(T, [[rB, 0], [ng.seat.dia / 2, ng.seatH], [c0, ng.seatH]], 96)); out.push(hexGeo(T, ng.seatH, H, ng.af, { bot: true, top: true, groove: ng.idGroove })); }
  else { const fR = ng.seat.dia / 2, t = ng.seat.thickness; out.push(...lathe(T, [[rB, 0], [fR - 0.5, 0], [fR, 0.5], [fR, t]], 128)); out.push(patch(T, 2, 96, (i, j) => { const ph = j / 96 * TAU; return i ? [hexR(ng.af, ph), ng.hex0, ph] : [fR, t, ph]; })); out.push(hexGeo(T, ng.hex0, H, ng.af, { top: true, groove: ng.idGroove })); }
  out.push(...lathe(T, [[c0, H], [rB, H]], 96));
  out.push(threadGeo(T, { y0: 0, y1: H, pitch: ng.t.pitch, dir: ng.t.dir, rMaj: ng.rMaj, rMin: ng.rMin }, true));
  return out;
}
const endR = s => s.kind === 'knurl' ? s.rNext : s.kind === 'collar' ? s.r - 0.6 : s.kind === 'hex' ? s.af / 2 * 0.96 : s.r;
const startR = s => s.kind === 'knurl' ? s.rIn : s.kind === 'collar' ? s.r - 0.6 : s.kind === 'hex' ? s.af / 2 * 0.96 : s.r;
function matFactory(T) {
  const cache = {};
  return key => {
    if (cache[key]) return cache[key];
    const f = ((DATA().finishes[key] || {}).render) || { color: '#bbbbbb', metalness: 1, roughness: 0.3 };
    const m = new T.MeshPhysicalMaterial({ color: new T.Color(f.color), metalness: f.metalness, roughness: f.roughness, side: T.DoubleSide });
    if (f.iridescence) { m.iridescence = f.iridescence; m.iridescenceIOR = 1.5; m.iridescenceThicknessRange = [250, 520]; }
    return (cache[key] = m);
  };
}
function partGroup(T, p, mats) {
  const g = SS.geom(p), grp = new T.Group(), mat = mats(p.finish);
  const add = (geo, m) => grp.add(new T.Mesh(geo, m || mat));
  g.segs.forEach((s, i) => {
    const nx = g.segs[i + 1];
    if (s.kind === 'head') {
      const inner = nx && nx.kind === 'knurl' ? nx.rIn - 0.2 : (nx ? nx.r : 0);
      const mod = s.f != null ? (r, ph) => { const c = Math.cos(ph); return c > 0.02 ? Math.min(r, s.f / c) : r; } : null;
      lathe(T, [[0, 0], [s.r - s.c, 0], [s.r, s.c], [s.r, s.y1 - 0.5], [s.r - 0.5, s.y1], [inner, s.y1]], 160, mod).forEach(x => add(x));
    } else if (s.kind === 'knurl') add(knurlGeo(T, s));
    else if (s.kind === 'plain') lathe(T, [[s.r, s.y0], [s.r, s.y1]], 96).forEach(x => add(x));
    else if (s.kind === 'collar') lathe(T, [[s.r - 0.6, s.y0], [s.r, s.y0 + 0.6], [s.r, s.y1 - 0.6], [s.r - 0.6, s.y1]], 96).forEach(x => add(x));
    else if (s.kind === 'hex') add(hexGeo(T, s.y0, s.y1, s.af, { top: true, bot: true }));
    else if (s.kind === 'thread') { add(threadGeo(T, s)); const rt = s.rMin - 0.25, y = s.tip === 'end' ? s.y1 : s.y0; lathe(T, [[rt, y], [0, y]], 72).forEach(x => add(x)); }
    if (nx && s.kind !== 'head') { const a = endR(s), b = startR(nx); if (Math.abs(a - b) > 0.01) lathe(T, [[a, s.y1], [b, s.y1]], 96).forEach(x => add(x)); }
  });
  if (g.nut) { const nm = mats(g.nut.finish || p.finish); nutGeos(T, g.nut).forEach(x => { const m = new T.Mesh(x, nm); m.position.y = g.nut.y0; grp.add(m); }); }
  return { grp, g };
}
function studioEnv(T, renderer, tone) {
  const s = new T.Scene(), room = tone === 'light' ? 0.13 : 0.028;
  s.add(new T.Mesh(new T.SphereGeometry(60, 32, 16), new T.MeshBasicMaterial({ color: new T.Color(room, room, room * 1.06), side: T.BackSide })));
  const panel = (w, h, x, y, z, i, c) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(...(c || [1, 1, 1])).multiplyScalar(i), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  panel(50, 10, 0, 34, 8, 5); panel(8, 40, -38, 6, 12, 3.2); panel(8, 40, 38, 2, -6, 2.2, [1, 0.95, 0.88]); panel(40, 5, 0, -14, 38, 1.0); panel(70, 2.5, 0, 14, -42, 4);
  const pm = new T.PMREMGenerator(renderer); const tex = pm.fromScene(s, 0.02).texture; pm.dispose(); return tex;
}
const baseYawOf = p => (p.media && p.media.model && p.media.model.yaw != null) ? p.media.model.yaw : (p.template === 'wheel-nut' ? -1.0 : -0.42);
function fitDist(cam, g, yaw, aspect, fitW, fitH) {
  const vHalf = cam.fov * Math.PI / 360, hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const spanX = g.L * Math.cos(Math.abs(yaw)) + 2 * g.maxR * Math.sin(Math.abs(yaw)), spanY = 2 * g.maxR;
  return Math.max((spanX / 2) / (Math.tan(hHalf) * fitW), (spanY / 2) / (Math.tan(vHalf) * fitH));
}

/* thumbnails: one shared renderer, rendered to data URLs, context released when idle */
const thumbCache = new Map(); let TR = null, trTimer = null, trQueue = Promise.resolve();
function thumbRenderer(T) {
  if (TR) return TR;
  const r = new T.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0x000000, 0);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(26, 1, 1, 5000), key = new T.DirectionalLight(0xffffff, 1.3);
  key.position.set(-40, 60, 80); scene.add(key);
  TR = { r, scene, cam, env: {}, mats: matFactory(T) }; return TR;
}
SS.thumb = (sku, tone, w, h) => {
  tone = tone || 'dark'; w = w || 960; h = h || 600;
  const k = `${sku}|${tone}|${w}x${h}`; if (thumbCache.has(k)) return thumbCache.get(k);
  const job = trQueue.then(() => SS.three()).then(T => {
    const R = thumbRenderer(T); clearTimeout(trTimer);
    const p = SS.get(sku);
    R.r.setPixelRatio(1); R.r.setSize(w, h, false);
    R.scene.environment = R.env[tone] || (R.env[tone] = studioEnv(T, R.r, tone));
    R.r.toneMappingExposure = tone === 'light' ? 1.0 : 1.05;
    const { grp, g } = partGroup(T, p, R.mats);
    grp.position.y = -g.L / 2; const spin = new T.Group(); spin.add(grp); spin.rotation.y = 0.55;
    const ax = new T.Group(); ax.rotation.z = -Math.PI / 2; ax.add(spin);
    const yaw = baseYawOf(p) - 0.08, user = new T.Group(); user.rotation.set(0, yaw, 0); user.add(ax); R.scene.add(user);
    R.cam.aspect = w / h; R.cam.updateProjectionMatrix();
    const d = fitDist(R.cam, g, yaw, w / h, 0.84, 0.6); R.cam.position.set(0, d * 0.22, d); R.cam.lookAt(0, 0, 0);
    R.r.render(R.scene, R.cam);
    const url = R.r.domElement.toDataURL('image/png');
    R.scene.remove(user); grp.traverse(m => m.geometry && m.geometry.dispose());
    trTimer = setTimeout(() => { if (TR) { Object.values(TR.env).forEach(e => e.dispose()); TR.r.dispose(); TR.r.forceContextLoss(); TR = null; } }, 4000);
    return url;
  });
  trQueue = job.catch(() => {});
  thumbCache.set(k, job); job.catch(() => thumbCache.delete(k));
  return job;
};

/* live spinning thumbnails: ONE shared WebGL renderer draws every visible spinning card into its own 2D canvas */
const SP = { items: new Set(), raf: 0, R: null, last: 0, idle: null, W: 720, H: 450 };
function spinRenderer(T) {
  if (SP.R) return SP.R;
  const r = new T.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0); r.setPixelRatio(1); r.setSize(SP.W, SP.H, false);
  const scene = new T.Scene(); scene.environment = studioEnv(T, r, 'dark');
  const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(-40, 60, 80); scene.add(key);
  SP.R = { T, r, scene, cam: new T.PerspectiveCamera(26, SP.W / SP.H, 1, 5000), mats: matFactory(T), models: {} };
  return SP.R;
}
function spinModel(R, p) {
  if (R.models[p.slug]) return R.models[p.slug];
  const T = R.T, { grp, g } = partGroup(T, p, R.mats);
  grp.position.y = -g.L / 2; const spin = new T.Group(); spin.add(grp);
  const ax = new T.Group(); ax.rotation.z = -Math.PI / 2; ax.add(spin);
  const yaw = baseYawOf(p) - 0.08, user = new T.Group(); user.rotation.set(0, yaw, 0); user.add(ax); user.visible = false; R.scene.add(user);
  return (R.models[p.slug] = { user, spin, d: fitDist(R.cam, g, yaw, SP.W / SP.H, 0.84, 0.6) });
}
function spinTick(t) {
  if (!SP.items.size) { SP.raf = 0; return; }
  SP.raf = requestAnimationFrame(spinTick);
  const dt = SP.last ? Math.min(0.05, (t - SP.last) / 1000) : 0; SP.last = t;
  const R = SP.R; if (!R) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  SP.items.forEach(it => {
    const m = spinModel(R, it.p);
    Object.values(R.models).forEach(o => { o.user.visible = o === m; });
    it.a += dt * 0.45; m.spin.rotation.y = it.a;
    R.cam.position.set(0, m.d * 0.22, m.d); R.cam.lookAt(0, 0, 0);
    R.r.render(R.scene, R.cam);
    const c = it.canvas, cw = Math.max(1, Math.round(c.clientWidth * dpr)), ch = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    const k = Math.min(cw / SP.W, ch / SP.H), dw = SP.W * k, dh = SP.H * k;
    it.ctx.clearRect(0, 0, cw, ch); it.ctx.drawImage(R.r.domElement, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    if (!it.shown) { it.shown = true; it.onFirst && it.onFirst(); }
  });
}
SS.spinAdd = it => {
  clearTimeout(SP.idle); SP.items.add(it);
  SS.three().then(T => { if (!SP.items.has(it)) return; spinRenderer(T); if (!SP.raf) { SP.last = 0; SP.raf = requestAnimationFrame(spinTick); } }).catch(() => {});
};
SS.spinRemove = it => {
  SP.items.delete(it);
  if (SP.items.size) return;
  clearTimeout(SP.idle);
  SP.idle = setTimeout(() => {
    if (SP.items.size || !SP.R) return;
    SP.R.scene.traverse(o => o.geometry && o.geometry.dispose()); if (SP.R.scene.environment) SP.R.scene.environment.dispose();
    SP.R.r.dispose(); SP.R.r.forceContextLoss(); SP.R = null;
  }, 5000);
};

const ICON = {
  pause: '<svg viewBox="0 0 16 16"><rect x="4" y="3" width="2.6" height="10" fill="currentColor"/><rect x="9.4" y="3" width="2.6" height="10" fill="currentColor"/></svg>',
  play: '<svg viewBox="0 0 16 16"><polygon points="4.5,3 13,8 4.5,13" fill="currentColor"/></svg>',
  reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3.5 8a4.5 4.5 0 1 0 1.3-3.2"/><polyline points="3.2,2.4 3.6,5.2 6.4,4.8"/></svg>',
  minus: '<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="8" x2="13" y2="8"/></svg>',
  plus: '<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="8" x2="13" y2="8"/><line x1="8" y1="3" x2="8" y2="13"/></svg>',
  full: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="2.5,6 2.5,2.5 6,2.5"/><polyline points="10,2.5 13.5,2.5 13.5,6"/><polyline points="13.5,10 13.5,13.5 10,13.5"/><polyline points="6,13.5 2.5,13.5 2.5,10"/></svg>',
  dims: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="4.5" x2="2" y2="11.5"/><line x1="14" y1="4.5" x2="14" y2="11.5"/></svg>'
};
const VSTYLE = `
:host{display:block;position:relative;width:100%;height:100%;min-height:220px;color:#eceeef;font-family:${MONO};-webkit-user-select:none;user-select:none}
:host(:fullscreen){background:radial-gradient(ellipse at 50% 45%,#262a2e 0%,#121416 70%)}
.wrap{position:absolute;inset:0;overflow:hidden}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y;opacity:0;transition:opacity .8s ease}
canvas.on{opacity:1}canvas.drag{cursor:grabbing}
:host(:fullscreen) canvas{touch-action:none}
.fb{position:absolute;inset:18% 14%;display:flex;align-items:center;justify-content:center;opacity:.55;transition:opacity .6s}
.fb svg{width:100%;height:auto;max-height:100%}.fb.off{opacity:0}
svg.dims{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;transition:opacity .25s}
.status{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#a2a8ae;display:flex;flex-direction:column;align-items:center;gap:10px;white-space:nowrap}
.status .bar{width:120px;height:1px;background:#3a3f44;position:relative;overflow:hidden}
.status .bar::after{content:'';position:absolute;top:0;bottom:0;left:0;width:40%;background:${ACC};animation:ld 1.1s ease-in-out infinite}
.status.err .bar{display:none}.status.off{display:none}
@keyframes ld{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
@media (prefers-reduced-motion: reduce){.status .bar::after{animation:none;width:100%}}
.tag{position:absolute;left:16px;top:14px;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#8b9298;max-width:60%;line-height:1.5}
.ctrls{position:absolute;left:12px;bottom:12px;display:flex;gap:6px;flex-wrap:wrap;max-width:calc(100% - 24px)}
button{all:unset;box-sizing:border-box;height:40px;min-width:40px;padding:0 11px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.14);background:rgba(18,20,22,.72);color:#eceeef;font:500 10px/1 ${MONO};letter-spacing:.08em;text-transform:uppercase;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:2px;transition:border-color .15s,background .15s}
button:hover{border-color:rgba(255,255,255,.42)}button:focus-visible{outline:2px solid ${ACC};outline-offset:2px}
button[aria-pressed="true"]{border-color:${ACC};color:#fff}
button svg{width:14px;height:14px;flex:none}
.sep{width:1px;background:rgba(255,255,255,.1);margin:6px 2px}
.hint{position:absolute;right:16px;bottom:25px;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#8b9298}
:host([variant="hero"]) .ctrls{left:auto;right:12px}
:host([variant="hero"]) .hint,:host([variant="hero"]) .tag,:host([variant="hero"]) .x{display:none}
@media (max-width:720px){.hint{display:none}.lbl{display:none}}
`;
class SSViewer extends HTMLElement {
  static get observedAttributes() { return ['sku', 'variant']; }
  set sku(v) { if (v != null && v !== this.getAttribute('sku')) this.setAttribute('sku', v); }
  get sku() { return this.getAttribute('sku'); }
  set variant(v) { if (v != null) this.setAttribute('variant', v); }
  connectedCallback() {
    if (!this.shadowRoot) this._ui();
    this._alive = true;
    SS.onReady(() => { if (this._alive) this._setup(); });
  }
  disconnectedCallback() {
    this._alive = false; this._stop();
    this._io && this._io.disconnect(); this._ro && this._ro.disconnect(); this._io = this._ro = null;
    if (this._r) { this._disposeModel(); this._r.dispose(); this._r.forceContextLoss(); this._r = null; }
    this._loading = false;
  }
  attributeChangedCallback(name) {
    if (!this._prodReady) return;
    if (name === 'sku') { this._prod = SS.get(this.getAttribute('sku')); if (!this._prod) return; this._fallback(); if (this._r) { this._buildModel(); this.reset(true); } }
  }
  _ui() {
    const R = this.attachShadow({ mode: 'open' });
    R.innerHTML = `<style>${VSTYLE}</style><div class="wrap"><div class="fb"></div><canvas aria-label="Interactive 3D model. Drag to rotate."></canvas><svg class="dims" aria-hidden="true"></svg>
      <div class="tag">Visual approximation · see drawing for dimensions</div>
      <div class="status"><span class="bar"></span><span class="st">Loading 3D model</span></div>
      <div class="ctrls">
        <button class="b-play" title="Pause rotation" aria-label="Pause rotation">${ICON.pause}<span class="lbl">Pause</span></button>
        <button class="b-reset x" title="Reset view" aria-label="Reset view">${ICON.reset}</button>
        <button class="b-out x" title="Zoom out" aria-label="Zoom out">${ICON.minus}</button>
        <button class="b-in x" title="Zoom in" aria-label="Zoom in">${ICON.plus}</button>
        <button class="b-dims x" title="Show or hide dimensions" aria-label="Dimensions" aria-pressed="true">${ICON.dims}<span class="lbl">Dims</span></button>
        <button class="b-full x" title="Fullscreen" aria-label="Fullscreen">${ICON.full}</button>
      </div><div class="hint">Drag to rotate · Ctrl/⌘ + scroll to zoom</div></div>`;
    const q = s => R.querySelector(s);
    this._el = { canvas: q('canvas'), fb: q('.fb'), dims: q('svg.dims'), status: q('.status'), st: q('.st'), play: q('.b-play'), dimsBtn: q('.b-dims') };
    this._s = { yaw: 0, pitch: 0, zoom: 1, ty: 0, tp: 0, tz: 1, spin: 0.6 };
    this._showDims = true;
    this._reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._auto = !this._reduce;
    this._syncPlay();
    this._el.play.onclick = () => { this._auto = !this._auto; this._syncPlay(); this._dirty = true; };
    q('.b-reset').onclick = () => this.reset();
    q('.b-in').onclick = () => { this._s.tz = Math.min(3, this._s.tz * 1.25); };
    q('.b-out').onclick = () => { this._s.tz = Math.max(0.6, this._s.tz / 1.25); };
    this._el.dimsBtn.onclick = () => { this._showDims = !this._showDims; this._el.dimsBtn.setAttribute('aria-pressed', this._showDims); this._fit(); this._dirty = true; };
    q('.b-full').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (this.requestFullscreen) this.requestFullscreen().catch(() => {}); };
  }
  _syncPlay() { const b = this._el.play; b.innerHTML = (this._auto ? ICON.pause : ICON.play) + `<span class="lbl">${this._auto ? 'Pause' : 'Rotate'}</span>`; b.setAttribute('aria-label', this._auto ? 'Pause rotation' : 'Resume rotation'); b.title = b.getAttribute('aria-label'); }
  reset(instant) { const s = this._s; s.ty = 0; s.tp = 0; s.tz = 1; if (instant) { s.yaw = s.pitch = 0; s.zoom = 1; } this._dirty = true; }
  _fallback() { this._el.fb.innerHTML = SS.drawingSVG(this._prod, { theme: 'dark', dims: false, views: 'side', fs: 3, bg: 'none' }).svg; }
  _setup() {
    this._prod = SS.get(this.getAttribute('sku')); this._prodReady = true;
    if (!this._prod) return;
    this._fallback();
    this._io = new IntersectionObserver(es => { this._vis = es[0].isIntersecting; if (this._vis) { if (!this._loading) this._load(); this._start(); } else this._stop(); }, { rootMargin: '200px' });
    this._io.observe(this);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this._stop(); else if (this._vis) this._start(); });
  }
  _load() {
    this._loading = true;
    SS.three().then(T => { if (this._alive) this._init3d(T); }).catch(() => this._fail());
  }
  _fail() { const s = this._el.status; s.classList.add('err'); this._el.st.textContent = '3D preview unavailable · showing outline'; }
  _init3d(T) {
    this._T = T; const c = this._el.canvas;
    let r; try { r = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return this._fail(); }
    this._r = r; r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0);
    const scene = this._scene = new T.Scene();
    scene.environment = studioEnv(T, r, 'dark');
    const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(-40, 60, 80); scene.add(key);
    const rim = new T.DirectionalLight(0xfff1e6, 0.8); rim.position.set(60, 20, -60); scene.add(rim);
    this._cam = new T.PerspectiveCamera(26, 1, 1, 6000);
    this._mats = matFactory(T);
    this._buildModel();
    this._bindPointer();
    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this); this._resize();
    requestAnimationFrame(() => { c.classList.add('on'); this._el.fb.classList.add('off'); this._el.status.classList.add('off'); });
    if (this._vis) this._start();
  }
  _disposeModel() { if (this._user) { this._scene.remove(this._user); this._user.traverse(m => m.geometry && m.geometry.dispose()); this._user = null; } }
  _buildModel() {
    const T = this._T; this._disposeModel();
    const { grp, g } = partGroup(T, this._prod, this._mats);
    grp.position.y = -g.L / 2;
    const spin = new T.Group(); spin.add(grp); const ax = new T.Group(); ax.rotation.z = -Math.PI / 2; ax.add(spin);
    const user = new T.Group(); user.add(ax); this._scene.add(user);
    Object.assign(this, { _part: grp, _spin: spin, _user: user, _g: g, _baseYaw: baseYawOf(this._prod) });
    const hero = this.getAttribute('variant') === 'hero';
    this._call = SS.callouts(this._prod).filter(c => !(hero && c.minor));
    this._fit(); this._dirty = true; this._lastDims = '';
  }
  _fit() { if (!this._cam || !this._g) return; const hero = this.getAttribute('variant') === 'hero'; const nut = this._prod.template === 'wheel-nut'; this._dist = fitDist(this._cam, this._g, this._baseYaw, this._w / this._h || 1.6, hero ? 0.74 : (nut ? 0.5 : 0.66), nut ? (this._showDims ? 0.5 : 0.62) : (this._showDims ? 0.36 : 0.56)); }
  _resize() { const w = this.clientWidth || 600, h = this.clientHeight || 400; this._w = w; this._h = h; if (!this._r) return; this._r.setSize(w, h, false); this._cam.aspect = w / h; this._cam.updateProjectionMatrix(); this._fit(); this._dirty = true; this._lastDims = ''; }
  _bindPointer() {
    const c = this._el.canvas, s = this._s, pts = new Map(); let pinch = 0;
    c.addEventListener('pointerdown', e => { pts.set(e.pointerId, [e.clientX, e.clientY]); c.setPointerCapture(e.pointerId); this._drag = true; c.classList.add('drag'); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    c.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) s.tz = Math.min(3, Math.max(0.6, s.tz * d / pinch)); pinch = d; return; }
      s.ty += (e.clientX - prev[0]) * 0.008; s.tp = Math.max(-1.2, Math.min(1.2, s.tp + (e.clientY - prev[1]) * 0.006)); this._dirty = true;
    });
    const up = e => { pts.delete(e.pointerId); if (!pts.size) { this._drag = false; c.classList.remove('drag'); } pinch = 0; };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey || document.fullscreenElement === this)) return; e.preventDefault(); s.tz = Math.min(3, Math.max(0.6, s.tz * Math.exp(-e.deltaY * 0.0025))); }, { passive: false });
    c.addEventListener('dblclick', () => this.reset());
  }
  _start() { if (this._running || !this._r) return; this._running = true; this._last = performance.now(); const loop = t => { if (!this._running) return; this._raf = requestAnimationFrame(loop); this._frame(t); }; this._raf = requestAnimationFrame(loop); }
  _stop() { this._running = false; cancelAnimationFrame(this._raf); }
  _frame(t) {
    const dt = Math.min(0.05, (t - this._last) / 1000); this._last = t; const s = this._s;
    const moving = this._auto && !this._drag;
    if (moving) s.spin += dt * 0.42;
    const k = 1 - Math.pow(0.002, dt);
    const conv = Math.abs(s.ty - s.yaw) + Math.abs(s.tp - s.pitch) + Math.abs(s.tz - s.zoom) < 1e-4;
    if (!moving && conv && !this._dirty) return;
    this._dirty = false;
    s.yaw += (s.ty - s.yaw) * k; s.pitch += (s.tp - s.pitch) * k; s.zoom += (s.tz - s.zoom) * k;
    this._spin.rotation.y = s.spin;
    this._user.rotation.set(s.pitch, this._baseYaw + s.yaw, 0);
    const d = this._dist / s.zoom; this._cam.position.set(0, d * 0.2, d); this._cam.lookAt(0, 0, 0);
    this._r.render(this._scene, this._cam);
    this._drawDims();
  }
  _drawDims() {
    const svg = this._el.dims;
    if (!this._showDims) { if (this._lastDims) { svg.innerHTML = ''; this._lastDims = ''; } return; }
    const T = this._T, cam = this._cam, W = this._w, H = this._h, g = this._g, mw = this._part.matrixWorld;
    this._user.updateMatrixWorld(true);
    const hero = this.getAttribute('variant') === 'hero', FS = hero ? 11.5 : 10.5;
    const P = y => new T.Vector3(0, y, 0).applyMatrix4(mw);
    const pr = v => { const q = v.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H]; };
    const A = P(0), B = P(g.L), mid = A.clone().add(B).multiplyScalar(0.5);
    const axisW = B.clone().sub(A).normalize(), view = cam.position.clone().sub(mid).normalize();
    const w = axisW.clone().cross(view).normalize();
    const pm = pr(mid), pw = pr(mid.clone().add(w)); let nx = pw[0] - pm[0], ny = pw[1] - pm[1]; const ppm = Math.hypot(nx, ny) || 1; nx /= ppm; ny /= ppm; if (ny > 0) { nx = -nx; ny = -ny; }
    const sa = pr(A), sb = pr(B); let ux = sb[0] - sa[0], uy = sb[1] - sa[1]; const axLen = Math.hypot(ux, uy) || 1; ux /= axLen; uy /= axLen;
    const fore = axLen / (g.L * ppm);
    const op = Math.max(0, Math.min(1, (fore - 0.4) / 0.25));
    const R = g.maxR * ppm, col = 'rgba(236,238,239,0.62)', r2 = v => Math.round(v * 2) / 2;
    const parts = [];
    const chip = (x, y, text, key, anchor) => {
      const tw = text.length * FS * 0.68 + 14, th = FS + 10; let x0 = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
      x0 = Math.max(4, Math.min(W - tw - 4, x0)); const y0 = Math.max(4, Math.min(H - th - 4, y - th / 2));
      parts.push(`<rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(tw)}" height="${th}" rx="1.5" fill="rgba(18,20,22,0.86)" stroke="${key ? ACC : 'rgba(255,255,255,0.18)'}" stroke-width="1"/>`,
        `<text x="${r2(x0 + tw / 2)}" y="${r2(y0 + th / 2 + FS * 0.36)}" fill="#eceeef" font-family="${MONO}" font-size="${FS}" text-anchor="middle" letter-spacing="0.3">${text}</text>`);
    };
    const arrow = (x, y, dx, dy) => { const a = 7, b = 2.6; parts.push(`<path d="M${r2(x)},${r2(y)} L${r2(x - dx * a - dy * b)},${r2(y - dy * a + dx * b)} L${r2(x - dx * a + dy * b)},${r2(y - dy * a - dx * b)} Z" fill="${col}"/>`); };
    const line = (x1, y1, x2, y2) => parts.push(`<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${col}" stroke-width="1"/>`);
    this._call.forEach(c => {
      if (c.t === 'lin') {
        const off = R + 20 + c.lvl * 30, s = c.s, pa = pr(P(c.a)), pb = pr(P(c.b));
        const e1 = [pa[0] + nx * s * (c.ra * ppm + 5), pa[1] + ny * s * (c.ra * ppm + 5)], e2 = [pb[0] + nx * s * (c.rb * ppm + 5), pb[1] + ny * s * (c.rb * ppm + 5)];
        const d1 = [pa[0] + nx * s * off, pa[1] + ny * s * off], d2 = [pb[0] + nx * s * off, pb[1] + ny * s * off];
        line(e1[0], e1[1], d1[0] + nx * s * 6, d1[1] + ny * s * 6); line(e2[0], e2[1], d2[0] + nx * s * 6, d2[1] + ny * s * 6);
        line(d1[0], d1[1], d2[0], d2[1]); arrow(d1[0], d1[1], -ux, -uy); arrow(d2[0], d2[1], ux, uy);
        chip((d1[0] + d2[0]) / 2, (d1[1] + d2[1]) / 2, c.label, c.key, 'middle');
      } else {
        const s = c.s, pa = pr(P(c.y)), e = [pa[0] + nx * s * c.r * ppm, pa[1] + ny * s * c.r * ppm];
        const off = R + 20 + c.lvl * 30, dir = c.dir || (c.y < g.L / 2 ? -1 : 1);
        const q = [pa[0] + nx * s * off + ux * dir * 18, pa[1] + ny * s * off + uy * dir * 18];
        const hd = Math.sign(ux * dir) || dir, q2 = [q[0] + hd * 14, q[1]];
        parts.push(`<circle cx="${r2(e[0])}" cy="${r2(e[1])}" r="2.6" fill="${ACC}"/>`);
        line(e[0], e[1], q[0], q[1]); line(q[0], q[1], q2[0], q2[1]);
        chip(q2[0], q2[1], c.label, c.key, hd > 0 ? 'start' : 'end');
      }
    });
    const out = parts.join('');
    if (out !== this._lastDims) { svg.innerHTML = out; this._lastDims = out; }
    svg.style.opacity = op;
  }
}

class SSThumb extends HTMLElement {
  static get observedAttributes() { return ['sku', 'tone', 'spin']; }
  set spin(v) { if (v != null) this.setAttribute('spin', v); }
  set sku(v) { if (v != null) this.setAttribute('sku', v); }
  set tone(v) { if (v != null) this.setAttribute('tone', v); }
  connectedCallback() {
    if (!this.shadowRoot) { const r = this.attachShadow({ mode: 'open' }); r.innerHTML = `<style>:host{display:block;position:relative;width:100%;height:100%}.fb{position:absolute;inset:16% 12%;display:flex;align-items:center;justify-content:center;opacity:.45;transition:opacity .4s}.fb svg{width:100%;height:auto;max-height:100%}.fb.off{opacity:0}img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.2,1)}img.on{opacity:1}img.off{opacity:0}canvas{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s ease}canvas.on{opacity:1}</style><div class="fb"></div><img alt=""><canvas aria-hidden="true"></canvas>`; }
    SS.onReady(() => this._go());
  }
  disconnectedCallback() { this._io && this._io.disconnect(); this._io = null; this._cur = null; this._unspin(); }
  _unspin() { if (this._sio) { this._sio.disconnect(); this._sio = null; } if (this._spinIt) { SS.spinRemove(this._spinIt); this._spinIt = null; } }
  attributeChangedCallback() { if (this.shadowRoot && window.SS_DATA) this._go(); }
  _go() {
    const sku = this.getAttribute('sku'), tone = this.getAttribute('tone') || 'dark', p = SS.get(sku); if (!p) return;
    const key = sku + tone; if (this._cur === key) return; this._cur = key;
    const R = this.shadowRoot, fb = R.querySelector('.fb'), img = R.querySelector('img');
    fb.classList.remove('off'); img.classList.remove('on'); img.alt = p.name;
    fb.innerHTML = SS.drawingSVG(p, { theme: tone === 'dark' ? 'dark' : 'light', dims: false, views: 'side', fs: 3, bg: 'none' }).svg;
    this._unspin();
    const cv = R.querySelector('canvas'); cv.classList.remove('on'); img.classList.remove('off');
    const sp = this.getAttribute('spin');
    if (sp === 'auto' && tone === 'dark' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const it = this._spinIt = { p, canvas: cv, ctx: cv.getContext('2d'), a: 0.55, onFirst: () => { cv.classList.add('on'); img.classList.add('off'); fb.classList.add('off'); } };
      this._sio = new IntersectionObserver(es => { if (es[0].isIntersecting) SS.spinAdd(it); else SS.spinRemove(it); }, { rootMargin: '0px' });
      this._sio.observe(this);
    }
    this._io && this._io.disconnect();
    this._io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; this._io.disconnect();
      const w = +this.getAttribute('w') || 960, h = +this.getAttribute('h') || 600;
      SS.thumb(sku, tone, w, h).then(url => { if (this._cur !== key) return; img.onload = () => { img.classList.add('on'); fb.classList.add('off'); }; img.src = url; }).catch(() => {});
    }, { rootMargin: '300px' });
    this._io.observe(this);
  }
}

class SSDrawing extends HTMLElement {
  static get observedAttributes() { return ['sku', 'layout', 'theme', 'labels', 'views', 'grid', 'min-px', 'max-px']; }
  set sku(v) { if (v != null) this.setAttribute('sku', v); }
  connectedCallback() { if (!this.style.display) this.style.display = 'block'; SS.onReady(() => { this._render(); if (!this._ro) { this._ro = new ResizeObserver(() => this._render()); this._ro.observe(this); } }); }
  disconnectedCallback() { this._ro && this._ro.disconnect(); this._ro = null; this._key = null; }
  attributeChangedCallback() { if (this.isConnected && window.SS_DATA) this._render(); }
  _render() {
    const p = SS.get(this.getAttribute('sku')); if (!p) return;
    const w = this.clientWidth || 800; let layout = this.getAttribute('layout') || 'auto';
    if (layout === 'auto') layout = w < 640 ? 'stack' : 'wide';
    const A = k => this.getAttribute(k);
    const key = [p.slug, layout, Math.round(w / 24), A('theme'), A('labels'), A('views'), A('grid')].join('|'); if (key === this._key) return; this._key = key;
    const o = { layout, theme: A('theme') || 'light', labels: A('labels') || 'values', views: A('views') || 'all', grid: this.hasAttribute('grid') && A('grid') !== 'false', dims: true };
    const minPx = +A('min-px') || 11, maxPx = +A('max-px') || 14;
    let r = SS.drawingSVG(p, Object.assign({}, o, { fs: 3.2 }));
    for (let i = 0; i < 2; i++) { const ppm = w / r.w; if (r.fs * ppm >= minPx * 0.97) break; r = SS.drawingSVG(p, Object.assign({}, o, { fs: Math.min(7, minPx / ppm) })); }
    const maxW = r.w * maxPx / r.fs;
    this.innerHTML = `<div style="max-width:${Math.round(maxW)}px;margin:0 auto">${r.svg}</div>`;
  }
}
if (!customElements.get('ss-viewer')) customElements.define('ss-viewer', SSViewer);
if (!customElements.get('ss-thumb')) customElements.define('ss-thumb', SSThumb);
if (!customElements.get('ss-drawing')) customElements.define('ss-drawing', SSDrawing);
SS.onReady(() => { DATA().products.forEach(p => { const v = SS.validate(p); if (v.length) console.warn('[StudSport data]', p.partNo, v); }); });
})();
