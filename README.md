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

## One record drives everything

`src/data/part-models.json` is now the single source of geometry for **all 12 existing products**. `src/lib/catalogue.ts` retains the illustrative commercial and fitment metadata and resolves every `dims` property via `modelDims(sku, template)`. No hard-coded model dimensions remain in product records. Everything else is derived:

- `lib/model-data.ts`: typed JSON model loader, template checks and provenance/verification flags
- `scripts/model-validation.mjs`: geometric validation of JSON records; `npm run check:models`, `npm run test:models` and the build preflight use it
- `lib/products.ts`: lookups, formatting, key specs, spec groups, comparison, search
- `lib/geometry.ts`: `geom(p)` axial segments shared by the mesh, drawing, callouts and thumbnails; `validate(p)` measurement rules
- `lib/drawing.ts`: dimensioned SVG engineering drawing
- `lib/three/mesh.ts`: three.js mesh builders (helical threads, knurl, D-flat, hex, nut seats)
- `lib/three/viewer.ts`: framework-free interactive viewer engine used by `<Viewer>`
- `lib/three/thumbs.ts`: shared offscreen thumbnail renderer and one shared spin renderer
- `lib/catalogue-check.ts`: publish check run in `generateStaticParams`; a record that breaks a rule fails the build

three.js is loaded with a dynamic `import()` only when a viewer or thumbnail nears the viewport.

## Swapping in real data

Replace the exports in `catalogue.ts` with a loader that returns the same shape (see `design/HANDOFF.md` for the table mapping). Product photos and the map are placeholders.

## JSON → 3D model pipeline

Edit `src/data/part-models.json` to update a model's geometry. Records are keyed by the existing StudSport SKU and specify `template`, `dimensions`, `source` and `verification`. These dimensions hydrate `p.dims` in `catalogue.ts`; `geom(p)` derives the axial segments and nut assembly consumed by **all** rendering paths: 3D product viewer, hero, rotating cards, static thumbnails, on-page dimensions and printable SVG drawing. No separate manually crafted per-product 3D models exist.

Templates: `press-in-stud`, `stud-nut`, `double-ended`, `wheel-nut`. The engine already produces helix-like thread visuals, spline/knurl visuals, round or D-flat heads, hex or round collars, and hex nuts with cone or flange seats. These visuals are approximations and not STEP/CAD output.

Run `npm run check:models` to validate dimensions, lengths, part keys, and required metadata; `npm run test:models` covers success and failure cases. Both run before `npm run build`. The existing build catalogue check also checks that every catalogue part has a matching JSON model and no orphaned models remain.

**Safety:** all 12 migrated models are still **illustrative**. Moving a model to JSON does *not* validate its dimensions, vehicle fitment, thread tolerance, strength, or inventory. Do not change the model's verification state without genuine supplier/OEM evidence and engineering review. The six supplier drawings have been indexed only as pending records in `src/data/supplier-drawings.review.json` (including a 72 mm vs 66 mm inconsistency on the Mazda Rear drawing); they were not silently mapped onto invented SS product records.

## Six Quanzhou Litai drawing-based references (SS-3001 to SS-3006)

The supplier pages are in `DRAWINGS.pdf` (not redistributed in this repo). Supplier records are separate from the 12 invented prototype records because **none matched in full geometry**. New `profiled-fastener` models represent a chain of axial sections annotated with `basis: drawing | derived | schematic` so unprovided geometry is never mistaken for a measured dimension. Unknown handedness is deliberately rendered as a smooth nominal thread cylinder (NOT fabricated right-hand helical thread), and unknown spline count is left smooth. The live model is a visualization, not a validated manufacturing drawing.

| SKU | Supplier sheet | Model length | Status |
|---|---|---:|---|
| SS-3001 | Mazda Front (p1) | 80.5 mm incl. head | Source declared; transitions approximate |
| SS-3002 | Mazda Rear (p2) | 76.5 mm provisional incl. head | **HOLD**: header 72 mm vs drawing 66 mm under-head |
| SS-3003 | Hino GH Rear (p3) | 118.5 mm incl. head | Source declared; shoulder transition simplified |
| SS-3004 | Toyota Dynaps Rear (p4) | 54 mm incl. head | Schematic head diameter; OEM model unclear |
| SS-3005 | Toyota Rino Rear (p5) | 75 mm | Segment lengths schematic where unspecified |
| SS-3006 | Hino Durton Rear (p6) | 91 mm | Source-declared sections; drive detail simplified |

Supplier marking R/L does not select a handed variant, so it stays **UNSPECIFIED**. These references have no confirmed prices or stock and no verified vehicle fitment. The original supplier drawing must be reconciled for installation, fitment, load grade and supply quality. Replacing the old 12 sample geometry records is inappropriate without exact source/part-number match.
