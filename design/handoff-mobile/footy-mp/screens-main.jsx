/* footy-mp — root tab screens: Today, Matches, Tables, Following.
   Each screen gets { nav, follows, tweaks }. */

const DSm = window.WC26VisualizerDesignSystem_b4eaf5;
const Fm = window.FMP;

/* =============== TODAY =============== */
function LiveHeroCard({ m, onOpen }) {
  const home = Fm.team(m.home), away = Fm.team(m.away);
  const comp = Fm.COMPS[m.comp];
  return (
    <div onClick={() => onOpen(m)} data-comment-anchor="live-hero" style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "13px 14px 14px", cursor: "pointer",
      boxShadow: "inset 3px 0 0 var(--status-live)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <DSm.CompetitionBadge code={comp.code} name={`${comp.name} · ${m.round}`} tone="gold" />
        <div style={{ flex: 1 }}></div>
        <span style={{ ...fmpMono, fontSize: "var(--fs-xs)", color: "var(--status-live)", fontWeight: 700 }}>
          <span className="fmp-live-dot"></span> LIVE {m.minute}′
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26 }}>{home.flag}</div>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>{home.name}</div>
        </div>
        <div style={{ ...fmpMono, fontSize: 30, fontWeight: 700, lineHeight: 1, color: "var(--status-live)" }}>
          {m.hg}–{m.ag}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26 }}>{away.flag}</div>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>{away.name}</div>
        </div>
      </div>
      {m.pred && (
        <div style={{ marginTop: 12 }}>
          <DSm.ProbabilityBar
            home={Math.round(m.pred.h * 100)} draw={Math.round(m.pred.d * 100)}
            away={100 - Math.round(m.pred.h * 100) - Math.round(m.pred.d * 100)}
            height={24}
          />
          <div style={{ ...fmpEyebrow, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            <span>pre-match · mpfc v1</span>
            <span style={{ color: "var(--accent-2)" }}>full read →</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NextMatchCard({ m, onOpen }) {
  const home = Fm.team(m.home), away = Fm.team(m.away);
  const comp = Fm.COMPS[m.comp];
  const d = new Date(m.date);
  const days = Math.round((d - Fm.NOW) / 864e5);
  const when = days <= 0 ? "TODAY" : days === 1 ? "TOMORROW" : `IN ${days} DAYS`;
  return (
    <div onClick={() => onOpen(m)} data-comment-anchor="next-match-hero" style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "12px 14px 13px", cursor: "pointer",
      boxShadow: "inset 3px 0 0 var(--follow)", marginBottom: 7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ ...fmpEyebrow, color: "var(--follow)" }}>your next match · {when}</span>
        <div style={{ flex: 1 }}></div>
        <DSm.CompetitionBadge code={comp.code} tone={comp.tone} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 24 }}>{home.flag || "⚽"}</div>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 3 }}>
            {home.name}{Fm.isFollowedTeam(m.home) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...fmpMono, fontSize: "var(--fs-h2)", fontWeight: 700 }}>{Fm.fmtTime(m.date)}</div>
          <div style={{ ...fmpEyebrow, marginTop: 2 }}>{new Date(m.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}</div>
        </div>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 24 }}>{away.flag || "⚽"}</div>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 3 }}>
            {away.name}{Fm.isFollowedTeam(m.away) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}
          </div>
        </div>
      </div>
      {m.pred && (
        <div style={{ marginTop: 10 }}>
          <DSm.ProbabilityBar
            home={Math.round(m.pred.h * 100)} draw={Math.round(m.pred.d * 100)}
            away={100 - Math.round(m.pred.h * 100) - Math.round(m.pred.d * 100)}
            height={18}
          />
          <div style={{ ...fmpEyebrow, marginTop: 5, display: "flex", justifyContent: "space-between" }}>
            <span>{m.round}</span>
            <span style={{ color: "var(--accent-2)" }}>preview →</span>
          </div>
        </div>
      )}
    </div>
  );
}

