/* Interactive 3D viewer engine (framework-free). The React <Viewer> renders the chrome and delegates here.
   - three.js loads lazily when the host comes within 200px of the viewport.
   - Slow spin about the part's own axis (0.42 rad/s) so dimension lines stay stable.
   - Drag yaw/pitch (pitch ±1.2), zoom 0.6–3× (buttons, pinch, Ctrl/⌘-scroll), double-click reset; damping 1 − 0.002^dt.
   - Pauses off-screen or in a hidden tab and skips renders when nothing moves. */
import type * as THREE from 'three';
import type { Product } from '../catalogue';
import { callouts, type Callout, type Geom } from '../geometry';
import { ACC, MONO } from '../drawing';
import { loadThree, matFactory, posedPart, studioEnv, baseYawOf, fitDist, type Three, type MatFactory } from './mesh';

export interface ViewerOptions {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  dims: SVGSVGElement;
  hero: boolean;
  onReady?: () => void;
  onFail?: () => void;
}

export class PartViewer {
  private o: ViewerOptions;
  private p: Product;
  private T: Three | null = null;
  private r: THREE.WebGLRenderer | null = null;
  private scene!: THREE.Scene;
  private cam!: THREE.PerspectiveCamera;
  private mats!: MatFactory;
  private part: THREE.Group | null = null;
  private spin: THREE.Group | null = null;
  private user: THREE.Group | null = null;
  private g: Geom | null = null;
  private baseYaw = 0;
  private calls: Callout[] = [];
  private dist = 100;
  private w = 600;
  private h = 400;
  private s = { yaw: 0, pitch: 0, zoom: 1, ty: 0, tp: 0, tz: 1, spin: 0.6 };
  private auto: boolean;
  private showDims = true;
  private dirty = true;
  private drag = false;
  private vis = false;
  private alive = true;
  private loading = false;
  private running = false;
  private raf = 0;
  private last = 0;
  private lastDims = '';
  private io: IntersectionObserver;
  private ro: ResizeObserver | null = null;
  private cleanups: (() => void)[] = [];

