/* Illustrative product catalogue metadata. All 3D model dimensions live in
   src/data/part-models.json, loaded and type-checked through model-data.ts.
   None of the sample data establishes real inventory, fitment or compliance. */

export type ThreadDir = 'RH' | 'LH' | 'UNSPECIFIED';
export type ProductType = 'wheel-stud' | 'hub-bolt' | 'double-ended' | 'stud-nut-set' | 'wheel-nut';
export type Template = 'press-in-stud' | 'double-ended' | 'stud-nut' | 'wheel-nut' | 'profiled-fastener';
export type IncludesKey = 'stud' | 'nut' | 'stud-nut' | 'assembly';
export type AvailabilityKey = 'in-stock' | 'on-request' | 'confirm';
export type FinishKey = 'zinc-yellow' | 'zinc-clear' | 'zinc-flake' | 'black-phosphate' | 'black-oxide' | 'grey-phosphate' | 'finish-unconfirmed';

export interface Thread { dia: number; pitch: number; dir: ThreadDir; cls: string; length?: number; role?: string }
export interface StudThread extends Thread { length: number }
export interface EndThread extends StudThread { role: string }

export interface StudDims {
  overall: number;
  head: { shape: 'd-flat' | 'round'; dia: number; thickness: number; flatAcross?: number };
  knurl: { dia: number; length: number; splines: number };
  shoulder: { dia: number; length: number };
  thread: StudThread;
}
export interface DoubleEndedDims {
  overall: number;
  threadA: EndThread;
  collar: { shape: 'hex'; af: number; length: number; dia?: undefined } | { shape: 'round'; dia: number; length: number; af?: undefined };
  threadB: EndThread;
}
export interface NutDims {
  overall: number;
  thread: Thread;
  af: number;
  height: number;
  seat: { type: 'cone60'; dia: number; thickness?: undefined } | { type: 'flat-flange'; dia: number; thickness: number };
  idGroove: boolean;
}

/* Supplier profiles preserve axial features without forcing them into the older
   four rigid templates. Schematic segments are deliberately NOT certified dimensions. */
export interface ProfileSection {
  kind: 'head' | 'knurl' | 'plain' | 'thread' | 'hex' | 'collar';
  length: number;
  dia: number;
  basis: 'drawing' | 'derived' | 'schematic';
  note?: string;
  headShape?: 'round' | 'd-flat' | 'double-flat';
  flatAcross?: number;
  af?: number;
  splines?: number;
  /** Estimated teeth are never a declared spline count. */
  visualSplines?: { count: number; depthMm: number; basis: 'illustrative'; note: string };
  /** Render-only axial profile; endpoints must stay inside this section. */
  contour?: { offsetMm: number; diameterMm: number }[];
  contourBasis?: 'illustrative' | 'photo_estimated';
  /** Rendering-only spline depth (mm); not a manufacturing specification. */
  visualDepthMm?: number;
  /** Render-only end chamfer, applied at the exposed thread tip (not an OEM fitment spec). */
  tipChamfer?: { lengthMm: number; tipDiameterMm: number; basis: 'drawing' | 'derived' | 'schematic'; note?: string };
  /** Optional shaft-to-thread taper in the final part of a plain section. */
  endTaper?: { lengthMm: number; endDiameterMm: number; basis: 'drawing' | 'derived' | 'schematic'; note?: string };
  thread?: Thread;
}
export interface ProfiledDims {
  overall: number;
  sections: ProfileSection[];
  uncertainties: string[];
  measurements: { label: string; value: string; basis: 'drawing' | 'derived'; note?: string }[];
}

export interface Application { vehicle: string; model: string; years: string; position: string; side: string; notes: string }
export interface Component { qty: number; label: string; partNo: string }

interface ProductBase {
  id: string; slug: string; partNo: string; name: string; type: ProductType;
  summary: string; positions: string[]; applications: Application[];
  material: string; grade: string; finish: FinishKey;
  includes: IncludesKey; components: Component[]; matchingNut: string | null;
  availability: AvailabilityKey; fulfilment: string; price: { amount: number; unit: string } | null;
  media: { photos: string[]; model: { yaw?: number } };
  variantGroup: string | null; variantLabel: string; related: string[];
  spec: { revision: string; date: string; status: 'illustrative' | 'pending' | 'verified' };
}
export interface PressInProduct extends ProductBase { template: 'press-in-stud'; dims: StudDims; assembly?: undefined }
export interface StudNutProduct extends ProductBase { template: 'stud-nut'; dims: StudDims; assembly: { nut: string; clampLength: number } }
export interface DoubleEndedProduct extends ProductBase { template: 'double-ended'; dims: DoubleEndedDims; assembly?: undefined }
export interface WheelNutProduct extends ProductBase { template: 'wheel-nut'; dims: NutDims; assembly?: undefined }
export interface ProfiledProduct extends ProductBase { template: 'profiled-fastener'; dims: ProfiledDims; assembly?: undefined }
export type Product = PressInProduct | StudNutProduct | DoubleEndedProduct | WheelNutProduct | ProfiledProduct;
export type StudProduct = PressInProduct | StudNutProduct;

