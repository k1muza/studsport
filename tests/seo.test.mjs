import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const dir = await mkdtemp(join(tmpdir(), 'studsport-seo-test-'));
const result = await build({ stdin: { contents: `
  export { products } from './src/lib/catalogue';
  export { productMetadata, productDescription, productSearchName, safeJsonLd } from './src/lib/seo';
  export { searchBucket, productAnalytics } from './src/lib/analytics';
  export { validateEnquiry, enquiryWhatsAppUrl } from './src/lib/enquiry';
  export { applicationPages } from './src/data/application-pages';
  export { default as sitemap } from './src/app/sitemap';
  export { POST } from './src/app/api/enquiries/route';
`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false });
const file = join(dir, 'seo-runtime.cjs');
await writeFile(file, result.outputFiles[0].text);
const api = createRequire(import.meta.url)(file);
await rm(dir, { recursive: true, force: true });

test('all 22 product pages have unique search metadata and crawlable images', () => {
  assert.equal(api.products.length, 22);
  const titles = new Set(), descriptions = new Set();
  for (const product of api.products) {
    const metadata = api.productMetadata(product);
    assert.equal(typeof metadata.title, 'string');
    assert.match(metadata.alternates.canonical, new RegExp(`/products/${product.slug}$`));
    assert.match(metadata.openGraph.images[0].url, new RegExp(`/product-share/${product.slug}$`));
    assert.equal(typeof metadata.robots.index, 'boolean');
    titles.add(metadata.title); descriptions.add(metadata.description);
  }
  assert.equal(titles.size, 22);
  assert.equal(descriptions.size, 22);
});

test('sitemap contains canonical indexable routes and excludes duplicates', () => {
  const entries = api.sitemap();
  const urls = entries.map(entry => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(urls.filter(url => /\/products\/ss-\d{4}$/.test(url)).length, 22);
  assert.equal(urls.filter(url => /\/vehicles\/[^/]+$/.test(url)).length, api.applicationPages.length);
  assert.ok(urls.some(url => url.endsWith('/guides/how-to-identify-and-measure-a-wheel-stud')));
  assert.ok(urls.every(url => !url.includes('?') && !url.includes('spec-sheet') && !url.includes('design-system') && !url.includes('find-my-part')));
});

test('analytics demand buckets never expose arbitrary search text or contact data', () => {
  assert.equal(api.searchBucket('my secret customer phrase 12345'), 'other');
  assert.equal(api.searchBucket('Need M22 x 1.5'), 'thread:M22x1.5');
  assert.equal(api.searchBucket('Toyota Dyna'), 'vehicle:toyota');
  const parameters = api.productAnalytics(api.products[0]);
  for (const forbidden of ['name', 'phone', 'email', 'vin', 'chassis', 'photo']) assert.ok(!(forbidden in parameters));
});

const validPayload = () => ({
  make: 'Toyota', model: 'Dyna', year: '', chassis: '', position: 'Rear', side: '', ptype: 'Wheel stud', qty: 10,
  partNo: 'SS-1003', sku: 'SS-1003', len: '90', dia: 'M20', pitch: '1.5', dir: 'RH', knurl: '', notes: '',
  name: 'Test User', business: '', phone: '+263771234567', email: '', method: 'WhatsApp', fulfil: 'Collect in Harare', town: '',
  source: 'website_enquiry', entryPoint: 'product_page', startedAt: Date.now() - 5000, website: '', photoCount: 0,
});

test('enquiry validation rejects spam and invalid contacts without inventing success', () => {
  assert.ok(api.validateEnquiry(validPayload()).data);
  assert.equal(api.validateEnquiry({ ...validPayload(), phone: '' }).data, undefined);
  assert.equal(api.validateEnquiry({ ...validPayload(), website: 'spam.example' }).spam, true);
  assert.equal(api.validateEnquiry({ ...validPayload(), startedAt: Date.now() }).spam, true);
});

test('enquiry endpoint returns an explicit handoff when delivery is unconfigured', async () => {
  delete process.env.RESEND_API_KEY; delete process.env.ENQUIRY_TO_EMAIL; delete process.env.RESEND_FROM_EMAIL;
  const request = new Request('https://studsport.vercel.app/api/enquiries', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://studsport.vercel.app', host: 'studsport.vercel.app', 'x-forwarded-for': 'test-handoff' }, body: JSON.stringify(validPayload()) });
  const response = await api.POST(request); const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.status, 'handoff'); assert.match(body.url, /^https:\/\/wa\.me\//);
});

test('enquiry endpoint reports delivery only after provider confirmation', async () => {
  process.env.RESEND_API_KEY = 'test'; process.env.ENQUIRY_TO_EMAIL = 'sales@example.com'; process.env.RESEND_FROM_EMAIL = 'StudSport <site@example.com>';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ id: 'email_test_123' });
  try {
    const request = new Request('https://studsport.vercel.app/api/enquiries', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://studsport.vercel.app', host: 'studsport.vercel.app', 'x-forwarded-for': 'test-delivered' }, body: JSON.stringify(validPayload()) });
    const response = await api.POST(request); const body = await response.json();
    assert.equal(response.status, 200); assert.equal(body.status, 'delivered'); assert.equal(body.deliveryId, 'email_test_123');
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.RESEND_API_KEY; delete process.env.ENQUIRY_TO_EMAIL; delete process.env.RESEND_FROM_EMAIL;
  }
});

test('JSON-LD serializer neutralizes tag injection', () => {
  assert.equal(api.safeJsonLd({ value: '</script>' }).includes('<'), false);
});
