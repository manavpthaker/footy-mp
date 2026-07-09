import React from 'react';

const railFor = (i, status) =>
  status === 'eliminated' ? 'var(--status-out)'
  : i === 0 ? 'var(--status-through)'
  : i === 1 ? 'var(--status-runner)'
  : i === 2 ? 'var(--status-playoff)'
  : 'transparent';

/**
 * GroupStandings — the signature group card: a letter badge header over a dense
 * standings table. Rows carry the qualification rail (1st green / 2nd sky /
 * 3rd amber / out red), a Q/OUT tag, the FIFA rank subline, and tabular figures.
 * Pass teams ALREADY ordered; GD is derived. onSelect(team) fires on row click.
 */
export function GroupStandings({ group, teams, onSelect, style = {}, ...rest }) {
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
      borderRadius: 'var(--radius-xl)', marginBottom: '12px', overflow: 'hidden',
      transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      ...style,
    }} {...rest}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 13px',
        fontSize: 'var(--fs-sm)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
        color: 'var(--text-muted)', fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-ui)',
        background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          width: '20px', height: '20px', borderRadius: 'var(--radius-sm)', background: 'var(--grad-sky)',
          color: 'var(--text-on-sky)', display: 'grid', placeItems: 'center',
          fontWeight: 'var(--fw-extrabold)', fontSize: 'var(--fs-xs)',
        }}>{group}</span>
        Group {group}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left', paddingLeft: '13px' }}>Team</th>
            <th style={th}>P</th><th style={th}>W</th><th style={th}>D</th><th style={th}>L</th>
            <th style={th}>GF:GA</th><th style={th}>GD</th><th style={th}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((r, i) => {
            const gd = r.GF - r.GA;
            const rail = railFor(i, r.status);
            const dim = r.status === 'eliminated';
            return (
              <tr
                key={r.team}
                onClick={() => onSelect && onSelect(r.team)}
                style={{
                  cursor: onSelect ? 'pointer' : 'default',
                  boxShadow: rail !== 'transparent' ? `inset 3px 0 0 ${rail}` : 'none',
                  opacity: dim ? 0.62 : 1,
                  transition: 'background var(--dur-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => { if (onSelect) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ ...td, fontFamily: 'var(--font-ui)', textAlign: 'left', paddingLeft: '9px', fontWeight: 'var(--fw-semibold)', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', width: '15px', color: 'var(--text-faint)', fontSize: 'var(--fs-2xs)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
                  <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', marginRight: '6px', fontSize: '14px' }}>{r.flag || '⚽'}</span>
                  {r.team}
                  {r.status === 'qualified' && <span style={{ fontSize: 'var(--fs-micro)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', marginLeft: '5px', fontWeight: 'var(--fw-bold)', background: 'var(--pitch-tint)', color: 'var(--accent)' }}>Q</span>}
                  {r.status === 'eliminated' && <span style={{ fontSize: 'var(--fs-micro)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', marginLeft: '5px', fontWeight: 'var(--fw-bold)', background: 'var(--red-tint)', color: 'var(--status-out)' }}>OUT</span>}
                  <br /><span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)', marginLeft: '21px', fontFamily: 'var(--font-mono)' }}>FIFA #{r.rank}</span>
                </td>
                <td style={td}>{r.P}</td><td style={td}>{r.W}</td><td style={td}>{r.D}</td><td style={td}>{r.L}</td>
                <td style={td}>{r.GF}:{r.GA}</td>
                <td style={td}>{gd > 0 ? '+' : ''}{gd}</td>
                <td style={{ ...td, fontWeight: 'var(--fw-extrabold)', color: 'var(--text-primary)' }}>{r.Pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
