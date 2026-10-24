'use client';

import s from './QtyStepper.module.css';

export const clampQty = (v: number | string) => Math.max(1, Math.min(9999, parseInt(String(v), 10) || 1));

export function QtyStepper({ id, value, onChange, tone = 'light' }: { id: string; value: number; onChange: (v: number) => void; tone?: 'light' | 'dark' }) {
  return (
    <div className={`${s.stepper} ${s[tone]}`}>
      <button type="button" onClick={() => onChange(clampQty(value - 1))} aria-label="Decrease quantity">−</button>
      <input id={id} type="number" min={1} value={value} onChange={e => onChange(clampQty(e.target.value))} />
      <button type="button" onClick={() => onChange(clampQty(value + 1))} aria-label="Increase quantity">+</button>
    </div>
  );
}
