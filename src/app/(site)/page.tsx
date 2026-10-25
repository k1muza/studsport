import Link from 'next/link';
import type { Metadata } from 'next';
import { company, vehicles } from '@/lib/catalogue';
import { allProducts, vehiclesOf } from '@/lib/products';
import { Viewer } from '@/components/Viewer';
import { Drawing } from '@/components/Drawing';
import { ProductCard } from '@/components/ProductCard';
import { HomeSearch } from '@/components/home/HomeSearch';
import s from '@/components/home/home.module.css';
import { pageMetadata, safeJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { TrackedWhatsAppLink } from '@/components/TrackedWhatsAppLink';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial Vehicle Wheel Studs & Hub Bolts',
  description: 'Browse 22 wheel stud, hub bolt and wheel nut references for commercial vehicles, compare dimensions and request a compatibility check in Zimbabwe.',
  path: '/',
});

const MAP_QUERY = encodeURIComponent('4475 Southview Park, Harare, Zimbabwe');

const HERO_SKU = 'ss-1030';
const FEATURED = ['ss-1030', 'ss-1001', 'ss-1040', 'ss-2002'];

const VEHICLE_PAGES: Record<string, string> = {
  'toyota-2d': '/vehicles/toyota-2d-rear-wheel-bolts',
  'toyota-dyna': '/vehicles/toyota-dyna-rear-wheel-studs',
  mazda: '/vehicles/mazda-t35-wheel-studs',
  hino: '/vehicles/hino-ranger-gh-rear-wheel-studs',
  'nissan-ud': '/vehicles/ud-nissan-ck10-ck20-rear-wheel-bolts',
  volvo: '/vehicles/volvo-truck-rear-wheel-studs',
};

const STEPS = [
  ['Identify the part', 'Search by vehicle, part number or thread size. If you have the old stud, measure the overall length, thread diameter and pitch, and the knurl diameter.'],
  ['Send an enquiry', 'Request a quote online or message us on WhatsApp. A photo of the old part next to a ruler helps us match it quickly.'],
  ['Confirm and collect', 'We confirm the match, price and availability. Collect from our Harare counter or we arrange delivery.'],
];

const LEGEND = [
  ['L', 'Overall length, end to end including head'],
  ['T', 'Threaded length'],
  ['Ød×P', 'Thread diameter and pitch, e.g. M20 × 1.5'],
  ['Øk', 'Knurl (spline) diameter'],
  ['Øh', 'Head diameter'],
  ['LH', 'Left-hand threads tighten anticlockwise'],
];

