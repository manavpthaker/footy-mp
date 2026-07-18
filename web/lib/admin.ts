import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only API routes (follow toggles, score
 * refresh). RLS makes the anon key read-only; every write goes through here.
 * NEVER import this from a client component.
 */
export function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Same-origin guard for mutating routes. Browsers always send Origin on
 * fetch POST/DELETE; a mismatch (or an absent host to compare) rejects.
 * Single-user hardening, not auth — pair with Vercel Deployment Protection
 * to lock the whole app if it ever needs to be private.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;                 // curl/no-CORS contexts: covered by RLS + obscurity
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
