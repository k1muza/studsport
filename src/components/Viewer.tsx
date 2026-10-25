'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '@/lib/products';
import { drawingSVG } from '@/lib/drawing';
import { PartViewer } from '@/lib/three/viewer';
import s from './Viewer.module.css';

const Icon = {
  pause: <svg viewBox="0 0 16 16"><rect x="4" y="3" width="2.6" height="10" fill="currentColor" /><rect x="9.4" y="3" width="2.6" height="10" fill="currentColor" /></svg>,
  play: <svg viewBox="0 0 16 16"><polygon points="4.5,3 13,8 4.5,13" fill="currentColor" /></svg>,
  reset: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3.5 8a4.5 4.5 0 1 0 1.3-3.2" /><polyline points="3.2,2.4 3.6,5.2 6.4,4.8" /></svg>,
  minus: <svg viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="8" x2="13" y2="8" /></svg>,
  plus: <svg viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="8" x2="13" y2="8" /><line x1="8" y1="3" x2="8" y2="13" /></svg>,
  full: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2.5,6 2.5,2.5 6,2.5" /><polyline points="10,2.5 13.5,2.5 13.5,6" /><polyline points="13.5,10 13.5,13.5 10,13.5" /><polyline points="6,13.5 2.5,13.5 2.5,10" /></svg>,
  dims: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="4.5" x2="2" y2="11.5" /><line x1="14" y1="4.5" x2="14" y2="11.5" /></svg>,
};

export interface ViewerProps {
  sku: string;
  /** "hero" shows only Pause, hides the tag and hint, and drops minor callouts. */
  variant?: 'hero' | 'pdp';
}

/* Interactive 3D viewer. Fills its positioned parent; transparent background. */
export function Viewer({ sku, variant = 'pdp' }: ViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const dims = useRef<SVGSVGElement>(null);
  const engine = useRef<PartViewer | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [auto, setAuto] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const hero = variant === 'hero';
  const p = getProduct(sku);

  const outline = useMemo(() => (p ? drawingSVG(p, { theme: 'dark', dims: false, views: 'side', fs: 3, bg: 'none' }).svg : ''), [p]);

  useEffect(() => {
    if (!p || !host.current || !canvas.current || !dims.current) return;
    const v = new PartViewer(p, {
      host: host.current, canvas: canvas.current, dims: dims.current, hero,
      onReady: () => setState('ready'),
      onFail: () => setState('failed'),
    });
    engine.current = v;
    setAuto(v.autoRotate);
    return () => { v.dispose(); engine.current = null; };
    // The engine is created once; product changes go through setProduct below.
  }, [hero]);

  useEffect(() => { if (p) engine.current?.setProduct(p); }, [p]);

  if (!p) return null;

  const toggleAuto = () => { const v = !auto; setAuto(v); engine.current?.setAuto(v); };
  const toggleDims = () => { const v = !showDims; setShowDims(v); engine.current?.setShowDims(v); };
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else host.current?.requestFullscreen?.().catch(() => {});
  };
  const playLabel = auto ? 'Pause rotation' : 'Resume rotation';

  return (
    <div ref={host} className={`${s.host} ${hero ? s.hero : ''}`}>
      <div className={s.wrap}>
        <div className={`${s.fb} ${state === 'ready' ? s.fbOff : ''}`} dangerouslySetInnerHTML={{ __html: outline }} />
        <canvas ref={canvas} className={`${s.canvas} ${state === 'ready' ? s.on : ''}`} aria-label="Interactive 3D model. Drag to rotate." />
        <svg ref={dims} className={s.dims} aria-hidden="true" />
        {!hero && <div className={s.tag}>ILLUSTRATIVE 3D MODEL</div>}
        {state !== 'ready' && (
          <div className={s.status} role="status">
            {state === 'loading' && <span className={s.bar} />}
            <span>{state === 'loading' ? 'Loading 3D model' : '3D preview unavailable · showing outline'}</span>
          </div>
        )}
        <div className={s.ctrls}>
          <button type="button" className={s.btn} title={playLabel} aria-label={playLabel} onClick={toggleAuto}>
            {auto ? Icon.pause : Icon.play}<span className={s.lbl}>{auto ? 'Pause' : 'Rotate'}</span>
          </button>
          {!hero && (
            <>
              <button type="button" className={s.btn} title="Reset view" aria-label="Reset view" onClick={() => engine.current?.reset()}>{Icon.reset}</button>
              <button type="button" className={s.btn} title="Zoom out" aria-label="Zoom out" onClick={() => engine.current?.zoomOut()}>{Icon.minus}</button>
              <button type="button" className={s.btn} title="Zoom in" aria-label="Zoom in" onClick={() => engine.current?.zoomIn()}>{Icon.plus}</button>
              <button type="button" className={s.btn} title="Show or hide dimensions" aria-label="Dimensions" aria-pressed={showDims} onClick={toggleDims}>
                {Icon.dims}<span className={s.lbl}>Dims</span>
              </button>
              <button type="button" className={s.btn} title="Fullscreen" aria-label="Fullscreen" onClick={fullscreen}>{Icon.full}</button>
            </>
          )}
        </div>
        {!hero && <div className={s.hint}>Drag to rotate · Ctrl/⌘ + scroll to zoom</div>}
      </div>
    </div>
  );
}
