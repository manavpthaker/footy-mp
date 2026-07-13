"use client";
import React from "react";
import Link from "next/link";
import { Pad, Segmented, eyebrow, EmptyState } from "@/components/mobile/primitives";
import { FixtureItem } from "@/components/mobile/FixtureItem";
// @ts-ignore
import { RatingRing } from "@/components/ds";
// @ts-ignore
import { StatCard } from "@/components/ds";
// @ts-ignore
import { FormPills } from "@/components/ds";
// @ts-ignore
import { FactorBar } from "@/components/ds";
// @ts-ignore
import { PlayerCard } from "@/components/ds";
import type { RichMatch } from "@/lib/data";
import type { Player, Team } from "@/lib/supabase";

export function TeamClient({
  team, rating, form, factors, players, upcoming, results, followedTeamIds,
  keyPlayerIds = [],
}: {
  team: Team;
  rating: { att: number; def: number; overall: number | null } | null;
  form: string[];
  factors: { label: string; z: number }[];
  players: Player[];
  upcoming: RichMatch[];
  results: RichMatch[];
  followedTeamIds: number[];
  keyPlayerIds?: number[];
}) {
  const [tab, setTab] = React.useState<"matches" | "squad" | "model">("matches");
  const followedSet = React.useMemo(() => new Set(followedTeamIds), [followedTeamIds]);
  return (
    <Pad style={{ paddingTop: 14 }}>
      {rating && (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "var(--surface-panel)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-2xl)", padding: "13px 14px",
        }}>
          {rating.overall != null && <RatingRing value={rating.overall} size={62} label="rating" />}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatCard label="attack · xG" value={rating.att.toFixed(2)} accent="var(--accent)" style={{ padding: "9px 11px" }} />
            <StatCard label="defense · xGA" value={rating.def.toFixed(2)} accent="var(--accent-2)" style={{ padding: "9px 11px" }} />
          </div>
        </div>
      )}

      {form.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 2px 0" }}>
          <span style={eyebrow}>form</span>
          <FormPills results={form} size={20} />
        </div>
      )}

      <div style={{ margin: "14px 0 10px" }}>
        <Segmented value={tab} onChange={setTab} options={[
          { value: "matches", label: "Matches" },
          { value: "squad", label: players.length ? `Squad · ${players.length}` : "Squad" },
          { value: "model", label: "Model" },
        ]} />
      </div>

      {tab === "matches" && (
        <>
          {upcoming.length > 0 && (
            <>
              <div style={{ ...eyebrow, margin: "2px 2px 7px" }}>next up</div>
              {upcoming.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedSet} />)}
            </>
          )}
          <div style={{ ...eyebrow, margin: "10px 2px 7px" }}>results</div>
          {results.length
            ? results.map(m => <FixtureItem key={m.id} m={m} followedTeamIds={followedSet} />)
            : <EmptyState>No recorded results.</EmptyState>}
        </>
      )}

      {tab === "squad" && (
        players.length
          ? players.map(p => (
              <Link key={p.id} href={`/players/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <PlayerCard lead={p.position ?? "—"} name={p.name}
                  club={`${p.position ?? "—"} · ${team.is_national ? "national" : ""}`}
                  isKey={keyPlayerIds.includes(p.id)} />
              </Link>
            ))
          : <EmptyState>Squad fills in as the player backfill lands.</EmptyState>
      )}

      {tab === "model" && (
        factors.length ? (
          <div style={{
            background: "var(--surface-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "12px 12px 6px",
          }}>
            <div style={{ ...eyebrow, marginBottom: 9 }}>what drives the rating</div>
            {factors.map(f => <FactorBar key={f.label} label={f.label} z={f.z} />)}
            <div style={{ ...eyebrow, margin: "6px 0 8px", letterSpacing: "0.06em" }}>
              recency-weighted xG for/against · fitted home edge
            </div>
          </div>
        ) : <EmptyState>No model rating yet for this team.</EmptyState>
      )}
      <div style={{ height: 16 }} />
    </Pad>
  );
}
