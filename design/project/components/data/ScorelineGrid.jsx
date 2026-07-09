import React from 'react';

/**
 * ScorelineGrid — the Poisson scoreline-distribution matrix: home goals down,
 * away goals across, each cell tinted pitch-green by probability. The modal
 * scoreline gets a solid fill + border. Probabilities in [0,1]; cells render
 * as whole-number percentages.
 */
export function ScorelineGrid({ home = 'Home', away = 'Away', matrix, max = null, style = {}, ...rest }) {
  const peak = max != null ? max : Math.max(...matrix.flat());
  const label = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)',
    display: 'grid', placeItems: 'center', fontWeight: 'var(--fw-semibold)',
  };
  return (
    <div style={{ fontFamily: 'var(--font-ui)', ...style }} {...rest}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: '6px',
        fontSize: 'var(--fs-micro)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-faint)', fontWeight: 'var(--fw-bold)',
      }}>
        <span>{home} ↓</span><span>{away} →</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `18px repeat(${matrix[0].length}, 1fr)`, gap: '3px' }}>
        <span></span>
        {matrix[0].map((_, c) => <span key={c} style={label}>{c}</span>)}
        {matrix.map((row, r) => (
          <React.Fragment key={r}>
            <span style={label}>{r}</span>
            {row.map((p, c) => {
              const isPeak = p === peak;
              const t = peak > 0 ? p / peak : 0;
              return (
                <div key={c} style={{
                  padding: '5px 2px', textAlign: 'center', borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                  fontSize: 'var(--fs-2xs)', fontWeight: isPeak ? 'var(--fw-extrabold)' : 'var(--fw-medium)',
                  background: isPeak ? 'var(--grad-pitch)' : `rgba(255, 157, 46, ${(t * 0.32).toFixed(3)})`,
                  color: isPeak ? 'var(--text-on-pitch)' : t > 0.45 ? 'var(--text-primary)' : 'var(--text-faint)',
                  border: `1px solid ${isPeak ? 'var(--accent)' : 'var(--border-soft)'}`,
                }}>
                  {Math.round(p * 100)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: '6px', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)', fontFamily: 'var(--font-ui)' }}>
        % chance of each scoreline · Poisson on expected goals
      </div>
    </div>
  );
}
