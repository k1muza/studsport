import Link from 'next/link';
import { getProduct, href, typeLabel, keyDims, appsLabel, avail, isLH, priceLabel } from '@/lib/products';
import { Thumb } from './Thumb';
import s from './ProductCard.module.css';

export function ProductCard({ sku, spin = 'off' }: { sku: string; spin?: 'auto' | 'off' }) {
  const p = getProduct(sku);
  if (!p) return null;
  const av = avail(p);
  return (
    <Link href={href(p)} className={s.card}>
      <div className={s.well}>
        <Thumb sku={p.slug} tone="dark" spin={spin} />
        <span className={s.pill}><span className={s.dot} style={{ background: av.color }} />{av.label}</span>
        {isLH(p) && <span className={s.lh}>LH</span>}
      </div>
      <div className={s.body}>
        <div className={s.head}>
          <span className={s.meta}><span className={s.partNo}>{p.partNo}</span> · {typeLabel(p)}</span>
          <h3 className={s.name}>{p.name}</h3>
        </div>
        <div className={s.dims}>
          {keyDims(p).map(d => (
            <span key={d.k} className={s.dim}><span className={s.dimK}>{d.k}</span><span className={s.dimV}>{d.v}</span></span>
          ))}
        </div>
        <span className={s.apps}>{appsLabel(p)}</span>
        <span className={s.foot}>
          <span className={s.price}>{priceLabel(p)}</span>
          <span className={s.view}>View part <span className="arrow">→</span></span>
        </span>
      </div>
    </Link>
  );
}
