import React from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow, mono } from "@/components/mobile/primitives";
import { FootballLayers } from "@/components/guide/FootballLayers";
import { AskAbout } from "@/components/search/AskAbout";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { nextUpByCompetition, tableableLeagues, CompetitionNext } from "@/lib/data";
import { competitionCode, formatLabel } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "How football works" };

export default async function MapPage() {
  const [nextUp, domestic] = await Promise.all([nextUpByCompetition(), tableableLeagues()]);
  const byFormat = new Map<string, CompetitionNext[]>();
  for (const item of nextUp) {
    const format = item.league.format ?? (item.league.is_international ? "tournament" : "league");
    byFormat.set(format, [...(byFormat.get(format) ?? []), item]);
  }

  return (
    <div>
      <ScreenHeader eyebrow="Start here · 0 to 100" title="How football works" />
      <Pad style={{ paddingTop: 16 }}>
        <div style={{ maxWidth: 760 }}>
          <h1 style={{ margin: 0, fontSize: 27, lineHeight: 1.14, letterSpacing: 0 }}>
            One sport. Four systems passing the same players around.
          </h1>
          <p style={{ margin: "10px 0 18px", color: "var(--text-muted)", fontSize: "var(--fs-body)", lineHeight: 1.7 }}>
            You do not need to memorize every league. Understand who employs the players,
            which competition they are in, and what the current match can change. The rest
            becomes a set of connected stories.
          </p>
        </div>

        <FootballLayers />

        <GuideSection id="players" step="01" title="Players" color="var(--follow)"
          summary="Players are the thread you can follow through every layer. A player represents a club most weeks and may represent a country during international windows."
          points={[
            ["Club role", "Their regular job: position, minutes, form and competition schedule."],
            ["National role", "A temporary call-up based on eligibility, selection and current form."],
            ["Movement", "Transfers and loans change the club side of the map; nationality usually does not change."],
          ]}
        />
        <GuideSection id="clubs" step="02" title="Clubs" color="var(--accent-2)"
          summary="Clubs employ players year-round. Their domestic league is the weekly heartbeat; cup competitions add separate paths and stakes."
          points={[
            ["The league", "A season-long table. Three points for a win, one for a draw; finish high to win or qualify, finish low and risk relegation."],
            ["Promotion", "Strong teams can move up from the division below."],
            ["Relegation", "The lowest finishers can drop down, which is why the bottom of a table matters."],
          ]}
        />

        <section id="competitions" style={{ scrollMarginTop: 80 }}>
          <GuideSection step="03" title="Competitions" color="var(--accent)"
            summary="Competitions answer two questions: who is allowed in, and how is a winner decided? League tables reward consistency; cups create elimination pressure."
            points={[
              ["Domestic leagues", "Home-and-away seasons inside one country or league system."],
              ["Continental cups", "Top clubs from different domestic leagues meet, often through a league phase followed by knockouts."],
              ["Knockout ties", "Some rounds use two matches with aggregate scoring; others are one match that can reach extra time and penalties."],
            ]}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "-4px 0 8px" }}>
            {domestic.map(league => (
              <Link key={league.id} href={`/leagues/${league.id}`} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--surface-panel)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "6px 9px",
                fontSize: "var(--fs-xs)", fontWeight: 700,
              }}>
                <span style={{ ...mono, color: "var(--accent-2)" }}>{competitionCode(league.name)}</span>
                {league.name}
              </Link>
            ))}
          </div>
        </section>

        <GuideSection id="national-teams" step="04" title="National teams" color="var(--gold)"
          summary="Countries borrow eligible players from clubs for short windows. Qualifiers, continental tournaments and the World Cup are a separate calendar layered over club football."
          points={[
            ["Windows", "Short pauses in the club calendar, usually containing two national-team matches."],
            ["Qualifying", "Each confederation runs its own route to the World Cup."],
            ["Tournaments", "Qualified countries gather for a concentrated group stage and knockout event."],
          ]}
        />

        <section id="road-to-2030" style={{ scrollMarginTop: 80 }}>
          <SectionHeading tick="var(--gold)">The road to 2030</SectionHeading>
          <p style={{ margin: "0 0 12px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.7 }}>
            The World Cup is the destination, but the story is built during club seasons,
            transfer windows, international camps and qualifying rounds in between.
          </p>
          <Timeline items={[
            ["2026", "The club cycle restarts: new signings, promoted teams and a new continental field."],
            ["2026–27", "International windows resume and early qualifying cycles establish the field."],
            ["2027–29", "Confederations run different qualifying formats and timelines."],
            ["2028", "Continental tournaments provide the major mid-cycle form check."],
            ["2029–30", "Final qualifiers and playoffs settle the field before squads are selected."],
          ]} />
        </section>

        <SectionHeading tick="var(--accent-2)">What is on the calendar</SectionHeading>
        <p style={{ margin: "0 0 10px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
          These are the next loaded dates, grouped by the role each competition plays.
        </p>
        {["tournament", "qualifiers", "league", "cup", "friendly"].map(format => {
          const competitions = byFormat.get(format) ?? [];
          if (!competitions.length) return null;
          return (
            <div key={format} style={{ marginBottom: 12 }}>
              <div style={{ ...eyebrow, margin: "0 2px 6px" }}>{formatLabel(format)}</div>
              {competitions.map(c => <NextRow key={c.league.id} c={c} />)}
            </div>
          );
        })}
        {nextUp.length === 0 && (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "11px 12px", color: "var(--gold)", fontSize: "var(--fs-sm)", lineHeight: 1.55 }}>
            No future fixtures are loaded right now. The structure above remains valid; refresh the data before treating the calendar as current.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderTop: "1px solid var(--border)", marginTop: 22, padding: "18px 0 8px" }}>
          <div>
            <div style={{ fontWeight: 700 }}>Something still unclear?</div>
            <div style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)", marginTop: 3 }}>
              Ask in plain language. The answer is grounded in this app&apos;s data.
            </div>
          </div>
          <AskAbout question="Explain how the world of football fits together, using current examples from this app." label="Ask the Guide" />
        </div>
        <div style={{ height: 18 }} />
      </Pad>
    </div>
  );
}
function GuideSection({ id, step, title, color, summary, points }: {
  id?: string;
  step: string;
  title: string;
  color: string;
  summary: string;
  points: Array<[string, string]>;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: 80, borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ ...mono, color, fontSize: "var(--fs-sm)", fontWeight: 700 }}>{step}</span>
        <h2 style={{ margin: 0, fontSize: 21, lineHeight: 1.2, letterSpacing: 0 }}>{title}</h2>
      </div>
      <p style={{ margin: "8px 0 13px", maxWidth: 720, color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.7 }}>
        {summary}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 7 }}>
        {points.map(([label, body]) => (
          <div key={label} style={{ padding: "10px 11px", background: "var(--surface-panel)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color }}>{label}</div>
            <div style={{ marginTop: 5, color: "var(--text-muted)", fontSize: "var(--fs-xs)", lineHeight: 1.55 }}>{body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Timeline({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{ borderLeft: "2px solid var(--border)", margin: "4px 0 12px 6px", paddingLeft: 14 }}>
      {items.map(([when, what]) => (
        <div key={when} style={{ marginBottom: 11, position: "relative" }}>
          <span style={{ position: "absolute", left: -20, top: 5, width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />
          <div style={{ ...mono, fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--gold)" }}>{when}</div>
          <div style={{ fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--text-muted)" }}>{what}</div>
        </div>
      ))}
    </div>
  );
}

function NextRow({ c }: { c: CompetitionNext }) {
  const kick = new Date(c.next.kickoff_utc);
  return (
    <Link href={`/leagues/${c.league.id}`} style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--surface-panel)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 10px", marginBottom: 6 }}>
      <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--accent-2)", minWidth: 34 }}>{competitionCode(c.league.name)}</span>
      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", flex: 1 }}>{c.league.name}</span>
      <span style={{ ...eyebrow, textAlign: "right" }}>
        {kick.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {c.scheduled}
      </span>
    </Link>
  );
}
