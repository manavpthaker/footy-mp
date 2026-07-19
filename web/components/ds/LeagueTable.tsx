// @ts-nocheck  — DS prototype JSX ported as-is; typed via the design-system .d.ts files.
"use client";
import React from 'react';
import { Crest } from './Crest';

const zoneColor = (zone) =>
  zone === 'ucl' ? 'var(--zone-ucl)'
  : zone === 'uel' ? 'var(--zone-uel)'
  : zone === 'conf' ? 'var(--zone-conf)'
  : zone === 'releg' ? 'var(--zone-releg)'
  : 'transparent';

const formColor = (r) =>
  r === 'W' ? 'var(--status-win)' : r === 'D' ? 'var(--slate-300)' : 'var(--status-loss)';

/**
 * LeagueTable — full-season standings for a league. Extends the GroupStandings
 * anatomy to 18–20 rows: the 3px inset rail now marks LEAGUE ZONES
 * (ucl green / uel sky / conf amber / releg red), rows carry an optional
 * last-5 form string, and followed teams get a gold ★. Pass rows ordered.
 */
export function LeagueTable({ rows, onSelect = undefined, showForm = true, style = {}, ...rest }) {
  const th = {
    fontSize: 'var(--fs-micro)', color: 'var(--text-faint)', fontWeight: 'var(--fw-semibold)',
    textAlign: 'center', padding: '5px 3px', textTransform: 'uppercase',
  };
  const td = {
    padding: '6px 3px', textAlign: 'center', borderTop: '1px solid var(--border-soft)',
    fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-sm)',
  };
  return (
    <div style={{
      background: 'var(--surface-panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', overflow: 'hidden', ...style,
    }} {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left', paddingLeft: '13px' }}>Team</th>
            <th style={th}>P</th><th style={th}>W</th><th style={th}>D</th><th style={th}>L</th>
            <th style={th}>GD</th><th style={{ ...th, minWidth: '30px' }}>Pts</th>
            {showForm && <th style={{ ...th, minWidth: '58px' }}>Form</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rail = zoneColor(r.zone);
            return (
              <tr
                key={r.team}
                onClick={() => onSelect && onSelect(r.team)}
                style={{
                  cursor: onSelect ? 'pointer' : 'default',
                  boxShadow: rail !== 'transparent' ? `inset 3px 0 0 ${rail}` : 'none',
                  transition: 'background var(--dur-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => { if (onSelect) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ ...td, fontFamily: 'var(--font-ui)', textAlign: 'left', paddingLeft: '9px', fontWeight: 'var(--fw-semibold)', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', width: '19px', color: 'var(--text-faint)', fontSize: 'var(--fs-2xs)', fontFamily: 'var(--font-mono)' }}>{r.pos ! ? r.pos : i + 1}</span>
                  <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', marginRight: '6px', fontSize: '14px', verticalAlign: 'middle' }}>
                    {r.crest ? <Crest team={r.crest} size={16} /> : (r.flag || '⚽')}
                  </span>
                  {r.team}
                  {r.followed && <span style={{ marginLeft: '5px', color: 'var(--follow)', fontSize: 'var(--fs-xs)' }}>★</span>}
                </td>
                <td style={td}>{r.P}</td><td style={td}>{r.W}</td><td style={td}>{r.D}</td><td style={td}>{r.L}</td>
                <td style={td}>{r.GD > 0 ? '+' : ''}{r.GD}</td>
                <td style={{ ...td, fontWeight: 'var(--fw-extrabold)', color: 'var(--text-primary)' }}>{r.Pts}</td>
                {showForm && (
                  <td style={{ ...td, letterSpacing: '0.14em', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)' }}>
                    {(r.form || []).map((f, j) => (
                      <span key={j} style={{ color: formColor(f) }}>{f}</span>
                    ))}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
