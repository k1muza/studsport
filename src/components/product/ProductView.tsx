'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productTypes, products as ALL, type Product, type Template } from '@/lib/catalogue';
import {
  getProduct, href, sheetHref, typeLabel, isLH, avail, keySpecs, specGroups, variants, related, compare, vehicle, whatsapp,
} from '@/lib/products';
import { Viewer } from '@/components/Viewer';
import { Drawing } from '@/components/Drawing';
import { Thumb } from '@/components/Thumb';
import { QtyStepper } from '@/components/QtyStepper';
import s from './product.module.css';

type Tab = '3d' | 'photos' | 'drawing';
type SectionKey = 'drawing' | 'specs' | 'apps' | 'incl' | 'cmp';

const TABS: [Tab, string][] = [['3d', '3D view'], ['photos', 'Product photos'], ['drawing', 'Technical drawing']];

const LEGEND: Record<Template, [string, string][]> = {
  'press-in-stud': [['L', 'Overall length, includes head'], ['Lu', 'Length under head'], ['H', 'Head thickness'], ['K', 'Knurl length'], ['S', 'Shoulder length'], ['T', 'Threaded length']],
  'stud-nut': [['L', 'Overall stud length, includes head'], ['Lu', 'Length under head'], ['H', 'Head thickness'], ['K', 'Knurl length'], ['S', 'Shoulder length'], ['T', 'Threaded length'], ['Hn', 'Nut height (shown at reference clamp length)']],
  'double-ended': [['L', 'Overall length'], ['A', 'End A thread length'], ['C', 'Collar length'], ['B', 'End B thread length']],
  'wheel-nut': [['H', 'Nut height'], ['s', 'Seat height'], ['AF', 'Width across flats']],
  'profiled-fastener': [['L', 'Total model length'], ['T', 'Thread region'], ['S', 'Axial section'], ['Ø', 'Diameter'], ['Note', 'Schematic transitions and unconfirmed measurements are not manufacturing dimensions']],
};

const isNut = (q: Product) => q.template === 'wheel-nut';
const defaultQty = (p: Product) => (isNut(p) ? 20 : 10);

function Section({ id, num, title, open, onToggle, children }: { id: string; num: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section id={id} className={s.section}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`${id}-body`} className={s.toggle}>
        <span className={s.num}>{num}</span>
        <h2 className={s.secTitle}>{title}</h2>
        <span className={s.sign} aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && <div id={`${id}-body`}>{children}</div>}
    </section>
  );
}

