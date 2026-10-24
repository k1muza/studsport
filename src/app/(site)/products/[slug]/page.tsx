import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/lib/catalogue';
import { getProduct } from '@/lib/products';
import { assertCatalogueValid } from '@/lib/catalogue-check';
import { ProductView } from '@/components/product/ProductView';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  // Publish check: an invalid record fails the build instead of shipping a wrong drawing.
  assertCatalogueValid();
  return products.map(p => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: `${p.partNo} · ${p.name}`, description: p.summary } : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  return <ProductView key={p.slug} slug={p.slug} />;
}
