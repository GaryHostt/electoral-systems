// Data structures
let parties = [];
let candidates = [];
let votes = {};
let rankings = {}; // Store ranking preferences for IRV/STV

// Configuration
function getSeatsCount() {
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    return raceType === 'single' ? 1 : 10;
}

// Utility function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to parse formatted number back to integer
function parseFormattedNumber(str) {
    return parseInt(str.replace(/,/g, '')) || 0;
}

// Function to format input fields with commas
function formatNumberInput(event) {
    const input = event.target;
    const value = input.value.replace(/,/g, '');
    if (value && !isNaN(value)) {
        input.value = formatNumber(parseInt(value));
    }
}

// Function to draw a pie chart

// System descriptions
const systemDescriptions = {
    fptp: "First-Past-the-Post: The candidate with the most votes wins, regardless of whether they have a majority. Simple and fast, but can lead to vote splitting.",
    irv: "Instant-Runoff Voting: Voters rank candidates. The candidate with fewest votes is eliminated and their votes redistributed until someone has a majority.",
    "party-list": "Party-List Proportional Representation: Voters choose a party. Seats are allocated proportionally to each party's vote share. You can optionally allow voters to also select specific candidates within a party (Open List).",
    stv: "Single Transferable Vote: Multi-winner proportional system where voters rank candidates and votes are transferred based on quotas.",
    mmp: "Mixed-Member Proportional: Combines district seats (FPTP) with proportional party list seats to ensure overall proportionality.",
    parallel: "Parallel Voting: Combines district seats and party list seats, but they're calculated independently (not compensatory)."
};

// Arrow's Theorem analysis for each system
const arrowAnalysis = {
    fptp: {
        title: "First-Past-the-Post",
        nonDictatorship: "✅ Pass - No single voter dictates outcome",
        universality: "⚠️ Weak - Limited to plurality, not full preference ranking",
        independence: "❌ Fail - Spoiler effect: third candidate can change outcome between top two",
        monotonicity: "✅ Pass - More votes for winner cannot hurt them",
        strategicVoting: "❌ High Risk - Voters incentivized to abandon preferred candidates to avoid 'wasted votes'. Strong spoiler effect encourages strategic voting."
    },
    trs: {
        title: "Two-Round System",
        nonDictatorship: "✅ Pass - Majority rule in final round",
        universality: "⚠️ Weak - Two separate votes, not ranked",
        independence: "❌ Fail - First round results affect who makes it to runoff",
        monotonicity: "✅ Pass - Generally monotonic",
        strategicVoting: "⚠️ Moderate Risk - Voters may strategically vote in first round to influence runoff matchups. Less problematic than FPTP."
    },
    irv: {
        title: "Instant-Runoff Voting",
        nonDictatorship: "✅ Pass - No dictator",
        universality: "✅ Pass - Full ranking of preferences",
        independence: "❌ Fail - Adding/removing candidates can change winner (non-monotonicity paradox)",
        monotonicity: "❌ Fail - Ranking a candidate higher can hurt them!",
        strategicVoting: "⚠️ Moderate Risk - Complex strategic scenarios exist. Voters might benefit from ranking compromise candidate higher than true preference. Less vulnerable than FPTP."
    },
    borda: {
        title: "Borda Count",
        nonDictatorship: "✅ Pass - All voters contribute points equally",
        universality: "✅ Pass - Full ranking required",
        independence: "❌ Fail - Adding irrelevant candidate changes point distribution",
        monotonicity: "✅ Pass - More points always helps",
        strategicVoting: "❌ High Risk - Vulnerable to 'burying': voters can rank strong opponents last to maximize point differential. Strategic exaggeration of preferences is highly effective."
    },
    condorcet: {
        title: "Condorcet Method",
        nonDictatorship: "✅ Pass - Majority pairwise preference",
        universality: "✅ Pass - Full ranking required",
        independence: "✅ Strong - Pairwise comparisons isolate alternatives",
        monotonicity: "✅ Pass - More votes in pairwise matchups help",
        strategicVoting: "⚠️ Low-Moderate Risk - Paradox cases create vulnerabilities. Voters may strategically rank to create/break cycles. When Condorcet winner exists, harder to manipulate."
    },
    "party-list-closed": {
        title: "Closed List PR",
        nonDictatorship: "✅ Pass - Proportional representation",
        universality: "⚠️ Weak - Single party choice, no candidate preference",
        independence: "✅ Pass - Party performance independent",
        monotonicity: "✅ Pass - More votes = more seats",
        strategicVoting: "✅ Low Risk - Proportional systems reduce wasted votes and strategic incentives. Voters can honestly support preferred party."
    },
    "party-list-open": {
        title: "Open List PR",
        nonDictatorship: "✅ Pass - Proportional with voter input on candidates",
        universality: "⚠️ Moderate - Party choice + optional candidate preference",
        independence: "✅ Pass - Generally independent",
        monotonicity: "✅ Pass - More votes help party and candidate",
        strategicVoting: "✅ Low Risk - Similar to closed list. Candidate preference adds complexity but maintains proportionality benefits."
    },
    stv: {
        title: "Single Transferable Vote",
        nonDictatorship: "✅ Pass - No dictator",
        universality: "✅ Pass - Full ranking",
        independence: "❌ Fail - Vote transfers create dependencies",
        monotonicity: "❌ Fail - Paradoxes exist in multi-winner context",
        strategicVoting: "⚠️ Low-Moderate Risk - Complex system makes strategic voting difficult to execute. Proportional nature reduces incentives. Some scenarios allow strategic candidate ranking."
    },
    mmp: {
        title: "Mixed-Member Proportional",
        nonDictatorship: "✅ Pass - Compensatory proportional tier",
        universality: "⚠️ Moderate - Two separate votes (district + party)",
        independence: "⚠️ Moderate - Two tiers interact",
        monotonicity: "✅ Pass - Generally monotonic",
        strategicVoting: "⚠️ Moderate Risk - Sophisticated voters may split tickets strategically. Small parties may benefit from strategic district voting. Overhang seats create edge cases."
    },
    parallel: {
        title: "Parallel Voting",
        nonDictatorship: "✅ Pass - No dictator",
        universality: "⚠️ Moderate - Two separate votes",
        independence: "⚠️ Moderate - Tiers are independent but both matter",
        monotonicity: "✅ Pass - Generally monotonic",
        strategicVoting: "⚠️ Moderate Risk - District tier vulnerable to FPTP problems. List tier maintains proportionality. Voters face split strategic calculus."
    },
    block: {
        title: "Block Voting",
        nonDictatorship: "✅ Pass - No dictator",
        universality: "⚠️ Weak - Multiple plurality votes",
        independence: "❌ Fail - Strong party-slate effects",
        monotonicity: "✅ Pass - More votes help",
        strategicVoting: "❌ High Risk - Majoritarian system. Coordinated majority can sweep all seats. Minority voters wasted. Strong incentive for bloc voting and party slates."
    },
    limited: {
        title: "Limited Voting",
        nonDictatorship: "✅ Pass - No dictator",
        universality: "⚠️ Weak - Limited plurality votes",
        independence: "⚠️ Moderate - Vote limitation reduces party dominance",
        monotonicity: "✅ Pass - More votes help",
        strategicVoting: "⚠️ Moderate Risk - Vote limitation forces strategic prioritization. Voters must decide which candidates to support. Less extreme than Block Voting."
    },
    approval: {
        title: "Approval Voting",
        nonDictatorship: "✅ Pass - Equal weight approvals",
        universality: "⚠️ Weak - No ranking, just approval threshold",
        independence: "⚠️ Moderate - Approval threshold is strategic",
        monotonicity: "✅ Pass - More approvals always help",
        strategicVoting: "⚠️ Moderate Risk - Voters must decide approval threshold strategically. Approving compromise candidates may hurt preferred candidate. Simpler than ranked systems but not strategy-proof."
    }
};

// Initialize - wrap in DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('electoralSystem').addEventListener('change', onSystemChange);
    
    // Setup color picker
    setupColorPicker();
    
    // Initial state
    onSystemChange();
});

function setupColorPicker() {
    const presets = document.querySelectorAll('.color-preset:not(.custom-color)');
    const colorPicker = document.getElementById('partyColorPicker');
    const hiddenColorInput = document.getElementById('partyColor');
    
    // Select default color (blue)
    presets[1].classList.add('selected');
    hiddenColorInput.value = '#3498db';
    
    // Handle preset clicks
    presets.forEach(preset => {
        preset.addEventListener('click', function() {
            presets.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            const color = this.getAttribute('data-color');
            hiddenColorInput.value = color;
            colorPicker.value = color;
        });
    });
    
    // Handle custom color picker
    colorPicker.addEventListener('change', function() {
        presets.forEach(p => p.classList.remove('selected'));
        document.querySelector('.custom-color').classList.add('selected');
        hiddenColorInput.value = this.value;
    });
}

