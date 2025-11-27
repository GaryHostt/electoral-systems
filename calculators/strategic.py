"""
Strategic Voting Simulator
Models tactical voting behavior under different electoral systems
"""

from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class Candidate:
    """Candidate data structure"""
    id: int
    name: str
    party_id: int
    party_name: str
    color: str


class StrategicVotingSimulator:
    """
    Simulate strategic voting behavior under different electoral systems
    """
    
    @staticmethod
    def simulate_fptp_strategic(candidates: List[Candidate], 
                                 sincere_votes: Dict[int, int],
                                 polling_data: Dict[int, float]) -> Dict[str, Any]:
        """
        Simulate strategic voting in FPTP based on polling
        Voters abandon third-place candidates to support lesser evil
        
        Args:
            candidates: List of Candidate objects
            sincere_votes: Dictionary of candidate_id -> vote count
            polling_data: Dictionary of candidate_id -> polling percentage
            
        Returns:
            Dictionary with strategic_votes, vote_changes, and analysis
        """
        
        # Sort candidates by sincere vote totals
        sorted_candidates = sorted(
            [(cid, votes) for cid, votes in sincere_votes.items()],
            key=lambda x: x[1],
            reverse=True
        )
        
        if len(sorted_candidates) < 3:
            return {
                'sincere_votes': sincere_votes,
                'strategic_votes': sincere_votes,
                'vote_changes': {},
                'analysis': 'Not enough candidates for strategic behavior'
            }
        
        # Top two candidates in polls
        frontrunner_id = sorted_candidates[0][0]
        second_id = sorted_candidates[1][0]
        
        # Calculate vote transfers from third-place and below
        strategic_votes = sincere_votes.copy()
        vote_changes = {}
        
        for i in range(2, len(sorted_candidates)):
            third_party_id = sorted_candidates[i][0]
            third_party_votes = sorted_candidates[i][1]
            
            # Assume 60% of third-party voters strategically switch
            strategic_switchers = int(third_party_votes * 0.6)
            
            # They switch to whichever of top 2 is closer ideologically
            # For simulation, split 70-30 based on ideology proximity
            to_frontrunner = int(strategic_switchers * 0.3)
            to_second = strategic_switchers - to_frontrunner
            
            strategic_votes[third_party_id] -= strategic_switchers
            strategic_votes[frontrunner_id] += to_frontrunner
            strategic_votes[second_id] += to_second
            
            vote_changes[third_party_id] = -strategic_switchers
            vote_changes[frontrunner_id] = vote_changes.get(frontrunner_id, 0) + to_frontrunner
            vote_changes[second_id] = vote_changes.get(second_id, 0) + to_second
        
        return {
            'sincere_votes': sincere_votes,
            'strategic_votes': strategic_votes,
            'vote_changes': vote_changes,
            'analysis': f'{sum(abs(v) for v in vote_changes.values()) // 2} voters voted strategically'
        }

