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
  const [mode, setMode] = React.useState<"upcoming" | "results">("upcoming");
  const [comp, setComp] = React.useState("all");
  const [onlyFollowed, setOnlyFollowed] = React.useState(false);
  const followedSet = React.useMemo(() => new Set(initialFollowed), [initialFollowed]);

  // competitions that actually have matches in view — the rail adapts as
  // qualifiers, cups and new leagues flow in over the 4-year arc
  const compOptions = React.useMemo(() => {
    const names = new Set<string>();
    for (const m of [...upcoming, ...results]) if (m.league?.name) names.add(m.league.name);
    const sorted = Array.from(names).sort((a, b) => {
      const ai = COMP_PRIORITY.indexOf(a); const bi = COMP_PRIORITY.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    });
    return [{ id: "all", label: "All" }, ...sorted.map(n => ({ id: n, label: n }))];
  }, [upcoming, results]);

  const source = mode === "upcoming" ? upcoming : results;
  const filtered = source.filter(m => {
    if (comp !== "all" && m.league?.name !== comp) return false;
    if (onlyFollowed && !isFollowed(m, followedSet) && m.status !== "live") return false;
    return true;
  });

  const groups = groupByDay(filtered);

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
        )) : <EmptyState>Nothing here — clear a filter.</EmptyState>}
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
