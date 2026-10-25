import { ImageResponse } from 'next/og';
import { ProductShareImage } from '@/components/ProductShareImage';
import { getProduct } from '@/lib/products';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) return new Response('Not found', { status: 404 });
  return new ImageResponse(ProductShareImage({ product }), {
    width: 1200,
    height: 630,
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  });
}
