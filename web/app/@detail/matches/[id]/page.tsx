import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Crest } from "@/components/ds/Crest";
import { Pad, eyebrow, mono } from "@/components/mobile/primitives";
import { AskAbout } from "@/components/search/AskAbout";
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
import { getMatch, formLast5, factorsForTeam, poissonMatrix, getLowdown, MODEL_VERSION } from "@/lib/data";
import { flagFor, shortNameFor, competitionCode, isPlaceholderTeam, phaseLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const m = await getMatch(Number(params.id));
  if (!m) return { title: "Match" };
  const h = m.home_team?.name ?? "TBD";
  const a = m.away_team?.name ?? "TBD";
  return { title: `${h} v ${a}${m.league?.name ? ` · ${m.league.name}` : ""}` };
}

export default async function MatchDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const m = await getMatch(id);
  if (!m) notFound();

  const [homeForm, awayForm, homeFactors, awayFactors, lowdown] = await Promise.all([
    formLast5(m.home_team_id),
    formLast5(m.away_team_id),
    factorsForTeam(m.home_team_id),
    factorsForTeam(m.away_team_id),
    getLowdown(id),
  ]);

  const isFinal = m.status === "final";
  const isLive = m.status === "live";
  const kick = new Date(m.kickoff_utc);
  const home = m.home_team; const away = m.away_team;
  const compName = m.league?.name ?? "";
  const placeholder = isPlaceholderTeam(home?.name) || isPlaceholderTeam(away?.name);
  const pred = placeholder ? undefined : m.prediction;
  const pH = pred?.p_home != null ? Math.round(Number(pred.p_home) * 100) : null;
  const pD = pred?.p_draw != null ? Math.round(Number(pred.p_draw) * 100) : null;
  const pA = pH != null && pD != null ? 100 - pH - pD : null;
  const verdict = verdictLine(m);
  const phase = phaseLabel(m.phase);
  const context = matchContext(m);
  const knockoutOdds = pred && m.is_knockout && !isFinal
    && pred.p_advance_home != null;

  return (
    <div>
      <ScreenHeader
        eyebrow={[compName, phase, m.season].filter(Boolean).join(" · ")}
        title={`${home ? shortNameFor(home.name) : "TBD"} v ${away ? shortNameFor(away.name) : "TBD"}`}
      />
      <Pad style={{ paddingTop: 14 }}>
       <div className="">
        <div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8,
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-2xl)", padding: "16px 12px",
          boxShadow: isLive ? "inset 3px 0 0 var(--status-live)" : "none",
        }}>
          <TeamCell team={home} id={m.home_team_id} />
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
          <TeamCell team={away} id={m.away_team_id} />
        </div>

        <section style={{
          marginTop: 12, padding: "12px 13px", background: "var(--surface-tint)",
          border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ ...eyebrow, color: "var(--accent)" }}>{context.label}</div>
          <div style={{ marginTop: 4, fontSize: "var(--fs-h2)", fontWeight: 700, lineHeight: 1.35 }}>
            {context.title}
          </div>
          <p style={{ margin: "6px 0 10px", color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
            {context.body}
          </p>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            {m.league_id && (
              <Link href={`/leagues/${m.league_id}`} style={{
                color: "var(--accent-2)", fontSize: "var(--fs-xs)", fontWeight: 700,
              }}>Understand {compName || "the competition"} →</Link>
            )}
            <AskAbout
              question={`Why does ${home?.name ?? "the home team"} v ${away?.name ?? "the away team"} matter, and what should I know before reading the stats?`}
            />
          </div>
        </section>

        {lowdown && lowdown.paragraphs.length > 0 && (
          <>
            <SectionHeading tick={lowdown.state === "live" ? "var(--status-live)" : "var(--accent)"}>
              {lowdown.state === "live" ? "The lowdown · live"
                : lowdown.state === "post" ? "The lowdown · full time"
                : "The lowdown"}
            </SectionHeading>
            <div style={{
              background: "var(--surface-panel)", border: "1px solid var(--border)",
              borderLeft: "3px solid var(--accent-2)",
              borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              padding: "13px 16px",
            }}>
              {lowdown.verdict && (
                <p style={{
                  margin: "0 0 9px", fontSize: "var(--fs-sm)", lineHeight: 1.65,
                  fontWeight: 700, color: "var(--text-primary)",
                }}>{lowdown.verdict}</p>
              )}
              {lowdown.paragraphs.map((p, i) => (
                <p key={i} style={{
                  margin: i ? "9px 0 0" : 0, fontSize: "var(--fs-sm)",
                  lineHeight: 1.65, color: "var(--text-muted)",
                }}>{p}</p>
              ))}
            </div>
          </>
        )}

        {pred && pH != null && pD != null && pA != null && (
          <>
            <SectionHeading tick="var(--accent-2)">
              {isFinal ? "Model view · before kickoff" : "Model view"}
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
              <StatCard label="model" value={MODEL_VERSION.replace("footy-mp-", "")} unit=" · xG Dixon-Coles" />
            </div>

            {knockoutOdds && (
              <>
                <SectionHeading tick="var(--gold)">If it stays level</SectionHeading>
                <div style={{
                  background: "var(--surface-panel)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "12px 14px",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                    <div>
                      <div style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--gold)" }}>
                        {Math.round(Number(pred.p_advance_home) * 100)}%
                      </div>
                      <div style={{ ...eyebrow, marginTop: 3 }}>
                        {home ? shortNameFor(home.name) : "home"} advance
                      </div>
                    </div>
                    <div>
                      <div style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700 }}>
                        {pred.p_et != null ? `${Math.round(Number(pred.p_et) * 100)}%` : "—"}
                      </div>
                      <div style={{ ...eyebrow, marginTop: 3 }}>extra time</div>
                    </div>
                    <div>
                      <div style={{ ...mono, fontSize: "var(--fs-h2)", fontWeight: 700 }}>
                        {pred.p_pens != null ? `${Math.round(Number(pred.p_pens) * 100)}%` : "—"}
                      </div>
                      <div style={{ ...eyebrow, marginTop: 3 }}>penalties</div>
                    </div>
                  </div>
                  <div style={{ ...eyebrow, marginTop: 9, textAlign: "center" }}>
                    knockout math: 90 minutes → extra time → shootout, incl. each side&apos;s
                    shootout record + nerves
                  </div>
                </div>
              </>
            )}
            {verdict && (
              <div style={{
                marginTop: 10, padding: "10px 12px",
                borderLeft: "3px solid var(--accent)",
                background: "var(--surface-tint)", borderRadius: "var(--radius-md)",
                fontSize: "var(--fs-sm)", color: "var(--text-muted)",
              }}>{verdict}</div>
            )}

            {pred.home_xg != null && pred.away_xg != null && (
              <details style={{
                marginTop: 16, background: "var(--surface-panel)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
              }}>
                <summary style={{
                  cursor: "pointer", padding: "10px 12px", fontSize: "var(--fs-sm)",
                  fontWeight: 700, color: "var(--text-muted)",
                }}>Dig into exact scoreline probabilities</summary>
                <div style={{ padding: "2px 12px 12px" }}>
                  <ScorelineGrid
                    home={home ? shortNameFor(home.name) : "H"}
                    away={away ? shortNameFor(away.name) : "A"}
                    matrix={poissonMatrix(Number(pred.home_xg), Number(pred.away_xg), 5)}
                  />
                </div>
              </details>
            )}
          </>
        )}
        </div>

        {/* Right column on desktop: form + factor drivers (stacks below scoreboard on mobile) */}
        <div>
        {(homeForm.length || awayForm.length) > 0 && home && away && (
          <>
            <SectionHeading tick="var(--gold)">Form · last 5</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FormPanel label={`${flagFor(home.name)} ${shortNameFor(home.name)}`} results={homeForm}
                href={`/teams/${m.home_team_id}`} />
              <FormPanel label={`${flagFor(away.name)} ${shortNameFor(away.name)}`} results={awayForm}
                href={`/teams/${m.away_team_id}`} />
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
        </div>
       </div>
        <div style={{ height: 16 }} />
      </Pad>
    </div>
  );
}

/** Team block on the scoreboard — links through to the team page so a match
 *  is always one tap away from either side. Placeholder teams ("SF1 Winner")
 *  stay unlinked. */
function TeamCell({ team, id }: { team: any; id: number | null }) {
  const name: string = team?.name ?? "TBD";
  const linkable = id != null && team && !isPlaceholderTeam(name);
  const body = (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Crest team={team} name={name} size={34} />
      </div>
      <div style={{
        fontWeight: 700, fontSize: "var(--fs-sm)",
        textTransform: "uppercase", letterSpacing: "0.03em", marginTop: 4,
      }}>
        {name}
        {linkable && <span style={{ color: "var(--text-faint)", marginLeft: 4 }}>›</span>}
      </div>
    </div>
  );
  return linkable ? <Link href={`/teams/${id}`}>{body}</Link> : body;
}

function FormPanel({ label, results, href }: { label: string; results: string[]; href?: string }) {
  const body = (
    <div style={{
      background: "var(--surface-panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", padding: "10px 12px",
    }}>
      <div style={{ ...eyebrow, marginBottom: 7 }}>{label}{href ? " ›" : ""}</div>
      {results.length
        ? <FormPills results={results} size={20} />
        : <div style={{ color: "var(--text-faint)", fontSize: "var(--fs-sm)" }}>—</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
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

function matchContext(m: any): { label: string; title: string; body: string } {
  const competition = m.league?.name ?? "This competition";
  const phase = phaseLabel(m.phase);
  if (m.status === "live") {
    return {
      label: "What is happening",
      title: `${competition} is live${phase ? ` in the ${phase.toLowerCase()}` : ""}.`,
      body: "The score is the immediate story. The competition format and match state tell you what that score can change.",
    };
  }
  if (m.status === "final") {
    return {
      label: "What happened",
      title: `${m.home_team?.name ?? "The home team"} ${m.home_goals ?? 0}–${m.away_goals ?? 0} ${m.away_team?.name ?? "the away team"}.`,
      body: m.is_knockout
        ? "This was a knockout match, so progression matters more than the ninety-minute score alone."
        : "This result now feeds the competition table, each team's form and the next model update.",
    };
  }
  if (m.is_knockout) {
    return {
      label: "What is at stake",
      title: `${phase ?? "Knockout football"}: one side moves closer to the trophy.`,
      body: "If the match is level after ninety minutes, this round can continue through extra time and penalties. Advance odds matter more than win-in-90 odds.",
    };
  }
  switch (m.league?.format) {
    case "qualifiers":
      return {
        label: "What is at stake",
        title: `${competition} is part of the road to the next World Cup.`,
        body: "Qualification is built across several international windows, so this match is one step in a longer campaign rather than a standalone event.",
      };
    case "cup":
      return {
        label: "What is at stake",
        title: `${competition} connects clubs from different domestic leagues.`,
        body: "Check the phase before reading the score: league-phase points, two-leg aggregate scores and one-match knockouts create different incentives.",
      };
    case "league":
      return {
        label: "What is at stake",
        title: `Three points are available in the ${competition}.`,
        body: "A win is worth three points and a draw one. The meaning of this match comes from the title race, qualification places and relegation fight around it.",
      };
    default:
      return {
        label: "Match context",
        title: `${competition}${phase ? ` · ${phase}` : ""}`,
        body: "Start with the competition and phase, then use form and the model to understand how the teams arrived here.",
      };
  }
}
