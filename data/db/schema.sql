-- footy-mp — Supabase Postgres schema (baseline incl. migration 002)
-- Fresh install: run this, then skip migrations. Existing DB: run
-- data/db/migrations/002_backbone.sql instead.
-- Single-user; follows default to user 'mp'. RLS: anon = read-only (see bottom);
-- all writes go through the service role (ETL + server API routes).

-- ---------- reference tables ----------

create table if not exists countries (
  id            bigint generated always as identity primary key,
  name          text not null unique,
  fifa_code     text,                 -- e.g. COL, CHE
  confederation text                  -- CONMEBOL, UEFA, CAF, AFC, CONCACAF, OFC
);

create table if not exists leagues (
  id              bigint generated always as identity primary key,
  name            text not null,
  country_id      bigint references countries(id),
  espn_slug       text,               -- e.g. eng.1, esp.1, uefa.champions
  understat_slug  text,               -- e.g. EPL, La_liga (null for intl)
  tier            int default 1,
  is_international boolean default false,  -- national-team competition
  format          text default 'league',   -- league | cup | tournament | qualifiers | friendly
  unique (name, country_id)
);

create table if not exists teams (
  id          bigint generated always as identity primary key,
  name        text not null,
  short_name  text,
  country_id  bigint references countries(id),
  league_id   bigint references leagues(id),
  espn_id     text,
  fbref_id    text,
  crest_url   text,
  is_national boolean default false,
  unique (name, league_id)
);

create table if not exists players (
  id          bigint generated always as identity primary key,
  name        text not null,
  team_id     bigint references teams(id),
  country_id  bigint references countries(id),
  position    text,                   -- GK, DF, MF, FW
  dob         date,
  fbref_id    text,
  understat_id text,
  photo_url   text
);

-- ---------- matches + stats ----------

create table if not exists matches (
  id             bigint generated always as identity primary key,
  league_id      bigint references leagues(id),
  home_team_id   bigint references teams(id),
  away_team_id   bigint references teams(id),
  kickoff_utc    timestamptz not null,
  status         text default 'scheduled',  -- scheduled, live, final
  minute         int,
  home_goals     int,
  away_goals     int,
  went_et        boolean default false,
  went_pens      boolean default false,
  pens_home      int,
  pens_away      int,
  winner_team_id bigint references teams(id),
  espn_event_id  text unique,
  season         text,                      -- '2026-27' (club) or '2026' (intl/calendar)
  phase          text,                      -- ESPN season.slug: group-stage, semifinals, final…
  is_knockout    boolean default false,     -- goes to ET/pens if level
  updated_at     timestamptz default now()
);
create index if not exists idx_matches_kickoff on matches(kickoff_utc);
create index if not exists idx_matches_league  on matches(league_id);
create index if not exists idx_matches_status  on matches(status);
create index if not exists idx_matches_home    on matches(home_team_id);
create index if not exists idx_matches_away    on matches(away_team_id);
create index if not exists idx_matches_season  on matches(season);

-- the model's fuel: real per-team match stats incl. xG
create table if not exists team_match_stats (
  match_id     bigint references matches(id) on delete cascade,
  team_id      bigint references teams(id),
  is_home      boolean,
  xg           numeric,               -- expected goals (Understat/FBref)
  xga          numeric,               -- expected goals against
  goals        int,
  shots        int,
  sot          int,                   -- shots on target
  possession   numeric,
  corners      int,
  fouls        int,
  yellow       int,
  red          int,
  deep         int,                   -- deep completions (Understat)
  ppda         numeric,               -- passes per defensive action (pressing)
  primary key (match_id, team_id)
);

create table if not exists player_match_stats (
  match_id   bigint references matches(id) on delete cascade,
  player_id  bigint references players(id),
  team_id    bigint references teams(id),
  minutes    int,
  goals      int,
  assists    int,
  xg         numeric,
  xa         numeric,
  npxg       numeric,                 -- non-penalty xG
  shots      int,
  sot        int,
  key_passes int,
  yellow     int,
  red        int,
  primary key (match_id, player_id)
);

