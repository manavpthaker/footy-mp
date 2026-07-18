import React from "react";
import Link from "next/link";
import { Pad, EmptyState, eyebrow, mono } from "@/components/mobile/primitives";
import { FixtureItem } from "@/components/mobile/FixtureItem";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { ProbabilityBar } from "@/components/ds";
// @ts-ignore
import { CompetitionBadge } from "@/components/ds";
// @ts-ignore
import { PlayerStatRow } from "@/components/ds";
import {
  loadFollowedEntities, upcomingForTeams, recentResultsForTeams,
  liveMatches, upcomingAll, resultsAll, MODEL_VERSION,
  seasonTotalsForPlayers, countriesByIds, recentMovements, nextUpByCompetition,
} from "@/lib/data";
import { flagFor, competitionCode, competitionTone, isPlaceholderTeam } from "@/lib/format";
import type { RichMatch, PlayerAgg, RichMovement, CompetitionNext } from "@/lib/data";
import type { Player, Country } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TodayScreen() {
  const { players, teams } = await loadFollowedEntities();
  const followedTeamIds = new Set<number>(teams.map(t => t.id));
  players.forEach(p => p.team_id && followedTeamIds.add(p.team_id));

  const [live, allUpcoming, yoursUpcoming, yoursResults, allRecent, playerTotals, playerCountries, moves, nextUp] = await Promise.all([
    liveMatches(),
    upcomingAll(60),
    upcomingForTeams(Array.from(followedTeamIds), 20),
    recentResultsForTeams(Array.from(followedTeamIds), 6),
    resultsAll(30),
    seasonTotalsForPlayers(players.map(p => p.id)),
    countriesByIds(players.map(p => p.country_id).filter((x): x is number => x != null)),
    recentMovements(6),
    nextUpByCompetition(),
  ]);
  const intlNext = nextUp.filter(n =>
    ["tournament", "qualifiers"].includes(n.league.format ?? (n.league.is_international ? "tournament" : ""))
  ).slice(0, 4);
  const yours = yoursUpcoming.filter(m => m.status === "scheduled");

  // Hero: your next match if you have one; otherwise the next real fixture
  // anywhere we track — the page never leads with an empty box.
  const heroFollowed = yours.length > 0;
  const hero = yours[0] ?? allUpcoming.find(m =>
    m.status === "scheduled"
    && !isPlaceholderTeam(m.home_team?.name) && !isPlaceholderTeam(m.away_team?.name)) ?? null;

  const wcKnockout = allUpcoming
    .filter(m => m.league?.name === "World Cup" && !isFollowed(m, followedTeamIds)
      && m.id !== hero?.id)
    .slice(0, 3);

  // "Just in" means RECENT: results from the last 72h across everything we
  // track, followed teams first — not weeks-old games from the watchlist.
  const cutoff = Date.now() - 72 * 3600_000;
  const recent = allRecent
    .filter(r => new Date(r.kickoff_utc).getTime() >= cutoff)
    .sort((a, b) =>
      Number(isFollowed(b, followedTeamIds)) - Number(isFollowed(a, followedTeamIds))
      || +new Date(b.kickoff_utc) - +new Date(a.kickoff_utc))
    .slice(0, 4);
  const justIn = recent.length ? recent : yoursResults.slice(0, 4);

  return (
    <div>
      
      <Pad style={{ paddingTop: 12 }}>
        <div className="">
          {/* Left / main column: hero + your matches */}
          <div>
            {live.map(m => <LiveHeroCard key={m.id} m={m} />)}
            {hero && <NextMatchCard m={hero} followedTeamIds={followedTeamIds} followed={heroFollowed} />}

            <SectionHeading tick="var(--gold)">Next up for you</SectionHeading>
            {yours.length > 1
              ? yours.slice(1, 5).map(m => (
                  <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />
                ))
              : <div style={{ ...eyebrow, margin: "0 2px 4px" }}>
                  {yours.length === 0
                    ? "nobody you follow plays soon — the wider calendar below"
                    : "that's everything scheduled for your list right now"}
                </div>}

            {justIn.length > 0 && (
              <>
                <SectionHeading
                  trailing={<Link href="/matches" style={{
                    color: "var(--accent-2)", fontSize: "var(--fs-xs)",
                  }}>all →</Link>}
                >Just in</SectionHeading>
                {justIn.map(m => (
                  <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />
                ))}
              </>
            )}
          </div>

          {/* Right / sidebar column: cup + players */}
          <div>
            {wcKnockout.length > 0 && (
              <>
                <SectionHeading
                  tick="var(--accent-2)"
                  trailing={<Link href="/matches" style={{
                    color: "var(--accent-2)", fontSize: "var(--fs-xs)",
                  }}>all →</Link>}
                >World Cup · knockouts</SectionHeading>
                {wcKnockout.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
              </>
            )}

            {players.length > 0 && (
              <>
                <SectionHeading tick="var(--gold)">Your players</SectionHeading>
                {players.map(p => (
                  <PlayerRow key={p.id} p={p}
                    agg={playerTotals[p.id] ?? null}
                    country={p.country_id ? playerCountries[p.country_id] ?? null : null} />
                ))}
              </>
            )}

            <SectionHeading tick="var(--gold)"
              trailing={<Link href="/map" style={{
                color: "var(--accent-2)", fontSize: "var(--fs-xs)",
              }}>the map →</Link>}
            >Road to 2030</SectionHeading>
            {intlNext.length > 0 ? intlNext.map(n => <NextCompRow key={n.league.id} n={n} />) : (
              <div style={{ ...eyebrow, margin: "0 2px 8px" }}>
                no international dates on the books yet — qualifiers land here as
                federations schedule them
              </div>
            )}
            <Link href="/map" style={{
              display: "block", textDecoration: "none", color: "inherit",
              background: "var(--surface-tint)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "9px 12px", marginBottom: 7,
              fontSize: "var(--fs-xs)", lineHeight: 1.55,
            }}>
              <b>New to the sport&apos;s plumbing?</b>{" "}
              <span style={{ color: "var(--text-muted)" }}>
                The Map explains how leagues, cups, clubs and national teams fit
                together — and the 4-year road from this World Cup to 2030.
              </span>
            </Link>

            {moves.length > 0 && (
              <>
                <SectionHeading tick="var(--accent-2)">Movement</SectionHeading>
                {moves.map(mv => <MovementRow key={mv.id} mv={mv} />)}
              </>
            )}
          </div>
        </div>

        <div style={{
          ...eyebrow, textAlign: "center", padding: "14px 0 6px",
        }}>xG Dixon-Coles on real shot data · not betting advice</div>
      </Pad>
    </div>
  );
}

function isFollowed(m: RichMatch, ids: Set<number>) {
  return ids.has(m.home_team_id) || ids.has(m.away_team_id);
}

/* ============ Hero cards ============ */

function NextMatchCard({ m, followedTeamIds, followed = true }: {
  m: RichMatch; followedTeamIds: Set<number>; followed?: boolean;
}) {
  const kick = new Date(m.kickoff_utc);
  const now = new Date();
  const days = Math.round((kick.getTime() - now.getTime()) / 864e5);
  const when = days <= 0 ? "TODAY" : days === 1 ? "TOMORROW" : `IN ${days} DAYS`;
  const home = m.home_team; const away = m.away_team;
  const comp = m.league?.name ?? "";
  const pred = m.prediction;
  const railColor = followed ? "var(--follow)" : "var(--accent-2)";
  return (
    <Link href={`/matches/${m.id}`} style={{
      display: "block", textDecoration: "none", color: "inherit",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "12px 14px 13px",
      boxShadow: `inset 3px 0 0 ${railColor}`, marginBottom: 7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ ...eyebrow, color: railColor }}>
          {followed ? "your next match" : "the big one"} · {when}
        </span>
        <div style={{ flex: 1 }} />
        {comp && <CompetitionBadge code={competitionCode(comp)} tone={competitionTone(comp)} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <TeamCol name={home?.name ?? "TBD"} teamId={m.home_team_id} followedTeamIds={followedTeamIds} />
        <div style={{ textAlign: "center" }}>
          <div style={{
            ...mono, fontSize: "var(--fs-h2)", fontWeight: 700,
          }}>{kick.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</div>
          <div style={{ ...eyebrow, marginTop: 2 }}>
            {kick.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </div>
        </div>
        <TeamCol name={away?.name ?? "TBD"} teamId={m.away_team_id} followedTeamIds={followedTeamIds} />
      </div>
      {pred && pred.p_home != null && (
        <div style={{ marginTop: 10 }}>
          <ProbabilityBar
            home={Math.round(Number(pred.p_home) * 100)}
            draw={Math.round(Number(pred.p_draw ?? 0) * 100)}
            away={100 - Math.round(Number(pred.p_home) * 100) - Math.round(Number(pred.p_draw ?? 0) * 100)}
            height={18}
          />
          <div style={{
            ...eyebrow, marginTop: 5, display: "flex", justifyContent: "space-between",
          }}>
            <span>{comp}</span>
            <span style={{ color: "var(--accent-2)" }}>preview →</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function LiveHeroCard({ m }: { m: RichMatch }) {
  const home = m.home_team; const away = m.away_team;
  const comp = m.league?.name ?? "";
  const pred = m.prediction;
  return (
    <Link href={`/matches/${m.id}`} style={{
      display: "block", textDecoration: "none", color: "inherit",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-2xl)", padding: "13px 14px 14px",
      boxShadow: "inset 3px 0 0 var(--status-live)", marginBottom: 7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {comp && <CompetitionBadge code={competitionCode(comp)} name={comp} tone="gold" />}
        <div style={{ flex: 1 }} />
        <span style={{
          ...mono, fontSize: "var(--fs-xs)",
          color: "var(--status-live)", fontWeight: 700,
        }}>● LIVE {m.minute ?? 0}′</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
        <TeamHero name={home?.name ?? "TBD"} />
        <div style={{
          ...mono, fontSize: 30, fontWeight: 700, lineHeight: 1, color: "var(--status-live)",
        }}>{m.home_goals ?? 0}–{m.away_goals ?? 0}</div>
        <TeamHero name={away?.name ?? "TBD"} />
      </div>
      {pred && pred.p_home != null && (
        <div style={{ marginTop: 12 }}>
          <ProbabilityBar
            home={Math.round(Number(pred.p_home) * 100)}
            draw={Math.round(Number(pred.p_draw ?? 0) * 100)}
            away={100 - Math.round(Number(pred.p_home) * 100) - Math.round(Number(pred.p_draw ?? 0) * 100)}
            height={24}
          />
          <div style={{
            ...eyebrow, marginTop: 6, display: "flex", justifyContent: "space-between",
          }}>
            <span>pre-match · mpfc {MODEL_VERSION.replace("footy-mp-", "")}</span>
            <span style={{ color: "var(--accent-2)" }}>full read →</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function TeamCol({ name, teamId, followedTeamIds }: {
  name: string; teamId: number; followedTeamIds: Set<number>;
}) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 24 }}>{flagFor(name)}</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 3,
      }}>{name}
        {followedTeamIds.has(teamId) && <span style={{ color: "var(--follow)", marginLeft: 4 }}>★</span>}
      </div>
    </div>
  );
}

function TeamHero({ name }: { name: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26 }}>{flagFor(name)}</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3,
      }}>{name}</div>
    </div>
  );
}

function NextCompRow({ n }: { n: CompetitionNext }) {
  const kick = new Date(n.next.kickoff_utc);
  return (
    <Link href={`/leagues/${n.league.id}`} style={{
      display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
      color: "inherit", background: "var(--surface-panel)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      padding: "8px 11px", marginBottom: 6,
    }}>
      <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--gold)", minWidth: 34 }}>
        {competitionCode(n.league.name)}
      </span>
      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", flex: 1, minWidth: 0 }}>
        {n.league.name}
      </span>
      <span style={eyebrow}>
        {kick.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </span>
    </Link>
  );
}

function MovementRow({ mv }: { mv: RichMovement }) {
  const when = new Date(mv.noticed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const isTransfer = mv.kind === "transfer";
  const subjectHref = isTransfer && mv.player ? `/players/${mv.player.id}`
    : mv.moved_team ? `/teams/${mv.moved_team.id}` : null;
  const subject = isTransfer ? mv.player?.name ?? "Player" : mv.moved_team?.name ?? "Club";
  const fromTo = isTransfer
    ? `${mv.from_team?.name ?? "?"} → ${mv.to_team?.name ?? "?"}`
    : `${mv.from_league?.name ?? "?"} → ${mv.to_league?.name ?? "?"}`;
  const body = (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 8,
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "8px 11px", marginBottom: 6,
    }}>
      <span style={{ fontSize: 13 }}>{isTransfer ? "⇄" : "↕"}</span>
      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{subject}</span>
      <span style={{
        fontSize: "var(--fs-xs)", color: "var(--text-muted)", flex: 1,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{fromTo}</span>
      <span style={eyebrow}>{when}</span>
    </div>
  );
  return subjectHref
    ? <Link href={subjectHref} style={{ textDecoration: "none", color: "inherit", display: "block" }}>{body}</Link>
    : body;
}

function PlayerRow({ p, agg, country }: { p: Player; agg: PlayerAgg | null; country: Country | null }) {
  return (
    <Link href={`/players/${p.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <PlayerStatRow
        flag={flagFor(country?.name, country?.fifa_code)}
        name={p.name}
        meta={p.position ?? "—"}
        followed={true}
        figures={[
          { value: agg ? String(agg.goals) : "—", label: "G" },
          { value: agg ? String(agg.assists) : "—", label: "A" },
          { value: agg ? String(agg.minutes) : "—", label: "MIN" },
        ]}
      />
    </Link>
  );
}
