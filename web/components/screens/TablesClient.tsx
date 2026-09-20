"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pad, ChipRail, Chip, EmptyState, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { LeagueTable } from "@/components/ds";
import type { LeagueTableRow } from "@/lib/data";
import { StandingsContext } from "@/components/competition/StandingsContext";
import { AskAbout } from "@/components/search/AskAbout";

interface Bundle {
  leagueId: number;
  leagueName: string;
  season: string | null;
  complete: boolean;
  groups?: { name: string; rows: LeagueTableRow[] }[];
  source?: string;
  sourceUrl?: string;
  checkedAt?: string | null;
  rows: (LeagueTableRow & { flag: string })[];
}

export function TablesClient({ payload }: { payload: Bundle[] }) {
  const router = useRouter();
  const [active, setActive] = React.useState(payload[0]?.leagueId ?? 0);
  const [groupName, setGroupName] = React.useState("");
  const b = payload.find(p => p.leagueId === active) ?? payload[0];
  const group = b?.groups?.find(g => g.name === groupName) ?? b?.groups?.[0];
  const rows = group?.rows ?? b?.rows ?? [];

  if (!payload.length) {
    return <Pad style={{ paddingTop: 20 }}>
      <EmptyState>Standings appear once this competition has finished matches this season.</EmptyState>
    </Pad>;
  }

  return (
    <div>
      <Pad style={{ paddingTop: 14, paddingBottom: 10 }}>
        <div style={{ ...eyebrow, color: "var(--accent)" }}>Leagues · conferences · national-team groups</div>
        <h1 style={{ margin: "5px 0 6px", fontSize: 23, lineHeight: 1.2, letterSpacing: 0 }}>
          Read the race, not just the rows.
        </h1>
        <p style={{ margin: "0 0 10px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.55 }}>
          Choose a competition to see where teams stand. MLS has two conferences;
          national-team tournaments and qualifiers can have separate groups.
        </p>
        <AskAbout question="Teach me how to read a football league table and explain what the qualification and relegation zones mean." label="Explain league tables" />
      </Pad>
      <ChipRail>
        {payload.map(p => (
          <Chip key={p.leagueId} active={active === p.leagueId} onClick={() => { setActive(p.leagueId); setGroupName(""); }}>
            {p.leagueName}
          </Chip>
        ))}
      </ChipRail>
      {(b.groups?.length ?? 0) > 1 && <ChipRail>{b.groups!.map(g => <Chip key={g.name} active={group?.name === g.name} onClick={() => setGroupName(g.name)}>{g.name}</Chip>)}</ChipRail>}
      <Pad style={{ paddingTop: 10 }}>
        <p className="circle-small">{b.source === "ESPN" ? <><a href={b.sourceUrl} target="_blank" rel="noreferrer">ESPN standings ↗</a>{b.checkedAt ? ` · Checked ${new Date(b.checkedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" })}` : ""}</> : "Source table unavailable. Calculated from loaded results; coverage may be incomplete."}</p>
        {b.leagueName === "MLS" && <p className="circle-small">Eastern and Western Conference places decide playoff qualification. MLS Cup is decided in the playoffs. MLS does not have relegation.</p>}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 2px 9px" }}>
          <span style={{
            fontWeight: 700, fontSize: "var(--fs-h2)",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>{b.leagueName}</span>
          {b.season && (
            <span style={{ ...eyebrow, color: "var(--text-faint)" }}>
              {b.season}
              {b.complete && (
                <span style={{
                  marginLeft: 6, padding: "1px 6px", borderRadius: 4,
                  border: "1px solid var(--border)", background: "var(--surface-tint)",
                  color: "var(--gold)",
                }}>FINAL</span>
              )}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <Link href={`/leagues/${b.leagueId}`} style={{
            color: "var(--accent-2)", fontSize: "var(--fs-xs)",
          }}>competition page →</Link>
        </div>
        <StandingsContext
          leagueName={group?.name ?? b.leagueName}
          season={b.season}
          complete={b.complete}
          rows={rows}
        />
        <LeagueTable
          rows={rows}
          showForm={true}
          onSelect={(teamName: string) => {
            const row = rows.find(r => r.team === teamName);
            if (row) router.push(`/teams/${row.teamId}`);
          }}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "10px 2px 0" }}>
          {[
            ["var(--zone-ucl)", "UCL"],
            ["var(--zone-uel)", "Europa"],
            ["var(--zone-conf)", "Conference"],
            ["var(--zone-releg)", "Relegation"],
          ].filter((_, i) => rows.some(r => r.zone === ["ucl", "uel", "conf", "releg"][i])).map(([c, l]) => (
            <span key={l} style={{
              ...eyebrow, display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
            </span>
          ))}
        </div>
      </Pad>
    </div>
  );
}
