// Electoral System Calculation Functions
// This module contains all the core algorithms for different voting systems

/**
 * Seat Allocation Methods for Proportional Representation
 */

// D'Hondt method (Jefferson method) - favors larger parties
function allocateSeats_DHondt(partyVotes, totalSeats) {
    const parties = Object.keys(partyVotes);
    const seats = {};
    parties.forEach(p => seats[p] = 0);
    
    for (let i = 0; i < totalSeats; i++) {
        let maxQuotient = -1;
        let winner = null;
        
        parties.forEach(party => {
            if (partyVotes[party] > 0) {
                const quotient = partyVotes[party] / (seats[party] + 1);
                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    winner = party;
                }
            }
        });
        
        if (winner) {
            seats[winner]++;
        }
    }
    
    return seats;
}

// Sainte-Laguë method (Webster method) - more proportional to small parties
function allocateSeats_SainteLague(partyVotes, totalSeats) {
    const parties = Object.keys(partyVotes);
    const seats = {};
    parties.forEach(p => seats[p] = 0);
    
    for (let i = 0; i < totalSeats; i++) {
        let maxQuotient = -1;
        let winner = null;
        
        parties.forEach(party => {
            if (partyVotes[party] > 0) {
                // Divisor is 2n+1 instead of n+1
                const quotient = partyVotes[party] / (2 * seats[party] + 1);
                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    winner = party;
                }
            }
        });
        
        if (winner) {
            seats[winner]++;
        }
    }
    
    return seats;
}

// Hare Quota with Largest Remainder Method - most proportional to small parties
function allocateSeats_HareLR(partyVotes, totalSeats) {
    const allocatedSeats = {};
    const remainders = {};
    const totalVotes = Object.values(partyVotes).reduce((sum, v) => sum + v, 0);
    
    if (totalVotes === 0) return allocatedSeats;

    // 1. Calculate the Hare Quota (Q = V / S)
    const quota = totalVotes / totalSeats;

    // 2. First Pass: Automatic seats (Integer part of Votes / Quota)
    let seatsAlreadyAllocated = 0;
    
    Object.entries(partyVotes).forEach(([id, votes]) => {
        const exactShare = votes / quota;
        const automaticSeats = Math.floor(exactShare);
        
        allocatedSeats[id] = automaticSeats;
        seatsAlreadyAllocated += automaticSeats;
        
        // Store the remainder for the second pass
        remainders[id] = exactShare - automaticSeats;
    });

    // 3. Second Pass: Allocate remaining seats based on Largest Remainder
    let seatsRemaining = totalSeats - seatsAlreadyAllocated;
    
    // Sort parties by remainder descending
    const sortedByRemainder = Object.keys(remainders).sort((a, b) => 
        remainders[b] - remainders[a]
    );

    for (let i = 0; i < seatsRemaining; i++) {
        const partyId = sortedByRemainder[i];
        if (partyId) {
            allocatedSeats[partyId]++;
        }
    }

    return allocatedSeats;
}

/**
 * Calculate Loosemore-Hanby Index (measure of disproportionality)
 * Returns a value between 0 (perfectly proportional) and 100 (totally disproportional)
 */
function calculateLoosemoreHanby(voteShares, seatShares) {
    let sum = 0;
    const parties = Object.keys(voteShares);
    
    parties.forEach(party => {
        const votePct = voteShares[party] || 0;
        const seatPct = seatShares[party] || 0;
        sum += Math.abs(votePct - seatPct);
    });
    
    return sum / 2; // Divide by 2 as per the formula
}

/**
 * Calculate Gallagher Index (Least Squares measure of disproportionality)
 * Penalizes large deviations more heavily than Loosemore-Hanby by squaring differences
 * Returns a value between 0 (perfectly proportional) and 100 (totally disproportional)
 * 
 * This is the academic standard used by political scientists.
 * 
 * Formula: sqrt((1/2) * sum((V_i - S_i)^2))
 * Where V_i = vote share % for party i, S_i = seat share % for party i
 */
function calculateGallagher(voteShares, seatShares) {
    let sumSquares = 0;
    const parties = Object.keys(voteShares);
    
    parties.forEach(party => {
        const votePct = voteShares[party] || 0;
        const seatPct = seatShares[party] || 0;
        const diff = votePct - seatPct;
        sumSquares += Math.pow(diff, 2);
    });
    
    return Math.sqrt(sumSquares / 2);
}

/**
 * Calculate Droop Quota for STV
 * 
 * CRITICAL: This quota should be calculated ONCE at the start of the election
 * based on the initial valid vote count. It must NEVER be recalculated during
 * elimination rounds, even as ballots become exhausted. The quota remains static
 * throughout the entire STV process to maintain mathematical consistency.
 * 
 * Formula: floor(totalVotes / (seats + 1)) + 1
 * 
 * This ensures it's mathematically impossible for more candidates to reach the
 * quota than there are seats available.
 */
function calculateDroopQuota(totalVotes, seats) {
    return Math.floor(totalVotes / (seats + 1)) + 1;
}

/**
 * Full IRV Implementation with proper vote transfers
 */
