import React from "react";
import { AppHeader } from "@/components/mobile/AppHeader";
import { TablesClient } from "./TablesClient";
import { tableableLeagues, standingsForLeague } from "@/lib/data";
import { flagFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const leagues = await tableableLeagues();
  // Pre-fetch every table so switching chips is instant + no client fetch needed.
  const byId = await Promise.all(leagues.map(l => standingsForLeague(l.id)));
  const payload = byId
    .filter(x => x.league && x.rows.length > 0)
    .map(x => ({
      leagueId: x.league!.id,
      leagueName: x.league!.name,
      rows: x.rows.map(r => ({ ...r, flag: flagFor(r.team) })),
    }));
  return (
    <div>
      <AppHeader />
      <TablesClient payload={JSON.parse(JSON.stringify(payload))} />
    </div>
  );
}
