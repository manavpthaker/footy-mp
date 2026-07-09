/* WC26 Visualizer UI kit — Knockout bracket + Monte-Carlo title odds. */
const DSb = window.WC26VisualizerDesignSystem_b4eaf5;
const { Button: BBtn, Tag: BTag, SectionHeading: BHead, BarMeter: BMeter } = DSb;
const Mb = window.WCMODEL;

function Tie({ m, B, onTeam }) {
  const mt = Mb.MT[m];
  const t = Mb.teamsOf(m, B);
  const w = Mb.winnerOf(m, B);
  const Slot = ({ team, tok }) => {
    if (!team) return (
      <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 9px', fontSize:'var(--fs-sm)', borderLeft:'3px solid transparent', color:'var(--text-faint)' }}>
        <span style={{ width:'18px', textAlign:'center' }}>·</span><span style={{ flex:1 }}>TBD</span>
      </div>
    );
    const isW = w === team;
    const lbl = mt.r32 ? Mb.slotLabel(tok, B) : '';
    return (
      <div onClick={(e) => { e.stopPropagation(); Mb.setPick('M' + m, team); onTeam.bump(); }}
        style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 9px', fontSize:'var(--fs-sm)', cursor:'pointer',
          borderLeft:`3px solid ${isW ? 'var(--accent)' : 'transparent'}`, fontWeight: isW ? 800 : 400, opacity: isW ? 1 : 0.45,
          transition:'background var(--dur-fast) var(--ease-out)' }}
        onMouseEnter={(e) => e.currentTarget.style.background='var(--surface-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
        <span style={{ fontSize:'14px', width:'18px', textAlign:'center' }}>{window.flag(team)}</span>
        <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{window.shrt(team)}</span>
        <span style={{ fontSize:'var(--fs-2xs)', color:'var(--text-faint)', fontFamily:'var(--font-mono)' }}>{lbl}</span>
      </div>
    );
  };
  return (
    <div style={{ background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
      <div style={{ fontSize:'8px', color:'var(--text-faint)', padding:'3px 8px 0', textAlign:'right', letterSpacing:'0.3px', fontFamily:'var(--font-mono)' }}>M{m}</div>
      <Slot team={t[0]} tok={mt.h} />
      <div style={{ borderTop:'1px solid var(--border-soft)' }}><Slot team={t[1]} tok={mt.a} /></div>
    </div>
  );
}

function Round({ name, order, B, onTeam }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-around', gap:'6px', minWidth:'170px' }}>
      <div style={{ fontSize:'var(--fs-2xs)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-faint)', fontWeight:'var(--fw-bold)', textAlign:'center', marginBottom:'2px' }}>{name}</div>
      {order.map(m => <Tie key={m} m={m} B={B} onTeam={onTeam} />)}
    </div>
  );
}

function BracketView({ onTeam }) {
  const [, setN] = React.useState(0);
  const bump = () => setN(n => n + 1);
  const B = Mb.bracketTeams();
  const odds = Mb.simulate(2000);
  const champ = Mb.winnerOf(104, B);
  const handle = { bump };

  const rounds = [
    ['Round of 32', Mb.R32m], ['Round of 16', Mb.R16m], ['Quarter-finals', Mb.QFm], ['Semi-finals', Mb.SFo], ['Final', Mb.FINo],
  ];
  const maxOdds = odds.length ? odds[0].pct : 100;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'6px', flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontFamily:'var(--font-display)', fontSize:'var(--fs-title)', fontWeight:800 }}>🏆 Knockout Predictor</h2>
        <BBtn variant="primary" iconLeft="⚡" onClick={() => { Mb.autoFill(); bump(); }}>Auto-fill by model</BBtn>
        <BBtn variant="secondary" iconLeft="↺" onClick={() => { Mb.resetPicks(); bump(); }}>Reset</BBtn>
        <BTag tone="pill">Official 2026 bracket</BTag>
      </div>
      <div style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', margin:'2px 0 14px', maxWidth:'900px', lineHeight:1.5 }}>
        Slots are fixed by group finish (1A, 2B, …) and the eight third-placed teams are slotted per FIFA's Annex C table. Teams fill in from the <b style={{ color:'var(--text-primary)' }}>live standings</b>. <b style={{ color:'var(--text-primary)' }}>Tap any team to advance them</b>; unpicked ties auto-resolve to the model favorite. Title odds = 2,000-run Monte-Carlo.
      </div>

      <div style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'14px', alignItems:'stretch' }}>
        {rounds.map(([nm, ord]) => <Round key={nm} name={nm} order={ord} B={B} onTeam={handle} />)}
        <div style={{ display:'grid', placeItems:'center', minWidth:'180px' }}>
          <div style={{ background:'linear-gradient(135deg,#1d2b1f,#142033)', border:'1px solid var(--accent)', borderRadius:'var(--radius-2xl)', padding:'20px 16px', textAlign:'center', width:'100%' }}>
            <div style={{ fontSize:'var(--fs-2xs)', color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:'var(--fw-bold)' }}>Projected Champion</div>
            <div style={{ fontSize:'46px' }}>{champ ? window.flag(champ) : '🏆'}</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'16px', marginTop:'6px' }}>{champ || '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'14px', marginTop:'22px' }}>
        <div style={{ background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'16px' }}>
          <BHead style={{ marginTop:0 }}>Title odds — Monte Carlo</BHead>
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'6px' }}>
            <tbody>
              {odds.slice(0,14).map(o => (
                <tr key={o.team} onClick={() => onTeam(o.team)} style={{ cursor:'pointer' }}>
                  <td style={{ width:'22px', padding:'7px 8px', borderTop:'1px solid var(--border-soft)' }}>{window.flag(o.team)}</td>
                  <td style={{ fontWeight:700, padding:'7px 8px', borderTop:'1px solid var(--border-soft)' }}>{window.shrt(o.team)}</td>
                  <td style={{ width:'90px', padding:'7px 8px', borderTop:'1px solid var(--border-soft)' }}><BMeter value={o.pct} max={maxOdds} /></td>
                  <td style={{ textAlign:'right', fontWeight:800, color:'var(--accent)', fontFamily:'var(--font-mono)', padding:'7px 8px', borderTop:'1px solid var(--border-soft)' }}>{o.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'16px' }}>
          <BHead style={{ marginTop:0 }}>How the model works</BHead>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--fs-sm)', lineHeight:1.55 }}>Each team gets a <b style={{ color:'var(--text-primary)' }}>composite strength rating</b> (FIFA base, Form, Attack, Defense, Momentum). The rating gap sets each side's <b style={{ color:'var(--text-primary)' }}>expected goals</b> and a <b style={{ color:'var(--text-primary)' }}>Poisson</b> grid gives win/draw/loss — so even big favorites leak real upset probability. <b style={{ color:'var(--text-primary)' }}>Backtested on Qatar 2022.</b></p>
          <p style={{ color:'var(--text-faint)', fontSize:'var(--fs-xs)' }}>A strength model for analysis &amp; entertainment — not betting advice.</p>
        </div>
      </div>
    </div>
  );
}

window.BracketView = BracketView;