function onSystemChange() {
    const system = document.getElementById('electoralSystem').value;
    
    if (!system) {
        // No system selected - hide all sections
        document.getElementById('partiesSection').style.display = 'none';
        document.getElementById('candidatesSection').style.display = 'none';
        document.getElementById('votingSection').style.display = 'none';
        document.getElementById('systemDescription').innerHTML = '<p style="color: #999; font-style: italic;">Select an electoral system to begin</p>';
        return;
    }
    
    // Update system description
    document.getElementById('systemDescription').innerHTML = `<p>${systemDescriptions[system]}</p>`;
    
    // Systems that use a party vote (and thus need electoral threshold)
    const systemsWithPartyVote = ['party-list', 'mmp', 'parallel'];
    
    // Systems that use proportional allocation methods
    const systemsWithAllocationMethod = ['party-list', 'mmp', 'parallel'];
    
    // Show/hide electoral threshold input
    const thresholdContainer = document.getElementById('electoralThresholdContainer');
    if (systemsWithPartyVote.includes(system)) {
        thresholdContainer.style.display = 'block';
    } else {
        thresholdContainer.style.display = 'none';
    }
    
    // Show/hide allocation method selector
    const allocationContainer = document.getElementById('allocationMethodContainer');
    if (systemsWithAllocationMethod.includes(system)) {
        allocationContainer.style.display = 'block';
    } else {
        allocationContainer.style.display = 'none';
    }
    
    // Configure race type options based on system
    configureRaceTypeForSystem(system);
    
    // Configure advanced features visibility based on system
    configureAdvancedFeatures(system);
    
    // Systems that need BOTH parties and candidates
    const needsBothPartiesAndCandidates = [
        'mmp', 
        'parallel'
    ];
    
    // Systems that need ONLY parties (no individual candidates)
    const needsOnlyParties = [
        'party-list'
    ];
    
    // Systems that are candidate-focused (parties are just for organization/color)
    const candidateFocused = [
        'fptp',
        'irv',
        'stv'
    ];
    
    // Show/hide sections based on system requirements
    const partiesSection = document.getElementById('partiesSection');
    const candidatesSection = document.getElementById('candidatesSection');
    const votingSection = document.getElementById('votingSection');
    
    if (needsOnlyParties.includes(system)) {
        // Only parties, no candidates
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'none';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, null, 3);
    } else if (needsBothPartiesAndCandidates.includes(system)) {
        // Both parties and candidates
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'block';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, 3, 4);
    } else if (candidateFocused.includes(system)) {
        // Candidates only (parties just for grouping/colors)
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'block';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, 3, 4);
    }
    
    updateVotingInputs();
}

function updateSectionNumbers(partiesNum, candidatesNum, votingNum) {
    // Update section numbers dynamically
    const partiesNumberSpan = document.querySelector('#partiesSection .section-number');
    const candidatesNumberSpan = document.querySelector('#candidatesSection .section-number');
    const votingNumberSpan = document.querySelector('#votingSection .section-number');
    
    if (partiesNumberSpan && partiesNum) partiesNumberSpan.textContent = partiesNum;
    if (candidatesNumberSpan && candidatesNum) candidatesNumberSpan.textContent = candidatesNum;
    if (votingNumberSpan && votingNum) votingNumberSpan.textContent = votingNum;
}

function updateSystemDescription() {
    onSystemChange();
}

function configureRaceTypeForSystem(system) {
    const singleRadio = document.getElementById('singleRaceRadio');
    const legislativeRadio = document.getElementById('legislativeRaceRadio');
    const singleOption = document.getElementById('singleRaceOption');
    const legislativeOption = document.getElementById('legislativeRaceOption');
    
    // Define system categories
    // Individual Race (Single-Seat): FPTP, TRS, IRV, Borda, Condorcet
    const singleSeatOnly = ['fptp', 'trs', 'irv', 'borda', 'condorcet'];
    
    // Individual Race (Multi-Seat): Block, Limited, Approval (though approval can be both)
    const multiSeatIndividual = ['block', 'limited'];
    
    // Entire Legislative Branch: STV, Closed List PR, Open List PR
    const legislativeOnly = ['stv', 'party-list-closed', 'party-list-open'];
    
    // Both: MMP, Parallel, Approval
    const bothAllowed = ['mmp', 'parallel', 'approval'];
    
    // Reset styles
    singleOption.style.opacity = '1';
    singleOption.style.cursor = 'pointer';
    legislativeOption.style.opacity = '1';
    legislativeOption.style.cursor = 'pointer';
    singleRadio.disabled = false;
    legislativeRadio.disabled = false;
    
    if (singleSeatOnly.includes(system) || multiSeatIndividual.includes(system)) {
        // Disable legislative, enable single only
        legislativeRadio.disabled = true;
        legislativeOption.style.opacity = '0.4';
        legislativeOption.style.cursor = 'not-allowed';
        
        // Force selection to single
        if (legislativeRadio.checked) {
            singleRadio.checked = true;
            updateRaceType();
        }
    } else if (legislativeOnly.includes(system)) {
        // Disable single, enable legislative only
        singleRadio.disabled = true;
        singleOption.style.opacity = '0.4';
        singleOption.style.cursor = 'not-allowed';
        
        // Force selection to legislative
        if (singleRadio.checked) {
            legislativeRadio.checked = true;
            updateRaceType();
        }
    }
    // For bothAllowed systems, leave both enabled (no changes needed)
}

function configureAdvancedFeatures(system) {
    // Show/hide strategic voting button (only for FPTP)
    const strategicBtn = document.querySelector('button[onclick="showStrategicSimulator()"]');
    if (strategicBtn) {
        if (system === 'fptp') {
            strategicBtn.style.display = 'inline-block';
        } else {
            strategicBtn.style.display = 'none';
            // Also hide the panel if it's open
            const panel = document.getElementById('strategicVotingPanel');
            if (panel) panel.style.display = 'none';
        }
    }
    
    // Show/hide ballot generator button (only for ranking systems)
    const ballotGenBtn = document.querySelector('button[onclick="showBallotGenerator()"]');
    const rankingSystems = ['irv', 'stv'];
    if (ballotGenBtn) {
        if (rankingSystems.includes(system)) {
            ballotGenBtn.style.display = 'inline-block';
        } else {
            ballotGenBtn.style.display = 'none';
            // Also hide the panel if it's open
            const panel = document.getElementById('ballotGeneratorPanel');
            if (panel) panel.style.display = 'none';
        }
    }
}

function updateRaceType() {
    const raceType = document.querySelector('input[name="raceType"]:checked').value;
    const description = document.getElementById('raceTypeDescription');
    
    if (raceType === 'single') {
        description.textContent = 'Single race: Simulate one electoral district or seat (e.g., one House district).';
    } else {
        description.textContent = 'Entire legislature: Simulate a full parliament or congress with 10 seats distributed proportionally.';
    }
    
    // Update voting inputs to reflect the change
    updateVotingInputs();
}

function addParty() {
    const nameInput = document.getElementById('partyName');
    const colorInput = document.getElementById('partyColor');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a party name');
        return;
    }
    
    const party = {
        id: Date.now(),
        name: name,
        color: colorInput.value
    };
    
    parties.push(party);
    nameInput.value = '';
    
    // Reset color selection to default (blue)
    const presets = document.querySelectorAll('.color-preset:not(.custom-color)');
    presets.forEach(p => p.classList.remove('selected'));
    presets[1].classList.add('selected');
    colorInput.value = '#3498db';
    document.getElementById('partyColorPicker').value = '#3498db';
    
    updatePartiesList();
    updateCandidatePartySelect();
    updateVotingInputs();
}

function removeParty(id) {
    parties = parties.filter(p => p.id !== id);
    candidates = candidates.filter(c => c.partyId !== id);
    updatePartiesList();
    updateCandidatesList();
    updateCandidatePartySelect();
    updateVotingInputs();
}

function updatePartiesList() {
    const list = document.getElementById('partiesList');
    if (parties.length === 0) {
        list.innerHTML = '<div class="empty-state">No parties added yet</div>';
        return;
    }
    
    list.innerHTML = parties.map(party => `
        <div class="item">
            <div class="item-info">
                <div class="party-color" style="background-color: ${party.color}"></div>
                <strong>${party.name}</strong>
            </div>
            <button class="btn-remove" onclick="removeParty(${party.id})">Remove</button>
        </div>
    `).join('');
}

function updateCandidatePartySelect() {
    const select = document.getElementById('candidateParty');
    select.innerHTML = '<option value="">Select Party</option>' + 
        parties.map(party => `<option value="${party.id}">${party.name}</option>`).join('');
}

function addCandidate() {
    const nameInput = document.getElementById('candidateName');
    const partySelect = document.getElementById('candidateParty');
    const name = nameInput.value.trim();
    const partyId = parseInt(partySelect.value);
    
    if (!name) {
        alert('Please enter a candidate name');
        return;
    }
    
    if (!partyId) {
        alert('Please select a party');
        return;
    }
    
    const candidate = {
        id: Date.now(),
        name: name,
        partyId: partyId
    };
    
    candidates.push(candidate);
    nameInput.value = '';
    partySelect.value = '';
    
    updateCandidatesList();
    updateVotingInputs();
}

function removeCandidate(id) {
    candidates = candidates.filter(c => c.id !== id);
    updateCandidatesList();
    updateVotingInputs();
}

