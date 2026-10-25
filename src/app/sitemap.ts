import type { MetadataRoute } from 'next';
import { meta, products } from '@/lib/catalogue';
import { href } from '@/lib/products';
import { siteUrl } from '@/lib/site';
import { applicationPages } from '@/data/application-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = meta.generated;
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/products`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/guides/how-to-identify-and-measure-a-wheel-stud`, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${siteUrl}/vehicles`, changeFrequency: 'monthly', priority: 0.8 },
    ...applicationPages.map(page => ({ url: `${siteUrl}/vehicles/${page.slug}`, changeFrequency: 'monthly' as const, priority: 0.75 })),
    ...products.map(p => ({ url: `${siteUrl}${href(p)}`, lastModified: p.spec.date, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