export default function HomePage() {
  const all = allProducts();
  const vehicleTiles = vehicles.map(v => {
    const c = all.filter(p => vehiclesOf(p).includes(v.id)).length;
    return { id: v.id, make: v.make, model: v.model || 'All models', count: String(c).padStart(2, '0') + (c === 1 ? ' part' : ' parts') };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
        '@context': 'https://schema.org', '@type': 'Organization', '@id': `${absoluteUrl('/')}#organization`,
        name: company.name, url: absoluteUrl('/'), email: company.email,
        contactPoint: { '@type': 'ContactPoint', telephone: company.phone, contactType: 'sales enquiry', areaServed: 'ZW', availableLanguage: 'English' },
      }) }} />
      <section aria-label="Introduction" className={s.hero}>
        <div className={s.grid} />
        <div className={s.glow} />
        <div className={`wrap ${s.heroInner}`}>
          <div className={s.copy}>
            <span className="eyebrow-rule">Harare · Commercial vehicle parts</span>
            <h1 className={s.h1}>The right stud.<br /><span className={s.h1Muted}>Precisely matched</span><span className={s.h1Dot}>.</span></h1>
            <p className={s.lede}>Wheel studs, hub bolts and matching nuts for trucks and commercial vehicles. Check the dimensions online, send us your vehicle or part number, and we confirm the match before you buy.</p>
            <div className={s.ctas}>
              <Link href="/products" className="btn btn-accent btn-lg">Browse products <span className="arrow">→</span></Link>
              <Link href="/find-my-part" className="btn btn-ghost btn-lg">Find my part</Link>
            </div>
          </div>
          <div className={s.stage}>
            <Viewer sku={HERO_SKU} variant="hero" />
            <Link href={`/products/${HERO_SKU}`} className={s.fig}>
              <span className={s.figNo}>FIG. 01</span>
              <span>SS-1030 · Stud &amp; nut set · M22 × 1.5 RH</span>
              <span className={s.figLink}>View part →</span>
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className={s.ruler} />
      </section>

      <section aria-label="Search" className={s.paper}>
        <div className={`wrap ${s.searchSection}`}>
          <div className={s.searchTitle}>
            <span className="eyebrow">Search</span>
            <h2 className="h2">Search by part, name or vehicle</h2>
          </div>
          <HomeSearch />
        </div>
      </section>

      <section aria-label="Browse by vehicle" className={`${s.paper} ${s.ruleTop}`}>
        <div className={`wrap ${s.section}`}>
          <div className={s.secHead}>
            <div className={s.titleBlock}>
              <span className="eyebrow">Browse by vehicle</span>
              <h2 className="h2">Start with the truck</h2>
            </div>
            <Link href="/vehicles" className="link-rule">All vehicle guides →</Link>
          </div>
          <div className={s.vehicles}>
            {vehicleTiles.map(v => (
              <Link key={v.id} href={VEHICLE_PAGES[v.id] || `/products?vehicle=${v.id}`} className={s.vTile}>
                <span className={s.vName}><span className={s.vMake}>{v.make}</span><span className={s.vModel}>{v.model}</span></span>
                <span className={s.vFoot}><span>{v.count}</span><span>→</span></span>
              </Link>
            ))}
            <Link href="/find-my-part" className={`${s.vTile} ${s.vOther}`}>
              <span className={s.vName}><span className={s.vMake}>Other vehicle</span><span className={s.vModel}>We source to order</span></span>
              <span className={s.vFoot}><span>Find my part</span><span>→</span></span>
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Featured products" className={`${s.paper} ${s.ruleTop}`}>
        <div className={`wrap ${s.section}`}>
          <div className={s.secHead}>
            <div className={s.titleBlock}>
              <span className="eyebrow">Featured</span>
              <h2 className="h2">Studs, bolts and nuts</h2>
            </div>
            <Link href="/products" className="link-rule">View catalogue →</Link>
          </div>
          <div className={s.cards}>
            {FEATURED.map(sku => <ProductCard key={sku} sku={sku} spin="auto" />)}
          </div>
        </div>
      </section>

      <section id="how" aria-label="How it works" className={s.how}>
        <div className={`wrap ${s.howInner}`}>
          <div className={s.howCopy}>
            <div className={s.titleBlock}>
              <span className="eyebrow">How it works</span>
              <h2 className="h2" style={{ textWrap: 'balance' }}>Identify, enquire, then we confirm the match</h2>
            </div>
            <ol className={s.steps}>
              {STEPS.map(([title, body], i) => (
                <li key={title} className={s.step}>
                  <span className={s.stepNo}>0{i + 1}</span>
                  <span className={s.stepText}><span className={s.stepTitle}>{title}</span><span className={s.stepBody}>{body}</span></span>
                </li>
              ))}
            </ol>
            <Link href="/find-my-part" className="btn btn-ink">Start an enquiry <span className="arrow">→</span></Link>
          </div>
          <div className={s.measure}>
            <div className={s.measureHead}><span>Where to measure a wheel stud</span><span>Press-in stud shown</span></div>
            <div className={s.measureBody}>
              <Drawing sku="ss-1001" labels="generic" views="side" layout="wide" grid minPx={12} maxPx={16} />
            </div>
            <div className={s.legend}>
              {LEGEND.map(([k, v]) => <span key={k}><b>{k}</b>{v}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" aria-label="Contact and collection" className={s.contact}>
        <div className={`wrap ${s.contactInner}`}>
          <div className={s.contactCopy}>
            <div className={s.titleBlock}>
              <span className="eyebrow eyebrow-dark">Contact</span>
              <h2 className="h2">Collect in Harare or ask for delivery</h2>
            </div>
            <div className={s.info}>
              <div className={s.infoCell}>
                <span className="label label-dark">Collection counter</span>
                <span className={s.infoAddr}>4475 Southview Park<br />Harare</span>
                <span className={s.infoMuted}>Mon–Fri 08:00–17:00<br />Sat 08:00–13:00</span>
              </div>
              <div className={s.infoCell}>
                <span className="label label-dark">Phone &amp; WhatsApp</span>
                <span className={s.infoPhones}>{company.phone}</span>
                <TrackedWhatsAppLink entryPoint="home_contact" className={s.infoLink}>Message on WhatsApp →</TrackedWhatsAppLink>
              </div>
              <div className={s.infoCell}>
                <span className="label label-dark">Delivery</span>
                <span className={s.infoBody}>Delivery within Harare and dispatch to other towns, arranged with each order.</span>
              </div>
              <div className={s.infoCell}>
                <span className="label label-dark">Trade &amp; fleet</span>
                <span className={s.infoBody}>Workshops, fleets and spares retailers: ask about quantity quotes.</span>
                <span className={s.infoEmail}>{company.email}</span>
              </div>
            </div>
          </div>
          <div className={s.map}>
            <iframe
              title="Map: StudSport collection counter, Southview Park, Harare"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noopener" className={s.mapLink}>Open in Google Maps →</a>
          </div>
        </div>
      </section>
    </>
  );
}
