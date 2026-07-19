"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Crest } from "@/components/ds/Crest";
import { flagFor } from "@/lib/format";

/**
 * Universal search + Ask MPFC chat, in one full-screen overlay.
 *
 * Type → instant entity results (teams, players, leagues, countries) from
 * /api/search; tap to navigate. Or hit "Ask" (or Enter on a question) and the
 * same input becomes a chat with the model grounded in the app's data
 * (/api/chat). The chat thread persists while the overlay stays open.
 */

interface ChatMsg { role: "user" | "assistant"; content: string }

interface Results {
  teams: Array<{ id: number; name: string; is_national: boolean; crest_url: string | null; espn_id: string | null; league_id: number | null }>;
  players: Array<{ id: number; name: string; position: string | null; team_id: number | null; photo_url: string | null }>;
  leagues: Array<{ id: number; name: string }>;
  countries: Array<{ id: number; name: string; fifa_code: string | null }>;
  playerClubs: Record<number, string>;
}

const EMPTY: Results = { teams: [], players: [], leagues: [], countries: [], playerClubs: {} };

export function SearchChat({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Results>(EMPTY);
  const [chat, setChat] = React.useState<ChatMsg[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);
  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, thinking]);

  // debounced entity search
  React.useEffect(() => {
    if (q.trim().length < 2) { setResults(EMPTY); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        setResults(r.ok ? await r.json() : EMPTY);
      } catch { setResults(EMPTY); }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => { onClose(); router.push(href); };

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    const next: ChatMsg[] = [...chat, { role: "user", content: text }];
    setChat(next);
    setQ("");
    setResults(EMPTY);
    setThinking(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await r.json().catch(() => null);
      setChat([...next, {
        role: "assistant",
        content: data?.reply ?? "No answer came back — try again in a moment.",
      }]);
    } catch {
      setChat([...next, { role: "assistant", content: "Network hiccup — try again." }]);
    } finally {
      setThinking(false);
    }
  };

  const hasResults = results.teams.length + results.players.length
    + results.leagues.length + results.countries.length > 0;
  const inChat = chat.length > 0 || thinking;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "var(--coal-950, #131110)", display: "flex", flexDirection: "column",
    }}>
      {/* input bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px", borderBottom: "1px solid var(--border)",
        background: "var(--grad-header)",
        paddingTop: "max(10px, env(safe-area-inset-top))",
      }}>
        <span style={{ fontSize: 15, color: "var(--text-faint)" }}>⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") ask(q); if (e.key === "Escape") onClose(); }}
          placeholder={inChat ? "Ask a follow-up…" : "Search teams, players… or ask anything"}
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            fontSize: 16, color: "var(--text-primary)", fontFamily: "var(--font-ui)",
          }}
        />
        {q.trim().length > 0 && (
          <button onClick={() => ask(q)} disabled={thinking} style={{
            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
            background: "var(--grad-gold)", color: "var(--text-on-gold)",
            fontWeight: 700, fontSize: "var(--fs-xs)", padding: "6px 11px",
            cursor: "pointer", opacity: thinking ? 0.5 : 1,
          }}>Ask</button>
        )}
        <button onClick={onClose} aria-label="Close" style={{
          background: "transparent", border: "none", color: "var(--text-muted)",
          fontSize: 20, padding: "4px 6px", cursor: "pointer",
        }}>✕</button>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {hasResults && (
            <>
              {results.teams.length > 0 && <Group label="Teams">
                {results.teams.map(t => (
                  <RowBtn key={t.id} onClick={() => go(`/teams/${t.id}`)}
                    icon={<Crest team={t} size={18} />} name={t.name}
                    meta={t.is_national ? "National team" : "Club"} />
                ))}
              </Group>}
              {results.players.length > 0 && <Group label="Players">
                {results.players.map(p => (
                  <RowBtn key={p.id} onClick={() => go(`/players/${p.id}`)}
                    icon={p.photo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.photo_url} alt="" width={18} height={18}
                          style={{ borderRadius: "50%", objectFit: "cover" }} />
                      : <span>👤</span>}
                    name={p.name}
                    meta={[p.position, p.team_id != null ? results.playerClubs[p.team_id] : null]
                      .filter(Boolean).join(" · ")} />
                ))}
              </Group>}
              {results.leagues.length > 0 && <Group label="Leagues">
                {results.leagues.map(l => (
                  <RowBtn key={l.id} onClick={() => go(`/leagues/${l.id}`)}
                    icon={<span>🏆</span>} name={l.name} meta="" />
                ))}
              </Group>}
              {results.countries.length > 0 && <Group label="Countries">
                {results.countries.map(c => (
                  <RowBtn key={c.id} onClick={() => go(`/countries/${c.id}`)}
                    icon={<span>{flagFor(c.name, c.fifa_code)}</span>} name={c.name} meta="" />
                ))}
              </Group>}
              {q.trim().length > 0 && (
                <button onClick={() => ask(q)} style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%",
                  background: "var(--surface-tint)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: "10px 12px", margin: "4px 0 12px",
                  color: "var(--accent-2)", fontSize: "var(--fs-sm)", fontWeight: 600,
                  cursor: "pointer", textAlign: "left", fontFamily: "var(--font-ui)",
                }}>💬 Ask MPFC: “{q.trim()}”</button>
              )}
            </>
          )}

          {/* chat thread */}
          {chat.map((m, i) => (
            <div key={i} style={{
              margin: "8px 0",
              display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "88%", padding: "9px 12px",
                borderRadius: "var(--radius-xl)",
                background: m.role === "user" ? "var(--surface-tint)" : "var(--surface-panel)",
                border: "1px solid var(--border)",
                borderLeft: m.role === "assistant" ? "3px solid var(--accent-2)" : "1px solid var(--border)",
                fontSize: "var(--fs-sm)", lineHeight: 1.6, whiteSpace: "pre-wrap",
                color: m.role === "user" ? "var(--text-primary)" : "var(--text-muted)",
              }}>{m.content}</div>
            </div>
          ))}
          {thinking && (
            <div style={{
              margin: "8px 0", padding: "9px 12px", maxWidth: "88%",
              borderRadius: "var(--radius-xl)", background: "var(--surface-panel)",
              border: "1px solid var(--border)", borderLeft: "3px solid var(--accent-2)",
              fontSize: "var(--fs-sm)", color: "var(--text-faint)",
            }}>checking the data…</div>
          )}
          <div ref={bottomRef} />

          {/* empty state */}
          {!hasResults && !inChat && (
            <div style={{ textAlign: "center", padding: "34px 16px", color: "var(--text-faint)" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⌕</div>
              <div style={{ fontSize: "var(--fs-sm)", lineHeight: 1.7 }}>
                Find any team, player, league, or country —<br />
                or ask a question and get an answer built from<br />
                the app&apos;s own tables, model, and news.
              </div>
              <div style={{
                marginTop: 16, display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center",
              }}>
                {["Who's winning the Premier League?",
                  "Explain promotion and relegation",
                  "What happened in the World Cup final?",
                  "Any big transfers lately?"].map(s => (
                  <button key={s} onClick={() => ask(s)} style={{
                    border: "1px solid var(--border)", borderRadius: 999,
                    background: "var(--surface-panel)", color: "var(--text-muted)",
                    fontSize: "var(--fs-xs)", padding: "7px 12px", cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: "var(--fs-2xs)", textTransform: "uppercase",
        letterSpacing: "var(--tracking-label)", color: "var(--text-faint)",
        fontWeight: 700, margin: "0 2px 5px",
      }}>{label}</div>
      {children}
    </div>
  );
}

function RowBtn({ onClick, icon, name, meta }: {
  onClick: () => void; icon: React.ReactNode; name: string; meta: string;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%",
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "9px 11px", marginBottom: 5,
      cursor: "pointer", textAlign: "left", color: "inherit", fontFamily: "var(--font-ui)",
    }}>
      <span style={{ display: "inline-flex", width: 20, justifyContent: "center", fontSize: 14 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>{name}</span>
      {meta && <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>{meta}</span>}
      <span style={{ marginLeft: "auto", color: "var(--text-faint)" }}>›</span>
    </button>
  );
}
