"use client";
import React from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { LeagueTable } from "@/components/ds";
import type { LeagueTableRow } from "@/lib/data";

export function LeagueStandings({ rows, groups }: { rows: (LeagueTableRow & { flag: string })[]; groups?: { name: string; rows: LeagueTableRow[] }[] }) {
  const router = useRouter();
  const [active, setActive] = React.useState("");
  const group = groups?.find(g => g.name === active) ?? groups?.[0];
  const shown = group?.rows ?? rows;
  return (
    <>
    {(groups?.length ?? 0) > 1 && <div className="connection-choices">{groups!.map(g => <button key={g.name} className={`connection-choice ${group?.name === g.name ? "selected" : ""}`} onClick={() => setActive(g.name)}>{g.name}</button>)}</div>}
    <LeagueTable
      rows={shown}
      showForm={false}
      onSelect={(teamName: string) => {
        const row = shown.find(r => r.team === teamName);
        if (row) router.push(`/teams/${row.teamId}`);
      }}
    />
    </>
  );
}
