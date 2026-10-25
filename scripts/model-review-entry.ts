// Browser-only harness, bundled by render-model-review.mjs; never a public route.
import * as T from 'three';
import { products } from '../src/lib/catalogue';
import { partGroup, matFactory, studioEnv } from '../src/lib/three/mesh';
import { drawingSVG } from '../src/lib/drawing';

const canvas = document.createElement('canvas');
document.body.append(canvas);
const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(900, 340); renderer.setPixelRatio(1);
renderer.setClearColor('#17191c'); renderer.toneMapping = T.ACESFilmicToneMapping;
const scene = new T.Scene(); scene.environment = studioEnv(T, renderer, 'dark');
const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(-40,60,80); scene.add(key);
const mats = matFactory(T);
Object.assign(window, { modelReview: {
  skus: products.map(p => p.partNo),
  render(sku: string, view: 'side' | 'quarter') {
    const p = products.find(p => p.partNo === sku)!;
    const {grp, g} = partGroup(T, p, mats);
    grp.position.y = -g.L / 2;
    const spin = new T.Group(); spin.add(grp); spin.rotation.y = view === 'side' ? Math.PI / 2 : 0.55;
    const axis = new T.Group(); axis.rotation.z = -Math.PI / 2; axis.add(spin);
    const user = new T.Group(); user.rotation.y = view === 'side' ? 0 : -0.5; user.add(axis); scene.add(user);
    const span = Math.max(g.L * 1.17, g.maxR * 2 * 900 / 340 * 1.25);
    const cam = new T.OrthographicCamera(-span/2,span/2,span*340/1800,-span*340/1800,1,2000);
    cam.position.set(0, view === 'side' ? 0 : 32, 250); cam.lookAt(0,0,0);
    renderer.render(scene, cam);
    let vertices=0; grp.traverse(o=>{if(o instanceof T.Mesh) vertices+=o.geometry.attributes.position.count;});
    const result = { image: canvas.toDataURL('image/png'), vertices, drawCalls:renderer.info.render.calls, triangles:renderer.info.render.triangles, svg:drawingSVG(p).svg };
    scene.remove(user); grp.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});
    return result;
  }
}});
