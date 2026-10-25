'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { products as ALL, vehicles, productTypes, type ProductType, type ThreadDir } from '@/lib/catalogue';
import { search, vehiclesOf, sizes as sizesOf, dirs, vehicle } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import s from './catalogue.module.css';

export interface CatalogueQuery { q: string; vehicle: string; types: string[]; sizes: string[]; dir: string }
type Facet = 'vehicle' | 'type' | 'size' | 'dir';

const TYPE_KEYS = Object.keys(productTypes) as ProductType[];
const ALL_SIZES = [...new Set(ALL.flatMap(p => sizesOf(p)))].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

export function CatalogueView({ initial }: { initial: CatalogueQuery }) {
  const [q, setQ] = useState(initial.q);
  const [veh, setVeh] = useState(initial.vehicle);
  const [types, setTypes] = useState<ProductType[]>(TYPE_KEYS.filter(k => initial.types.includes(k)));
  const [sizes, setSizes] = useState<string[]>(ALL_SIZES.filter(z => initial.sizes.includes(z)));
  const [dir, setDir] = useState<'' | ThreadDir>(initial.dir === 'RH' || initial.dir === 'LH' ? initial.dir : '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the URL shareable without re-rendering the server page.
  useEffect(() => {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    if (veh) u.set('vehicle', veh);
    types.forEach(t => u.append('type', t));
    sizes.forEach(z => u.append('size', z));
    if (dir) u.set('dir', dir);
    const qs = u.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [q, veh, types, sizes, dir]);

  /* Facet counts are computed with every other active filter applied, excluding the facet itself. */
  const filtered = useMemo(() => {
    const base = search(q);
    const by = (skip?: Facet) => base.filter(p =>
      (skip === 'vehicle' || !veh || vehiclesOf(p).includes(veh)) &&
      (skip === 'type' || !types.length || types.includes(p.type)) &&
      (skip === 'size' || !sizes.length || sizesOf(p).some(z => sizes.includes(z))) &&
      (skip === 'dir' || !dir || dirs(p).includes(dir)));
    return { res: by(), byV: by('vehicle'), byT: by('type') };
  }, [q, veh, types, sizes, dir]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const clearAll = () => { setQ(''); setVeh(''); setTypes([]); setSizes([]); setDir(''); };

  const vehicleOpts = [{ id: '', label: 'All vehicles', count: filtered.byV.length },
    ...vehicles.map(v => ({ id: v.id, label: v.label, count: filtered.byV.filter(p => vehiclesOf(p).includes(v.id)).length }))];

  const chips: { label: string; remove: () => void }[] = [];
  if (q) chips.push({ label: `“${q}”`, remove: () => setQ('') });
  if (veh) chips.push({ label: vehicle(veh).label, remove: () => setVeh('') });
  types.forEach(k => chips.push({ label: productTypes[k].plural, remove: () => setTypes(t => toggle(t, k)) }));
  sizes.forEach(z => chips.push({ label: z, remove: () => setSizes(t => toggle(t, z)) }));
  if (dir) chips.push({ label: dir === 'LH' ? 'Left-hand' : 'Right-hand', remove: () => setDir('') });
  const nFilters = chips.length - (q ? 1 : 0);

  const summary = [q && `“${q}”`, veh && vehicle(veh).label, ...types.map(k => productTypes[k].plural.toLowerCase()), ...sizes,
    dir && (dir === 'LH' ? 'left-hand thread' : 'right-hand thread')].filter(Boolean).join(', ');
  const hp = new URLSearchParams();
  if (q) hp.set('q', q);
  if (veh) hp.set('vehicle', veh);
  const helpHref = '/find-my-part' + (hp.toString() ? '?' + hp.toString() : '');
  const { res } = filtered;

  return (
    <>
      <section className={s.band}>
        <div className={`wrap ${s.bandInner}`}>
          <div className={s.bandTitle}>
            <nav aria-label="Breadcrumb" className={s.crumbs}><Link href="/">Home</Link><span>/</span><span className={s.crumbHere}>Products</span></nav>
            <h1 className={s.h1}>Products</h1>
            <span className={s.count}>{ALL.length} reference parts · illustrative and supplier-declared data · fitment unverified</span>
          </div>
          <div className={s.searchWrap}>
            <label htmlFor="cat-search" className="sr-only">Search products</label>
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className={s.searchIcon}>
              <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="#a2a8ae" strokeWidth="1.8" />
              <line x1="13" y1="13" x2="18" y2="18" stroke="#a2a8ae" strokeWidth="1.8" />
            </svg>
            <input id="cat-search" type="search" autoComplete="off" placeholder="Part number, name, vehicle or size" value={q} onChange={e => setQ(e.target.value)} className={s.search} />
          </div>
        </div>
      </section>
      <main className={s.main}>
        <div className={`wrap ${s.mainInner}`}>
          <div className={s.filterToggleRow}>
            <button type="button" onClick={() => setFiltersOpen(o => !o)} aria-expanded={filtersOpen} aria-controls="filters" className={s.filterToggle}>
              Filters {nFilters ? `(${nFilters})` : ''}<span className="arrow">{filtersOpen ? '−' : '+'}</span>
            </button>
          </div>
          <aside id="filters" aria-label="Filters" className={`${s.aside} ${filtersOpen ? s.asideOpen : ''}`}>
            <div className={s.group}>
              <h2 className={s.groupTitle}>Vehicle</h2>
              <div role="radiogroup" aria-label="Vehicle" className={s.list}>
                {vehicleOpts.map(o => (
                  <button key={o.id} type="button" role="radio" aria-checked={veh === o.id} onClick={() => setVeh(o.id)} className={s.opt}>
                    <span className={s.radio}>{veh === o.id && <span />}</span>
                    <span className={s.optLabel}>{o.label}</span><span className={s.optCount}>{o.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={s.group}>
              <h2 className={s.groupTitle}>Product type</h2>
              <div className={s.list}>
                {TYPE_KEYS.map(k => {
                  const on = types.includes(k);
                  return (
                    <button key={k} type="button" role="checkbox" aria-checked={on} onClick={() => setTypes(t => toggle(t, k))} className={s.opt}>
                      <span className={s.check}>{on && <span />}</span>
                      <span className={s.optLabel}>{productTypes[k].plural}</span><span className={s.optCount}>{filtered.byT.filter(p => p.type === k).length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={s.group}>
              <h2 className={s.groupTitleTight}>Thread size</h2>
              <div className={s.sizes}>
                {ALL_SIZES.map(z => (
                  <button key={z} type="button" aria-pressed={sizes.includes(z)} onClick={() => setSizes(t => toggle(t, z))} className={s.size}>{z}</button>
                ))}
              </div>
            </div>
            <div className={s.group}>
              <h2 className={s.groupTitleTight}>Thread direction</h2>
              <div role="radiogroup" aria-label="Thread direction" className={s.seg}>
                {([['', 'All'], ['RH', 'RH'], ['LH', 'LH']] as const).map(([id, label]) => (
                  <button key={label} type="button" role="radio" aria-checked={dir === id} onClick={() => setDir(id)}>{label}</button>
                ))}
              </div>
              <span className={s.note}>Left-hand threads are usually fitted to left-side wheels on older Japanese trucks.</span>
            </div>
          </aside>
          <section aria-label="Results" className={s.results}>
            <div className={s.resultBar}>
              <span className={s.resultCount} aria-live="polite">{res.length === 1 ? '1 part' : `${res.length} parts`}</span>
              {chips.map(c => (
                <button key={c.label} type="button" onClick={c.remove} aria-label={`Remove filter ${c.label}`} className={s.chip}>{c.label}<span>×</span></button>
              ))}
              {chips.length > 0 && <button type="button" onClick={clearAll} className={s.clear}>Clear all</button>}
            </div>
            {res.length > 0 ? (
              <div className={s.grid}>
                {res.map(p => <ProductCard key={p.slug} sku={p.slug} />)}
              </div>
            ) : (
              <div className={s.empty}>
                <div className={s.emptyCopy}>
                  <span className="eyebrow">No matching parts</span>
                  <h2 className={s.emptyTitle}>We may still have it, or can source it</h2>
                  <p className={s.emptyBody}>Nothing in the online catalogue matches {summary || 'your search'}. Not every part is listed. Send us the vehicle, a photo or a few measurements and we will find the right stud.</p>
                  <div className={s.emptyCtas}>
                    <Link href={helpHref} className="btn btn-accent">Request help finding this part <span className="arrow">→</span></Link>
                    <button type="button" onClick={clearAll} className="btn btn-outline">Clear filters</button>
                  </div>
                </div>
                <div className={s.tips}>
                  <span className="label">Search tips</span>
                  <span>Search by thread size, e.g. <b>M20 × 1.5</b></span>
                  <span>Try the make only, e.g. <b>Hino</b></span>
                  <span>Part numbers work with or without the dash: <b>SS1030</b></span>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
