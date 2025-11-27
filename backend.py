"""
Electoral Systems Simulator - Python Backend
Flask API for advanced computational analysis and data persistence
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import json
from datetime import datetime
import sqlite3
import hashlib
import os
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from collections import defaultdict

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Database setup
DB_PATH = 'electoral_data.db'

def init_db():
    """Initialize SQLite database for scenario persistence"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            system TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simulations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scenario_id TEXT,
            num_voters INTEGER,
            results TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

@dataclass
class Candidate:
    id: int
    name: str
    party_id: int
    party_name: str
    color: str

@dataclass
class Ballot:
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
        """Droop Quota: floor(votes / (seats + 1)) + 1"""
        return int(np.floor(total_votes / (self.seats + 1))) + 1
    
    def run_election(self, ballots: List[Ballot]) -> Dict[str, Any]:
        """
        Execute full STV election with accurate surplus transfer
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
        """
        
        # Sort candidates by sincere vote totals
        sorted_candidates = sorted(
            [(cid, votes) for cid, votes in sincere_votes.items()],
            key=lambda x: x[1],
            reverse=True
        )
        
        if len(sorted_candidates) < 3:
            return {
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
        
        distribution options:
        - 'normal': Bell curve centered
        - 'polarized': Two peaks at extremes
        - 'left': Skewed left
        - 'right': Skewed right
        - 'uniform': Even distribution
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


# ============================================================================
# API Endpoints
# ============================================================================

@app.route('/api/stv/calculate', methods=['POST'])
def calculate_stv():
    """
    Advanced STV calculation with full surplus transfer
    
    Request body:
    {
        "candidates": [{"id": 1, "name": "Alice", "party_id": 1, "party_name": "Party A", "color": "#ff0000"}],
        "ballots": [{"preferences": [1, 2, 3], "count": 100}],
        "seats": 3
    }
    """
    try:
        data = request.json
        
        candidates = [Candidate(**c) for c in data['candidates']]
        ballots = [Ballot(**b) for b in data['ballots']]
        seats = data.get('seats', 1)
        
        calculator = STVCalculator(candidates, seats)
        results = calculator.run_election(ballots)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/strategic-voting/simulate', methods=['POST'])
def simulate_strategic_voting():
    """
    Simulate strategic voting behavior
    
    Request body:
    {
        "system": "fptp",
        "candidates": [...],
        "sincere_votes": {"1": 1000, "2": 800, "3": 500},
        "polling_data": {"1": 0.45, "2": 0.35, "3": 0.20}
    }
    """
    try:
        data = request.json
        system = data['system']
        candidates = [Candidate(**c) for c in data['candidates']]
        sincere_votes = {int(k): v for k, v in data['sincere_votes'].items()}
        polling_data = {int(k): v for k, v in data.get('polling_data', {}).items()}
        
        if system == 'fptp':
            results = StrategicVotingSimulator.simulate_fptp_strategic(
                candidates, sincere_votes, polling_data
            )
        else:
            return jsonify({
                'success': False,
                'error': f'Strategic simulation not implemented for {system}'
            }), 400
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/ballots/generate', methods=['POST'])
def generate_ballots():
    """
    Generate realistic ballot data based on ideological distribution
    
    Request body:
    {
        "candidates": [...],
        "num_voters": 10000,
        "distribution": "polarized"
    }
    """
    try:
        data = request.json
        candidates = [Candidate(**c) for c in data['candidates']]
        num_voters = data.get('num_voters', 1000)
        distribution = data.get('distribution', 'normal')
        
        ballots = BallotGenerator.generate_ideological_ballots(
            candidates, num_voters, distribution
        )
        
        # Convert to serializable format
        ballot_data = [
            {'preferences': b.preferences, 'count': b.count}
            for b in ballots
        ]
        
        return jsonify({
            'success': True,
            'ballots': ballot_data,
            'total_voters': num_voters,
            'unique_ballots': len(ballots)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/batch-simulation', methods=['POST'])
def batch_simulation():
    """
    Run large-scale simulations across multiple electoral systems
    
    Request body:
    {
        "candidates": [...],
        "num_voters": 100000,
        "distribution": "normal",
        "systems": ["fptp", "irv", "stv", "approval"]
    }
    """
    try:
        data = request.json
        candidates = [Candidate(**c) for c in data['candidates']]
        num_voters = data.get('num_voters', 10000)
        distribution = data.get('distribution', 'normal')
        systems = data.get('systems', ['fptp', 'irv'])
        
        # Generate ballots
        ballots = BallotGenerator.generate_ideological_ballots(
            candidates, num_voters, distribution
        )
        
        results = {}
        
        # Run simulations for each system
        for system in systems:
            if system == 'stv':
                seats = data.get('seats', 3)
                calculator = STVCalculator(candidates, seats)
                results[system] = calculator.run_election(ballots)
            # Add other systems as needed
        
        return jsonify({
            'success': True,
            'results': results,
            'metadata': {
                'num_voters': num_voters,
                'distribution': distribution,
                'unique_ballots': len(ballots)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/scenario/save', methods=['POST'])
def save_scenario():
    """
    Save election scenario to database for sharing
    
    Request body:
    {
        "name": "2024 Test Election",
        "system": "stv",
        "data": {...}  // Full scenario data
    }
    """
    try:
        data = request.json
        name = data['name']
        system = data['system']
        scenario_data = json.dumps(data['data'])
        
        # Generate unique ID
        scenario_id = hashlib.md5(
            f"{name}{system}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO scenarios (id, name, system, data) VALUES (?, ?, ?, ?)',
            (scenario_id, name, system, scenario_data)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'scenario_id': scenario_id,
            'share_url': f'/scenario/{scenario_id}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/scenario/<scenario_id>', methods=['GET'])
def load_scenario(scenario_id):
    """Load saved scenario by ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT name, system, data, created_at FROM scenarios WHERE id = ?',
            (scenario_id,)
        )
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({
                'success': False,
                'error': 'Scenario not found'
            }), 404
        
        return jsonify({
            'success': True,
            'scenario': {
                'id': scenario_id,
                'name': row[0],
                'system': row[1],
                'data': json.loads(row[2]),
                'created_at': row[3]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'features': [
            'advanced_stv',
            'strategic_voting',
            'ballot_generation',
            'batch_simulation',
            'scenario_persistence'
        ]
    })


if __name__ == '__main__':
    print("🐍 Electoral Systems Simulator - Python Backend")
    print("=" * 50)
    print("Starting Flask server on http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  POST /api/stv/calculate")
    print("  POST /api/strategic-voting/simulate")
    print("  POST /api/ballots/generate")
    print("  POST /api/batch-simulation")
    print("  POST /api/scenario/save")
    print("  GET  /api/scenario/<id>")
    print("  GET  /api/health")
    print("=" * 50)
    
    app.run(debug=True, port=5000)