const NEWS_TONE = {
  gold: { background: "var(--follow-tint)", color: "var(--gold)" },
  follow: { background: "var(--follow-tint)", color: "var(--gold)" },
  accent: { background: "var(--ember-tint)", color: "var(--accent)" },
  neutral: { background: "var(--surface-raised)", color: "var(--text-muted)" },
};

function NewsList({ items }) {
  return (
    <div data-comment-anchor="news-list" style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", overflow: "hidden",
    }}>
      {items.map((n, i) => (
        <div key={i} style={{
          display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px",
          borderTop: i ? "1px solid var(--border-soft)" : "none",
        }}>
          <span style={{
            flex: "0 0 auto", fontSize: "var(--fs-micro)", fontWeight: 700,
            letterSpacing: "0.05em", padding: "3px 6px", borderRadius: "var(--radius-xs)",
            marginTop: 1, ...(NEWS_TONE[n.tone] || NEWS_TONE.neutral),
          }}>{n.tag}</span>
          <span style={{ flex: 1, fontSize: "var(--fs-sm)", color: "var(--text-primary)", lineHeight: "var(--lh-snug)" }}>{n.text}</span>
          <span style={{ ...fmpMono, flex: "0 0 auto", fontSize: "var(--fs-2xs)", color: "var(--text-faint)", marginTop: 2 }}>{n.time}</span>
        </div>
      ))}
    </div>
  );
}

