/* Drafting symbol for an external thread end view: major circle, ¾ minor arc in accent, dash-dot centre lines. */
export function Mark({ size = 30, ink = '#eceeef', accent = 'oklch(0.68 0.17 45)' }: { size?: number; ink?: string; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="15" cy="15" r="12.5" fill="none" stroke={ink} strokeWidth="2.4" />
      <path d="M23 15 A8 8 0 1 1 15 7" fill="none" stroke={accent} strokeWidth="1.6" />
      <line x1="15" y1="1" x2="15" y2="29" stroke={ink} strokeWidth="0.8" strokeDasharray="3 1.5 1 1.5" />
      <line x1="1" y1="15" x2="29" y2="15" stroke={ink} strokeWidth="0.8" strokeDasharray="3 1.5 1 1.5" />
    </svg>
  );
}
