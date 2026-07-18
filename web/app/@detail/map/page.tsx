import React from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow, mono } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
import { nextUpByCompetition, tableableLeagues, CompetitionNext } from "@/lib/data";
import { competitionCode, formatLabel } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Map — how it all fits" };

/**
 * The Map — the 0→100 page. Not the rules of football: the LOGISTICS of it.
 * How clubs, leagues, cups, and national teams interlock, how players move
 * between them, and what the 4-year road from this World Cup to 2030 looks
 * like. Everything links into live data.
 */
export default async function MapPage() {
  const [nextUp, domestic] = await Promise.all([
    nextUpByCompetition(),
    tableableLeagues(),
  ]);
  const byFormat = new Map<string, CompetitionNext[]>();
  for (const n of nextUp) {
    const f = n.league.format ?? (n.league.is_international ? "tournament" : "league");
    const arr = byFormat.get(f) ?? [];
    arr.push(n);
    byFormat.set(f, arr);
  }

  return (
    <div>
      <ScreenHeader eyebrow="0 → 100" title="The Map" />
      <Pad style={{ paddingTop: 14 }}>
        <Prose>
          One sport, four layers. <b>Players</b> are employed by <b>clubs</b>.
          Clubs play in domestic <b>leagues</b> (plus continental cups). And when
          international windows open, countries borrow those same players for
          their <b>national teams</b>. Everything you&apos;ll watch for the next
          four years — every transfer, every table, every qualifier — is these
          four layers passing players back and forth.
        </Prose>

        <SectionHeading tick="var(--accent)">1 · The weekly heartbeat: leagues</SectionHeading>
        <Prose>
          A domestic league is a season-long round robin, August to May in Europe
          (calendar-year in MLS, Liga MX and most of the Americas): everyone plays
          everyone home and away, 3 points a win. The table decides everything —
          top spots qualify for continental cups, the bottom is <b>relegated</b> to
          the division below while its champions are <b>promoted</b> up. That trapdoor
          is why late-season games between bad teams are wars.
        </Prose>
        <ChipRow>
          {domestic.map(l => (
            <Chip key={l.id} href={`/leagues/${l.id}`} label={l.name} code={competitionCode(l.name)} />
          ))}
        </ChipRow>

        <SectionHeading tick="var(--accent)">2 · The bridges: continental cups</SectionHeading>
        <Prose>
          Finish high enough in your league and next season you also play midweek
          continental football — the <b>Champions League</b> (Europe&apos;s top
          finishers), the <b>Europa League</b> (the tier below), the{" "}
          <b>Libertadores</b> (South America). This is how leagues meet: Arsenal v
          Bayern only happens here. Knockout rounds are two-legged — a game at each
          ground, goals added up — so a single 2–1 tells you half the story.
        </Prose>

        <SectionHeading tick="var(--accent)">3 · The other jersey: national teams</SectionHeading>
        <Prose>
          Five or six times a year the club season pauses for an{" "}
          <b>international window</b> (roughly September, October, November, March
          and June). Each country calls up 23-ish of its passport-holders from
          their clubs, plays two matches, and hands them back. That&apos;s the
          whole trick of following internationals: <b>club form is national-team
          scouting</b>. Open any country page here and you&apos;ll see where its
          squad earns a living week to week.
        </Prose>

        <SectionHeading tick="var(--gold)">4 · The road to 2030</SectionHeading>
        <Prose>
          The World Cup runs on a 4-year cycle, and the next one — hosted across{" "}
          <b>Spain, Portugal and Morocco</b>, with centenary openers in South
          America — is the destination this app tracks toward. The route:
        </Prose>
        <Timeline items={[
          ["2026", "This World Cup ends; the 2026-27 club season kicks off in August. New signings, promoted clubs, new Champions League field."],
          ["2026-27", "UEFA Nations League + continental qualifying cycles resume. Every window now means something."],
          ["2027-29", "World Cup qualifying proper: South America's 18-round marathon and Asia's long rounds start early; Africa and CONCACAF build through '28-29; Europe's short sprint lands last."],
          ["2028", "Euros (UK & Ireland) + Copa America — the mid-cycle check on who's actually good."],
          ["2029-30", "Playoffs settle the last places. Squads lock. Then the 24th World Cup — and you'll know every name on the teamsheet."],
        ]} />
        <Prose>
          Between now and then, national teams only get those short windows —
          which is why the qualifiers, the Nations League, AFCON, the Gold Cup
          and even friendlies are ingested here. The international story never
          actually stops; it just changes channels.
        </Prose>

        <SectionHeading tick="var(--accent)">5 · How players move</SectionHeading>
        <Prose>
          Clubs buy and sell players in two <b>transfer windows</b> — the long
          summer one and a short repair window in January. Contracts, loans, free
          transfers: it&apos;s the sport&apos;s stock market, and it re-wires the
          club↔country web twice a year. The pipeline watches rosters and logs
          every move it notices to the <b>Movement</b> feed on Today, so four
          years of churn stays legible.
        </Prose>

        <SectionHeading tick="var(--accent)">6 · What&apos;s live right now</SectionHeading>
        {["tournament", "qualifiers", "league", "cup", "friendly"].map(f => {
          const comps = byFormat.get(f) ?? [];
          if (!comps.length) return null;
          return (
            <div key={f} style={{ marginBottom: 10 }}>
              <div style={{ ...eyebrow, margin: "0 2px 6px" }}>{formatLabel(f)}</div>
              {comps.map(c => <NextRow key={c.league.id} c={c} />)}
            </div>
          );
        })}
        {nextUp.length === 0 && (
          <Prose>Nothing on the calendar right now — the pipeline refills this daily.</Prose>
        )}

        <div style={{ ...eyebrow, textAlign: "center", padding: "14px 0 6px" }}>
          the numbers everywhere else: xG = chance quality · the model prices games
          from two seasons of it
        </div>
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 10px", fontSize: "var(--fs-sm)", lineHeight: 1.7,
      color: "var(--text-muted)",
    }}>{children}</p>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "2px 0 12px" }}>
      {children}
    </div>
  );
}

