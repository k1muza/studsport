import Link from 'next/link';
import { company, includes } from '@/lib/catalogue';
import type { Product } from '@/lib/catalogue';
import { href, typeLabel, threadLabel, finishOf, specGroups, vehicle } from '@/lib/products';
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
  const find = (group: string) => all.find(g => g.group === group);
  const supplierDimensions = find('Source measurements (supplier-declared)');
  const requestedSize = all.find(g => g.group.startsWith('Sourcing requirement'));
  const originalDimensions = find('Illustrative dimensions (mm)');

  // Retain the original three-column presentation. Supplier measurements and
  // research requests are kept distinct; any longer record is on the product page.
  const dimensions = supplierDimensions
    ? { group: 'Dimensions (mm) · supplier', rows: supplierDimensions.rows.slice(0, 10) }
    : originalDimensions
      ? { group: 'Dimensions (mm) · illustrative', rows: originalDimensions.rows }
      : { group: 'Reference dimensions (mm)', rows: [
          ...(requestedSize?.rows.filter(r => r.k === 'Nominal request') ?? []),
          { k: '3D model length', v: `${p.dims.overall} (illustrative)` },
        ] };
  const threadSpecs = find('Thread');
  const threadData = threadSpecs?.rows ?? [
    { k: 'Thread', v: threadLabel(p) },
    { k: 'Hand', v: 'To confirm' },
  ];
  const nutSample = p.template === 'stud-nut'
    ? all.find(g => g.group.startsWith('Illustrative nut pairing'))
    : undefined;
  const materialFinish = [
    { k: 'Material', v: /unverified|not specified/i.test(p.material) ? 'Ask for details' : p.material },
    { k: 'Property class', v: /unverified|not specified/i.test(p.grade) ? 'To confirm' : p.grade },
    { k: 'Finish', v: finishOf(p).label },
  ];
  const publicApp = p.applications.slice(0, 4);
  // SS-1030 is a conceptual set: thread compatibility alone doesn't confirm
  // the correct wheel seat or an approved nut/stud combination.
  const conceptualSet = p.template === 'stud-nut';
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
              <div className={s.group}>
                <h2 className={s.h2}>{dimensions.group}</h2>
                {dimensions.rows.map(r => <div key={r.k} className={`${s.row} ${r.v.length > 70 ? s.longRow : ''}`}><span>{r.k}</span><span>{r.v}</span></div>)}
                {supplierDimensions && supplierDimensions.rows.length > dimensions.rows.length && <p className={s.moreNote}>Additional supplier measurements are available on the product page.</p>}
              </div>
              <div className={s.group}>
                <h2 className={s.h2}>Thread</h2>
                {threadData.map(r => <div key={r.k} className={s.row}><span>{r.k}</span><span>{r.v}</span></div>)}
                {nutSample && (
                  <div className={s.subGroup}>
                    <h3 className={s.h2}>Illustrative nut · compatibility to confirm</h3>
                    {nutSample.rows.filter(r => r.k !== 'Finish').slice(0, 4).map(r => <div key={r.k} className={s.row}><span>{r.k}</span><span>{r.v}</span></div>)}
                  </div>
                )}
              </div>
              <div className={s.group}>
                <h2 className={s.h2}>Material &amp; finish</h2>
                {materialFinish.map(r => <div key={r.k} className={s.row}><span>{r.k}</span><span>{r.v}</span></div>)}
              </div>
            </div>

            <div className={s.lists}>
              <div className={s.apps}>
                <h2 className={s.h2}>Vehicle applications · check before ordering</h2>
                {publicApp.map((a, i) => (
                  <div key={i} className={s.appRow}>
                    <span>{vehicle(a.vehicle).label}</span>
                    <span>{a.model}</span>
                    <span>{a.years === 'Unconfirmed' || a.years === 'Not specified' ? '—' : a.years}</span>
                    <span>{a.position}</span>
                  </div>
                ))}
              </div>
              <div className={s.included}>
                <h2 className={s.h2}>{conceptualSet ? 'Illustrative combination' : 'Included'}</h2>
                {p.components.map((c,i) => (
                  <div key={c.partNo + i} className={s.incRow}><span>{c.qty} ×</span><span>{c.label}</span></div>
                ))}
                {conceptualSet && <p className={s.moreNote}>Shown for comparison only. Confirm the matching nut and wheel seat before ordering.</p>}
              </div>
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
