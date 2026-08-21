"use client";
import React from "react";
import { FixtureItem } from "@/components/mobile/FixtureItem";
import { Pad, Segmented, ChipRail, Chip, EmptyState, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { FixtureGroup } from "@/components/ds";
import type { RichMatch } from "@/lib/data";

// chips lead with the marquee competitions, then whatever else has fixtures
const COMP_PRIORITY = [
  "World Cup", "Champions League", "Premier League", "La Liga", "Serie A",
  "Bundesliga", "Ligue 1", "Europa League",
];

export function MatchesClient({
  upcoming, results, followedTeamIds: initialFollowed,
}: {
  upcoming: RichMatch[]; results: RichMatch[]; followedTeamIds: number[];
}) {
  const [mode, setMode] = React.useState<"upcoming" | "results">(upcoming.length ? "upcoming" : "results");
  const [comp, setComp] = React.useState("all");
  const [onlyFollowed, setOnlyFollowed] = React.useState(false);
  const followedSet = React.useMemo(() => new Set(initialFollowed), [initialFollowed]);

  // competitions that actually have matches in view — the rail adapts as
  // qualifiers, cups and new leagues flow in over the 4-year arc
  const source = mode === "upcoming" ? upcoming : results;
  const compOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const m of source) if (m.league?.name) names.add(m.league.name);
    const sorted = Array.from(names).sort((a, b) => {
      const ai = COMP_PRIORITY.indexOf(a); const bi = COMP_PRIORITY.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    });
    return [{ id: "all", label: "All" }, ...sorted.map(n => ({ id: n, label: n }))];
  }, [source]);

  const filtered = source.filter(m => {
    if (comp !== "all" && m.league?.name !== comp) return false;
    if (onlyFollowed && !isFollowed(m, followedSet) && m.status !== "live") return false;
    return true;
  });

  const groups = groupByDay(filtered);

  return (
    <div>
      <Pad style={{ paddingTop: 12, paddingBottom: 10 }}>
        <div style={{ ...eyebrow, color: "var(--accent)" }}>Calendar and results</div>
        <h1 style={{ margin: "5px 0 11px", fontSize: 23, lineHeight: 1.2, letterSpacing: 0 }}>
          Follow the games, then open the story.
        </h1>
        {upcoming.length === 0 && results.length > 0 && (
          <div role="status" style={{
            marginBottom: 10, padding: "8px 10px", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", background: "var(--surface-tint)",
            color: "var(--gold)", fontSize: "var(--fs-xs)", lineHeight: 1.45,
          }}>No future fixtures are loaded, so the latest available results are shown.</div>
        )}
        <Segmented value={mode} onChange={setMode} options={[
          { value: "upcoming", label: "Upcoming" },
          { value: "results", label: "Results" },
        ]} />
      </Pad>
      <ChipRail>
        <Chip active={onlyFollowed} onClick={() => setOnlyFollowed(!onlyFollowed)}>★ Following</Chip>
        <span style={{ width: 1, background: "var(--border)", margin: "2px 2px", flex: "0 0 auto" }} />
        {compOptions.map(o => (
          <Chip key={o.id} active={comp === o.id} onClick={() => setComp(o.id)}>{o.label}</Chip>
        ))}
      </ChipRail>
      <Pad style={{ paddingTop: 10 }}>
        {groups.length ? groups.map(g => (
          <FixtureGroup key={g.label} label={g.label}>
            {g.items.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedSet} />)}
          </FixtureGroup>
        )) : source.length === 0 ? (
          <div style={{
            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
            padding: "14px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.55,
          }}>
            {mode === "upcoming"
              ? "No future fixtures are currently loaded. Switch to Results to explore the latest available matches."
              : "No finished matches are currently loaded."}
          </div>
        ) : <EmptyState>Nothing matches these filters. Clear a competition or Following filter.</EmptyState>}
      </Pad>
    </div>
  );
}

function isFollowed(m: RichMatch, ids: Set<number>) {
  return ids.has(m.home_team_id) || ids.has(m.away_team_id);
}

function groupByDay(list: RichMatch[]): { label: string; items: RichMatch[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 864e5);
  const groups: { label: string; items: RichMatch[] }[] = [];
  for (const m of list) {
    const d = new Date(m.kickoff_utc);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const label = day.getTime() === today.getTime() ? "TODAY"
                : day.getTime() === tomorrow.getTime() ? "TOMORROW"
                : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
    let g = groups.find(x => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(m);
  }
  return groups;
}
