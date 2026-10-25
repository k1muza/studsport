import type { MetadataRoute } from 'next';
import { allowIndexing, siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    // noindex metadata is also present on these HTML routes; this limits unnecessary crawling.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/design-system'] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
