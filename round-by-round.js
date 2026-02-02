/**
 * Round-by-Round Visualization for IRV/STV
 * Displays elimination rounds and vote transfers
 */

/**
 * Display round-by-round results for ranked voting systems
 * @param {Array} rounds - Array of round data from IRV/STV calculation
 * @param {Array} candidates - Array of all candidates with ID and name
 * @param {String} system - 'irv' or 'stv'
 * @param {Array} parties - Optional array of parties (needed for party-based STV)
 * @returns {String} - HTML string for rounds display
 */
function createRoundByRoundDisplay(rounds, candidates, system = 'irv', parties = null) {
    if (!rounds || rounds.length === 0) return '';
    
    const isStv = system === 'stv';
    
    let html = `
        <div class="rounds-panel">
            <button onclick="toggleEliminationRounds()" style="
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">
                <span><span id="eliminationRoundsIcon">▶</span> 📊 ${isStv ? 'STV' : 'IRV'} Elimination Rounds</span>
                <span style="font-size: 0.9em; opacity: 0.9;">(Click to expand)</span>
            </button>
            <div id="eliminationRoundsPanel" style="display: none; margin-top: 15px;">
                <table class="rounds-table">
                <thead>
                    <tr>
                        <th>Round</th>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Action</th>
                        ${isStv ? '<th>Status</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;
    
    rounds.forEach((round, index) => {
        const roundNum = index + 1;
        
        // For each candidate/party in this round
        if (round.voteCounts) {
            const ids = Object.keys(round.voteCounts);
            
            // Check if this is party-based STV (system='stv' and parties provided)
            const isPartyBased = (system === 'stv' && parties && parties.length > 0);
            
            ids.forEach((id, idIndex) => {
                const votes = round.voteCounts[id] || 0;
                let displayName = '';
                let action = '';
                let actionClass = '';
                
                if (isPartyBased) {
                    // Party-based: look up party, then find associated candidate
                    // For party-based STV, we show the party name and the candidate that was elected
                    const partyId = id;
                    let partyName = `Party ${partyId}`;
                    
                    // Try to find party name from parties array or candidates
                    if (parties && typeof parties !== 'undefined') {
                        const party = parties.find(p => p.id.toString() === partyId.toString());
                        if (party) {
                            partyName = party.name;
                        }
                    } else {
                        // Fallback: try to find party name from candidates
                        const partyCandidate = candidates.find(c => c.partyId.toString() === partyId.toString());
                        if (partyCandidate && partyCandidate.party) {
                            partyName = partyCandidate.party;
                        }
                    }
                    
                    displayName = partyName;
                    
                    // Check if this party was eliminated or elected
                    if (round.party_id && (round.party_id.toString() === partyId.toString())) {
                        if (round.action === 'eliminated') {
                            action = '❌ Party Eliminated';
                            actionClass = 'eliminated';
                        } else if (round.action === 'elected' && round.candidate_id) {
                            const electedCandidate = candidates.find(c => 
                                c.id.toString() === round.candidate_id.toString()
                            );
                            const seatNumber = round.seat_number || '';
                            const candidateName = electedCandidate ? electedCandidate.name : 'Candidate';
                            action = seatNumber ? `✅ Seat ${seatNumber}: ${candidateName}` : `✅ Elected (${candidateName})`;
                            actionClass = 'elected';
                        }
                    }
                } else {
                    // Candidate-based: standard lookup
                    const candidate = candidates.find(c => c.id == id);
                    displayName = candidate ? candidate.name : `Candidate ${id}`;
                    
                    // Check if this candidate was eliminated
                    if (round.eliminated && round.eliminated == id) {
                        action = '❌ Eliminated';
                        actionClass = 'eliminated';
                    } else if (round.winner && round.winner == id) {
                        action = '✅ Winner';
                        actionClass = 'elected';
                    } else if (round.action === 'elected' && round.candidate_id == id) {
                        action = '✅ Elected';
                        actionClass = 'elected';
                    } else if (idIndex === 0 && round.action === 'eliminated') {
                        action = '➡️ Votes transferred';
                        actionClass = 'transferred';
                    }
                }
                
                html += `
                    <tr>
                        ${idIndex === 0 ? `<td rowspan="${ids.length}" style="font-weight: bold; vertical-align: middle;">${roundNum}</td>` : ''}
                        <td>${displayName}</td>
                        <td>${Math.round(votes).toLocaleString()}</td>
                        <td>${action ? `<span class="round-action ${actionClass}">${action}</span>` : '—'}</td>
                        ${isStv ? `<td>${round.quota ? (votes >= round.quota ? 'Above quota' : 'Below quota') : ''}</td>` : ''}
                    </tr>
                `;
            });
        }
    });
    
    html += `
                </tbody>
            </table>
            ${isStv && rounds[0]?.quota ? `<p style="margin-top: 15px; color: #666;"><strong>Droop Quota:</strong> ${Math.round(rounds[0].quota).toLocaleString()} votes</p>` : ''}
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                ℹ️ In ${isStv ? 'STV' : 'IRV'}, candidates with the fewest votes are eliminated and their votes are transferred to the next preference until ${isStv ? 'all seats are filled' : 'a candidate achieves a majority'}.
            </p>
            </div>
        </div>
    `;
    
    return html;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createRoundByRoundDisplay
    };
}

