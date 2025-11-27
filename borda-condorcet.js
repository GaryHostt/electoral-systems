/**
 * Calculate Natural (Effective) Threshold
 * The minimum percentage needed to win at least one seat
 * Formula: 100% / (seats + 1)
 */
function calculateNaturalThreshold(seats) {
    return 100 / (seats + 1);
}

/**
 * Borda Count Calculation
 */
async function calculateBorda(votes) {
    // Collect ballot data from ranking inputs
    const ballots = [];
    let totalBallots = 0;
    
    for (let i = 0; i < 5; i++) {
        const countInput = document.getElementById(`ballot-${i}-count`);
        if (countInput) {
            const count = parseFormattedNumber(countInput.value);
            if (count > 0) {
                const preferences = [];
                
                for (let rank = 1; rank <= 5; rank++) {
                    const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                    if (select && select.value) {
                        preferences.push(parseInt(select.value));
                    }
                }
                
                if (preferences.length > 0) {
                    ballots.push({ preferences, count });
                    totalBallots += count;
                }
            }
        }
    }
    
    if (ballots.length === 0) {
        alert('Please configure ballot rankings for Borda Count');
        return null;
    }
    
    // Try Python backend first
    if (backendAvailable) {
        try {
            const response = await fetch('http://localhost:5000/api/borda/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    ballots: ballots
                })
            });
            
            const data = await response.json();
            if (data.success) {
                const result = data.results;
                
                // Convert to display format
                return {
                    type: 'borda',
                    results: result.results.map(r => ({
                        name: r.name,
                        party: r.party,
                        color: r.color,
                        points: r.points,
                        winner: r.winner || false
                    })),
                    totalBallots: totalBallots,
                    totalPoints: result.total_points,
                    method: result.method
                };
            }
        } catch (error) {
            console.error('Borda backend failed:', error);
        }
    }
    
    // JavaScript fallback
    const n = candidates.length;
    const points = {};
    candidates.forEach(c => points[c.id] = 0);
    
    ballots.forEach(ballot => {
        ballot.preferences.forEach((candId, index) => {
            points[candId] += (n - index - 1) * ballot.count;
        });
    });
    
    const results = candidates.map(candidate => {
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            points: points[candidate.id]
        };
    });
    
    results.sort((a, b) => b.points - a.points);
    if (results.length > 0) results[0].winner = true;
    
    return {
        type: 'borda',
        results: results,
        totalBallots: totalBallots,
        totalPoints: Object.values(points).reduce((sum, p) => sum + p, 0),
        method: 'Borda Count (JavaScript fallback)'
    };
}

/**
 * Condorcet Method Calculation
 */
async function calculateCondorcet(votes) {
    // Collect ballot data
    const ballots = [];
    let totalBallots = 0;
    
    for (let i = 0; i < 5; i++) {
        const countInput = document.getElementById(`ballot-${i}-count`);
        if (countInput) {
            const count = parseFormattedNumber(countInput.value);
            if (count > 0) {
                const preferences = [];
                
                for (let rank = 1; rank <= 5; rank++) {
                    const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                    if (select && select.value) {
                        preferences.push(parseInt(select.value));
                    }
                }
                
                if (preferences.length > 0) {
                    ballots.push({ preferences, count });
                    totalBallots += count;
                }
            }
        }
    }
    
    if (ballots.length === 0) {
        alert('Please configure ballot rankings for Condorcet Method');
        return null;
    }
    
    // Try Python backend first
    if (backendAvailable) {
        try {
            const response = await fetch('http://localhost:5000/api/condorcet/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidates: candidates.map(c => ({
                        id: c.id,
                        name: c.name,
                        party_id: c.partyId,
                        party_name: parties.find(p => p.id === c.partyId)?.name || '',
                        color: parties.find(p => p.id === c.partyId)?.color || '#666'
                    })),
                    ballots: ballots
                })
            });
            
            const data = await response.json();
            if (data.success) {
                const result = data.results;
                
                return {
                    type: 'condorcet',
                    results: result.results,
                    condorcetWinner: result.condorcet_winner,
                    hasParadox: result.has_paradox,
                    pairwiseMatrix: result.pairwise_matrix,
                    totalBallots: totalBallots
                };
            }
        } catch (error) {
            console.error('Condorcet backend failed:', error);
        }
    }
    
    // JavaScript fallback - simplified pairwise comparison
    const pairwise = {};
    candidates.forEach(c1 => {
        pairwise[c1.id] = {};
        candidates.forEach(c2 => {
            if (c1.id !== c2.id) pairwise[c1.id][c2.id] = 0;
        });
    });
    
    // Build pairwise matrix
    ballots.forEach(ballot => {
        for (let i = 0; i < ballot.preferences.length; i++) {
            for (let j = i + 1; j < ballot.preferences.length; j++) {
                pairwise[ballot.preferences[i]][ballot.preferences[j]] += ballot.count;
            }
        }
    });
    
    // Find Condorcet winner
    let condorcetWinner = null;
    const wins = {};
    
    candidates.forEach(c1 => {
        let beatAll = true;
        let winCount = 0;
        
        candidates.forEach(c2 => {
            if (c1.id !== c2.id) {
                if (pairwise[c1.id][c2.id] > pairwise[c2.id][c1.id]) {
                    winCount++;
                } else {
                    beatAll = false;
                }
            }
        });
        
        wins[c1.id] = winCount;
        if (beatAll) condorcetWinner = c1.id;
    });
    
    const results = candidates.map(c => {
        const party = parties.find(p => p.id === c.partyId);
        return {
            id: c.id,
            name: c.name,
            party: party.name,
            color: party.color,
            pairwise_wins: wins[c.id],
            is_condorcet_winner: c.id === condorcetWinner
        };
    });
    
    results.sort((a, b) => b.pairwise_wins - a.pairwise_wins);
    
    return {
        type: 'condorcet',
        results: results,
        condorcetWinner: condorcetWinner,
        hasParadox: condorcetWinner === null,
        totalBallots: totalBallots
    };
}

