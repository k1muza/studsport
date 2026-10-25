# Catalogue consolidation and model reconstruction

Review date: 25 October 2026. Baseline: `dbe430ed2f10f7d09ef105f1b1310bc9ea3eab75` on `main`.

The result is **22 catalogue references: the original 18 preserved, plus four missing-family references**. The eight pilot families have sixteen separate LH/RH purchasing requests. No exact duplicate was proved, so no products were merged. Existing SKU identifiers and URLs are unchanged. Isuzu, Canter, Nissan/UD, Scania and Volvo historical coverage remains searchable, with unsupported applications explicitly unverified.

## Review material

- [Inventory and reconciliation](INVENTORY.md): eight pilot families and every SKU, with dimensions, threads, variant relationships, evidence, actions and remaining uncertainty.
- [Source evidence register](SOURCES.md): manufacturer identities, URLs, reference numbers, evidence used and discrepancies.
- [Visual review](VISUAL-REVIEW.md): original reference notes, before/after side and three-quarter views, and actual browser captures for every product.
- [Baseline metadata](baseline-catalogue.json) and [baseline geometry](baseline-models.json): audit snapshots, not runtime data or approved specifications.
- [Supplier measurements](../../src/data/supplier-measurements.json): source values and tolerances kept separately from display approximations.

## Consolidation decisions

The feasibility report establishes commercial demand, not exact physical identity. Its Mr Bolt supplier is not assumed to be Quanzhou Litai, issuer of the later six drawings. Core/Test/New classifications and planned quantities stay in the unimported procurement JSON. No priority badges, new featured groups or priority sorting were added.

SS-3003/3004/3002/3001 are candidates for GH, Dyna and Mazda rear/front respectively. Four separate unverified records fill the other family gaps:

| New SKU | Requested family | Reason for separate reference |
|---|---|---|
| SS-4001 | Hino Dutro rear, nominal M20 × 1.5 × 90 | Supplier Durton drawing is 91 overall; marketplace Durto listing is 75. None proves the 90 mm request. |
| SS-4002 | Toyota 2D rear, nominal M20 × 1.5 × 75 | Shenka shows 2D/DA6000 parts, but equality with Rino SS-3005 is unproved. |
| SS-4003 | UD CK10/CK20 rear, nominal M22 × 1.5 × 102 | Rear assemblies differ from front listings and historical SS-1040/1041. Inner thread and full dimensions unknown. |
| SS-4004 | Volvo rear, nominal M22 × 1.5 × 105 | DT 2.65094 documents 105 under head and 115 overall. It is a candidate, not an identified pilot item; no LH version established. |

Each family has one LH and one RH procurement line, both `identification-required`, with `physicalVariantSku: null`. This represents the requested coverage without fabricating sixteen identified products. Existing illustrative RH/LH examples are kept separate and are not evidence of real variants. Candidate manufacturer/OEM references are searchable; no candidate code is an interchangeable-product alias.

## Source interpretation and geometry

All original models receive shared truncated thread crests/roots, smooth runout, coherent end chamfers, closed boundary radii and refined edge breaks. Black finishes were adjusted moderately for readable splines without changing the studio lighting. Nut bores have inward-facing normals and continuous entry chamfers; the illustrative LH identification groove has eased edges. The original twelve dimensions remain illustrative where no corroborating match was found.

The reusable profiled model supports explicit radius contours, allowing a rounded integral flange instead of a large flat plate. Section geometry still drives the viewer, thumbnail and SVG together. Unknown handedness is axisymmetric at the declared pitch, not silently converted into a helix. Separate `visualSplines` describe approximate teeth where source tooth count is unknown; those counts are excluded from measurement labels.

