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

`src/lib/catalogue.ts` is the only data source (illustrative sample data). Everything else is derived:

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
