/* Server-side publish check: measurement rules from validate() plus cross-record references.
   Runs during the build (generateStaticParams) so a bad record fails the deploy instead of rendering wrong drawings. */
import { products, vehicles } from './catalogue';
import { getProduct } from './products';
import { validate } from './geometry';

export function catalogueProblems(): string[] {
  const out: string[] = [];
  const vehicleIds = new Set(vehicles.map(v => v.id));
  for (const p of products) {
    const issues = validate(p);
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
