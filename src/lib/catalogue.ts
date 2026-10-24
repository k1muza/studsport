import { modelDims } from './model-data';
/* Illustrative product catalogue metadata. All 3D model dimensions live in
   src/data/part-models.json, loaded and type-checked through model-data.ts.
   None of the sample data establishes real inventory, fitment or compliance. */

export type ThreadDir = 'RH' | 'LH';
export type ProductType = 'wheel-stud' | 'hub-bolt' | 'double-ended' | 'stud-nut-set' | 'wheel-nut';
export type Template = 'press-in-stud' | 'double-ended' | 'stud-nut' | 'wheel-nut';
export type IncludesKey = 'stud' | 'nut' | 'stud-nut' | 'assembly';
export type AvailabilityKey = 'in-stock' | 'on-request' | 'confirm';
export type FinishKey = 'zinc-yellow' | 'zinc-clear' | 'zinc-flake' | 'black-phosphate' | 'black-oxide';

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
export type Product = PressInProduct | StudNutProduct | DoubleEndedProduct | WheelNutProduct;
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
  address: '[Street address], [Suburb], Harare',
  phone: '+263 77 468 4534',
  whatsapp: '+263 77 468 4534',
  whatsappShort: 'WhatsApp +263 77 468 4534',
  whatsappLink: 'https://wa.me/263774684534',
  email: '[sales@studsport.example]',
  hours: 'Mon–Fri 08:00–17:00 · Sat 08:00–13:00 [to confirm]',
  web: 'studsport.example',
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
  'black-phosphate': { label: 'Black phosphate, oiled', render: { color: '#3b3c3e', metalness: 0.6, roughness: 0.45 } },
  'black-oxide': { label: 'Black oxide', render: { color: '#2c2d2f', metalness: 0.75, roughness: 0.34 } },
};

export const vehicles: Vehicle[] = [
  { id: 'toyota-dyna', make: 'Toyota', model: 'Dyna', label: 'Toyota Dyna' },
  { id: 'hino', make: 'Hino', model: '', label: 'Hino' },
  { id: 'isuzu', make: 'Isuzu', model: '', label: 'Isuzu' },
  { id: 'mitsubishi-canter', make: 'Mitsubishi', model: 'Canter', label: 'Mitsubishi Canter' },
  { id: 'nissan-ud', make: 'Nissan / UD', model: '', label: 'Nissan / UD' },
  { id: 'volvo', make: 'Volvo', model: '', label: 'Volvo' },
  { id: 'scania', make: 'Scania', model: '', label: 'Scania' },
];

