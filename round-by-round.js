/**
 * Round-by-Round Visualization for IRV/STV
 * Displays elimination rounds and vote transfers
 */

/**
 * Display round-by-round results for ranked voting systems
 * @param {Array} rounds - Array of round data from IRV/STV calculation
 * @param {Array} candidates - Array of all candidates with ID and name
 * @param {String} system - 'irv' or 'stv'
 * @returns {String} - HTML string for rounds display
 */
function createRoundByRoundDisplay(rounds, candidates, system = 'irv') {
    if (!rounds || rounds.length === 0) return '';
    
    const isStv = system === 'stv';
    
    let html = `
        <div class="rounds-panel">
            <h4>📊 ${isStv ? 'STV' : 'IRV'} Elimination Rounds</h4>
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
        
        // For each candidate in this round
        if (round.voteCounts) {
            const candidateIds = Object.keys(round.voteCounts);
            
            candidateIds.forEach((candId, candIndex) => {
                const votes = round.voteCounts[candId] || 0;
                const candidate = candidates.find(c => c.id == candId);
                const candName = candidate ? candidate.name : `Candidate ${candId}`;
                
                let action = '';
                let actionClass = '';
                
                // Check if this candidate was eliminated
                if (round.eliminated && round.eliminated == candId) {
                    action = '❌ Eliminated';
                    actionClass = 'eliminated';
                } else if (round.winner && round.winner == candId) {
                    action = '✅ Winner';
                    actionClass = 'elected';
                } else if (round.action === 'elected' && round.candidate_id == candId) {
                    action = '✅ Elected';
                    actionClass = 'elected';
                } else if (candIndex === 0 && round.action === 'eliminated') {
                    action = '➡️ Votes transferred';
                    actionClass = 'transferred';
                }
                
                html += `
                    <tr>
                        ${candIndex === 0 ? `<td rowspan="${candidateIds.length}" style="font-weight: bold; vertical-align: middle;">${roundNum}</td>` : ''}
                        <td>${candName}</td>
                        <td>${votes.toLocaleString()}</td>
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
            ${isStv && rounds[0]?.quota ? `<p style="margin-top: 15px; color: #666;"><strong>Droop Quota:</strong> ${rounds[0].quota.toLocaleString()} votes</p>` : ''}
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                ℹ️ In ${isStv ? 'STV' : 'IRV'}, candidates with the fewest votes are eliminated and their votes are transferred to the next preference until ${isStv ? 'all seats are filled' : 'a candidate achieves a majority'}.
            </p>
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

