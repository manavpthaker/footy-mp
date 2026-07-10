/* footy-mp — pushed detail screens: Match, Team, Player, League. */

const DSd = window.WC26VisualizerDesignSystem_b4eaf5;
const Fd = window.FMP;

/* =============== MATCH =============== */
function verdictLine(m) {
  if (m.status !== "final" || !m.pred) return null;
  const { h, d, a } = m.pred;
  const fav = h >= a && h >= d ? "home" : a >= h && a >= d ? "away" : "draw";
  const winner = m.pens ? (m.pens[0] > m.pens[1] ? "home" : "away")
    : m.hg > m.ag ? "home" : m.ag > m.hg ? "away" : "draw";
  const favP = Math.round(Math.max(h, d, a) * 100);
  if (fav === winner) return `Model favorite landed — priced ${favP}% pre-kick.`;
  const winP = Math.round((winner === "home" ? h : winner === "away" ? a : d) * 100);
  return `Upset by the model's book — the winner carried just ${winP}% pre-kick.`;
}

function MatchScreen({ id, nav }) {
  const m = Fd.matchById(id);
  if (!m) return <Pad style={{ paddingTop: 20 }}><EmptyState>Match not found.</EmptyState></Pad>;
  const home = Fd.team(m.home), away = Fd.team(m.away);
  const comp = Fd.COMPS[m.comp];
  const isFinal = m.status === "final", isLive = m.status === "live";
  const kick = new Date(m.date);
  const verdict = verdictLine(m);

  const hero = (t, tid) => (
    <div onClick={() => t && t.rating && nav.push({ type: "team", id: tid })}
      style={{ textAlign: "center", cursor: t && t.rating ? "pointer" : "default", minWidth: 0 }}>
      <div style={{ fontSize: 30 }}>{t ? (t.flag || "⚽") : "—"}</div>
      <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 4 }}>
        {t ? t.name : "TBD"}
        {Fd.isFollowedTeam(tid) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}
      </div>
    </div>
  );

  return (
    <div>
      <ScreenHeader onBack={nav.pop} eyebrow={`${comp.name} · ${m.round}`}
        title={`${home ? home.short || home.name : "TBD"} v ${away ? away.short || away.name : "TBD"}`} />
      <Pad style={{ paddingTop: 14 }}>
        {/* scoreboard */}
        <div data-comment-anchor="match-scoreboard" style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8,
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-2xl)", padding: "16px 12px",
          boxShadow: isLive ? "inset 3px 0 0 var(--status-live)" : "none",
        }}>
          {hero(home, m.home)}
          <div style={{ textAlign: "center" }}>
            <div style={{ ...fmpMono, fontSize: 32, fontWeight: 700, lineHeight: 1, color: isLive ? "var(--status-live)" : "var(--text-primary)" }}>
              {isFinal || isLive ? `${m.hg}–${m.ag}` : "vs"}
            </div>
            {m.pens && <div style={{ ...fmpMono, fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 4 }}>{m.pens[0]}–{m.pens[1]} pens</div>}
            <div style={{ ...fmpEyebrow, marginTop: 6 }}>
              {isLive ? <span style={{ color: "var(--status-live)" }}><span className="fmp-live-dot"></span> {m.minute}′</span>
                : isFinal ? "FULL TIME"
                : kick.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + Fd.fmtTime(m.date)}
            </div>
          </div>
          {hero(away, m.away)}
        </div>

        {m.pred && (
          <div>
            <DSd.SectionHeading tick="var(--accent-2)">
              {isFinal ? "What the model expected" : "Pre-match forecast"}
            </DSd.SectionHeading>
            <DSd.ProbabilityBar
              home={Math.round(m.pred.h * 100)} draw={Math.round(m.pred.d * 100)}
              away={100 - Math.round(m.pred.h * 100) - Math.round(m.pred.d * 100)}
              homeLabel={home && home.short} awayLabel={away && away.short} height={30}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              <DSd.StatCard label="expected goals" value={`${m.pred.hxg.toFixed(2)}–${m.pred.axg.toFixed(2)}`} />
              <DSd.StatCard label="model" value="v1" unit=" · xG Dixon-Coles" />
            </div>
            {verdict && (
              <div style={{
                marginTop: 10, padding: "10px 12px", borderLeft: "3px solid var(--accent)",
                background: "var(--surface-tint)", borderRadius: "var(--radius-md)",
                fontSize: "var(--fs-sm)", color: "var(--text-muted)",
              }}>{verdict}</div>
            )}

            <DSd.SectionHeading>Scoreline odds</DSd.SectionHeading>
            <div style={{
              background: "var(--surface-panel)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: 12,
            }}>
              <DSd.ScorelineGrid
                home={home ? home.short || home.name : "H"} away={away ? away.short || away.name : "A"}
                matrix={Fd.poissonMatrix(m.pred.hxg, m.pred.axg, 5)}
              />
            </div>
          </div>
        )}

        {home && away && home.form && away.form && (
          <div>
            <DSd.SectionHeading tick="var(--gold)">Form · last 5</DSd.SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[[home, m.home], [away, m.away]].map(([t, tid]) => (
                <div key={tid} style={{
                  background: "var(--surface-panel)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "10px 12px",
                }}>
                  <div style={{ ...fmpEyebrow, marginBottom: 7 }}>{t.flag || ""} {t.short || t.name}</div>
                  <DSd.FormPills results={t.form} size={20} />
                </div>
              ))}
            </div>
          </div>
        )}

        {home && away && home.factors && away.factors && (
          <div>
            <DSd.SectionHeading>What drives the forecast</DSd.SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[home, away].map((t, i) => (
                <div key={i} style={{
                  background: "var(--surface-panel)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "10px 10px 6px",
                }}>
                  <div style={{ ...fmpEyebrow, marginBottom: 8 }}>{t.short || t.name}</div>
                  {t.factors.map(f => <DSd.FactorBar key={f.label} label={f.label} z={f.z} />)}
                </div>
              ))}
            </div>
            <div style={{ ...fmpEyebrow, margin: "8px 2px 0" }}>
              z-scores vs field average · availability ramps in over first games
            </div>
          </div>
        )}
        <div style={{ height: 16 }}></div>
      </Pad>
    </div>
  );
}

