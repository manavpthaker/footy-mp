import { NextResponse } from "next/server";
import { searchEntities } from "@/lib/search";

export const dynamic = "force-dynamic";

/** GET /api/search?q=arsenal — universal entity search for the overlay. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const results = await searchEntities(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { teams: [], players: [], leagues: [], countries: [], playerClubs: {} },
      { status: 200 },
    );
  }
}
