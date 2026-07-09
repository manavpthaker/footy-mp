import React from 'react';

const TONE = {
  W: { background: 'var(--status-win)', color: 'var(--pitch-900)' },
  D: { background: 'var(--status-draw)', color: 'var(--slate-300)' },
  L: { background: 'var(--status-loss)', color: '#fff' },
};

/**
 * FormPills — the W/D/L streak row. Pass a string ("WWDLW") or an array of
 * results; optionally pass `titles` (parallel array) for per-pill tooltips.
 */
export function FormPills({ results, size = 22, titles = [], style = {}, ...rest }) {
  const list = Array.isArray(results) ? results : String(results).split('');
  if (!list.length) return <span style={{ color: 'var(--text-faint)' }}>—</span>;
  return (
    <div style={{ display: 'flex', gap: '5px', ...style }} {...rest}>
      {list.map((r, i) => (
        <div key={i} title={titles[i] || ''} style={{
          width: size, height: size, borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center',
          fontSize: `${Math.round(size * 0.5)}px`, fontWeight: 'var(--fw-extrabold)',
          fontFamily: 'var(--font-ui)', ...(TONE[r] || TONE.D),
        }}>{r}</div>
      ))}
    </div>
  );
}
