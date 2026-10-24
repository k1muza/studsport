/* Thumbnails.
   - Static: one shared offscreen renderer → PNG data URLs, cached per product/tone/size; context released after 4 s idle.
   - Spinning: ONE shared renderer draws every visible spinning card into its own 2D canvas each frame. */
import type * as THREE from 'three';
import type { Product } from '../catalogue';
import { getProduct } from '../products';
import { loadThree, matFactory, partGroup, posedPart, studioEnv, baseYawOf, fitDist, type Three, type MatFactory } from './mesh';

export type Tone = 'dark' | 'light';

interface ThumbRenderer { r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; env: Partial<Record<Tone, THREE.Texture>>; mats: MatFactory }

const thumbCache = new Map<string, Promise<string>>();
let TR: ThumbRenderer | null = null;
let trTimer: ReturnType<typeof setTimeout> | undefined;
let trQueue: Promise<unknown> = Promise.resolve();

function thumbRenderer(T: Three): ThumbRenderer {
  if (TR) return TR;
  const r = new T.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0x000000, 0);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(26, 1, 1, 5000), key = new T.DirectionalLight(0xffffff, 1.3);
  key.position.set(-40, 60, 80); scene.add(key);
  TR = { r, scene, cam, env: {}, mats: matFactory(T) };
  return TR;
}

export function renderThumb(sku: string, tone: Tone = 'dark', w = 960, h = 600): Promise<string> {
  const k = `${sku}|${tone}|${w}x${h}`;
  const hit = thumbCache.get(k);
  if (hit) return hit;
  const job = trQueue.then(() => loadThree()).then(T => {
    const R = thumbRenderer(T);
    clearTimeout(trTimer);
    const p = getProduct(sku);
    if (!p) throw new Error(`Unknown product ${sku}`);
    R.r.setPixelRatio(1); R.r.setSize(w, h, false);
    R.scene.environment = R.env[tone] || (R.env[tone] = studioEnv(T, R.r, tone));
    R.r.toneMappingExposure = tone === 'light' ? 1.0 : 1.05;
    const { grp, g } = partGroup(T, p, R.mats);
    grp.position.y = -g.L / 2;
    const spin = new T.Group(); spin.add(grp); spin.rotation.y = 0.55;
    const ax = new T.Group(); ax.rotation.z = -Math.PI / 2; ax.add(spin);
    const yaw = baseYawOf(p) - 0.08, user = new T.Group(); user.rotation.set(0, yaw, 0); user.add(ax); R.scene.add(user);
    R.cam.aspect = w / h; R.cam.updateProjectionMatrix();
    const d = fitDist(R.cam, g, yaw, w / h, 0.84, 0.6);
    R.cam.position.set(0, d * 0.22, d); R.cam.lookAt(0, 0, 0);
    R.r.render(R.scene, R.cam);
    const url = R.r.domElement.toDataURL('image/png');
    R.scene.remove(user);
    grp.traverse(m => { if (m instanceof T.Mesh) m.geometry.dispose(); });
    trTimer = setTimeout(() => {
      if (!TR) return;
      Object.values(TR.env).forEach(e => e?.dispose());
      TR.r.dispose(); TR.r.forceContextLoss(); TR = null;
    }, 4000);
    return url;
  });
  trQueue = job.catch(() => {});
  thumbCache.set(k, job);
  job.catch(() => thumbCache.delete(k));
  return job;
}

/* ---------- live spinning thumbnails ---------- */
export interface SpinItem { p: Product; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; a: number; shown?: boolean; onFirst?: () => void }
interface SpinModel { user: THREE.Group; spin: THREE.Group; d: number }
interface SpinRenderer { T: Three; r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; mats: MatFactory; models: Record<string, SpinModel> }

const SP = { items: new Set<SpinItem>(), raf: 0, R: null as SpinRenderer | null, last: 0, idle: undefined as ReturnType<typeof setTimeout> | undefined, W: 720, H: 450 };

function spinRenderer(T: Three): SpinRenderer {
  if (SP.R) return SP.R;
  const r = new T.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0); r.setPixelRatio(1); r.setSize(SP.W, SP.H, false);
  const scene = new T.Scene(); scene.environment = studioEnv(T, r, 'dark');
  const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(-40, 60, 80); scene.add(key);
  SP.R = { T, r, scene, cam: new T.PerspectiveCamera(26, SP.W / SP.H, 1, 5000), mats: matFactory(T), models: {} };
  return SP.R;
}

function spinModel(R: SpinRenderer, p: Product): SpinModel {
  const hit = R.models[p.slug];
  if (hit) return hit;
  const { spin, user, g } = posedPart(R.T, p, R.mats);
  const yaw = baseYawOf(p) - 0.08;
  user.rotation.set(0, yaw, 0); user.visible = false; R.scene.add(user);
  return (R.models[p.slug] = { user, spin, d: fitDist(R.cam, g, yaw, SP.W / SP.H, 0.84, 0.6) });
}

function spinTick(t: number) {
  if (!SP.items.size) { SP.raf = 0; return; }
  SP.raf = requestAnimationFrame(spinTick);
  const dt = SP.last ? Math.min(0.05, (t - SP.last) / 1000) : 0;
  SP.last = t;
  const R = SP.R;
  if (!R) return;
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
    it.ctx.clearRect(0, 0, cw, ch);
    it.ctx.drawImage(R.r.domElement, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    if (!it.shown) { it.shown = true; it.onFirst?.(); }
  });
}

export function spinAdd(it: SpinItem) {
  clearTimeout(SP.idle);
  SP.items.add(it);
  loadThree().then(T => {
    if (!SP.items.has(it)) return;
    spinRenderer(T);
    if (!SP.raf) { SP.last = 0; SP.raf = requestAnimationFrame(spinTick); }
  }).catch(() => {});
}

export function spinRemove(it: SpinItem) {
  SP.items.delete(it);
  if (SP.items.size) return;
  clearTimeout(SP.idle);
  SP.idle = setTimeout(() => {
    if (SP.items.size || !SP.R) return;
    const R = SP.R, T = R.T;
    R.scene.traverse(o => { if (o instanceof T.Mesh) o.geometry.dispose(); });
    R.scene.environment?.dispose();
    R.r.dispose(); R.r.forceContextLoss(); SP.R = null;
  }, 5000);
}
