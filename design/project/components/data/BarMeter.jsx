import React from 'react';

/**
 * BarMeter — a thin horizontal magnitude bar (Monte-Carlo title odds, generic
 * proportions). Defaults to the pitch→sky gradient fill of the odds table.
 */
export function BarMeter({ value, max = 100, height = 7, fill = 'linear-gradient(90deg, var(--accent), var(--accent-2))', track = 'var(--track)', style = {}, ...rest }) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height, borderRadius: '4px', background: track, overflow: 'hidden', minWidth: '60px', ...style }} {...rest}>
      <div style={{ display: 'block', height: '100%', width: `${w}%`, background: fill, transition: 'width var(--dur-bar) var(--ease-out)' }} />
    </div>
  );
}
