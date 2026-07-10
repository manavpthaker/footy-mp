import React from "react";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Pad, eyebrow, mono } from "@/components/mobile/primitives";
// @ts-ignore
import { SectionHeading } from "@/components/ds";
// @ts-ignore
import { ProbabilityBar } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
// @ts-ignore
import { ScorelineGrid } from "@/components/ds";
// @ts-ignore
import { FormPills } from "@/components/ds";
// @ts-ignore
import { FactorBar } from "@/components/ds";
import { getMatch, formLast5, factorsForTeam, poissonMatrix } from "@/lib/data";
import { flagFor, shortNameFor, competitionCode } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MatchDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const m = await getMatch(id);
  if (!m) notFound();

  const [homeForm, awayForm, homeFactors, awayFactors] = await Promise.all([
    formLast5(m.home_team_id),
    formLast5(m.away_team_id),
    factorsForTeam(m.home_team_id),
    factorsForTeam(m.away_team_id),
  ]);

  const isFinal = m.status === "final";
  const isLive = m.status === "live";
  const kick = new Date(m.kickoff_utc);
  const home = m.home_team; const away = m.away_team;
  const compName = m.league?.name ?? "";
  const pred = m.prediction;
  const pH = pred?.p_home != null ? Math.round(Number(pred.p_home) * 100) : null;
  const pD = pred?.p_draw != null ? Math.round(Number(pred.p_draw) * 100) : null;
  const pA = pH != null && pD != null ? 100 - pH - pD : null;
  const verdict = verdictLine(m);

  return (
    <div>
      <ScreenHeader
        eyebrow={compName}
        title={`${home ? shortNameFor(home.name) : "TBD"} v ${away ? shortNameFor(away.name) : "TBD"}`}
      />
      <Pad style={{ paddingTop: 14 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8,
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-2xl)", padding: "16px 12px",
          boxShadow: isLive ? "inset 3px 0 0 var(--status-live)" : "none",
        }}>
          <TeamCell name={home?.name ?? "TBD"} />
          <div style={{ textAlign: "center" }}>
            <div style={{
              ...mono, fontSize: 32, fontWeight: 700, lineHeight: 1,
              color: isLive ? "var(--status-live)" : "var(--text-primary)",
            }}>
              {isFinal || isLive ? `${m.home_goals ?? 0}–${m.away_goals ?? 0}` : "vs"}
            </div>
            {m.went_pens && (
              <div style={{
                ...mono, fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 4,
              }}>{m.pens_home}–{m.pens_away} pens</div>
            )}
            <div style={{ ...eyebrow, marginTop: 6 }}>
              {isLive ? <span style={{ color: "var(--status-live)" }}>● {m.minute ?? 0}′</span>
                : isFinal ? "FULL TIME"
                : kick.toLocaleDateString(undefined, {
                    weekday: "short", month: "short", day: "numeric",
                  }) + " · " + kick.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <TeamCell name={away?.name ?? "TBD"} />
        </div>

        {pred && pH != null && pD != null && pA != null && (
          <>
            <SectionHeading tick="var(--accent-2)">
              {isFinal ? "What the model expected" : "Pre-match forecast"}
            </SectionHeading>
            <ProbabilityBar
              home={pH} draw={pD} away={pA}
              homeLabel={home ? shortNameFor(home.name) : null}
              awayLabel={away ? shortNameFor(away.name) : null}
              height={30}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              <StatCard label="expected goals"
                value={`${Number(pred.home_xg ?? 0).toFixed(2)}–${Number(pred.away_xg ?? 0).toFixed(2)}`} />
              <StatCard label="model" value="v1" unit=" · xG Dixon-Coles" />
            </div>
            {verdict && (
              <div style={{
                marginTop: 10, padding: "10px 12px",
                borderLeft: "3px solid var(--accent)",
                background: "var(--surface-tint)", borderRadius: "var(--radius-md)",
                fontSize: "var(--fs-sm)", color: "var(--text-muted)",
              }}>{verdict}</div>
            )}

            {pred.home_xg != null && pred.away_xg != null && (
              <>
                <SectionHeading>Scoreline odds</SectionHeading>
                <div style={{
                  background: "var(--surface-panel)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: 12,
                }}>
                  <ScorelineGrid
                    home={home ? shortNameFor(home.name) : "H"}
                    away={away ? shortNameFor(away.name) : "A"}
                    matrix={poissonMatrix(Number(pred.home_xg), Number(pred.away_xg), 5)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {(homeForm.length || awayForm.length) > 0 && home && away && (
          <>
            <SectionHeading tick="var(--gold)">Form · last 5</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FormPanel label={`${flagFor(home.name)} ${shortNameFor(home.name)}`} results={homeForm} />
              <FormPanel label={`${flagFor(away.name)} ${shortNameFor(away.name)}`} results={awayForm} />
            </div>
          </>
        )}

        {(homeFactors.length || awayFactors.length) > 0 && home && away && (
          <>
            <SectionHeading>What drives the forecast</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FactorPanel label={shortNameFor(home.name)} factors={homeFactors} />
              <FactorPanel label={shortNameFor(away.name)} factors={awayFactors} />
            </div>
            <div style={{ ...eyebrow, margin: "8px 2px 0" }}>
              z-scores vs field average · fitted on 2-season xG
            </div>
          </>
        )}
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

function TeamCell({ name }: { name: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 30 }}>{flagFor(name)}</div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 4,
      }}>{name}</div>
    </div>
  );
}

function FormPanel({ label, results }: { label: string; results: string[] }) {
  return (
    <div style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: "10px 12px",
    }}>
      <div style={{ ...eyebrow, marginBottom: 7 }}>{label}</div>
      {results.length
        ? <FormPills results={results} size={20} />
        : <div style={{ color: "var(--text-faint)", fontSize: "var(--fs-sm)" }}>—</div>}
    </div>
  );
}

function FactorPanel({ label, factors }: { label: string; factors: { label: string; z: number }[] }) {
  return (
    <div style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: "10px 10px 6px",
    }}>
      <div style={{ ...eyebrow, marginBottom: 8 }}>{label}</div>
      {factors.map(f => <FactorBar key={f.label} label={f.label} z={f.z} />)}
    </div>
  );
}

function verdictLine(m: any): string | null {
  if (m.status !== "final" || !m.prediction || m.prediction.p_home == null) return null;
  const h = Number(m.prediction.p_home);
  const d = Number(m.prediction.p_draw ?? 0);
  const a = Number(m.prediction.p_away ?? 0);
  const fav = h >= a && h >= d ? "home" : a >= h && a >= d ? "away" : "draw";
  const winner = m.went_pens ? (m.pens_home > m.pens_away ? "home" : "away")
    : m.home_goals > m.away_goals ? "home"
    : m.away_goals > m.home_goals ? "away" : "draw";
  const favP = Math.round(Math.max(h, d, a) * 100);
  if (fav === winner) return `Model favorite landed — priced ${favP}% pre-kick.`;
  const winP = Math.round((winner === "home" ? h : winner === "away" ? a : d) * 100);
  return `Upset by the model's book — the winner carried just ${winP}% pre-kick.`;
}
