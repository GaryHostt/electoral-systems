"""
Electoral Systems Simulator - Python Backend
Flask API for advanced computational analysis and data persistence
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import sqlite3
import hashlib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import modular calculators
from calculators import (
    STVCalculator,
    StrategicVotingSimulator,
    BallotGenerator,
    STVCandidate,
    STVBallot
)
from calculators.ranked_systems import BordaCountCalculator, CondorcetCalculator
from calculators.multi_district import MultiDistrictCalculator, District

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configuration from environment variables
DB_PATH = os.getenv('DB_PATH', 'electoral_data.db')
FLASK_HOST = os.getenv('FLASK_HOST', 'localhost')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
MAX_VOTERS = int(os.getenv('MAX_VOTERS', 1000000))
MAX_CANDIDATES = int(os.getenv('MAX_CANDIDATES', 50))
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY', '')

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
        
        candidates = [STVCandidate(**c) for c in data['candidates']]
        ballots = [STVBallot(**b) for b in data['ballots']]
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
        
        # Import from modular calculator
        from calculators.strategic import Candidate as StratCandidate
        candidates = [StratCandidate(**c) for c in data['candidates']]
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
        
        # Import from modular calculator
        from calculators.ballot_gen import Candidate as BallotCandidate
        candidates = [BallotCandidate(**c) for c in data['candidates']]
        num_voters = min(data.get('num_voters', 1000), MAX_VOTERS)
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
        
        # Import from modular calculator  
        from calculators.ballot_gen import Candidate as BallotCandidate
        candidates = [BallotCandidate(**c) for c in data['candidates']]
        num_voters = min(data.get('num_voters', 10000), MAX_VOTERS)
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
                stv_candidates = [STVCandidate(**c.__dict__) for c in candidates]
                stv_ballots = [STVBallot(preferences=b.preferences, count=b.count) for b in ballots]
                calculator = STVCalculator(stv_candidates, seats)
                results[system] = calculator.run_election(stv_ballots)
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
        'version': '2.0.0',
        'features': [
            'advanced_stv',
            'strategic_voting',
            'ballot_generation',
            'batch_simulation',
            'scenario_persistence',
            'borda_count',
            'condorcet_method',
            'multi_district_mmp',
            'multi_district_parallel',
            'ai_analysis'
        ]
    })

@app.route('/api/ai-analysis', methods=['POST', 'OPTIONS'])
def ai_analysis():
    """
    Proxy endpoint for Mistral AI analysis to keep API key secure
    
    Request body:
    {
        "election_data": "prompt text"
    }
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        if not MISTRAL_API_KEY:
            return jsonify({
                'success': False,
                'error': 'MISTRAL_API_KEY not configured in environment'
            }), 500
        
        data = request.json
        election_prompt = data.get('election_data', '')
        
        if not election_prompt:
            return jsonify({
                'success': False,
                'error': 'No election data provided'
            }), 400
        
        # Call Mistral AI API
        import requests as req
        
        mistral_response = req.post(
            'https://api.mistral.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {MISTRAL_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'mistral-small-latest',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a political science expert specializing in comparative electoral systems and voting theory.'
                    },
                    {
                        'role': 'user',
                        'content': election_prompt
                    }
                ],
                'max_tokens': 300,
                'temperature': 0.7
            },
            timeout=30
        )
        
        if mistral_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Mistral API error: {mistral_response.status_code}',
                'message': mistral_response.text
            }), mistral_response.status_code
        
        mistral_data = mistral_response.json()
        analysis = mistral_data['choices'][0]['message']['content']
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        import traceback
        print(f"Error in AI analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/multi-district/mmp', methods=['POST'])
def calculate_multi_district_mmp():
    """
    Calculate Multi-District MMP
    """
    try:
        data = request.json
        
        from calculators.multi_district import Candidate as MDCandidate
        candidates = [MDCandidate(**c) for c in data['candidates']]
        districts = [District(**d) for d in data['districts']]
        
        calculator = MultiDistrictCalculator(candidates, data['parties'])
        results = calculator.calculate_multi_district_mmp(
            districts=districts,
            party_votes={int(k): v for k, v in data['party_votes'].items()},  # Ensure integer keys
            list_seats=data['list_seats'],
            allocation_method=data.get('allocation_method', 'dhondt'),
            threshold=data.get('threshold', 0.0)
        )
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400


@app.route('/api/multi-district/parallel', methods=['POST'])
def calculate_multi_district_parallel():
    """
    Calculate Multi-District Parallel Voting
    
    Same format as MMP endpoint
    """
    try:
        data = request.json
        
        from calculators.multi_district import Candidate as MDCandidate
        candidates = [MDCandidate(**c) for c in data['candidates']]
        districts = [District(**d) for d in data['districts']]
        
        calculator = MultiDistrictCalculator(candidates, data['parties'])
        results = calculator.calculate_multi_district_parallel(
            districts=districts,
            party_votes=data['party_votes'],
            list_seats=data['list_seats'],
            allocation_method=data.get('allocation_method', 'dhondt'),
            threshold=data.get('threshold', 0.0)
        )
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/borda/calculate', methods=['POST'])
def calculate_borda():
    """
    Calculate Borda Count results
    
    Request body:
    {
        "candidates": [...],
        "ballots": [{"preferences": [1, 2, 3], "count": 100}]
    }
    """
    try:
        data = request.json
        
        from calculators.ranked_systems import Candidate as RankedCandidate, Ballot as RankedBallot
        candidates = [RankedCandidate(**c) for c in data['candidates']]
        ballots = [RankedBallot(**b) for b in data['ballots']]
        
        calculator = BordaCountCalculator(candidates)
        results = calculator.calculate(ballots)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/condorcet/calculate', methods=['POST'])
def calculate_condorcet():
    """
    Calculate Condorcet winner using pairwise comparisons
    
    Request body:
    {
        "candidates": [...],
        "ballots": [{"preferences": [1, 2, 3], "count": 100}]
    }
    """
    try:
        data = request.json
        
        from calculators.ranked_systems import Candidate as RankedCandidate, Ballot as RankedBallot
        candidates = [RankedCandidate(**c) for c in data['candidates']]
        ballots = [RankedBallot(**b) for b in data['ballots']]
        
        calculator = CondorcetCalculator(candidates)
        results = calculator.calculate(ballots)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


if __name__ == '__main__':
    print("🐍 Electoral Systems Simulator - Python Backend")
    print("=" * 50)
    print(f"Starting Flask server on http://{FLASK_HOST}:{FLASK_PORT}")
    print(f"Database: {DB_PATH}")
    print(f"Max voters per simulation: {MAX_VOTERS:,}")
    print("\nAvailable endpoints:")
    print("  POST /api/stv/calculate")
    print("  POST /api/strategic-voting/simulate")
    print("  POST /api/ballots/generate")
    print("  POST /api/batch-simulation")
    print("  POST /api/scenario/save")
    print("  GET  /api/scenario/<id>")
    print("  POST /api/ai-analysis")
    print("  GET  /api/health")
    print("=" * 50)
    
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)


