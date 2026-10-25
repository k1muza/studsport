import type { Metadata } from 'next';
import { CatalogueView } from '@/components/catalogue/CatalogueView';
import { pageMetadata, safeJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { products } from '@/lib/catalogue';

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.values(sp).some(Boolean);
  return pageMetadata({
    title: 'Wheel Stud, Hub Bolt & Wheel Nut Catalogue',
    description: 'Browse 22 commercial-vehicle wheel stud, hub bolt and wheel nut references by vehicle, thread size and position.',
    path: '/products',
    index: !filtered,
  });
}

export default async function CataloguePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const initial = { q: first(sp.q), vehicle: first(sp.vehicle), types: list(sp.type), sizes: list(sp.size), dir: first(sp.dir) };
  // Keyed so navigating between filtered links (e.g. footer type links) resets client state.
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Products', item: absoluteUrl('/products') },
      ],
    }) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'StudSport product catalogue',
      numberOfItems: products.length,
      itemListElement: products.map((p, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/products/${p.slug}`), name: p.name })),
    }) }} />
    <CatalogueView key={JSON.stringify(initial)} initial={initial} />
  </>;
}
