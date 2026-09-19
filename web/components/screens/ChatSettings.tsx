"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Status = { enabled: boolean; configured: boolean; savedLocally: boolean };
export default function ChatSettings() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status | null>(null);
  const [key, setKey] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/chat", { cache: "no-store", signal: controller.signal }).then(async r => {
      if (!r.ok) throw new Error();
      setStatus(await r.json());
    }).catch(() => { if (!controller.signal.aborted) setMessage("Could not load settings. Refresh to try again."); });
    return () => controller.abort();
  }, []);

  async function save(remove = false) {
    setBusy(true); setMessage("");
    const submitted = key;
    setKey("");
    try {
      const res = await fetch("/api/settings/chat", {
        method: remove ? "DELETE" : "POST", headers: { "Content-Type": "application/json" },
        ...(remove ? {} : { body: JSON.stringify({ apiKey: submitted }) }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error ?? "Could not save the key. Try again."); return; }
      setStatus(previous => previous ? { ...previous, ...data } : previous);
      setMessage(remove ? "Saved key removed." : "Key checked and saved. You can chat now.");
      router.refresh();
    } catch { setMessage("Connection lost. Refresh to check whether the key was saved."); }
    finally { setBusy(false); }
  }

  return <main style={{ padding: "24px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <Link className="circle-link" href="/">← Back to football</Link>
    <h1 style={{ fontSize: 28 }}>Set up chat</h1>
    <p style={{ lineHeight: 1.6 }}>Add your OpenAI API key here. It stays on the Mac and is sent to OpenAI to check the key and answer your questions.</p>
    <p className="circle-small">The app supports OpenAI. Claude keys won’t work yet. Your saved key is never shown again.</p>
    {!status && !message && <p role="status">Loading settings…</p>}
    {status && <p><strong>{status.configured ? "Chat is configured." : "Chat needs an API key."}</strong></p>}
    {status?.enabled ? <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <label htmlFor="chat-api-key" style={{ display: "block", marginBottom: 10 }}>OpenAI API key</label>
      <input id="chat-api-key" type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="sk-…" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={512} required disabled={busy}
        style={{ width: "100%", boxSizing: "border-box", padding: 14, fontSize: 16, background: "var(--surface-panel)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 10 }} />
      <button type="submit" disabled={busy || !key.trim()} style={{ marginTop: 16, padding: "14px 20px", borderRadius: 10, border: 0, background: "var(--gold)", color: "#131110", fontSize: 16, fontWeight: 700, opacity: busy || !key.trim() ? .55 : 1 }}>{busy ? "Working…" : status.configured ? "Check & replace key" : "Check & save key"}</button>
      {status.savedLocally && <button type="button" disabled={busy} onClick={() => void save(true)} style={{ display: "block", marginTop: 22, padding: "12px 0", background: "none", border: 0, color: "var(--text-muted)", fontSize: 14 }}>Remove saved key</button>}
    </form> : status && <p>Key setup is available on the private local preview.</p>}
    <p role="status" aria-live="polite" style={{ lineHeight: 1.6 }}>{message}</p>
    {status?.configured && <button onClick={() => window.dispatchEvent(new CustomEvent("mpfc:ask", { detail: { question: "" } }))} className="circle-link" style={{ padding: "12px 0", background: "none", border: 0, cursor: "pointer" }}>Open chat →</button>}
  </main>;
}
