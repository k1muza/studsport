/* three.js mesh builders. Every mesh is generated from geom(p): helical threads with the correct hand,
   knurl splines, D-flat heads, hex collars and nut seats. three is passed in (lazy-loaded), never imported eagerly. */
import type * as THREE from 'three';
import type { Product, FinishKey } from '../catalogue';
import { finishes } from '../catalogue';
import { geom, type Seg, type NutGeom, type Geom } from '../geometry';
import { threadSurfaceRadius, threadEndRadius } from './thread-surface.mjs';
import { headProfileRings } from './head-profile.mjs';
import { tipChamferRadius, plainTaperRings } from './taper-profile.mjs';

export type Three = typeof THREE;
const TAU = Math.PI * 2;

let threeP: Promise<Three> | null = null;
export const loadThree = () => threeP || (threeP = import('three'));

type Vtx = [number, number, number?];

/* M rows × (N+1) columns lathe-style patch. fn returns [radius, y, phase?]. shift welds seam normals across helix rows. */
function patch(T: Three, M: number, N: number, fn: (i: number, j: number) => Vtx, shift = 0) {
  const cols = N + 1, pos = new Float32Array(M * cols * 3);
  for (let i = 0; i < M; i++) for (let j = 0; j <= N; j++) {
    const v = fn(i, j), ph = v[2] !== undefined ? v[2] : (j / N) * TAU, k = (i * cols + j) * 3;
    pos[k] = v[0] * Math.sin(ph); pos[k + 1] = v[1]; pos[k + 2] = v[0] * Math.cos(ph);
  }
  const idx: number[] = [];
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < N; j++) { const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1; idx.push(a, b, c, b, d, c); }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const nr = geo.attributes.normal.array as Float32Array;
  for (let i = 0; i < M; i++) {
    const i2 = i + shift; if (i2 < 0 || i2 >= M) continue;
    const a = (i * cols + N) * 3, b = i2 * cols * 3;
    const x = nr[a] + nr[b], y = nr[a + 1] + nr[b + 1], z = nr[a + 2] + nr[b + 2], l = Math.hypot(x, y, z) || 1;
    nr[a] = nr[b] = x / l; nr[a + 1] = nr[b + 1] = y / l; nr[a + 2] = nr[b + 2] = z / l;
  }
  return geo;
}

function lathe(T: Three, pts: [number, number][], N: number, mod?: ((r: number, ph: number) => number) | null) {
  const out: THREE.BufferGeometry[] = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const A = pts[s], B = pts[s + 1];
    out.push(patch(T, 2, N, (i, j) => { const P = i ? B : A, ph = (j / N) * TAU; return [mod ? mod(P[0], ph) : P[0], P[1], ph]; }));
  }
  return out;
}

function hexR(af: number, ph: number) { const s = Math.PI / 3; const a = (((ph % s) + s) % s) - s / 2; return af / 2 / Math.cos(a); }

interface ThreadSpec {
  y0: number; y1: number; pitch: number; dir: 'RH' | 'LH' | 'UNSPECIFIED';
  r?: number; rMin: number; rMaj?: number; tip?: 'start' | 'end';
  tipChamfer?: { lengthMm: number; tipDiameterMm: number };
}

/* Uniform axial sampling keeps joins and end caps exactly on their boundaries. */
function threadGeo(T: Three, s: ThreadSpec, internal = false) {
  const rows = Math.max(3, Math.ceil((s.y1 - s.y0) / s.pitch * 12) + 1);
  const geometry = patch(T, rows, 64, (i,j) => {
    const y = s.y0 + (s.y1-s.y0) * i/(rows-1), angle = j/64*TAU;
    return [threadSurfaceRadius(s,y,angle,internal),y,angle];
  });
  if (internal) {
    // Bore normals face the empty bore, not the material inside the nut.
    const index = geometry.index!;
    for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}
    geometry.computeVertexNormals();
  }
  return geometry;
}

function knurlGeo(T: Three, s: Seg) {
  if (!s.splines) return patch(T, 2, 96, (i,j) => [s.r, i ? s.y1 : s.y0, (j/96)*TAU]);
  const N = s.splines * 6, ys = [s.y0, s.y1 - s.taper, s.y1];
  return patch(T, 3, N, (i, j) => {
    const ph = (j / N) * TAU;
    if (i === 2) return [s.rNext, ys[2], ph];
    const f = ((ph * s.splines) / TAU) % 1, tri = 1 - Math.abs(2 * f - 1);
    return [s.rIn + (s.r - s.rIn) * Math.min(1, tri * 1.6), ys[i], ph];
  });
}