function Chip({ href, label, code }: { href: string; label: string; code: string }) {
  return (
    <Link href={href} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      textDecoration: "none", color: "inherit",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: 999, padding: "5px 11px", fontSize: "var(--fs-xs)", fontWeight: 700,
    }}>
      <span style={{ ...mono, color: "var(--accent-2)" }}>{code}</span>
      {label}
    </Link>
  );
}

function Timeline({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{
      borderLeft: "2px solid var(--border)", margin: "4px 0 12px 6px",
      paddingLeft: 14,
    }}>
      {items.map(([when, what]) => (
        <div key={when} style={{ marginBottom: 10, position: "relative" }}>
          <span style={{
            position: "absolute", left: -20, top: 5, width: 8, height: 8,
            borderRadius: 999, background: "var(--gold)",
          }} />
          <div style={{ ...mono, fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--gold)" }}>
            {when}
          </div>
          <div style={{ fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--text-muted)" }}>
            {what}
          </div>
        </div>
      ))}
    </div>
  );
}

function NextRow({ c }: { c: CompetitionNext }) {
  const kick = new Date(c.next.kickoff_utc);
  return (
    <Link href={`/leagues/${c.league.id}`} style={{
      display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
      color: "inherit", background: "var(--surface-panel)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      padding: "8px 11px", marginBottom: 6,
    }}>
      <span style={{ ...mono, fontSize: "var(--fs-xs)", color: "var(--accent-2)", minWidth: 34 }}>
        {competitionCode(c.league.name)}
      </span>
      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", flex: 1 }}>{c.league.name}</span>
      <span style={{ ...eyebrow }}>
        next {kick.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        {" · "}{c.scheduled} scheduled
      </span>
    </Link>
  );
}
