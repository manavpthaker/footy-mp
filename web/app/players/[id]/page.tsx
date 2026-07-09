import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { FollowButton } from "@/components/FollowButton";
import { getPlayer, getTeam, getCountry, listFollows } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const player = await getPlayer(id);
  if (!player) notFound();

  const [follows, team, country] = await Promise.all([
    listFollows(),
    player.team_id ? getTeam(player.team_id) : Promise.resolve(null),
    player.country_id ? getCountry(player.country_id) : Promise.resolve(null),
  ]);
  const followed = follows.some(f => f.entity_type === "player" && f.entity_id === id);

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", margin: 0,
            textTransform: "uppercase", letterSpacing: "0.02em", fontWeight: 800,
          }}>{player.name}</h1>
          {player.position && (
            <span style={{
              fontSize: "var(--fs-xs)", padding: "3px 8px",
              background: "var(--surface-raised)", color: "var(--text-muted)",
              borderRadius: "var(--radius-sm)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{player.position}</span>
          )}
          <div style={{ flex: 1 }} />
          <FollowButton entityType="player" entityId={id} initialFollowed={followed} />
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14,
        }}>
          {team && (
            <Link href={`/teams/${team.id}`} style={panelLink}>
              <div style={eyebrow}>club</div>
              <div style={{ fontSize: "var(--fs-title)", fontWeight: 700, marginTop: 4 }}>
                {team.name}
              </div>
            </Link>
          )}
          {country && (
            <Link href={`/countries/${country.id}`} style={panelLink}>
              <div style={eyebrow}>nationality</div>
              <div style={{ fontSize: "var(--fs-title)", fontWeight: 700, marginTop: 4 }}>
                {country.name}
              </div>
            </Link>
          )}
        </div>

        <SectionHeading eyebrow="notes">Player stats</SectionHeading>
        <p style={{ color: "var(--text-muted)" }}>
          Match-level xG/xA appears here once the Understat player backfill runs.
        </p>
      </div>
    </AppShell>
  );
}

const panelLink: React.CSSProperties = {
  padding: 16, borderRadius: "var(--radius-xl)",
  background: "var(--surface-panel)", border: "1px solid var(--border)",
  color: "var(--text-primary)", display: "block",
};
const eyebrow: React.CSSProperties = {
  fontSize: "var(--fs-2xs)", color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
};