/* =============== TEAM =============== */
function TeamScreen({ id, nav, follows, tweaks }) {
  const t = Fd.team(id);
  if (!t) return null;
  const [tab, setTab] = React.useState("matches");
  const all = Fd.matchesForTeam(id);
  const upcoming = all.filter(m => m.status !== "final").sort((a, b) => new Date(a.date) - new Date(b.date));
  const results = all.filter(m => m.status === "final").sort((a, b) => new Date(b.date) - new Date(a.date));
  const squad = (Fd.SQUADS[id] || []).map(pid => ({ pid, p: Fd.PLAYERS[pid] }));
  const league = t.leagueId && Fd.LEAGUES[t.leagueId];

  return (
    <div>
      <ScreenHeader onBack={nav.pop} eyebrow={t.national ? "National team" : league ? league.name : t.country}
        title={<span>{t.flag ? t.flag + " " : ""}{t.name}</span>}
        right={<DSd.FollowButton following={follows.has("team", id)} onToggle={() => follows.toggle("team", id)} />} />
      <Pad style={{ paddingTop: 14 }}>
        {t.rating && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-2xl)", padding: "13px 14px",
          }}>
            <DSd.RatingRing value={t.rating.ovr} size={62} label="rating" />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <DSd.StatCard label="attack · xG/90" value={t.rating.att.toFixed(2)} accent="var(--accent)" style={{ padding: "9px 11px" }} />
              <DSd.StatCard label="defense · xGA/90" value={t.rating.def.toFixed(2)} accent="var(--accent-2)" style={{ padding: "9px 11px" }} />
            </div>
          </div>
        )}

        {t.form && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 2px 0" }}>
            <span style={fmpEyebrow}>form</span>
            <DSd.FormPills results={t.form} size={20} />
          </div>
        )}

        <div style={{ margin: "14px 0 10px" }}>
          <Segmented value={tab} onChange={setTab} options={[
            { value: "matches", label: "Matches" },
            { value: "squad", label: `Squad${squad.length ? " · " + squad.length : ""}` },
            { value: "model", label: "Model" },
          ]} />
        </div>

        {tab === "matches" && (
          <div>
            {upcoming.length > 0 && <>
              <div style={{ ...fmpEyebrow, margin: "2px 2px 7px" }}>next up</div>
              {upcoming.map(m => <FixtureItem key={m.id} m={m} readout={tweaks.rowReadout} onOpen={(x) => nav.push({ type: "match", id: x.id })} />)}
            </>}
            <div style={{ ...fmpEyebrow, margin: "10px 2px 7px" }}>results</div>
            {results.length
              ? results.map(m => <FixtureItem key={m.id} m={m} onOpen={(x) => nav.push({ type: "match", id: x.id })} />)
              : <EmptyState>No recorded results.</EmptyState>}
          </div>
        )}

        {tab === "squad" && (
          squad.length ? squad.map(({ pid, p }) => (
            <DSd.PlayerCard key={pid} lead={p.age} name={<span>{p.name}{follows.has("player", pid) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}</span>}
              club={`${p.pos} · ${p.country}`} isKey={p.key}
              onClick={() => nav.push({ type: "player", id: pid })}
              style={{ marginBottom: 7 }} />
          )) : <EmptyState>Squad lands with the FBref backfill.</EmptyState>
        )}

        {tab === "model" && (
          t.factors ? (
            <div style={{
              background: "var(--surface-panel)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "12px 12px 6px",
            }}>
              <div style={{ ...fmpEyebrow, marginBottom: 9 }}>what drives the rating</div>
              {t.factors.map(f => <DSd.FactorBar key={f.label} label={f.label} z={f.z} />)}
              <div style={{ ...fmpEyebrow, margin: "6px 0 8px", letterSpacing: "0.06em" }}>
                recency-weighted xG for/against · fitted home edge · availability
              </div>
            </div>
          ) : <EmptyState>No model rating yet for this team.</EmptyState>
        )}
        <div style={{ height: 16 }}></div>
      </Pad>
    </div>
  );
}

