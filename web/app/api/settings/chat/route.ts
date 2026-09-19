import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getChatConfig, localSettingsEnabled, removeChatKey, saveChatKey, settingsRequestAllowed } from "@/lib/chat-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const config = await getChatConfig();
    return json({ enabled: localSettingsEnabled(), configured: !!config.apiKey, savedLocally: config.savedLocally });
  } catch { return json({ error: "Could not read chat settings." }, 500); }
}

export async function POST(req: Request) {
  if (!settingsRequestAllowed(req)) return json({ error: "Key setup is only available on the private local preview." }, 403);
  const body = await req.text();
  if (body.length > 4096) return json({ error: "That key is too long." }, 400);
  let apiKey: string;
  try { apiKey = JSON.parse(body).apiKey?.trim(); }
  catch { return json({ error: "Enter an OpenAI API key." }, 400); }
  if (typeof apiKey !== "string" || apiKey.startsWith("sk-ant-") || !/^sk-[A-Za-z0-9_-]{16,500}$/.test(apiKey)) return json({ error: "Enter an OpenAI API key starting with sk-. Claude keys are not supported yet." }, 400);
  try {
    const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-5-mini";
    await new OpenAI({ apiKey, timeout: 12000, maxRetries: 0 }).models.retrieve(model);
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    return json({ error: status === 401 ? "OpenAI did not accept that key. Check it and try again."
      : status === 403 || status === 404 ? "That key cannot access the app’s chat model. Check its project permissions."
      : "Could not verify the key with OpenAI. It has not been saved; try again." }, 400);
  }
  try {
    await saveChatKey(apiKey);
    return json({ configured: true, savedLocally: true });
  } catch { return json({ error: "The key was checked, but could not be saved on the Mac." }, 500); }
}

export async function DELETE(req: Request) {
  if (!settingsRequestAllowed(req)) return json({ error: "Key setup is only available on the private local preview." }, 403);
  try {
    await removeChatKey();
    const config = await getChatConfig();
    return json({ configured: !!config.apiKey, savedLocally: false });
  } catch { return json({ error: "Could not remove the saved key." }, 500); }
}
