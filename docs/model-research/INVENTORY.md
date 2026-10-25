# Catalogue inventory and reconciliation

Research review: 25 October 2026. All original URLs remain `/products/<lowercase SKU>`. **No exact duplicates or interchangeability were proved; no SKU was merged or redirected.** Confidence A–D describes evidence for the representation, not permission to install. There are no Level A StudSport identities.

The original 12 records remain illustrative, including their apparent LH/RH pairs. Six drawings remain supplier-declared. Four new records are sourcing references. Every record has unverified identity and fitment; availability, prices and matching-nut claims are unconfirmed.

## Eight pilot families

| Family / nominal request | Internal category | Catalogue reference | Reconciliation and separate handed requests |
|---|---|---|---|
| Hino Ranger/GH Rear · M22 × 1.5 × 108 | Core | SS-3003 | Retain supplier candidate: 108 under head, 118.5 overall. Original SS-1030 is 108 overall and not the same part. LH and RH remain two independent identification-required requests. |
| Toyota Dyna Rear · M20 × 1.5 × 47 | Core | SS-3004 | Retain SS-3004 candidate: 47 under head, 54 overall. Do not merge longer SS-1003. LH and RH remain two independent identification-required requests. |
| Hino Dutro Rear · M20 × 1.5 × 90 | Core | SS-4001 | Add nominal 90 reference; keep supplier Durton 91 separately. Durto marketplace 75 is another unresolved conflict. LH and RH remain two independent identification-required requests. |
| Mazda T35 Rear · M18 × 1.5 × 72 | Core | SS-3002 | Retain Mazda Rear candidate, but title 72 / detailed 66 under-head conflict unresolved. T35 not confirmed. LH and RH remain two independent identification-required requests. |
| Mazda T35 Front · M18 × 1.5 × 72 | Test | SS-3001 | Retain Mazda Front candidate: 72 under head / 80.5 overall; T35 not confirmed. LH and RH remain two independent identification-required requests. |
| Toyota 2D Rear · M20 × 1.5 × 75 | Test | SS-4002 | Add 2D reference; no proof of equivalence to supplier Rino SS-3005. LH and RH remain two independent identification-required requests. |
| UD Nissan CK10/CK20 Rear · M22 × 1.5 × 102 | New | SS-4003 | Add CK10/CK20 rear reference; SS-1040/1041 dimensions and applications differ. Inner thread unresolved. LH and RH remain two independent identification-required requests. |
| Volvo Rear · M22 × 1.5 × 105 | New | SS-4004 | Add reference using DT 2.65094 dimensions (105 under head / 115 overall); pilot identity and LH availability unproved. LH and RH remain two independent identification-required requests. |

All 16 lines are in `src/data/procurement-research.json`, each with `physicalVariantSku: null`. Linking two requests to a reference record does not make that record a two-handed physical part. The procurement file is never imported by public runtime code. Nominal request length basis stays unresolved even when a candidate source explicitly supplies an under-head length.

## Every catalogue record