function updateCandidatesList() {
    const list = document.getElementById('candidatesList');
    if (candidates.length === 0) {
        list.innerHTML = '<div class="empty-state">No candidates added yet</div>';
        return;
    }
    
    list.innerHTML = candidates.map(candidate => {
        const party = parties.find(p => p.id === candidate.partyId);
        return `
            <div class="item">
                <div class="item-info">
                    <div class="party-color" style="background-color: ${party.color}"></div>
                    <strong>${candidate.name}</strong>
                    <span style="color: #666;">(${party.name})</span>
                </div>
                <button class="btn-remove" onclick="removeCandidate(${candidate.id})">Remove</button>
            </div>
        `;
    }).join('');
}

function autoGenerateCandidates() {
    if (parties.length === 0) {
        alert('Please add parties first before auto-generating candidates');
        return;
    }
    
    let added = 0;
    parties.forEach((party, index) => {
        // Check if this party already has a candidate
        const hasCandidate = candidates.some(c => c.partyId === party.id);
        if (!hasCandidate) {
            const candidate = {
                id: Date.now() + index,
                name: `${party.name} Candidate`,
                partyId: party.id
            };
            candidates.push(candidate);
            added++;
        }
    });
    
    if (added > 0) {
        updateCandidatesList();
        updateVotingInputs();
        alert(`Added ${added} candidate(s)`);
    } else {
        alert('All parties already have at least one candidate');
    }
}

function updateVotingInputs() {
    const system = document.getElementById('electoralSystem').value;
    const container = document.getElementById('votingInputs');
    
    if (parties.length === 0 && candidates.length === 0) {
        container.innerHTML = '<div class="empty-state">Add parties and candidates first</div>';
        return;
    }
    
    let html = '';
    
    // Check if this is a ranking system
    const isRankingSystem = system === 'irv' || system === 'stv';
    
    // Systems that use a party vote:
    // - Party-List PR
    // - Mixed-Member Proportional (MMP/AMS)
    // - Parallel Voting (MMM)
    const systemsWithPartyVote = ['party-list', 'mmp', 'parallel'];
    
    // Systems that do NOT use a party vote:
    // - FPTP, IRV
    // - STV (candidate-focused, no distinct party vote)
    
    if (systemsWithPartyVote.includes(system)) {
        html += '<div class="voting-input-section"><h4>Party Votes</h4>';
        
        // Add explanation for mixed systems
        if (system === 'mmp' || system === 'parallel') {
            html += '<p style="margin-bottom: 10px; color: #666; font-style: italic;">This is the party list vote (second vote) used for proportional seat allocation.</p>';
        }
        
        parties.forEach(party => {
            html += `
                <div class="vote-input-row">
                    <label>
                        <span class="party-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${party.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${party.name}
                    </label>
                    <input type="text" min="0" value="0" id="party-${party.id}" class="number-input" />
                </div>
            `;
        });
        html += '</div>';
    }
    
    // For candidate-based systems
    // Show candidate votes for all systems except pure party-list AND ranking systems
    if (system !== 'party-list' && !isRankingSystem) {
        html += '<div class="voting-input-section"><h4>Candidate Votes</h4>';
        
        // System-specific instructions
        if (system === 'mmp' || system === 'parallel') {
            html += '<p style="margin-bottom: 10px; color: #666; font-style: italic;">This is the constituency vote (first vote) for individual candidates.</p>';
        } else if (system === 'approval') {
            html += '<p style="margin-bottom: 10px; color: #666;">Enter number of voters who approve each candidate</p>';
        } else if (system === 'party-list') {
            html += '<p style="margin-bottom: 10px; color: #666; font-style: italic;">Optional: Personal votes for specific candidates within their party (for Open List variant).</p>';
        }
        
        candidates.forEach(candidate => {
            const party = parties.find(p => p.id === candidate.partyId);
            html += `
                <div class="vote-input-row">
                    <label>
                        <span class="party-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${party.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${candidate.name}
                    </label>
                    <input type="text" min="0" value="0" id="candidate-${candidate.id}" class="number-input" />
                </div>
            `;
        });
        html += '</div>';
    } else if (isRankingSystem) {
        // For ranking systems, show a note instead of candidate vote inputs
        html += '<div class="voting-input-section">';
        html += '<div style="padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px; margin-bottom: 15px;">';
        html += '<p style="margin: 0; color: #1976d2;"><strong>ℹ️ Note:</strong> This system uses ranking ballots instead of candidate vote totals.</p>';
        html += '<p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">Configure voter preferences in the "Ranking Ballots" section below.</p>';
        html += '</div>';
        
        // Add total voters input for ranking systems
        html += '<div style="margin-top: 15px;">';
        html += '<label for="totalVoters" style="display: block; margin-bottom: 8px; font-weight: 600; color: #667eea;">Total Number of Voters:</label>';
        html += '<input type="text" id="totalVoters" class="number-input" value="10,000" style="width: 200px; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;" onblur="formatNumberInput(event)">';
        html += '<p style="margin-top: 8px; color: #666; font-size: 0.9em; font-style: italic;">Total voter turnout - percentages in ranking ballots will be calculated from this number.</p>';
        html += '</div>';
        html += '</div>';
    }
    
    // Add ranking inputs for IRV and STV
    if (isRankingSystem && candidates.length > 0) {
        const rankingSection = document.getElementById('rankingBallotsSection');
        if (rankingSection) {
            rankingSection.style.display = 'block';
            updateRankingBallots();
        }
    } else {
        const rankingSection = document.getElementById('rankingBallotsSection');
        if (rankingSection) {
            rankingSection.style.display = 'none';
        }
    }
    
    container.innerHTML = html;
    
    // Add event listeners for number formatting
    document.querySelectorAll('.number-input').forEach(input => {
        input.addEventListener('blur', formatNumberInput);
        input.addEventListener('focus', function() {
            this.value = this.value.replace(/,/g, '');
        });
    });
}

