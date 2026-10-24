/* Server-side publish check: measurement rules from validate() plus cross-record references.
   Runs during the build (generateStaticParams) so a bad record fails the deploy instead of rendering wrong drawings. */
import { products, vehicles } from './catalogue';
import { getProduct } from './products';
import { validate } from './geometry';
import { allModels, getModelSpec } from './model-data';

export function catalogueProblems(): string[] {
  const out: string[] = [];
  const vehicleIds = new Set(vehicles.map(v => v.id));
  const productIds = new Set(products.map(p => p.partNo));
  for (const model of allModels()) {
    if (!productIds.has(model.sku)) out.push(`Orphaned model ${model.sku}`);
  }
  for (const p of products) {
    const issues = validate(p);
    const model = getModelSpec(p.partNo);
    if (!model) issues.push('Missing JSON model');
    else {
      if (model.template !== p.template) issues.push('JSON model template mismatch');
      if (model.verification.status === 'verified' && (!model.verification.geometryApproved || !model.verification.fitmentApproved)) issues.push('Verified status requires approvals');
    }
    const refs = [...p.related, ...p.components.map(c => c.partNo), ...(p.matchingNut ? [p.matchingNut] : [])];
    refs.forEach(r => { if (!getProduct(r)) issues.push(`Unknown part reference ${r}`); });
    p.applications.forEach(a => { if (!vehicleIds.has(a.vehicle)) issues.push(`Unknown vehicle ${a.vehicle}`); });
    issues.forEach(i => out.push(`${p.partNo}: ${i}`));
  }
  return out;
}

export function assertCatalogueValid() {
  const problems = catalogueProblems();
  if (problems.length) throw new Error(`[StudSport data] ${problems.length} problem(s):\n` + problems.join('\n'));
}
