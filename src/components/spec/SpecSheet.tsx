import Link from 'next/link';
import { company, includes } from '@/lib/catalogue';
import type { Product } from '@/lib/catalogue';
import { href, typeLabel, threadLabel, finishOf, specGroups, vehicle } from '@/lib/products';
import { Mark } from '@/components/Mark';
import { Thumb } from '@/components/Thumb';
import { Drawing } from '@/components/Drawing';
import { PrintButton } from './PrintButton';
import s from './spec.module.css';

const LENGTH_NOTE = { 'wheel-nut': 'H = overall nut height', 'double-ended': 'L = A + C + B', 'press-in-stud': 'L includes head · L = H + K + S + T', 'stud-nut': 'L includes head · L = H + K + S + T' };

/* One A4 portrait page. Every value comes from the record; nothing is hand-authored per product. */
export function SpecSheet({ p }: { p: Product }) {
  const groups = specGroups(p).filter(g => g.group !== 'General' && g.group !== 'Data');
  return (
    <div className={s.desk}>
      <div className={s.toolbar}>
        <Link href={href(p)} className={s.back}>← Back to {p.partNo}</Link>
        <PrintButton />
      </div>
      <div className={s.scroller}>
        <article className={s.page} aria-label={`${p.partNo} specification sheet`}>
          <div className={s.inner}>
            <header className={s.head}>
              <div className={s.brand}>
                <Mark ink="#15171a" accent="oklch(0.62 0.17 45)" />
                <div className={s.brandText}>
                  <span className={s.word}>StudSport</span>
                  <span className={s.desc}>{company.descriptor} · Harare</span>
                </div>
              </div>
              <div className={s.docMeta}>
                <span>DOCUMENT</span><b>Product specification</b>
                <span>REVISION</span><span>Rev {p.spec.revision} · {p.spec.date}</span>
                <span>SHEET</span><span>1 of 1</span>
              </div>
            </header>

            <div className={s.title}>
              <div className={s.titleText}>
                <span className={s.partNo}>{p.partNo}</span>
                <h1 className={s.h1}>{p.name}</h1>
                <p className={s.summary}>{p.summary}</p>
                <div className={s.facts}>
                  <span>Type</span><span>{typeLabel(p)}</span>
                  <span>Supplied as</span><span>{includes[p.includes]}</span>
                  <span>Thread</span><span>{threadLabel(p)}</span>
                  <span>Finish</span><span>{finishOf(p).label}</span>
                </div>
              </div>
              <div className={s.render}>
                <Thumb sku={p.slug} tone="light" w={1000} h={640} />
                <span className={s.renderCap}>RENDER · VISUAL APPROXIMATION</span>
              </div>
            </div>

            <div className={s.drawing}>
              <div className={s.drawingHead}>
                <b>Dimensioned drawing</b>
                <span>Dimensions in mm · Not to scale · {LENGTH_NOTE[p.template]}</span>
              </div>
              <div className={s.drawingBody}>
                <Drawing sku={p.slug} layout="wide" grid minPx={8.5} maxPx={9.5} />
              </div>
            </div>

            <div className={s.groups}>
              {groups.map(g => (
                <div key={g.group} className={s.group}>
                  <h2 className={s.h2}>{g.group}</h2>
                  {g.rows.map(r => <div key={r.k} className={s.row}><span>{r.k}</span><span>{r.v}</span></div>)}
                </div>
              ))}
            </div>

            <div className={s.lists}>
              <div className={s.apps}>
                <h2 className={s.h2}>Example applications · confirm fitment</h2>
                {p.applications.map((a, i) => (
                  <div key={i} className={s.appRow}>
                    <span>{vehicle(a.vehicle).label}</span><span>{a.model}</span><span>{a.years}</span><span>{a.position} · {a.side}</span>
                  </div>
                ))}
              </div>
              <div className={s.included}>
                <h2 className={s.h2}>Included</h2>
                {p.components.map(c => (
                  <div key={c.partNo} className={s.incRow}><span>{c.qty} ×</span><span>{c.label} ({c.partNo})</span></div>
                ))}
              </div>
            </div>

            <footer className={s.foot}>
              <div className={s.footText}>
                <b>StudSport · {company.address}</b>
                <span>Tel +263 [phone] · WhatsApp +263 [number] · {company.email}</span>
                <span>{company.web}/products/{p.slug}</span>
              </div>
              <span className={s.stamp}>Illustrative prototype data. Verify specifications and fitment before use.</span>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}