-- ---------- follows (personal watchlist) ----------

create table if not exists follows (
  id          bigint generated always as identity primary key,
  user_id     text not null default 'mp',
  entity_type text not null check (entity_type in ('player','team','league','country')),
  entity_id   bigint not null,
  created_at  timestamptz default now(),
  unique (user_id, entity_type, entity_id)
);

-- ---------- model outputs ----------

create table if not exists model_ratings (
  id          bigint generated always as identity primary key,
  team_id     bigint references teams(id),
  as_of_date  date not null,
  attack      numeric,                -- xG-based attack strength
  defense     numeric,                -- xG-based defense strength
  overall     numeric,
  home_adv    numeric,
  temper      numeric,                -- knockout nerves/shootout edge
  model_version text,
  unique (team_id, as_of_date, model_version)
);

create table if not exists predictions (
  id             bigint generated always as identity primary key,
  match_id       bigint references matches(id) on delete cascade,
  p_home         numeric,
  p_draw         numeric,
  p_away         numeric,
  home_xg        numeric,             -- model's expected goals
  away_xg        numeric,
  p_advance_home numeric,             -- knockout only: incl. ET + pens
  p_et           numeric,
  p_pens         numeric,
  model_version  text,
  created_at     timestamptz default now(),
  unique (match_id, model_version)
);

-- backtest scorecard, one row per model run
create table if not exists backtest_runs (
  id            bigint generated always as identity primary key,
  model_version text,
  n_matches     int,
  rps           numeric,
  log_loss      numeric,
  brier         numeric,
  advance_acc   numeric,
  run_at        timestamptz default now()
);

-- how things move: transfers + promotion/relegation, detected by the pipeline
create table if not exists movements (
  id             bigint generated always as identity primary key,
  kind           text not null check (kind in ('transfer','league_change')),
  player_id      bigint references players(id) on delete cascade,
  team_id        bigint references teams(id)   on delete cascade,
  from_team_id   bigint references teams(id),
  to_team_id     bigint references teams(id),
  from_league_id bigint references leagues(id),
  to_league_id   bigint references leagues(id),
  noticed_at     timestamptz not null default now(),
  note           text
);
create index if not exists idx_movements_noticed on movements(noticed_at desc);

-- "the lowdown" — LLM-written match commentary grounded in the model + stats
create table if not exists lowdowns (
  id           bigint generated always as identity primary key,
  match_id     bigint not null references matches(id) on delete cascade,
  version      text not null,                -- lowdown pipeline version, e.g. 'lowdown-v1'
  state        text not null default 'pre',  -- pre | live | post (transitions in place)
  paragraphs   jsonb not null,               -- ordered array of paragraph strings
  verdict      text,                         -- the bold one-line call
  inputs_hash  text not null,                -- hash of the dossier; skip regen when unchanged
  generated_at timestamptz not null default now(),
  unique (match_id, version)
);

-- ---------- supporting indexes ----------
create index if not exists idx_pms_player      on player_match_stats(player_id);
create index if not exists idx_pms_team        on player_match_stats(team_id);
create index if not exists idx_players_team    on players(team_id);
create index if not exists idx_players_country on players(country_id);
create unique index if not exists idx_teams_espn_id on teams(espn_id)
  where espn_id is not null and espn_id <> '';

-- ---------- RLS: anon key reads, service role writes ----------
do $$
declare t text;
begin
  foreach t in array array[
    'countries','leagues','teams','players','matches','team_match_stats',
    'player_match_stats','follows','model_ratings','predictions',
    'backtest_runs','lowdowns','movements'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anon read" on %I', t);
    execute format('create policy "anon read" on %I for select using (true)', t);
  end loop;
end $$;
