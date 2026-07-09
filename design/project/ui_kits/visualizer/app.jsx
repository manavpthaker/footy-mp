/* WC26 Visualizer UI kit — App shell, tab routing, search. */
const DSa = window.WC26VisualizerDesignSystem_b4eaf5;
const { IconButton: IBtn, MatchRow: MRow } = DSa;
const Da = window.WCDATA, Ma = window.WCMODEL;

/* ---------- Matches browser ---------- */
function MatchesView({ onMatch }) {
  const recent = [...Da.results].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 12);
  const upcoming = [...Da.fixtures].sort((a,b) => a.date.localeCompare(b.date)).slice(0, 12);
  const Col = ({ title, items, kind }) => (
    <div>
      <div style={{ fontSize:'var(--fs-xs)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-faint)', margin:'0 4px 8px', fontWeight:'var(--fw-bold)' }}>{title}</div>
      {items.map((m, i) => {
        const right = kind === 'result'
          ? <b style={{ fontFamily:'var(--font-mono)' }}>{m.hs}–{m.as}</b>
          : <span style={{ color:'var(--accent-2)', fontWeight:700, fontSize:'var(--fs-2xs)' }}>PREVIEW →</span>;
        return <MRow key={i} date={window.fmtDate(m.date)} homeFlag={window.flag(m.home)} home={window.shrt(m.home)} awayFlag={window.flag(m.away)} away={window.shrt(m.away)} right={right} onClick={() => onMatch(m.home, m.away)} />;
      })}
    </div>
  );
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'22px', maxWidth:'1100px' }}>
      <Col title="Recent results" items={recent} kind="result" />
      <Col title="⏱ Upcoming fixtures" items={upcoming} kind="fixture" />
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState('groups');
  const [sel, setSel] = React.useState(null);

  const onTeam = (team) => { setSel({ type:'team', team }); setTab('groups'); window.scrollDetailTop && window.scrollDetailTop(); };
  const onMatch = (home, away) => { setSel({ type:'match', home, away }); setTab('groups'); };

  const search = (q) => {
    q = q.trim().toLowerCase(); if (!q) return;
    let tt = Object.keys(Ma.teamRow).find(t => t.toLowerCase().includes(q));
    if (!tt) for (const t of Object.keys(Da.squads)) { if (Da.squads[t].p.some(p => p[0].toLowerCase().includes(q))) { tt = t; break; } }
    if (tt) onTeam(tt);
  };

  const Tab = ({ id, children }) => (
    <button onClick={() => setTab(id)} style={{
      padding:'7px 16px', borderRadius:'var(--radius-md)', cursor:'pointer', fontWeight:'var(--fw-semibold)', fontSize:'var(--fs-sm)',
      border:'none', fontFamily:'var(--font-ui)', transition:'all var(--dur-base) var(--ease-out)',
      background: tab===id ? 'var(--grad-pitch)' : 'transparent', color: tab===id ? 'var(--text-on-pitch)' : 'var(--text-muted)',
      boxShadow: tab===id ? 'var(--shadow-accent)' : 'none',
    }}>{children}</button>
  );

  const detail = !sel ? <window.EmptyDetail />
    : sel.type === 'team' ? <window.TeamDetail team={sel.team} onTeam={onTeam} onMatch={onMatch} />
    : <window.MatchPreview home={sel.home} away={sel.away} onTeam={onTeam} />;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* header */}
      <header style={{ display:'flex', alignItems:'center', gap:'18px', padding:'10px 18px', background:'var(--grad-header)', borderBottom:'1px solid var(--border)', flex:'0 0 auto', zIndex:30 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'var(--grad-gold)', display:'grid', placeItems:'center', fontSize:'19px', boxShadow:'var(--shadow-gold)' }}>🏆</div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'15px', margin:0, letterSpacing:'.3px', fontWeight:800 }}>MP&rsquo;S WORLD CUP VISUALIZER</h1>
            <div style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', marginTop:'1px' }}>2026 · USA · Canada · Mexico · 48 teams</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'4px', background:'var(--surface-panel)', padding:'4px', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' }}>
          <Tab id="groups">Groups</Tab><Tab id="matches">Matches</Tab><Tab id="bracket">Bracket</Tab>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ position:'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position:'absolute', left:'10px', top:'9px', opacity:.5 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
          <input placeholder="Search team or player…" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter') { search(e.target.value); e.target.blur(); } }}
            style={{ background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', color:'var(--text-primary)', padding:'8px 12px 8px 32px', width:'210px', fontSize:'var(--fs-sm)', outline:'none', fontFamily:'var(--font-ui)' }}
            onFocus={(e) => e.target.style.borderColor='var(--accent-2)'} onBlur={(e) => e.target.style.borderColor='var(--border)'} />
        </div>
        <IBtn title="Sync latest scores">⟳</IBtn>
        <IBtn title="Model controls">⚙</IBtn>
      </header>

      {/* stage */}
      {tab === 'groups' && (
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>
          <div style={{ flex:'0 0 460px', overflowY:'auto', padding:'14px', borderRight:'1px solid var(--border)' }}>
            <window.GroupsRail onTeam={onTeam} onMatch={onMatch} />
          </div>
          <div id="detailPane" style={{ flex:1, overflowY:'auto', padding:'18px 22px', minWidth:0 }}>{detail}</div>
        </div>
      )}
      {tab === 'matches' && (
        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}><MatchesView onMatch={onMatch} /></div>
      )}
      {tab === 'bracket' && (
        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}><window.BracketView onTeam={onTeam} /></div>
      )}
    </div>
  );
}

window.scrollDetailTop = () => { const p = document.getElementById('detailPane'); if (p) p.scrollTop = 0; };
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
