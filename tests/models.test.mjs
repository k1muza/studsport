import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectModels } from '../scripts/model-validation.mjs';
import { neutralThreadRadius } from '../src/lib/three/neutral-thread-profile.mjs';
import { headProfileRings } from '../src/lib/three/head-profile.mjs';
const doc = JSON.parse(readFileSync(new URL('../src/data/part-models.json', import.meta.url),'utf8'));
const copy = () => structuredClone(doc);
test('all eighteen catalogue models validate', () => {assert.equal(doc.models.length,18);assert.deepEqual(inspectModels(doc),[]);});
test('every model identifier is unique', () => assert.equal(new Set(doc.models.map(m=>m.sku)).size,doc.models.length));
test('length mismatch fails validation', () => {const x=copy();x.models[0].dimensions.overall+=1;assert.match(inspectModels(x).join(' '),/length mismatch/);});
test('thread direction must be declared', () => {const x=copy();x.models[0].dimensions.thread.dir='unknown';assert.match(inspectModels(x).join(' '),/invalid thread/);});
test('unapproved model cannot claim verified status', () => {const x=copy();x.models[0].verification.status='verified';assert.match(inspectModels(x).join(' '),/approvals required/);});
test('a duplicate part number fails', () => {const x=copy();x.models[1].sku=x.models[0].sku;assert.match(inspectModels(x).join(' '),/duplicate model/);});
test('all four parametric templates represented', () => assert.deepEqual(new Set(doc.models.map(m=>m.template)),new Set(['press-in-stud','stud-nut','double-ended','wheel-nut','profiled-fastener'])));

test('all six supplier drawings have distinct pending provenance', () => {
  const supplier=doc.models.filter(m=>m.verification.status==='supplier-declared');
  assert.equal(supplier.length,6);
  assert.equal(new Set(supplier.map(m=>m.source.reference)).size,6);
  assert.ok(supplier.every(m=>!m.verification.geometryApproved && !m.verification.fitmentApproved));
});
test('Mazda Rear conflict is retained and labelled as provisional', () => {
  const x=doc.models.find(m=>m.sku==='SS-3002');
  assert.match(x.dimensions.uncertainties.join(' '),/72 mm.*66 mm/);
  assert.equal(x.dimensions.overall,76.5);
});
test('supplier segment chain catches missing millimetres', () => {
  const x=copy(); const y=x.models.find(m=>m.sku==='SS-3006');y.dimensions.sections[0].length-=2;
  assert.match(inspectModels(x).join(' '),/profile section lengths/);
});

test('unknown-hand thread has visible grooves at the declared pitch', () => {
  const major = 10, minor = 9.15, pitch = 1.5;
  const radius = y => neutralThreadRadius(y, 0, pitch, major, minor);
  assert.equal(radius(0), minor);
  assert.equal(radius(pitch / 2), major);
  assert.equal(radius(pitch), minor);
  assert.equal(radius(pitch * 1.5), major);
  assert.ok(radius(pitch / 4) > minor && radius(pitch / 4) < major);
  assert.ok(radius(pitch / 4) === radius(pitch * 0.75));
});
test('grooves are symmetric and bounded on every supplier nominal thread', () => {
  const profiles = doc.models.filter(m => m.template === 'profiled-fastener');
  assert.equal(profiles.length, 6);
  for (const model of profiles) {
    for (const section of model.dimensions.sections.filter(s => s.kind === 'thread')) {
      assert.equal(section.thread.dir, 'UNSPECIFIED');
      const major = section.dia / 2;
      const minor = major - 0.55 * section.thread.pitch;
      const samples = Array.from({length: 120}, (_, i) =>
        neutralThreadRadius((i / 119) * section.length, 0, section.thread.pitch, major, minor));
      assert.ok(Math.min(...samples) < Math.max(...samples) - .25,
        `${model.sku}: expected visible grooves`);
      assert.ok(samples.every(v => v >= minor - 1e-9 && v <= major + 1e-9),
        `${model.sku}: radius bounds`);
    }
  }
});

test('SS-3006 central drive begins at its own section, never at world origin', () => {
  const part = doc.models.find(m => m.sku === 'SS-3006');
  const sections = part.dimensions.sections;
  const idx = sections.findIndex((s, i) => i > 0 && s.kind === 'head');
  assert.ok(idx > 0, 'expected a central double-flat drive');
  const start = sections.slice(0, idx).reduce((sum, s) => sum + s.length, 0);
  const drive = sections[idx], previous = sections[idx - 1], next = sections[idx + 1];
  assert.equal(start, 36);
  const rings = headProfileRings({
    start, end: start + drive.length, radius: drive.dia / 2,
    incomingRadius: previous.dia / 2, outgoingRadius: next.dia / 2,
  });
  assert.deepEqual(rings, [[10, 36], [16, 36], [16, 41], [11, 41]]);
  assert.ok(rings.every(([, y]) => y >= start && y <= start + drive.length));
});
test('central drive step consists of joined annular shoulders, not an extra cap', () => {
  const rings = headProfileRings({start: 36, end: 41, radius: 16, incomingRadius: 10, outgoingRadius: 11});
  assert.deepEqual(rings.map(([, y]) => y), [36,36,41,41]);
  assert.ok(rings.every(([r]) => r > 0));
});
test('original first-end heads remain capped and chamfered within their section', () => {
  const rings = headProfileRings({start: 0, end: 8, radius: 17, chamfer: 0.8, outgoingRadius: 11});
  assert.deepEqual(rings[0], [0,0]);
  assert.deepEqual(rings[rings.length-1], [11,8]);
  assert.ok(rings.every(([,y]) => y >= 0 && y <= 8));
});