| SKU | Family | Historical / source / requested application | Evidence level / provenance | Manufacturer or OEM candidates | Action |
|---|---|---|---|---|---|
| [SS-1001](#ss-1001) | legacy-dyna-front | toyota-dyna Dyna 200 / 300 Front; hino Dutro Front (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-1002](#ss-1002) | legacy-dyna-front | toyota-dyna Dyna 200 / 300 Front; hino Dutro Front (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-1003](#ss-1003) | legacy-dyna-long | toyota-dyna Dyna 300 / 400 Rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-1010](#ss-1010) | legacy-isuzu | isuzu N-Series NPR / NQR Rear (unverified) | D / illustrative | None identified; candidate-only | retain |
| [SS-1011](#ss-1011) | legacy-isuzu | isuzu N-Series NPR / NQR Rear (unverified) | D / illustrative | None identified; candidate-only | retain |
| [SS-1020](#ss-1020) | legacy-canter | mitsubishi-canter Canter FE Front & rear (unverified) | D / illustrative | None identified; candidate-only | retain |
| [SS-1030](#ss-1030) | legacy-m22-set | hino 500 Series Rear; volvo FM / FH Front & rear; scania P / G / R Front & rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-1040](#ss-1040) | legacy-ud-double | nissan-ud Condor Rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-1041](#ss-1041) | legacy-stepped-double | nissan-ud MK Series Rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-2001](#ss-2001) | legacy-m20-cone-nut | toyota-dyna Dyna 200 / 300 / 400 Front & rear; hino Dutro Front & rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-2002](#ss-2002) | legacy-m22-flange-nut | hino 500 Series Rear; volvo FM / FH Front & rear; scania P / G / R Front & rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-2003](#ss-2003) | legacy-m20-cone-nut | toyota-dyna Dyna 200 / 300 / 400 Front & rear; hino Dutro Front & rear (unverified) | C / illustrative | None identified; candidate-only | retain |
| [SS-3001](#ss-3001) | mazda-t35-front | mazda Mazda Front (supplier label) Front (unverified) | B / supplier-declared | BNTHMZ0025-LB, BNTHMZ0025-RB; candidate-only | retain |
| [SS-3002](#ss-3002) | mazda-t35-rear | mazda Mazda Rear (supplier label) Rear (unverified) | C / supplier-declared | BNTHMZ0001 LB, BNTHMZ0001 RB; candidate-only | retain |
| [SS-3003](#ss-3003) | hino-gh-rear | hino GH Rear (supplier label) Rear (unverified) | B / supplier-declared | None identified; candidate-only | retain |
| [SS-3004](#ss-3004) | toyota-dyna-rear | toyota-dyna Dynaps Rear (name as printed) Rear (unverified) | B / supplier-declared | LF11035, LF11036; candidate-only | retain |
| [SS-3005](#ss-3005) | supplier-rino-rear | toyota-rino Rino Rear (name as printed) Rear (unverified) | B / supplier-declared | LT-TOYO-02; candidate-only | retain |
| [SS-3006](#ss-3006) | supplier-durton-rear | hino Durton Rear (name as printed) Rear (unverified) | C / supplier-declared | None identified; candidate-only | retain |
| [SS-4001](#ss-4001) | hino-dutro-rear | hino Dutro Rear (unverified) | D / illustrative | None identified; candidate-only | add-reference |
| [SS-4002](#ss-4002) | toyota-2d-rear | toyota-2d 2D Rear (unverified) | C / illustrative | BNTHTY0003, BNTHTY0004; candidate-only | add-reference |
| [SS-4003](#ss-4003) | ud-ck-rear | nissan-ud CK10 / CK20 Rear (unverified) | C / illustrative | BNTHNS0016, BNTHNS0017; candidate-only | add-reference |
| [SS-4004](#ss-4004) | volvo-rear | volvo Rear; chassis unconfirmed Rear (unverified) | B / illustrative | 2.65094, 20515519, 7420515519; candidate-only | add-reference |

## SS-1001

**Front wheel stud M20 × 1.5 RH** · `press-in-stud` · `ss-1001`

- Threads in the model: M20 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 74; head Ø34 × 8; knurl Ø22.4 × 14 / 36 teeth; shoulder Ø20 × 6; thread length 46 mm. All illustrative.
- Variant relationship: dyna-m20. Historical grouping retained for navigation only.
- Source evidence: [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Headed-stud visual analogue; original M20×74, tooth count and Dyna/Dutro years uncorroborated.

## SS-1002

**Front wheel stud M20 × 1.5 LH** · `press-in-stud` · `ss-1002`

- Threads in the model: M20 × 1.5 LH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 74; head Ø34 × 8; knurl Ø22.4 × 14 / 36 teeth; shoulder Ø20 × 6; thread length 46 mm. All illustrative.
- Variant relationship: dyna-m20. Historical grouping retained for navigation only.
- Source evidence: [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Separate illustrative LH model; physical LH part not identified.

## SS-1003

**Rear wheel stud M20 × 1.5 RH, long** · `press-in-stud` · `ss-1003`

- Threads in the model: M20 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 94; head Ø34 × 8; knurl Ø22.4 × 14 / 36 teeth; shoulder Ø20 × 10; thread length 62 mm. All illustrative.
- Variant relationship: dyna-m20. Historical grouping retained for navigation only.
- Source evidence: [skysun-dyna](https://skysun-truckparts.en.made-in-china.com/product/LKsQkcBYlFWh/China-10-9-Grade-Wheel-Bolt-for-Toyota-Rear-Dyna-140.html), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: 94 overall does not equal pilot47 or supplier54; preserve as separate historical record.

## SS-1010

**Rear hub bolt M22 × 1.5 RH** · `press-in-stud` · `ss-1010`

- Threads in the model: M22 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 85; head Ø40 × 9; knurl Ø24.6 × 16 / 40 teeth; shoulder Ø22 × 8; thread length 52 mm. All illustrative.
- Variant relationship: isuzu-m22. Historical grouping retained for navigation only.
- Source evidence: [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: NPR examples include double-ended assemblies; original single-ended M22×85 has no exact match.

## SS-1011

**Rear hub bolt M22 × 1.5 LH** · `press-in-stud` · `ss-1011`

- Threads in the model: M22 × 1.5 LH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 85; head Ø40 × 9; knurl Ø24.6 × 16 / 40 teeth; shoulder Ø22 × 8; thread length 52 mm. All illustrative.
- Variant relationship: isuzu-m22. Historical grouping retained for navigation only.
- Source evidence: [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Separate illustrative LH record, same unresolved architecture as SS-1010.

## SS-1020

**Wheel stud M18 × 1.5 RH** · `press-in-stud` · `ss-1020`

- Threads in the model: M18 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 64; head Ø30 × 7; knurl Ø20.2 × 12 / 32 teeth; shoulder Ø18 × 5; thread length 40 mm. All illustrative.
- Variant relationship: No physical variant identified. 
- Source evidence: [litai-canter](https://litai-autoparts.en.made-in-china.com/product/LvXEbYIVkOkZ/China-Canter-PS125-135-Wheel-Hub-Bolt-M18-1-5-M20-1-5-78-mm-Right-Side.html), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: M18×64 headed model differs from retrieved double-ended78 and82 examples; no confirmed fitment.

## SS-1030

**Stud & nut set M22 × 1.5 RH** · `stud-nut` · `ss-1030`

- Threads in the model: M22 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 108; head Ø40 × 10; knurl Ø24.6 × 16 / 40 teeth; shoulder Ø22 × 12; thread length 70 mm. All illustrative.
- Variant relationship: No physical variant identified. 
- Source evidence: [dt-volvo](https://partnerportal.dieseltechnic.com/en/products/dt-2-65094-wheel-bolt), [sanlu-gh](https://ysbolts.en.made-in-china.com/product/bwntdGWOhlTx/China-High-Quality-Gh-Fg-Wheel-Bolt-for-Hino.html).
- Remaining uncertainty: 108 overall/70 thread differs from GH118.5 overall/41 thread and Volvo115/77; shared M22 does not establish fitment or nut compatibility.

## SS-1040

**Double-ended hub bolt M20 × 1.5, hex collar** · `double-ended` · `ss-1040`

- Threads in the model: M20 × 1.5 RH / M20 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Overall 84; ends 30 / 44; collar {'shape': 'hex', 'af': 27, 'length': 10} (illustrative mm).
- Variant relationship: ud-double. Historical grouping retained for navigation only.
- Source evidence: [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Double-ended architecture analogue; M20×84/hex centre not proven for Condor or CK10/20.

## SS-1041

**Double-ended hub bolt M18 / M20, stepped** · `profiled-fastener` · `ss-1041`

- Threads in the model: M18 × 1.5 RH / M20 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: Model overall 78 mm; thread 26 × Ø18 (schematic); plain 2 × Ø18 (schematic); knurl 6 × Ø20.2 (schematic); collar 4 × Ø25 (schematic); thread 40 × Ø20 (schematic)
- Variant relationship: ud-double. Historical grouping retained for navigation only.
- Source evidence: [litai-canter](https://litai-autoparts.en.made-in-china.com/product/LvXEbYIVkOkZ/China-Canter-PS125-135-Wheel-Hub-Bolt-M18-1-5-M20-1-5-78-mm-Right-Side.html).
- Remaining uncertainty: Canter listing matches M18/M20×78 nominal but has splines/flange, unlike old smooth central collar. Nissan MK association not established.

## SS-2001

**Wheel nut M20 × 1.5 RH, 60° cone seat** · `wheel-nut` · `ss-2001`

- Threads in the model: M20 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: 32 AF × 24 height; {'type': 'cone60', 'dia': 28} (illustrative mm).
- Variant relationship: m20-cone-nut. Historical grouping retained for navigation only.
- Source evidence: litai-drawings (user-supplied PDF).
- Remaining uncertainty: Nut analogues show chamfered hex with internal thread. Existing32AF/cone seat not proven compatible with listed vehicles.

## SS-2002

**Flange wheel nut M22 × 1.5 RH, flat seat** · `wheel-nut` · `ss-2002`

- Threads in the model: M22 × 1.5 RH. Historical illustrative hand only; not independently identified.
- Geometry inventory: 32 AF × 27 height; {'type': 'flat-flange', 'dia': 46, 'thickness': 4.5} (illustrative mm).
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF).
- Remaining uncertainty: GH drawing nut is33AF×32, existing32AF×27 differs. Illustrative seat/washer is not an approved matching nut.

## SS-2003

**Wheel nut M20 × 1.5 LH, 60° cone seat** · `wheel-nut` · `ss-2003`

- Threads in the model: M20 × 1.5 LH. Historical illustrative hand only; not independently identified.
- Geometry inventory: 32 AF × 24 height; {'type': 'cone60', 'dia': 28} (illustrative mm).
- Variant relationship: m20-cone-nut. Historical grouping retained for navigation only.
- Source evidence: litai-drawings (user-supplied PDF).
- Remaining uncertainty: Separate LH illustration; identification groove is a design convention, not a supplier marking declaration.

## SS-3001

**Mazda Front — supplier drawing** · `profiled-fastener` · `ss-3001`

- Threads in the model: M18 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 80.5 mm; head 8.5 × Ø36 (drawing); plain 4.5 × Ø22.8 (schematic); knurl 34.5 × Ø22.8 (derived); plain 3 × Ø22.8 (schematic); thread 30 × Ø18 (drawing)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Supplier says Mazda Front, not T35. 72 under head /80.5 overall; ambiguous spline callout retained. Candidate only.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-3002

**Mazda Rear — supplier drawing** · `profiled-fastener` · `ss-3002`

- Threads in the model: M18 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 76.5 mm; head 10.5 × Ø38 (drawing); knurl 16 × Ø22.5 (drawing); plain 21 × Ø22.1 (schematic); thread 29 × Ø18 (drawing)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Supplier heading72 under head conflicts with detailed66. Model76.5 overall remains provisional. T35 unconfirmed.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-3003

**Hino GH Rear — supplier drawing** · `profiled-fastener` · `ss-3003`

- Threads in the model: M22 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 118.5 mm; head 10.5 × Ø40 (derived); plain 40 × Ø25.5 (drawing); plain 27 × Ø25 (derived); thread 41 × Ø22 (drawing)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [sanlu-gh](https://ysbolts.en.made-in-china.com/product/bwntdGWOhlTx/China-High-Quality-Gh-Fg-Wheel-Bolt-for-Hino.html).
- Remaining uncertainty: 108 under head/118.5 overall; corrected R20 head envelope. No manufacturer/OEM number or selected hand.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-3004

**Toyota Dynaps Rear — supplier drawing** · `profiled-fastener` · `ss-3004`

- Threads in the model: M20 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 54 mm; head 7 × Ø28 (schematic); knurl 11 × Ø20.5 (schematic); plain 6 × Ø20.5 (schematic); thread 30 × Ø20 (drawing)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [skysun-dyna](https://skysun-truckparts.en.made-in-china.com/product/LKsQkcBYlFWh/China-10-9-Grade-Wheel-Bolt-for-Toyota-Rear-Dyna-140.html).
- Remaining uncertainty: Dynaps label resembles Dyna PS140; 47 under head/54 overall. Not a proven same manufacturer part.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-3005

**Toyota Rino Rear — supplier drawing** · `profiled-fastener` · `ss-3005`

- Threads in the model: M20 × 1.5 UNSPECIFIED / M20 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 75 mm; thread 27 × Ø20 (schematic); plain 5 × Ø18 (schematic); collar 5 × Ø24 (schematic); plain 1.5 × Ø20.45 (derived); knurl 8.5 × Ø20.8 (drawing); plain 6 × Ø17 (schematic); thread 22 × Ø20 (derived)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [litai-rino](https://litai-autoparts.en.made-in-china.com/product/gGdpyeDEXTVC/China-Quanzhou-Factory-Produced-Toyota-Rino-Rear-Wheel-Hub-Bolt.html).
- Remaining uncertainty: 75 reference overall, Z50±1; flange diameter unknown. Rino/2D identity and handedness unresolved.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-3006

**Hino Durton Rear — supplier drawing** · `profiled-fastener` · `ss-3006`

- Threads in the model: M20 × 1.5 UNSPECIFIED / M20 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 91 mm; thread 31 × Ø20 (drawing); plain 5 × Ø20 (derived); head 5 × Ø32 (derived); plain 26 × Ø22 (derived); thread 24 × Ø20 (drawing)
- Variant relationship: No physical variant identified. 
- Source evidence: litai-drawings (user-supplied PDF), [litai-durto](https://litai-autoparts.en.made-in-china.com/product/NneYUjLCflWS/China-Material-40cr-Durto-Hub-Bolt-M20-1-5-M20-1-5-75mm-Right-Side.html).
- Remaining uncertainty: 91 overall conflicts with pilot90; Durton/Dutro mapping unresolved and Durto marketplace75 conflicts again.
- Supplier measurements and tolerances: [source register](../../src/data/supplier-measurements.json), keyed by this SKU; original transcription retained in [baseline models](baseline-models.json). Rendering estimates are separate.

## SS-4001

**Hino Dutro rear — identification pending** · `profiled-fastener` · `ss-4001`

- Threads in the model: M20 × 1.5 UNSPECIFIED / M20 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 90 mm; thread 31 × Ø20 (schematic); plain 5 × Ø20 (schematic); head 5 × Ø32 (schematic); plain 25 × Ø22 (schematic); thread 24 × Ø20 (schematic)
- Variant relationship: No physical variant identified. 
- Source evidence: pilot-2026 (user-supplied PDF), litai-drawings (user-supplied PDF), [litai-durto](https://litai-autoparts.en.made-in-china.com/product/NneYUjLCflWS/China-Material-40cr-Durto-Hub-Bolt-M20-1-5-M20-1-5-75mm-Right-Side.html).
- Remaining uncertainty: Reference added for nominal90; drawing91 not merged. Local sections are illustrative.

## SS-4002

**Toyota 2D rear — identification pending** · `profiled-fastener` · `ss-4002`

- Threads in the model: M20 × 1.5 UNSPECIFIED / M20 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 75 mm; thread 27 × Ø20 (schematic); plain 5 × Ø18 (schematic); collar 5 × Ø24 (schematic); plain 1.5 × Ø20.45 (schematic); knurl 8.5 × Ø20.8 (schematic); plain 6 × Ø17 (schematic); thread 22 × Ø20 (schematic)
- Variant relationship: No physical variant identified. 
- Source evidence: pilot-2026 (user-supplied PDF), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf), [litai-rino](https://litai-autoparts.en.made-in-china.com/product/gGdpyeDEXTVC/China-Quanzhou-Factory-Produced-Toyota-Rino-Rear-Wheel-Hub-Bolt.html).
- Remaining uncertainty: 2D/DA6000 shown in Shenka, but no dimensional proof of equality with Rino75. Separate reference.

## SS-4003

**UD Nissan CK10/CK20 rear — identification pending** · `profiled-fastener` · `ss-4003`

- Threads in the model: M22 × 1.5 UNSPECIFIED / M22 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 102 mm; thread 28 × Ø22 (schematic); plain 23 × Ø22 (schematic); collar 5 × Ø31 (schematic); plain 6 × Ø22 (schematic); thread 40 × Ø22 (schematic)
- Variant relationship: No physical variant identified. 
- Source evidence: pilot-2026 (user-supplied PDF), [shenka-2024](https://shenkaindustries.co.za/wp-content/uploads/2024/08/HEAVY-DUTY-TRUCK-STUDS-RANGE-Catalogue-14-AUGUST-2024_compressed.pdf).
- Remaining uncertainty: Rear photographs show double-ended stud and washer/nut assemblies. Front102 search matches are not rear-fitment evidence. Inner thread unknown.

## SS-4004

**Volvo rear — identification pending** · `profiled-fastener` · `ss-4004`

- Threads in the model: M22 × 1.5 UNSPECIFIED. Unknown handedness is rendered as neutral annular grooves, never silently RH/LH.
- Geometry inventory: Model overall 115 mm; head 10 × Ø36 (schematic); knurl 15 × Ø22.8 (schematic); plain 13 × Ø22 (schematic); thread 77 × Ø22 (schematic)
- Variant relationship: No physical variant identified. 
- Source evidence: pilot-2026 (user-supplied PDF), [dt-volvo](https://partnerportal.dieseltechnic.com/en/products/dt-2-65094-wheel-bolt), [alibaba-volvo](https://www.alibaba.com/product-detail/wheel-bolt-and-nut-hub-bolt_62529151291.html).
- Remaining uncertainty: DT reference2.65094 establishes105 under head for that reference. Planned part identity and LH availability remain unresolved.
- Manufacturer reference measurements: Overall 115 mm (DT2.65094 reference only); Under head 105 mm (DT2.65094 reference only); Thread length 77 mm (DT2.65094 reference only); Head diameter 36 mm (DT2.65094 reference only).
