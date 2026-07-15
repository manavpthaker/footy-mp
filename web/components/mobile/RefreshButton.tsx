"use client";
import React from "react";
import { useRouter } from "next/navigation";

/**
 * Header refresh: POST /api/refresh (pulls live scores from ESPN into
 * Supabase for matches we already track), then re-render the current
 * route with fresh data. Every screen is force-dynamic, so
 * router.refresh() is all it takes to repaint.
 */
export function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);

  async function refresh() {
    if (busy) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      router.refresh();
      setFlash(body?.updated > 0 ? `${body.updated} updated` : "up to date");
    } catch {
      router.refresh(); // still repaint from the DB even if ESPN pull failed
      setFlash("refreshed");
    } finally {
      setBusy(false);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={busy}
      aria-label="Refresh scores"
      title="Refresh scores"
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "transparent", border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)", padding: "4px 9px",
        color: busy ? "var(--text-faint)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-2xs)",
        textTransform: "uppercase", letterSpacing: "var(--tracking-label)",
        cursor: busy ? "default" : "pointer",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block", fontSize: 12, lineHeight: 1,
          animation: busy ? "fmp-spin 0.9s linear infinite" : "none",
        }}
      >↻</span>
      {flash ?? (busy ? "syncing" : "refresh")}
      <style>{`@keyframes fmp-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
