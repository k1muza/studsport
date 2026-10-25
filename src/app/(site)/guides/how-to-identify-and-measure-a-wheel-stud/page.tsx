import type { Metadata } from 'next';
import Link from 'next/link';
import { Drawing } from '@/components/Drawing';
import { pageMetadata, safeJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import s from '@/components/content/content.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'How to Identify & Measure a Wheel Stud',
  description: 'A practical Zimbabwe guide to measuring wheel stud thread diameter, pitch, length, knurl, head shape and thread direction before requesting a replacement.',
  path: '/guides/how-to-identify-and-measure-a-wheel-stud',
});

const steps = [
  ['Identify the thread diameter and pitch', 'Measure the outside diameter of the thread with a vernier caliper. A thread gauge gives the pitch—the distance from one crest to the next. Record both, for example M20 × 1.5. Do not estimate pitch from diameter alone.'],
  ['Record overall and under-head length', 'Overall length runs end to end and includes the head. Under-head length starts at the seating face below the head. Say which length you measured; supplier drawings do not always use the same basis.'],
  ['Measure the knurl', 'On a press-in stud, measure across the tops of the splines. Also record the axial knurl length. Small diameter differences matter because the knurl is the driven section in the hub.'],
  ['Describe the head', 'Photograph the head end square-on and from the side. Note whether it is round, D-flat, double-flat, flanged or has another locating feature.'],
  ['Confirm front, rear and side', 'Record the axle position and the side from which the old part was removed. Front and rear studs may differ even on the same truck.'],
  ['Check thread direction', 'A right-hand (RH) thread tightens clockwise; a left-hand (LH) thread tightens anticlockwise. Do not infer hand from wheel position alone—check the old part or its marking.'],
];

export default function MeasureGuidePage() {
  const path = '/guides/how-to-identify-and-measure-a-wheel-stud';
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
      '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Identify and Measure a Wheel Stud in Zimbabwe',
      description: metadata.description, mainEntityOfPage: absoluteUrl(path), publisher: { '@type': 'Organization', name: 'StudSport', url: absoluteUrl('/') },
    }) }} />
    <section className={s.band}><div className={s.bandInner}><nav aria-label="Breadcrumb" className={s.crumbs}><Link href="/">Home</Link><span>/</span><span>Guides</span></nav><h1 className={s.h1}>How to identify and measure a wheel stud</h1><p className={s.lede}>A practical checklist for mechanics, parts retailers and fleet owners in Zimbabwe. A few clear measurements can separate parts that look almost identical.</p></div></section>
    <main className={s.main}><div className={s.mainInner}>
      <section className={s.section}><h2>Start with a clean, removed sample</h2><p>Clean enough rust and dirt to expose the thread and knurl without grinding away the original surface. Use a vernier caliper for diameters and lengths, and a metric thread-pitch gauge where available.</p><div className={s.drawing}><Drawing sku="ss-1001" labels="generic" views="side" layout="wide" grid /></div></section>
      <section className={s.section}><h2>Six details to record</h2><div className={s.measureList}>{steps.map(([title, body]) => <article key={title} className={s.measure}><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
      <section className={s.section}><h2>Photographs that help</h2><ul className={s.checklist}><li>full part beside a ruler, photographed straight-on</li><li>thread close-up beside a pitch gauge</li><li>head end and tip end</li><li>any stamped part number or identification groove</li></ul><p>Include the vehicle make, model, chassis designation, year if known, axle position and required quantity. Avoid sending unrelated personal documents; only the vehicle details needed to identify the part are useful.</p></section>
      <section className={s.section}><h2>Ready to compare?</h2><p>Browse the catalogue if you already know the size, or send the measurements through the enquiry form. StudSport will check the information before presenting a match or quotation.</p><div className={s.actions}><Link href="/products" className="btn btn-outline">Browse products</Link><Link href="/find-my-part" className="btn btn-accent">Send part details →</Link></div></section>
    </div></main>
  </>;
}
