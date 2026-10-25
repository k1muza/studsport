import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/lib/catalogue';
import { getProduct } from '@/lib/products';
import { assertCatalogueValid } from '@/lib/catalogue-check';
import { ProductView } from '@/components/product/ProductView';
import { productDescription, productMetadata, productSearchName, safeJsonLd } from '@/lib/seo';
import { absoluteUrl, productImagePath } from '@/lib/site';
import { keySpecs, typeLabel } from '@/lib/products';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  // Publish check: an invalid record fails the build instead of shipping a wrong drawing.
  assertCatalogueValid();
  return products.map(p => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? productMetadata(p) : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const path = `/products/${p.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    '@id': `${absoluteUrl(path)}#product`,
    name: productSearchName(p), sku: p.partNo, category: typeLabel(p),
    description: productDescription(p), image: absoluteUrl(productImagePath(p.slug)),
    additionalProperty: keySpecs(p).slice(0, 8).map(row => ({ '@type': 'PropertyValue', name: row.k, value: row.v })),
  };
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Products', item: absoluteUrl('/products') },
      { '@type': 'ListItem', position: 3, name: p.name, item: absoluteUrl(path) },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
    <ProductView key={p.slug} slug={p.slug} />
  </>;
}
