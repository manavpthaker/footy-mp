import React from "react";
import Link from "next/link";
import { Pad, EmptyState, eyebrow, mono } from "@/components/mobile/primitives";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { DataFreshness } from "@/components/mobile/DataFreshness";
import { AskAbout } from "@/components/search/AskAbout";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { ProbabilityBar } from "@/components/ds";
// @ts-ignore
import { CompetitionBadge } from "@/components/ds";
// @ts-ignore
import { PlayerStatRow } from "@/components/ds";
import {
  loadFollowedEntities, upcomingForTeams,
  liveMatches, upcomingAll, resultsAll, MODEL_VERSION,
  seasonTotalsForPlayers, countriesByIds, recentMovements, nextUpByCompetition,
} from "@/lib/data";
import { flagFor, competitionCode, competitionTone, isPlaceholderTeam } from "@/lib/format";
import type { RichMatch, PlayerAgg, RichMovement, CompetitionNext } from "@/lib/data";
import type { Player, Country } from "@/lib/supabase";
import { generalFootballNews } from "@/lib/news";
import type { NewsItem } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function TodayScreen() {
  const { players, teams } = await loadFollowedEntities();
  const followedTeamIds = new Set<number>(teams.map(t => t.id));
  players.forEach(p => p.team_id && followedTeamIds.add(p.team_id));

  const [live, allUpcoming, yoursUpcoming, allRecent, playerTotals, playerCountries, moves, nextUp, news] = await Promise.all([
    liveMatches(),
    upcomingAll(60),
    upcomingForTeams(Array.from(followedTeamIds), 20),
    resultsAll(30),
    seasonTotalsForPlayers(players.map(p => p.id)),
    countriesByIds(players.map(p => p.country_id).filter((x): x is number => x != null)),
    recentMovements(6),
    nextUpByCompetition(),
    generalFootballNews(3),
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
  const playersWithStats = players.filter(p => playerTotals[p.id]);
  const newestUpdatedAt = newestTimestamp([...live, ...allUpcoming, ...allRecent].map(m => m.updated_at));
  const stories = buildBriefStories({ live, hero, recent, news, moves, intlNext });

  return (
    <div>
      <Pad style={{ paddingTop: 12 }}>
        <WorldBrief stories={stories} />
        <DataFreshness
          updatedAt={newestUpdatedAt}
          upcomingCount={allUpcoming.length}
          latestResultAt={allRecent[0]?.kickoff_utc}
        />
        <WorldPulse nextUp={nextUp} moves={moves} />

        <SectionHeading tick="var(--accent-2)"
          trailing={<Link href="/matches" style={{ color: "var(--accent-2)", fontSize: "var(--fs-xs)" }}>
            all matches →
          </Link>}
        >Matches to watch</SectionHeading>
        {live.map(m => <LiveHeroCard key={m.id} m={m} />)}
        {hero && <NextMatchCard m={hero} followedTeamIds={followedTeamIds} followed={heroFollowed} />}
        {!live.length && !hero && (
          <EmptyState>No future fixtures are loaded. Results and competition context remain available below.</EmptyState>
        )}
        {yours.slice(heroFollowed ? 1 : 0, 4).map(m => (
          <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />
        ))}

        {recent.length > 0 && (
          <>
            <SectionHeading>Latest results</SectionHeading>
            {recent.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
          </>
        )}

        {wcKnockout.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">World Cup · knockouts</SectionHeading>
            {wcKnockout.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedTeamIds} />)}
          </>
        )}

        {playersWithStats.length > 0 && (
          <>
            <SectionHeading tick="var(--follow)">Your players</SectionHeading>
            {playersWithStats.map(p => (
              <PlayerRow key={p.id} p={p}
                agg={playerTotals[p.id]}
                country={p.country_id ? playerCountries[p.country_id] ?? null : null} />
            ))}
          </>
        )}

        <SectionHeading tick="var(--gold)"
          trailing={<Link href="/map#road-to-2030" style={{
            color: "var(--accent-2)", fontSize: "var(--fs-xs)",
          }}>open guide →</Link>}
        >Road to 2030</SectionHeading>
        {intlNext.length > 0 ? intlNext.map(n => <NextCompRow key={n.league.id} n={n} />) : (
          <div style={{
            color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.55,
            padding: "0 2px 8px",
          }}>
            No international dates are loaded yet. The Guide explains what happens
            between windows and how qualification leads to 2030.
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Link href="/map" style={{
            padding: "8px 11px", borderRadius: "var(--radius-md)",
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            color: "var(--accent-2)", fontSize: "var(--fs-xs)", fontWeight: 700,
          }}>How football fits together →</Link>
          <AskAbout question="What is happening in world football right now, why does it matter, and what should I follow next?" />
        </div>

        {moves.length > 0 && (
          <>
            <SectionHeading tick="var(--accent-2)">Player and club movement</SectionHeading>
            {moves.map(mv => <MovementRow key={mv.id} mv={mv} />)}
          </>
        )}

        <div style={{
          ...eyebrow, textAlign: "center", padding: "14px 0 6px",
        }}>Model details are available after the story · not betting advice</div>
      </Pad>
    </div>
  );
}

interface BriefStory {
  label: string;
  title: string;
  why: string;
  next: string;
  href: string;
  external?: boolean;
  color: string;
}

function WorldBrief({ stories }: { stories: BriefStory[] }) {
  return (
    <section aria-labelledby="world-brief-title" style={{ marginBottom: 14 }}>
      <div style={{ ...eyebrow, color: "var(--accent)" }}>Your 5-minute orientation</div>
      <h1 id="world-brief-title" style={{
        margin: "5px 0 7px", fontSize: 24, lineHeight: 1.15, letterSpacing: 0,
      }}>The world of football, today.</h1>
      <p style={{
        margin: "0 0 13px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.55,
      }}>Start with what matters. Each story tells you why it belongs in the bigger picture and where to go next.</p>
      <div style={{ display: "grid", gap: 7 }}>
        {stories.map((story, index) => {
          const body = (
            <>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: story.color,
                fontWeight: 700,
              }}>{String(index + 1).padStart(2, "0")} · {story.label}</div>
              <div style={{ fontSize: "var(--fs-h2)", fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>
                {story.title}
              </div>
              <div style={{ marginTop: 5, fontSize: "var(--fs-sm)", lineHeight: 1.55, color: "var(--text-muted)" }}>
                <b style={{ color: "var(--text-primary)" }}>Why it matters:</b> {story.why}
              </div>
              <div style={{ marginTop: 6, color: story.color, fontSize: "var(--fs-xs)", fontWeight: 700 }}>
                {story.next} →
              </div>
            </>
          );
          const style: React.CSSProperties = {
            display: "block", padding: "11px 12px", color: "inherit", textDecoration: "none",
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderLeft: `3px solid ${story.color}`, borderRadius: "var(--radius-md)",
          };
          return story.external
            ? <a key={`${story.label}-${story.href}`} href={story.href} target="_blank" rel="noreferrer" style={style}>{body}</a>
            : <Link key={`${story.label}-${story.href}`} href={story.href} style={style}>{body}</Link>;
        })}
      </div>
      <div style={{ textAlign: "right", marginTop: 8 }}>
        <Link href="/news" style={{ color: "var(--accent-2)", fontSize: "var(--fs-xs)", fontWeight: 700 }}>
          Open the full news wire →
        </Link>
      </div>
    </section>
  );
}

function WorldPulse({ nextUp, moves }: { nextUp: CompetitionNext[]; moves: RichMovement[] }) {
  const nextFor = (formats: string[]) => nextUp.find(n => formats.includes(n.league.format ?? ""));
  const items = [
    ["Club leagues", nextFor(["league"]), "/tables", "var(--accent-2)"],
    ["Continental cups", nextFor(["cup"]), "/map#competitions", "var(--accent)"],
    ["National teams", nextFor(["qualifiers", "tournament", "friendly"]), "/map#national-teams", "var(--gold)"],
  ] as const;
  return (
    <section aria-label="State of the football world">
      <div style={{ ...eyebrow, marginBottom: 7 }}>The world at a glance</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
        {items.map(([label, item, href, color]) => (
          <Link key={label} href={href} style={{
            minHeight: 74, padding: "9px 10px", background: "var(--surface-panel)",
            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
          }}>
            <div style={{ fontSize: "var(--fs-xs)", color, fontWeight: 700 }}>{label}</div>
            <div style={{ marginTop: 4, fontSize: "var(--fs-sm)", lineHeight: 1.4, color: "var(--text-muted)" }}>
              {item ? `${item.league.name} · ${shortDate(item.next.kickoff_utc)}` : "No future dates loaded"}
            </div>
          </Link>
        ))}
        <Link href="/following" style={{
          minHeight: 74, padding: "9px 10px", background: "var(--surface-panel)",
          border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
        }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--follow)", fontWeight: 700 }}>Transfer market</div>
          <div style={{ marginTop: 4, fontSize: "var(--fs-sm)", lineHeight: 1.4, color: "var(--text-muted)" }}>
            {moves[0] ? `Latest movement noticed ${shortDate(moves[0].noticed_at)}` : "No recent movement loaded"}
          </div>
        </Link>
      </div>
    </section>
  );
}

function buildBriefStories({
  live, hero, recent, news, moves, intlNext,
}: {
  live: RichMatch[];
  hero: RichMatch | null;
  recent: RichMatch[];
  news: NewsItem[];
  moves: RichMovement[];
  intlNext: CompetitionNext[];
}): BriefStory[] {
  const stories: BriefStory[] = [];
  const liveMatch = live[0];
  if (liveMatch) {
    stories.push({
      label: "Live now",
      title: `${liveMatch.home_team?.name ?? "TBD"} ${liveMatch.home_goals ?? 0}–${liveMatch.away_goals ?? 0} ${liveMatch.away_team?.name ?? "TBD"}`,
      why: `${liveMatch.league?.name ?? "This competition"} is active now; the match page connects the score to form, stakes and the pre-match view.`,
      next: "Follow the match",
      href: `/matches/${liveMatch.id}`,
      color: "var(--status-live)",
    });
  } else if (hero) {
    stories.push({
      label: "Next on the calendar",
      title: `${hero.home_team?.name ?? "TBD"} v ${hero.away_team?.name ?? "TBD"}`,
      why: `${hero.league?.name ?? "This match"} is the next tracked fixture. Its page explains the competition context before showing the model.`,
      next: `${shortDate(hero.kickoff_utc)} · open preview`,
      href: `/matches/${hero.id}`,
      color: "var(--accent-2)",
    });
  }
  const result = recent[0];
  if (result) {
    stories.push({
      label: "Just finished",
      title: `${result.home_team?.name ?? "TBD"} ${result.home_goals ?? 0}–${result.away_goals ?? 0} ${result.away_team?.name ?? "TBD"}`,
      why: `A fresh ${result.league?.name ?? "football"} result. Open it to see what happened and how it compared with expectations.`,
      next: "Read the result in context",
      href: `/matches/${result.id}`,
      color: "var(--accent)",
    });
  }
  const headline = news[0];
  if (headline) {
    stories.push({
      label: "In the news",
      title: headline.title,
      why: `This is one of the newest broad football reports${headline.source ? ` from ${headline.source}` : ""}; use it as a doorway into the current news cycle.`,
      next: "Open the report",
      href: headline.url,
      external: true,
      color: "var(--gold)",
    });
  }
  const intl = intlNext[0];
  if (intl) {
    stories.push({
      label: "Road to 2030",
      title: `${intl.league.name} returns ${shortDate(intl.next.kickoff_utc)}`,
      why: "National teams only gather in short windows, so each date is part of a much longer qualification cycle.",
      next: "See the international calendar",
      href: `/leagues/${intl.league.id}`,
      color: "var(--gold)",
    });
  } else if (moves[0]) {
    const movement = moves[0];
    stories.push({
      label: "The market",
      title: movement.kind === "transfer"
        ? `${movement.player?.name ?? "A player"}: ${movement.from_team?.name ?? "?"} → ${movement.to_team?.name ?? "?"}`
        : movement.note ?? "A club changed leagues",
      why: "Transfers and promotion change which clubs, leagues and national-team pools connect to one another.",
      next: "Trace the movement",
      href: movement.player ? `/players/${movement.player.id}` : "/following",
      color: "var(--follow)",
    });
  }
  if (stories.length < 3) {
    stories.push({
      label: "Start here",
      title: "How players, clubs, competitions and countries fit together",
      why: "Once the four layers are clear, every fixture, table and transfer has a place in the larger world.",
      next: "Open the complete Guide",
      href: "/map",
      color: "var(--accent)",
    });
  }
  return stories.slice(0, 4);
}

function newestTimestamp(values: Array<string | null | undefined>): string | null {
  return values.filter((x): x is string => !!x).sort().at(-1) ?? null;
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
