'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '@/lib/products';
import { drawingSVG } from '@/lib/drawing';
import { renderThumb, spinAdd, spinRemove, type SpinItem, type Tone } from '@/lib/three/thumbs';
import s from './Thumb.module.css';

export interface ThumbProps {
  sku: string;
  tone?: Tone;
  /** "auto" draws a live rotating render through the single shared spin renderer. */
  spin?: 'auto' | 'off';
  w?: number;
  h?: number;
}

/* Product render that fills its positioned parent. An SVG outline holds the space until the render is ready. */
export function Thumb({ sku, tone = 'dark', spin = 'off', w = 960, h = 600 }: ThumbProps) {
  const root = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [imgOn, setImgOn] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const p = getProduct(sku);

  const outline = useMemo(
    () => (p ? drawingSVG(p, { theme: tone === 'dark' ? 'dark' : 'light', dims: false, views: 'side', fs: 3, bg: 'none' }).svg : ''),
    [p, tone],
  );

  // Static render, requested once the thumb nears the viewport.
  useEffect(() => {
    setUrl(null); setImgOn(false);
    const el = root.current;
    if (!el || !p) return;
    let live = true;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      renderThumb(p.slug, tone, w, h).then(u => { if (live) setUrl(u); }).catch(() => {});
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => { live = false; io.disconnect(); };
  }, [p, tone, w, h]);

  // Live spin, only while on screen and never under reduced motion.
  useEffect(() => {
    setSpinning(false);
    const el = root.current, cv = canvas.current;
    if (!el || !cv || !p || spin !== 'auto' || tone !== 'dark') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const it: SpinItem = { p, canvas: cv, ctx, a: 0.55, onFirst: () => setSpinning(true) };
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) spinAdd(it); else spinRemove(it); });
    io.observe(el);
    return () => { io.disconnect(); spinRemove(it); };
  }, [p, spin, tone]);

  if (!p) return null;
  const shown = spinning || imgOn;
  return (
    <span ref={root} className={s.thumb}>
      <span className={`${s.fb} ${shown ? s.off : ''}`} dangerouslySetInnerHTML={{ __html: outline }} />
      {url && (
        <img src={url} alt={p.name} className={`${s.img} ${imgOn && !spinning ? s.on : ''}`} onLoad={() => setImgOn(true)} />
      )}
      <canvas ref={canvas} aria-hidden="true" className={`${s.canvas} ${spinning ? s.on : ''}`} />
    </span>
  );
}
