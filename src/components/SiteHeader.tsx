'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { company } from '@/lib/catalogue';
import { Mark } from './Mark';
import s from './SiteHeader.module.css';

const LINKS = [
  { id: 'catalogue', label: 'Products', href: '/products' },
  { id: 'enquiry', label: 'Find my part', href: '/find-my-part' },
  { id: 'how', label: 'How it works', href: '/#how' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
];

function activeId(path: string) {
  if (path.startsWith('/products')) return 'catalogue';
  if (path.startsWith('/find-my-part')) return 'enquiry';
  return '';
}

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = activeId(path);

  useEffect(() => setOpen(false), [path]);

  return (
    <header className={s.header}>
      <div className={`wrap ${s.bar}`}>
        <Link href="/" aria-label="StudSport home" className={s.brand}>
          <Mark />
          <span className={s.brandText}>
            <span className={s.word}>StudSport</span>
            <span className={s.desc}>{company.descriptor}</span>
          </span>
        </Link>
        <nav aria-label="Main" className={s.nav}>
          {LINKS.map(l => (
            <Link key={l.id} href={l.href} className={s.navLink} aria-current={l.id === active ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className={s.actions}>
          <a href={company.whatsappLink} target="_blank" rel="noopener" className={s.wa}>{company.whatsappShort}</a>
          <Link href="/find-my-part" className="btn btn-accent btn-sm">Request a quote</Link>
        </div>
        <div className={`${s.mobileOnly} ${s.spacer}`} />
        <Link href="/find-my-part" className={`btn btn-accent ${s.mobileOnly} ${s.quoteSm}`}>Quote</Link>
        <button type="button" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open} className={`${s.menuBtn} ${s.mobileOnly}`}>
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <div className={s.menu}>
          {LINKS.map(l => (
            <Link key={l.id} href={l.href} className={s.menuLink} onClick={() => setOpen(false)}>{l.label}<span>→</span></Link>
          ))}
          <a href={company.whatsappLink} target="_blank" rel="noopener" className={s.menuWa}>{company.whatsappShort}</a>
        </div>
      )}
    </header>
  );
}
