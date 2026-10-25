export function inspectCatalogue({models, products, evidence, sources, procurement}) {
  const errors=[];
  const unique=(items,key,label)=>{const ids=items.map(x=>x[key]);if(new Set(ids).size!==ids.length)errors.push(`duplicate ${label}`);};
  unique(products,'partNo','SKU');unique(products,'slug','URL');unique(evidence,'sku','evidence');
  unique(sources,'id','source');unique(procurement.purchasingLines,'id','purchasing line');
  const skus=new Set(products.map(p=>p.partNo)), sourceIds=new Set(sources.map(s=>s.id));
  for(const sku of ['1001','1002','1003','1010','1011','1020','1030','1040','1041','2001','2002','2003','3001','3002','3003','3004','3005','3006']) {
    const p=products.find(p=>p.partNo==='SS-'+sku);
    if(!p || p.slug!=='ss-'+sku)errors.push(`lost original SKU/URL SS-${sku}`);
  }
  for(const p of products) {
    const m=models.find(m=>m.sku===p.partNo), e=evidence.find(e=>e.sku===p.partNo);
    if(!m || m.template!==p.template)errors.push(`${p.partNo}: model link mismatch`);
    if(!e || !e.sources.length || !e.uncertainties.length)errors.push(`${p.partNo}: missing evidence/uncertainty`);
    if(e) {
      if(e.sources.some(s=>!sourceIds.has(s)) || e.references.some(r=>!sourceIds.has(r.sourceId)))errors.push(`${p.partNo}: unknown evidence source`);
      if(e.references.some(r=>r.relationship!=='candidate-only'))errors.push(`${p.partNo}: reference identity needs explicit review`);
      if(e.identityStatus==='unverified' && (p.price!==null || p.availability!=='confirm' || p.matchingNut!==null)) errors.push(`${p.partNo}: unverified commercial/compatibility claim`);
    }
    if(p.related.some(s=>!skus.has(s)))errors.push(`${p.partNo}: missing related SKU`);
  }
  if(models.some(m=>!skus.has(m.sku)))errors.push('orphan model');
  if(evidence.some(e=>!skus.has(e.sku)))errors.push('orphan evidence');
  if(procurement.families.length!==8 || procurement.purchasingLines.length!==16)errors.push('expected eight families / sixteen purchasing lines');
  for(const family of procurement.families) {
    const lines=procurement.purchasingLines.filter(l=>l.familyId===family.id);
    if(lines.length!==2 || new Set(lines.map(l=>l.requestedHand)).size!==2 || !lines.some(l=>l.requestedHand==='LH') || !lines.some(l=>l.requestedHand==='RH')) errors.push(`${family.id}: separate LH/RH purchasing lines required`);
    if(!skus.has(family.catalogueReference) || lines.some(l=>l.catalogueReference!==family.catalogueReference))errors.push(`${family.id}: missing/mismatched catalogue reference`);
    if(lines.some(l=>l.physicalVariantSku!==null || l.status!=='identification-required'))errors.push(`${family.id}: physical variant must not be inferred from a purchasing request`);
  }
  return errors;
}
