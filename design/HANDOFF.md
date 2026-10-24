# StudSport prototype — handoff notes

All catalogue content in this prototype is **illustrative sample data**. Dimensions, fitment, prices and availability must be replaced with verified records before launch.

## Files

| File | Role |
|---|---|
| `data/catalogue.js` | The only data source. One object, `window.SS_DATA`, with products, vehicles, finishes, availability states and company details. |
| `lib/studsport.js` | Rendering library. Reads `SS_DATA` and never contains product facts. Provides helpers, geometry, SVG drawings, the 3D viewer and thumbnails. |
| `Home`, `Catalogue`, `Product`, `FindMyPart`, `SpecSheet` `.dc.html` | Page templates. Every product page, card, drawing and sheet is generated from records. Nothing is hand-built per product. |
| `ProductCard`, `SiteHeader`, `SiteFooter` `.dc.html` | Shared components. |
| `DesignSystem.dc.html` | Colours, type, components, drawing and motion conventions. |
| `Overview.dc.html` | Desktop and mobile views of each page on one canvas. |

URLs: `Product.dc.html?p=<slug>`, `SpecSheet.dc.html?p=<slug>`, `Catalogue.dc.html?q=&vehicle=&type=`, `FindMyPart.dc.html?part=<partNo>&qty=`.

## Product record → database

Suggested tables (one row per product, child tables for repeating groups):

- **products**: `id`, `slug`, `part_no`, `name`, `type` (wheel-stud / hub-bolt / double-ended / stud-nut-set / wheel-nut), `template` (press-in-stud / double-ended / stud-nut / wheel-nut), `summary`, `material`, `grade`, `finish_id`, `includes`, `availability`, `fulfilment`, `price_amount`, `price_unit` (nullable), `variant_group`, `variant_label`, `matching_nut_id`.
- **product_dimensions**: keyed by product. Columns depend on the template; the JSON shape in `dims` maps 1:1 (e.g. `head_dia`, `head_thickness`, `head_shape`, `head_flat_across`, `knurl_dia`, `knurl_length`, `knurl_splines`, `shoulder_dia`, `shoulder_length`, `thread_dia`, `thread_pitch`, `thread_dir`, `thread_length`, `thread_class`, `overall`). A JSONB column validated per template is also fine.
- **product_assembly**: `product_id`, `nut_id`, `clamp_length` (for stud-nut sets).
- **product_components**: `product_id`, `qty`, `label`, `component_part_id`.
- **applications**: `product_id`, `vehicle_id`, `model`, `years`, `position`, `side`, `notes`, `verified` (bool, false until checked).
- **vehicles**: `id`, `make`, `model`, `label`.
- **finishes**: `id`, `label`, render settings (`color`, `metalness`, `roughness`, `iridescence`).
- **product_media**: `product_id`, `kind` (photo / thumbnail / model-override), `url`, `caption`, `sort`.
- **related_products**: `product_id`, `related_id`, `sort`.
- **spec_revisions**: `product_id`, `revision`, `date`, `status` (illustrative / pending / verified), `notes`.

Measurement rules the data must follow (checked by `SS.validate()` on load; warnings appear in the console):

- Overall length **L includes the head**. Press-in studs: `L = H + K + S + T`. Double-ended: `L = A + C + B`. Nuts: `overall = height`.
- Knurl Ø > shoulder Ø ≥ thread Ø. D-flat dimension sits between the radius and the diameter.
- A set's nut thread must match the stud thread (size, pitch, direction), and the nut must sit within the stud.
- Name says LH ⇔ thread direction is LH.

## Swapping mock data for an API

1. Replace `data/catalogue.js` with a loader that fetches `/api/catalogue` (or per-product endpoints) and assigns the same shape to `window.SS_DATA`. Pages already wait for `SS_DATA` before rendering.
2. For per-product pages, fetch the product, its nut (if any), related products and vehicles, then build the same object.
3. Keep `SS.validate()` as a server-side check before publishing a record.
4. Move `company` details to CMS settings.

## Rendering pipeline

`SS.geom(product)` turns dimensions into one list of segments (head, knurl, shoulder, thread, collar, nut). The 3D mesh, the SVG drawing, the viewer callouts and the thumbnails all read that list, so they cannot disagree.

- **3D**: three.js r160 loaded from CDN only when the viewer is near the viewport. Helical threads are modelled with the correct hand (RH/LH); knurl splines, D-flat heads, hex collars and nut seats are generated from the numbers. Thread form is simplified and labelled "visual approximation".
- **Viewer**: slow auto-rotation, drag to rotate, pinch / Ctrl-scroll / buttons to zoom, pause, reset, fullscreen, dimension overlay toggle. Pauses off-screen and in background tabs; rotation off under reduced motion. An SVG outline shows while loading and if WebGL fails.
- **Thumbnails**: rendered once per product by a single shared renderer and cached as images; the WebGL context is released when idle. Real product photos can replace them via `product_media`.
- **Drawings**: generated SVG with side view, head-end and tip-end views, ISO-style thread representation, chain dimensions and letter legend. Text size adapts to the container (stacked layout on mobile).

## Not in scope

No backend, checkout, accounts or admin. Enquiry submission is simulated. Photos uploaded in the enquiry form stay in the browser.
