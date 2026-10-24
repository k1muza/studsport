'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { company, vehicles, type ProductType } from '@/lib/catalogue';
import { getProduct, href, keyDims, threadsOf, vehicle } from '@/lib/products';
import { Choices } from '@/components/Choices';
import { QtyStepper } from '@/components/QtyStepper';
import { Drawing } from '@/components/Drawing';
import { Thumb } from '@/components/Thumb';
import s from './enquiry.module.css';

export interface EnquiryQuery { part: string; qty: string; vehicle: string; q: string }

interface Fields {
  make: string; model: string; year: string; chassis: string; position: string; side: string;
  ptype: string; qty: number; partNo: string; len: string; dia: string; pitch: string; dir: string; knurl: string; notes: string;
  name: string; business: string; phone: string; email: string; method: string; fulfil: string; town: string;
}
type Errors = Partial<Record<'make' | 'name' | 'phone' | 'email', boolean>>;
interface Photo { url: string; name: string }

const PTYPE: Record<ProductType, string> = { 'wheel-stud': 'Wheel stud', 'hub-bolt': 'Hub bolt', 'double-ended': 'Double-ended bolt', 'wheel-nut': 'Wheel nut', 'stud-nut-set': 'Stud & nut set' };
const NOT_SURE = "I'm not sure";
const STEPS = ['Vehicle', 'Part details', 'Contact'];

const blank = (): Fields => ({
  make: '', model: '', year: '', chassis: '', position: '', side: '', ptype: '', qty: 10, partNo: '', len: '', dia: '', pitch: '', dir: '', knurl: '', notes: '',
  name: '', business: '', phone: '', email: '', method: 'WhatsApp', fulfil: 'Collect in Harare', town: '',
});

/* ?part= prefills type, thread, length, vehicle and quantity; ?vehicle= and ?q= come from catalogue "request help" links. */
function prefill(init: EnquiryQuery): Fields {
  const f = blank(), part = getProduct(init.part);
  if (part) {
    f.partNo = part.partNo;
    f.qty = parseInt(init.qty, 10) || 10;
    f.ptype = PTYPE[part.type];
    const t = threadsOf(part)[0];
    f.dia = 'M' + t.dia; f.pitch = String(t.pitch); f.dir = t.dir;
    if (part.template !== 'wheel-nut') f.len = String(part.dims.overall);
    const a = part.applications[0];
    if (a) { f.make = vehicle(a.vehicle).label; f.model = a.model; }
  }
  if (init.vehicle) f.make = vehicle(init.vehicle).label;
  if (init.q) f.notes = `Searched for: ${init.q}`;
  return f;
}

