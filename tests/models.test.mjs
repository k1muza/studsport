import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectModels } from '../scripts/model-validation.mjs';
import { neutralThreadRadius } from '../src/lib/three/neutral-thread-profile.mjs';
import { headProfileRings } from '../src/lib/three/head-profile.mjs';
import { tipChamferRadius, plainTaperRings } from '../src/lib/three/taper-profile.mjs';
const doc = JSON.parse(readFileSync(new URL('../src/data/part-models.json', import.meta.url),'utf8'));
const copy = () => structuredClone(doc);
test('all consolidated catalogue models validate', () => {assert.equal(doc.models.length,22);assert.deepEqual(inspectModels(doc),[]);});
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
  const profiles = doc.models.filter(m => m.verification.status === 'supplier-declared');
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

test('SS-3005 model follows supplier axial dimension chains and nominal spline count', () => {
  const part=doc.models.find(m=>m.sku==='SS-3005');
  const sections=part.dimensions.sections;
  assert.deepEqual(sections.map(s=>s.kind),
    ['thread','plain','collar','plain','knurl','plain','thread']);
  assert.equal(sections.reduce((n,s)=>n+s.length,0),75);
  assert.equal(sections.slice(0,3).reduce((n,s)=>n+s.length,0),37);
  assert.equal(sections.slice(3).reduce((n,s)=>n+s.length,0),38);
  assert.equal(sections.slice(3,5).reduce((n,s)=>n+s.length,0),10);
  assert.equal(sections.slice(3,6).reduce((n,s)=>n+s.length,0),16);
  assert.equal(sections[4].length,8.5);
  assert.equal(sections[4].dia,20.8);
  assert.equal(sections[4].splines,50);
  assert.equal(sections[4].visualDepthMm,0.175);
});
test('SS-3005 profile does not present schematic flange diameter as verified', () => {
  const d=doc.models.find(m=>m.sku==='SS-3005').dimensions;
  const flange=d.sections.find(s=>s.kind==='collar');
  assert.equal(flange.basis,'schematic');
  assert.match(flange.note,/Not a supplier measurement/);
  assert.match(d.uncertainties.join(' '),/outside diameter.*not dimensioned/);
  assert.match(d.measurements.map(m=>m.value).join(' '),/minimum 27 mm/);
});
test('supplier knurl visual depth is validated', () => {
  const d=copy();
  d.models.find(m=>m.sku==='SS-3005').dimensions.sections.find(s=>s.kind==='knurl').visualDepthMm=100;
  assert.match(inspectModels(d).join(' '),/invalid visual knurl depth/);
});

test('SS-3005 has 30-degree nominal left lead and right shoulder plus schematic right tip', () => {
  const dims=doc.models.find(m=>m.sku==='SS-3005').dimensions;
  const left=dims.sections[0], relief=dims.sections[5], right=dims.sections[6];
  assert.equal(dims.overall,75);
  assert.equal(left.tipChamfer.tipDiameterMm,16);
  assert.ok(Math.abs(left.tipChamfer.lengthMm - (2/Math.tan(Math.PI/6))) < 0.01);
  assert.equal(right.tipChamfer.lengthMm,4);
  assert.equal(right.tipChamfer.basis,'schematic');
  assert.equal(relief.dia,17);
  assert.equal(relief.endTaper.endDiameterMm,20);
  assert.ok(Math.abs(relief.endTaper.lengthMm - (1.5/Math.tan(Math.PI/6))) < 0.01);
  assert.deepEqual(plainTaperRings(47,53,8.5,2.6,10),[[8.5,47],[8.5,50.4],[10,53]]);
});
test('sloped left and right tips preserve end radii and the source overall length', () => {
  const L=27, left={lengthMm:3.46,tipDiameterMm:16}, right={lengthMm:4,tipDiameterMm:18};
  const le=x=>tipChamferRadius(x,0,L,10,'start',left);
  const re=x=>tipChamferRadius(x,53,75,10,'end',right);
  assert.equal(le(0),8);
  assert.equal(le(3.46),10);
  assert.equal(le(27),10);
  assert.equal(re(75),9);
  assert.equal(re(71),10);
  assert.equal(re(53),10);
  assert.ok(le(1.73)>8 && le(1.73)<10);
  assert.ok(re(73)>9 && re(73)<10);
});
test('rejects invalid chamfers and tapers without changing the source drawings', () => {
  const d=copy().models.find(m=>m.sku==='SS-3005');
  const copyDocument=copy(), p=copyDocument.models.find(m=>m.sku==='SS-3005');
  p.dimensions.sections[0].tipChamfer.lengthMm=30;
  p.dimensions.sections[5].endTaper.lengthMm=7;
  assert.match(inspectModels(copyDocument).join(' '),/invalid exposed-end chamfer/);
  assert.match(inspectModels(copyDocument).join(' '),/invalid plain-shaft taper/);
});
