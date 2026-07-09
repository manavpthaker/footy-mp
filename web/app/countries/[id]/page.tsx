import { notFound } from "next/navigation";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { MatchRow } from "@/components/MatchRow";
import { FollowButton } from "@/components/FollowButton";
import {
  getCountry, listFollows, upcomingForTeams, recentResultsForTeams,
} from "@/lib/data";
import { server } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CountryPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const country = await getCountry(id);
  if (!country) notFound();

  const follows = await listFollows();
  const followed = follows.some(f => f.entity_type === "country" && f.entity_id === id);

  // find national team + all players from this country
  const s = await server();
  const { data: nt } = await s.from("teams")
    .select("*").eq("country_id", id).eq("is_national", true).maybeSingle();
  const { data: players } = await s.from("players")
    .select("id,name,team_id,position").eq("country_id", id).order("name");

  const teamIds = nt ? [nt.id] : [];
  const [upcoming, recent] = await Promise.all([
    upcomingForTeams(teamIds, 10),
    recentResultsForTeams(teamIds, 20),
  ]);

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", margin: 0,
            textTransform: "uppercase", letterSpacing: "0.02em", fontWeight: 800,
          }}>{country.name}</h1>
          {country.fifa_code && <span style={{
            fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "var(--fs-body)",
          }}>{country.fifa_code}</span>}
          {country.confederation && <span style={{
            fontSize: "var(--fs-xs)", padding: "3px 8px",
            background: "var(--surface-raised)", color: "var(--text-muted)",
            borderRadius: "var(--radius-sm)", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>{country.confederation}</span>}
          <div style={{ flex: 1 }} />
          <FollowButton entityType="country" entityId={id} initialFollowed={followed} />
        </div>

        {nt && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22,
          }}>
            <div>
              <SectionHeading eyebrow="national team · next">Upcoming</SectionHeading>
              {upcoming.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {upcoming.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              ) : <p style={{ color: "var(--text-muted)" }}>No scheduled matches.</p>}
            </div>
            <div>
              <SectionHeading eyebrow="results">Recent</SectionHeading>
              {recent.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recent.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              ) : <p style={{ color: "var(--text-muted)" }}>No results yet.</p>}
            </div>
          </div>
        )}

        {(players ?? []).length > 0 && (
          <div>
            <SectionHeading eyebrow="players from this country">Notable players</SectionHeading>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6,
            }}>
              {(players ?? []).map(p => (
                <a key={p.id} href={`/players/${p.id}`}
                  style={{
                    padding: "8px 10px", borderRadius: "var(--radius-md)",
                    background: "var(--surface-tint)", border: "1px solid var(--border-soft)",
                    color: "var(--text-primary)", display: "flex", justifyContent: "space-between",
                  }}>
                  <span>{p.name}</span>
                  <span style={{ color: "var(--text-faint)", fontSize: "var(--fs-xs)" }}>{p.position ?? "—"}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