const makeRef = () => {
  const d = new Date();
  return `ENQ-${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export function EnquiryForm({ initial }: { initial: EnquiryQuery }) {
  const [f, setFields] = useState<Fields>(() => prefill(initial));
  const [ctx, setCtx] = useState(() => getProduct(initial.part));
  const [step, setStep] = useState(1);
  const [err, setErr] = useState<Errors>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guide, setGuide] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState('');

  // Photos stay in the browser; release object URLs when they are removed or the form unmounts.
  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach(p => URL.revokeObjectURL(p.url)), []);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields(prev => ({ ...prev, [k]: v }));
    setErr(e => ({ ...e, [k]: false }));
  };
  const bind = (k: Exclude<keyof Fields, 'qty'>) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value) });

  const validate = (n: number) => {
    const e: Errors = {};
    if (n === 1 && !f.make) e.make = true;
    if (n === 3) {
      if (!f.name.trim()) e.name = true;
      if (f.method === 'Email') { if (!/.+@.+\..+/.test(f.email)) e.email = true; }
      else if (f.phone.replace(/\D/g, '').length < 6) e.phone = true;
    }
    setErr(e);
    return !Object.keys(e).length;
  };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const next = () => { if (validate(step)) { setStep(n => n + 1); scrollTop(); } };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3 || !validate(3)) return;
    setSending(true);
    // Simulated submission: nothing leaves the browser.
    setTimeout(() => { setSending(false); setDone(true); setRef(makeRef()); scrollTop(); }, 1100);
  };
  const restart = () => {
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setFields(blank()); setPhotos([]); setErr({}); setCtx(null); setStep(1); setDone(false);
  };
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files || [])];
    setPhotos(ps => {
      const room = 6 - ps.length;
      return [...ps, ...files.slice(0, Math.max(0, room)).map(fl => ({ url: URL.createObjectURL(fl), name: fl.name }))];
    });
    e.target.value = '';
  };
  const removePhoto = (i: number) => setPhotos(ps => { URL.revokeObjectURL(ps[i].url); return ps.filter((_, j) => j !== i); });

  const summary = ([
    ['Vehicle', [f.make, f.model].filter(Boolean).join(' ')],
    ['Year / chassis', [f.year, f.chassis].filter(Boolean).join(' · ')],
    ['Position', [f.position, f.side].filter(Boolean).join(' · ')],
    ['Part', f.ptype],
    ['Quantity', String(f.qty)],
    ['Part number', f.partNo],
    ['Thread', [f.dia, f.pitch && '× ' + f.pitch, f.dir].filter(Boolean).join(' ')],
    ['Overall length', f.len && f.len + ' mm'],
    ['Knurl Ø', f.knurl && f.knurl + ' mm'],
    ['Photos', photos.length ? String(photos.length) : ''],
    ['Fulfilment', f.fulfil + (f.fulfil === 'Delivery' && f.town ? ' · ' + f.town : '')],
  ] as [string, string][]).filter(r => r[1]);

  const methodLower = f.method === 'Phone call' ? 'phone' : f.method === 'Email' ? 'email' : 'WhatsApp';
  const emailMode = f.method === 'Email';

  return (
    <>
      <section className={s.band}>
        <div className={`${s.narrow} ${s.bandInner}`}>
          <span className="eyebrow-rule">Enquiry</span>
          <h1 className={s.h1}>{ctx ? 'Request a quote' : 'Find my part'}</h1>
          <p className={s.lede}>Tell us what you have. Skip anything you don&apos;t know. The team will confirm the match, price and availability before you buy.</p>
        </div>
      </section>
      <main className={s.main}>
        <div className={`${s.narrow} ${s.mainInner}`}>
          {!done ? (
            <div className={s.formCol}>
              <ol aria-label="Progress" className={s.progress}>
                {STEPS.map((label, i) => (
                  <li key={label} aria-current={step === i + 1 ? 'step' : undefined}>
                    <span className={`${s.progBar} ${step >= i + 1 ? s.progBarOn : ''}`} />
                    <span className={s.progLabel}><span>0{i + 1}</span>{label}</span>
                  </li>
                ))}
              </ol>

              <form onSubmit={submit} noValidate className={s.form}>
                {step === 1 && (
                  <div className={s.step}>
                    <fieldset className={s.fieldset} style={{ gap: 12 }}>
                      <legend className={s.legendLg}>Vehicle make <span className="req">*</span></legend>
                      <Choices options={[...vehicles.map(v => v.label), 'Other', NOT_SURE]} value={f.make} onChange={v => set('make', v)} className={s.chipLg} />
                      {err.make && <span role="alert" className="error">Choose a make, or “I&apos;m not sure”.</span>}
                    </fieldset>
                    <div className={s.grid3}>
                      <label className={s.field}><span className={s.fieldLabel}>Model</span><input className="input" placeholder="e.g. Dyna 300, NQR, Condor" {...bind('model')} /></label>
                      <label className={s.field}><span className={s.fieldLabel}>Year <span className="optional">OPTIONAL</span></span><input className="input" inputMode="numeric" placeholder="e.g. 2006" {...bind('year')} /></label>
                      <label className={s.field}><span className={s.fieldLabel}>Chassis / VIN <span className="optional">OPTIONAL</span></span><input className="input input-mono" placeholder="From the registration book" {...bind('chassis')} /></label>
                    </div>
                    <div className={s.grid2}>
                      <fieldset className={s.fieldset}>
                        <legend className={s.legend}>Wheel position</legend>
                        <Choices options={['Front', 'Rear', 'Front & rear', NOT_SURE]} value={f.position} onChange={v => set('position', v)} />
                      </fieldset>
                      <fieldset className={s.fieldset}>
                        <legend className={s.legend}>Side of vehicle</legend>
                        <Choices options={['Left', 'Right', 'Both', NOT_SURE]} value={f.side} onChange={v => set('side', v)} />
                        <span className={s.hint}>Helps us tell right-hand from left-hand thread.</span>
                      </fieldset>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={s.step}>
                    <fieldset className={s.fieldset}>
                      <legend className={s.legendLg}>What do you need?</legend>
                      <Choices options={[...Object.values(PTYPE), NOT_SURE]} value={f.ptype} onChange={v => set('ptype', v)} />
                    </fieldset>
                    <div className={s.qtyRow}>
                      <div className={s.field}>
                        <label htmlFor="enq-qty" className={s.fieldLabel}>Quantity <span className="req">*</span></label>
                        <QtyStepper id="enq-qty" value={f.qty} onChange={v => set('qty', v)} />
                      </div>
                      <label className={s.field}><span className={s.fieldLabel}>Part number <span className="optional">OPTIONAL</span></span><input className="input input-mono" placeholder="StudSport, OEM or number on the old part" {...bind('partNo')} /></label>
                    </div>
                    <div className={s.measure}>
                      <div className={s.measureHead}>
                        <span>Measurements <span className="optional">OPTIONAL · MM</span></span>
                        <button type="button" onClick={() => setGuide(g => !g)} aria-expanded={guide} className="btn btn-link" style={{ fontSize: 13.5 }}>{guide ? 'Hide measuring guide' : 'Where do I measure?'}</button>
                      </div>
                      {guide && <div className={s.guide}><Drawing sku="ss-1001" labels="generic" views="side" layout="wide" minPx={11} maxPx={14} /></div>}
                      <div className={s.measureGrid}>
                        <label className={s.field}><span className={s.fieldLabel}>Overall length L</span><input className="input input-mono" inputMode="decimal" placeholder="mm" {...bind('len')} /></label>
                        <label className={s.field}><span className={s.fieldLabel}>Thread Ø</span>
                          <select className={`input input-mono ${s.select}`} {...bind('dia')}>
                            <option value="">Not sure</option>
                            {['M12', 'M14', 'M16', 'M18', 'M20', 'M22', 'M24'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </label>
                        <label className={s.field}><span className={s.fieldLabel}>Pitch</span>
                          <select className={`input input-mono ${s.select}`} {...bind('pitch')}>
                            <option value="">Not sure</option>
                            {['1.25', '1.5', '2.0'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </label>
                        <label className={s.field}><span className={s.fieldLabel}>Knurl Ø</span><input className="input input-mono" inputMode="decimal" placeholder="mm" {...bind('knurl')} /></label>
                      </div>
                      <div className={s.dirRow}>
                        <span>Thread direction</span>
                        <Choices options={['RH', 'LH', NOT_SURE]} value={f.dir} onChange={v => set('dir', v)} />
                      </div>
                    </div>
                    <div className={s.photos}>
                      <span>Photos of the old part <span className="optional">OPTIONAL</span></span>
                      <label className={s.drop}>
                        <span className={s.dropText}><b>Add photos</b><span>Lay the part next to a ruler or tape measure. JPG or PNG. Up to 6.</span></span>
                        <span className={s.dropBtn}>Choose files</span>
                        <input type="file" accept="image/*" multiple onChange={onFiles} className={s.fileInput} disabled={photos.length >= 6} />
                      </label>
                      {photos.length > 0 && (
                        <div className={s.previews}>
                          {photos.map((ph, i) => (
                            <div key={ph.url} className={s.preview}>
                              <img src={ph.url} alt={ph.name} />
                              <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${ph.name}`}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <label className={s.field}><span className={s.fieldLabel}>Anything else? <span className="optional">OPTIONAL</span></span>
                      <textarea className={`input ${s.textarea}`} rows={3} placeholder="e.g. need 12 for the rear axle, old studs are stripped" {...bind('notes')} />
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div className={`${s.step} ${s.step3}`}>
                    <div className={s.grid4}>
                      <label className={s.field}><span className={s.fieldLabel}>Name <span className="req">*</span></span>
                        <input className="input" autoComplete="name" aria-invalid={!!err.name} {...bind('name')} />
                        {err.name && <span role="alert" className="error">Please add your name.</span>}
                      </label>
                      <label className={s.field}><span className={s.fieldLabel}>Business <span className="optional">OPTIONAL</span></span>
                        <input className="input" autoComplete="organization" placeholder="Workshop, fleet or shop" {...bind('business')} />
                      </label>
                      <label className={s.field}><span className={s.fieldLabel}>Phone / WhatsApp {!emailMode && <span className="req">*</span>}</span>
                        <input className="input input-mono" type="tel" autoComplete="tel" placeholder="+263" aria-invalid={!!err.phone} {...bind('phone')} />
                        {err.phone && <span role="alert" className="error">Add a phone number so we can reply.</span>}
                      </label>
                      <label className={s.field}><span className={s.fieldLabel}>Email {emailMode && <span className="req">*</span>}</span>
                        <input className="input" type="email" autoComplete="email" aria-invalid={!!err.email} {...bind('email')} />
                        {err.email && <span role="alert" className="error">Add an email address, or choose another contact method.</span>}
                      </label>
                    </div>
                    <fieldset className={s.fieldset}>
                      <legend className={s.legend}>Preferred contact</legend>
                      <Choices required options={['WhatsApp', 'Phone call', 'Email']} value={f.method} onChange={v => set('method', v)} />
                    </fieldset>
                    <fieldset className={s.fieldset}>
                      <legend className={s.legend}>Collection or delivery</legend>
                      <Choices required options={['Collect in Harare', 'Delivery']} value={f.fulfil} onChange={v => set('fulfil', v)} />
                      {f.fulfil === 'Delivery' && <input className={`input ${s.town}`} placeholder="Town or suburb for delivery" aria-label="Town or suburb for delivery" {...bind('town')} />}
                    </fieldset>
                    <p className={s.privacy}>We only use these details to reply to this enquiry. Prototype: nothing is sent.</p>
                  </div>
                )}

                <div className={s.footer}>
                  {step > 1
                    ? <button type="button" onClick={() => setStep(n => Math.max(1, n - 1))} className="btn btn-light">← Back</button>
                    : <span className={s.stepOf}>Step {step} of 3</span>}
                  {step < 3
                    ? <button type="button" onClick={next} className="btn btn-ink">Continue <span className="arrow">→</span></button>
                    : (
                      <button type="submit" disabled={sending} className="btn btn-accent">
                        {sending && <span className={s.spinner} />}
                        {sending ? 'Sending…' : 'Send enquiry'}
                      </button>
                    )}
                </div>
              </form>
            </div>
          ) : (
            <div className={s.done} role="status">
              <div className={s.doneHead}>
                <span className={s.badge}>
                  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><polyline points="4,11.5 9,16 18,6" fill="none" stroke="oklch(0.74 0.15 50)" strokeWidth="2.4" /></svg>
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h2 className={s.doneTitle}>Enquiry received</h2>
                  <p className={s.doneBody}>Thanks, {(f.name || 'there').split(' ')[0]}. The team will check the match and availability and reply by {methodLower}. Your reference is below; quote it if you call or visit.</p>
                </div>
                <div className={s.ref}>
                  <span className="label" style={{ letterSpacing: '0.12em' }}>REFERENCE</span>
                  <span className={s.refNo}>{ref}</span>
                  <span className={s.refNote}>Simulated submission · nothing was sent</span>
                </div>
              </div>
              <div className={s.doneCols}>
                <div className={s.doneCol}>
                  <h3 className={s.colTitle}>Your enquiry</h3>
                  {summary.map(([k, v]) => <div key={k} className={s.sumRow}><span>{k}</span><span>{v}</span></div>)}
                </div>
                <div className={s.doneCol}>
                  <h3 className={s.colTitle}>What happens next</h3>
                  {['We check the part against your vehicle, photos and measurements.', 'We reply with the matched part, price and availability.', 'You confirm, then collect in Harare or we arrange delivery.'].map((t, i) => (
                    <div key={i} className={s.next}><span>0{i + 1}</span><span>{t}</span></div>
                  ))}
                </div>
              </div>
              <div className={s.doneCtas}>
                <Link href="/products" className="btn btn-ink">Back to products</Link>
                <a href={company.whatsappLink} target="_blank" rel="noopener" className="btn btn-outline">Follow up on WhatsApp</a>
                <button type="button" onClick={restart} className="btn btn-link" style={{ padding: '0 16px', height: 50 }}>New enquiry</button>
              </div>
            </div>
          )}

          <aside className={s.aside}>
            {ctx && (
              <Link href={href(ctx)} className={s.ctx}>
                <span className={s.ctxThumb}><Thumb sku={ctx.slug} tone="dark" /></span>
                <span className={s.ctxText}>
                  <span className="label" style={{ letterSpacing: '0.1em' }}>QUOTE REQUEST FOR</span>
                  <span className={s.ctxPart}>{ctx.partNo}</span>
                  <span className={s.ctxName}>{ctx.name}</span>
                  <span className={s.ctxDims}>{keyDims(ctx).map(d => `${d.k} ${d.v}`).join(' · ')}</span>
                </span>
              </Link>
            )}
            <div className={s.talk}>
              <span className="label label-dark">Prefer to talk?</span>
              <span>Send a photo of the old stud on WhatsApp, or call the counter.</span>
              <a href={company.whatsappLink} target="_blank" rel="noopener" className="btn btn-ghost">{company.whatsappShort}</a>
              <span className={s.talkPhone}>Phone {company.phone}</span>
            </div>
            <div className={s.why}>
              <span className="label">Why we confirm first</span>
              <span>Studs that look alike can differ in knurl diameter, length or thread direction. We check before you buy so the part fits first time.</span>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
