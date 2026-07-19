import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { sameOrigin } from "@/lib/admin";
import { searchEntities } from "@/lib/search";
import {
  standingsForLeague, tableableLeagues, getTeam, getLeague, getMatch,
  upcomingForTeams, recentResultsForTeams, upcomingAll, resultsAll, liveMatches,
  latestRatingForTeam, formLast5, playersOnTeam, getLowdown, getPlayer,
  playerStatBlocks, squadByClub, recentMovements,
} from "@/lib/data";
import { newsForTeam, generalFootballNews } from "@/lib/news";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // tool loops need more than the default 10s

/**
 * Ask MPFC — a chat assistant grounded in the app's own database.
 * Claude answers via tool calls against Supabase (standings, fixtures,
 * model predictions, lowdowns, news) rather than from memory, so answers
 * reflect what the app actually knows today.
 *
 * Requires ANTHROPIC_API_KEY in the deployment env (same key the pipeline
 * uses for The Lowdown). Without it the endpoint degrades to a clear message.
 */

const MODEL = "claude-opus-4-8";
const MAX_TURNS = 16;             // history cap sent to the model
const MAX_ITERATIONS = 8;         // tool-loop cap per question

const j = (x: unknown) => JSON.stringify(x);

function compactMatch(m: any) {
  return {
    match_id: m.id,
    kickoff_utc: m.kickoff_utc,
    status: m.status,
    competition: m.league?.name ?? null,
    home: m.home_team?.name ?? "TBD",
    away: m.away_team?.name ?? "TBD",
    score: m.status !== "scheduled" ? `${m.home_goals ?? 0}-${m.away_goals ?? 0}` : null,
    pens: m.went_pens ? `${m.pens_home}-${m.pens_away}` : null,
    model_probabilities: m.prediction?.p_home != null ? {
      home: Number(m.prediction.p_home), draw: Number(m.prediction.p_draw),
      away: Number(m.prediction.p_away),
    } : null,
  };
}

