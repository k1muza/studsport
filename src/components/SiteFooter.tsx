import Link from 'next/link';
import { company, productTypes, type ProductType } from '@/lib/catalogue';
import s from './SiteFooter.module.css';
import { TrackedWhatsAppLink } from './TrackedWhatsAppLink';

export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={`wrap ${s.inner}`}>
        <div className={s.cols}>
          <div className={s.brand}>
            <span className={s.word}>StudSport</span>
            <span className={s.desc}>{company.descriptor}</span>
            <p className={s.blurb}>Supplier of wheel studs, hub bolts and matching nuts for trucks and commercial vehicles. Harare, Zimbabwe.</p>
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>Products</span>
            {(Object.keys(productTypes) as ProductType[]).map(k => (
              <Link key={k} href={`/products?type=${k}`}>{productTypes[k].plural}</Link>
            ))}
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>Help</span>
            <Link href="/find-my-part">Find my part</Link>
            <Link href="/guides/how-to-identify-and-measure-a-wheel-stud">How to identify a stud</Link>
            <Link href="/vehicles">Browse by vehicle</Link>
            <Link href="/products/ss-1001/spec-sheet">Example spec sheet</Link>
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>Contact</span>
            <span className={s.plain}>{company.address}</span>
            <span className={`${s.plain} ${s.monoSm}`}>{company.phone}</span>
            <TrackedWhatsAppLink entryPoint="site_footer" className={s.monoSm}>{company.whatsappShort}</TrackedWhatsAppLink>
            <span className={s.hours}>{company.hours}</span>
          </div>
        </div>
        <div className={s.bottom}>
          <span className={s.notice}>
            <span className="notice-dot" />
            Catalogue references only: specifications, fitment, prices and availability are confirmed before purchase.
          </span>
          <span className={s.copy}>© 2026 StudSport · Harare</span>
        </div>
      </div>
    </footer>
  );
}
