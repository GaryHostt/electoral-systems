/**
 * Advanced Features Integration
 * Python Backend Feature Handlers
 */

// ============================================================================
// Advanced Features (Python Backend Integration)
// ============================================================================

function showBallotGenerator() {
    hideAllAdvancedPanels();
    document.getElementById('ballotGeneratorPanel').style.display = 'block';
}

function showStrategicSimulator() {
    hideAllAdvancedPanels();
    document.getElementById('strategicVotingPanel').style.display = 'block';
}

function showBatchSimulator() {
    hideAllAdvancedPanels();
    document.getElementById('batchSimPanel').style.display = 'block';
}

function hideAllAdvancedPanels() {
    const panels = ['ballotGeneratorPanel', 'strategicVotingPanel', 'batchSimPanel'];
    panels.forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.style.display = 'none';
    });
}

async function generateRealisticBallots() {
    if (!backendAvailable) {
        alert('Python backend not available. Please start the backend server with: python backend.py');
        return;
    }
    
    const system = document.getElementById('electoralSystem').value;
    const rankingSystems = ['irv', 'stv', 'borda', 'condorcet'];
    
    if (!rankingSystems.includes(system)) {
        alert('Ballot generation is only available for ranking systems (IRV, STV, Borda, Condorcet).\n\nFor other systems, use the "Auto-Fill Random Votes" button instead.');
        return;
    }
    
    if (candidates.length === 0) {
        alert('Please add candidates first');
        return;
    }
    
    const numVoters = parseInt(document.getElementById('genNumVoters').value);
    const distribution = document.getElementById('genDistribution').value;
    
    // Show loading
    const btn = window.event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;
    
    try {
        const result = await ElectoralAPI.generateBallots(candidates, numVoters, distribution);
        
        if (result) {
            // Populate ranking inputs with generated ballots
            const ballots = result.ballots;
            
            // Get the current number of ballot types from the UI
            const numBallotTypesInput = document.getElementById('numBallotTypes');
            const maxBallots = numBallotTypesInput ? parseInt(numBallotTypesInput.value) || 5 : 5;
            
            // Fill ballot types up to the user-specified limit
            for (let i = 0; i < Math.min(maxBallots, ballots.length); i++) {
                const ballot = ballots[i];
                
                // Fill ranking dropdowns
                ballot.preferences.forEach((candId, rank) => {
                    const select = document.getElementById(`ballot-${i}-rank-${rank + 1}`);
                    if (select) {
                        select.value = candId;
                    }
                });
                
                // Calculate percentage of total voters
                const percentage = (ballot.count / result.total_voters * 100).toFixed(1);
                
                // Fill percentage instead of count
                const percentageInput = document.getElementById(`ballot-${i}-percentage`);
                if (percentageInput) {
                    percentageInput.value = percentage;
                }
            }
            
            alert(`✅ Generated ${formatNumber(result.total_voters)} ballots (${result.unique_ballots} unique patterns) with ${distribution} distribution\n\nFilled ${Math.min(maxBallots, ballots.length)} out of ${maxBallots} ballot type slots with percentages.`);
        }
    } catch (error) {
        alert('Error generating ballots: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function runStrategicSimulation() {
    if (!backendAvailable) {
        alert('Python backend not available. Please start the backend server with: python backend.py');
        return;
    }
    
    const system = document.getElementById('electoralSystem').value;
    
    if (!['fptp', 'trs'].includes(system)) {
        alert('Strategic voting simulation currently only available for FPTP and TRS');
        return;
    }
    
    // Get current vote counts
    const sincereVotes = {};
    candidates.forEach(candidate => {
        const input = document.getElementById(`candidate-${candidate.id}`);
        if (input) {
            sincereVotes[candidate.id] = parseFormattedNumber(input.value);
        }
    });
    
    const btn = window.event.target;
    btn.textContent = 'Running...';
    btn.disabled = true;
    
    try {
        const result = await ElectoralAPI.simulateStrategicVoting(system, candidates, sincereVotes);
        
        if (result) {
            const resultsDiv = document.getElementById('strategicResults');
            let html = '<h6 style="margin-top: 15px;">Strategic Voting Results:</h6>';
            html += `<p style="color: #666;">${result.analysis}</p>`;
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
            html += '<tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Candidate</th><th>Sincere</th><th>Strategic</th><th>Change</th></tr>';
            
            candidates.forEach(c => {
                const sincere = result.sincere_votes[c.id] || 0;
                const strategic = result.strategic_votes[c.id] || 0;
                const change = result.vote_changes[c.id] || 0;
                const changeColor = change > 0 ? '#2ecc71' : change < 0 ? '#e74c3c' : '#666';
                
                html += `<tr>
                    <td style="padding: 8px;">${c.name}</td>
                    <td style="text-align: center;">${formatNumber(sincere)}</td>
                    <td style="text-align: center;">${formatNumber(strategic)}</td>
                    <td style="text-align: center; color: ${changeColor};">${change > 0 ? '+' : ''}${formatNumber(change)}</td>
                </tr>`;
            });
            
            html += '</table>';
            resultsDiv.innerHTML = html;
        }
    } catch (error) {
        alert('Error running strategic simulation: ' + error.message);
    } finally {
        btn.textContent = 'Run Strategic Simulation';
        btn.disabled = false;
    }
}

async function runBatchSimulation() {
    if (!backendAvailable) {
        alert('Python backend not available. Please start the backend server with: python backend.py');
        return;
    }
    
    if (candidates.length === 0) {
        alert('Please add candidates first');
        return;
    }
    
    // Get selected systems
    const checkboxes = document.querySelectorAll('#batchSimPanel input[type="checkbox"]:checked');
    const systems = Array.from(checkboxes).map(cb => cb.value);
    
    if (systems.length === 0) {
        alert('Please select at least one system');
        return;
    }
    
    const btn = window.event.target;
    btn.textContent = 'Running large-scale simulation...';
    btn.disabled = true;
    
    try {
        const result = await ElectoralAPI.runBatchSimulation(
            candidates,
            100000,
            'normal',
            systems
        );
        
        if (result) {
            const resultsDiv = document.getElementById('batchResults');
            let html = '<h6 style="margin-top: 15px;">Batch Simulation Results (100,000 voters):</h6>';
            html += `<p style="color: #666;">Generated ${result.metadata.unique_ballots} unique ballot patterns</p>`;
            
            for (const [system, data] of Object.entries(result.results)) {
                html += `<h6 style="margin-top: 15px; text-transform: uppercase;">${system}</h6>`;
                html += '<div style="font-size: 0.9em;">';
                
                data.results.forEach(r => {
                    const badge = r.elected ? ' <span style="background: #2ecc71; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">ELECTED</span>' : '';
                    html += `<div style="padding: 5px 0;">${r.name}: ${formatNumber(Math.round(r.votes))} votes${badge}</div>`;
                });
                
                html += '</div>';
            }
            
            resultsDiv.innerHTML = html;
        }
    } catch (error) {
        alert('Error running batch simulation: ' + error.message);
    } finally {
        btn.textContent = 'Run Batch Simulation (100,000 voters)';
        btn.disabled = false;
    }
}

async function saveCurrentScenario() {
    if (!backendAvailable) {
        alert('Python backend not available. Please start the backend server with: python backend.py');
        return;
    }
    
    const scenarioName = prompt('Enter a name for this scenario:');
    if (!scenarioName) return;
    
    const system = document.getElementById('electoralSystem').value;
    const votes = getVotes();
    
    const scenarioData = {
        parties: parties,
        candidates: candidates,
        votes: votes,
        system: system,
        raceType: document.querySelector('input[name="raceType"]:checked')?.value
    };
    
    try {
        const result = await ElectoralAPI.saveScenario(scenarioName, system, scenarioData);
        
        if (result) {
            const shareUrl = `${window.location.origin}${result.share_url}`;
            prompt('Scenario saved! Share this URL:', shareUrl);
        }
    } catch (error) {
        alert('Error saving scenario: ' + error.message);
    }
}

// Check URL for shared scenario on load (improved with URLSearchParams)
window.addEventListener('DOMContentLoaded', async () => {
    // Check both pathname and search params for scenario ID
    let scenarioId = null;
    
    // Method 1: Check URL path (/scenario/abc123)
    const pathMatch = window.location.pathname.match(/\/scenario\/([a-f0-9]+)/);
    if (pathMatch) {
        scenarioId = pathMatch[1];
    }
    
    // Method 2: Check query parameters (?scenario=abc123)
    const params = new URLSearchParams(window.location.search);
    if (params.has('scenario')) {
        scenarioId = params.get('scenario');
    }
    
    if (scenarioId && backendAvailable) {
        try {
            const scenario = await ElectoralAPI.loadScenario(scenarioId);
            if (scenario) {
                // Load scenario data
                parties = scenario.data.parties;
                candidates = scenario.data.candidates;
                
                document.getElementById('electoralSystem').value = scenario.data.system;
                
                updatePartiesList();
                updateCandidatesList();
                updateCandidatePartySelect();
                onSystemChange();
                
                // Populate votes
                setTimeout(() => {
                    Object.entries(scenario.data.votes.parties).forEach(([id, count]) => {
                        const input = document.getElementById(`party-${id}`);
                        if (input) {
                            input.value = count;
                            // Update state
                            if (voteState.parties) voteState.parties[id] = count;
                        }
                    });
                    
                    Object.entries(scenario.data.votes.candidates).forEach(([id, count]) => {
                        const input = document.getElementById(`candidate-${id}`);
                        if (input) {
                            input.value = count;
                            // Update state
                            if (voteState.candidates) voteState.candidates[id] = count;
                        }
                    });
                }, 500);
                
                alert(`✅ Loaded scenario: ${scenario.name}`);
            }
        } catch (error) {
            console.error('Error loading scenario:', error);
            alert('Failed to load scenario. It may have been deleted or the ID is invalid.');
        }
    }
});

