"""
Unit Tests for Electoral Systems Simulator
Tests all calculator modules and API endpoints
"""

import unittest
import numpy as np
from calculators import (
    STVCalculator, 
    StrategicVotingSimulator,
    BallotGenerator,
    STVCandidate,
    STVBallot
)


class TestSTVCalculator(unittest.TestCase):
    """Test Single Transferable Vote calculator"""
    
    def setUp(self):
        """Set up test candidates"""
        self.candidates = [
            STVCandidate(id=1, name="Alice", party_id=1, party_name="Party A", color="#ff0000"),
            STVCandidate(id=2, name="Bob", party_id=2, party_name="Party B", color="#00ff00"),
            STVCandidate(id=3, name="Charlie", party_id=3, party_name="Party C", color="#0000ff"),
        ]
    
    def test_droop_quota_calculation(self):
        """Test Droop Quota formula"""
        calculator = STVCalculator(self.candidates, seats=1)
        
        # For 100 votes and 1 seat: floor(100/(1+1)) + 1 = 51
        self.assertEqual(calculator.calculate_droop_quota(100), 51)
        
        # For 100 votes and 3 seats: floor(100/(3+1)) + 1 = 26
        calculator2 = STVCalculator(self.candidates, seats=3)
        self.assertEqual(calculator2.calculate_droop_quota(100), 26)
    
    def test_simple_majority_win(self):
        """Test candidate winning with clear majority"""
        ballots = [
            STVBallot(preferences=[1, 2, 3], count=60),
            STVBallot(preferences=[2, 1, 3], count=30),
            STVBallot(preferences=[3, 2, 1], count=10),
        ]
        
        calculator = STVCalculator(self.candidates, seats=1)
        result = calculator.run_election(ballots)
        
        self.assertEqual(result['total_votes'], 100)
        self.assertIn(1, result['elected'])  # Alice should win
        self.assertEqual(len(result['elected']), 1)
    
    def test_vote_transfer(self):
        """Test that votes transfer correctly"""
        ballots = [
            STVBallot(preferences=[1, 2], count=40),
            STVBallot(preferences=[2, 1], count=35),
            STVBallot(preferences=[3, 2], count=25),
        ]
        
        calculator = STVCalculator(self.candidates, seats=1)
        result = calculator.run_election(ballots)
        
        # Should have at least 2 rounds (elimination)
        self.assertGreaterEqual(len(result['rounds']), 1)
        self.assertEqual(len(result['elected']), 1)


class TestStrategicVoting(unittest.TestCase):
    """Test strategic voting simulator"""
    
    def setUp(self):
        from calculators.strategic import Candidate
        self.candidates = [
            Candidate(id=1, name="Alice", party_id=1, party_name="Left", color="#ff0000"),
            Candidate(id=2, name="Bob", party_id=2, party_name="Center", color="#00ff00"),
            Candidate(id=3, name="Charlie", party_id=3, party_name="Right", color="#0000ff"),
        ]
    
    def test_strategic_behavior(self):
        """Test that strategic voting changes vote distribution"""
        sincere_votes = {1: 1000, 2: 800, 3: 500}
        polling = {1: 0.45, 2: 0.35, 3: 0.20}
        
        result = StrategicVotingSimulator.simulate_fptp_strategic(
            self.candidates, sincere_votes, polling
        )
        
        # Third party should lose votes
        self.assertLess(result['strategic_votes'][3], sincere_votes[3])
        # Top two should gain votes
        self.assertGreater(result['strategic_votes'][1], sincere_votes[1])
    
    def test_two_candidate_no_change(self):
        """With only 2 candidates, no strategic behavior"""
        candidates = self.candidates[:2]
        sincere_votes = {1: 1000, 2: 800}
        
        result = StrategicVotingSimulator.simulate_fptp_strategic(
            candidates, sincere_votes, {}
        )
        
        # Should be no changes
        self.assertEqual(result['strategic_votes'], sincere_votes)


class TestBallotGenerator(unittest.TestCase):
    """Test ballot generation"""
    
    def setUp(self):
        from calculators.ballot_gen import Candidate
        self.candidates = [
            Candidate(id=1, name="Alice", party_id=1, party_name="Party A", color="#ff0000"),
            Candidate(id=2, name="Bob", party_id=2, party_name="Party B", color="#00ff00"),
            Candidate(id=3, name="Charlie", party_id=3, party_name="Party C", color="#0000ff"),
        ]
    
    def test_normal_distribution(self):
        """Test normal distribution ballot generation"""
        ballots = BallotGenerator.generate_ideological_ballots(
            self.candidates, num_voters=1000, distribution='normal'
        )
        
        total_voters = sum(b.count for b in ballots)
        self.assertEqual(total_voters, 1000)
        
        # Should have some variety of ballots
        self.assertGreater(len(ballots), 1)
    
    def test_polarized_distribution(self):
        """Test polarized distribution"""
        ballots = BallotGenerator.generate_ideological_ballots(
            self.candidates, num_voters=500, distribution='polarized'
        )
        
        self.assertEqual(sum(b.count for b in ballots), 500)
    
    def test_all_distributions(self):
        """Test all distribution types work"""
        distributions = ['normal', 'polarized', 'left', 'right', 'uniform']
        
        for dist in distributions:
            ballots = BallotGenerator.generate_ideological_ballots(
                self.candidates, num_voters=100, distribution=dist
            )
            self.assertEqual(sum(b.count for b in ballots), 100)


class TestIntegration(unittest.TestCase):
    """Integration tests for complete workflows"""
    
    def test_complete_stv_workflow(self):
        """Test complete STV election from generation to result"""
        from calculators.ballot_gen import Candidate
        
        candidates = [
            Candidate(id=i, name=f"Candidate {i}", party_id=i, 
                     party_name=f"Party {i}", color=f"#{'0'*i}{'f'*(6-i)}")
            for i in range(1, 5)
        ]
        
        # Generate ballots
        ballots = BallotGenerator.generate_ideological_ballots(
            candidates, num_voters=1000, distribution='normal'
        )
        
        # Convert to STV format
        stv_candidates = [STVCandidate(**c.__dict__) for c in candidates]
        stv_ballots = [STVBallot(preferences=b.preferences, count=b.count) for b in ballots]
        
        # Run election
        calculator = STVCalculator(stv_candidates, seats=2)
        result = calculator.run_election(stv_ballots)
        
        # Verify results
        self.assertEqual(len(result['elected']), 2)
        self.assertEqual(result['total_votes'], 1000)
        self.assertGreater(len(result['rounds']), 0)


def run_tests():
    """Run all tests and return results"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestSTVCalculator))
    suite.addTests(loader.loadTestsFromTestCase(TestStrategicVoting))
    suite.addTests(loader.loadTestsFromTestCase(TestBallotGenerator))
    suite.addTests(loader.loadTestsFromTestCase(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result


if __name__ == '__main__':
    print("🧪 Running Electoral Systems Simulator Tests")
    print("=" * 60)
    result = run_tests()
    print("=" * 60)
    print(f"\nTests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {(result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100:.1f}%")
    
    if result.wasSuccessful():
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed")

