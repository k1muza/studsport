'use client';

/* Single-choice chip group (aria-pressed buttons). Clicking the selected chip clears it unless `required`. */
export function Choices({ options, value, onChange, required = false, className }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => (
        <button key={o} type="button" aria-pressed={value === o} className={`choice ${className || ''}`}
          onClick={() => onChange(value === o && !required ? '' : o)}>{o}</button>
      ))}
    </div>
  );
}
