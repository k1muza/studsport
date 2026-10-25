// npm run review:models; set CHROMIUM_EXECUTABLE_PATH for an existing browser.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const root = process.cwd();
const phase = process.argv[2] || 'after';
const sheetsOnly = process.argv.includes('--sheets-only');
if (!/^[a-z0-9-]+$/.test(phase)) throw new Error('Use an alphanumeric review name');
const out = path.join(root, 'docs/model-research/visuals', phase);
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'studsport-review-'));
const port = process.env.REVIEW_PORT || '3100';
const origin = `http://127.0.0.1:${port}`;
let server, browser;
try {
  await fs.mkdir(out, { recursive: true });
  await build({ entryPoints: ['scripts/model-review-entry.ts'], bundle: true, format: 'iife', outfile: path.join(temp, 'review.js') });
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', port, '--hostname', '127.0.0.1'], {
    cwd: root, env: { ...process.env, STUDSPORT_BUILD_DIR: `.next-review-${phase}` }, stdio: ['ignore', 'ignore', 'inherit'],
  });
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error(`Review server exited: ${server.exitCode}`);
    try { if ((await fetch(`${origin}/products`, { signal: AbortSignal.timeout(2000) })).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Review server did not become ready');
  const custom = process.env.CHROMIUM_EXECUTABLE_PATH;
  browser = await chromium.launch({ headless: true, ...(custom ? { executablePath: custom, args: [
    '--no-sandbox', '--no-zygote', '--ignore-gpu-blocklist', '--in-process-gpu', '--disable-dev-shm-usage',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  ] } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  const errors = [], metrics = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.setContent('<html><body style="margin:0"></body></html>');
  await page.addScriptTag({ path: path.join(temp, 'review.js') });
  const skus = await page.evaluate(() => window.modelReview.skus);
  for (const sku of sheetsOnly ? [] : skus) {
    for (const view of ['side', 'quarter']) {
      const result = await page.evaluate(({ sku, view }) => window.modelReview.render(sku, view), { sku, view });
      await fs.writeFile(path.join(out, `${sku}-${view}.png`), Buffer.from(result.image.split(',')[1], 'base64'));
      await fs.writeFile(path.join(out, `${sku}.svg`), result.svg);
      metrics.push({ sku, view, vertices: result.vertices, drawCalls: result.drawCalls, triangles: result.triangles });
    }
  }
  for (const sku of sheetsOnly ? [] : skus) {
    await page.goto(`${origin}/products/${sku.toLowerCase()}`);
    await page.getByLabel('Interactive 3D model. Drag to rotate.').waitFor();
    await page.waitForFunction(() => !document.querySelector('[role="status"]')?.textContent?.includes('Loading 3D'));
    await page.locator('#stage').screenshot({ path: path.join(out, `${sku}-browser.png`) });
  }
  if (!sheetsOnly) {
    await page.goto(`${origin}/products`);
    await page.waitForLoadState('networkidle');
    const cards = page.locator('section[aria-label="Results"] a[href^="/products/ss-"]');
    for (let i = 0; i < await cards.count(); i++) {
      await cards.nth(i).scrollIntoViewIfNeeded();
      await cards.nth(i).locator('img').waitFor();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, 'catalogue-desktop.png'), fullPage: true });
  }
  for (const sku of ['SS-1030', 'SS-3005', 'SS-4004']) {
    await page.goto(`${origin}/products/${sku.toLowerCase()}/spec-sheet`);
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => { const img = document.querySelector('article img'); return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0; });
    await page.pdf({ path: path.join(out, `${sku}-spec.pdf`), format: 'A4', printBackground: true });
  }
  if (sheetsOnly) {
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Three reference sheets exported');
  } else {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${origin}/products/ss-3005`);
    await page.getByLabel('Interactive 3D model. Drag to rotate.').waitFor();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(out, 'product-mobile.png'), fullPage: true });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await fs.writeFile(path.join(out, 'metrics.json'), JSON.stringify({ metrics, errors, mobileOverflow, browser: await browser.version(), renderer: custom ? 'custom Chromium / software WebGL' : 'Playwright Chromium' }, null, 2) + '\n');
    console.log(JSON.stringify({ phase, models: skus.length, errors, mobileOverflow }));
    if (errors.length || mobileOverflow) throw new Error('Browser review found errors or mobile overflow');
  }
} finally {
  await browser?.close(); server?.kill(); await fs.rm(temp, { recursive: true, force: true });
}
