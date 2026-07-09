import React from 'react';

/**
 * RatingRing — the conic-gradient strength dial (0–99 composite rating).
 * Fills pitch-green up to `value`% of the circle with the figure in the hub.
 */
export function RatingRing({ value, max = 99, size = 64, color = 'var(--accent)', label = null, style = {}, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const hub = Math.round(size * 0.78);
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '5px', ...style }} {...rest}>
      <div style={{
        width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', flex: '0 0 auto',
        background: `conic-gradient(${color} ${pct}%, var(--track) 0)`,
      }}>
        <div style={{
          width: hub, height: hub, borderRadius: '50%', background: 'var(--surface-panel)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: `${Math.round(size * 0.3)}px`, fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)',
        }}>{value}</div>
      </div>
      {label && <div style={{ fontSize: 'var(--fs-micro)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-faint)', fontWeight: 'var(--fw-bold)' }}>{label}</div>}
    </div>
  );
}
