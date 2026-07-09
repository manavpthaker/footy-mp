import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell, Panel, SectionHeading } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { server } from "@/lib/supabase";
import { MODEL_VERSION } from "@/lib/data";
import type { Match, Team, League, Prediction } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadMatch(id: number) {
  const s = await server();
  const { data: m } = await s.from("matches").select("*").eq("id", id).maybeSingle();
  if (!m) return null;
  const match = m as Match;
  const [homeR, awayR, leagueR, predR] = await Promise.all([
    s.from("teams").select("*").eq("id", match.home_team_id).maybeSingle(),
    s.from("teams").select("*").eq("id", match.away_team_id).maybeSingle(),
    match.league_id
      ? s.from("leagues").select("*").eq("id", match.league_id).maybeSingle()
      : Promise.resolve({ data: null }),
    s.from("predictions").select("*")
      .eq("match_id", id).eq("model_version", MODEL_VERSION).maybeSingle(),
  ]);
  return {
    match,
    home: homeR.data as Team | null,
    away: awayR.data as Team | null,
    league: leagueR.data as League | null,
    prediction: predR.data as Prediction | null,
  };
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const bundle = await loadMatch(id);
  if (!bundle) notFound();
  const { match, home, away, league, prediction } = bundle;
  const kickoff = new Date(match.kickoff_utc);

  const isLive = match.status === "live";
  const isFinal = match.status === "final";

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {league && (
          <Link href={`/leagues/${league.id}`} style={{
            fontSize: "var(--fs-xs)", color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>← {league.name}</Link>
        )}

        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20,
        }}>
          <TeamHero name={home?.name ?? "—"} align="right" teamId={match.home_team_id} />
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 42, fontWeight: 700,
            fontVariantNumeric: "tabular-nums", textAlign: "center", lineHeight: 1,
          }}>
            {isFinal ? `${match.home_goals} – ${match.away_goals}` :
             isLive ? <span style={{ color: "var(--status-live)" }}>{match.home_goals ?? 0} – {match.away_goals ?? 0}</span> :
             "vs"}
            {match.went_pens && (
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                ({match.pens_home}–{match.pens_away} p)
              </div>
            )}
            <div style={{
              fontFamily: "var(--font-ui)", fontSize: "var(--fs-xs)",
              color: "var(--text-muted)", marginTop: 8, fontWeight: 500,
            }}>
              {isLive ? `LIVE · ${match.minute ?? 0}′` :
               isFinal ? "FT" :
               kickoff.toLocaleString(undefined, {
                 weekday: "short", month: "short", day: "numeric",
                 hour: "2-digit", minute: "2-digit",
               })}
            </div>
          </div>
          <TeamHero name={away?.name ?? "—"} align="left" teamId={match.away_team_id} />
        </div>

        {prediction && (
          <Panel>
            <SectionHeading eyebrow="model prediction · footy-mp v1">
              What we expected
            </SectionHeading>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="p(home)" value={pct(prediction.p_home)} tone="accent" />
              <StatCard label="p(draw)" value={pct(prediction.p_draw)} />
              <StatCard label="p(away)" value={pct(prediction.p_away)} tone="steel" />
              <StatCard label="expected goals"
                        value={`${(prediction.home_xg ?? 0).toFixed(2)} – ${(prediction.away_xg ?? 0).toFixed(2)}`} />
              {prediction.p_advance_home !== null && (
                <StatCard label="home advances" value={pct(prediction.p_advance_home)} tone="gold"
                          sub={`ET: ${pct(prediction.p_et)} · pens: ${pct(prediction.p_pens)}`} />
              )}
            </div>
          </Panel>
        )}

        {isLive && (
          <Panel style={{ borderColor: "var(--status-live)", borderWidth: 1 }}>
            <SectionHeading eyebrow="the lowdown">Live read</SectionHeading>
            <p style={{ color: "var(--text-primary)", margin: 0 }}>
              {home?.name} vs {away?.name} — {match.minute ?? 0} minutes in,
              scoreline {match.home_goals ?? 0}–{match.away_goals ?? 0}.
              {prediction && ` The model priced this at ${pct(prediction.p_home)} home / ${pct(prediction.p_draw)} draw / ${pct(prediction.p_away)} away pre-kick, with ${(prediction.home_xg ?? 0).toFixed(1)}–${(prediction.away_xg ?? 0).toFixed(1)} expected goals.`}
            </p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function pct(v: number | null) {
  if (v === null || v === undefined) return "—";
  return `${Math.round(v * 100)}%`;
}

function TeamHero({ name, align, teamId }: { name: string; align: "left" | "right"; teamId: number }) {
  return (
    <Link href={`/teams/${teamId}`}
      style={{
        fontFamily: "var(--font-display)", fontSize: "var(--fs-title)",
        fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase",
        textAlign: align, color: "var(--text-primary)",
      }}>{name}</Link>
  );
}
