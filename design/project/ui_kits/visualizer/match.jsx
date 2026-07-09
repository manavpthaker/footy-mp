/* WC26 Visualizer UI kit — Match preview. */
const DSm = window.WC26VisualizerDesignSystem_b4eaf5;
const { ProbabilityBar: PBar, FactorBar: FBar, PlayerCard: PCard, SectionHeading: SHead } = DSm;
const Dm = window.WCDATA, Mm = window.WCMODEL;

function MatchSide({ team, onClick }) {
  const row = Mm.teamRow[team];
  return (
    <div onClick={onClick} style={{
      flex:1, background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)',
      padding:'16px', textAlign:'center', cursor:'pointer', transition:'border-color var(--dur-base) var(--ease-out)',
    }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor='var(--accent-2)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border)'}
    >
      <div style={{ fontSize:'40px' }}>{window.flag(team)}</div>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'16px', margin:'6px 0 2px' }}>{team}</div>
      <div style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>FIFA #{row.rank} · Rating {Mm.ratingIndex(team)}</div>
    </div>
  );
}

function CmpRow({ label, vh, va, better }) {
  const cell = (v, side) => (
    <div style={{ fontWeight:800, fontFamily:'var(--font-mono)', fontVariantNumeric:'tabular-nums', textAlign: side==='h'?'right':'left',
      color: better===side ? (side==='h'?'var(--accent-2)':'var(--accent)') : 'var(--text-primary)' }}>{v}</div>
  );
  return <>
    {cell(vh, 'h')}
    <div style={{ textAlign:'center', fontSize:'var(--fs-2xs)', color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
    {cell(va, 'a')}
  </>;
}

function MatchPreview({ home, away, onTeam }) {
  const pr = Mm.matchProbs(home, away);
  const hh = Math.round(pr.h*100), dd = Math.round(pr.d*100), aa = 100 - hh - dd;
  const rh = Mm.teamRow[home], ra = Mm.teamRow[away];
  const fbH = Mm.factorBars(home), fbA = Mm.factorBars(away);
  const ko = (() => { const f = Dm.fixtures.find(x => (x.home===home&&x.away===away)||(x.home===away&&x.away===home)); return f ? `Group ${f.group||'—'} · ${window.fmtDate(f.date)}` : ''; })();
  const keyH = (Dm.squads[home]?.p || []).filter(p => p[5]).slice(0,5);
  const keyA = (Dm.squads[away]?.p || []).filter(p => p[5]).slice(0,5);
  const formH = Mm.teamForm(home).slice(-3).map(f => f.r);
  const formA = Mm.teamForm(away).slice(-3).map(f => f.r);
  const gdH = Mm.gd(rh), gdA = Mm.gd(ra);
  const { FormPills } = window.WC26VisualizerDesignSystem_b4eaf5;

  const keyList = (arr, team) => arr.length ? arr.map((p,i) =>
    <PCard key={i} lead={p[1]} name={p[0]} club={p[2]} isKey onClick={() => onTeam(team)} style={{ marginBottom:'6px' }} />
  ) : <span style={{ color:'var(--text-faint)' }}>—</span>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'stretch', gap:'14px', marginBottom:'18px' }}>
        <MatchSide team={home} onClick={() => onTeam(home)} />
        <div style={{ display:'grid', placeItems:'center', fontWeight:800, color:'var(--text-faint)', fontFamily:'var(--font-display)', fontSize:'14px', padding:'0 4px' }}>
          <div>VS</div>
          {ko && <div style={{ fontSize:'var(--fs-micro)', color:'var(--text-faint)', marginTop:'6px', maxWidth:'72px', textAlign:'center', fontFamily:'var(--font-ui)' }}>{ko}</div>}
        </div>
        <MatchSide team={away} onClick={() => onTeam(away)} />
      </div>

      <SHead tick="var(--accent-2)">Pre-match forecast</SHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'12px', alignItems:'center', background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'12px 16px', marginBottom:'12px' }}>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'var(--fs-display-num)', fontWeight:800 }}>{pr.la.toFixed(2)}</span>
          <span style={{ fontSize:'var(--fs-micro)', color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.04em' }}>xG {window.shrt(home)}</span>
        </div>
        <div style={{ textAlign:'center', fontSize:'var(--fs-2xs)', color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.05em' }}>likeliest<br/><b style={{ fontFamily:'var(--font-display)', fontSize:'20px', color:'var(--gold)', display:'block', marginTop:'2px' }}>{pr.score[0]}–{pr.score[1]}</b></div>
        <div style={{ display:'flex', flexDirection:'column', textAlign:'right' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'var(--fs-display-num)', fontWeight:800 }}>{pr.lb.toFixed(2)}</span>
          <span style={{ fontSize:'var(--fs-micro)', color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.04em' }}>xG {window.shrt(away)}</span>
        </div>
      </div>
      <PBar home={hh} draw={dd} away={aa} homeLabel={`${window.shrt(home)} win`} awayLabel={`${window.shrt(away)} win`} />

      <SHead>Head to head</SHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'6px', alignItems:'center', marginBottom:'8px' }}>
        <CmpRow label="World rank" vh={`#${rh.rank}`} va={`#${ra.rank}`} better={rh.rank<ra.rank?'h':'a'} />
        <CmpRow label="Rating pts" vh={Math.round(rh.pts)} va={Math.round(ra.pts)} better={rh.pts>ra.pts?'h':'a'} />
        <CmpRow label="Group pts" vh={rh.Pts} va={ra.Pts} better={rh.Pts>ra.Pts?'h':rh.Pts<ra.Pts?'a':''} />
        <CmpRow label="Goal diff" vh={`${gdH>0?'+':''}${gdH}`} va={`${gdA>0?'+':''}${gdA}`} better={gdH>gdA?'h':gdH<gdA?'a':''} />
        <div style={{ display:'flex', justifyContent:'flex-end' }}><FormPills results={formH} size={18} /></div>
        <div style={{ textAlign:'center', fontSize:'var(--fs-2xs)', color:'var(--text-faint)' }}>FORM</div>
        <div><FormPills results={formA} size={18} /></div>
      </div>

      <SHead>Rating factors — what drives the forecast</SHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div>
          <h4 style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 8px' }}>{window.flag(home)} {window.shrt(home)} · {Mm.ratingIndex(home)}</h4>
          {Object.keys(Mm.FACTOR_LABEL).filter(k=>k!=='val'||Math.abs(fbH.val)>0.01).map(k => <FBar key={k} label={Mm.FACTOR_LABEL[k]} z={fbH[k]} />)}
        </div>
        <div>
          <h4 style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 8px' }}>{window.flag(away)} {window.shrt(away)} · {Mm.ratingIndex(away)}</h4>
          {Object.keys(Mm.FACTOR_LABEL).filter(k=>k!=='val'||Math.abs(fbA.val)>0.01).map(k => <FBar key={k} label={Mm.FACTOR_LABEL[k]} z={fbA[k]} />)}
        </div>
      </div>

      <SHead>Key players</SHead>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div><h4 style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 8px' }}>{window.flag(home)} {window.shrt(home)}</h4>{keyList(keyH, home)}</div>
        <div><h4 style={{ fontSize:'var(--fs-xs)', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 8px' }}>{window.flag(away)} {window.shrt(away)}</h4>{keyList(keyA, away)}</div>
      </div>
    </div>
  );
}

window.MatchPreview = MatchPreview;
