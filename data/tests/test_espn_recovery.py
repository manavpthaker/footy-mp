import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from data.ingest import espn
from data.pipeline import ingest_espn


class EspnRecoveryTests(unittest.TestCase):
    def test_provider_failure_is_not_an_empty_matchday(self):
        with patch.object(espn, '_get', side_effect=HTTPError('url', 403, 'Forbidden', {}, None)):
            with self.assertRaisesRegex(RuntimeError, 'scoreboard unavailable'):
                espn.fetch_day('ger.1', '20260919')

    def test_real_empty_matchday_is_allowed(self):
        with patch.object(espn, '_get', return_value={'events': []}):
            self.assertEqual(espn.fetch_day('ger.1', '20260919'), [])

    def test_partial_refresh_fails_but_attempts_remaining_dates(self):
        with patch('data.pipeline._ensure_leagues', return_value={'Bundesliga': 4}), \
             patch('data.pipeline._daterange', return_value=['20260918', '20260919']), \
             patch.object(espn, 'fetch_day', side_effect=[RuntimeError('offline'), []]) as fetch:
            with self.assertRaisesRegex(RuntimeError, '1 failed requests'):
                ingest_espn(leagues=['Bundesliga'])
            self.assertEqual(fetch.call_count, 2)

    def test_unknown_league_rejected_before_database_write(self):
        with patch('data.pipeline._ensure_leagues') as ensure:
            with self.assertRaisesRegex(ValueError, 'Unknown ESPN leagues'):
                ingest_espn(leagues=['Typo League'])
            ensure.assert_not_called()


if __name__ == '__main__':
    unittest.main()
