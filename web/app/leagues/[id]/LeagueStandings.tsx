"use client";
import React from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { LeagueTable } from "@/components/ds";
import type { LeagueTableRow } from "@/lib/data";

export function LeagueStandings({ rows }: { rows: (LeagueTableRow & { flag: string })[] }) {
  const router = useRouter();
  return (
    <LeagueTable
      rows={rows}
      showForm={false}
      onSelect={(teamName: string) => {
        const row = rows.find(r => r.team === teamName);
        if (row) router.push(`/teams/${row.teamId}`);
      }}
    />
  );
}
