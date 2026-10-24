import type { Metadata } from 'next';
import { Mark } from '@/components/Mark';
import { Drawing } from '@/components/Drawing';
import { ProductCard } from '@/components/ProductCard';
import { AVAIL_COLOR } from '@/lib/products';
import s from '@/components/design/design.module.css';

export const metadata: Metadata = { title: 'Design system' };

const SWATCHES = [
  ['Graphite', '#0e1012', 'Footer'],
  ['Charcoal', '#121416', 'Hero, header, viewer page'],
  ['Stage', '#1a1d20', 'Viewer and thumbnail wells'],
  ['Rule dark', '#2a2e32', 'Lines on charcoal'],
  ['Steel', '#a2a8ae', 'Secondary text on charcoal'],
  ['Paper', '#f1f1ef', 'Catalogue and detail surfaces'],
  ['Sheet', '#ffffff', 'Drawings, tables, cards'],
  ['Rule light', '#d9dbda', 'Lines on paper'],
  ['Ink', '#15171a', 'Text and outlines'],
  ['Ink 2', '#4b5157', 'Secondary text on paper'],
  ['Signal', 'oklch(0.68 0.17 45)', 'Primary action, key callouts'],
  ['Signal ink', 'oklch(0.55 0.16 45)', 'Part numbers and labels on paper'],
  ['In stock', 'oklch(0.72 0.14 150)', 'Status dot'],
  ['On request', 'oklch(0.80 0.13 85)', 'Status dot, prototype notice'],
];

const MOTION = [
  ['0.42 rad/s', 'Slow axial spin', 'Parts turn on their own axis so threads, splines and head forms pass the light; dimension lines stay put.'],
  ['Damped', 'Drag, zoom, reset', 'User input eases to its target. Reset returns to the catalogue pose.'],
  ['0.5–0.8 s', 'Fades, no bounces', 'Outline placeholder cross-fades to the rendered part. Cards lift 2 px on hover.'],
  ['Reduced motion', 'Still by default', 'Rotation starts paused. The viewer stops when off-screen or in a background tab.'],
];