function buildTools() {
  return [
    betaTool({
      name: "search_entities",
      description:
        "Search the app's database for teams, players, leagues, and countries by name. "
        + "Call this first whenever the user mentions an entity, to resolve its id for other tools.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "Name or partial name" } },
        required: ["query"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const r = await searchEntities(String(input.query), 5);
        return j({
          teams: r.teams.map(t => ({ id: t.id, name: t.name, is_national: t.is_national })),
          players: r.players.map(p => ({
            id: p.id, name: p.name, position: p.position,
            club: p.team_id ? r.playerClubs[p.team_id] ?? null : null,
          })),
          leagues: r.leagues.map(l => ({ id: l.id, name: l.name })),
          countries: r.countries.map(c => ({ id: c.id, name: c.name })),
        });
      },
    }),
    betaTool({
      name: "get_standings",
      description:
        "Current league table for a league id (from search_entities). Returns season label, "
        + "whether the season is complete, and the rows (position, team, P/W/D/L/GD/Pts, form).",
      inputSchema: {
        type: "object",
        properties: { league_id: { type: "integer" } },
        required: ["league_id"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const s = await standingsForLeague(Number(input.league_id));
        return j({
          league: s.league?.name, season: s.season, season_complete: s.complete,
          rows: s.rows.map(r => ({
            pos: r.pos, team: r.team, P: r.P, W: r.W, D: r.D, L: r.L,
            GD: r.GD, Pts: r.Pts, form: r.form.join(""), zone: r.zone,
          })),
        });
      },
    }),
    betaTool({
      name: "list_leagues",
      description: "List the domestic leagues that have standings available.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false } as const,
      run: async () => {
        const ls = await tableableLeagues();
        return j(ls.map(l => ({ id: l.id, name: l.name })));
      },
    }),
    betaTool({
      name: "get_team",
      description:
        "Everything about one team id: profile, model rating (attack/defense xG), last-5 form, "
        + "next fixtures, recent results, and squad size. For national teams also where the squad plays.",
      inputSchema: {
        type: "object",
        properties: { team_id: { type: "integer" } },
        required: ["team_id"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const id = Number(input.team_id);
        const team = await getTeam(id);
        if (!team) return j({ error: "team not found" });
        const [league, rating, form, upcoming, results, players, ntClubs] = await Promise.all([
          team.league_id ? getLeague(team.league_id) : null,
          latestRatingForTeam(id),
          formLast5(id),
          upcomingForTeams([id], 5),
          recentResultsForTeams([id], 5),
          playersOnTeam(id),
          team.is_national && team.country_id ? squadByClub(team.country_id) : [],
        ]);
        return j({
          team: { id: team.id, name: team.name, is_national: team.is_national, league: league?.name ?? null },
          model_rating: rating ? {
            attack_xg: Number(rating.attack), defense_xga: Number(rating.defense),
            overall: Number(rating.overall),
          } : null,
          form_last5: form.join(""),
          next_fixtures: upcoming.map(compactMatch),
          recent_results: results.map(compactMatch),
          squad_size: players.length,
          squad_by_club: ntClubs.slice(0, 12).map(g => ({
            club: g.club?.name ?? "untracked", players: g.players.map(p => p.name),
          })),
        });
      },
    }),
    betaTool({
      name: "get_player",
      description:
        "One player id: profile, current club, season and World Cup 2026 stat totals, recent match log.",
      inputSchema: {
        type: "object",
        properties: { player_id: { type: "integer" } },
        required: ["player_id"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const id = Number(input.player_id);
        const p = await getPlayer(id);
        if (!p) return j({ error: "player not found" });
        const [club, blocks] = await Promise.all([
          p.team_id ? getTeam(p.team_id) : null,
          playerStatBlocks(id, 5),
        ]);
        return j({
          player: { id: p.id, name: p.name, position: p.position, club: club?.name ?? null },
          season_totals: blocks.season, world_cup_2026: blocks.worldCup,
          recent_matches: blocks.log,
        });
      },
    }),
    betaTool({
      name: "get_matches",
      description:
        "Matches by scope: 'live' (in play now), 'upcoming' (next scheduled), 'recent' (latest results). "
        + "Includes the model's win probabilities where available.",
      inputSchema: {
        type: "object",
        properties: { scope: { type: "string", enum: ["live", "upcoming", "recent"] } },
        required: ["scope"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const scope = String(input.scope);
        const ms = scope === "live" ? await liveMatches()
          : scope === "upcoming" ? await upcomingAll(25)
          : await resultsAll(25);
        return j(ms.map(compactMatch));
      },
    }),
    betaTool({
      name: "get_match",
      description:
        "Full detail for one match id: score/state, model prediction (win probs, expected goals, "
        + "knockout advance odds), and The Lowdown (the app's AI commentary) if written.",
      inputSchema: {
        type: "object",
        properties: { match_id: { type: "integer" } },
        required: ["match_id"],
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const id = Number(input.match_id);
        const m = await getMatch(id);
        if (!m) return j({ error: "match not found" });
        const lowdown = await getLowdown(id);
        return j({
          ...compactMatch(m),
          phase: m.phase, season: m.season, is_knockout: m.is_knockout,
          expected_goals: m.prediction ? {
            home: Number(m.prediction.home_xg), away: Number(m.prediction.away_xg),
          } : null,
          advance_odds: m.prediction?.p_advance_home != null ? {
            home_advance: Number(m.prediction.p_advance_home),
            extra_time: m.prediction.p_et != null ? Number(m.prediction.p_et) : null,
            penalties: m.prediction.p_pens != null ? Number(m.prediction.p_pens) : null,
          } : null,
          lowdown: lowdown ? { state: lowdown.state, verdict: lowdown.verdict, paragraphs: lowdown.paragraphs } : null,
        });
      },
    }),
    betaTool({
      name: "get_news",
      description:
        "Recent football news headlines. Pass a team/player/topic to focus, or omit for the general wire "
        + "(transfers, manager moves, big storylines).",
      inputSchema: {
        type: "object",
        properties: { topic: { type: "string", description: "Optional — e.g. a team or player name" } },
        additionalProperties: false,
      } as const,
      run: async (input: any) => {
        const topic = input?.topic ? String(input.topic) : null;
        const items = topic ? await newsForTeam(topic, 8) : await generalFootballNews(10);
        return j(items.map(n => ({ title: n.title, source: n.source, published: n.publishedAt })));
      },
    }),
    betaTool({
      name: "get_transfers",
      description: "Latest player transfers and promotion/relegation moves the app has recorded.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false } as const,
      run: async () => {
        const moves = await recentMovements(15);
        return j(moves.map(mv => ({
          kind: mv.kind, player: mv.player?.name ?? null,
          from: mv.from_team?.name ?? mv.from_league?.name ?? null,
          to: mv.to_team?.name ?? mv.to_league?.name ?? null,
          noticed: (mv.noticed_at ?? "").slice(0, 10), note: mv.note,
        })));
      },
    }),
  ];
}

const SYSTEM = `You are MPFC's assistant — the in-app guide for a personal
world-football companion app that tracks 27 competitions from World Cup 2026
to 2030 with an xG-based match model.

Your job: make the user the most informed person at the water cooler, fast.
They don't have time to watch matches — give them the story, the context, and
the "why it matters".

Ground rules:
- Answer from tool results, not memory. Resolve names with search_entities
  first, then fetch. If the app has no data on something, say so plainly and
  answer with clearly-labeled general knowledge only if it helps.
- Numbers (probabilities, tables, stats) must come from tool results.
- Voice: sharp, warm, direct — a knowledgeable friend, not a database. Short
  answers for simple questions; a few tight paragraphs for "explain" questions.
- Teach when asked: promotion/relegation, European qualification, transfer
  windows, tournament formats — explain like they're smart but new to it.
- When you mention a specific match, team, or player the user might want to
  open, note it naturally (e.g. "worth opening the Arsenal page") — the app
  has pages for teams, players, matches, and leagues.`;

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply: "Chat isn't configured yet — add ANTHROPIC_API_KEY to the deployment environment.",
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .slice(-MAX_TURNS)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "no question" }, { status: 400 });
  }

  const client = new Anthropic();
  try {
    const runner = client.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 4000,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: buildTools(),
      messages,
      max_iterations: MAX_ITERATIONS,
    });
    const final = await runner.runUntilDone();
    const reply = final.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ reply: reply || "I came up empty on that one — try rephrasing?" });
  } catch (e: any) {
    console.error("[chat]", e?.message ?? e);
    return NextResponse.json({
      reply: "Something went wrong talking to the model — give it another try in a moment.",
    });
  }
}
