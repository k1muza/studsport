import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--charcoal)', color: 'var(--on-dark)', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <span className="eyebrow-rule">404</span>
        <h1 style={{ margin: 0, fontSize: 'clamp(34px,4.4vw,60px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Part not found</h1>
        <p style={{ margin: 0, fontSize: 17, color: '#c3c8cc', maxWidth: '52ch' }}>That page or part number isn&apos;t in the catalogue. We can still source it.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/products" className="btn btn-accent">Browse products <span className="arrow">→</span></Link>
          <Link href="/find-my-part" className="btn btn-ghost">Find my part</Link>
        </div>
      </div>
    </main>
  );
}
