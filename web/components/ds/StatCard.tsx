// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * StatCard — a labelled metric tile (FIFA rank, points, goals…).
 * The value uses the mono/tabular voice; `unit` is a small dim suffix.
 */
export function StatCard({ label, value, unit = undefined, accent = 'var(--text-primary)', style = {}, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--surface-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '12px 14px',
        transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lift)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      {...rest}
    >
      <div style={{
        fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-faint)', fontWeight: 'var(--fw-semibold)', lineHeight: 1.25,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--fs-stat)', fontWeight: 'var(--fw-bold)', marginTop: '3px', color: accent,
      }}>
        {value}
        {unit ! && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontWeight: 'var(--fw-semibold)' }}>{unit}</span>}
      </div>
    </div>
  );
}