/* Hex via af/2 / cos(φ′), with conical chamfers producing the classic arcs. */
function hexGeo(T: Three, y0: number, y1: number, af: number, o: { top?: boolean; bot?: boolean; groove?: boolean }) {
  const N = 96, M = Math.max(2, Math.ceil((y1 - y0) / 0.2) + 1), c0 = (af / 2) * 0.96, k = 1.732, ym = (y0 + y1) / 2;
  return patch(T, M, N, (i, j) => {
    const ph = (j / N) * TAU, y = y0 + ((y1 - y0) * i) / (M - 1);
    let r = hexR(af, ph);
    if (o.bot) r = Math.min(r, c0 + (y - y0) * k);
    if (o.top) r = Math.min(r, c0 + (y1 - y) * k);
    if (o.groove) {
      const distance = Math.abs(y - ym);
      // Rounded entry to the illustrative identification groove avoids a razor notch.
      const blend = Math.max(0, Math.min(1, (1.0 - distance) / 0.4));
      r -= Math.max(0, r - (af / 2) * 1.035) * blend * blend * (3 - 2 * blend);
    }
    return [r, y, ph];
  });
}

function nutGeos(T: Three, ng: NutGeom) {
  const out: THREE.BufferGeometry[] = [], c0 = ng.c0, rB = ng.rB, H = ng.H;
  if (ng.seat.type === 'cone60') {
    out.push(...lathe(T, [[rB, 0], [ng.seat.dia / 2, ng.seatH], [c0, ng.seatH]], 96));
    out.push(hexGeo(T, ng.seatH, H, ng.af, { bot: true, top: true, groove: ng.idGroove }));
  } else {
    const fR = ng.seat.dia / 2, t = ng.seat.thickness;
    out.push(...lathe(T, [[rB, 0], [fR - 0.5, 0], [fR, 0.5], [fR, t]], 128));
    out.push(patch(T, 2, 96, (i, j) => { const ph = (j / 96) * TAU; return i ? [hexR(ng.af, ph), ng.hex0, ph] : [fR, t, ph]; }));
    out.push(hexGeo(T, ng.hex0, H, ng.af, { top: true, groove: ng.idGroove }));
  }
  out.push(...lathe(T, [[c0, H], [rB, H]], 96));
  out.push(threadGeo(T, { y0: 0, y1: H, pitch: ng.t.pitch, dir: ng.t.dir, rMaj: ng.rMaj, rMin: ng.rMin }, true));
  return out;
}

const endR = (s: Seg) => (s.kind === 'thread' ? threadEndRadius(s,'end') : s.contour ? s.contour[s.contour.length-1].diameterMm/2 : s.kind === 'knurl' ? s.rNext : s.kind === 'plain' && s.endTaper ? s.endTaper.endDiameterMm / 2 : s.kind === 'collar' ? s.r - 0.6 : s.kind === 'hex' ? (s.af / 2) * 0.96 : s.r);
const startR = (s: Seg) => (s.kind === 'thread' ? threadEndRadius(s,'start') : s.contour ? s.contour[0].diameterMm/2 : s.kind === 'knurl' ? s.rIn : s.kind === 'collar' ? s.r - 0.6 : s.kind === 'hex' ? (s.af / 2) * 0.96 : s.r);

export type MatFactory = (key: FinishKey) => THREE.MeshPhysicalMaterial;

export function matFactory(T: Three): MatFactory {
  const cache: Partial<Record<FinishKey, THREE.MeshPhysicalMaterial>> = {};
  return key => {
    const hit = cache[key];
    if (hit) return hit;
    const f = finishes[key]?.render || { color: '#bbbbbb', metalness: 1, roughness: 0.3 };
    const m = new T.MeshPhysicalMaterial({ color: new T.Color(f.color), metalness: f.metalness, roughness: f.roughness, side: T.DoubleSide });
    if (f.iridescence) { m.iridescence = f.iridescence; m.iridescenceIOR = 1.5; m.iridescenceThicknessRange = [250, 520]; }
    return (cache[key] = m);
  };
}

