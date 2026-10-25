# StudSport SEO audit and implementation

Audit date: 25 October 2026 (Africa/Harare)
Target branch: `feat/seo-demand-tracking`

## Outcome

The implementation establishes one canonical origin, makes all 22 product references discoverable without WebGL, replaces false enquiry success with confirmed delivery or an honest WhatsApp handoff, adds privacy-safe GA4 events, and creates seven evidence-limited application pages plus a measuring guide.

The catalogue, SKU URLs, JSON geometry, 3D viewer and visual system remain intact. No price, stock, OEM equivalence, review, rating, GTIN, certified fitment or unsupported manufacturer claim was added.

## Before and after

| Area | Before | After |
|---|---|---|
| Canonical origin | Production worked at `studsport.vercel.app`, but robots and sitemap named `studsport.co.zw` | `https://studsport.vercel.app` is the safe default; `NEXT_PUBLIC_SITE_URL` changes every absolute URL together after a future domain is verified |
| Preview indexing | No explicit protection | Preview deployments emit root `noindex` metadata, disallow crawling, and receive `X-Robots-Tag: noindex, nofollow, noarchive` |
| Metadata | Global title/description; SKU-led product titles; no canonicals, OG or Twitter cards | `metadataBase`, self canonicals, unique product/search titles, descriptions, OG/Twitter cards, verification hook and route-specific robots directives |
| Sitemap | 22 products plus a non-indexable utility page; incorrect origin | 22 products, homepage, catalogue, seven application pages, vehicle index and guide only; record dates are used where available |
| Duplicate pages | Printable pages blocked only in robots | Print pages remain crawlable enough to expose `noindex`, canonicalize to the product, and stay out of the sitemap; filtered catalogue URLs are `noindex` and canonicalize to `/products` |
| Structured data | None | `Organization`, `BreadcrumbList`, `ItemList`, `Article` and conservative `Product` data; no `Offer`, rating, GTIN, inventory or LocalBusiness claims |
| Product images | Canvas/WebGL and in-browser generated thumbnails | Stable `/product-images/{slug}.svg` files for every SKU plus visible HTML `<img>` fallbacks with descriptive alt text; 3D remains interactive |
| Enquiries | Timeout displayed “Enquiry received” although nothing was sent | Server validation, honeypot, timing check, same-origin check, throttling and provider confirmation. Without credentials, a prefilled WhatsApp draft says it is not sent until the customer presses Send |
| Analytics | None | Configurable GA4 page views and 11 demand events; no-op without a measurement ID; free-text search is reduced to safe demand buckets |
| Content architecture | Homepage, catalogue and product pages | Seven differentiated vehicle/application research pages and an evergreen Zimbabwe measuring guide, linked from homepage, products and footer |
| Performance | Product text was server-rendered, but the viewer engine was statically imported by the viewer component | Product text and static illustration render first; the Three.js viewer engine is dynamically loaded and failure retains a useful illustration |
| Tests | Catalogue/geometry regression tests | Metadata, sitemap, JSON-LD safety, analytics privacy, enquiry success/failure/handoff tests and a 33-route rendered-HTML audit |

## Domain and production observations

Observed on 25 October 2026:

- `https://studsport.vercel.app/`, `/robots.txt` and `/sitemap.xml` returned HTTP 200 from Vercel.
- `studsport.co.zw` returned no DNS records and could not resolve over HTTP or HTTPS.
- The deployed `robots.txt` declared `Host: https://studsport.co.zw`, and every deployed sitemap URL used that unavailable origin.
- The deployed SS-3001 title was `SS-3001 · Mazda Front Wheel Stud · StudSport` and no canonical link was present in the returned HTML.
- No `vercel.json` or local `.vercel` project binding is stored in the repository. The response headers confirm Vercel hosting, but project/dashboard domain settings were not accessible from the repository session.

Decision: retain `studsport.vercel.app` as canonical until `studsport.co.zw` has valid DNS, a valid certificate, a 200 response for the site, and a permanent redirect policy from the secondary host. At that point set `NEXT_PUBLIC_SITE_URL=https://studsport.co.zw` in the production environment and redeploy. Do not set the variable on preview deployments to a preview URL.

## Indexing policy

Indexable:

- `/`
- `/products`
- all 22 `/products/{slug}` pages
- `/vehicles` and the seven application pages
- `/guides/how-to-identify-and-measure-a-wheel-stud`

Not independently indexable:

- `/find-my-part`
- `/design-system`
- all `/products/{slug}/spec-sheet` pages
- `/products` URLs with filters or searches
- API routes and Vercel preview deployments

The sitemap contains 33 URLs. Printable pages are deliberately not disallowed in `robots.txt`, allowing crawlers to see their `noindex` directive.

## Structured-data boundaries

The `Product` markup uses only catalogue name, SKU, type, description, image and displayed properties. It deliberately omits `Offer`, `AggregateRating`, `Review`, GTIN, brand/manufacturer, inventory and compatibility claims. `ProductGroup` is omitted because the catalogue does not establish genuine commercial variants. `LocalBusiness` is omitted because public access, address and hours were not independently confirmed during this audit; existing contact details remain presentation/configuration data.

Validate representative pages after deployment with Google Rich Results Test and Schema.org Validator. JSON-LD is generated with `<` escaped to prevent script-tag injection.

## Mobile and Core Web Vitals review

- Searchable headings, applications, specifications and links are server-rendered independently of canvas.
- The 3D viewer engine now loads through a dynamic import and is not needed for the first readable render.
- Stable image dimensions prevent layout shift; the static SVG remains if WebGL fails.
- Thumbnail rendering remains intersection-observer gated and the shared WebGL context is released when idle.
- Existing reduced-motion behavior, mobile navigation, responsive product layout and viewer failure state are retained.

A post-deployment field measurement is still required: run PageSpeed Insights on `/`, `/products`, and two representative product pages, then monitor mobile LCP, CLS and INP in Search Console. A local production build can verify structure and code-splitting but cannot substitute for field data or the deployed CDN/network path.

## Verification performed

- `npm run check:models` — 22 models validated.
- `npm run test:models` — 43 tests passed, including delivery-confirmed and fallback enquiry outcomes.
- `npm run typecheck` — passed.
- `npm run build` — passed; 64 static pages generated.
- `SEO_BASE_URL=http://127.0.0.1:3200 npm run test:seo:rendered` — 33 indexable routes passed title, description, canonical, robots, H1, JSON-LD, sitemap and image checks.

Production URLs must be rechecked after the PR preview and again after production deployment; this audit does not claim that Google has indexed any page.
