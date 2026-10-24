import type { Metadata } from 'next';
import { CatalogueView } from '@/components/catalogue/CatalogueView';

export const metadata: Metadata = { title: 'Products' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

export default async function CataloguePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const initial = { q: first(sp.q), vehicle: first(sp.vehicle), types: list(sp.type), sizes: list(sp.size), dir: first(sp.dir) };
  // Keyed so navigating between filtered links (e.g. footer type links) resets client state.
  return <CatalogueView key={JSON.stringify(initial)} initial={initial} />;
}
