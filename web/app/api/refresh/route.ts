import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * On-demand score refresh. Pulls the ESPN scoreboard for yesterday/today/
 * tomorrow across our leagues and updates matches we already know
 * (matched by espn_event_id) — status, score, minute, ET/pens. It never
 * creates teams or matches; the Python pipeline owns entity resolution,
 * model runs, and lowdowns. This is the "is the score current" fast path
 * behind the header refresh button.
 */

export const dynamic = "force-dynamic";

const SLUGS = [
  "fifa.world", "eng.1", "esp.1", "ita.1", "ger.1", "fra.1",
  "uefa.champions", "uefa.europa",
];

let lastRun = 0; // per-instance throttle; good enough for a single-user app

function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function utcDates(): string[] {
  return [-1, 0, 1].map(off => {
    const d = new Date(Date.now() + off * 86_400_000);
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  });
}

interface EspnUpdate {
  espn_event_id: string;
  status: string;
  minute: number | null;
  home_goals: number | null;
  away_goals: number | null;
  went_et: boolean;
  went_pens: boolean;
  pens_home: number | null;
  pens_away: number | null;
}

function parseEvent(ev: any): EspnUpdate | null {
  const comp = ev?.competitions?.[0];
  const cs: any[] = comp?.competitors ?? [];
  if (cs.length !== 2) return null;
  const home = cs.find(c => c.homeAway === "home") ?? cs[0];
  const away = cs.find(c => c.homeAway === "away") ?? cs[1];
  const st = comp?.status?.type ?? {};
  const state = st.state as string; // pre | in | post
  const detail = String(st.detail ?? "").toUpperCase();
  const soH = home?.shootoutScore;
  const soA = away?.shootoutScore;
  const wentPens = soH != null && soA != null;
  const toInt = (v: any) => (v == null || v === "" ? null : Number(v));
  return {
    espn_event_id: String(ev.id),
    status: state === "in" ? "live" : state === "post" ? "final" : "scheduled",
    minute: Math.floor(Number(comp?.status?.clock ?? 0) / 60) || null,
    home_goals: toInt(home?.score),
    away_goals: toInt(away?.score),
    went_et: wentPens || detail.includes("AET") || detail.includes("EXTRA"),
    went_pens: wentPens,
    pens_home: wentPens ? toInt(soH) : null,
    pens_away: wentPens ? toInt(soA) : null,
  };
}

export async function POST() {
  if (Date.now() - lastRun < 30_000) {
    return NextResponse.json({ ok: true, throttled: true, updated: 0 });
  }
  lastRun = Date.now();

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "server not configured" }, { status: 500 });
  }

  const updates = new Map<string, EspnUpdate>();
  await Promise.allSettled(
    SLUGS.flatMap(slug => utcDates().map(async date => {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${date}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = await res.json();
      for (const ev of data?.events ?? []) {
        const u = parseEvent(ev);
        if (u) updates.set(u.espn_event_id, u);
      }
    })),
  );

  if (updates.size === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const ids = Array.from(updates.keys());
  const { data: known } = await supabase
    .from("matches").select("id,espn_event_id").in("espn_event_id", ids);

  let updated = 0;
  for (const row of known ?? []) {
    const u = updates.get(String(row.espn_event_id));
    if (!u) continue;
    const { espn_event_id: _ignored, ...fields } = u;
    const { error } = await supabase.from("matches").update(fields).eq("id", row.id);
    if (!error) updated++;
  }

  return NextResponse.json({ ok: true, updated, seen: updates.size });
}