function calculateIRV_Full(ballots, candidates) {
    const candidateIds = candidates.map(c => c.id);
    let eliminated = new Set();
    const rounds = [];
    let roundNumber = 0;
    
    while (eliminated.size < candidateIds.length - 1) {
        roundNumber++;
        
        // Count votes for this round
        const voteCounts = {};
        candidateIds.forEach(id => voteCounts[id] = 0);
        
        ballots.forEach(ballot => {
            // Find first non-eliminated preference
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId)) {
                    voteCounts[prefId] += ballot.count;
                    break;
                }
            }
        });
        
        // Calculate total active votes
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id));
        const totalVotes = activeCandidates.reduce((sum, id) => sum + (voteCounts[id] || 0), 0);
        
        // Store round information
        const roundInfo = {
            round: roundNumber,
            voteCounts: {...voteCounts},
            totalVotes: totalVotes,
            eliminated: null,
            winner: null
        };
        
        // Check for majority winner
        const maxVotes = Math.max(...activeCandidates.map(id => voteCounts[id]));
        if (maxVotes > totalVotes / 2) {
            const winner = activeCandidates.find(id => voteCounts[id] === maxVotes);
            roundInfo.winner = winner;
            rounds.push(roundInfo);
            break;
        }
        
        // Eliminate candidate with fewest votes
        const minVotes = Math.min(...activeCandidates.map(id => voteCounts[id]));
        const toEliminate = activeCandidates.find(id => voteCounts[id] === minVotes);
        
        if (toEliminate) {
            eliminated.add(toEliminate);
            roundInfo.eliminated = toEliminate;
        }
        
        rounds.push(roundInfo);
        
        // Safety check
        if (roundNumber > 20) break;
    }
    
    return {
        rounds: rounds,
        eliminated: eliminated,
        winner: candidateIds.find(id => !eliminated.has(id))
    };
}

/**
 * Full STV Implementation with surplus transfer using Droop Quota
 */
function calculateSTV_Full(ballots, candidates, seats) {
    const candidateIds = candidates.map(c => c.id);
    const totalVotes = ballots.reduce((sum, b) => sum + b.count, 0);
    const quota = calculateDroopQuota(totalVotes, seats);
    
    let elected = [];
    let eliminated = new Set();
    const rounds = [];
    let roundNumber = 0;
    
    // Create working ballots with weight
    let workingBallots = ballots.map(b => ({
        ...b,
        weight: 1.0,
        currentPreference: 0
    }));
    
    while (elected.length < seats && elected.length + eliminated.size < candidateIds.length) {
        roundNumber++;
        
        // Count weighted votes
        const voteCounts = {};
        candidateIds.forEach(id => voteCounts[id] = 0);
        
        workingBallots.forEach(ballot => {
            // Find first non-eliminated, non-elected preference
            for (let i = ballot.currentPreference; i < ballot.preferences.length; i++) {
                const prefId = ballot.preferences[i];
                if (!eliminated.has(prefId) && !elected.includes(prefId)) {
                    voteCounts[prefId] += ballot.count * ballot.weight;
                    ballot.currentPreference = i;
                    break;
                }
            }
        });
        
        const roundInfo = {
            round: roundNumber,
            voteCounts: {...voteCounts},
            quota: quota,
            action: null,
            candidate: null
        };
        
        // Check if any candidate meets quota
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id) && !elected.includes(id));
        const maxVotes = Math.max(...activeCandidates.map(id => voteCounts[id] || 0));
        
        if (maxVotes >= quota) {
            // Elect candidate
            const winner = activeCandidates.find(id => voteCounts[id] === maxVotes);
            elected.push(winner);
            roundInfo.action = 'elected';
            roundInfo.candidate = winner;
            
            // Transfer surplus votes
            const surplus = voteCounts[winner] - quota;
            const transferValue = surplus / voteCounts[winner];
            
            // Update weights for ballots that voted for winner
            workingBallots.forEach(ballot => {
                if (ballot.preferences[ballot.currentPreference] === winner) {
                    ballot.weight *= transferValue;
                    ballot.currentPreference++; // Move to next preference
                }
            });
            
            roundInfo.surplus = surplus;
            roundInfo.transferValue = transferValue;
        } else if (elected.length + activeCandidates.length <= seats) {
            // Elect all remaining candidates
            activeCandidates.forEach(id => {
                if (!elected.includes(id)) {
                    elected.push(id);
                }
            });
            roundInfo.action = 'elected_remaining';
            break;
        } else {
            // Eliminate candidate with fewest votes
            const minVotes = Math.min(...activeCandidates.map(id => voteCounts[id] || 0));
            const toEliminate = activeCandidates.find(id => voteCounts[id] === minVotes);
            
            if (toEliminate) {
                eliminated.add(toEliminate);
                roundInfo.action = 'eliminated';
                roundInfo.candidate = toEliminate;
                
                // Transfer votes at full value
                workingBallots.forEach(ballot => {
                    if (ballot.preferences[ballot.currentPreference] === toEliminate) {
                        ballot.currentPreference++; // Move to next preference
                    }
                });
            }
        }
        
        rounds.push(roundInfo);
        
        // Safety check
        if (roundNumber > 50) break;
    }
    
    return {
        rounds: rounds,
        elected: elected,
        eliminated: eliminated,
        quota: quota
    };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        allocateSeats_DHondt,
        allocateSeats_SainteLague,
        calculateLoosemoreHanby,
        calculateGallagher,  // NEW: Gallagher Index
        calculateDroopQuota,
        calculateIRV_Full,
        calculateSTV_Full
    };
}

