import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStandings } from '../lib/source-standings.ts';
import { currentRosterNames, matchRosterPlayers } from '../lib/source-roster.ts';

const entry = (id, rank, points) => ({ team: { id, displayName: id }, stats: [
  { name: 'rank', value: rank }, { name: 'points', value: points },
] });
test('conferences stay separate and source ranks override a guessed points order', () => {
  const table = parseStandings({ season: { displayName: '2026 MLS' }, children: [
    { name: 'East', standings: { entries: [entry('B', 2, 40), entry('A', 1, 40)] } },
    { name: 'West', standings: { entries: [entry('C', 1, 45)] } },
  ] });
  assert.deepEqual(table.groups.map(g => [g.name, g.entries.map(e => e.team.id)]), [['East', ['A','B']],['West',['C']]]);
  assert.equal(table.complete, false);
});
test('nested national groups with no matches retain their zero-point rows', () => {
  const table = parseStandings({ children: [{ name: 'League A', children: [
    { name: 'Group A1', standings: { entries: [entry('France',1,0)] } },
  ] }] });
  assert.equal(table.groups[0].name, 'Group A1');
  assert.equal(table.groups[0].entries[0].values.points, 0);
});
test('stale club roster entries do not move players back after a transfer', () => {
  const athletes = [
    { displayName: 'Luis Díaz', defaultTeam: { $ref: 'https://source/teams/2?lang=en' } },
    { displayName: 'Departed Player', defaultTeam: { $ref: 'https://source/teams/9?lang=en' } },
  ];
  const club = currentRosterNames(athletes, '2', false);
  assert.equal(club.has('luis diaz'), true);
  assert.equal(club.has('departed player'), false);
  assert.equal(currentRosterNames(athletes, 'country', true).size, 2);
});

test('roster identity prefers the matching birthdate and removes duplicate spellings', () => {
  const names = currentRosterNames([{displayName:'Emiliano Martínez',dateOfBirth:'1992-09-02T00:00Z'}], '1', true);
  const result = matchRosterPlayers([{name:'Emiliano Martinez',dob:null}, {name:'Emiliano Martínez',dob:'1992-09-02'}, {name:'Emiliano Martínez',dob:'1999-08-17'}],names);
  assert.deepEqual(result.map(p=>p.dob), ['1992-09-02']);
});
