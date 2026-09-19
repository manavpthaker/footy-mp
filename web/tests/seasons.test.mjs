import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSeason } from '../lib/seasons.ts';

test('mixed provider labels do not select 2024-25 ahead of 2026-27', () => {
  const seasons = ['2425', '2025-26', '2026-27'].map(normalizeSeason).sort();
  assert.equal(seasons.at(-1), '2026-27');
});
test('calendar-year seasons and missing data stay intact', () => {
  assert.equal(normalizeSeason('2026'), '2026');
  assert.equal(normalizeSeason(null), null);
  assert.equal(normalizeSeason('2526'), '2025-26');
});

test('2021 remains a calendar year, not a compact season', () => {
  assert.equal(normalizeSeason('2021'), '2021');
});