export interface Vehicle { id: string; make: string; model: string; label: string }
export interface FinishRender { color: string; metalness: number; roughness: number; iridescence?: number }

export const meta = {
  schemaVersion: 1,
  units: 'mm',
  currency: 'USD',
  lengthBasis: 'Overall length L is measured end to end and includes the head. Length under head Lu = L − head thickness. For press-in studs: L = H + K + S + T.',
  dataStatus: 'illustrative',
  generated: '2026-10-24',
} as const;

export const company = {
  name: 'StudSport',
  descriptor: 'Wheel Studs, Hub Bolts & Nuts',
  city: 'Harare, Zimbabwe',
  address: '4475 Southview Park, Harare',
  phone: '+263 77 468 4534',
  whatsapp: '+263 77 468 4534',
  whatsappShort: 'WhatsApp +263 77 468 4534',
  whatsappLink: 'https://wa.me/263774684534',
  email: 'sales@studsport.co.zw',
  hours: 'Mon–Fri 08:00–17:00 · Sat 08:00–13:00',
  web: 'studsport.co.zw',
};

export const productTypes: Record<ProductType, { label: string; plural: string }> = {
  'wheel-stud': { label: 'Wheel stud', plural: 'Wheel studs' },
  'hub-bolt': { label: 'Hub bolt', plural: 'Hub bolts' },
  'double-ended': { label: 'Double-ended hub bolt', plural: 'Double-ended hub bolts' },
  'stud-nut-set': { label: 'Stud & nut set', plural: 'Stud & nut sets' },
  'wheel-nut': { label: 'Wheel nut', plural: 'Wheel nuts' },
};

export const templates: Record<Template, string> = {
  'press-in-stud': 'Press-in stud: head + knurl + shoulder + thread',
  'double-ended': 'Double-ended bolt: thread A + collar + thread B',
  'stud-nut': 'Press-in stud with matching nut assembled',
  'wheel-nut': 'Hex wheel nut with seat',
  'profiled-fastener': 'Evidence-linked axial profile; estimates are not manufacturing dimensions',
};

export const includes: Record<IncludesKey, string> = {
  stud: 'Stud only',
  nut: 'Nut only',
  'stud-nut': 'Stud and nut',
  assembly: 'Complete assembly',
};

export const availability: Record<AvailabilityKey, { label: string; note: string }> = {
  'in-stock': { label: 'In stock', note: 'Counter stock in Harare' },
  'on-request': { label: 'On request', note: 'Ordered in for you · lead time confirmed on quote' },
  confirm: { label: 'Confirm availability', note: 'We will check stock and reply' },
};

export const finishes: Record<FinishKey, { label: string; render: FinishRender }> = {
  'zinc-yellow': { label: 'Yellow zinc passivated', render: { color: '#d2bd78', metalness: 1.0, roughness: 0.28, iridescence: 0.4 } },
  'zinc-clear': { label: 'Clear (bright) zinc', render: { color: '#d3d7da', metalness: 1.0, roughness: 0.2 } },
  'zinc-flake': { label: 'Zinc-flake, silver', render: { color: '#a9adb0', metalness: 0.85, roughness: 0.48 } },
  'black-phosphate': { label: 'Black phosphate, oiled', render: { color: '#55575a', metalness: 0.6, roughness: 0.46 } },
  'black-oxide': { label: 'Black oxide', render: { color: '#494b4e', metalness: 0.75, roughness: 0.38 } },
  'grey-phosphate': { label: 'Grey phosphated (supplier stated)', render: { color: '#85878a', metalness: 0.62, roughness: 0.53 } },
  'finish-unconfirmed': { label: 'Not specified by supplier', render: { color: '#8c9197', metalness: 0.58, roughness: 0.45 } },
};

export const vehicles: Vehicle[] = [
  { id: 'toyota-2d', make: 'Toyota', model: '2D', label: 'Toyota 2D' },
  { id: 'toyota-dyna', make: 'Toyota', model: 'Dyna', label: 'Toyota Dyna' },
  { id: 'mazda', make: 'Mazda', model: '', label: 'Mazda' },
  { id: 'toyota-rino', make: 'Toyota', model: 'Rino', label: 'Toyota Rino' },
  { id: 'hino', make: 'Hino', model: '', label: 'Hino' },
  { id: 'isuzu', make: 'Isuzu', model: '', label: 'Isuzu' },
  { id: 'mitsubishi-canter', make: 'Mitsubishi', model: 'Canter', label: 'Mitsubishi Canter' },
  { id: 'nissan-ud', make: 'Nissan / UD', model: '', label: 'Nissan / UD' },
  { id: 'volvo', make: 'Volvo', model: '', label: 'Volvo' },
  { id: 'scania', make: 'Scania', model: '', label: 'Scania' },
];

// Metadata and geometry are independent JSON records joined by stable SKU.
import productData from '../data/products.json';
import { getModelSpec } from './model-data';
export const products: Product[] = productData.products.map(record => {
  const model = getModelSpec(record.partNo);
  if (!model || model.template !== record.template) throw new Error(`Missing/mismatched model ${record.partNo}`);
  return { ...record, dims: model.dimensions } as Product;
});
