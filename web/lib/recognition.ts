/** Verified career history; these are recognition cues, not claims about what
 * the user has watched. Sources checked September 19, 2026. */
export const RECOGNITION: Record<string, { previousClub: string; note: string; source: string }> = {
  "Harry Kane": {
    previousClub: "Tottenham Hotspur",
    note: "Played for Tottenham before moving to Bayern in 2023. You may also recognise him from England.",
    source: "https://fcbayern.com/en/teams/first-team/harry-kane",
  },
  "Luis Díaz": {
    previousClub: "Liverpool",
    note: "Played for Liverpool before joining Bayern in 2025. The same Díaz you know through Colombia.",
    source: "https://fcbayern.com/en/teams/first-team/luis-diaz",
  },
  "Michael Olise": {
    previousClub: "Crystal Palace",
    note: "Played for Crystal Palace from 2021 to 2024 before joining Bayern.",
    source: "https://fcbayern.com/en/teams/first-team/michael-olise",
  },
  "Jamal Musiala": {
    previousClub: "Chelsea",
    note: "Came through Chelsea’s youth system, then joined Bayern’s youth setup in 2019. This is an academy connection, not a Chelsea first-team career.",
    source: "https://fcbayern.com/en/teams/first-team/jamal-musiala",
  },
};

export function playerRole(position: string | null): { label: string; watch: string } {
  if (position?.startsWith("G")) return { label: "Goalkeeper", watch: "Watch the saves and how they start attacks." };
  if (position?.startsWith("D")) return { label: "Defender", watch: "Watch how they stop attacks and move the ball forward." };
  if (position?.startsWith("M") || position?.startsWith("AM")) return { label: "Midfielder", watch: "Watch how they win the ball and create chances." };
  if (position?.startsWith("F") || position?.startsWith("S") && position !== "Sub") return { label: "Forward", watch: "Watch their runs, chances and shots on goal." };
  return { label: "Player", watch: "Start with one moment that stands out." };
}