export function partGroup(T: Three, p: Product, mats: MatFactory): { grp: THREE.Group; g: Geom } {
  const g = geom(p), grp = new T.Group(), mat = mats(p.finish);
  const add = (geo: THREE.BufferGeometry, m?: THREE.Material) => grp.add(new T.Mesh(geo, m || mat));
  g.segs.forEach((s, i) => {
    const nx = g.segs[i + 1];
    if (s.contour) {
      lathe(T,s.contour.map(p=>[p.diameterMm/2,s.y0+p.offsetMm]),96).forEach(x=>add(x));
    } else if (s.kind === 'head') {
      const prev = g.segs[i - 1];
      const inner = nx ? startR(nx) : 0;
      // A central drive flat is an axial section, NOT another head at y=0.
      // Its own annular shoulders join the neighbouring shaft diameters.
      // This also prevents the internal drive from swallowing the first thread.
      const rings = headProfileRings({
        start: s.y0, end: s.y1, radius: s.r, chamfer: s.c,
        incomingRadius: prev ? endR(prev) : null, outgoingRadius: inner,
      });
      const mod = s.f != null ? (r: number, ph: number) => {
        const c = s.shape === 'double-flat' ? Math.abs(Math.cos(ph)) : Math.cos(ph);
        return c > 0.02 ? Math.min(r, s.f! / c) : r;
      } : null;
      lathe(T, rings, 160, mod).forEach(x => add(x));
    } else if (s.kind === 'knurl') add(knurlGeo(T, s));
    else if (s.kind === 'plain') {
      const rings = s.endTaper
        ? plainTaperRings(s.y0, s.y1, s.r, s.endTaper.lengthMm, s.endTaper.endDiameterMm / 2)
        : [[s.r, s.y0], [s.r, s.y1]] as [number, number][];
      lathe(T, rings, 96).forEach(x => add(x));
    }
    else if (s.kind === 'collar') lathe(T, [[s.r - 0.6, s.y0], [s.r, s.y0 + 0.6], [s.r, s.y1 - 0.6], [s.r - 0.6, s.y1]], 96).forEach(x => add(x));
    else if (s.kind === 'hex') add(hexGeo(T, s.y0, s.y1, s.af, { top: true, bot: true }));
    else if (s.kind === 'thread') {
      add(threadGeo(T, s));
      const rt = threadEndRadius(s,s.tip);
      const y = s.tip === 'end' ? s.y1 : s.y0;
      lathe(T, [[rt, y], [0, y]], 72).forEach(x => add(x));
    }
    // A head/central-drive section already owns its entry shoulder.
    // Avoid drawing a duplicate disc at the previous segment's end.
    if (nx && s.kind !== 'head' && nx.kind !== 'head') {
      const a = endR(s), b = startR(nx);
      if (Math.abs(a - b) > 0.01) lathe(T, [[a, s.y1], [b, s.y1]], 96).forEach(x => add(x));
    }
  });
  if (g.nut) {
    const nm = mats(g.nut.finish || p.finish);
    nutGeos(T, g.nut).forEach(x => { const m = new T.Mesh(x, nm); m.position.y = g.nut!.y0; grp.add(m); });
  }
  const buckets = new Map<THREE.Material, THREE.Mesh[]>();
  for (const child of grp.children) {
    const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    const group = buckets.get(mesh.material) || []; group.push(mesh); buckets.set(mesh.material,group);
  }
  grp.clear();
  for (const [material, meshes] of buckets) {
    const positions:number[]=[], normals:number[]=[], indices:number[]=[];
    for (const mesh of meshes) {
      const geo=mesh.geometry, p=geo.attributes.position, n=geo.attributes.normal, offset=positions.length/3;
      for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i)+mesh.position.y,p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));}
      for(let i=0;i<geo.index!.count;i++) indices.push(geo.index!.getX(i)+offset);
      geo.dispose();
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setIndex(indices);
    grp.add(new T.Mesh(geo,material));
  }
  return { grp, g };
}

/* Custom PMREM studio: dark (or light) room with softbox strips. */
export function studioEnv(T: Three, renderer: THREE.WebGLRenderer, tone: 'dark' | 'light') {
  const s = new T.Scene(), room = tone === 'light' ? 0.13 : 0.028;
  s.add(new T.Mesh(new T.SphereGeometry(60, 32, 16), new T.MeshBasicMaterial({ color: new T.Color(room, room, room * 1.06), side: T.BackSide })));
  const panel = (w: number, h: number, x: number, y: number, z: number, i: number, c: [number, number, number] = [1, 1, 1]) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(...c).multiplyScalar(i), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(50, 10, 0, 34, 8, 5); panel(8, 40, -38, 6, 12, 3.2); panel(8, 40, 38, 2, -6, 2.2, [1, 0.95, 0.88]); panel(40, 5, 0, -14, 38, 1.0); panel(70, 2.5, 0, 14, -42, 4);
  const pm = new T.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.02).texture;
  pm.dispose();
  return tex;
}

export const baseYawOf = (p: Product) => (p.media?.model?.yaw != null ? p.media.model.yaw : p.template === 'wheel-nut' ? -1.0 : -0.42);

/* Camera distance that fits the part's projected span into fitW × fitH of the frame. */
export function fitDist(cam: THREE.PerspectiveCamera, g: Geom, yaw: number, aspect: number, fitW: number, fitH: number) {
  const vHalf = (cam.fov * Math.PI) / 360, hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const spanX = g.L * Math.cos(Math.abs(yaw)) + 2 * g.maxR * Math.sin(Math.abs(yaw)), spanY = 2 * g.maxR;
  return Math.max(spanX / 2 / (Math.tan(hHalf) * fitW), spanY / 2 / (Math.tan(vHalf) * fitH));
}

/* Part lies horizontal (head left): grp → spin (own axis) → ax (rotate to horizontal) → user (yaw/pitch). */
export function posedPart(T: Three, p: Product, mats: MatFactory) {
  const { grp, g } = partGroup(T, p, mats);
  grp.position.y = -g.L / 2;
  const spin = new T.Group(); spin.add(grp);
  const ax = new T.Group(); ax.rotation.z = -Math.PI / 2; ax.add(spin);
  const user = new T.Group(); user.add(ax);
  return { grp, spin, user, g };
}
