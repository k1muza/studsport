import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectCatalogue} from '../scripts/catalogue-validation.mjs';
import {threadSurfaceRadius, threadEndRadius} from '../src/lib/three/thread-surface.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url)));
const data={models:read('part-models').models,products:read('products').products,evidence:read('product-evidence').records,sources:read('evidence-sources').sources,procurement:read('procurement-research')};
test('all original URLs, model/evidence joins and sixteen independent requests validate',()=>assert.deepEqual(inspectCatalogue(data),[]));
test('loss of historical coverage fails even if model count stays constant',()=>{const x=structuredClone(data);x.products[0].partNo='SS-9999';assert.match(inspectCatalogue(x).join(' '),/lost original SKU/);});
test('duplicate handed purchasing requests cannot pass as LH plus RH',()=>{const x=structuredClone(data);x.procurement.purchasingLines[0].requestedHand='RH';assert.match(inspectCatalogue(x).join(' '),/separate LH\/RH/);});
test('candidate references cannot be promoted into proven equivalents',()=>{const x=structuredClone(data);x.evidence.find(e=>e.references.length).references[0].relationship='equivalent';assert.match(inspectCatalogue(x).join(' '),/explicit review/);});
test('unverified reference cannot silently claim a matching nut or inventory',()=>{const x=structuredClone(data);x.products[0].matchingNut='SS-2001';assert.match(inspectCatalogue(x).join(' '),/compatibility claim/);});
test('supplier measurements preserve source tolerances independently of display contours',()=>{const x=read('supplier-measurements');assert.match(JSON.stringify(x['SS-3005']),/Z50 ±1/);assert.match(JSON.stringify(x['SS-3005']),/not dimensioned/);assert.match(JSON.stringify(x['SS-3002']),/72 mm.*66 mm/s);});
const thread={y0:0,y1:30,r:10,rMin:9.15,pitch:1.5,dir:'RH',tip:'end',tipChamfer:{lengthMm:2,tipDiameterMm:16}};
test('RH and LH surfaces are mirror images while unknown hand stays axisymmetric',()=>{
  for(let y=3;y<27;y+=0.37)for(let a=0;a<6.28;a+=0.31){assert.ok(Math.abs(threadSurfaceRadius(thread,y,a)-threadSurfaceRadius({...thread,dir:'LH'},y,-a))<1e-10);assert.equal(threadSurfaceRadius({...thread,dir:'UNSPECIFIED'},y,a),threadSurfaceRadius({...thread,dir:'UNSPECIFIED'},y,0));}
  assert.notEqual(threadSurfaceRadius(thread,5,.5),threadSurfaceRadius({...thread,dir:'LH'},5,.5));
});
test('end caps meet thread surfaces at every angle, for both tip directions',()=>{
  for(const dir of ['RH','LH','UNSPECIFIED']) for(const tip of ['start','end']){
    const t={...thread,dir,tip};for(const end of ['start','end'])for(let a=0;a<6.28;a+=.1)assert.ok(Math.abs(threadSurfaceRadius(t,end==='start'?0:30,a)-threadEndRadius(t,end))<1e-8);
  }
});
test('thread samples stay inside nominal envelope without negative radii',()=>{for(let y=0;y<=30;y+=.1)for(let a=0;a<6.28;a+=.3){const r=threadSurfaceRadius(thread,y,a);assert.ok(r>=8 && r<=10);}});
