// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * FactorBar — one driver of the composite rating, shown as a signed z-score.
 * The bar grows from a center midline: right = above field average (pitch-green),
 * left = below (red), near-zero = neutral slate. This is the "why" behind a rating.
 */
export function FactorBar({ label, z, style = {}, ...rest }) {
  const w = Math.max(4, Math.min(100, 50 + 18 * z));
  const color = z >= 0.15 ? 'var(--accent)' : z <= -0.15 ? 'var(--status-out)' : '#8a7d6d';
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '74px 1fr 42px', gap: '9px', alignItems: 'center', marginBottom: '6px',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
        fontSize: 'var(--fs-micro)', fontWeight: 'var(--fw-bold)',
      }}>{label}</span>
      <span style={{ height: '9px', borderRadius: '5px', background: 'var(--track)', overflow: 'hidden', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '50%', top: '-2px', width: '1px', height: '13px', background: 'var(--ink-700)', zIndex: 1 }} />
        <span style={{ display: 'block', height: '100%', borderRadius: '5px', width: `${w}%`, background: color, transition: 'width var(--dur-bar) var(--ease-out)' }} />
      </span>
      <span style={{
        textAlign: 'right', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
        color: 'var(--text-primary)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-xs)',
      }}>{z > 0 ? '+' : ''}{z.toFixed(2)}</span>
    </div>
  );
}
