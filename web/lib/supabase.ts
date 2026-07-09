/**
 * Supabase client helpers. Two flavors:
 *   - browser(): anon key, used in client components + browser fetches.
 *   - server(): service-role bypass when env has SUPABASE_SERVICE_KEY;
 *               falls back to anon so read-only pages still work.
 * All footy-mp writes (follows toggles) go through the browser client to
 * respect RLS. Ingest / model writes happen from the Python pipeline.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;

let _browser: SupabaseClient | null = null;
let _server: SupabaseClient | null = null;

export function browser(): SupabaseClient {
  if (_browser) return _browser;
  if (!URL || !ANON) throw new Error("SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  _browser = createClient(URL, ANON);
  return _browser;
}

export function server(): SupabaseClient {
  if (_server) return _server;
  if (!URL) throw new Error("SUPABASE_URL missing");
  const key = SERVICE || ANON;
  if (!key) throw new Error("Neither SUPABASE_SERVICE_KEY nor ANON key available server-side");
  _server = createClient(URL, key, { auth: { persistSession: false } });
  return _server;
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
