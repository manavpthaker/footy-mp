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
    supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service_key: !!(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY),
    anthropic_api_key: !!process.env.ANTHROPIC_API_KEY,
  });
}
