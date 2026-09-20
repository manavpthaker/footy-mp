import unittest
from unittest.mock import patch
from data.refresh import roster_match
from data.ingest import espn

class RefreshTests(unittest.TestCase):
    def test_namesake_with_conflicting_dob_is_not_moved(self):
        self.assertIsNone(roster_match({'dob':'2000-01-01'}, [{'id':1,'dob':'1990-01-01','team_id':3}],3))

    def test_ambiguous_namesake_is_skipped(self):
        self.assertIsNone(roster_match({}, [{'id':1,'team_id':2},{'id':2,'team_id':3}],4))

    def test_existing_club_resolves_ambiguous_name(self):
        self.assertEqual(roster_match({}, [{'id':1,'team_id':2},{'id':2,'team_id':3}],3)['id'],2)

    def test_exact_dob_wins_over_unknown_dob_duplicate(self):
        self.assertEqual(roster_match({"dob":"2000-01-01"}, [{"id":1,"dob":None,"team_id":3},{"id":2,"dob":"2000-01-01","team_id":3}],3)["id"],2)

    def test_full_year_cannot_silently_truncate(self):
        with patch.object(espn,'_get',return_value={'events':[{}]*1000}):
            with self.assertRaisesRegex(RuntimeError,'truncated'): espn.fetch_day('usa.1','2026')

    def test_club_roster_preserves_source_identity_and_country_code(self):
        with patch.object(espn,'_get',return_value={'athletes':[{'id':'42','displayName':'A Player',
            'citizenship':'USA','citizenshipCountry':{'abbreviation':'USA'},
            'defaultTeam':{'$ref':'https://source/teams/5?lang=en'}}]}):
            p=espn.fetch_roster('usa.1','5',strict=True)[0]
            self.assertEqual((p['espn_id'],p['country_code'],p['club_espn_id']),('42','USA','5'))
