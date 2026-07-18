"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pad, ChipRail, Chip, EmptyState, eyebrow } from "@/components/mobile/primitives";
// @ts-ignore
import { LeagueTable } from "@/components/ds";
import type { LeagueTableRow } from "@/lib/data";

interface Bundle {
  leagueId: number;
  leagueName: string;
  rows: (LeagueTableRow & { flag: string })[];
}

export function TablesClient({ payload }: { payload: Bundle[] }) {
  const router = useRouter();
  const [active, setActive] = React.useState(payload[0]?.leagueId ?? 0);
  const b = payload.find(p => p.leagueId === active) ?? payload[0];

  if (!payload.length) {
    return <Pad style={{ paddingTop: 20 }}>
      <EmptyState>Standings appear once this competition has finished matches this season.</EmptyState>
    </Pad>;
  }

  return (
    <div>
      <ChipRail>
        {payload.map(p => (
          <Chip key={p.leagueId} active={active === p.leagueId} onClick={() => setActive(p.leagueId)}>
            {p.leagueName}
          </Chip>
        ))}
      </ChipRail>
      <Pad style={{ paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "4px 2px 9px" }}>
          <span style={{
            fontWeight: 700, fontSize: "var(--fs-h2)",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>{b.leagueName}</span>
          <div style={{ flex: 1 }} />
          <Link href={`/leagues/${b.leagueId}`} style={{
            color: "var(--accent-2)", fontSize: "var(--fs-xs)",
          }}>fixtures →</Link>
        </div>
        <LeagueTable
          rows={b.rows}
          showForm={true}
          onSelect={(teamName: string) => {
            const row = b.rows.find(r => r.team === teamName);
            if (row) router.push(`/teams/${row.teamId}`);
          }}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "10px 2px 0" }}>
          {[
            ["var(--zone-ucl)", "UCL"],
            ["var(--zone-uel)", "Europa"],
            ["var(--zone-conf)", "Conference"],
            ["var(--zone-releg)", "Relegation"],
          ].map(([c, l]) => (
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