export const products: Product[] = [

  {
    id: 'p1001', slug: 'ss-1001', partNo: 'SS-1001',
    name: 'Front wheel stud M20 × 1.5 RH',
    type: 'wheel-stud', template: 'press-in-stud',
    summary: 'Press-in wheel stud with D-flat head for front hubs on light trucks. Right-hand thread, fitted to right-side wheels.',
    positions: ['Front'],
    applications: [
      { vehicle: 'toyota-dyna', model: 'Dyna 200 / 300', years: '1995–2011', position: 'Front', side: 'Right side', notes: 'Single front wheel' },
      { vehicle: 'hino', model: 'Dutro', years: '2000–2011', position: 'Front', side: 'Right side', notes: '' }
    ],
    dims: modelDims('SS-1001', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'zinc-yellow',
    includes: 'stud', components: [{ qty: 1, label: 'Wheel stud', partNo: 'SS-1001' }],
    matchingNut: 'SS-2001',
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 4.80, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: 'dyna-m20', variantLabel: 'Front · RH',
    related: ['SS-1002', 'SS-1003', 'SS-2001'],
    spec: { revision: 'B', date: '2026-09-14', status: 'illustrative' }
  },
  {
    id: 'p1002', slug: 'ss-1002', partNo: 'SS-1002',
    name: 'Front wheel stud M20 × 1.5 LH',
    type: 'wheel-stud', template: 'press-in-stud',
    summary: 'Left-hand thread version of SS-1001 for left-side front wheels. Same dimensions; the thread direction is the only difference.',
    positions: ['Front'],
    applications: [
      { vehicle: 'toyota-dyna', model: 'Dyna 200 / 300', years: '1995–2011', position: 'Front', side: 'Left side', notes: 'Single front wheel' },
      { vehicle: 'hino', model: 'Dutro', years: '2000–2011', position: 'Front', side: 'Left side', notes: '' }
    ],
    dims: modelDims('SS-1002', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'zinc-yellow',
    includes: 'stud', components: [{ qty: 1, label: 'Wheel stud, LH', partNo: 'SS-1002' }],
    matchingNut: 'SS-2003',
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 4.80, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: 'dyna-m20', variantLabel: 'Front · LH',
    related: ['SS-1001', 'SS-1003', 'SS-2003'],
    spec: { revision: 'B', date: '2026-09-14', status: 'illustrative' }
  },
  {
    id: 'p1003', slug: 'ss-1003', partNo: 'SS-1003',
    name: 'Rear wheel stud M20 × 1.5 RH, long',
    type: 'wheel-stud', template: 'press-in-stud',
    summary: 'Longer press-in stud for dual rear wheels. Extra thread length (62 mm) to clamp two rims.',
    positions: ['Rear'],
    applications: [
      { vehicle: 'toyota-dyna', model: 'Dyna 300 / 400', years: '1995–2011', position: 'Rear', side: 'Right side', notes: 'Dual rear wheels' }
    ],
    dims: modelDims('SS-1003', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'zinc-yellow',
    includes: 'stud', components: [{ qty: 1, label: 'Wheel stud, long', partNo: 'SS-1003' }],
    matchingNut: 'SS-2001',
    availability: 'on-request', fulfilment: 'Typically 5–7 working days', price: { amount: 5.60, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: 'dyna-m20', variantLabel: 'Rear · RH · long',
    related: ['SS-1001', 'SS-1002', 'SS-2001'],
    spec: { revision: 'A', date: '2026-08-02', status: 'illustrative' }
  },
  {
    id: 'p1010', slug: 'ss-1010', partNo: 'SS-1010',
    name: 'Rear hub bolt M22 × 1.5 RH',
    type: 'hub-bolt', template: 'press-in-stud',
    summary: 'Heavy press-in hub bolt with round head for rear hubs on medium trucks. Black phosphate, right-hand thread.',
    positions: ['Rear'],
    applications: [
      { vehicle: 'isuzu', model: 'N-Series NPR / NQR', years: '2004–2016', position: 'Rear', side: 'Right side', notes: '' }
    ],
    dims: modelDims('SS-1010', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'black-phosphate',
    includes: 'stud', components: [{ qty: 1, label: 'Hub bolt', partNo: 'SS-1010' }],
    matchingNut: null,
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 7.20, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: 'isuzu-m22', variantLabel: 'Rear · RH',
    related: ['SS-1011', 'SS-1030'],
    spec: { revision: 'A', date: '2026-07-21', status: 'illustrative' }
  },
  {
    id: 'p1011', slug: 'ss-1011', partNo: 'SS-1011',
    name: 'Rear hub bolt M22 × 1.5 LH',
    type: 'hub-bolt', template: 'press-in-stud',
    summary: 'Left-hand version of SS-1010 for left-side rear hubs. Same dimensions and finish.',
    positions: ['Rear'],
    applications: [
      { vehicle: 'isuzu', model: 'N-Series NPR / NQR', years: '2004–2016', position: 'Rear', side: 'Left side', notes: '' }
    ],
    dims: modelDims('SS-1011', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'black-phosphate',
    includes: 'stud', components: [{ qty: 1, label: 'Hub bolt, LH', partNo: 'SS-1011' }],
    matchingNut: null,
    availability: 'confirm', fulfilment: 'We will confirm stock and reply', price: { amount: 7.20, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: 'isuzu-m22', variantLabel: 'Rear · LH',
    related: ['SS-1010', 'SS-1030'],
    spec: { revision: 'A', date: '2026-07-21', status: 'illustrative' }
  },
  {
    id: 'p1020', slug: 'ss-1020', partNo: 'SS-1020',
    name: 'Wheel stud M18 × 1.5 RH',
    type: 'wheel-stud', template: 'press-in-stud',
    summary: 'Compact press-in stud for light-duty trucks, front and rear. Zinc-flake silver coating.',
    positions: ['Front', 'Rear'],
    applications: [
      { vehicle: 'mitsubishi-canter', model: 'Canter FE', years: '2002–2012', position: 'Front & rear', side: 'Both sides', notes: '' }
    ],
    dims: modelDims('SS-1020', 'press-in-stud'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'zinc-flake',
    includes: 'stud', components: [{ qty: 1, label: 'Wheel stud', partNo: 'SS-1020' }],
    matchingNut: null,
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 3.90, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Thread & tip detail', 'Head & knurl', 'Box of 10'], model: {} },
    variantGroup: null, variantLabel: 'M18 · RH',
    related: ['SS-1001', 'SS-1041'],
    spec: { revision: 'A', date: '2026-06-30', status: 'illustrative' }
  },
  {
    id: 'p1030', slug: 'ss-1030', partNo: 'SS-1030',
    name: 'Stud & nut set M22 × 1.5 RH',
    type: 'stud-nut-set', template: 'stud-nut',
    summary: 'Long M22 press-in stud supplied with an SS-2002 flat-seat flange nut, for trucks using flange-nut wheel fixing.',
    positions: ['Front', 'Rear'],
    applications: [
      { vehicle: 'hino', model: '500 Series', years: '2010–2020', position: 'Rear', side: 'Both sides', notes: 'Flange-nut wheels' },
      { vehicle: 'volvo', model: 'FM / FH', years: '2005–2018', position: 'Front & rear', side: 'Both sides', notes: '' },
      { vehicle: 'scania', model: 'P / G / R', years: '2005–2016', position: 'Front & rear', side: 'Both sides', notes: '' }
    ],
    dims: modelDims('SS-1030', 'stud-nut'),
    assembly: { nut: 'SS-2002', clampLength: 50 },
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'zinc-clear',
    includes: 'stud-nut', components: [
      { qty: 1, label: 'Wheel stud M22 × 1.5 RH, L 108', partNo: 'SS-1030' },
      { qty: 1, label: 'Flange nut M22 × 1.5 RH, 32 AF', partNo: 'SS-2002' }
    ],
    matchingNut: 'SS-2002',
    availability: 'on-request', fulfilment: 'Typically 5–7 working days', price: null,
    media: { photos: ['Studio · assembled', 'Nut & seat detail', 'Head & knurl', 'Set packaging'], model: {} },
    variantGroup: null, variantLabel: 'M22 · set',
    related: ['SS-2002', 'SS-1010'],
    spec: { revision: 'C', date: '2026-10-03', status: 'illustrative' }
  },
  {
    id: 'p1040', slug: 'ss-1040', partNo: 'SS-1040',
    name: 'Double-ended hub bolt M20 × 1.5, hex collar',
    type: 'double-ended', template: 'double-ended',
    summary: 'Screw-in double-ended bolt with a 27 AF hex collar for installation with a spanner. Short end into the hub, long end for the wheel.',
    positions: ['Rear'],
    applications: [
      { vehicle: 'nissan-ud', model: 'Condor', years: '1998–2012', position: 'Rear', side: 'Both sides', notes: 'Hub end screws into hub flange' }
    ],
    dims: modelDims('SS-1040', 'double-ended'),
    material: 'Alloy steel, quenched & tempered', grade: '10.9', finish: 'black-oxide',
    includes: 'stud', components: [{ qty: 1, label: 'Double-ended hub bolt', partNo: 'SS-1040' }],
    matchingNut: 'SS-2001',
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 9.50, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Hex collar detail', 'Thread ends', 'Box of 10'], model: {} },
    variantGroup: 'ud-double', variantLabel: 'M20 / M20 · hex',
    related: ['SS-1041', 'SS-2001'],
    spec: { revision: 'B', date: '2026-09-28', status: 'illustrative' }
  },
  {
    id: 'p1041', slug: 'ss-1041', partNo: 'SS-1041',
    name: 'Double-ended hub bolt M18 / M20, stepped',
    type: 'double-ended', template: 'double-ended',
    summary: 'Stepped double-ended bolt: M18 end into the axle flange, M20 end for the wheel, with a plain Ø24 collar.',
    positions: ['Rear'],
    applications: [
      { vehicle: 'nissan-ud', model: 'MK Series', years: '2000–2010', position: 'Rear', side: 'Both sides', notes: 'Axle flange' }
    ],
    dims: modelDims('SS-1041', 'double-ended'),
    material: 'Alloy steel, quenched & tempered', grade: '8.8', finish: 'zinc-yellow',
    includes: 'stud', components: [{ qty: 1, label: 'Double-ended hub bolt, stepped', partNo: 'SS-1041' }],
    matchingNut: 'SS-2001',
    availability: 'confirm', fulfilment: 'We will confirm stock and reply', price: null,
    media: { photos: ['Studio · 3/4 view', 'Collar step detail', 'Thread ends', 'Box of 10'], model: {} },
    variantGroup: 'ud-double', variantLabel: 'M18 / M20 · plain',
    related: ['SS-1040', 'SS-1020'],
    spec: { revision: 'A', date: '2026-05-12', status: 'illustrative' }
  },
  {
    id: 'p2001', slug: 'ss-2001', partNo: 'SS-2001',
    name: 'Wheel nut M20 × 1.5 RH, 60° cone seat',
    type: 'wheel-nut', template: 'wheel-nut',
    summary: 'Hex wheel nut with 60° cone seat, 32 AF. Matches SS-1001 and SS-1003 studs.',
    positions: ['Front', 'Rear'],
    applications: [
      { vehicle: 'toyota-dyna', model: 'Dyna 200 / 300 / 400', years: '1995–2011', position: 'Front & rear', side: 'Right side', notes: 'Use with SS-1001 / SS-1003' },
      { vehicle: 'hino', model: 'Dutro', years: '2000–2011', position: 'Front & rear', side: 'Right side', notes: '' }
    ],
    dims: modelDims('SS-2001', 'wheel-nut'),
    material: 'Carbon steel', grade: '10', finish: 'zinc-clear',
    includes: 'nut', components: [{ qty: 1, label: 'Wheel nut', partNo: 'SS-2001' }],
    matchingNut: null,
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 2.40, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Seat detail', 'Thread bore', 'Bag of 10'], model: {} },
    variantGroup: 'm20-cone-nut', variantLabel: 'RH',
    related: ['SS-2003', 'SS-1001', 'SS-1003'],
    spec: { revision: 'A', date: '2026-08-19', status: 'illustrative' }
  },
  {
    id: 'p2002', slug: 'ss-2002', partNo: 'SS-2002',
    name: 'Flange wheel nut M22 × 1.5 RH, flat seat',
    type: 'wheel-nut', template: 'wheel-nut',
    summary: 'Hex flange nut with flat seat, 32 AF, Ø46 flange. Supplied in the SS-1030 set or separately.',
    positions: ['Front', 'Rear'],
    applications: [
      { vehicle: 'hino', model: '500 Series', years: '2010–2020', position: 'Rear', side: 'Both sides', notes: 'Flange-nut wheels' },
      { vehicle: 'volvo', model: 'FM / FH', years: '2005–2018', position: 'Front & rear', side: 'Both sides', notes: '' },
      { vehicle: 'scania', model: 'P / G / R', years: '2005–2016', position: 'Front & rear', side: 'Both sides', notes: '' }
    ],
    dims: modelDims('SS-2002', 'wheel-nut'),
    material: 'Carbon steel', grade: '10', finish: 'zinc-flake',
    includes: 'nut', components: [{ qty: 1, label: 'Flange wheel nut', partNo: 'SS-2002' }],
    matchingNut: null,
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 3.10, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'Flange face', 'Thread bore', 'Bag of 10'], model: {} },
    variantGroup: null, variantLabel: 'M22 flange',
    related: ['SS-1030', 'SS-2001'],
    spec: { revision: 'B', date: '2026-10-03', status: 'illustrative' }
  },
  {
    id: 'p2003', slug: 'ss-2003', partNo: 'SS-2003',
    name: 'Wheel nut M20 × 1.5 LH, 60° cone seat',
    type: 'wheel-nut', template: 'wheel-nut',
    summary: 'Left-hand version of SS-2001. A groove around the hex corners identifies the left-hand thread.',
    positions: ['Front', 'Rear'],
    applications: [
      { vehicle: 'toyota-dyna', model: 'Dyna 200 / 300 / 400', years: '1995–2011', position: 'Front & rear', side: 'Left side', notes: 'Use with SS-1002' },
      { vehicle: 'hino', model: 'Dutro', years: '2000–2011', position: 'Front & rear', side: 'Left side', notes: '' }
    ],
    dims: modelDims('SS-2003', 'wheel-nut'),
    material: 'Carbon steel', grade: '10', finish: 'zinc-clear',
    includes: 'nut', components: [{ qty: 1, label: 'Wheel nut, LH', partNo: 'SS-2003' }],
    matchingNut: null,
    availability: 'in-stock', fulfilment: 'Collect today in Harare', price: { amount: 2.40, unit: 'each' },
    media: { photos: ['Studio · 3/4 view', 'LH groove detail', 'Thread bore', 'Bag of 10'], model: {} },
    variantGroup: 'm20-cone-nut', variantLabel: 'LH',
    related: ['SS-2001', 'SS-1002'],
    spec: { revision: 'A', date: '2026-08-19', status: 'illustrative' }
  }
];
