import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import productsData from '../src/data/products.json' with { type: 'json' };

const applicationSource = readFileSync(new URL('../src/data/application-pages.ts', import.meta.url), 'utf8');
const applicationPages = [...applicationSource.matchAll(/^\s+slug: '([^']+)'/gm)].map(match => ({ slug: match[1] }));

const origin = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const get = async path => {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
  const body = await response.text();
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return { response, body };
};
const tag = (html, name) => html.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '';
const meta = (html, name) => html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, 'i'))?.[1]
  || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i'))?.[1] || '';
const canonical = html => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || '';

const routes = ['/', '/products', '/vehicles', '/guides/how-to-identify-and-measure-a-wheel-stud',
  ...productsData.products.map(product => `/products/${product.slug}`),
  ...applicationPages.map(page => `/vehicles/${page.slug}`)];
const titles = new Set();
const internalLinks = new Set();
for (const route of routes) {
  const { body } = await get(route);
  assert.ok(tag(body, 'title'), `${route}: missing title`);
  assert.ok(tag(body, 'h1'), `${route}: missing h1`);
  assert.ok(canonical(body), `${route}: missing canonical`);
  assert.ok(meta(body, 'description'), `${route}: missing description`);
  assert.doesNotMatch(meta(body, 'robots'), /noindex/i, `${route}: unexpectedly noindex`);
  assert.doesNotThrow(() => [...body.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].forEach(match => JSON.parse(match[1])));
  titles.add(tag(body, 'title'));
  for (const match of body.matchAll(/<a[^>]+href=["']([^"']+)/gi)) {
    const url = new URL(match[1].replace(/&amp;/g, '&'), origin);
    if (url.origin === origin && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api/')) internalLinks.add(url.pathname);
  }
}
assert.equal(titles.size, routes.length, 'indexable page titles must be unique');
for (const path of internalLinks) await get(path);

for (const route of ['/design-system', '/products/ss-1001/spec-sheet', '/find-my-part', '/products?q=private-free-text']) {
  const { body } = await get(route);
  assert.match(meta(body, 'robots'), /noindex/i, `${route}: expected noindex`);
}

const product = await get('/products/ss-3001');
assert.match(product.body, /<img[^>]+src=["'][^"']*\/product-images\/ss-3001\.svg/i);
assert.match(product.body, /<h1[^>]*>Mazda Front Wheel Stud<\/h1>/i);
assert.match(product.body, /property=["']og:image["'][^>]+product-share\/ss-3001/i);
const shareImage = await fetch(`${origin}/product-share/ss-3001`);
assert.equal(shareImage.status, 200);
assert.match(shareImage.headers.get('content-type') || '', /^image\/png/);

const sitemap = await get('/sitemap.xml');
assert.equal((sitemap.body.match(/<loc>/g) || []).length, routes.length);
assert.doesNotMatch(sitemap.body, /spec-sheet|design-system|<loc>[^<]*\?/);

const robots = await get('/robots.txt');
assert.match(robots.body, /Sitemap:/i);
console.log(`Rendered SEO checks passed for ${routes.length} indexable routes at ${origin}`);
