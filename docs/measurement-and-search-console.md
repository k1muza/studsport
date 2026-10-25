# Demand measurement and Search Console setup

## Environment setup

Set variables in the Vercel Production environment and redeploy:

```text
NEXT_PUBLIC_SITE_URL=https://studsport.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=token-only-value
```

For provider-confirmed email enquiries, also set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` on a verified sending domain, and `ENQUIRY_TO_EMAIL`. Secrets do not use the `NEXT_PUBLIC_` prefix. Without all three, the form intentionally uses WhatsApp handoff mode.

Before switching `NEXT_PUBLIC_SITE_URL` to `https://studsport.co.zw`, confirm DNS, HTTPS and site responses, add the domain in Vercel, and configure a permanent redirect from the secondary host. One production build must use one origin consistently.

## GA4 events

| Event | Trigger | Non-sensitive dimensions |
|---|---|---|
| `view_item` | Product page client mount | SKU, name, family, vehicle group, type, thread, path |
| `view_item_list` | Catalogue mount | list name, item count, path |
| `select_item` | Product card/search result click | product dimensions and list name |
| `search` | Internal search with results | aggregated term bucket, result count, path |
| `search_no_results` | Internal search without results | aggregated term bucket, result count, path |
| `view_3d` | First pointer/wheel interaction per viewer mount | product dimensions |
| `reference_click` | External evidence link | product dimensions, source issuer |
| `whatsapp_click` | Tracked WhatsApp CTA | product dimensions where relevant, entry point |
| `enquiry_start` | First form edit | product dimensions where relevant, entry point |
| `enquiry_submit` | Email provider returns a delivery ID | product dimensions, entry point, delivery method |
| `enquiry_error` | Endpoint/network delivery failure | product dimensions, entry point, coarse error type |

Arbitrary search text is never sent. Search terms become a known SKU, thread-size or vehicle bucket, otherwise `other`. Names, phone numbers, emails, chassis/VIN values, notes and photos are never added to GA4 parameters. A WhatsApp click or prepared draft is intent, not a completed enquiry. `enquiry_submit` is emitted only for provider-confirmed direct delivery.

Create GA4 custom dimensions for `product_family`, `vehicle_group`, `component_type`, `thread_size`, `enquiry_entry_point`, `delivery_method`, and `search_term_bucket`. Mark `enquiry_submit` as a key event only after direct delivery is configured and tested.

## Procurement reporting specification

Use three sources and keep their meanings separate:

| Report measure | Source of truth | Interpretation |
|---|---|---|
| Organic impressions, clicks, queries, average position | Google Search Console | Google Search discovery, not site engagement |
| Product/list visits, internal searches, zero results, 3D/reference/WhatsApp interactions | GA4 | Website behavior and enquiry intent, not a submitted lead |
| Delivered enquiries by SKU, vehicle family and quantity | Enquiry delivery mailbox/service records | Received leads; the commercial-interest denominator |

A lean monthly report should show Search Console clicks and impressions by landing page/query; GA4 product views, zero-result buckets and WhatsApp clicks; confirmed enquiries by SKU/vehicle family; and search-to-enquiry conversion. Join at page path and StudSport SKU where available. Do not count page views, impressions or WhatsApp clicks as enquiries.

Suggested conversion calculations:

- organic landing-to-enquiry = confirmed enquiries with organic attribution / organic landing sessions;
- product interest-to-enquiry = confirmed enquiries for SKU / unique product viewers for SKU;
- unmet-demand signal = repeated privacy-safe zero-result bucket plus subsequent WhatsApp or confirmed enquiry activity.

## Google Search Console readiness

1. Verify the URL-prefix property matching the current canonical origin: `https://studsport.vercel.app/`. A Domain property for `studsport.co.zw` is appropriate only after DNS control and domain activation.
2. Put the provided token in `GOOGLE_SITE_VERIFICATION`, deploy, and confirm the verification meta tag. Do not paste the full `<meta>` element—use only its token.
3. Submit `https://studsport.vercel.app/sitemap.xml` in Sitemaps.
4. Use URL Inspection on `/`, `/products`, `/products/ss-3001`, `/products/ss-3003`, `/products/ss-4004`, one vehicle page and the measuring guide. Check the user-declared and Google-selected canonical match.
5. In Pages indexing, investigate alternate canonical, crawled-not-indexed, discovered-not-indexed and soft-404 groups. Print sheets, filtered catalogue URLs, the design system and enquiry form should not be indexed.
6. In Performance → Search results, review queries, pages, clicks, impressions, CTR and average position. Segment by product pages, vehicle pages and guide pages.
7. Record a deployment annotation outside Search Console, then compare equal 28-day periods after enough data accumulates. Account for seasonality and low sample sizes.

Submitting a sitemap and requesting inspection do not mean a page has been indexed. Search Console account actions remain manual because no account access was available in this implementation session.
