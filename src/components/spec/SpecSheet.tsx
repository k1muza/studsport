import Link from 'next/link';
import { company, includes } from '@/lib/catalogue';
import type { Product } from '@/lib/catalogue';
import { href, typeLabel, threadLabel, finishOf, specGroups } from '@/lib/products';
import { Mark } from '@/components/Mark';
import { Thumb } from '@/components/Thumb';
import { Drawing } from '@/components/Drawing';
import { PrintButton } from './PrintButton';
import s from './spec.module.css';

const LENGTH_NOTE = { 'wheel-nut': 'H = overall nut height', 'double-ended': 'L = A + C + B', 'press-in-stud': 'L includes head', 'stud-nut': 'L includes head', 'profiled-fastener': 'L = full illustrated length' };

/* Concise buyer-facing reference: detailed uncertainties remain on the product page and in the evidence record. */
export function SpecSheet({ p }: { p: Product }) {
  const cleanName = p.name.replace(/\s*—\s*(supplier drawing|identification pending)\s*$/i, '').trim();
  const name = /(?:stud|bolt|nut)/i.test(cleanName) ? cleanName : `${cleanName} ${typeLabel(p).toLowerCase()}`;
  const all = specGroups(p);
  const supplierDimensions = all.find(g => g.group === 'Source measurements (supplier-declared)');
  const sourcingRequest = all.find(g => g.group.startsWith('Sourcing requirement'));
  const legacyDimensions = all.find(g => g.group === 'Illustrative dimensions (mm)');
  const referenceRows = supplierDimensions?.rows
    ?? (sourcingRequest ? sourcingRequest.rows.filter(r => r.k === 'Nominal request') : [])
    ?? [];
  const dimensions = p.template === 'profiled-fastener'
    ? { group: supplierDimensions ? 'Dimensions from supplier' : 'Reference size', rows: referenceRows }
    : { group: 'Illustrative measurements', rows: (legacyDimensions?.rows ?? []).filter(r => !r.k.startsWith('Check:')).slice(0, 8) };
  const details = { group: 'Part details', rows: [
    { k: 'Thread', v: threadLabel(p) },
    { k: 'Type', v: typeLabel(p) },
    { k: 'Finish', v: finishOf(p).label },
    ...(p.grade && !/unverified|not specified/i.test(p.grade) ? [{ k: 'Grade (supplier)', v: p.grade }] : []),
  ] };
  const groups = [dimensions, details].filter(g => g.rows.length);
  const whatsappUrl = company.whatsappLink + '?text=' + encodeURIComponent(`Hi StudSport, can you help me identify ${p.partNo}?`);
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
                <span>DOCUMENT</span><b>Part reference</b>
                <span>REFERENCE</span><span>{p.partNo}</span>
                <span>ISSUED</span><span>{p.spec.date}</span>
              </div>
            </header>

            <div className={s.title}>
              <div className={s.titleText}>
                <span className={s.partNo}>{p.partNo}</span>
                <h1 className={s.h1}>{name}</h1>
                <p className={s.summary}>Compare this part with your existing stud, or send us a photo and your vehicle details. We can help you check the right size before ordering.</p>
                <div className={s.facts}>
                  <span>Type</span><span>{typeLabel(p)}</span>
                  <span>Supplied as</span><span>{includes[p.includes]}</span>
                  <span>Thread</span><span>{threadLabel(p)}</span>
                  <span>Finish</span><span>{finishOf(p).label}</span>
                </div>
              </div>
              <div className={s.render}>
                <Thumb sku={p.slug} tone="light" w={1000} h={640} />
                <span className={s.renderCap}>ILLUSTRATIVE 3D MODEL</span>
              </div>
            </div>

            <div className={s.drawing}>
              <div className={s.drawingHead}>
                <b>Dimension reference</b>
                <span>mm · Not to scale · {LENGTH_NOTE[p.template]}</span>
              </div>
              <div className={s.drawingBody}>
                <Drawing sku={p.slug} layout="wide" grid minPx={8.5} maxPx={9.5} />
              </div>
            </div>

            <div className={s.groups}>
              {groups.map(g => (
                <div key={g.group} className={s.group}>
                  <h2 className={s.h2}>{g.group}</h2>
                  {g.rows.map(r => <div key={r.k} className={`${s.row} ${r.v.length > 110 ? s.longRow : ''}`}><span>{r.k}</span><span>{r.v}</span></div>)}
                </div>
              ))}
            </div>

            <div className={s.help}>
              <div>
                <b>Need help matching this part?</b>
                <span>Send your vehicle model and a photo or dimensions of your existing stud.</span>
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Ask on WhatsApp ↗</a>
            </div>
            <footer className={s.foot}>
              <div className={s.footText}>
                <b>StudSport · Harare, Zimbabwe</b>
                <span>WhatsApp {company.whatsapp} · studsport.vercel.app/products/{p.slug}</span>
                <span>3D illustration for identification. Please confirm dimensions and vehicle fitment before use.</span>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}
