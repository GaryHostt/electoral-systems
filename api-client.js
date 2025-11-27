/**
 * API Client for Python Backend
 * Connects frontend JavaScript to Flask backend for advanced features
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ElectoralAPI {
    /**
     * Advanced STV calculation using Python backend
     */
    static async calculateSTVAdvanced(candidates, ballots, seats) {
        try {
            const response = await fetch(`${API_BASE_URL}/stv/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    ballots: ballots,
                    seats: seats
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data.results;
        } catch (error) {
            console.error('STV API Error:', error);
            // Fallback to JavaScript implementation
            return null;
        }
    }

    /**
     * Simulate strategic voting behavior
     */
    static async simulateStrategicVoting(system, candidates, sincereVotes, pollingData = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/strategic-voting/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system: system,
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    sincere_votes: sincereVotes,
                    polling_data: pollingData
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data.results;
        } catch (error) {
            console.error('Strategic Voting API Error:', error);
            return null;
        }
    }

    /**
     * Generate realistic ballot data
     */
    static async generateBallots(candidates, numVoters, distribution = 'normal') {
        try {
            const response = await fetch(`${API_BASE_URL}/ballots/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    num_voters: numVoters,
                    distribution: distribution
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            console.error('Ballot Generation API Error:', error);
            return null;
        }
    }

    /**
     * Run batch simulation across multiple systems
     */
    static async runBatchSimulation(candidates, numVoters, distribution, systems) {
        try {
            const response = await fetch(`${API_BASE_URL}/batch-simulation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    num_voters: numVoters,
                    distribution: distribution,
                    systems: systems,
                    seats: getSeatsCount()
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            console.error('Batch Simulation API Error:', error);
            return null;
        }
    }

    /**
     * Save scenario to database
     */
    static async saveScenario(name, system, scenarioData) {
        try {
            const response = await fetch(`${API_BASE_URL}/scenario/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    system: system,
                    data: scenarioData
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            console.error('Save Scenario API Error:', error);
            return null;
        }
    }

    /**
     * Load scenario from database
     */
    static async loadScenario(scenarioId) {
        try {
            const response = await fetch(`${API_BASE_URL}/scenario/${scenarioId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            return data.scenario;
        } catch (error) {
            console.error('Load Scenario API Error:', error);
            return null;
        }
    }

    /**
     * Check backend health
     */
    static async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return data.status === 'healthy';
        } catch (error) {
            return false;
        }
    }
}

// Check if backend is available on page load
let backendAvailable = false;

ElectoralAPI.checkHealth().then(healthy => {
    backendAvailable = healthy;
    if (healthy) {
        console.log('✅ Python backend connected');
        showBackendFeatures();
    } else {
        console.log('ℹ️ Python backend not available - using JavaScript fallback');
    }
});

function showBackendFeatures() {
    // Show advanced features UI when backend is available
    const advancedFeatures = document.getElementById('advancedFeatures');
    if (advancedFeatures) {
        advancedFeatures.style.display = 'block';
    }
}


