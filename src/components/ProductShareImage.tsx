import type { Product } from '@/lib/catalogue';
import { keyDims, typeLabel } from '@/lib/products';
import { productSearchName } from '@/lib/seo';

export function ProductShareImage({ product }: { product: Product }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#121416', color: '#f1f1ef', padding: '68px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25, letterSpacing: '0.1em', textTransform: 'uppercase' }}><span style={{ color: '#d77a43' }}>StudSport</span><span style={{ color: '#a2a8ae' }}>Harare · Zimbabwe</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', fontSize: 30, color: '#d77a43' }}>{product.partNo} · {typeLabel(product)}</div>
      <div style={{ display: 'flex', fontSize: 66, lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.04em', maxWidth: 1040 }}>{productSearchName(product)}</div>
    </div>
    <div style={{ display: 'flex', gap: 28, fontSize: 24, color: '#c9cdd0' }}>{keyDims(product).map(row => <span key={row.k}>{row.k} {row.v}</span>)}</div>
  </div>;
}
