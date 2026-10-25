/* JSON is the sole source for the dimensions of every product model.
   catalogue.ts supplies product metadata and resolves its dimensions here.
   geometry.ts -> drawing.ts / three/mesh.ts -> Viewer / Thumb consume the same values.
   IMPORTANT: These are illustrative, not approved parts or fitments. */
import raw from '../data/part-models.json';
import type { Template, StudDims, DoubleEndedDims, NutDims, ProfiledDims } from './catalogue';

export type ModelStatus = 'illustrative' | 'supplier-declared' | 'verified';
export interface ModelEvidence {
  kind: 'prototype' | 'supplier-drawing' | 'oem-catalogue' | 'research-reference';
  reference: string;
  note?: string;
}
export interface ModelBase {
  sku: string;
  template: Template;
  verification: { status: ModelStatus; geometryApproved: boolean; fitmentApproved: boolean };
  source: ModelEvidence;
  visual?: { basis: 'illustrative'; edgeBreakMm: number; threadRunoutPitches: number; splineDepthMm: number };
}
export type PartModel =
  | (ModelBase & { template: 'press-in-stud' | 'stud-nut'; dimensions: StudDims })
  | (ModelBase & { template: 'double-ended'; dimensions: DoubleEndedDims })
  | (ModelBase & { template: 'wheel-nut'; dimensions: NutDims })
  | (ModelBase & { template: 'profiled-fastener'; dimensions: ProfiledDims });

if (raw.schemaVersion !== 1 || raw.unit !== 'mm') {
  throw new Error('Unsupported StudSport model schema; expected v1 and millimetres');
}
const models = raw.models as unknown as PartModel[];
const index = new Map<string, PartModel>();
for (const model of models) {
  if (index.has(model.sku)) throw new Error(`Duplicate geometry record: ${model.sku}`);
  index.set(model.sku, model);
}
export const allModels = (): readonly PartModel[] => models;
export const getModelSpec = (sku: string) => index.get(sku);

export function modelDims(sku: string, template: 'press-in-stud' | 'stud-nut'): StudDims;
export function modelDims(sku: string, template: 'double-ended'): DoubleEndedDims;
export function modelDims(sku: string, template: 'wheel-nut'): NutDims;
export function modelDims(sku: string, template: 'profiled-fastener'): ProfiledDims;
export function modelDims(sku: string, template: Template): StudDims | DoubleEndedDims | NutDims | ProfiledDims {
  const model = getModelSpec(sku);
  if (!model) throw new Error(`Missing JSON geometry for ${sku}`);
  if (model.template !== template) throw new Error(`Geometry template mismatch for ${sku}: expected ${template}, found ${model.template}`);
  return model.dimensions;
}
