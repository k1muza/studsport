import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/lib/catalogue';
import { getProduct } from '@/lib/products';
import { SpecSheet } from '@/components/spec/SpecSheet';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: `${p.partNo} specification`, alternates: { canonical: `/products/${p.slug}` }, robots: { index: false, follow: true } } : {};
}

export default async function SpecSheetPage({ params }: { params: Params }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  return <SpecSheet p={p} />;
}
