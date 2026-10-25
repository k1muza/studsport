export interface ApplicationPage {
  slug: string;
  title: string;
  shortTitle: string;
  vehicleQuery: string;
  productSkus: string[];
  intro: string;
  sourceContext: string;
  measurementFocus: string[];
}

/** Research topics backed by existing catalogue records; they are not demand rankings or fitment claims. */
export const applicationPages: ApplicationPage[] = [
  {
    slug: 'hino-ranger-gh-rear-wheel-studs',
    title: 'Hino Ranger / GH Rear Wheel Studs',
    shortTitle: 'Hino Ranger / GH',
    vehicleQuery: 'Hino GH rear',
    productSkus: ['SS-3003', 'SS-1030'],
    intro: 'If you are identifying a rear wheel stud or hub bolt described as Hino Ranger or GH, begin with the old part—not the model name alone. The two references below have different forms and must not be treated as interchangeable.',
    sourceContext: 'SS-3003 carries the supplier label “Hino GH Rear”. SS-1030 is a separate catalogue reference with a Hino 500 Series application label. Neither establishes a Ranger/500 interchange.',
    measurementFocus: ['overall length and the supplier’s length basis', 'thread diameter, pitch and direction', 'head or collar shape', 'knurled diameter and length'],
  },
  {
    slug: 'toyota-dyna-rear-wheel-studs',
    title: 'Toyota Dyna Rear Wheel Studs',
    shortTitle: 'Toyota Dyna rear',
    vehicleQuery: 'Toyota Dyna rear',
    productSkus: ['SS-1003', 'SS-3004'],
    intro: 'Toyota Dyna rear studs can be described by vehicle name while differing in dimensions and head detail. Compare the reference drawing with the removed part and include the chassis or model designation in your enquiry.',
    sourceContext: 'SS-1003 is an illustrative Dyna 300/400 rear reference. SS-3004 preserves the supplier’s printed “Dynaps Rear” name; that source wording is not proof of a particular Dyna fitment.',
    measurementFocus: ['overall and under-head length', 'thread size and handedness', 'knurl diameter', 'head diameter and shape'],
  },
  {
    slug: 'hino-dutro-rear-wheel-bolts',
    title: 'Hino Dutro Rear Wheel Bolts',
    shortTitle: 'Hino Dutro rear',
    vehicleQuery: 'Hino Dutro rear',
    productSkus: ['SS-4001', 'SS-3006'],
    intro: 'For a Hino Dutro rear hub bolt, distinguish the thread, driven section and overall length before comparing catalogue references. Similar vehicle names in supplier material do not prove that two bolts share a hub.',
    sourceContext: 'SS-4001 is a commercial requirement for a Dutro rear bolt. SS-3006 preserves a supplier label printed as “Hino Durton Rear”; it is shown separately because the intended vehicle identity remains unresolved.',
    measurementFocus: ['overall length and threaded length', 'thread diameter and pitch', 'knurl or driven-section diameter', 'head profile and any flats'],
  },
  {
    slug: 'mazda-t35-wheel-studs',
    title: 'Mazda T35 Front & Rear Wheel Stud Identification',
    shortTitle: 'Mazda T35',
    vehicleQuery: 'Mazda wheel stud',
    productSkus: ['SS-3001', 'SS-3002'],
    intro: 'Searching for a Mazda T35 wheel stud often starts with front-versus-rear position. StudSport’s source records say only “Mazda Front” and “Mazda Rear”, so a T35 match must be checked from measurements, photographs and chassis details.',
    sourceContext: 'The T35 wording is a research search hypothesis, not a fitment claim. SS-3001 and SS-3002 reproduce separate supplier-declared front and rear references, and the rear source contains an unresolved length conflict.',
    measurementFocus: ['front or rear position', 'overall and under-head length', 'thread size and direction', 'knurl diameter and head form'],
  },
  {
    slug: 'toyota-2d-rear-wheel-bolts',
    title: 'Toyota 2D Rear Wheel Bolts',
    shortTitle: 'Toyota 2D rear',
    vehicleQuery: 'Toyota 2D rear',
    productSkus: ['SS-4002', 'SS-3005'],
    intro: 'A Toyota 2D rear wheel bolt should be identified from its thread, length and driven profile. Do not select a visually similar Toyota Rino reference without checking the removed part.',
    sourceContext: 'SS-4002 records a Toyota 2D commercial requirement. SS-3005 is a separate supplier-declared Toyota Rino reference and appears only to help explain why vehicle and sample verification matter.',
    measurementFocus: ['overall length and where it was measured from', 'thread diameter, pitch and direction', 'collar or spline profile', 'head or flange envelope'],
  },
  {
    slug: 'ud-nissan-ck10-ck20-rear-wheel-bolts',
    title: 'UD Nissan CK10 / CK20 Rear Wheel Bolts',
    shortTitle: 'UD Nissan CK10 / CK20',
    vehicleQuery: 'UD Nissan CK10 CK20 rear',
    productSkus: ['SS-4003', 'SS-1040', 'SS-1041'],
    intro: 'UD and Nissan rear hub bolts may be press-in or double-ended forms. Confirm the physical form first, then compare the threads on each end and the collar between them.',
    sourceContext: 'SS-4003 is the CK10/CK20 research requirement. SS-1040 and SS-1041 are Condor and MK Series double-ended catalogue references; they are related browsing options, not confirmed CK substitutes.',
    measurementFocus: ['press-in or double-ended construction', 'thread on each end', 'overall length', 'collar diameter or across-flats size'],
  },
  {
    slug: 'volvo-truck-rear-wheel-studs',
    title: 'Volvo Truck Rear Wheel Studs',
    shortTitle: 'Volvo truck rear',
    vehicleQuery: 'Volvo rear wheel stud',
    productSkus: ['SS-4004', 'SS-1030'],
    intro: 'For a Volvo truck rear wheel stud, include the chassis, axle position, thread direction and an old-part photograph. A part-number reference can narrow a search without proving interchangeability.',
    sourceContext: 'SS-4004 is an unverified sourcing reference that records a candidate number for research only. SS-1030 carries a broad Volvo FM/FH application label but is not asserted as the same part or as a compatible assembly with SS-2002.',
    measurementFocus: ['chassis and axle position', 'overall length', 'thread diameter, pitch and direction', 'head, collar or knurl dimensions'],
  },
];

export const getApplicationPage = (slug: string) => applicationPages.find(page => page.slug === slug);
