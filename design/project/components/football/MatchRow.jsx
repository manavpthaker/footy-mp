import React from 'react';

/**
 * MatchRow — a tappable fixture / result line. Date on the left, the matchup in
 * the middle, and a flexible `right` slot for the readout: a score, a W/D/L pill,
 * a "54% win" favorite, a live badge, or a "PREVIEW →" affordance.
 */
export function MatchRow({ date, homeFlag, home, awayFlag, away, right = null, onClick, style = {}, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--surface-panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '9px 12px', marginBottom: '7px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.background = 'var(--surface-hover)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-panel)'; }}
      {...rest}
    >
      {date != null && (
        <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', width: '44px', flex: '0 0 auto', lineHeight: 1.25, fontFamily: 'var(--font-mono)' }}>{date}</div>
      )}
      <div style={{ flex: 1, fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ marginRight: '5px' }}>{homeFlag}</span>{home}
        <span style={{ color: 'var(--text-faint)', fontWeight: 'var(--fw-regular)', margin: '0 6px' }}>v</span>
        {away}<span style={{ marginLeft: '5px' }}>{awayFlag}</span>
      </div>
      {right && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flex: '0 0 auto' }}>{right}</div>}
    </div>
  );
}
