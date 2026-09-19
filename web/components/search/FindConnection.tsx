"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Results = {
  teams: Array<{ id: number; name: string; is_national: boolean; espn_id?: string | null }>;
  players: Array<{ id: number; name: string }>;
};

/** Finding a starting point needs ordinary search, not an AI answer. */
export function FindConnection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  useEffect(() => {
    setResults(null);
    if (query.trim().length < 2) { setState("idle"); return; }
    setState("loading");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) { setResults(data); setState("ready"); }
      } catch { if (!controller.signal.aborted) setState("error"); }
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  const teams = Array.from(new Map([...(results?.teams ?? [])].sort((a, b) => Number(!!a.espn_id) - Number(!!b.espn_id))
    .map(t => [`${t.is_national}/${t.name}`, t])).values());
  return <details className="circle-details"><summary>Find any team or player</summary>
    <label className="circle-small">Team or player name<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Try Arsenal, Colombia or Kane" style={{ display: "block", width: "100%", padding: 12, marginTop: 6, background: "var(--surface-panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 16 }} /></label>
    <div aria-live="polite">
      {state === "loading" && <p className="circle-small">Searching…</p>}
      {state === "error" && <p className="circle-warning">Search couldn’t load. Try again.</p>}
      {state === "ready" && !teams.length && !results?.players.length && <p className="circle-small">No matching teams or players found.</p>}
      {teams.map(t => <Link className="circle-game" key={t.id} href={`/?team=${t.id}`}><strong>{t.name} →</strong><span className="circle-small">{t.is_national ? "National team" : "Club"} · Explore its players and connections</span></Link>)}
      {results?.players.map(p => <Link className="circle-game" key={p.id} href={`/players/${p.id}`}><strong>{p.name} →</strong><span className="circle-small">Player · Find their club and country</span></Link>)}
    </div>
  </details>;
}
