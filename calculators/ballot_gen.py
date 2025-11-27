"""
Ballot Generator
Generate realistic voter preference ballots based on ideological distributions
"""

import numpy as np
from typing import List
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
    preferences: List[int]
    count: int = 1


class BallotGenerator:
    """
    Generate realistic voter preference ballots based on ideological distributions
    """
    
    @staticmethod
    def generate_ideological_ballots(candidates: List[Candidate],
                                     num_voters: int,
                                     distribution: str = 'normal') -> List[Ballot]:
        """
        Generate ballots with preferences based on ideological spectrum
        
        Args:
            candidates: List of Candidate objects
            num_voters: Number of voters to simulate
            distribution: Type of ideological distribution
                - 'normal': Bell curve centered
                - 'polarized': Two peaks at extremes
                - 'left': Skewed left
                - 'right': Skewed right
                - 'uniform': Even distribution
                
        Returns:
            List of aggregated Ballot objects
        """
        
        # Assign ideological positions to candidates (0=left, 1=right)
        num_candidates = len(candidates)
        candidate_positions = np.linspace(0, 1, num_candidates)
        
        ballots = []
        
        for _ in range(num_voters):
            # Generate voter's ideological position
            if distribution == 'normal':
                voter_position = np.random.normal(0.5, 0.2)
            elif distribution == 'polarized':
                if np.random.random() < 0.5:
                    voter_position = np.random.normal(0.2, 0.1)
                else:
                    voter_position = np.random.normal(0.8, 0.1)
            elif distribution == 'left':
                voter_position = np.random.beta(2, 5)
            elif distribution == 'right':
                voter_position = np.random.beta(5, 2)
            else:  # uniform
                voter_position = np.random.random()
            
            # Clip to [0, 1]
            voter_position = np.clip(voter_position, 0, 1)
            
            # Calculate distances from voter to each candidate
            distances = np.abs(candidate_positions - voter_position)
            
            # Rank candidates by proximity (closest first)
            ranked_indices = np.argsort(distances)
            preferences = [candidates[i].id for i in ranked_indices]
            
            ballots.append(Ballot(preferences=preferences, count=1))
        
        # Aggregate identical ballots
        ballot_dict = defaultdict(int)
        for ballot in ballots:
            key = tuple(ballot.preferences)
            ballot_dict[key] += 1
        
        aggregated = [
            Ballot(preferences=list(prefs), count=count)
            for prefs, count in ballot_dict.items()
        ]
        
        return aggregated

