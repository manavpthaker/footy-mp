import test from 'node:test';
import assert from 'node:assert/strict';
import { withKickoffConfidence } from '../lib/kickoff.ts';

const match = { id: 1, status: 'scheduled', kickoff_utc: '2026-09-26T18:00:00Z', espn_event_id: '42', league: { espn_slug: 'fifa.friendly' } };
test('placeholder kickoff is not displayed as confirmed', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ events: [{ id: '42', date: match.kickoff_utc, competitions: [{ timeValid: false }] }] }));
  assert.equal((await withKickoffConfidence([match]))[0].kickoff_confirmed, false);
});
test('provider failure leaves time unknown', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  assert.equal((await withKickoffConfidence([match]))[0].kickoff_confirmed, null);
});
test('shared scoreboard fetched once; confirmed times survive', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ events: [{ id: '42', date: match.kickoff_utc, competitions: [{ timeValid: true }] }] }));
  const rows = await withKickoffConfidence([match, { ...match, id: 2 }]);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(rows[0].kickoff_confirmed, true);
});
test('changed kickoff requires schedule refresh', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ events: [{ id: '42', date: '2026-09-26T21:00:00Z', competitions: [{ timeValid: true }] }] }));
  assert.equal((await withKickoffConfidence([match]))[0].kickoff_confirmed, null);
});
test('documented federation/feed disagreement is not shown as confirmed', async t => {
  const fixture = { ...match, kickoff_utc: '2026-10-06T23:00:00Z', home_team: { name: 'Colombia' }, away_team: { name: 'Peru' } };
  t.mock.method(globalThis, 'fetch', async () => Response.json({ events: [{ id: '42', date: fixture.kickoff_utc, competitions: [{ timeValid: true }] }] }));
  assert.equal((await withKickoffConfidence([fixture]))[0].kickoff_confirmed, null);
});