function updateRankingBallots() {
    const container = document.getElementById('rankingBallotsContainer');
    if (!container) return;
    
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes').value) || 5;
    const maxBallots = Math.min(Math.max(1, numBallotTypes), 20); // Between 1 and 20
    
    // PRESERVE EXISTING VALUES before regenerating HTML
    const existingValues = {};
    for (let i = 0; i < 20; i++) { // Check up to max possible
        const nameInput = document.getElementById(`ballot-${i}-name`);
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        
        if (nameInput || percentageInput) {
            existingValues[i] = {
                name: nameInput ? nameInput.value : '',
                percentage: percentageInput ? percentageInput.value : '0',
                rankings: {}
            };
            
            // Preserve ranking selections
            const maxRanks = Math.min(candidates.length, 5);
            for (let rank = 1; rank <= maxRanks; rank++) {
                const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                if (select) {
                    existingValues[i].rankings[rank] = select.value;
                }
            }
        }
    }
    
    let html = '<div class="ranking-input-container">';
    html += '<div class="ranking-grid">';
    
    for (let i = 0; i < maxBallots; i++) {
        html += `
            <div class="ranking-item">
                <h5>
                    <span style="background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9em;">${i + 1}</span>
                    Ballot Type ${i + 1}
                </h5>
                <div style="margin-bottom: 10px;">
                    <input type="text" id="ballot-${i}-name" placeholder="e.g., Progressive voters, Rural conservatives..." 
                           value="${existingValues[i]?.name || ''}"
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9em;"
                           title="Optional: Name this ballot pattern for your reference">
                </div>
                <div class="ranking-inputs">
        `;
        
        // Add ranking dropdowns for each preference
        const maxRanks = Math.min(candidates.length, 5);
        for (let rank = 1; rank <= maxRanks; rank++) {
            const savedValue = existingValues[i]?.rankings[rank] || '';
            html += `
                <div class="ranking-row">
                    <label>${rank}${getOrdinalSuffix(rank)} choice:</label>
                    <select id="ballot-${i}-rank-${rank}" onchange="updateRankings()">
                        <option value="">--</option>
            `;
            
            candidates.forEach(candidate => {
                const party = parties.find(p => p.id === candidate.partyId);
                const selected = savedValue == candidate.id ? ' selected' : '';
                html += `<option value="${candidate.id}"${selected}>${candidate.name} (${party.name})</option>`;
            });
            
            html += `
                    </select>
                </div>
            `;
        }
        
        // Add percentage input for this ballot type
        const savedPercentage = existingValues[i]?.percentage || '0';
        html += `
            <div class="ranking-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                <label style="font-weight: 600;">% of Voters:</label>
                <input type="number" id="ballot-${i}-percentage" min="0" max="100" step="0.1" value="${savedPercentage}" style="padding: 6px; width: 80px;" />
                <span style="font-size: 0.9em; color: #666; margin-left: 5px;">%</span>
            </div>
        `;
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    html += '<p style="margin-top: 15px; color: #666; font-size: 0.9em; font-style: italic;">💡 Tip: Name your ballot types to keep track of different voter groups. Leave a choice blank if voters don\'t rank that many candidates. <strong>Percentages must add up to 100%.</strong></p>';
    html += '<div id="percentageValidation" style="margin-top: 10px; padding: 10px; border-radius: 6px; display: none;"></div>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // Add event listeners for percentage validation
    for (let i = 0; i < maxBallots; i++) {
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        if (percentageInput) {
            percentageInput.addEventListener('input', validateBallotPercentages);
            percentageInput.addEventListener('blur', validateBallotPercentages);
        }
    }
    
    // Trigger validation after restoring values
    validateBallotPercentages();
}

function validateBallotPercentages() {
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 2;
    const validationDiv = document.getElementById('percentageValidation');
    
    if (!validationDiv) return;
    
    let total = 0;
    let hasValues = false;
    
    for (let i = 0; i < numBallotTypes; i++) {
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        if (percentageInput) {
            const value = parseFloat(percentageInput.value) || 0;
            if (value > 0) {
                hasValues = true;
                total += value;
            }
        }
    }
    
    if (!hasValues) {
        validationDiv.style.display = 'none';
        return;
    }
    
    validationDiv.style.display = 'block';
    
    if (Math.abs(total - 100) < 0.01) {
        // Valid: total is 100% (with small tolerance for floating point)
        validationDiv.style.background = '#d4edda';
        validationDiv.style.border = '1px solid #c3e6cb';
        validationDiv.style.color = '#155724';
        validationDiv.innerHTML = `✅ <strong>Valid:</strong> Percentages add up to 100% (Total: ${total.toFixed(1)}%)`;
    } else if (total < 100) {
        // Warning: under 100%
        validationDiv.style.background = '#fff3cd';
        validationDiv.style.border = '1px solid #ffc107';
        validationDiv.style.color = '#856404';
        validationDiv.innerHTML = `⚠️ <strong>Warning:</strong> Percentages only add up to ${total.toFixed(1)}%. Remaining ${(100 - total).toFixed(1)}% of voters are unaccounted for.`;
    } else {
        // Error: over 100%
        validationDiv.style.background = '#f8d7da';
        validationDiv.style.border = '1px solid #f5c6cb';
        validationDiv.style.color = '#721c24';
        validationDiv.innerHTML = `❌ <strong>Error:</strong> Percentages add up to ${total.toFixed(1)}%, which exceeds 100% by ${(total - 100).toFixed(1)}%.`;
    }
}

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

function updateRankings() {
    // Store rankings for later use in calculations
    // This function is called whenever a ranking dropdown changes
}

function getVotes() {
    const votes = {
        parties: {},
        candidates: {}
    };
    
    parties.forEach(party => {
        const input = document.getElementById(`party-${party.id}`);
        if (input) {
            votes.parties[party.id] = parseFormattedNumber(input.value);
        }
    });
    
    candidates.forEach(candidate => {
        const input = document.getElementById(`candidate-${candidate.id}`);
        if (input) {
            votes.candidates[candidate.id] = parseFormattedNumber(input.value);
        }
    });
    
    return votes;
}

function calculateResults() {
    const system = document.getElementById('electoralSystem').value;
    const votes = getVotes();
    
    let results;
    
    switch(system) {
        case 'fptp':
            results = calculateFPTP(votes);
            break;
        case 'irv':
            results = calculateIRV(votes);
            break;
        case 'party-list':
            results = calculatePartyListPR(votes);
            break;
        case 'stv':
            results = calculateSTV(votes);
            break;
        case 'mmp':
            results = calculateMMP(votes);
            break;
        case 'parallel':
            results = calculateParallel(votes);
            break;
    }
    
    displayResults(results, system);
}

function calculateFPTP(votes) {
    const results = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: 0
        };
    });
    
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    results.forEach(r => {
        r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
    });
    
    results.sort((a, b) => b.votes - a.votes);
    
    // Use tie-breaking logic
    const tieInfo = resolveTie(results, 'candidate');
    
    if (tieInfo) {
        // Mark winner
        results.forEach(r => r.winner = (r.name === tieInfo.winner.name));
        
        // Return with tie information
        return {
            type: 'candidate',
            results: results,
            totalVotes: totalVotes,
            tieDetected: tieInfo.tieDetected,
            tieInfo: tieInfo
        };
    }
    
    // Fallback (no results)
    return {
        type: 'candidate',
        results: results,
        totalVotes: totalVotes
    };
}

function calculateTRS(votes) {
    const results = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: 0
        };
    });
    
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    results.forEach(r => {
        r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
    });
    
    results.sort((a, b) => b.votes - a.votes);
    
    // Check if anyone has >50%
    if (results.length > 0 && results[0].percentage > 50) {
        results[0].winner = true;
        results[0].note = "Won in first round with majority";
    } else if (results.length >= 2) {
        results[0].note = "Would proceed to runoff";
        results[1].note = "Would proceed to runoff";
        // In simulation, highest vote getter wins runoff
        results[0].winner = true;
    }
    
    return {
        type: 'candidate',
        results: results,
        totalVotes: totalVotes
    };
}

function calculateIRV(votes) {
    // Get race type
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    
    // Get total votes from the totalVoters input for ranking systems
    const totalVotersInput = document.getElementById('totalVoters');
    let totalVotes = totalVotersInput ? parseFormattedNumber(totalVotersInput.value) : 0;
    
    if (totalVotes === 0) {
        alert('Please enter the total number of voters');
        return null;
    }
    
    // Collect ballot data from ranking inputs (now using percentages)
    const ballots = [];
    let totalBallots = 0;
    
    // Check if we have ranking data
    let hasRankingData = false;
    
    // Get the number of ballot types from the UI
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 5;
    
    for (let i = 0; i < numBallotTypes; i++) {
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        if (percentageInput) {
            const percentage = parseFloat(percentageInput.value) || 0;
            if (percentage > 0) {
                hasRankingData = true;
                
                // Convert percentage to actual ballot count
                const count = totalVotes > 0 ? Math.round((percentage / 100) * totalVotes) : 0;
                const ballot = { count: count, preferences: [] };
                
                // Get preferences for this ballot
                for (let rank = 1; rank <= 5; rank++) {
                    const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                    if (select && select.value) {
                        ballot.preferences.push(parseInt(select.value));
                    }
                }
                
                if (ballot.preferences.length > 0 && count > 0) {
                    ballots.push(ballot);
                    totalBallots += count;
                }
            }
        }
    }
    
    // If no ranking data, fall back to simple first-preference counts
    if (!hasRankingData || ballots.length === 0) {
        const results = candidates.map(candidate => {
            const voteCount = votes.candidates[candidate.id] || 0;
            const party = parties.find(p => p.id === candidate.partyId);
            return {
                name: candidate.name,
                party: party.name,
                color: party.color,
                votes: voteCount,
                percentage: 0,
                active: true
            };
        });
        
        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
        
        // Simulate elimination rounds
        let rounds = 0;
        while (rounds < 10) {
            const activeResults = results.filter(r => r.active);
            if (activeResults.length <= 1) break;
            
            const activeTotal = activeResults.reduce((sum, r) => sum + r.votes, 0);
            
            // Check for majority
            const topCandidate = activeResults.reduce((max, r) => r.votes > max.votes ? r : max);
            if (topCandidate.votes / activeTotal > 0.5) {
                topCandidate.winner = true;
                topCandidate.note = rounds === 0 ? 'Won with first-round majority' : `Won after ${rounds} elimination round(s)`;
                break;
            }
            
            // Eliminate lowest
            const lowest = activeResults.reduce((min, r) => r.votes < min.votes ? r : min);
            lowest.active = false;
            lowest.note = `Eliminated in round ${rounds + 1}`;
            
            rounds++;
        }
        
        results.forEach(r => {
            r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
        });
        
        results.sort((a, b) => b.votes - a.votes);
        
        return {
            type: 'candidate',
            results: results,
            totalVotes: totalVotes,
            note: "Using first-preference votes only (no ranking data provided)"
        };
    }
    
    // Run IRV with full ranking data
    const candidateIds = candidates.map(c => c.id);
    let eliminated = new Set();
    let roundNumber = 0;
    const maxRounds = candidates.length - 1;
    const roundsData = []; // Track rounds for visualization
    
    while (roundNumber < maxRounds) {
        roundNumber++;
        
        // Count current votes
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
        
        // Check for majority
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id));
        if (activeCandidates.length === 1) {
            // Winner found
            const winner = activeCandidates[0];
            roundsData.push({
                round: roundNumber,
                voteCounts: {...voteCounts},
                winner: winner,
                action: 'winner'
            });
            break;
        }
        
        const activeTotal = Object.keys(voteCounts)
            .filter(id => !eliminated.has(parseInt(id)))
            .reduce((sum, id) => sum + voteCounts[id], 0);
        
        const maxVotes = Math.max(...activeCandidates.map(id => voteCounts[id]));
        if (maxVotes / activeTotal > 0.5) {
            // Majority winner
            const winner = activeCandidates.find(id => voteCounts[id] === maxVotes);
            roundsData.push({
                round: roundNumber,
                voteCounts: {...voteCounts},
                winner: winner,
                action: 'winner'
            });
            break;
        }
        
        // Eliminate candidate with fewest votes
        const minVotes = Math.min(...activeCandidates.map(id => voteCounts[id]));
        const toEliminate = activeCandidates.find(id => voteCounts[id] === minVotes);
        eliminated.add(toEliminate);
        
        // Record round data
        roundsData.push({
            round: roundNumber,
            voteCounts: {...voteCounts},
            eliminated: toEliminate,
            action: 'eliminated'
        });
    }
    
    // Final count
    const finalCounts = {};
    candidateIds.forEach(id => finalCounts[id] = 0);
    
    ballots.forEach(ballot => {
        for (let prefId of ballot.preferences) {
            if (!eliminated.has(prefId)) {
                finalCounts[prefId] += ballot.count;
                break;
            }
        }
    });
    
    // Build results
    const results = candidates.map(candidate => {
        const party = parties.find(p => p.id === candidate.partyId);
        const voteCount = finalCounts[candidate.id] || 0;
        const isEliminated = eliminated.has(candidate.id);
        const isWinner = !isEliminated && voteCount === Math.max(...Object.values(finalCounts));
        
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: totalBallots > 0 ? (voteCount / totalBallots * 100) : 0,
            winner: isWinner,
            note: isEliminated ? 'Eliminated' : (isWinner ? `Won after ${roundNumber} round(s)` : '')
        };
    });
    
    results.sort((a, b) => b.votes - a.votes);
    
    return {
        type: 'candidate',
        results: results,
        totalVotes: totalBallots,
        rounds: roundsData,
        note: `Instant-Runoff Voting with ranked ballots (${roundNumber} elimination rounds)`
    };
}

