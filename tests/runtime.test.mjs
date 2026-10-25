import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const dir = await mkdtemp(join(tmpdir(), 'studsport-test-'));
const result = await build({ stdin: { contents: `
  export { products } from './src/lib/catalogue';
  export { geom, validate, callouts } from './src/lib/geometry';
  export { partGroup, matFactory } from './src/lib/three/mesh';
  export { drawingSVG } from './src/lib/drawing';
  export { search, getProduct, specGroups } from './src/lib/products';
  export * as THREE from 'three';
`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false });
const file = join(dir, 'runtime.cjs');
await writeFile(file, result.outputFiles[0].text);
const api = createRequire(import.meta.url)(file);
await rm(dir, { recursive: true, force: true });

test('every actual mesh has finite normals, bounded geometry and at most two material draws', () => {
  const mats = api.matFactory(api.THREE);
  for (const p of api.products) {
    assert.deepEqual(api.validate(p), [], p.partNo);
    const { grp, g } = api.partGroup(api.THREE, p, mats);
    assert.ok(grp.children.length > 0 && grp.children.length <= 2, p.partNo);
    let vertices = 0, minY = Infinity, maxY = -Infinity;
    for (const mesh of grp.children) {
      const geometry = mesh.geometry;
      for (const key of ['position', 'normal']) assert.ok([...geometry.attributes[key].array].every(Number.isFinite), `${p.partNo} ${key}`);
      geometry.computeBoundingBox();
      assert.ok(geometry.boundingBox.min.y >= -0.001, p.partNo);
      assert.ok(geometry.boundingBox.max.y <= g.L + 0.001, p.partNo);
      minY = Math.min(minY, geometry.boundingBox.min.y);
      maxY = Math.max(maxY, geometry.boundingBox.max.y);
      vertices += geometry.attributes.position.count;
      geometry.dispose();
    }
    assert.ok(Math.abs(minY) < 0.001 && Math.abs(maxY - g.L) < 0.001, p.partNo);
    assert.ok(vertices < 100000, `${p.partNo}: ${vertices}`);
    assert.doesNotMatch(api.drawingSVG(p).svg, /NaN|Infinity|undefined/);
  }
});

test('candidate OEM codes are searchable without becoming identity aliases', () => {
  assert.deepEqual(api.search('20515519').map(p => p.partNo), ['SS-4004']);
  assert.equal(api.getProduct('20515519'), null);
  assert.equal(api.search('right hand').some(p => p.partNo === 'SS-4004'), false);
  assert.equal(api.search('left hand').some(p => p.partNo === 'SS-4004'), false);
});

test('public specs separate supplier dimensions, model values and sourcing requests', () => {
  const specs = api.specGroups(api.getProduct('SS-3003'));
  assert.ok(specs.some(g => g.group === 'Source measurements (supplier-declared)'));
  assert.ok(specs.some(g => g.group === 'Sourcing requirement (not a physical part specification)'));
  assert.ok(specs.some(g => g.group === 'Rendering'));
  const volvo = JSON.stringify(api.specGroups(api.getProduct('SS-4004')));
  assert.match(volvo, /DT2.65094 reference only/);
  assert.match(volvo, /interchangeability unproven/);
});

test('a spline beside a larger flange cannot grow beyond its specified envelope', () => {
  const knurl = api.geom(api.getProduct('SS-1041')).segs.find(s => s.kind === 'knurl');
  assert.ok(knurl.rNext <= knurl.r);
});

test('estimated Rino flange is not published as a dimension callout', () => {
  const p = api.getProduct('SS-3005');
  assert.equal(api.callouts(p).some(c => c.label.includes('Ø24')), false);
  assert.doesNotMatch(api.drawingSVG(p).svg, /Ø24/);
});
