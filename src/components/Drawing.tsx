'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '@/lib/products';
import { drawingSVG } from '@/lib/drawing';

export interface DrawingProps {
  sku: string;
  layout?: 'auto' | 'wide' | 'stack';
  theme?: 'light' | 'dark';
  labels?: 'values' | 'generic';
  views?: 'all' | 'side';
  grid?: boolean;
  /** Smallest on-screen text size in px; the generator scales its font so labels never render below this. */
  minPx?: number;
  maxPx?: number;
  className?: string;
}

/* Dimensioned drawing that adapts to its container: stacked layout below 640px, text kept ≥ minPx. */
export function Drawing({ sku, layout = 'auto', theme = 'light', labels = 'values', views = 'all', grid = false, minPx = 11, maxPx = 14, className }: DrawingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [bucket, setBucket] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBucket(Math.max(1, Math.round((el.clientWidth || 800) / 24)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const html = useMemo(() => {
    const p = getProduct(sku);
    if (!p) return '';
    const w = bucket ? bucket * 24 : 800;
    const lay = layout === 'auto' ? (w < 640 ? 'stack' : 'wide') : layout;
    const o = { layout: lay, theme, labels, views, grid, dims: true } as const;
    let r = drawingSVG(p, { ...o, fs: 3.2 });
    for (let i = 0; i < 2; i++) {
      const ppm = w / r.w;
      if (r.fs * ppm >= minPx * 0.97) break;
      r = drawingSVG(p, { ...o, fs: Math.min(7, minPx / ppm) });
    }
    const maxW = (r.w * maxPx) / r.fs;
    return `<div style="max-width:${Math.round(maxW)}px;margin:0 auto">${r.svg}</div>`;
  }, [sku, bucket, layout, theme, labels, views, grid, minPx, maxPx]);

  return <div ref={ref} className={className} style={{ display: 'block', width: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