function calculatePartyListPR(votes) {
    const totalVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    const seats = getSeatsCount();
    
    // Get electoral threshold
    const thresholdInput = document.getElementById('electoralThreshold');
    const threshold = thresholdInput ? parseFloat(thresholdInput.value) : 0;
    
    // Get allocation method
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // Filter parties that meet the threshold
    const partyVotes = {};
    const results = parties.map(party => {
        const voteCount = votes.parties[party.id] || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0;
        const meetsThreshold = percentage >= threshold;
        
        if (meetsThreshold && voteCount > 0) {
            partyVotes[party.id] = voteCount;
        }
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: voteCount,
            percentage: percentage,
            seats: 0,
            meetsThreshold: meetsThreshold,
            belowThreshold: !meetsThreshold && voteCount > 0
        };
    });
    
    // Allocate seats using chosen method
    let allocatedSeats;
    if (allocationMethod === 'sainte-lague') {
        allocatedSeats = allocateSeats_SainteLague(partyVotes, seats);
    } else {
        allocatedSeats = allocateSeats_DHondt(partyVotes, seats);
    }
    
    // Update results with allocated seats
    results.forEach(r => {
        r.seats = allocatedSeats[r.id] || 0;
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = seats > 0 ? (r.seats / seats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    
    return {
        type: 'party',
        results: results,
        totalVotes: totalVotes,
        totalSeats: seats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality
    };
}

function calculateOpenList(votes) {
    // Similar to closed list but also shows candidate preferences
    const partyResults = calculateClosedList(votes);
    
    // Add candidate information
    partyResults.candidateVotes = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount
        };
    }).sort((a, b) => b.votes - a.votes);
    
    return partyResults;
}

function calculateSTV(votes) {
    // Get race type to determine number of seats
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    const seats = raceType === 'single' ? 1 : 3; // 1 seat for single race, 3 for legislative
    
    // Get total votes from the totalVoters input for ranking systems
    const totalVotersInput = document.getElementById('totalVoters');
    let totalVotes = totalVotersInput ? parseFormattedNumber(totalVotersInput.value) : 0;
    
    if (totalVotes === 0) {
        alert('Please enter the total number of voters');
        return null;
    }
    
    // Collect ballot data from ranking inputs (now using percentages)
    const ballots = [];
    let totalBallots = 0;
    
    // Check if we have ranking data
    let hasRankingData = false;
    
    // Get the number of ballot types from the UI
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 5;
    
    for (let i = 0; i < numBallotTypes; i++) {
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        if (percentageInput) {
            const percentage = parseFloat(percentageInput.value) || 0;
            if (percentage > 0) {
                hasRankingData = true;
                
                // Convert percentage to actual ballot count
                const count = totalVotes > 0 ? Math.round((percentage / 100) * totalVotes) : 0;
                const ballot = { count: count, preferences: [] };
                
                // Get preferences for this ballot
                for (let rank = 1; rank <= 5; rank++) {
                    const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                    if (select && select.value) {
                        ballot.preferences.push(parseInt(select.value));
                    }
                }
                
                if (ballot.preferences.length > 0 && count > 0) {
                    ballots.push(ballot);
                    totalBallots += count;
                }
            }
        }
    }
    
    // If no ranking data, fall back to simple calculation
    if (!hasRankingData || ballots.length === 0) {
        const results = candidates.map(candidate => {
            const voteCount = votes.candidates[candidate.id] || 0;
            const party = parties.find(p => p.id === candidate.partyId);
            return {
                name: candidate.name,
                party: party.name,
                color: party.color,
                votes: voteCount,
                percentage: 0,
                elected: false
            };
        });
        
        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
        const quota = Math.floor(totalVotes / (seats + 1)) + 1;
        
        results.forEach(r => {
            r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
            if (r.votes >= quota) {
                r.elected = true;
            }
        });
        
        results.sort((a, b) => b.votes - a.votes);
        
        // Elect top candidates up to seats available
        let seatsAllocated = 0;
        results.forEach(r => {
            if (seatsAllocated < seats) {
                r.elected = true;
                seatsAllocated++;
            }
        });
        
        return {
            type: 'multi-winner',
            results: results,
            totalVotes: totalVotes,
            seats: seats,
            quota: quota,
            note: "Using first-preference votes only (no ranking data provided)"
        };
    }
    
    // Run STV with full ranking data
    const quota = Math.floor(totalBallots / (seats + 1)) + 1;
    const candidateIds = candidates.map(c => c.id);
    let elected = [];
    let eliminated = new Set();
    const roundsData = []; // Track rounds for visualization
    let roundNumber = 0;
    
    // Run rounds until all seats filled or no more candidates
    while (elected.length < seats && eliminated.size + elected.length < candidateIds.length) {
        roundNumber++;
        
        // Count current votes
        const voteCounts = {};
        candidateIds.forEach(id => voteCounts[id] = 0);
        
        ballots.forEach(ballot => {
            // Find first non-eliminated, non-elected preference
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId) && !elected.includes(prefId)) {
                    voteCounts[prefId] += ballot.count;
                    break;
                }
            }
        });
        
        // Check if anyone meets quota
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id) && !elected.includes(id));
        const maxVotes = Math.max(...activeCandidates.map(id => voteCounts[id] || 0));
        
        if (maxVotes >= quota) {
            // Elect candidate with most votes
            const winner = activeCandidates.find(id => voteCounts[id] === maxVotes);
            elected.push(winner);
            
            // Record round data
            roundsData.push({
                round: roundNumber,
                voteCounts: {...voteCounts},
                quota: quota,
                candidate_id: winner,
                action: 'elected',
                surplus: maxVotes - quota
            });
            // In real STV, surplus votes would transfer; simplified here
        } else if (elected.length + activeCandidates.length <= seats) {
            // Elect all remaining candidates
            roundsData.push({
                round: roundNumber,
                voteCounts: {...voteCounts},
                quota: quota,
                action: 'elected_remaining'
            });
            activeCandidates.forEach(id => {
                if (!elected.includes(id)) {
                    elected.push(id);
                }
            });
            break;
        } else {
            // Eliminate candidate with fewest votes
            const minVotes = Math.min(...activeCandidates.map(id => voteCounts[id] || 0));
            const toEliminate = activeCandidates.find(id => voteCounts[id] === minVotes);
            if (toEliminate) {
                eliminated.add(toEliminate);
                
                // Record round data
                roundsData.push({
                    round: roundNumber,
                    voteCounts: {...voteCounts},
                    quota: quota,
                    eliminated: toEliminate,
                    action: 'eliminated'
                });
            } else {
                break;
            }
        }
        
        // Safety check
        if (roundNumber > 50) break;
    }
    
    // Build results
    const results = candidates.map(candidate => {
        const party = parties.find(p => p.id === candidate.partyId);
        const isElected = elected.includes(candidate.id);
        
        // Get final vote count
        let voteCount = 0;
        ballots.forEach(ballot => {
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId) && !elected.includes(prefId) || prefId === candidate.id) {
                    if (prefId === candidate.id) {
                        voteCount += ballot.count;
                    }
                    break;
                }
            }
        });
        
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: totalBallots > 0 ? (voteCount / totalBallots * 100) : 0,
            elected: isElected
        };
    });
    
    results.sort((a, b) => {
        if (a.elected && !b.elected) return -1;
        if (!a.elected && b.elected) return 1;
        return b.votes - a.votes;
    });
    
    return {
        type: 'multi-winner',
        results: results,
        totalVotes: totalBallots,
        seats: seats,
        quota: quota,
        rounds: roundsData,
        note: `Single Transferable Vote with ranked ballots (Quota: ${quota} votes)`
    };
}

