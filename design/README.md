# Handoff: StudSport digital showroom

## Overview
Responsive website for **StudSport** (Harare, Zimbabwe), a supplier of wheel studs, hub bolts and matching nuts. Customers browse a catalogue, examine a part in 3D with a dimensioned engineering drawing, and request a quote (web form or WhatsApp). The scope includes a homepage, catalogue, product detail, find-my-part enquiry flow, printable A4 spec sheet, a design-system page, and structured sample data.

All product data is **illustrative**: dimensions, fitment, prices and availability are invented and must be replaced with verified records before launch.

## About the design files
The files in `design/` are **design references built in HTML**. They are prototypes that show the intended look and behaviour, not production code to copy directly. Recreate them in the target codebase's environment (e.g. Next.js/React, Remix, Astro + islands) using its patterns and libraries. If there is no codebase yet, a good fit is **Next.js (App Router) + TypeScript + React Three Fiber**, with server-rendered catalogue pages and a client-only viewer island.

The `.dc.html` files are self-contained "Design Component" pages: a template (`<x-dc>` body with `{{ }}` holes, `<sc-for>` loops and `<sc-if>` conditionals) plus a `class Component` logic block. Read them like JSX. `support.js` is the prototype runtime; do not port it.

**Port as-is (framework-agnostic, high value):**
- `design/data/catalogue.js`: the data schema and sample records.
- `design/lib/studsport.js`: geometry derivation, SVG drawing generator, three.js mesh builders, viewer and thumbnail logic. It is plain JS with no framework dependency. Split it into modules (`geometry.ts`, `drawing.ts`, `mesh.ts`, `viewer.ts`) and keep the algorithms.

## Fidelity
**High fidelity.** Colours, typography, spacing, motion and interactions are final for this phase. Recreate them pixel-accurately.

## Core principle: one record drives everything
`SS.geom(product)` converts the dimensions in a record into an ordered list of axial segments (`head`, `knurl`, `plain`, `thread`, `hex`, `collar`, plus an optional `nut`). **The 3D mesh, SVG drawing, viewer callouts, thumbnails, cards, spec table and spec sheet all read from that list or from the record directly.** Never hand-author per-product pages or drawings.

Measurement rules (enforced by `SS.validate()`; port this as a server-side publish check):
- Overall length **L includes the head**. Press-in stud: `L = H + K + S + T`. Double-ended: `L = A + C + B`. Nut: `overall = height`.
- Knurl Ø > shoulder Ø ≥ thread Ø. The D-flat `flatAcross` lies between radius and diameter.
- A stud-nut set's nut thread matches the stud (dia, pitch, direction), and the nut sits within the stud length.
- A product name containing "LH"/"RH" must match the thread direction.

## Screens / views

### Global
- **Header** (`SiteHeader.dc.html`): sticky, 68px tall, `rgba(15,17,19,0.9)` with 14px backdrop blur, 1px bottom border `#25292d`. Max-width 1440, side padding `clamp(16px,3vw,40px)`.
  - Wordmark: 30px mark + "StudSport" (Schibsted Grotesk 800, 21px, −0.035em) above the descriptor "Wheel Studs, Hub Bolts & Nuts" (Martian Mono 8px, 0.14em, uppercase, `#8b9298`).
  - The mark is the drafting symbol for an external thread end view: a circle r12.5 with a 2.4 stroke, a ¾ arc r8 in accent with a 1.6 stroke, and dash-dot centre lines.
  - Nav: Products, Find my part, How it works, Contact (14px/500, `#d6d9db`). The active item gets a 2px accent bar at the bottom.
  - Right side: WhatsApp link (mono 11px) and "Request a quote" button (40px tall, accent background, `#121416` text, 700 weight).
  - At ≤1060px: wordmark, "Quote" button, and a 44px menu button that opens a full-width list (52px rows).
- **Footer** (`SiteFooter.dc.html`): `#0e1012`. Auto-fit columns (min 200px): Brand, Products, Help, Contact. The bottom row carries the prototype notice, marked with a 6px amber square (`oklch(0.80 0.13 85)`).

