import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // Spec sheets are print duplicates of product pages; the design system is internal.
    rules: { userAgent: '*', allow: '/', disallow: ['/design-system', '/products/*/spec-sheet'] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