/* =============== PLAYER =============== */
function PlayerScreen({ id, nav, follows }) {
  const p = Fd.PLAYERS[id];
  if (!p) return null;
  const club = Fd.team(p.teamId);
  return (
    <div>
      <ScreenHeader onBack={nav.pop} eyebrow={`${p.pos} · ${p.country}`}
        title={<span>{p.flag} {p.name}</span>}
        right={<DSd.FollowButton following={follows.has("player", id)} onToggle={() => follows.toggle("player", id)} />} />
      <Pad style={{ paddingTop: 14 }}>
        <div onClick={() => club && club.rating && nav.push({ type: "team", id: p.teamId })} style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "11px 13px",
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={fmpEyebrow}>club</div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-h2)", marginTop: 2 }}>{club ? club.name : "—"}</div>
          </div>
          <span style={{ color: "var(--accent-2)", fontSize: 16 }}>›</span>
        </div>

        <DSd.SectionHeading tick="var(--gold)">World Cup 2026</DSd.SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          <DSd.StatCard label="goals" value={p.wc.g} accent={p.wc.g > 0 ? "var(--accent)" : "var(--text-primary)"} style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="assists" value={p.wc.a} style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="xG" value={p.wc.xg.toFixed(1)} style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="mins" value={p.wc.mins} style={{ padding: "10px 11px" }} />
        </div>

        <DSd.SectionHeading tick="var(--accent-2)">{p.season.comp}</DSd.SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          <DSd.StatCard label="G+A" value={p.season.g + p.season.a} accent="var(--accent)" style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="xG" value={p.season.xg.toFixed(1)} style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="xA" value={p.season.xa.toFixed(1)} style={{ padding: "10px 11px" }} />
          <DSd.StatCard label="mins" value={p.season.mins} style={{ padding: "10px 11px" }} />
        </div>

        {p.log.length > 0 && (
          <div>
            <DSd.SectionHeading>Match log · World Cup</DSd.SectionHeading>
            {p.log.map((l, i) => (
              <DSd.PlayerStatRow key={i} name={l.opp} meta={l.comp}
                figures={[
                  { value: `${l.min}′`, label: "MIN" },
                  { value: l.g, label: "G", accent: l.g > 0 },
                  { value: l.xg.toFixed(1), label: "XG" },
                ]} />
            ))}
          </div>
        )}
        <div style={{ height: 16 }}></div>
      </Pad>
    </div>
  );
}

/* =============== LEAGUE =============== */
function LeagueScreen({ id, nav, follows, tweaks }) {
  const league = Fd.LEAGUES[id];
  if (!league) return null;
  const rows = (Fd.STANDINGS[id] || []).map(r => ({
    ...r, form: r.form ? [...r.form] : [],
    followed: r.followed && follows.has("team", window.NAME_TO_TEAM[r.team]),
  }));
  const matches = Fd.MATCHES.filter(m => m.comp === id);
  const upcoming = matches.filter(m => m.status !== "final");
  const results = matches.filter(m => m.status === "final");
  return (
    <div>
      <ScreenHeader onBack={nav.pop} eyebrow={league.season} title={league.name}
        right={<DSd.FollowButton following={follows.has("league", id)} onToggle={() => follows.toggle("league", id)} />} />
      <Pad style={{ paddingTop: 14 }}>
        {upcoming.length > 0 && <>
          <div style={{ ...fmpEyebrow, margin: "0 2px 7px" }}>fixtures</div>
          {upcoming.map(m => <FixtureItem key={m.id} m={m} showComp={false} readout={tweaks.rowReadout} onOpen={(x) => nav.push({ type: "match", id: x.id })} />)}
        </>}
        {results.length > 0 && <>
          <div style={{ ...fmpEyebrow, margin: "6px 2px 7px" }}>latest</div>
          {results.map(m => <FixtureItem key={m.id} m={m} showComp={false} onOpen={(x) => nav.push({ type: "match", id: x.id })} />)}
        </>}
        {rows.length > 0 && <>
          <DSd.SectionHeading>Standings</DSd.SectionHeading>
          <DSd.LeagueTable rows={rows} showForm={false}
            onSelect={(name) => { const tid = window.NAME_TO_TEAM[name]; if (tid && Fd.team(tid).rating) nav.push({ type: "team", id: tid }); }} />
        </>}
        <div style={{ height: 16 }}></div>
      </Pad>
    </div>
  );
}

Object.assign(window, { MatchScreen, TeamScreen, PlayerScreen, LeagueScreen });