  constructor(p: Product, o: ViewerOptions) {
    this.p = p;
    this.o = o;
    this.auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.io = new IntersectionObserver(es => {
      this.vis = es[0].isIntersecting;
      if (this.vis) { if (!this.loading) this.load(); this.start(); } else this.stop();
    }, { rootMargin: '200px' });
    this.io.observe(o.host);
    const onVis = () => { if (document.hidden) this.stop(); else if (this.vis) this.start(); };
    document.addEventListener('visibilitychange', onVis);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));
  }

  get autoRotate() { return this.auto; }

  setAuto(v: boolean) { this.auto = v; this.dirty = true; }
  setShowDims(v: boolean) { this.showDims = v; this.fit(); this.dirty = true; }
  zoomIn() { this.s.tz = Math.min(3, this.s.tz * 1.25); }
  zoomOut() { this.s.tz = Math.max(0.6, this.s.tz / 1.25); }
  reset(instant = false) {
    const s = this.s;
    s.ty = 0; s.tp = 0; s.tz = 1;
    if (instant) { s.yaw = s.pitch = 0; s.zoom = 1; }
    this.dirty = true;
  }
  setProduct(p: Product) {
    if (p === this.p) return;
    this.p = p;
    if (this.r) { this.buildModel(); this.reset(true); }
  }

  dispose() {
    this.alive = false;
    this.stop();
    this.io.disconnect();
    this.ro?.disconnect();
    this.cleanups.forEach(f => f());
    if (this.r) { this.disposeModel(); this.r.dispose(); this.r.forceContextLoss(); this.r = null; }
  }

  private load() {
    this.loading = true;
    loadThree().then(T => { if (this.alive) this.init3d(T); }).catch(() => this.o.onFail?.());
  }

  private init3d(T: Three) {
    this.T = T;
    let r: THREE.WebGLRenderer;
    try { r = new T.WebGLRenderer({ canvas: this.o.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { this.o.onFail?.(); return; }
    this.r = r;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0);
    const scene = (this.scene = new T.Scene());
    scene.environment = studioEnv(T, r, 'dark');
    const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(-40, 60, 80); scene.add(key);
    const rim = new T.DirectionalLight(0xfff1e6, 0.8); rim.position.set(60, 20, -60); scene.add(rim);
    this.cam = new T.PerspectiveCamera(26, 1, 1, 6000);
    this.mats = matFactory(T);
    this.buildModel();
    this.bindPointer();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.o.host);
    this.resize();
    requestAnimationFrame(() => this.o.onReady?.());
    if (this.vis) this.start();
  }

  private disposeModel() {
    if (!this.user || !this.T) return;
    const T = this.T;
    this.scene.remove(this.user);
    this.user.traverse(m => { if (m instanceof T.Mesh) m.geometry.dispose(); });
    this.user = null;
  }

  private buildModel() {
    const T = this.T!;
    this.disposeModel();
    const { grp, spin, user, g } = posedPart(T, this.p, this.mats);
    this.scene.add(user);
    this.part = grp; this.spin = spin; this.user = user; this.g = g;
    this.baseYaw = baseYawOf(this.p);
    this.calls = callouts(this.p).filter(c => !(this.o.hero && c.minor));
    this.fit();
    this.dirty = true;
    this.lastDims = '';
  }

  private fit() {
    if (!this.cam || !this.g) return;
    const nut = this.p.template === 'wheel-nut';
    const fitW = this.o.hero ? 0.74 : nut ? 0.5 : 0.66;
    const fitH = nut ? (this.showDims ? 0.5 : 0.62) : this.showDims ? 0.36 : 0.56;
    this.dist = fitDist(this.cam, this.g, this.baseYaw, this.w / this.h || 1.6, fitW, fitH);
  }

  private resize() {
    const host = this.o.host;
    this.w = host.clientWidth || 600; this.h = host.clientHeight || 400;
    if (!this.r) return;
    this.r.setSize(this.w, this.h, false);
    this.cam.aspect = this.w / this.h; this.cam.updateProjectionMatrix();
    this.fit();
    this.dirty = true; this.lastDims = '';
  }

  private bindPointer() {
    const c = this.o.canvas, s = this.s, pts = new Map<number, [number, number]>();
    let pinch = 0;
    const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      c.addEventListener(type, fn, opts);
      this.cleanups.push(() => c.removeEventListener(type, fn, opts));
    };
    on('pointerdown', e => {
      pts.set(e.pointerId, [e.clientX, e.clientY]); c.setPointerCapture(e.pointerId);
      this.drag = true; c.classList.add('drag');
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    });
    on('pointermove', e => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) s.tz = Math.min(3, Math.max(0.6, (s.tz * d) / pinch));
        pinch = d; return;
      }
      s.ty += (e.clientX - prev[0]) * 0.008;
      s.tp = Math.max(-1.2, Math.min(1.2, s.tp + (e.clientY - prev[1]) * 0.006));
      this.dirty = true;
    });
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); if (!pts.size) { this.drag = false; c.classList.remove('drag'); } pinch = 0; };
    on('pointerup', up); on('pointercancel', up);
    // The plain wheel never hijacks page scroll.
    on('wheel', e => {
      if (!(e.ctrlKey || e.metaKey || document.fullscreenElement === this.o.host)) return;
      e.preventDefault();
      s.tz = Math.min(3, Math.max(0.6, s.tz * Math.exp(-e.deltaY * 0.0025)));
    }, { passive: false });
    on('dblclick', () => this.reset());
  }

  private start() {
    if (this.running || !this.r) return;
    this.running = true; this.last = performance.now();
    const loop = (t: number) => { if (!this.running) return; this.raf = requestAnimationFrame(loop); this.frame(t); };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() { this.running = false; cancelAnimationFrame(this.raf); }

  private frame(t: number) {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    const s = this.s, moving = this.auto && !this.drag;
    if (moving) s.spin += dt * 0.42;
    const k = 1 - Math.pow(0.002, dt);
    const conv = Math.abs(s.ty - s.yaw) + Math.abs(s.tp - s.pitch) + Math.abs(s.tz - s.zoom) < 1e-4;
    if (!moving && conv && !this.dirty) return;
    this.dirty = false;
    s.yaw += (s.ty - s.yaw) * k; s.pitch += (s.tp - s.pitch) * k; s.zoom += (s.tz - s.zoom) * k;
    this.spin!.rotation.y = s.spin;
    this.user!.rotation.set(s.pitch, this.baseYaw + s.yaw, 0);
    const d = this.dist / s.zoom;
    this.cam.position.set(0, d * 0.2, d); this.cam.lookAt(0, 0, 0);
    this.r!.render(this.scene, this.cam);
    this.drawDims();
  }

  /* Screen-space overlay redrawn from projected axis points; fades out when the axis is heavily foreshortened. */
  private drawDims() {
    const svg = this.o.dims;
    if (!this.showDims) { if (this.lastDims) { svg.innerHTML = ''; this.lastDims = ''; } return; }
    const T = this.T!, cam = this.cam, W = this.w, H = this.h, g = this.g!, mw = this.part!.matrixWorld;
    this.user!.updateMatrixWorld(true);
    const FS = this.o.hero ? 11.5 : 10.5;
    const P = (y: number) => new T.Vector3(0, y, 0).applyMatrix4(mw);
    const pr = (v: THREE.Vector3): [number, number] => { const q = v.clone().project(cam); return [((q.x + 1) / 2) * W, ((1 - q.y) / 2) * H]; };
    const A = P(0), B = P(g.L), mid = A.clone().add(B).multiplyScalar(0.5);
    const axisW = B.clone().sub(A).normalize(), view = cam.position.clone().sub(mid).normalize();
    const w = axisW.clone().cross(view).normalize();
    const pm = pr(mid), pw = pr(mid.clone().add(w));
    let nx = pw[0] - pm[0], ny = pw[1] - pm[1];
    const ppm = Math.hypot(nx, ny) || 1;
    nx /= ppm; ny /= ppm;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const sa = pr(A), sb = pr(B);
    let ux = sb[0] - sa[0], uy = sb[1] - sa[1];
    const axLen = Math.hypot(ux, uy) || 1;
    ux /= axLen; uy /= axLen;
    const fore = axLen / (g.L * ppm);
    const op = Math.max(0, Math.min(1, (fore - 0.4) / 0.25));
    const R = g.maxR * ppm, col = 'rgba(236,238,239,0.62)', r2 = (v: number) => Math.round(v * 2) / 2;
    const parts: string[] = [];
    const chip = (x: number, y: number, text: string, key: boolean | undefined, anchor: 'start' | 'middle' | 'end') => {
      const tw = text.length * FS * 0.68 + 14, th = FS + 10;
      let x0 = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
      x0 = Math.max(4, Math.min(W - tw - 4, x0));
      const y0 = Math.max(4, Math.min(H - th - 4, y - th / 2));
      parts.push(`<rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(tw)}" height="${th}" rx="1.5" fill="rgba(18,20,22,0.86)" stroke="${key ? ACC : 'rgba(255,255,255,0.18)'}" stroke-width="1"/>`,
        `<text x="${r2(x0 + tw / 2)}" y="${r2(y0 + th / 2 + FS * 0.36)}" fill="#eceeef" style="font-family:var(--font-mono),${MONO}" font-size="${FS}" text-anchor="middle" letter-spacing="0.3">${text}</text>`);
    };
    const arrow = (x: number, y: number, dx: number, dy: number) => {
      const a = 7, b = 2.6;
      parts.push(`<path d="M${r2(x)},${r2(y)} L${r2(x - dx * a - dy * b)},${r2(y - dy * a + dx * b)} L${r2(x - dx * a + dy * b)},${r2(y - dy * a - dx * b)} Z" fill="${col}"/>`);
    };
    const line = (x1: number, y1: number, x2: number, y2: number) => parts.push(`<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${col}" stroke-width="1"/>`);
    this.calls.forEach(c => {
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
    if (out !== this.lastDims) { svg.innerHTML = out; this.lastDims = out; }
    svg.style.opacity = String(op);
  }
}