| Supplier SKU | Reconstruction / interpretation | Remaining limit |
|---|---|---|
| SS-3001 | Visible spline band replaces the smooth cylinder. Side-view stations give a provisional 39 − 4.5 = 34.5 mm visual band, then a 3 mm transition. | Original Ø22.8 × 1.5 × 16 callout is retained unchanged; interpretation and count need supplier confirmation. |
| SS-3002 | Serrations, shoulder transition and tip chamfer make the distinct rear silhouette readable. | Header 72 versus detailed 66 under head remains unresolved; model stays 76.5 overall provisional. |
| SS-3003 | Corrects R20 head arc to Ø40 envelope and 36 flat height; shoulders and 41 mm thread retained. | The 27 mm derived remainder includes a simplified 2 mm transition; the transition is not independently dimensioned. |
| SS-3004 | Short serrated region, shoulder slope and thread-end chamfer added. | Head Ø28 and knurl details remain display estimates; 47 under head / 54 overall preserved. |
| SS-3005 | Preserves 37/38 axial split, nominal Z50 teeth, 8.5 mm spline band, reduced neck and 30° approaches; replaces oversized Ø30 plate with rounded Ø24 illustrative contour. | Flange outside diameter is unknown; Ø24 is excluded from dimension callouts. Left thread is min27; right 22 is derived; R3/R0.6 details are simplified. |
| SS-3006 | Preserves central Ø32/two-flat drive at the correct axial station, 31/24 mm thread regions and 91 overall; adds source 1.5 × 45° tip chamfers. | Durton name, OEM identity and hand unresolved; do not substitute pilot 90. |

SS-1041 uses the inspected Litai Canter photo as a Level C shape analogue: asymmetric ends, short splines, integrated flange and neck replace its generic smooth collar. The historical Nissan MK association is not promoted into Canter compatibility. New SS-4001/4002 explicitly reuse drawing *analogues* with schematic local sections; those values are not measurements of the requested parts. SS-4003 is an approximate rear double-ended architecture; SS-4004 combines DT reference dimensions with illustrative local details.

The confidence hierarchy follows the brief: A exact identified part, B strong technical correspondence, C visual analogue, D engineering-informed illustration. No StudSport record reaches A. A B rating does not override unverified identity/fitment. Manufacturer-declared DT dimensions apply only to its named reference; supplier-declared materials/grades are not independently verified.

## Validation

The implementation has 35 regression tests, including original URL retention, all eight families/sixteen requests, candidate-only references, source tolerances, LH/RH mirrored profiles, neutral unknown hand, closed thread ends, source section chains, finite actual mesh positions/normals, bounded geometry, draw-call budgets and omission of estimated flange dimensions. JSON validators cover all 22 records. TypeScript and the production build pass; the build prerenders all 22 detail and 22 spec-sheet routes.

Chromium 153 with software WebGL captured all 18 baseline and all 22 reconstructed models in side and three-quarter views, plus actual product viewers. The review includes catalogue thumbnails and a 390 × 844 mobile viewport. Browser page-error collection was empty; mobile horizontal overflow was false. Representative print sheets exercise a stud/nut assembly, the most detailed supplier record and a new manufacturer-reference record. See the visual review for results and direct artifacts.

The rendered geometry uses 1–2 material draws versus 5–16 before. Maximum captured geometry is 64,881 vertices / 123,920 triangles versus 67,747 / 129,712 before. This is a geometry budget and browser smoke test, **not an FPS benchmark on physical mobile hardware**. The shared offscreen/rotating thumbnail renderers and reduced-motion behavior remain in place.

## Reproduction

```bash
npm ci
npm run check:models
npm run test:models
npm run typecheck
npm run build
npx playwright install chromium
npm run review:models
```

The review script starts its own server and writes to `visuals/after`. Set `CHROMIUM_EXECUTABLE_PATH` if Chromium is already installed; `REVIEW_PORT` overrides 3100. For baseline reproduction, use a separate checkout at the SHA above with the browser harness/controller and their dev dependencies, writing to a separate review directory. Do not replace the baseline snapshots with current geometry. Lighting, camera orientation and 900 × 340 comparison render dimensions are fixed by `scripts/model-review-entry.ts`.

## Identification backlog

Resolve the Mazda rear length conflict; obtain selected handed drawing revisions; confirm Rino/2D and Durton/Dutro naming; identify the CK rear inner thread and length datum; confirm whether the Volvo request actually refers to DT 2.65094 and whether an LH counterpart exists. Obtain actual product/lot evidence before assigning prices, stock, manufacturing approval, material certification, nut compatibility or fitment. This PR is a reviewable catalogue and visualization foundation, not a production-part approval.
