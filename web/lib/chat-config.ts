// Server-only credentials. Import only from route handlers/server components.
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export function localSettingsEnabled() {
  return process.env.FOOTY_LOCAL_SETTINGS === "1" && !process.env.VERCEL;
}

function configPath() {
  return process.env.FOOTY_CHAT_CONFIG_PATH
    ?? join(homedir(), "Library", "Application Support", "footy-mp", "chat.json");
}

export async function getChatConfig() {
  const fallback = { apiKey: process.env.OPENAI_API_KEY ?? "", model: process.env.OPENAI_CHAT_MODEL ?? "gpt-5-mini", savedLocally: false };
  if (!localSettingsEnabled()) return fallback;
  try {
    const data = JSON.parse(await fs.readFile(configPath(), "utf8"));
    if (typeof data.apiKey === "string" && data.apiKey) return { ...fallback, apiKey: data.apiKey, savedLocally: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Chat settings could not be read.");
  }
  return fallback;
}

export async function saveChatKey(apiKey: string) {
  if (!localSettingsEnabled()) throw new Error("Local settings are disabled.");
  const path = configPath();
  await fs.mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temp, JSON.stringify({ apiKey }), { mode: 0o600, flag: "wx" });
    await fs.rename(temp, path);
  } finally {
    await fs.rm(temp, { force: true });
  }
}

export async function removeChatKey() {
  if (!localSettingsEnabled()) throw new Error("Local settings are disabled.");
  await fs.rm(configPath(), { force: true });
}

// Only the explicitly enabled local preview may accept credential changes.
// The preview must bind to loopback and be reached through private Tailscale Serve.
export function settingsRequestAllowed(req: Request) {
  if (!localSettingsEnabled()) return false;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  const allowed = ["http://127.0.0.1:3001", "http://localhost:3001", process.env.FOOTY_LOCAL_SETTINGS_ORIGIN];
  try { return allowed.includes(origin) && new URL(origin).host === host; }
  catch { return false; }
}
