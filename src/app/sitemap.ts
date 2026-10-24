import type { MetadataRoute } from 'next';
import { meta, products } from '@/lib/catalogue';
import { href } from '@/lib/products';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = meta.generated;
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/products`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/find-my-part`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...products.map(p => ({ url: `${siteUrl}${href(p)}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
