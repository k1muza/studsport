import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectModels } from '../scripts/model-validation.mjs';
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