### 1. Homepage (`Home.dc.html`)
1. **Hero** (charcoal `#121416`): min-height `min(800px, 100vh − 68px)`.
   - Background: 40px engineering grid (`rgba(255,255,255,0.026)` lines) plus a radial glow at 70%/48%.
   - Flex-wrap layout:
     - Copy column (basis 380, max 580): eyebrow (accent rule plus mono "HARARE · COMMERCIAL VEHICLE PARTS"); H1 "The right stud." / "Precisely matched." (second line `#a2a8ae`, accent full stop) at `clamp(46px,6.4vw,96px)`, 800 weight, −0.045em, line-height 0.94; body copy at 16–19px, `#c3c8cc`.
     - CTAs, both 54px tall: **Browse products** (accent) and **Find my part** (outline `#4a5056`).
     - Viewer column (basis 520, height `clamp(340px,46vw,640px)`): hero 3D viewer showing SS-1030 (stud and nut set), transparent background, measurement callouts. Caption bottom-left: "FIG. 01 · SS-1030 · Stud & nut set · M22 × 1.5 RH · View part →".
   - Bottom edge: an 18px ruler strip with ticks every 8px and 40px.
2. **Search** (paper `#f1f1ef`):
   - 60px input with a 1px ink border, magnifier icon, and an inline "Search" button.
   - Live suggestions dropdown with the top 5 matches (part no., name, applications). When nothing matches it shows "No matches… Request help →".
   - Enter goes to `Catalogue?q=`.
   - Quick chips: Toyota Dyna, M22 × 1.5, Left-hand, SS-1030.
3. **Browse by vehicle**: grid `auto-fill minmax(190px,1fr)`, 8px gap. White tiles, min-height 150: make (22px/800), model, mono count "05 parts →". A final dark tile reads "Other vehicle → Find my part".
4. **Featured products**: 4 product cards with live rotating thumbnails (SS-1030, SS-1001, SS-1040, SS-2002).
5. **How it works** (`#fbfbfa`): 3 numbered steps (Identify / Send an enquiry / Confirm and collect) and an "Where to measure" panel showing the generic-labelled side-view drawing of SS-1001 (L, Lu, H, K, S, T, Ød×P, Øk, Øh) with a legend.
6. **Contact** (charcoal): 2×2 info grid with 1px `#2a2e32` dividers (collection counter, phone & WhatsApp, delivery, trade & fleet) and a striped map placeholder.

### 2. Catalogue (`Catalogue.dc.html`)
- Dark title band: H1 "Products" (`clamp(34px,4.4vw,60px)`), a mono count line, and a 50px search input.
- Paper body with a flex-wrap layout:
  - Filter sidebar (basis 270, sticky at top: 88px):
    - **Vehicle**: radio list with live counts.
    - **Product type**: checkboxes; the checked mark is an accent square.
    - **Thread size**: toggle chips M18/M20/M22; selected chips are ink-filled.
    - **Thread direction**: All/RH/LH segmented control, with a note about LH usage.
  - Results (basis 380): result count, removable filter chips, "Clear all", and a card grid `auto-fill minmax(260px,1fr)`, 12px gap.
- Facet counts are computed with every other active filter applied, excluding the facet itself.
- At ≤820px the filters collapse behind a full-width "Filters (n) +" button.
- **No-results state**: white panel with "We may still have it, or can source it", a summary of the active query, the primary button "Request help finding this part →" (goes to `FindMyPart?q=&vehicle=`), "Clear filters", and a search-tips box.

### Product card (`ProductCard.dc.html`)
- White card, 1px `#d9dbda` border. On hover the border turns ink and the card lifts 2px (0.25s, cubic-bezier(.2,.7,.2,1)).
- Thumbnail well (16:10) with a radial charcoal gradient. Top-left availability pill (mono 9.5px, coloured dot); top-right "LH" accent pill for left-hand parts.
- Body: part no. (mono 11px, accent-ink, 600) · type; name (17px/700); key dimensions row (3 mono label/value pairs); applications line (13px); price ("$4.80 each" or "Price on quote") and "View part →".
- `spin="auto"` turns on the live rotating thumbnail.

### 3. Product detail (`Product.dc.html?p=<slug>`) — the flagship page
- **Top section (charcoal):**
  - Breadcrumbs (mono 11px).
  - Flex-wrap layout:
    - Viewer column (basis 560, grow 1.75):
      - Tabs (40px, mono uppercase, active tab has an accent border): **3D view / Product photos / Technical drawing**.
      - Stage panel: height `clamp(360px,46vw,640px)`, radial gradient `#2b2f34 → #1a1d20 → #141618`, 32px grid, four 14px corner crop marks, "SS-1001 · REV B" top-right.
      - Below: a mono note explaining that the 3D model is simplified and the dimensions come from the drawing and table.
    - Summary column (basis 340):
      - Part no. (accent) / type / "LEFT-HAND THREAD" badge; H1 (`clamp(28px,3.2vw,42px)`, 800); summary.
      - **Variant switcher**: chips showing variant label and part no.; the current variant has an accent border.
      - Key-specs list (rows with 1px `#2a2e32` dividers, values in mono).
      - Availability card (coloured dot, label, fulfilment note).
      - Quantity stepper (48px, −/input/+).
      - Price line (illustrative estimate × qty) or "Price on quote".
      - CTAs at 54px: **Request a quote →** (accent) goes to `FindMyPart?part=&qty=`; **Ask on WhatsApp** (outline) opens a wa.me link with prefilled text.
      - Links: spec sheet, revision, data status.
