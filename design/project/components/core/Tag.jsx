import React from 'react';

/**
 * Tag — small status chip carrying tournament meaning.
 * tones:
 *   qualified  → pitch-green "Q"
 *   out        → red "OUT"
 *   pill       → neutral panel pill (e.g. "1st in Group A")
 *   accent     → sky-blue filled chip (the rounded "tag2" style)
 *   gold       → champion / key
 */
export function Tag({ tone = 'pill', children, style = {}, ...rest }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  };

  const tones = {
    qualified: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--pitch-tint)',
      color: 'var(--accent)',
      letterSpacing: '0.03em',
    },
    out: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 6px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--red-tint)',
      color: 'var(--status-out)',
      letterSpacing: '0.03em',
    },
    pill: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 7px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-raised)',
      color: 'var(--text-muted)',
    },
    accent: {
      fontSize: 'var(--fs-sm)',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: '#241f1c',
      color: 'var(--accent)',
      border: '1px solid #3a3129',
      fontWeight: 'var(--fw-semibold)',
    },
    gold: {
      fontSize: 'var(--fs-micro)',
      padding: '2px 7px',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--follow-tint)',
      color: 'var(--gold)',
      letterSpacing: '0.03em',
    },
  };

  return (
    <span style={{ ...base, ...tones[tone], ...style }} {...rest}>
      {children}
    </span>
  );
}
