"""
Ranked Voting Systems: Borda Count and Condorcet
"""

from typing import List, Dict, Any
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class Candidate:
    """Candidate data structure"""
    id: int
    name: str
    party_id: int
    party_name: str
    color: str


@dataclass
class Ballot:
    """Ballot with ranked preferences"""
    preferences: List[int]
    count: int = 1


class BordaCountCalculator:
    """
    Borda Count: Positional voting system
    Points assigned based on ranking position
    """
    
    def __init__(self, candidates: List[Candidate]):
        self.candidates = {c.id: c for c in candidates}
        self.num_candidates = len(candidates)
    
    def calculate(self, ballots: List[Ballot]) -> Dict[str, Any]:
        """
        Calculate Borda Count results
        
        Points: n-1 for 1st, n-2 for 2nd, ..., 0 for last
        where n = number of candidates
        """
        points = defaultdict(float)
        
        for ballot in ballots:
            for rank_index, candidate_id in enumerate(ballot.preferences):
                # n-1 points for first place, n-2 for second, etc.
                score = self.num_candidates - rank_index - 1
                points[candidate_id] += score * ballot.count
        
        # Build results
        results = []
        for cid, candidate in self.candidates.items():
            total_points = points.get(cid, 0)
            results.append({
                'id': cid,
                'name': candidate.name,
                'party': candidate.party_name,
                'color': candidate.color,
                'points': float(total_points)
            })
        
        results.sort(key=lambda x: x['points'], reverse=True)
        
        if results:
            results[0]['winner'] = True
        
        total_points = sum(r['points'] for r in results)
        
        return {
            'results': results,
            'winner': results[0]['id'] if results else None,
            'total_points': total_points,
            'method': 'Borda Count (n-1, n-2, ..., 0)'
        }


class CondorcetCalculator:
    """
    Condorcet Method: Pairwise comparison voting
    Winner beats every other candidate head-to-head
    """
    
    def __init__(self, candidates: List[Candidate]):
        self.candidates = {c.id: c for c in candidates}
    
    def calculate(self, ballots: List[Ballot]) -> Dict[str, Any]:
        """
        Calculate Condorcet winner using pairwise comparisons
        
        Returns winner if exists, otherwise identifies Condorcet paradox
        """
        candidate_ids = list(self.candidates.keys())
        
        # Build pairwise preference matrix
        # pairwise[i][j] = number of voters who prefer candidate i to candidate j
        pairwise = defaultdict(lambda: defaultdict(int))
        
        for ballot in ballots:
            # For each pair of candidates in the ranking
            for i, cand_i in enumerate(ballot.preferences):
                for cand_j in ballot.preferences[i+1:]:
                    # Voter prefers cand_i to cand_j
                    pairwise[cand_i][cand_j] += ballot.count
        
        # Find Condorcet winner (beats all others head-to-head)
        condorcet_winner = None
        wins = {}
        
        for cand_i in candidate_ids:
            beats_all = True
            win_count = 0
            
            for cand_j in candidate_ids:
                if cand_i != cand_j:
                    votes_i_over_j = pairwise[cand_i][cand_j]
                    votes_j_over_i = pairwise[cand_j][cand_i]
                    
                    if votes_i_over_j > votes_j_over_i:
                        win_count += 1
                    elif votes_j_over_i > votes_i_over_j:
                        beats_all = False
            
            wins[cand_i] = win_count
            
            if beats_all:
                condorcet_winner = cand_i
                break
        
        # Build pairwise matrix for display
        pairwise_matrix = []
        for cand_i in candidate_ids:
            row = {'candidate_id': cand_i, 'candidate_name': self.candidates[cand_i].name, 'matchups': {}}
            for cand_j in candidate_ids:
                if cand_i != cand_j:
                    row['matchups'][cand_j] = pairwise[cand_i][cand_j]
            pairwise_matrix.append(row)
        
        # Build results
        results = []
        for cid, candidate in self.candidates.items():
            results.append({
                'id': cid,
                'name': candidate.name,
                'party': candidate.party_name,
                'color': candidate.color,
                'pairwise_wins': wins.get(cid, 0),
                'is_condorcet_winner': cid == condorcet_winner
            })
        
        results.sort(key=lambda x: x['pairwise_wins'], reverse=True)
        
        return {
            'results': results,
            'condorcet_winner': condorcet_winner,
            'has_paradox': condorcet_winner is None,
            'pairwise_matrix': pairwise_matrix,
            'winner_name': self.candidates[condorcet_winner].name if condorcet_winner else None
        }