- **Lower sections (paper)** are numbered 01–05. Each has a toggle header (mono number in accent-ink, 24–34px H2, +/− sign):
  1. **Technical drawing**: white card containing a header row (part, name, "All dimensions in mm · Not to scale · Rev"), the generated SVG drawing on a 5mm grid, and a letter legend.
  2. **Specifications**: grouped tables in `auto-fit minmax(420px,1fr)` (General, Dimensions incl. an arithmetic check row "H + K + S + T = L", Thread, Matching nut, Material & finish, Data).
  3. **Vehicle applications**: cards (vehicle, model, years/position/side in mono) and a "confirm fitment" notice.
  4. **What's included**: a segmented display of Stud only / Stud and nut / Complete assembly (the active option is ink-filled; others are struck through); component tiles with thumbnails; a link to the matching nut, or "Fits studs" for nuts; a dark spec-sheet card.
  5. **Related variants**: comparison table (horizontal scroll, min-width 720) with a thumbnail column header per product. **Cells that differ from the current product** get an `oklch(0.95 0.035 62)` background, a 2px accent underline, and 600 weight.
- **Mobile (≤760px):** sections 02–05 start collapsed. A fixed bottom bar shows "SS-1001 × 10", availability, and WhatsApp + "Request quote" buttons (48px); the page adds 72px of bottom padding so the bar doesn't cover content.

