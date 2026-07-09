/**
 * Supabase client wrappers.
 *
 * Real clients live in `utils/supabase/{server,client}.ts` and follow the
 * @supabase/ssr cookie-aware pattern (session refresh handled by
 * `middleware.ts`). This module keeps the historical `browser()` / `server()`
 * façade so existing callers don't have to thread `cookies()` themselves.
 *
 * Writes (follow toggles) go through the browser client and respect RLS.
 * Ingest / model writes still happen in the Python pipeline via the
 * service-role key server-side.
 */
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServer } from "@/utils/supabase/server";
import { createClient as createBrowser } from "@/utils/supabase/client";

export function browser(): SupabaseClient {
  return createBrowser() as unknown as SupabaseClient;
}

export async function server(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServer(cookieStore) as unknown as SupabaseClient;
}

// ---------- Types (match schema.sql; only fields we surface in the UI) ----------

export type EntityType = "player" | "team" | "league" | "country";

export interface Team {
  id: number;
  name: string;
  short_name: string | null;
  country_id: number | null;
  league_id: number | null;
  espn_id: string | null;
  crest_url: string | null;
  is_national: boolean;
}
export interface Player {
  id: number;
  name: string;
  team_id: number | null;
  country_id: number | null;
  position: string | null;
  photo_url: string | null;
}
export interface League {
  id: number;
  name: string;
  country_id: number | null;
  espn_slug: string | null;
  is_international: boolean;
}
export interface Country {
  id: number;
  name: string;
  fifa_code: string | null;
  confederation: string | null;
}
export interface Match {
  id: number;
  league_id: number | null;
  home_team_id: number;
  away_team_id: number;
  kickoff_utc: string;
  status: "scheduled" | "live" | "final";
  minute: number | null;
  home_goals: number | null;
  away_goals: number | null;
  went_pens: boolean;
  pens_home: number | null;
  pens_away: number | null;
  winner_team_id: number | null;
  espn_event_id: string | null;
}
export interface Prediction {
  match_id: number;
  p_home: number | null;
  p_draw: number | null;
  p_away: number | null;
  home_xg: number | null;
  away_xg: number | null;
  p_advance_home: number | null;
  p_et: number | null;
  p_pens: number | null;
  model_version: string;
}
export interface Follow {
  id: number;
  entity_type: EntityType;
  entity_id: number;
  user_id: string;
}
export interface ModelRating {
  team_id: number;
  as_of_date: string;
  attack: number | null;
  defense: number | null;
  overall: number | null;
  home_adv: number | null;
  temper: number | null;
}
