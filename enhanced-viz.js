/**
 * Enhanced Visualization Features
 * - IRV/STV Round-by-Round Flow
 * - Natural Threshold Display
 * - Ideological Spectrum Map
 */

/**
 * Display round-by-round flow for IRV/STV
 */
function displayRoundByRoundFlow(rounds, candidates) {
    if (!rounds || rounds.length === 0) return '';
    
    let html = '<div class="round-by-round-flow">';
    html += '<h3 style="margin-top: 30px;">🔄 Round-by-Round Flow</h3>';
    html += '<div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">';
    
    rounds.forEach((round, index) => {
        html += `<div class="round-card">`;
        html += `<h4>Round ${round.round || (index + 1)}</h4>`;
        
        // Show vote counts
        html += '<div class="round-votes">';
        
        // Sort by votes
        const sortedCandidates = Object.entries(round.votes || round.candidate_votes || {})
            .sort((a, b) => b[1] - a[1]);
        
        sortedCandidates.forEach(([candId, votes]) => {
            const cand = candidates.find(c => c.id === parseInt(candId));
            if (cand && votes > 0) {
                const party = parties.find(p => p.id === cand.partyId);
                const isElected = round.elected && round.elected.includes(parseInt(candId));
                const isEliminated = round.eliminated === parseInt(candId);
                
                let status = '';
                if (isElected) status = '<span class="winner-badge">✓ ELECTED</span>';
                if (isEliminated) status = '<span class="eliminated-badge">✗ ELIMINATED</span>';
                
                html += `
                    <div class="round-candidate" style="border-left: 3px solid ${party.color}">
                        <span class="round-candidate-name">${cand.name}</span>
                        <span class="round-candidate-votes">${formatNumber(Math.round(votes))} votes</span>
                        ${status}
                    </div>
                `;
            }
        });
        
        html += '</div>';
        
        // Show action taken
        if (round.action) {
            html += `<div class="round-action">💡 ${round.action}</div>`;
        }
        
        // Show surplus info for STV
        if (round.surplus && round.surplus > 0) {
            html += `<div class="round-info">Surplus transferred: ${formatNumber(Math.round(round.surplus))}</div>`;
        }
        
        html += `</div>`;
    });
    
    html += '</div>';
    html += '</div>';
    
    return html;
}

/**
 * Display Natural Threshold for PR systems
 */
function displayNaturalThreshold(seats, legalThreshold) {
    const naturalThreshold = 100 / (seats + 1);
    
    let html = '<div class="threshold-info" style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">';
    html += '<strong>📊 Electoral Thresholds</strong>';
    html += '<div style="margin-top: 10px;">';
    
    html += `<div style="margin-bottom: 8px;">
        <strong>Natural Threshold:</strong> ${naturalThreshold.toFixed(2)}%
        <span style="color: #666; font-size: 0.9em;"> (theoretical minimum to win one seat)</span>
    </div>`;
    
    if (legalThreshold && legalThreshold > 0) {
        html += `<div style="margin-bottom: 8px;">
            <strong>Legal Threshold:</strong> ${legalThreshold}%
            <span style="color: #666; font-size: 0.9em;"> (required by law)</span>
        </div>`;
        
        if (legalThreshold > naturalThreshold) {
            html += `<div style="margin-top: 10px; padding: 10px; background: #ffe5e5; border-radius: 4px; font-size: 0.9em;">
                ⚠️ Legal threshold is ${(legalThreshold - naturalThreshold).toFixed(2)}% higher than natural threshold, increasing disproportionality.
            </div>`;
        }
    }
    
    html += '</div></div>';
    
    return html;
}

/**
 * Display Ideological Spectrum Map
 * Shows candidates/parties on a left-right axis
 */
function displayIdeologicalSpectrum(candidatesData, resultsData) {
    let html = '<div class="ideological-spectrum">';
    html += '<h3 style="margin-top: 30px;">🔵◀───▶🔴 Ideological Spectrum</h3>';
    html += '<div style="background: linear-gradient(to right, #3498db, #95a5a6, #e74c3c); height: 60px; border-radius: 8px; position: relative; margin: 20px 0;">';
    
    // Position candidates along spectrum
    candidatesData.forEach((cand, index) => {
        // Generate position based on ballot data or evenly distribute
        let position = 50; // Center by default
        
        if (cand.ideologicalPosition !== undefined) {
            position = cand.ideologicalPosition;
        } else {
            // Distribute evenly if no data
            position = ((index + 1) / (candidatesData.length + 1)) * 100;
        }
        
        // Check if candidate won/elected
        const isWinner = resultsData && (
            (resultsData.winner && resultsData.winner === cand.id) ||
            (resultsData.elected && resultsData.elected.includes(cand.id)) ||
            (resultsData.results && resultsData.results.find(r => r.name === cand.name && r.winner))
        );
        
        html += `
            <div class="spectrum-candidate ${isWinner ? 'spectrum-winner' : ''}" 
                 style="left: ${position}%; 
                        position: absolute; 
                        top: -30px; 
                        transform: translateX(-50%);
                        text-align: center;">
                <div style="background: ${parties.find(p => p.id === cand.partyId)?.color}; 
                            width: 20px; 
                            height: 20px; 
                            border-radius: 50%; 
                            margin: 0 auto;
                            border: ${isWinner ? '3px solid gold' : '2px solid white'};
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                <div style="font-size: 0.8em; 
                            margin-top: 5px; 
                            white-space: nowrap;
                            font-weight: ${isWinner ? 'bold' : 'normal'};">
                    ${cand.name}${isWinner ? ' ⭐' : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Legend
    html += '<div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 0.9em; color: #666;">';
    html += '<span>← Left-wing</span>';
    html += '<span>Center</span>';
    html += '<span>Right-wing →</span>';
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

/**
 * CSS for new visualization components
 */
const visualizationStyles = `
<style>
.round-by-round-flow {
    margin-top: 30px;
}

.round-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.round-card h4 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.1em;
    border-bottom: 2px solid #3498db;
    padding-bottom: 8px;
}

.round-votes {
    margin: 10px 0;
}

.round-candidate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin: 5px 0;
    background: #f8f9fa;
    border-radius: 4px;
}

.round-candidate-name {
    font-weight: 500;
}

.round-candidate-votes {
    color: #666;
    font-weight: bold;
}

.eliminated-badge {
    background: #e74c3c;
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: bold;
}

.round-action {
    margin-top: 10px;
    padding: 10px;
    background: #e8f5e9;
    border-radius: 4px;
    font-style: italic;
    color: #2e7d32;
}

.round-info {
    margin-top: 8px;
    padding: 8px;
    background: #fff3cd;
    border-radius: 4px;
    font-size: 0.9em;
    color: #856404;
}

.ideological-spectrum {
    margin-top: 30px;
}

.spectrum-candidate {
    transition: all 0.3s ease;
}

.spectrum-candidate:hover {
    transform: translateX(-50%) scale(1.2) !important;
    z-index: 10;
}

.spectrum-winner {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: translateX(-50%) scale(1);
    }
    50% {
        transform: translateX(-50%) scale(1.1);
    }
}

.threshold-info strong {
    color: #856404;
}
</style>
`;

// Inject styles
if (!document.getElementById('visualization-styles')) {
    document.head.insertAdjacentHTML('beforeend', visualizationStyles.replace('<style>', '<style id="visualization-styles">'));
}