### 4. Find my part (`FindMyPart.dc.html`)
- Dark band with title "Find my part", or "Request a quote" when `?part=` is present.
- Main form card with a 3-step progress bar (3px ink/grey segments):
  1. **Vehicle**: make chips (the 7 makes + Other + I'm not sure; required), model, year (optional), chassis/VIN (optional, mono), wheel position (Front/Rear/Front & rear/I'm not sure), side (Left/Right/Both/I'm not sure).
  2. **Part details**: part type chips, quantity stepper (required), part number (optional), an optional measurements box with a "Where do I measure?" toggle that reveals the generic drawing (overall length, thread Ø select, pitch select, knurl Ø, direction RH/LH/I'm not sure), photo upload (dashed dropzone, up to 6 images previewed locally with remove buttons), notes.
  3. **Contact**: name (required), business, phone/WhatsApp (required unless the method is Email), email (required if Email), preferred contact (WhatsApp/Phone call/Email), collection or delivery (delivery reveals a town field).
- Footer bar: Back / "Step n of 3" and Continue →, or **Send enquiry** (accent, shows a spinner for 1.1s while simulating).
- Validation is inline (`#b02a1a`, role="alert").
- `?part=` prefills type, thread, length, vehicle and quantity, and shows a "Quote request for" product card in the sidebar.
- **Success state**: check badge; "Enquiry received"; a mono reference `ENQ-DDMM-####`; a summary of the answers; "What happens next" (3 steps); buttons Back to products, Follow up on WhatsApp, New enquiry.
- Sidebar: WhatsApp/phone card and a "Why we confirm first" note.

### 5. Spec sheet (`SpecSheet.dc.html?p=<slug>`)
- A4 portrait, one page, white, built with `doc-page.js` (one `.page`).
- Contents in order:
  - Header (mark + wordmark; document/revision/sheet block).
  - Title block: part no. 11pt accent, name 19pt/800, summary, type/supplied-as/thread/finish.
  - 76mm product render (light studio tone, labelled "visual approximation").
  - Full-width dimensioned drawing (wide layout, text ≈ 8.5–9.5px).
  - 3-column spec groups.
  - Applications and included components.
  - Footer with contact placeholders, product URL, and the boxed "Illustrative prototype data" note.

### 6. Design system (`DesignSystem.dc.html`)
Identity, colour, type, components, drawing line conventions and motion principles.

## 3D viewer behaviour (`<ss-viewer>`)
- **Loading:** three.js r160 loads lazily when the viewer comes within 200px of the viewport. Until then, an SVG outline of the part and an indeterminate accent loading bar keep the layout stable.
- **Scene:** custom PMREM studio environment (dark room with softbox strips) plus a key light and a warm rim light; ACES tone mapping at exposure 1.05; transparent background.
- **Pose:** the part lies horizontal (head left), yawed −0.42 rad (nuts −1.0), with the camera elevated 20% of the distance. Auto-fit keeps the part at 66% of the width (hero 74%).
- **Motion:** slow **spin about the part's own axis** at 0.42 rad/s, so dimension lines stay stable. Drag to yaw/pitch (pitch clamped ±1.2). Zoom 0.6–3× via buttons, pinch, or Ctrl/⌘-scroll; the plain wheel never hijacks page scroll. Double-click resets. All movement eases with damping `1 − 0.002^dt`.
- **Controls** (40px, mono uppercase, blurred glass): Pause/Rotate, Reset, −, +, Dims toggle, Fullscreen. The hero shows only Pause.
- **Dimension overlay:** screen-space SVG redrawn each frame from projected axis points. Linear dimensions have extension lines and arrows (L, T, nut H); leader callouts end in an accent dot (thread designation, head Ø, knurl Ø, AF, nut). Labels sit in chips (`rgba(18,20,22,0.86)`, key labels with an accent border). The overlay fades out when the axis is heavily foreshortened.
- **Efficiency:** pauses when off-screen (IntersectionObserver) or in a hidden tab, and skips renders when nothing moves. Under `prefers-reduced-motion` rotation starts paused. If WebGL fails, the outline stays with the message "3D preview unavailable · showing outline".
- **Geometry:**
  - Helical thread with the correct hand (crest locus `y = y0 + sign·p·φ/2π`); the grid is sheared along the helix so crests are clean; a 1.6p runout and a tip chamfer.
  - Knurl as axial splines.
  - D-flat head through radial clamping; hex via `af/2 / cos(φ′)` with conical chamfers producing the classic arcs.
  - Nut: 60° cone or flange seat, internal thread, LH identification groove.

## Thumbnails
- Static thumbnails (`<ss-thumb>`) are rendered by a single shared offscreen renderer to PNG data URLs and cached per product/tone/size. The WebGL context is released after 4s idle.
- Spinning thumbnails (`spin="auto"`) use **one** shared renderer that draws every visible spinning card into its own 2D canvas each frame, so 4 cards still use one WebGL context. They stop off-screen and are disabled under reduced motion.
- In production, consider pre-rendering static thumbnails at build time and serving them as WebP, or replacing them with real photography.

## Technical drawing generator (`SS.drawingSVG`)
- Views: side view; View A (head end / end A); View B (tip end / end B). Nuts get a side view and an end view. End-view shapes are drawn far-to-near with background fill, so occlusion is correct.
- Conventions:
  - Visible outline: thick (≈0.15·fs). Dimension, extension and thread-root lines: thin (≈0.055·fs).
  - Centre lines: dash-dot. Hidden nut bore: dashed.
  - External thread end view: thick major circle, thin ¾ minor arc. Internal thread: thick minor circle, thin ¾ major arc.
  - Knurl hatching: foreshortened axial lines.
- Dimensions:
  - Above the part: Lu, then L (plus Hn for sets).
  - Below: a chain of H/K/S/T (or A/C/B) with grey letters under the values.
  - Vertical thread designation at the tip.
  - Head Ø and D-flat on View A; knurl Ø/splines or nut AF on View B.
- Layouts: `wide` (A | side | B) or `stack` (side on top, end views below), chosen automatically below 640px.
- Font size adapts so text renders at ≥11px (configurable `min-px`/`max-px`).
- `labels="generic"` swaps values for letters (used in "how to measure").

## State management
- **Product page:** `slug` (from `?p=`), `tab` (3d/photos/drawing), `qty`, `mobile`, `open{drawing,specs,apps,incl,cmp}`.
- **Catalogue:** `q`, `vehicle`, `types[]`, `sizes[]`, `dir`, `mobile`, `filtersOpen`. Initialised from `?q=&vehicle=&type=`. Syncing filter state back to the URL is recommended in production.
- **Enquiry:** `step` (1–3), `f` (all fields), `photos[]`, `err{}`, `sending`, `done`, `ref`, `ctx` (prefilled product).
- **Header:** `mobile`, `open`.

## Data model (database mapping)
See `HANDOFF.md` (copied here) for the proposed tables: products, product_dimensions, product_assembly, product_components, applications, vehicles, finishes, product_media, related_products and spec_revisions. The `dims` JSON maps 1:1 to columns or to a per-template validated JSONB column. Each product record carries: ID/slug, name and part number, type and geometry template, application records, dimensions (mm), thread diameter/pitch/direction, material/grade/finish, included components, availability and optional price, media and 3D settings, related products and variant group/label, and spec revision and verification status.

## Design tokens
**Colour**
| Token | Value | Use |
|---|---|---|
| graphite | `#0e1012` | footer |
| charcoal | `#121416` | hero, header, dark bands |
| stage | `#1a1d20` / gradient `#2b2f34→#1a1d20→#141618` | viewer and thumbnail wells |
| rule-dark | `#25292d`, `#2a2e32`, `#3a3f44`, `#4a5056` | lines and borders on dark |
| text-on-dark | `#eceeef`, `#d6d9db`, `#a2a8ae` (secondary), `#8b9298` (labels) | |
| paper | `#f1f1ef` | page surfaces |
| sheet | `#ffffff`, `#fafaf9` | cards, drawings, tables |
| rule-light | `#d9dbda`, `#dcdedd`, `#e3e5e4`, `#c4c7c8` (inputs) | |
| ink | `#15171a`, `#4b5157` (secondary), `#6c7278` (labels) | |
| accent | `oklch(0.68 0.17 45)`; hover `oklch(0.74 0.16 50)` | primary actions, key callouts; always with `#121416` text |
| accent-ink | `oklch(0.55 0.16 45)` | part numbers and section numbers on light surfaces |
| accent-tint | `oklch(0.95 0.035 62)` | differing values in comparisons |
| in-stock | `oklch(0.72 0.14 150)` | |
| on-request / notice | `oklch(0.80 0.13 85)` | |
| confirm | `#9aa1a7` | |
| error | `#b02a1a` | |

**Type**: Schibsted Grotesk (400–900) for UI and headings; Martian Mono (300–600) for part numbers, measurements, labels and buttons in the viewer.
- Display: `clamp(46px,6.4vw,96px)`, 800, −0.045em, line-height 0.94.
- H1 on pages: 34–60px, 800, −0.04em.
- Section H2: 24–40px, 800, −0.025 to −0.03em.
- Body: 15–17px, line-height 1.55.
- Mono labels: 9.5–11px, 0.06–0.14em tracking, uppercase.
- Mono values: 11.5–13px.

**Spacing**: page max-width 1440 (enquiry 1200, design system 1280); side padding `clamp(16px,3vw,40px)`; section padding `clamp(40px,6vw,80px)`; grid gaps 8/10/12px; layout gaps 20–48px.

**Radius**: 2px on controls; 0 on cards and panels (engineering feel); 50% on dots.

**Borders**: 1px everywhere. The ink border is used for focus, selection and hover.

**Shadows**: only the search dropdown (`0 18px 40px rgba(18,20,22,0.18)`) and the mobile action bar's blur.

**Touch targets**: ≥44px on mobile; primary CTAs 50–54px.

**Motion**: fades of 0.5–0.8s ease; card lift 0.25s cubic-bezier(.2,.7,.2,1); step transitions use a 0.35s rise of 10px; no bounces. All motion respects `prefers-reduced-motion`.

## Assets
- Fonts: Google Fonts (Schibsted Grotesk, Martian Mono).
- Icons: tiny inline SVGs (play/pause, reset, zoom, fullscreen, dimensions, search, check). Re-implement with the codebase's icon set if one exists.
- No raster images. Product photos and the map are **placeholders** (striped panels with mono captions) to be replaced with real photography and a map embed.
- 3D library: three.js r160 (`https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`). In production, install from npm.

## Files (in `design/`)
- `Home.dc.html`, `Catalogue.dc.html`, `Product.dc.html`, `FindMyPart.dc.html`, `SpecSheet.dc.html`, `DesignSystem.dc.html`, `Overview.dc.html`: pages.
- `ProductCard.dc.html`, `SiteHeader.dc.html`, `SiteFooter.dc.html`: shared components.
- `data/catalogue.js`: sample catalogue (12 products, 7 vehicle makes).
- `lib/studsport.js`: helpers, geometry, drawing, 3D, custom elements.
- `doc-page.js`: A4 page shell for the spec sheet (prototype only).
- `support.js`: prototype runtime (do not port).
- `HANDOFF.md`: data-to-database mapping notes.

Open `design/Home.dc.html` in a browser through a local static server (e.g. `npx serve design`) to explore the working prototype.

## Out of scope
No backend, checkout, accounts, admin panel or chatbot. Enquiry submission is simulated; uploaded photos stay in the browser. Present StudSport as a supplier, not a manufacturer. Do not add OEM references, certifications or compatibility claims.