function TodayScreen({ nav, follows, tweaks }) {
  const openMatch = (m) => nav.push({ type: "match", id: m.id });
  const live = Fm.MATCHES.filter(m => m.status === "live");
  const upcoming = Fm.upcoming().filter(m => m.status === "sched");
  const yours = upcoming.filter(m => Fm.followedMatch(m)).slice(0, 3);
  const cup = upcoming.filter(m => m.comp === "wc" && !Fm.followedMatch(m)).slice(0, 3);
  const recent = Fm.results().filter(m => Fm.followedMatch(m)).slice(0, 4);
  const ro = tweaks.rowReadout;

  return (
    <div>
      <Pad style={{ paddingTop: 12 }}>
        {/* NOW & NEXT — first thing on log-in: who plays next, when, against whom */}
        {yours.length > 0 && <NextMatchCard m={yours[0]} onOpen={openMatch} />}
        {live.map(m => <LiveHeroCard key={m.id} m={m} onOpen={openMatch} />)}

        <DSm.SectionHeading tick="var(--gold)">Next up for you</DSm.SectionHeading>
        {yours.length > 1
          ? yours.slice(1).map(m => <FixtureItem key={m.id} m={m} onOpen={openMatch} readout={ro} />)
          : yours.length === 0
            ? <EmptyState>No upcoming fixtures for anyone you follow.</EmptyState>
            : <div style={{ ...fmpEyebrow, margin: "0 2px 4px" }}>that's everything scheduled — more land after the WC final</div>}

        <DSm.SectionHeading tick="var(--accent)">News</DSm.SectionHeading>
        <NewsList items={Fm.NEWS} />

        <DSm.SectionHeading tick="var(--accent-2)"
          trailing={<span onClick={() => nav.setTab("matches")} style={{ color: "var(--accent-2)", fontSize: "var(--fs-xs)", cursor: "pointer" }}>all →</span>}>
          World Cup · knockouts
        </DSm.SectionHeading>
        {cup.map(m => <FixtureItem key={m.id} m={m} onOpen={openMatch} readout={ro} />)}

        <DSm.SectionHeading
          trailing={<span onClick={() => nav.setTab("matches")} style={{ color: "var(--accent-2)", fontSize: "var(--fs-xs)", cursor: "pointer" }}>all →</span>}>
          Just in
        </DSm.SectionHeading>
        {recent.map(m => <FixtureItem key={m.id} m={m} onOpen={openMatch} readout={ro} />)}

        <DSm.SectionHeading tick="var(--gold)">Your players at the cup</DSm.SectionHeading>
        {Fm.FOLLOWS.players.map(pid => {
          const p = Fm.PLAYERS[pid];
          return (
            <DSm.PlayerStatRow key={pid} flag={p.flag} name={p.name}
              meta={`${Fm.team(p.teamId).name} · ${p.pos}`}
              followed={follows.has("player", pid)}
              figures={[
                { value: p.wc.g, label: "G", accent: p.wc.g > 0 },
                { value: p.wc.a, label: "A" },
                { value: p.wc.mins, label: "MIN" },
              ]}
              onClick={() => nav.push({ type: "player", id: pid })}
            />
          );
        })}
        <div style={{ ...fmpEyebrow, textAlign: "center", padding: "14px 0 6px" }}>
          xG Dixon-Coles on real shot data · not betting advice
        </div>
      </Pad>
    </div>
  );
}

/* =============== MATCHES =============== */
function MatchesScreen({ nav, tweaks }) {
  const [mode, setMode] = React.useState("upcoming");
  const [comp, setComp] = React.useState("all");
  const [onlyFollowed, setOnlyFollowed] = React.useState(tweaks.followedOnly);

  const source = mode === "upcoming" ? Fm.upcoming() : Fm.results();
  const filtered = source.filter(m =>
    (comp === "all" || m.comp === comp) &&
    (!onlyFollowed || Fm.followedMatch(m) || m.status === "live")
  );
  const comps = ["all", "wc", "sa", "bl", "mx", "pt"];

  return (
    <div>
      <Pad style={{ paddingTop: 12, paddingBottom: 10 }}>
        <Segmented value={mode} onChange={setMode} options={[
          { value: "upcoming", label: "Upcoming" },
          { value: "results", label: "Results" },
        ]} />
      </Pad>
      <ChipRail>
        <Chip active={onlyFollowed} onClick={() => setOnlyFollowed(!onlyFollowed)}>★ Following</Chip>
        <span style={{ width: 1, background: "var(--border)", margin: "2px 2px", flex: "0 0 auto" }}></span>
        {comps.map(c => (
          <Chip key={c} active={comp === c} onClick={() => setComp(c)}>
            {c === "all" ? "All" : Fm.COMPS[c].name}
          </Chip>
        ))}
      </ChipRail>
      <Pad style={{ paddingTop: 10 }}>
        {filtered.length
          ? <DayGroupedFixtures matches={filtered} readout={tweaks.rowReadout}
              onOpen={(m) => nav.push({ type: "match", id: m.id })} />
          : <EmptyState>Nothing here — clear a filter.</EmptyState>}
      </Pad>
    </div>
  );
}

/* =============== TABLES =============== */
const NAME_TO_TEAM = { "Bologna": "bol", "Bayern Munich": "bay", "Juventus": "juv", "Genoa": "gen", "Hoffenheim": "hof" };

function TablesScreen({ nav, follows }) {
  const leagueIds = Object.keys(Fm.STANDINGS);
  const [lg, setLg] = React.useState("sa");
  const rows = Fm.STANDINGS[lg].map(r => ({
    ...r,
    form: r.form ? [...r.form] : [],
    followed: r.followed && follows.has("team", NAME_TO_TEAM[r.team]),
  }));
  const league = Fm.LEAGUES[lg];
  return (
    <div>
      <div style={{ paddingTop: 12 }}>
        <ChipRail>
          {leagueIds.map(id => (
            <Chip key={id} active={lg === id} onClick={() => setLg(id)}>{Fm.LEAGUES[id].name}</Chip>
          ))}
        </ChipRail>
      </div>
      <Pad style={{ paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 2px 9px" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-h2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{league.name}</span>
          <span style={{ ...fmpEyebrow }}>{league.season}</span>
          <div style={{ flex: 1 }}></div>
          <span onClick={() => nav.push({ type: "league", id: lg })}
            style={{ color: "var(--accent-2)", fontSize: "var(--fs-xs)", cursor: "pointer" }}>fixtures →</span>
        </div>
        <DSm.LeagueTable rows={rows} showForm={true}
          onSelect={(name) => { const id = NAME_TO_TEAM[name]; if (id && Fm.team(id).rating) nav.push({ type: "team", id }); }} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "10px 2px 0" }}>
          {[["var(--zone-ucl)", "UCL"], ["var(--zone-uel)", "Europa"], ["var(--zone-conf)", "Conference"], ["var(--zone-releg)", "Relegation"]].map(([c, l]) => (
            <span key={l} style={{ ...fmpEyebrow, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c }}></span>{l}
            </span>
          ))}
        </div>
        {rows.length <= 8 && (
          <div style={{ ...fmpEyebrow, margin: "10px 2px 0" }}>top 8 shown · full table lands with the FBref backfill</div>
        )}
      </Pad>
    </div>
  );
}

/* =============== FOLLOWING =============== */
function FollowingScreen({ nav, follows }) {
  const counts = [
    ["players", Fm.FOLLOWS.players.filter(id => follows.has("player", id)).length],
    ["teams", Fm.FOLLOWS.teams.filter(id => follows.has("team", id)).length],
    ["leagues", Fm.FOLLOWS.leagues.filter(id => follows.has("league", id)).length],
  ];
  const rowStyle = {
    display: "flex", alignItems: "center", gap: 9,
    background: "var(--surface-panel)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)", padding: "9px 11px", marginBottom: 6, cursor: "pointer",
  };
  return (
    <div>
      <Pad style={{ paddingTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {counts.map(([label, n]) => (
            <DSm.StatCard key={label} label={label} value={n} accent={n > 0 ? "var(--follow)" : "var(--text-faint)"} />
          ))}
        </div>

        <DSm.SectionHeading tick="var(--gold)">Players</DSm.SectionHeading>
        {Fm.FOLLOWS.players.map(pid => {
          const p = Fm.PLAYERS[pid];
          const on = follows.has("player", pid);
          return (
            <div key={pid} style={rowStyle} onClick={() => nav.push({ type: "player", id: pid })}>
              <span style={{ fontSize: 15 }}>{p.flag}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{p.name}</div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>{Fm.team(p.teamId).name} · {p.pos}</div>
              </div>
              <DSm.FollowButton following={on} label={false} onToggle={() => follows.toggle("player", pid)} />
            </div>
          );
        })}

        <DSm.SectionHeading tick="var(--gold)">Teams</DSm.SectionHeading>
        {Fm.FOLLOWS.teams.map(tid => {
          const t = Fm.team(tid);
          const on = follows.has("team", tid);
          return (
            <div key={tid} style={rowStyle} onClick={() => nav.push({ type: "team", id: tid })}>
              <span style={{ fontSize: 15 }}>{t.flag || "⚽"}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{t.name}</div>
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>
                  {t.national ? "National team" : Fm.LEAGUES[t.leagueId] ? Fm.LEAGUES[t.leagueId].name : t.country}
                </div>
              </div>
              <DSm.FollowButton following={on} label={false} onToggle={() => follows.toggle("team", tid)} />
            </div>
          );
        })}

        <DSm.SectionHeading tick="var(--gold)">Leagues</DSm.SectionHeading>
        {Fm.FOLLOWS.leagues.map(lid => {
          const l = Fm.LEAGUES[lid] || { name: Fm.COMPS[lid] ? Fm.COMPS[lid].name : lid };
          const on = follows.has("league", lid);
          return (
            <div key={lid} style={rowStyle}
              onClick={() => Fm.STANDINGS[lid] ? nav.push({ type: "league", id: lid }) : null}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{l.name}</div>
                {l.season && <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>{l.season}</div>}
              </div>
              <DSm.FollowButton following={on} label={false} onToggle={() => follows.toggle("league", lid)} />
            </div>
          );
        })}
        <div style={{ height: 8 }}></div>
      </Pad>
    </div>
  );
}

Object.assign(window, { TodayScreen, MatchesScreen, TablesScreen, FollowingScreen, NAME_TO_TEAM });
