import type { Metadata } from 'next';
import Link from 'next/link';
import { applicationPages } from '@/data/application-pages';
import { pageMetadata } from '@/lib/seo';
import s from '@/components/content/content.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Browse Wheel Studs by Vehicle',
  description: 'Research commercial-vehicle wheel stud and hub bolt references by vehicle, with measurements to check before enquiring.',
  path: '/vehicles',
});

export default function VehiclesPage() {
  return <>
    <section className={s.band}><div className={s.bandInner}>
      <nav aria-label="Breadcrumb" className={s.crumbs}><Link href="/">Home</Link><span>/</span><span>Vehicles</span></nav>
      <h1 className={s.h1}>Browse wheel studs by vehicle</h1>
      <p className={s.lede}>Use the vehicle pages to narrow the catalogue, then compare the old part’s dimensions. These research topics are not verified demand rankings or fitment guarantees.</p>
    </div></section>
    <main className={s.main}><div className={s.mainInner}><section className={s.grid}>
      {applicationPages.map(page => <Link key={page.slug} href={`/vehicles/${page.slug}`} className={s.card}><b>{page.title}</b><span>{page.intro}</span><span>View references →</span></Link>)}
    </section></div></main>
  </>;
}
