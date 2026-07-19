import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment health/config check — booleans only, never values.
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase_url: !!(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL),
    // reads (anon/publishable — either name works, utils/supabase checks both)
    supabase_read_key: !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    // writes (follow toggles via lib/admin.ts)
    supabase_admin_key: !!(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY),
    // Ask MPFC chat
    anthropic_api_key: !!process.env.ANTHROPIC_API_KEY,
  });
}
