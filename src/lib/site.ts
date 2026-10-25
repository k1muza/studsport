const productionFallback = 'https://studsport.vercel.app';

function origin(value: string | undefined) {
  if (!value) return productionFallback;
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return url.origin;
  } catch {
    return productionFallback;
  }
}

/**
 * The one public origin used by metadata, JSON-LD, robots and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL only after the target hostname resolves and serves this site.
 */
export const siteUrl = origin(process.env.NEXT_PUBLIC_SITE_URL);
export const isPreviewDeployment = process.env.VERCEL_ENV === 'preview';
export const allowIndexing = process.env.NODE_ENV === 'production' && !isPreviewDeployment;

export const absoluteUrl = (path = '/') => new URL(path, `${siteUrl}/`).toString();
export const productImagePath = (slug: string) => `/product-images/${slug}.svg`;
