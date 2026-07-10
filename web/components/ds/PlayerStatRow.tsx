// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * PlayerStatRow — a player line for leaderboards, followed-player modules,
 * and squad stat lists: rank, name + meta (club · pos), then up to three
 * mono figures with micro-labels. Gold ★ marks a followed player.
 */
export function PlayerStatRow({ rank = undefined, flag, name, meta = undefined, figures = [], followed = false, onClick = undefined, style = {}, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        background: 'var(--surface-panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '8px 11px', marginBottom: '6px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = 'var(--accent-2)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      {...rest}
    >
      {rank ! && (
        <span style={{ width: '18px', flex: '0 0 auto', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)' }}>{rank}</span>
      )}
      {flag && <span style={{ fontSize: '15px', flex: '0 0 auto' }}>{flag}</span>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
          {followed && <span style={{ marginLeft: '5px', color: 'var(--follow)', fontSize: 'var(--fs-xs)' }}>★</span>}
        </div>
        {meta && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</div>}
      </div>
      <div style={{ display: 'flex', gap: '14px', flex: '0 0 auto' }}>
        {figures.map((f, i) => (
          <div key={i} style={{ textAlign: 'right', minWidth: '30px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
              fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-extrabold)',
              color: f.accent ? 'var(--accent)' : 'var(--text-primary)',
            }}>{f.value}</div>
            <div style={{ fontSize: 'var(--fs-micro)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-faint)', fontWeight: 'var(--fw-semibold)' }}>{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
