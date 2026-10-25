# StudSport digital showroom

Next.js (App Router) + TypeScript + three.js implementation of the design in [`design/`](design/README.md).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # also runs the catalogue publish check
npm run typecheck
```

## Routes

| Route | Page |
|---|---|
| `/` | Homepage: hero 3D viewer, search, browse by vehicle, featured, how it works, contact |
| `/products?q=&vehicle=&type=&size=&dir=` | Catalogue with faceted filters (state synced to the URL) |
| `/products/[slug]` | Product detail (statically generated per record) |
| `/products/[slug]/spec-sheet` | Printable A4 spec sheet |
| `/find-my-part?part=&qty=&vehicle=&q=` | 3-step enquiry / quote request (submission is simulated) |
| `/design-system` | Colour, type, components, drawing and motion conventions |

## Evidence-linked catalogue

The catalogue has **22 references**: all 18 original SKUs and URLs, plus four unverified sourcing references. The original 12 remain illustrative; six drawings remain supplier-declared. No physical duplicates, OEM fitments or new handed variants have been asserted.

See the [research report](docs/model-research/README.md), [complete inventory](docs/model-research/INVENTORY.md), [sources](docs/model-research/SOURCES.md) and [browser visual comparisons](docs/model-research/VISUAL-REVIEW.md).

| Data | Responsibility |
|---|---|
| `src/data/products.json` | Stable SKU, URL, historical/source application labels and commercial metadata |
| `src/data/part-models.json` | Feature-based rendering geometry, source and verification flags |
| `src/data/supplier-measurements.json` | Supplier measurements, tolerances and unresolved contradictions, independent of rendering estimates |
| `src/data/product-evidence.json` | Family, confidence, candidate manufacturer/OEM references and uncertainties |
| `src/data/evidence-sources.json` | Source identity, URL, evidence used and limitations |
| `src/data/procurement-research.json` | Internal-only eight families and sixteen separate LH/RH purchasing requests |

`catalogue.ts` joins metadata and geometry by SKU. `geom(p)` derives the axial features shared by the Three.js viewer, thumbnails, SVG drawings and callouts. Templates are `press-in-stud`, `stud-nut`, `double-ended`, `wheel-nut` and `profiled-fastener`. The latter supports drawing/derived/schematic sections, tip chamfers, shoulder tapers, estimated splines and rounded contour points. Shared visual controls define illustrative edge breaks, spline depth and thread runout.

Three.js is lazy loaded. Meshes are merged per material (one draw for an individual part, two for the illustrative stud/nut assembly). Unknown hand remains neutral annular grooves. Unknown spline count may have separately labelled illustrative visual teeth; it is not promoted to a source specification or displayed as a measured count.

Candidate part numbers are searchable but do not resolve as equivalent-product aliases. Existing illustrative LH/RH models remain separate. The sixteen purchasing requests have no assigned physical variant SKU until identified. Core/Test/New metadata does not enter the public UI or ranking.

## Validation and browser review

```bash
npm run check:models
npm run test:models
npm run typecheck
npm run build
npx playwright install chromium
npm run review:models
```

The build preflight runs the JSON/catalogue validators and regression suite. `review:models` starts an isolated development server, captures side/three-quarter renders plus the actual product viewer for every SKU, loads catalogue thumbnails, checks mobile overflow and exports three representative print sheets. Screenshots and mesh metrics go to `docs/model-research/visuals/after/`. Set `CHROMIUM_EXECUTABLE_PATH` to use an installed browser; optional `REVIEW_PORT` defaults to 3100. Rendering output is a visual reference, not CAD or mechanical validation.

## Limits and unresolved identification

Mazda Rear still has conflicting 72/66 mm under-head lengths. The Hino GH drawing's R20 head is represented as a 40 mm envelope with 36 mm flat height. The Rino flange is not dimensioned: its 24 mm rounded display contour is illustrative and omitted from dimensional callouts. Rino/2D, Durton/Dutro, CK10/CK20 rear, and the requested Volvo LH variant need identification. Supplier grades and finishes are declarations, not independent certification. No exact fitment, stock, price, installation suitability or nut-seat compatibility is established by a model.

Product photos, company address/email placeholders, and enquiry submission remain prototype features; this change does not activate ordering.
