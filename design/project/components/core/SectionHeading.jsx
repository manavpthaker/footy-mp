import React from 'react';

/**
 * SectionHeading — the uppercase divider with a pitch-green tick that opens
 * each analytical block ("Pre-match forecast", "Full squad", …).
 * `tick` color can change to mark a different accent (sky for forecasts, etc).
 */
export function SectionHeading({ children, tick = 'var(--accent)', trailing = null, style = {}, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        margin: '22px 0 11px',
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 'var(--fw-bold)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)',
        color: 'var(--text-muted)',
        ...style,
      }}
      {...rest}
    >
      <span style={{ width: '4px', height: '14px', borderRadius: '3px', background: tick, flex: '0 0 auto' }} />
      <span style={{ flex: 1 }}>{children}</span>
      {trailing && <span style={{ flex: '0 0 auto', textTransform: 'none', letterSpacing: 0 }}>{trailing}</span>}
    </div>
  );
}
