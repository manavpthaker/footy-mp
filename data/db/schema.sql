-- footy-mp — Supabase Postgres schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Single-user to start; follows default to user 'mp'. RLS can be layered on later.

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
  is_international boolean default false,
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
  season         text,
  updated_at     timestamptz default now()
);
create index if not exists idx_matches_kickoff on matches(kickoff_utc);
create index if not exists idx_matches_league  on matches(league_id);

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
