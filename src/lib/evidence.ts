import raw from '../data/product-evidence.json';
import sources from '../data/evidence-sources.json';
import measurements from '../data/supplier-measurements.json';

// Procurement categories deliberately live in a separate, unimported JSON file.
export const evidenceFor = (sku: string) => raw.records.find(r => r.sku === sku);
export const sourceFor = (id: string) => sources.sources.find(s => s.id === id);
export function evidenceLabel(sku: string) {
  return evidenceFor(sku)?.geometryBasis === 'supplier-declared'
    ? 'Supplier-declared · fitment unverified' : 'Illustrative · identification pending';
}
export function sourceMeasurements(sku: string) {
  return (measurements as Record<string, {measurements: {label:string;value:string;basis:string;note?:string}[]}>)[sku]?.measurements || [];
}
