import { company } from './catalogue';

// Canonical origin for absolute URLs (sitemap, robots). Set NEXT_PUBLIC_SITE_URL in production.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `https://${company.web}`).replace(/\/+$/, '');
