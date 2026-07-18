-- 002_backbone.sql — the 2026→2030 backbone migration.
-- Run once in the Supabase SQL editor. Idempotent (safe to re-run).
--
-- What this does:
--   1. matches: phase + is_knockout (real knockout semantics, not "is international")
--   2. leagues: format ('league'|'cup'|'tournament'|'qualifiers'|'friendly') + fixes
--      is_international (CL/EL are club cups, not internationals)
--   3. MERGES the ~85 duplicated teams (same club forked across league/cup ingests,
--      same national team forked across tournaments) — repoints every FK, keeps one row
--   4. movements: transfer / promotion-relegation log (the "how things move" feed)
--   5. hot indexes the pipeline and app need as seasons accumulate
--   6. RLS: anon key = read-only everywhere; writes only via service role

-- ---------- 1. matches ----------
alter table matches add column if not exists phase text;          -- ESPN season.slug: group-stage, semifinals, final…
alter table matches add column if not exists is_knockout boolean default false;

-- ---------- 2. leagues ----------
alter table leagues add column if not exists format text default 'league';
-- format semantics:
--   league      round-robin domestic league (home/away, draws stand)
--   cup         club knockout cup with home/away legs (UCL/UEL/Libertadores); final is neutral
--   tournament  national-team finals tournament at neutral venues (WC, Euros, Copa, AFCON, Gold Cup)
--   qualifiers  national-team qualifying (home/away, groups; occasional single-leg playoffs)
--   friendly    international friendlies
update leagues set format = 'cup',        is_international = false where name in ('Champions League','Europa League','Copa Libertadores');
update leagues set format = 'tournament', is_international = true  where name in ('World Cup','Euros','Copa America','Africa Cup of Nations','Gold Cup');
update leagues set format = 'qualifiers', is_international = true  where name like 'WC Qualifying%' or name like '%Nations League%';
update leagues set format = 'friendly',   is_international = true  where name = 'Int. Friendlies';
update leagues set format = 'league' where format is null;

-- ---------- 3. merge duplicated teams ----------
-- Keeper = the copy attached to a domestic league (a club's real home) when one
-- exists, else the lowest id. Losers' rows are repointed everywhere, then deleted.
create temp table if not exists _team_merge as
with ranked as (
  select t.id, t.espn_id,
         row_number() over (
           partition by t.espn_id
           order by (coalesce(l.format,'') = 'league') desc, t.id
         ) as rn
  from teams t
  left join leagues l on l.id = t.league_id
  where t.espn_id is not null and t.espn_id <> ''
)
select loser.id as loser_id, keeper.id as keeper_id
from ranked loser
join ranked keeper on keeper.espn_id = loser.espn_id and keeper.rn = 1
where loser.rn > 1;

-- matches
update matches m set home_team_id = t.keeper_id from _team_merge t where m.home_team_id = t.loser_id;
update matches m set away_team_id = t.keeper_id from _team_merge t where m.away_team_id = t.loser_id;
update matches m set winner_team_id = t.keeper_id from _team_merge t where m.winner_team_id = t.loser_id;

-- team_match_stats (PK match_id+team_id: drop loser row when keeper already has one)
delete from team_match_stats s
 using _team_merge t, team_match_stats k
 where s.team_id = t.loser_id and k.team_id = t.keeper_id and k.match_id = s.match_id;
update team_match_stats s set team_id = t.keeper_id from _team_merge t where s.team_id = t.loser_id;

-- player_match_stats + players
update player_match_stats s set team_id = t.keeper_id from _team_merge t where s.team_id = t.loser_id;
update players p set team_id = t.keeper_id from _team_merge t where p.team_id = t.loser_id;

-- model_ratings (unique team_id+as_of_date+model_version: drop colliding loser rows)
delete from model_ratings r
 using _team_merge t, model_ratings k
 where r.team_id = t.loser_id and k.team_id = t.keeper_id
   and k.as_of_date = r.as_of_date and k.model_version = r.model_version;
update model_ratings r set team_id = t.keeper_id from _team_merge t where r.team_id = t.loser_id;

-- follows (unique user+type+id: drop loser follow when keeper already followed)
delete from follows f
 using _team_merge t, follows k
 where f.entity_type = 'team' and f.entity_id = t.loser_id
   and k.entity_type = 'team' and k.entity_id = t.keeper_id and k.user_id = f.user_id;
update follows f set entity_id = t.keeper_id from _team_merge t
 where f.entity_type = 'team' and f.entity_id = t.loser_id;

delete from teams where id in (select loser_id from _team_merge);

-- a match can now have the same team on both sides only if data was already broken;
-- national teams shouldn't live "in" a tournament league
update teams set league_id = null where is_national = true;

-- ---------- 4. movements ----------
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

-- ---------- 5. indexes ----------
create index if not exists idx_matches_status  on matches(status);
create index if not exists idx_matches_home    on matches(home_team_id);
create index if not exists idx_matches_away    on matches(away_team_id);
create index if not exists idx_matches_season  on matches(season);
create index if not exists idx_pms_player      on player_match_stats(player_id);
create index if not exists idx_pms_team        on player_match_stats(team_id);
create index if not exists idx_players_team    on players(team_id);
create index if not exists idx_players_country on players(country_id);
create unique index if not exists idx_teams_espn_id on teams(espn_id) where espn_id is not null and espn_id <> '';

-- ---------- 6. RLS: anon reads, service-role writes ----------
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