function calculateMMP(votes) {
    // Mixed system: half seats from districts (FPTP), half from party lists (compensatory)
    const totalSeats = getSeatsCount();
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    
    // For single race: 1 district seat only (simulate one race)
    // For legislative: multiple districts + list seats
    const districtSeats = raceType === 'single' ? 1 : Math.floor(totalSeats / 2);
    const listSeats = totalSeats - districtSeats;
    
    // Get electoral threshold
    const thresholdInput = document.getElementById('electoralThreshold');
    const threshold = thresholdInput ? parseFloat(thresholdInput.value) : 0;
    
    // Get allocation method
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // District seats (FPTP)
    const candidateResults = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            candidateId: candidate.id,
            name: candidate.name,
            partyId: party.id,
            party: party.name,
            color: party.color,
            votes: voteCount
        };
    });
    candidateResults.sort((a, b) => b.votes - a.votes);
    
    // Allocate district seats
    const partyDistrictSeats = {};
    parties.forEach(p => partyDistrictSeats[p.id] = 0);
    
    for (let i = 0; i < Math.min(districtSeats, candidateResults.length); i++) {
        candidateResults[i].districtSeat = true;
        partyDistrictSeats[candidateResults[i].partyId]++;
    }
    
    // Calculate proportional entitlement based on party votes
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    
    // Filter parties meeting threshold
    const eligiblePartyVotes = {};
    parties.forEach(party => {
        const voteShare = votes.parties[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (voteShare / totalPartyVotes * 100) : 0;
        if (percentage >= threshold && voteShare > 0) {
            eligiblePartyVotes[party.id] = voteShare;
        }
    });
    
    // Calculate proportional entitlement for entire parliament
    const eligibleTotalVotes = Object.values(eligiblePartyVotes).reduce((sum, v) => sum + v, 0);
    const proportionalEntitlement = {};
    
    parties.forEach(party => {
        const voteShare = eligiblePartyVotes[party.id] || 0;
        if (voteShare > 0) {
            proportionalEntitlement[party.id] = (voteShare / eligibleTotalVotes) * totalSeats;
        } else {
            proportionalEntitlement[party.id] = 0;
        }
    });
    
    // Implement overhang seats
    let overhangSeats = 0;
    const finalSeats = {};
    
    parties.forEach(party => {
        const districtWon = partyDistrictSeats[party.id] || 0;
        const entitled = proportionalEntitlement[party.id] || 0;
        
        if (districtWon > entitled) {
            // Overhang: party keeps all district seats
            finalSeats[party.id] = districtWon;
            overhangSeats += (districtWon - Math.floor(entitled));
        } else {
            // Normal: round up to entitled seats
            finalSeats[party.id] = Math.max(districtWon, Math.round(entitled));
        }
    });
    
    // If there are overhang seats, recalculate total parliament size
    let actualTotalSeats = totalSeats;
    if (overhangSeats > 0) {
        actualTotalSeats = Object.values(finalSeats).reduce((sum, s) => sum + s, 0);
        
        // Recalculate other parties' seats to maintain proportionality
        parties.forEach(party => {
            const districtWon = partyDistrictSeats[party.id] || 0;
            const entitled = proportionalEntitlement[party.id] || 0;
            
            if (districtWon <= entitled) {
                // Adjust for expanded parliament
                const newEntitlement = (eligiblePartyVotes[party.id] || 0) / eligibleTotalVotes * actualTotalSeats;
                finalSeats[party.id] = Math.max(districtWon, Math.round(newEntitlement));
            }
        });
        
        actualTotalSeats = Object.values(finalSeats).reduce((sum, s) => sum + s, 0);
    }
    
    const results = parties.map(party => {
        const partyVotes = votes.parties[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        const meetsThreshold = percentage >= threshold;
        const districtWon = partyDistrictSeats[party.id] || 0;
        const totalSeatsWon = finalSeats[party.id] || 0;
        const listSeatsWon = totalSeatsWon - districtWon;
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: partyVotes,
            percentage: percentage,
            seats: totalSeatsWon,
            districtSeats: districtWon,
            listSeats: listSeatsWon,
            meetsThreshold: meetsThreshold,
            belowThreshold: !meetsThreshold && partyVotes > 0,
            hasOverhang: districtWon > (proportionalEntitlement[party.id] || 0)
        };
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = actualTotalSeats > 0 ? (r.seats / actualTotalSeats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    
    // Add descriptive note based on race type
    const raceTypeNote = raceType === 'single' 
        ? "Single District: Simulating 1 constituency race (FPTP) with compensatory list seats added to achieve proportionality"
        : `Legislative Simulation: ${districtSeats} district races (FPTP) with ${listSeats} compensatory list seats for overall proportionality`;
    
    return {
        type: 'mixed',
        results: results,
        totalVotes: totalPartyVotes,
        totalSeats: actualTotalSeats,
        plannedSeats: totalSeats,
        districtSeats: districtSeats,
        listSeats: listSeats,
        overhangSeats: overhangSeats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        raceType: raceType,
        note: raceTypeNote
    };
}

function calculateParallel(votes) {
    // Similar to MMP but non-compensatory
    const totalSeats = getSeatsCount();
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    
    // For single race: 1 district seat only (simulate one race)
    // For legislative: multiple districts + list seats
    const districtSeats = raceType === 'single' ? 1 : Math.floor(totalSeats / 2);
    const listSeats = totalSeats - districtSeats;
    
    // Get electoral threshold
    const thresholdInput = document.getElementById('electoralThreshold');
    const threshold = thresholdInput ? parseFloat(thresholdInput.value) : 0;
    
    // Get allocation method
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // District tier (FPTP)
    const candidateResults = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            partyId: party.id,
            party: party.name,
            color: party.color,
            votes: voteCount
        };
    });
    candidateResults.sort((a, b) => b.votes - a.votes);
    
    const partyDistrictSeats = {};
    parties.forEach(p => partyDistrictSeats[p.id] = 0);
    
    for (let i = 0; i < Math.min(districtSeats, candidateResults.length); i++) {
        partyDistrictSeats[candidateResults[i].partyId]++;
    }
    
    // List tier (separate PR allocation with threshold)
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    
    // Filter parties that meet threshold
    const eligiblePartyVotes = {};
    parties.forEach(party => {
        const voteShare = votes.parties[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (voteShare / totalPartyVotes * 100) : 0;
        if (percentage >= threshold && voteShare > 0) {
            eligiblePartyVotes[party.id] = voteShare;
        }
    });
    
    // Allocate list seats using chosen method
    let partyListSeats;
    if (allocationMethod === 'sainte-lague') {
        partyListSeats = allocateSeats_SainteLague(eligiblePartyVotes, listSeats);
    } else {
        partyListSeats = allocateSeats_DHondt(eligiblePartyVotes, listSeats);
    }
    
    // Ensure all parties have seat counts initialized
    parties.forEach(p => {
        if (!partyListSeats[p.id]) partyListSeats[p.id] = 0;
    });
    
    const results = parties.map(party => {
        const partyVotes = votes.parties[party.id] || 0;
        const distSeats = partyDistrictSeats[party.id] || 0;
        const lstSeats = partyListSeats[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        const meetsThreshold = percentage >= threshold;
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: partyVotes,
            percentage: percentage,
            seats: distSeats + lstSeats,
            districtSeats: distSeats,
            listSeats: lstSeats,
            meetsThreshold: meetsThreshold,
            belowThreshold: !meetsThreshold && partyVotes > 0
        };
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = totalSeats > 0 ? (r.seats / totalSeats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    
    // Add descriptive note based on race type
    const raceTypeNote = raceType === 'single'
        ? "Single District: Simulating 1 constituency race (FPTP) with separate list seats (non-compensatory)"
        : `Legislative Simulation: ${districtSeats} district races (FPTP) with ${listSeats} list seats calculated independently (non-compensatory)`;
    
    return {
        type: 'mixed',
        results: results,
        totalVotes: totalPartyVotes,
        totalSeats: totalSeats,
        districtSeats: districtSeats,
        listSeats: listSeats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        raceType: raceType,
        note: raceTypeNote
    };
}

function calculateBlock(votes) {
    // Voters can vote for multiple candidates, top N win
    const seats = 3;
    
    const results = candidates.map(candidate => {
        const voteCount = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: 0,
            elected: false
        };
    });
    
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    results.forEach(r => {
        r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
    });
    
    results.sort((a, b) => b.votes - a.votes);
    
    for (let i = 0; i < Math.min(seats, results.length); i++) {
        results[i].elected = true;
    }
    
    return {
        type: 'multi-winner',
        results: results,
        totalVotes: totalVotes,
        seats: seats
    };
}

function calculateLimited(votes) {
    // Similar to block but with limited votes per voter (simulated)
    // For simulation, same as block but with note
    const result = calculateBlock(votes);
    result.note = "Voters have fewer votes than seats available, promoting minority representation";
    return result;
}

function calculateApproval(votes) {
    // Each input represents number of approvals
    const results = candidates.map(candidate => {
        const approvals = votes.candidates[candidate.id] || 0;
        const party = parties.find(p => p.id === candidate.partyId);
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            approvals: approvals,
            percentage: 0
        };
    });
    
    const totalApprovals = results.reduce((sum, r) => sum + r.approvals, 0);
    results.forEach(r => {
        r.percentage = totalApprovals > 0 ? (r.approvals / totalApprovals * 100) : 0;
    });
    
    results.sort((a, b) => b.approvals - a.approvals);
    
    if (results.length > 0) {
        results[0].winner = true;
    }
    
    return {
        type: 'approval',
        results: results,
        totalApprovals: totalApprovals
    };
}

function displayResults(results, system) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsDiv = document.getElementById('results');
    const arrowDiv = document.getElementById('arrowAnalysis');
    const aiAnalysisSection = document.getElementById('aiAnalysisSection');
    
    resultsSection.style.display = 'block';
    aiAnalysisSection.style.display = 'block'; // Show AI analysis section
    
    // Save election data to localStorage for AI analysis
    try {
        const electionData = {
            system: systemDescriptions[system] || system,
            systemKey: system,
            results: results,
            parameters: {
                seats: parseInt(document.getElementById('raceType')?.value) || 1,
                threshold: parseFloat(document.getElementById('electoralThreshold')?.value) || 0
            },
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('lastElectionResults', JSON.stringify(electionData));
        
        // Also store in global variable for immediate access
        window.lastElectionResults = electionData;
    } catch (e) {
        console.error('Error saving election data:', e);
    }
    
    let html = '';
    
    // Show tie notification if detected
    if (results.tieDetected && results.tieInfo) {
        const systemNames = {
            'fptp': 'First-Past-the-Post',
            'trs': 'Two-Round System',
            'irv': 'Instant-Runoff Voting',
            'block': 'Block Voting',
            'limited': 'Limited Voting',
            'approval': 'Approval Voting',
            'borda': 'Borda Count',
            'condorcet': 'Condorcet Method'
        };
        html += createTieNotification(results.tieInfo, systemNames[system] || system);
    }
    
    // Prepare data for pie charts
    let votesChartData = [];
    let seatsChartData = [];
    
    if (results.type === 'candidate') {
        // For candidate-based results, check if we should skip vote chart for ranking systems
        const system = document.getElementById('electoralSystem').value;
        const rankingSystems = ['irv', 'stv'];
        const isRankingSystem = rankingSystems.includes(system);
        
        // Add pie charts section
        html += '<div class="charts-container">';
        if (!isRankingSystem) {
            html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        }
        html += '<canvas id="winnerChart" width="400" height="400" style="' + (isRankingSystem ? 'margin: 0 auto;' : '') + '"></canvas>';
        html += '</div>';
        
        html += '<h3>Results by Candidate</h3>';
        results.results.forEach(r => {
            html += `
                <div class="result-item" style="border-left-color: ${r.color}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${r.winner ? '<span class="winner-badge">WINNER</span>' : ''}
                            ${r.elected ? '<span class="winner-badge">ELECTED</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • ${formatNumber(r.votes || r.points || 0)} ${r.points !== undefined ? 'points' : 'votes'} • ${r.percentage ? r.percentage.toFixed(1) + '%' : ''}
                            ${r.note ? `<br><em>${r.note}</em>` : ''}
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${r.percentage || 0}%">
                            ${r.percentage ? r.percentage.toFixed(1) + '%' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // Collect data for charts
            if (!isRankingSystem) {
                votesChartData.push({
                    label: r.name,
                    value: r.votes || r.points || 0,
                    color: r.color
                });
            }
            
            // Collect data for winner/elected chart
            if (r.winner || r.elected) {
                seatsChartData.push({
                    label: r.name + (r.winner ? ' (Winner)' : ' (Elected)'),
                    value: 1,
                    color: r.color
                });
            }
        });
        
        // Add round-by-round visualization for IRV
        if (system === 'irv' && results.rounds && results.rounds.length > 0) {
            html += createRoundByRoundDisplay(results.rounds, candidates, 'irv');
        }
    } else if (results.type === 'party') {
        // Add charts section
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="comparisonChart" width="600" height="400"></canvas>';
        html += '</div>';
        
        // Show disproportionality index if available
        if (results.disproportionality !== undefined) {
            const dispColor = results.disproportionality < 5 ? '#2ecc71' : results.disproportionality < 10 ? '#f39c12' : '#e74c3c';
            const dispRating = results.disproportionality < 5 ? 'Excellent' : results.disproportionality < 10 ? 'Moderate' : 'High';
            html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${dispColor};">
                <strong style="color: ${dispColor};">📊 Loosemore-Hanby Disproportionality Index: ${results.disproportionality.toFixed(2)}% (${dispRating})</strong>
                <p style="margin-top: 5px; color: #2e7d32;">This measures deviation from perfect proportionality. 0% = perfect, higher = more disproportional.</p>
                ${results.allocationMethod ? `<p style="margin-top: 5px; color: #666;"><em>Using ${results.allocationMethod === 'dhondt' ? 'D\'Hondt' : 'Sainte-Laguë'} method for seat allocation</em></p>` : ''}
            </div>`;
        }
        
        // Show threshold information if applicable
        if (results.threshold !== undefined && results.threshold > 0) {
            html += `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <strong>Electoral Threshold: ${results.threshold}%</strong>
                <p style="margin-top: 5px; color: #856404;">Parties must receive at least ${results.threshold}% of votes to win seats.</p>
            </div>`;
        }
        
        html += '<h3>Seat Allocation by Party</h3>';
        
        // Prepare comparison data for bar chart
        const comparisonData = [];
        
        results.results.forEach(r => {
            const seatPercentage = results.totalSeats > 0 ? (r.seats / results.totalSeats * 100) : 0;
            let statusBadge = '';
            if (r.belowThreshold) {
                statusBadge = '<span style="background: #e74c3c; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85em; margin-left: 8px;">Below Threshold</span>';
            }
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}; ${r.belowThreshold ? 'opacity: 0.6;' : ''}">
                    <div class="result-info">
                        <div class="result-name">${r.name}${statusBadge}</div>
                        <div class="result-stats">
                            ${formatNumber(r.votes)} votes (${r.percentage.toFixed(1)}%) • ${r.seats} seats (${seatPercentage.toFixed(1)}%)
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${seatPercentage}%">
                            ${r.seats} seats
                        </div>
                    </div>
                </div>
            `;
            
            // Collect data for charts
            votesChartData.push({
                label: r.name,
                value: r.votes,
                color: r.color
            });
            
            if (r.votes > 0 || r.seats > 0) {
                comparisonData.push({
                    label: r.name,
                    votePct: r.percentage,
                    seatPct: seatPercentage,
                    color: r.color
                });
            }
            
            if (r.seats > 0) {
                seatsChartData.push({
                    label: r.name,
                    value: r.seats,
                    color: r.color
                });
            }
        });
        
        // Store comparison data for later use
        results._comparisonData = comparisonData;
        
        if (results.candidateVotes) {
            html += '<h3 style="margin-top: 20px;">Top Candidates</h3>';
            results.candidateVotes.slice(0, 5).forEach(c => {
                html += `
                    <div class="result-item" style="border-left-color: ${c.color}">
                        <div class="result-info">
                            <div class="result-name">${c.name}</div>
                            <div class="result-stats">${c.party} • ${formatNumber(c.votes)} personal votes</div>
                        </div>
                    </div>
                `;
            });
        }
    } else if (results.type === 'mixed') {
        // Add charts section
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="comparisonChart" width="600" height="400"></canvas>';
        html += '</div>';
        
        // Show overhang seats warning for MMP
        if (results.overhangSeats && results.overhangSeats > 0) {
            html += `<div style="background: #ffe5e5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #e74c3c;">
                <strong style="color: #c0392b;">⚠️ Overhang Seats: ${results.overhangSeats}</strong>
                <p style="margin-top: 5px; color: #a93226;">Parliament expanded from ${results.plannedSeats} to ${results.totalSeats} seats because some parties won more district seats than their proportional entitlement.</p>
            </div>`;
        }
        
        // Show disproportionality index if available
        if (results.disproportionality !== undefined) {
            const dispColor = results.disproportionality < 5 ? '#2ecc71' : results.disproportionality < 10 ? '#f39c12' : '#e74c3c';
            const dispRating = results.disproportionality < 5 ? 'Excellent' : results.disproportionality < 10 ? 'Moderate' : 'High';
            html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${dispColor};">
                <strong style="color: ${dispColor};">📊 Loosemore-Hanby Disproportionality Index: ${results.disproportionality.toFixed(2)}% (${dispRating})</strong>
                <p style="margin-top: 5px; color: #2e7d32;">Measures deviation from perfect proportionality. 0% = perfect, higher = more disproportional.</p>
                ${results.allocationMethod ? `<p style="margin-top: 5px; color: #666;"><em>Using ${results.allocationMethod === 'dhondt' ? 'D\'Hondt' : 'Sainte-Laguë'} method for list seats</em></p>` : ''}
            </div>`;
        }
        
        // Show threshold information if applicable
        if (results.threshold !== undefined && results.threshold > 0) {
            html += `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <strong>Electoral Threshold: ${results.threshold}%</strong>
                <p style="margin-top: 5px; color: #856404;">Parties must receive at least ${results.threshold}% of party votes to win list seats.</p>
            </div>`;
        }
        
        html += '<h3>Seat Allocation by Party</h3>';
        
        // Prepare comparison data for bar chart
        const comparisonData = [];
        
        results.results.forEach(r => {
            const seatPercentage = results.totalSeats > 0 ? (r.seats / results.totalSeats * 100) : 0;
            let statusBadge = '';
            if (r.belowThreshold) {
                statusBadge = '<span style="background: #e74c3c; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85em; margin-left: 8px;">Below Threshold</span>';
            }
            if (r.hasOverhang) {
                statusBadge += ' <span style="background: #ff9800; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85em; margin-left: 8px;">Overhang</span>';
            }
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}; ${r.belowThreshold ? 'opacity: 0.6;' : ''}">
                    <div class="result-info">
                        <div class="result-name">${r.name}${statusBadge}</div>
                        <div class="result-stats">
                            ${formatNumber(r.votes)} votes (${r.percentage.toFixed(1)}%) • 
                            ${r.seats} total seats (${r.districtSeats} district + ${r.listSeats} list)
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${seatPercentage}%">
                            ${r.seats} seats
                        </div>
                    </div>
                </div>
            `;
            
            // Collect data for charts
            votesChartData.push({
                label: r.name,
                value: r.votes,
                color: r.color
            });
            
            if (r.votes > 0 || r.seats > 0) {
                comparisonData.push({
                    label: r.name,
                    votePct: r.percentage,
                    seatPct: seatPercentage,
                    color: r.color
                });
            }
            
            if (r.seats > 0) {
                seatsChartData.push({
                    label: r.name,
                    value: r.seats,
                    color: r.color
                });
            }
        });
        
        // Store comparison data for later use
        results._comparisonData = comparisonData;
    } else if (results.type === 'multi-winner') {
        // Add pie charts section
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="seatsChart" width="400" height="400"></canvas>';
        html += '</div>';
        
        html += '<h3>Elected Candidates</h3>';
        results.results.forEach(r => {
            html += `
                <div class="result-item" style="border-left-color: ${r.color}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${r.elected ? '<span class="winner-badge">ELECTED</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • ${formatNumber(r.votes)} votes • ${r.percentage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${r.percentage}%">
                            ${r.percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            `;
            
            // Collect data for charts
            votesChartData.push({
                label: r.name,
                value: r.votes,
                color: r.color
            });
            
            if (r.elected) {
                seatsChartData.push({
                    label: r.name,
                    value: 1,
                    color: r.color
                });
            }
        });
        if (results.quota) {
            html += `<p style="margin-top: 10px;"><strong>Quota needed:</strong> ${formatNumber(results.quota)} votes</p>`;
        }
        
        // Display round-by-round flow for STV
        if (system === 'stv' && results.rounds && results.rounds.length > 0) {
            html += createRoundByRoundDisplay(results.rounds, candidates, 'stv');
        }
    } else if (results.type === 'borda') {
        // Borda Count results
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="winnerChart" width="400" height="400"></canvas>';
        html += '</div>';
        
        html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
            <strong>📊 Borda Count Method</strong>
            <p style="margin-top: 5px; color: #2e7d32;">${results.method || 'Points: n-1 for 1st place, n-2 for 2nd, etc.'}</p>
            <p style="margin-top: 5px; color: #666;">Total ballots: ${formatNumber(results.totalBallots)} • Total points awarded: ${formatNumber(Math.round(results.totalPoints))}</p>
        </div>`;
        
        html += '<h3>Results by Borda Points</h3>';
        results.results.forEach(r => {
            const pointPercentage = results.totalPoints > 0 ? (r.points / results.totalPoints * 100) : 0;
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${r.winner ? '<span class="winner-badge">WINNER</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • ${formatNumber(Math.round(r.points))} points • ${pointPercentage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${pointPercentage}%">
                            ${formatNumber(Math.round(r.points))} pts
                        </div>
                    </div>
                </div>
            `;
            
            votesChartData.push({
                label: r.name,
                value: r.points,
                color: r.color
            });
            
            if (r.winner) {
                seatsChartData.push({
                    label: r.name + ' (Winner)',
                    value: 1,
                    color: r.color
                });
            }
        });
    } else if (results.type === 'condorcet') {
        // Condorcet results
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="winnerChart" width="400" height="400"></canvas>';
        html += '</div>';
        
        if (results.hasParadox) {
            html += `<div style="background: #ffe5e5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #e74c3c;">
                <strong style="color: #c0392b;">⚠️ Condorcet Paradox Detected!</strong>
                <p style="margin-top: 5px; color: #a93226;">No candidate beats all others in head-to-head matchups. This demonstrates a voting cycle (A beats B, B beats C, C beats A).</p>
            </div>`;
        } else {
            html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                <strong style="color: #2e7d32;">✅ Condorcet Winner Found</strong>
                <p style="margin-top: 5px; color: #2e7d32;">This candidate beats every other candidate in head-to-head comparison.</p>
            </div>`;
        }
        
        html += '<h3>Pairwise Comparison Results</h3>';
        results.results.forEach(r => {
            html += `
                <div class="result-item" style="border-left-color: ${r.color}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${r.is_condorcet_winner ? '<span class="winner-badge">CONDORCET WINNER</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • Wins ${r.pairwise_wins} of ${candidates.length - 1} head-to-head matchups
                        </div>
                    </div>
                </div>
            `;
            
            votesChartData.push({
                label: r.name,
                value: r.pairwise_wins + 1,
                color: r.color
            });
            
            if (r.is_condorcet_winner) {
                seatsChartData.push({
                    label: r.name + ' (Winner)',
                    value: 1,
                    color: r.color
                });
            }
        });
    } else if (results.type === 'approval') {
        // Add pie charts section
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="winnerChart" width="400" height="400"></canvas>';
        html += '</div>';
        
        html += '<h3>Results by Approvals</h3>';
        results.results.forEach(r => {
            html += `
                <div class="result-item" style="border-left-color: ${r.color}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${r.winner ? '<span class="winner-badge">WINNER</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • ${formatNumber(r.approvals)} approvals • ${r.percentage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${r.percentage}%">
                            ${r.percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            `;
            
            // Collect data for charts
            votesChartData.push({
                label: r.name,
                value: r.approvals,
                color: r.color
            });
            
            if (r.winner) {
                seatsChartData.push({
                    label: r.name + ' (Winner)',
                    value: 1,
                    color: r.color
                });
            }
        });
    }
    
    if (results.note) {
        html += `<p style="margin-top: 15px; color: #666; font-style: italic;">${results.note}</p>`;
    }
    
    resultsDiv.innerHTML = html;
    
    // Display Arrow's Theorem analysis
    const analysis = arrowAnalysis[system];
    if (!analysis) {
        arrowDiv.innerHTML = '<p>Arrow\'s Theorem analysis not available for this system.</p>';
        console.error('No Arrow analysis found for system:', system);
        console.log('Available systems:', Object.keys(arrowAnalysis));
    } else {
        let arrowHtml = `
            <h4>${analysis.title}</h4>
            <div class="criterion-grid">
                <div class="criterion"><strong>Non-Dictatorship:</strong> ${analysis.nonDictatorship}</div>
                <div class="criterion"><strong>Unrestricted Domain:</strong> ${analysis.universality}</div>
                <div class="criterion"><strong>IIA:</strong> ${analysis.independence}</div>
                <div class="criterion"><strong>Monotonicity:</strong> ${analysis.monotonicity}</div>
            </div>
            <h4>Detailed Analysis</h4>
            <p>${analysis.explanation || 'Analysis pending.'}</p>
        `;
        
        // Add strategic voting analysis if available
        if (analysis.strategicVoting) {
            arrowHtml += `
                <h4 style="margin-top: 20px;">🎯 Strategic Voting (Gibbard-Satterthwaite Theorem)</h4>
                <p>${analysis.strategicVoting}</p>
            `;
        }
        
        arrowDiv.innerHTML = arrowHtml;
    }
    
    // Draw charts after DOM is updated using Chart.js
    setTimeout(() => {
        try {
            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js library not loaded!');
                alert('Chart.js library failed to load. Please check your internet connection and refresh.');
                return;
            }
            
            // Check if wrapper functions exist on window object
            if (typeof window.createPieChart === 'undefined' || typeof window.createComparisonBarChart === 'undefined') {
                console.error('❌ Chart wrapper functions not loaded! Make sure chartjs-wrapper.js is included.');
                alert('Chart functions not available. Please refresh the page.');
                return;
            }
            
            const system = document.getElementById('electoralSystem').value;
            const rankingSystems = ['irv', 'stv'];
            const isRankingSystem = rankingSystems.includes(system);
            
            console.log('📊 Creating charts with data:', { 
                votes: votesChartData.length, 
                seats: seatsChartData.length,
                isRankingSystem: isRankingSystem
            });
            
            // For non-ranking systems, show vote distribution chart
            if (!isRankingSystem && votesChartData.length > 0) {
                const votesTitle = results.type === 'approval' ? 'Vote Distribution (Approvals)' : 'Vote Distribution';
                window.createPieChart('votesChart', votesChartData, votesTitle);
            }
            
            // For party and mixed systems, use comparison bar chart instead of pie chart
            if ((results.type === 'party' || results.type === 'mixed') && results._comparisonData) {
                window.createComparisonBarChart('comparisonChart', results._comparisonData, 'Vote Share vs Seat Share');
            } else if (seatsChartData.length > 0) {
                let seatsTitle = 'Seat Distribution';
                if (results.type === 'candidate' || results.type === 'approval') {
                    seatsTitle = 'Winner';
                } else if (results.type === 'multi-winner') {
                    seatsTitle = 'Elected Candidates';
                }
                
                const seatsChartId = (results.type === 'candidate' || results.type === 'approval') ? 'winnerChart' : 'seatsChart';
                window.createPieChart(seatsChartId, seatsChartData, seatsTitle);
            }
            
            console.log('✅ All charts created successfully');
        } catch (error) {
            console.error('❌ Chart creation error:', error);
            console.error('Stack:', error.stack);
            alert(`Chart error: ${error.message}\nCheck console for details.`);
        }
    }, 200);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