export function ProductView({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const [tab, setTab] = useState<Tab>('3d');
  const [qty, setQty] = useState(defaultQty(p));
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ drawing: true, specs: true, apps: true, incl: true, cmp: true });

  useEffect(() => {
    // ?qty= from a quote link; on mobile, sections 02–05 start collapsed.
    const q = parseInt(new URLSearchParams(window.location.search).get('qty') || '', 10);
    setQty(q > 0 ? q : defaultQty(p));
    if (matchMedia('(max-width: 760px)').matches) setOpen({ drawing: true, specs: false, apps: false, incl: false, cmp: false });
  }, [p]);

  const toggle = (k: SectionKey) => setOpen(o => ({ ...o, [k]: !o[k] }));
  const av = avail(p);
  const vars = variants(p);
  const rev = p.spec.revision;
  const amount = p.price ? p.price.amount : null;
  const quoteHref = `/find-my-part?part=${p.partNo}&qty=${qty}`;
  const waHref = whatsapp(p, qty);

  const others = [...vars, ...related(p)].filter((q, i, a) => a.indexOf(q) === i && q !== p && isNut(q) === isNut(p));
  const cmpList = [p, ...others].slice(0, 4);
  const cmpRows = compare(p, cmpList);
  const inclOptions = (isNut(p)
    ? [['nut', 'Nut only'], ['stud-nut', 'Stud and nut'], ['assembly', 'Complete assembly']]
    : [['stud', 'Stud only'], ['stud-nut', 'Stud and nut'], ['assembly', 'Complete assembly']]) as [string, string][];
  const nut = p.includes === 'stud' && p.matchingNut ? getProduct(p.matchingNut) : null;
  const fits = isNut(p) ? ALL.filter(q => q.matchingNut === p.partNo && q.includes === 'stud') : [];

  return (
    <>
      <main className={s.top}>
        <div className={`wrap ${s.topInner}`}>
          <nav aria-label="Breadcrumb" className={s.crumbs}>
            <Link href="/">Home</Link><span>/</span>
            <Link href="/products">Products</Link><span>/</span>
            <Link href={`/products?type=${p.type}`}>{productTypes[p.type].plural}</Link><span>/</span>
            <span className={s.crumbHere}>{p.partNo}</span>
          </nav>
          <div className={s.layout}>
            <section aria-label="Product viewer" className={s.viewerCol}>
              <div role="tablist" aria-label="View" className={s.tabs}>
                {TABS.map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={tab === id} aria-controls="stage" onClick={() => setTab(id)} className={s.tab}>{label}</button>
                ))}
              </div>
              <div id="stage" role="tabpanel" className={s.stage}>
                <div className={s.stageGrid} />
                <div className={`${s.crop} ${s.cropTL}`} /><div className={`${s.crop} ${s.cropTR}`} />
                <div className={`${s.crop} ${s.cropBL}`} /><div className={`${s.crop} ${s.cropBR}`} />
                <div className={s.rev}>{p.partNo} · Rev {rev}</div>
                {tab === '3d' && <Viewer sku={p.slug} variant="pdp" />}
                {tab === 'photos' && (
                  <div className={s.photos}>
                    {p.media.photos.map(ph => (
                      <div key={ph} className={`${s.photo} placeholder-stripes`}><span>PRODUCT PHOTO<br />{ph}</span></div>
                    ))}
                  </div>
                )}
                {tab === 'drawing' && (
                  <div className={s.drawingTab}><Drawing sku={p.slug} theme="dark" layout="auto" /></div>
                )}
              </div>
              <p className={s.stageNote}>{p.spec.status === 'pending' ? 'Supplier drawing reference only. Some 3D sections are schematic and the handedness may be unknown. Do not use this rendering or generated drawing to verify fitment or manufacture a fastener.' : '3D model and thread form are simplified for display. Dimensions are taken from the specification table below.'}</p>
            </section>

            <section aria-label="Product summary" className={s.summary}>
              <div className={s.intro}>
                <div className={s.metaRow}>
                  <span className={s.partNo}>{p.partNo}</span>
                  <span className={s.slash}>/</span>
                  <span className={s.type}>{typeLabel(p)}</span>
                  {isLH(p) && <span className={s.lhBadge}>LEFT-HAND THREAD</span>}
                </div>
                <h1 className={s.h1}>{p.name}</h1>
                <p className={s.lede}>{p.summary}</p>
              </div>
              {vars.length > 1 && (
                <div className={s.variants}>
                  <span className="label label-dark">Variants</span>
                  <div className={s.variantRow}>
                    {vars.map(q => q === p ? (
                      <span key={q.slug} className={`${s.variant} ${s.variantCurrent}`} aria-current="page"><b>{q.variantLabel}</b><span>{q.partNo}</span></span>
                    ) : (
                      <Link key={q.slug} href={href(q)} className={s.variant}><b>{q.variantLabel}</b><span>{q.partNo}</span></Link>
                    ))}
                  </div>
                </div>
              )}
              <dl className={s.specs}>
                {keySpecs(p).map(r => (
                  <div key={r.k} className={s.specRow}><dt>{r.k}</dt><dd>{r.v}</dd></div>
                ))}
              </dl>
              <div className={s.availCard}>
                <span className={s.availHead}><span className={s.availDot} style={{ background: av.color }} />{av.label}</span>
                <span className={s.availNote}>{av.note} · Collection in Harare or delivery arranged on quote.</span>
              </div>
              <div className={s.buyRow}>
                <div className={s.qty}>
                  <label htmlFor="qty" className="label label-dark">Quantity</label>
                  <QtyStepper id="qty" tone="dark" value={qty} onChange={setQty} />
                </div>
                <div className={s.priceBlock}>
                  <span className={s.priceLine}>{amount != null ? `$${amount.toFixed(2)} ${p.price!.unit}` : 'Price on quote'}</span>
                  <span className={s.estLine}>{amount != null ? `≈ $${(amount * qty).toFixed(2)} for ${qty} pcs · illustrative price` : 'We confirm price and availability by reply'}</span>
                </div>
              </div>
              <div className={s.ctaRow}>
                <Link href={quoteHref} className="btn btn-accent btn-lg">Request a quote <span className="arrow">→</span></Link>
                <a href={waHref} target="_blank" rel="noopener" className="btn btn-ghost btn-lg">Ask on WhatsApp</a>
              </div>
              <div className={s.docLinks}>
                <Link href={sheetHref(p)}>Spec sheet (A4)</Link>
                <span>Rev {rev} · {p.spec.date}</span>
                <span>{p.spec.status === 'pending' ? 'Supplier drawing · fitment unconfirmed · partial geometry' : 'Data: illustrative sample'}</span>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className={s.lower}>
        <div className={`wrap ${s.lowerInner}`}>
          <Section id="drawing" num="01" title="Technical drawing" open={open.drawing} onToggle={() => toggle('drawing')}>
            <div className={s.sheet}>
              <div className={s.sheetHead}>
                <span><b>{p.partNo}</b> · {p.name}</span>
                <span>All dimensions in mm · Not to scale · Rev {rev}</span>
              </div>
              <div className={s.sheetBody}><Drawing sku={p.slug} layout="auto" grid /></div>
              <div className={s.legend}>
                {LEGEND[p.template].map(([k, v]) => <span key={k}><b>{k}</b>{v}</span>)}
              </div>
            </div>
          </Section>

          <Section id="specs" num="02" title="Specifications" open={open.specs} onToggle={() => toggle('specs')}>
            <div className={s.specGrid}>
              {specGroups(p).map(g => (
                <div key={g.group} className={s.specGroup}>
                  <h3 className={s.groupTitle}>{g.group}</h3>
                  {g.rows.map(r => <div key={r.k} className={s.tRow}><span>{r.k}</span><span>{r.v}</span></div>)}
                </div>
              ))}
            </div>
          </Section>

          <Section id="applications" num="03" title="Vehicle applications" open={open.apps} onToggle={() => toggle('apps')}>
            <div className={s.stack12}>
              <div className={s.apps}>
                {p.applications.map((a, i) => (
                  <div key={i} className={s.app}>
                    <div className={s.appName}><b>{vehicle(a.vehicle).label}</b><span>{a.model}</span></div>
                    <div className={s.appMeta}>
                      <span><i>YEARS</i>{a.years}</span>
                      <span><i>POSITION</i>{a.position}</span>
                      <span><i>SIDE</i>{a.side}</span>
                    </div>
                    <span className={s.appNotes}>{a.notes || 'No additional notes'}</span>
                  </div>
                ))}
              </div>
              <p className={s.fitNote}><span className="notice-dot" />{p.spec.status === 'pending' ? 'Vehicle name is copied from the supplier drawing, not a confirmed OEM application. Chassis/OEM verification required before purchase or installation.' : 'Example applications only. Send your vehicle details or the old part and we will confirm the match before you order.'}</p>
            </div>
          </Section>

          <Section id="included" num="04" title="What's included" open={open.incl} onToggle={() => toggle('incl')}>
            <div className={s.incl}>
              <div className={s.inclMain}>
                <div className={s.inclOpts}>
                  {inclOptions.map(([k, label]) => <span key={k} className={k === p.includes ? s.inclOn : s.inclOff}>{label}</span>)}
                </div>
                <div className={s.comps}>
                  {p.components.map(c => {
                    const q = getProduct(c.partNo)!;
                    return (
                      <Link key={c.partNo} href={href(q)} className={s.comp}>
                        <span className={s.compThumb}><Thumb sku={q.slug} tone="dark" w={480} h={320} /></span>
                        <span className={s.compText}><span>×{c.qty} · {c.partNo}</span><span>{c.label}</span></span>
                      </Link>
                    );
                  })}
                </div>
                {nut && (
                  <p className={s.nutNote}>Matching nut sold separately: <Link href={href(nut)}>{nut.partNo} · {nut.name} →</Link></p>
                )}
                {fits.length > 0 && (
                  <div className={s.fits}>Fits studs: {fits.map(q => <Link key={q.slug} href={href(q)}>{q.partNo}</Link>)}</div>
                )}
              </div>
              <Link href={sheetHref(p)} className={s.sheetCard}>
                <span className={s.sheetCardTop}><span>A4 · Printable</span><span>Rev {rev}</span></span>
                <span className={s.sheetCardBody}>
                  <b>Product specification sheet</b>
                  <span>Drawing, specifications, applications and contact details on one page. Print or save as PDF.</span>
                </span>
                <span className={s.sheetCardCta}>Open spec sheet <span className="arrow">↗</span></span>
              </Link>
            </div>
          </Section>

          {cmpList.length > 1 && (
            <Section id="variants" num="05" title="Related variants" open={open.cmp} onToggle={() => toggle('cmp')}>
              <div className={s.stack12}>
                <p className={s.cmpKey}><span className={s.cmpSwatch} /><span>Highlighted values differ from {p.partNo}.</span></p>
                <div className={s.cmpScroll}>
                  <div className={s.cmpTable} role="table" aria-label={`Comparison with ${p.partNo}`}>
                    <div className={s.cmpHead} role="row">
                      <div className={s.cmpCorner} role="columnheader">COMPARE</div>
                      {cmpList.map(q => (
                        <Link key={q.slug} href={href(q)} className={s.cmpCol} role="columnheader">
                          <span className={s.cmpThumb}><Thumb sku={q.slug} tone="dark" w={640} h={360} /></span>
                          <span className={s.cmpPart}><b>{q.partNo}</b>{q === p && <span className={s.cmpThis}>THIS PART</span>}</span>
                          <span className={s.cmpName}>{q.name}</span>
                        </Link>
                      ))}
                    </div>
                    {cmpRows.map(r => (
                      <div key={r.k} className={s.cmpRow} role="row">
                        <div className={s.cmpRowKey} role="rowheader">{r.k}</div>
                        {r.cells.map((c, i) => <div key={i} role="cell" className={`${s.cmpCell} ${c.diff ? s.cmpDiff : ''}`}>{c.v}</div>)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>

      <div className={s.mobileBar}>
        <span className={s.mbInfo}>
          <span className={s.mbPart}>{p.partNo} × {qty}</span>
          <span className={s.mbAvail}>{av.label}</span>
        </span>
        <a href={waHref} target="_blank" rel="noopener" aria-label="Ask on WhatsApp" className="btn btn-ghost">WhatsApp</a>
        <Link href={quoteHref} className="btn btn-accent">Request quote</Link>
      </div>
    </>
  );
}
