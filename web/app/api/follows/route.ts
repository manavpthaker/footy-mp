import { NextResponse } from "next/server";
import { adminClient, sameOrigin } from "@/lib/admin";
import { USER_ID } from "@/lib/data";

const VALID = new Set(["player", "team", "league", "country"]);

function parse(body: any): { entity_type: string; entity_id: number } | null {
  const entity_type = String(body.entity_type ?? "");
  const entity_id = Number(body.entity_id);
  if (!VALID.has(entity_type) || !Number.isFinite(entity_id)) return null;
  return { entity_type, entity_id };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const p = parse(await req.json().catch(() => ({})));
  if (!p) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const s = adminClient();
  if (!s) return NextResponse.json({ error: "server not configured" }, { status: 500 });
  const { error } = await s
    .from("follows")
    .upsert({ user_id: USER_ID, ...p },
            { onConflict: "user_id,entity_type,entity_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const p = parse(await req.json().catch(() => ({})));
  if (!p) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const s = adminClient();
  if (!s) return NextResponse.json({ error: "server not configured" }, { status: 500 });
  const { error } = await s
    .from("follows")
    .delete()
    .eq("user_id", USER_ID)
    .eq("entity_type", p.entity_type)
    .eq("entity_id", p.entity_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