export default function DesignSystemPage() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <header className={s.intro}>
          <span className="eyebrow">StudSport · Design system v0.1</span>
          <h1 className={s.h1}>Precision, plainly presented</h1>
          <p className={s.lede}>Charcoal for the product stage, white for drawings and data, one signal orange for actions and key measurements. Grotesk for voice, mono for anything you could measure.</p>
        </header>

        <section className={s.section}>
          <h2 className={s.h2}>Identity</h2>
          <div className={s.ids}>
            <div className={`${s.id} ${s.idDark}`}>
              <Mark size={54} />
              <span className={s.idText}><span className={s.idWord}>StudSport</span><span className={s.idDesc}>Wheel Studs, Hub Bolts &amp; Nuts</span></span>
            </div>
            <div className={`${s.id} ${s.idLight}`}>
              <Mark size={54} ink="#15171a" accent="oklch(0.62 0.17 45)" />
              <span className={s.idText}><span className={s.idWord}>StudSport</span><span className={s.idDesc}>Wheel Studs, Hub Bolts &amp; Nuts</span></span>
            </div>
          </div>
          <p className={s.note}>The mark is the drafting symbol for an external thread seen end-on: a full circle for the major diameter, a three-quarter arc for the minor diameter, and centre lines.</p>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>Colour</h2>
          <div className={s.swatches}>
            {SWATCHES.map(([name, c, use]) => (
              <div key={name} className={s.swatch}>
                <span className={s.chip} style={{ background: c }} />
                <span className={s.swText}><b>{name}</b><code>{c}</code><span>{use}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>Type</h2>
          <div className={s.type}>
            <div className={s.typeRow}><span className={s.typeLabel}>Display · 800 · −4.5%</span><span style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95 }}>The right stud.</span></div>
            <div className={s.typeRow}><span className={s.typeLabel}>Heading · 800 · −3%</span><span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em' }}>Front wheel stud M20 × 1.5 RH</span></div>
            <div className={s.typeRow}><span className={s.typeLabel}>Body · 400 · 16/1.55</span><span style={{ fontSize: 16, lineHeight: 1.55, maxWidth: '60ch', color: 'var(--ink-2)' }}>Press-in wheel stud with D-flat head for front hubs on light trucks. Right-hand thread, fitted to right-side wheels.</span></div>
            <div className={s.typeRow}><span className={s.typeLabel}>Mono · Martian Mono</span>
              <span className="mono" style={{ fontSize: 14, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>SS-1001</span><span>M20 × 1.5 RH</span><span>L 74</span><span>Ø22.4 × 14</span>
                <span style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>LABEL · UPPERCASE</span>
              </span>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>Components</h2>
          <div className={s.comps}>
            <div className={s.panelDark}>
              <span className="label label-dark">ACTIONS · ON CHARCOAL</span>
              <div className={s.row10}>
                <span className="btn btn-accent">Request a quote →</span>
                <span className="btn btn-ghost">Ask on WhatsApp</span>
              </div>
              <div className={s.row}>
                <span className={s.pill}><i style={{ background: AVAIL_COLOR['in-stock'] }} />IN STOCK</span>
                <span className={s.pill}><i style={{ background: AVAIL_COLOR['on-request'] }} />ON REQUEST</span>
                <span className={s.pill}><i style={{ background: AVAIL_COLOR.confirm }} />CONFIRM AVAILABILITY</span>
                <span className={s.lhPill}>LH</span>
              </div>
              <div className={s.row}>
                <span className={`${s.variant} ${s.variantOn}`}><b>Front · RH</b><span>SS-1001</span></span>
                <span className={s.variant}><b>Front · LH</b><span>SS-1002</span></span>
              </div>
            </div>
            <div className={s.panelLight}>
              <span className="label">FORMS · ON WHITE</span>
              <div className={s.row}>
                <span className="choice" aria-pressed="true" style={{ display: 'inline-flex', alignItems: 'center' }}>Toyota Dyna</span>
                <span className="choice" style={{ display: 'inline-flex', alignItems: 'center' }}>Hino</span>
                <span className="choice" style={{ display: 'inline-flex', alignItems: 'center' }}>I&apos;m not sure</span>
              </div>
              <span className={s.fauxInput}>SS-1030</span>
              <div>
                <div className={s.tRow}><span>Overall length L (incl. head)</span><span>74</span></div>
                <div className={s.tRow}><span>Thread</span><span>M20 × 1.5 RH</span></div>
                <div className={`${s.tRow} ${s.tDiff}`}><span>Direction (differs)</span><span>Left-hand (LH)</span></div>
              </div>
            </div>
            <div className={s.cardSlot}><ProductCard sku="ss-1040" /></div>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>Drawing conventions</h2>
          <div className={s.drawRow}>
            <div className={s.drawBox}><Drawing sku="ss-1040" layout="auto" grid /></div>
            <div className={s.lines}>
              <span><i style={{ borderTop: '2.4px solid #15171a' }} />Visible outline · thick</span>
              <span><i style={{ borderTop: '1px solid #353c43' }} />Dimension, extension, thread root · thin</span>
              <span><i style={{ borderTop: '1px dashed #59616a' }} />Hidden detail (nut bore)</span>
              <span><i style={{ borderTop: '1px dotted #59616a' }} />Centre line · dash-dot</span>
              <span>Every drawing, 3D model, card and spec table is generated from the same record. Overall length L always includes the head; chain dimensions add up to L.</span>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>Motion</h2>
          <div className={s.motion}>
            {MOTION.map(([k, t, b]) => <div key={t} className={s.motionCell}><span>{k}</span><b>{t}</b><span>{b}</span></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
