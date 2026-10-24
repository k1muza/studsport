'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { search, href, appsLabel } from '@/lib/products';
import s from './home.module.css';

const QUICK = ['Toyota Dyna', 'M22 × 1.5', 'Left-hand', 'SS-1030'];

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const term = q.trim();
  const res = term ? search(q) : [];
  const searchHref = '/products' + (q ? '?q=' + encodeURIComponent(q) : '');

  return (
    <div className={s.searchCol}>
      <div className={s.searchBox}>
        <label htmlFor="home-search" className="sr-only">Search products</label>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className={s.searchIcon}>
          <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="#15171a" strokeWidth="1.8" />
          <line x1="13" y1="13" x2="18" y2="18" stroke="#15171a" strokeWidth="1.8" />
        </svg>
        <input
          id="home-search" type="search" autoComplete="off" placeholder="e.g. SS-1030, Toyota Dyna, M22 × 1.5"
          value={q} onChange={e => setQ(e.target.value)} className={s.searchInput}
          onKeyDown={e => {
            if (e.key === 'Enter') router.push('/products?q=' + encodeURIComponent(q));
            if (e.key === 'Escape') setQ('');
          }}
        />
        <Link href={searchHref} className={s.searchBtn}>Search</Link>
        {term && (
          <div className={s.sugg} role="listbox" aria-label="Suggestions">
            {res.slice(0, 5).map(p => (
              <Link key={p.slug} href={href(p)} className={s.suggRow}>
                <span className={s.suggPart}>{p.partNo}</span>
                <span className={s.suggText}>
                  <span className={s.suggName}>{p.name}</span>
                  <span className={s.suggApps}>{appsLabel(p)}</span>
                </span>
                <span className={s.suggArrow}>→</span>
              </Link>
            ))}
            {res.length === 0 && (
              <Link href={'/find-my-part?q=' + encodeURIComponent(q)} className={s.suggNone}>
                <span>No matches for “{q}”. Ask us to find it.</span><span className={s.suggHelp}>Request help →</span>
              </Link>
            )}
          </div>
        )}
      </div>
      <div className={s.quick}>
        <span className={s.quickLabel}>Try</span>
        {QUICK.map(label => (
          <button key={label} type="button" className={s.quickChip} onClick={() => setQ(label)}>{label}</button>
        ))}
      </div>
    </div>
  );
}
