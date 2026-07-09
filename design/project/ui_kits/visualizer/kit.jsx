/* WC26 Visualizer UI kit — Groups rail, Team detail, Match preview.
   Composes the design-system components against the real model. */
const DS = window.WC26VisualizerDesignSystem_b4eaf5;
const { GroupStandings, MatchRow, PlayerCard, StatCard, RatingRing, FactorBar,
        ProbabilityBar, FormPills, SectionHeading, Tag, BarMeter } = DS;
const D = window.WCDATA;
const M = window.WCMODEL;

const flag = (t) => D.flag(t);
const SHORT = { "Bosnia and Herzegovina":"Bosnia","United States":"USA","Czech Republic":"Czechia","South Korea":"S. Korea","South Africa":"S. Africa","Saudi Arabia":"Saudi","New Zealand":"N. Zealand" };
const shrt = (t) => SHORT[t] || t;
const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
const ord = (i) => i===1?'st':i===2?'nd':i===3?'rd':'th';

/* ---------- empty state ---------- */
function EmptyDetail() {
  return (
    <div style={{ display:'grid', placeItems:'center', height:'100%', color:'var(--text-faint)', textAlign:'center' }}>
      <div>
        <div style={{ fontSize:'46px', marginBottom:'10px' }}>👆</div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'18px', color:'var(--accent-2)' }}>Pick a team or a fixture</div>
        <div style={{ marginTop:'8px', maxWidth:'340px', fontSize:'var(--fs-sm)', lineHeight:1.6 }}>
          Click any team to see its full squad, form and win probability — or tap a fixture for a full match preview with model odds.
        </div>
      </div>
    </div>
  );
}

/* ---------- Groups rail ---------- */
function GroupsRail({ onTeam, onMatch }) {
  const legend = [
    ['var(--status-through)', '1st — through'],
    ['var(--status-runner)', '2nd — through'],
    ['var(--status-playoff)', '3rd — playoff hunt'],
    ['var(--status-out)', 'eliminated'],
  ];
  const fxByDate = {};
  D.fixtures.forEach(f => { (fxByDate[f.date] = fxByDate[f.date] || []).push(f); });
  const dates = Object.keys(fxByDate).sort().slice(0, 6);

  return (
    <div>
      <div style={{ display:'flex', gap:'13px', flexWrap:'wrap', fontSize:'var(--fs-2xs)', color:'var(--text-muted)', margin:'2px 2px 12px' }}>
        {legend.map(([c, t]) => (
          <span key={t} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <i style={{ width:'9px', height:'9px', borderRadius:'3px', background:c, display:'inline-block' }} />{t}
          </span>
        ))}
      </div>
      {Object.keys(D.groups).map(g => {
        const teams = M.orderGroup(g).map(r => ({ ...r, flag: flag(r.team) }));
        return <GroupStandings key={g} group={g} teams={teams} onSelect={onTeam} />;
      })}
      <div style={{ fontSize:'var(--fs-xs)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-faint)', margin:'16px 4px 8px', fontWeight:'var(--fw-bold)' }}>⏱ Upcoming fixtures — tap to preview</div>
      {dates.map(dt => fxByDate[dt].map((f, i) => (
        <MatchRow key={dt + i} date={fmtDate(dt)} homeFlag={flag(f.home)} home={shrt(f.home)} awayFlag={flag(f.away)} away={shrt(f.away)}
          right={<span style={{ color:'var(--accent-2)', fontWeight:700, fontSize:'var(--fs-2xs)' }}>PREVIEW →</span>}
          onClick={() => onMatch(f.home, f.away)} />
      )))}
    </div>
  );
}

