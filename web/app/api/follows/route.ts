import { NextResponse } from "next/server";
import { server } from "@/lib/supabase";
import { USER_ID } from "@/lib/data";

const VALID = new Set(["player", "team", "league", "country"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const entity_type = String(body.entity_type ?? "");
  const entity_id = Number(body.entity_id);
  if (!VALID.has(entity_type) || !Number.isFinite(entity_id)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const { error } = await server()
    .from("follows")
    .upsert({ user_id: USER_ID, entity_type, entity_id },
            { onConflict: "user_id,entity_type,entity_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const entity_type = String(body.entity_type ?? "");
  const entity_id = Number(body.entity_id);
  if (!VALID.has(entity_type) || !Number.isFinite(entity_id)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const { error } = await server()
    .from("follows")
    .delete()
    .eq("user_id", USER_ID)
    .eq("entity_type", entity_type)
    .eq("entity_id", entity_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
