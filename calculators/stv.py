"""
Single Transferable Vote (STV) Calculator
Implements accurate STV with Droop Quota and fractional surplus transfer
"""

import numpy as np
from typing import List, Dict, Any
from collections import defaultdict
from dataclasses import dataclass


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
    preferences: List[int]  # List of candidate IDs in order of preference
    count: int = 1
    weight: float = 1.0


class STVCalculator:
    """
    Full implementation of Single Transferable Vote with accurate surplus transfer
    using Droop Quota and fractional vote weighting
    """
    
    def __init__(self, candidates: List[Candidate], seats: int):
        self.candidates = {c.id: c for c in candidates}
        self.seats = seats
        self.rounds = []
        
    def calculate_droop_quota(self, total_votes: int) -> int:
        """
        Droop Quota: floor(votes / (seats + 1)) + 1
        This is the minimum votes needed to guarantee election
        """
        return int(np.floor(total_votes / (self.seats + 1))) + 1
    
    def run_election(self, ballots: List[Ballot]) -> Dict[str, Any]:
        """
        Execute full STV election with accurate surplus transfer
        
        Returns:
            Dictionary containing results, elected candidates, rounds data
        """
        total_votes = sum(b.count for b in ballots)
        quota = self.calculate_droop_quota(total_votes)
        
        # Initialize working ballots with weights
        working_ballots = [
            {
                'preferences': b.preferences[:],
                'count': b.count,
                'weight': 1.0,
                'current_index': 0
            } for b in ballots
        ]
        
        elected = []
        eliminated = set()
        round_num = 0
        
        while len(elected) < self.seats and len(elected) + len(eliminated) < len(self.candidates):
            round_num += 1
            
            # Count weighted votes for each active candidate
            vote_counts = defaultdict(float)
            
            for ballot in working_ballots:
                # Find first non-eliminated, non-elected preference
                while ballot['current_index'] < len(ballot['preferences']):
                    pref_id = ballot['preferences'][ballot['current_index']]
                    if pref_id not in eliminated and pref_id not in elected:
                        vote_counts[pref_id] += ballot['count'] * ballot['weight']
                        break
                    ballot['current_index'] += 1
            
            # Record round information
            round_info = {
                'round': round_num,
                'quota': quota,
                'vote_counts': {cid: float(vc) for cid, vc in vote_counts.items()},
                'action': None,
                'candidate_id': None,
                'candidate_name': None
            }
            
            # Check if any candidate meets quota
            active_candidates = [
                cid for cid in self.candidates.keys()
                if cid not in eliminated and cid not in elected
            ]
            
            if not active_candidates:
                break
            
            max_votes = max(vote_counts.get(cid, 0) for cid in active_candidates)
            
            if max_votes >= quota:
                # Elect candidate with most votes
                winner_id = max(active_candidates, key=lambda cid: vote_counts.get(cid, 0))
                elected.append(winner_id)
                
                round_info['action'] = 'elected'
                round_info['candidate_id'] = winner_id
                round_info['candidate_name'] = self.candidates[winner_id].name
                
                # Calculate surplus and transfer value
                surplus = vote_counts[winner_id] - quota
                if vote_counts[winner_id] > 0:
                    transfer_value = surplus / vote_counts[winner_id]
                else:
                    transfer_value = 0
                
                round_info['surplus'] = float(surplus)
                round_info['transfer_value'] = float(transfer_value)
                
                # Transfer surplus votes
                for ballot in working_ballots:
                    if (ballot['current_index'] < len(ballot['preferences']) and
                        ballot['preferences'][ballot['current_index']] == winner_id):
                        ballot['weight'] *= transfer_value
                        ballot['current_index'] += 1
                        
            elif len(elected) + len(active_candidates) <= self.seats:
                # Elect all remaining candidates
                for cid in active_candidates:
                    if cid not in elected:
                        elected.append(cid)
                round_info['action'] = 'elected_remaining'
                break
                
            else:
                # Eliminate candidate with fewest votes
                min_votes = min(vote_counts.get(cid, 0) for cid in active_candidates)
                loser_id = min(active_candidates, key=lambda cid: vote_counts.get(cid, 0))
                eliminated.add(loser_id)
                
                round_info['action'] = 'eliminated'
                round_info['candidate_id'] = loser_id
                round_info['candidate_name'] = self.candidates[loser_id].name
                
                # Transfer votes at full weight to next preference
                for ballot in working_ballots:
                    if (ballot['current_index'] < len(ballot['preferences']) and
                        ballot['preferences'][ballot['current_index']] == loser_id):
                        ballot['current_index'] += 1
            
            self.rounds.append(round_info)
            
            # Safety check
            if round_num > 100:
                break
        
        # Build final results
        results = []
        for cid, candidate in self.candidates.items():
            final_votes = vote_counts.get(cid, 0)
            results.append({
                'id': cid,
                'name': candidate.name,
                'party': candidate.party_name,
                'color': candidate.color,
                'votes': float(final_votes),
                'elected': cid in elected,
                'eliminated': cid in eliminated
            })
        
        return {
            'results': results,
            'elected': elected,
            'eliminated': list(eliminated),
            'rounds': self.rounds,
            'quota': quota,
            'total_votes': total_votes
        }