/* ---------- Team detail ---------- */
function TeamDetail({ team, onTeam, onMatch }) {
  const row = M.teamRow[team], g = M.teamGroup[team];
  const sq = D.squads[team] || { p:[], coach:'', f:'' };
  const form = M.teamForm(team);
  const rating = M.ratingIndex(team);
  const fb = M.factorBars(team);
  const order = M.orderGroup(g);
  const posn = order.findIndex(r => r.team === team) + 1;
  const gd = M.gd(row);

  const statusTag = row.status === 'qualified'
    ? <Tag tone="qualified" style={{ fontSize:'var(--fs-xs)', padding:'3px 8px' }}>QUALIFIED ✓</Tag>
    : row.status === 'eliminated'
    ? <Tag tone="out" style={{ fontSize:'var(--fs-xs)', padding:'3px 8px' }}>ELIMINATED</Tag>
    : <Tag tone="pill">{posn}{ord(posn)} in Group {g}</Tag>;

  // team's matches (played + upcoming)
  const played = D.results.filter(m => m.home===team || m.away===team).map(m => ({ ...m, played:true }));
  const upcoming = D.fixtures.filter(m => m.home===team || m.away===team).map(m => ({ ...m, played:false }));
  const matches = [...played, ...upcoming].sort((a,b) => a.date.localeCompare(b.date));

  const byPos = { GK:[], DEF:[], MID:[], FWD:[] };
  sq.p.forEach(p => byPos[p[1]] && byPos[p[1]].push(p));

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'18px', marginBottom:'18px' }}>
        <div style={{ fontSize:'54px', lineHeight:1 }}>{flag(team)}</div>
        <div>
          <h2 style={{ margin:0, fontFamily:'var(--font-display)', fontSize:'var(--fs-hero)', fontWeight:800, display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            {team} {statusTag}
          </h2>
          <div style={{ color:'var(--text-muted)', fontSize:'var(--fs-sm)', marginTop:'3px' }}>
            Group {g} · Coach {sq.coach || '—'} · {sq.f || ''} · {sq.p.length}-man squad
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:'10px', marginBottom:'20px' }}>
        <StatCard label="FIFA World Rank" value={`#${row.rank}`} />
        <StatCard label="Ranking Points" value={Math.round(row.pts)} />
        <StatCard label="Group Record" value={`${row.W}-${row.D}-${row.L}`} unit=" W-D-L" />
        <StatCard label="Goals" value={row.GF} unit={`:${row.GA}`} />
        <StatCard label="Goal Diff" value={`${gd>0?'+':''}${gd}`} />
        <StatCard label="Points" value={row.Pts} accent="var(--accent)" />
      </div>

      <SectionHeading trailing={`${rating}/99`}>Model rating — composite strength</SectionHeading>
      <div style={{ display:'flex', alignItems:'center', gap:'18px', background:'var(--surface-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'14px 16px' }}>
        <RatingRing value={rating} />
        <div style={{ flex:1 }}>
          {Object.keys(M.FACTOR_LABEL).filter(k => k!=='val' || Math.abs(fb.val)>0.01).map(k => (
            <FactorBar key={k} label={M.FACTOR_LABEL[k]} z={fb[k]} />
          ))}
        </div>
      </div>

      {matches.length > 0 && <>
        <SectionHeading>Matches — tap to preview</SectionHeading>
        {matches.map((m, i) => {
          const home = m.home === team, opp = home ? m.away : m.home;
          let right;
          if (m.played) {
            const gf = home ? m.hs : m.as, ga = home ? m.as : m.hs, r = gf>ga?'W':gf<ga?'L':'D';
            right = <span style={{ display:'flex', alignItems:'center', gap:'7px' }}><FormPills results={[r]} size={20} /><b style={{ fontFamily:'var(--font-mono)' }}>{gf}–{ga}</b></span>;
          } else {
            const pr = M.matchProbs(team, opp);
            right = <span style={{ color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-mono)' }}>{Math.round(pr.h*100)}% win</span>;
          }
          return <MatchRow key={i} date={fmtDate(m.date)} homeFlag={home?'':flag(opp)} home={home?'vs':'@'} awayFlag={home?flag(opp):''} away={shrt(opp)} right={right} onClick={() => onMatch(m.home, m.away)} />;
        })}
      </>}

      <SectionHeading>Full squad — ⭐ = key player</SectionHeading>
      {['GK','DEF','MID','FWD'].map(pk => byPos[pk].length ? (
        <div key={pk} style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'var(--fs-xs)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-faint)', margin:'0 0 7px', fontWeight:'var(--fw-bold)' }}>{D.posLabel[pk]} · {byPos[pk].length}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(186px,1fr))', gap:'8px' }}>
            {byPos[pk].map((p, i) => {
              const [n, pos, club, age, caps, key] = p;
              return <PlayerCard key={i} lead={age} name={n} club={club} caps={caps} isKey={!!key} />;
            })}
          </div>
        </div>
      ) : null)}
    </div>
  );
}

Object.assign(window, { EmptyDetail, GroupsRail, TeamDetail, flag, shrt, fmtDate, ord });
