"""
Multi-District Electoral Systems
Handles MMP and Parallel Voting across multiple districts
"""

from typing import List, Dict, Any
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class Candidate:
    """Candidate information"""
    id: int
    name: str
    party_id: int
    party_name: str
    color: str


@dataclass
class District:
    """Single electoral district"""
    id: int
    name: str
    candidates: List[int]  # List of candidate IDs
    votes: Dict[int, int]  # Map candidate_id -> votes


class MultiDistrictCalculator:
    """
    Handles elections across multiple districts
    Used for realistic MMP and Parallel Voting simulations
    """
    
    def __init__(self, candidates: List[Candidate], parties: Dict):
        self.candidates = {c.id: c for c in candidates}
        self.parties = {int(k): v for k, v in parties.items()}  # Ensure integer keys
    
    def calculate_fptp_winners(self, districts: List[District]) -> Dict[str, Any]:
        """
        Calculate FPTP winners across multiple districts
        
        Returns district winners and party aggregation
        """
        district_winners = []
        party_district_seats = defaultdict(int)
        
        for district in districts:
            # Ensure votes dict has integer keys
            votes_int = {int(k): v for k, v in district.votes.items()}
            
            # Find winner in this district
            winner_id = max(votes_int.keys(), key=lambda k: votes_int[k])
            winner = self.candidates[winner_id]
            winner_votes = votes_int[winner_id]
            
            district_winners.append({
                'district_id': district.id,
                'district_name': district.name,
                'winner_id': winner_id,
                'winner_name': winner.name,
                'party_id': winner.party_id,
                'party_name': winner.party_name,
                'votes': winner_votes,
                'total_votes': sum(votes_int.values())
            })
            
            party_district_seats[winner.party_id] += 1
        
        return {
            'district_winners': district_winners,
            'party_district_seats': dict(party_district_seats),
            'total_districts': len(districts)
        }
    
    def calculate_multi_district_mmp(
        self, 
        districts: List[District],
        party_votes: Dict[int, int],
        list_seats: int,
        allocation_method: str = 'dhondt',
        threshold: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculate MMP results with multiple districts
        
        Districts elect representatives via FPTP
        List seats are allocated to achieve proportionality
        """
        # Calculate district winners
        district_results = self.calculate_fptp_winners(districts)
        party_district_seats = district_results['party_district_seats']
        
        # Calculate total seats each party should get (proportional)
        total_seats = len(districts) + list_seats
        total_party_votes = sum(party_votes.values())
        
        # Apply threshold
        qualifying_parties = {}
        for party_id, votes in party_votes.items():
            vote_share = (votes / total_party_votes * 100) if total_party_votes > 0 else 0
            if vote_share >= threshold:
                qualifying_parties[party_id] = votes
        
        # Allocate total seats proportionally
        if allocation_method == 'dhondt':
            entitled_seats = self._allocate_dhondt(qualifying_parties, total_seats)
        else:
            entitled_seats = self._allocate_sainte_lague(qualifying_parties, total_seats)
        
        # Calculate list seats and overhang
        party_results = []
        total_overhang = 0
        
        for party_id in set(list(party_district_seats.keys()) + list(entitled_seats.keys())):
            district_won = party_district_seats.get(party_id, 0)
            entitled = entitled_seats.get(party_id, 0)
            
            # List seats = entitled - district won (minimum 0)
            list_won = max(0, entitled - district_won)
            
            # Overhang = district won - entitled (if positive)
            overhang = max(0, district_won - entitled)
            total_overhang += overhang
            
            actual_seats = district_won + list_won
            
            # Safely get party info
            party_info = self.parties.get(party_id, {})
            party_name = party_info.get('name', f'Party {party_id}') if isinstance(party_info, dict) else f'Party {party_id}'
            party_color = party_info.get('color', '#666') if isinstance(party_info, dict) else '#666'
            
            party_results.append({
                'party_id': party_id,
                'party_name': party_name,
                'color': party_color,
                'party_votes': party_votes.get(party_id, 0),
                'vote_share': (party_votes.get(party_id, 0) / total_party_votes * 100) if total_party_votes > 0 else 0,
                'district_seats': district_won,
                'list_seats': list_won,
                'entitled_seats': entitled,
                'actual_seats': actual_seats,
                'overhang_seats': overhang,
                'below_threshold': party_id not in qualifying_parties
            })
        
        # Calculate final parliament size
        final_parliament_size = len(districts) + list_seats + total_overhang
        
        return {
            'type': 'multi_district_mmp',
            'party_results': sorted(party_results, key=lambda x: x['actual_seats'], reverse=True),
            'district_results': district_results,
            'total_districts': len(districts),
            'list_seats': list_seats,
            'total_overhang': total_overhang,
            'final_parliament_size': final_parliament_size,
            'allocation_method': allocation_method,
            'threshold': threshold
        }
    
    def calculate_multi_district_parallel(
        self,
        districts: List[District],
        party_votes: Dict[int, int],
        list_seats: int,
        allocation_method: str = 'dhondt',
        threshold: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculate Parallel Voting results with multiple districts
        
        District and list seats are calculated independently
        """
        # Calculate district winners
        district_results = self.calculate_fptp_winners(districts)
        party_district_seats = district_results['party_district_seats']
        
        # Allocate list seats independently
        total_party_votes = sum(party_votes.values())
        
        # Apply threshold
        qualifying_parties = {}
        for party_id, votes in party_votes.items():
            vote_share = (votes / total_party_votes * 100) if total_party_votes > 0 else 0
            if vote_share >= threshold:
                qualifying_parties[party_id] = votes
        
        # Allocate list seats
        if allocation_method == 'dhondt':
            party_list_seats = self._allocate_dhondt(qualifying_parties, list_seats)
        else:
            party_list_seats = self._allocate_sainte_lague(qualifying_parties, list_seats)
        
        # Combine results
        party_results = []
        all_parties = set(list(party_district_seats.keys()) + list(party_list_seats.keys()))
        
        for party_id in all_parties:
            district_won = party_district_seats.get(party_id, 0)
            list_won = party_list_seats.get(party_id, 0)
            total_seats = district_won + list_won
            
            party_results.append({
                'party_id': party_id,
                'party_name': self.parties.get(party_id, {}).get('name', f'Party {party_id}'),
                'color': self.parties.get(party_id, {}).get('color', '#666'),
                'party_votes': party_votes.get(party_id, 0),
                'vote_share': (party_votes.get(party_id, 0) / total_party_votes * 100) if total_party_votes > 0 else 0,
                'district_seats': district_won,
                'list_seats': list_won,
                'total_seats': total_seats,
                'below_threshold': party_id not in qualifying_parties
            })
        
        return {
            'type': 'multi_district_parallel',
            'party_results': sorted(party_results, key=lambda x: x['total_seats'], reverse=True),
            'district_results': district_results,
            'total_districts': len(districts),
            'list_seats': list_seats,
            'final_parliament_size': len(districts) + list_seats,
            'allocation_method': allocation_method,
            'threshold': threshold
        }
    
    def _allocate_dhondt(self, party_votes: Dict[int, int], seats: int) -> Dict[int, int]:
        """D'Hondt allocation method"""
        allocation = defaultdict(int)
        
        for _ in range(seats):
            max_quotient = -1
            max_party = None
            
            for party_id, votes in party_votes.items():
                quotient = votes / (allocation[party_id] + 1)
                if quotient > max_quotient:
                    max_quotient = quotient
                    max_party = party_id
            
            if max_party is not None:
                allocation[max_party] += 1
        
        return dict(allocation)
    
    def _allocate_sainte_lague(self, party_votes: Dict[int, int], seats: int) -> Dict[int, int]:
        """Sainte-Laguë allocation method"""
        allocation = defaultdict(int)
        
        for _ in range(seats):
            max_quotient = -1
            max_party = None
            
            for party_id, votes in party_votes.items():
                quotient = votes / (2 * allocation[party_id] + 1)
                if quotient > max_quotient:
                    max_quotient = quotient
                    max_party = party_id
            
            if max_party is not None:
                allocation[max_party] += 1
        
        return dict(allocation)

