// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';

/**
 * PlayerCard — squad member tile. The lead box shows a figure (age or shirt #),
 * then name + club, with caps on the right. `isKey` marks a star player
 * (green border, pitch-green lead box, ★ badge).
 */
export function PlayerCard({ lead, name, club, caps = undefined, isKey = false, onClick = undefined, style = {}, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '9px',
        background: isKey ? 'linear-gradient(135deg, #241a0c, var(--surface-panel))' : 'var(--surface-panel)',
        border: `1px solid ${isKey ? '#4a3a20' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '9px 11px', cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = isKey ? 'var(--accent)' : 'var(--accent-2)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = isKey ? '#4a3a20' : 'var(--border)'; }}
      {...rest}
    >
      {isKey && <div style={{ position: 'absolute', top: '-6px', right: '-6px', fontSize: '13px' }}>⭐</div>}
      <div style={{
        width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center',
        flex: '0 0 auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-extrabold)',
        background: isKey ? 'var(--accent)' : 'var(--surface-raised)', color: isKey ? 'var(--pitch-900)' : 'var(--text-muted)',
      }}>{lead}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club}</div>
      </div>
      {caps ! && (
        <div style={{ marginLeft: 'auto', textAlign: 'right', flex: '0 0 auto', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          {caps}<span style={{ fontSize: 'var(--fs-micro)' }}> caps</span>
        </div>
      )}
    </div>
  );
}
