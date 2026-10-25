import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { applicationPages, getApplicationPage } from '@/data/application-pages';
import { getProduct, href, keySpecs, threadLabel } from '@/lib/products';
import { pageMetadata, safeJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import s from '@/components/content/content.module.css';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return applicationPages.map(page => ({ slug: page.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = getApplicationPage((await params).slug);
  return page ? pageMetadata({
    title: page.title,
    description: `${page.title} references, supported dimensions and a practical checklist for identifying the old part before enquiring in Zimbabwe.`,
    path: `/vehicles/${page.slug}`,
  }) : {};
}

export default async function ApplicationPage({ params }: { params: Params }) {
  const page = getApplicationPage((await params).slug);
  if (!page) notFound();
  const products = page.productSkus.map(getProduct).filter(Boolean);
  const path = `/vehicles/${page.slug}`;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Vehicles', item: absoluteUrl('/vehicles') },
        { '@type': 'ListItem', position: 3, name: page.title, item: absoluteUrl(path) },
      ],
    }) }} />
    <section className={s.band}><div className={s.bandInner}>
      <nav aria-label="Breadcrumb" className={s.crumbs}><Link href="/">Home</Link><span>/</span><Link href="/vehicles">Vehicles</Link><span>/</span><span>{page.shortTitle}</span></nav>
      <h1 className={s.h1}>{page.title}</h1><p className={s.lede}>{page.intro}</p>
    </div></section>
    <main className={s.main}><div className={s.mainInner}>
      <section className={s.section}><h2>Catalogue references to compare</h2><p className={s.notice}>{page.sourceContext}</p>
        <div className={s.products}>{products.map(product => product && <article key={product.slug} className={s.product}>
          <div><span className={s.sku}>{product.partNo}</span><h3><Link href={href(product)}>{product.name}</Link></h3><p>{product.summary}</p><Link href={href(product)}>View drawing and full specifications →</Link></div>
          <dl className={s.specs}>{keySpecs(product).slice(0, 8).map(row => <div key={row.k}><dt>{row.k}</dt><dd>{row.v}</dd></div>)}</dl>
        </article>)}</div>
      </section>
      <section className={s.section}><h2>What to check on the old part</h2><ul className={s.checklist}>{page.measurementFocus.map(item => <li key={item}>{item}</li>)}</ul>
        <p>Measure in millimetres and photograph the old part beside a ruler. For threaded parts, confirm the diameter and pitch with a thread gauge where possible. Note whether the part came from the front or rear and the left or right side.</p>
      </section>
      <section className={s.section}><h2>Left-hand and right-hand threads</h2><p>RH threads tighten clockwise; LH threads tighten anticlockwise. Older commercial vehicles may use different directions on opposite sides, but vehicle position alone is not enough to infer thread hand. Check the old thread or a reliable part marking. The references on this page record: {products.map(product => product && `${product.partNo} — ${threadLabel(product)}`).filter(Boolean).join('; ')}.</p></section>
      <section className={s.section}><h2>Ask us to help identify it</h2><p>Send the vehicle and chassis details, quantity, measurements and a clear photograph. We will treat the catalogue as a reference and check the match before quoting.</p><div className={s.actions}><Link href={`/find-my-part?q=${encodeURIComponent(page.vehicleQuery)}`} className="btn btn-accent">Start an enquiry →</Link><Link href="/guides/how-to-identify-and-measure-a-wheel-stud" className="btn btn-outline">Read the measuring guide</Link></div></section>
      <nav aria-label="Other vehicle research pages" className={s.linkList}>{applicationPages.filter(other => other.slug !== page.slug).map(other => <Link key={other.slug} href={`/vehicles/${other.slug}`}>{other.shortTitle}</Link>)}</nav>
    </div></main>
  </>;
}
