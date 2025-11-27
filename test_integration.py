"""
End-to-End Integration Test
Tests all API endpoints and features
"""

import requests
import json
import time

API_URL = "http://localhost:5000"

def test_health_check():
    """Test health endpoint"""
    print("🔍 Testing health check...")
    response = requests.get(f"{API_URL}/api/health")
    data = response.json()
    
    assert response.status_code == 200
    assert data['status'] == 'healthy'
    assert 'borda_count' in data['features']
    assert 'condorcet_method' in data['features']
    assert 'multi_district_mmp' in data['features']
    
    print(f"✅ Health check passed - Version {data['version']}")
    print(f"   Features: {', '.join(data['features'])}")

def test_borda_count():
    """Test Borda Count endpoint"""
    print("\n🗳️  Testing Borda Count...")
    
    payload = {
        "candidates": [
            {"id": 1, "name": "Alice", "party_id": 1, "party_name": "Party A", "color": "#ff0000"},
            {"id": 2, "name": "Bob", "party_id": 2, "party_name": "Party B", "color": "#00ff00"},
            {"id": 3, "name": "Charlie", "party_id": 3, "party_name": "Party C", "color": "#0000ff"}
        ],
        "ballots": [
            {"preferences": [1, 2, 3], "count": 100},
            {"preferences": [2, 1, 3], "count": 80},
            {"preferences": [3, 2, 1], "count": 50}
        ]
    }
    
    response = requests.post(f"{API_URL}/api/borda/calculate", json=payload)
    data = response.json()
    
    assert response.status_code == 200
    assert data['success'] == True
    assert 'results' in data['results']
    
    winner = data['results']['results'][0]
    print(f"✅ Borda Count passed")
    print(f"   Winner: {winner['name']} with {winner['points']} points")

def test_condorcet():
    """Test Condorcet Method endpoint"""
    print("\n🥊 Testing Condorcet Method...")
    
    payload = {
        "candidates": [
            {"id": 1, "name": "Alice", "party_id": 1, "party_name": "Party A", "color": "#ff0000"},
            {"id": 2, "name": "Bob", "party_id": 2, "party_name": "Party B", "color": "#00ff00"},
            {"id": 3, "name": "Charlie", "party_id": 3, "party_name": "Party C", "color": "#0000ff"}
        ],
        "ballots": [
            {"preferences": [1, 2, 3], "count": 100},
            {"preferences": [2, 3, 1], "count": 90},
            {"preferences": [3, 1, 2], "count": 85}
        ]
    }
    
    response = requests.post(f"{API_URL}/api/condorcet/calculate", json=payload)
    data = response.json()
    
    assert response.status_code == 200
    assert data['success'] == True
    
    if data['results']['has_paradox']:
        print(f"✅ Condorcet passed - Paradox detected (voting cycle)")
    else:
        winner_name = data['results']['winner_name']
        print(f"✅ Condorcet passed - Winner: {winner_name}")

def test_multi_district_mmp():
    """Test Multi-District MMP endpoint"""
    print("\n🗺️  Testing Multi-District MMP...")
    
    payload = {
        "candidates": [
            {"id": 1, "name": "Alice", "party_id": 1, "party_name": "Party A", "color": "#ff0000"},
            {"id": 2, "name": "Bob", "party_id": 1, "party_name": "Party A", "color": "#ff0000"},
            {"id": 3, "name": "Charlie", "party_id": 2, "party_name": "Party B", "color": "#00ff00"},
            {"id": 4, "name": "Diana", "party_id": 2, "party_name": "Party B", "color": "#00ff00"}
        ],
        "parties": {
            1: {"name": "Party A", "color": "#ff0000"},
            2: {"name": "Party B", "color": "#00ff00"}
        },
        "districts": [
            {
                "id": 1,
                "name": "District 1",
                "candidates": [1, 3],
                "votes": {1: 1000, 3: 900}
            },
            {
                "id": 2,
                "name": "District 2",
                "candidates": [2, 4],
                "votes": {2: 800, 4: 1200}
            }
        ],
        "party_votes": {1: 1800, 2: 2100},
        "list_seats": 2,
        "allocation_method": "dhondt",
        "threshold": 0.0
    }
    
    response = requests.post(f"{API_URL}/api/multi-district/mmp", json=payload)
    
    if response.status_code != 200:
        print(f"   Status code: {response.status_code}")
        print(f"   Response: {response.text}")
    
    data = response.json()
    
    assert response.status_code == 200
    assert data['success'] == True
    
    results = data['results']
    print(f"✅ Multi-District MMP passed")
    print(f"   Districts: {results['total_districts']}")
    print(f"   List seats: {results['list_seats']}")
    print(f"   Overhang seats: {results['total_overhang']}")
    print(f"   Final parliament: {results['final_parliament_size']} seats")
    
    for party in results['party_results']:
        print(f"   {party['party_name']}: {party['district_seats']} district + {party['list_seats']} list = {party['actual_seats']} total")

def test_stv():
    """Test STV endpoint"""
    print("\n📊 Testing Advanced STV...")
    
    payload = {
        "candidates": [
            {"id": 1, "name": "Alice", "party_id": 1, "party_name": "Party A", "color": "#ff0000"},
            {"id": 2, "name": "Bob", "party_id": 2, "party_name": "Party B", "color": "#00ff00"},
            {"id": 3, "name": "Charlie", "party_id": 3, "party_name": "Party C", "color": "#0000ff"}
        ],
        "ballots": [
            {"preferences": [1, 2, 3], "count": 500},
            {"preferences": [2, 1, 3], "count": 400},
            {"preferences": [3, 2, 1], "count": 300}
        ],
        "seats": 2
    }
    
    response = requests.post(f"{API_URL}/api/stv/calculate", json=payload)
    data = response.json()
    
    assert response.status_code == 200
    assert data['success'] == True
    
    results = data['results']
    print(f"✅ STV passed")
    print(f"   Elected: {len(results['elected'])} candidates")
    print(f"   Quota: {results['quota']} votes")
    print(f"   Rounds: {len(results['rounds'])}")

def run_all_tests():
    """Run all integration tests"""
    print("="*60)
    print("🚀 Starting End-to-End Integration Tests")
    print("="*60)
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        test_health_check()
        test_borda_count()
        test_condorcet()
        test_multi_district_mmp()
        test_stv()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n🎉 Electoral Systems Simulator v2.0 is fully operational!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_all_tests()

