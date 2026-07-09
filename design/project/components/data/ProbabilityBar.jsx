import React from 'react';

/**
 * ProbabilityBar — the win/draw/loss forecast as a single 3-segment bar.
 * Home = sky-blue, Draw = slate, Away = pitch-green. Percentages render in mono
 * inside each segment; optional labels sit beneath.
 */
export function ProbabilityBar({ home, draw, away, homeLabel = null, awayLabel = null, height = 34, style = {}, ...rest }) {
  const seg = (w, bg, color, text, show = true) => (
    <div style={{
      width: `${w}%`, minWidth: '34px', display: 'grid', placeItems: 'center',
      background: bg, color, transition: 'width var(--dur-bar) var(--ease-out)',
      fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)',
    }}>{show ? text : ''}</div>
  );
  return (
    <div style={style} {...rest}>
      <div style={{
        height, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex',
        border: '1px solid var(--border)',
      }}>
        {seg(home, 'var(--grad-sky)', 'var(--text-on-sky)', `${home}%`)}
        {seg(draw, '#2e2722', '#d6cabb', `${draw}%`, draw > 7)}
        {seg(away, 'var(--grad-pitch)', 'var(--text-on-pitch)', `${away}%`)}
      </div>
      {(homeLabel || awayLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', marginTop: '6px' }}>
          <span>{homeLabel}</span><span>Draw</span><span>{awayLabel}</span>
        </div>
      )}
    </div>
  );
}
