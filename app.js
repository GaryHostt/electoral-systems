// Data structures
let parties = [];
let candidates = [];
let votes = {};
let rankings = {}; // Store ranking preferences for IRV/STV
let currentImportedCountry = null; // Track which country is currently imported

// Configuration
// Helper to get custom seat count with validation (DRY principle)
function getCustomSeatCount() {
    const seatsInput = document.getElementById('totalLegislatureSeats');
    if (!seatsInput) return 100;
    
    const customSeats = parseInt(seatsInput.value);
    return isNaN(customSeats) || customSeats < 2 ? 100 : Math.min(customSeats, 1000);
}

function getSeatsCount() {
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    if (raceType === 'single') return 1;
    return getCustomSeatCount();
}

// Apply parliament preset from dropdown
function applyParliamentPreset() {
    const select = document.getElementById('parliamentPresets');
    const seatsInput = document.getElementById('totalLegislatureSeats');
    
    if (select.value) {
        seatsInput.value = select.value;
        // Reset dropdown to placeholder
        select.value = '';
        
        // Re-render the race type labels with new seat count
        const currentSystem = document.getElementById('electoralSystem').value;
        if (currentSystem) {
            configureRaceTypeForSystem(currentSystem);
        }
        
        // Trigger any dependent updates
        updateVotingInputs();
    }
}

// Update seats/members label based on selected system
function updateSeatsLabel() {
    const system = document.getElementById('electoralSystem').value;
    const label = document.querySelector('label[for="totalLegislatureSeats"]');
    if (label) {
        label.textContent = system === 'stv' ? 'Members:' : 'Seats:';
    }
}

// Update parliament presets dropdown based on selected system
function updateParliamentPresets() {
    const system = document.getElementById('electoralSystem').value;
    const select = document.getElementById('parliamentPresets');
    
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '<option value="">-- Real-World Presets --</option>';
    
    if (system === 'stv') {
        // STV-specific presets
        const stvPresets = [
            { value: '5', label: '🇲🇹 Malta (5)' },
            { value: '3', label: '🇮🇪 Ireland rural (3)' },
            { value: '5', label: '🇮🇪 Ireland urban (5)' },
            { value: '6', label: '🇦🇺 Australia half (6)' },
            { value: '12', label: '🇦🇺 Australia full (12)' }
        ];
        stvPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.value;
            option.textContent = preset.label;
            select.appendChild(option);
        });
    } else {
        // Default presets for other systems
        const defaultPresets = [
            { value: '349', label: '🇸🇪 Sweden (349)' },
            { value: '598', label: '🇩🇪 Germany (598)' },
            { value: '435', label: '🇺🇸 US House (435)' },
            { value: '650', label: '🇬🇧 UK Commons (650)' },
            { value: '465', label: '🇯🇵 Japan (465)' },
            { value: '120', label: '🇳🇿 New Zealand (120)' },
            { value: '160', label: '🇮🇪 Ireland Dáil (160)' }
        ];
        defaultPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.value;
            option.textContent = preset.label;
            select.appendChild(option);
        });
    }
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

// Centralized system configuration rules
// This object defines the properties and behaviors of each electoral system
const SYSTEM_RULES = {
    'fptp': {
        name: 'First-Past-the-Post',
        isMixed: false,
        compensatory: false,
        hasDistricts: false,
        needsPartyVote: false,
        needsCandidates: true,
        isRanking: false,
        raceScopes: ['single'],  // Legislative mode disabled until district-by-district entry UI is implemented
        description: 'Simple plurality voting where highest vote wins'
    },
    'irv': {
        name: 'Instant-Runoff Voting',
        isMixed: false,
        compensatory: false,
        hasDistricts: false,
        needsPartyVote: false,
        needsCandidates: true,
        isRanking: true,
        raceScopes: ['single'],  // Legislative mode disabled until district-by-district entry UI is implemented
        description: 'Ranked choice with instant runoff elimination'
    },
    'party-list': {
        name: 'Party-List PR',
        isMixed: false,
        compensatory: false,
        hasDistricts: false,
        needsPartyVote: true,
        needsCandidates: false,
        isRanking: false,
        raceScopes: ['legislative'],
        description: 'Pure proportional representation by party vote'
    },
    'stv': {
        name: 'Single Transferable Vote',
        isMixed: false,
        compensatory: false,
        hasDistricts: false,
        needsPartyVote: false,
        needsCandidates: true,
        isRanking: true,
        raceScopes: ['legislative'],
        description: 'Multi-winner ranked choice with quota-based election'
    },
    'mmp': {
        name: 'Mixed-Member Proportional',
        isMixed: true,
        compensatory: true,
        hasDistricts: true,
        needsPartyVote: true,
        needsCandidates: true,
        isRanking: false,
        raceScopes: ['legislative'],
        description: 'Combines FPTP districts with compensatory PR list'
    },
    'parallel': {
        name: 'Parallel Voting',
        isMixed: true,
        compensatory: false,
        hasDistricts: true,
        needsPartyVote: true,
        needsCandidates: true,
        isRanking: false,
        raceScopes: ['legislative'],
        description: 'Independent district and list tiers without compensation'
    }
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

// Save application state to localStorage
function saveState() {
    try {
        const state = {
            parties: parties,
            candidates: candidates,
            importedCountry: currentImportedCountry,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('electoralSimulatorState', JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

// Load application state from localStorage
function loadState() {
    try {
        const saved = localStorage.getItem('electoralSimulatorState');
        if (saved) {
            const state = JSON.parse(saved);
            parties = state.parties || [];
            candidates = state.candidates || [];
            currentImportedCountry = state.importedCountry || null;
            updatePartiesList();
            updateCandidateList();
            updateCountryIndicator();
            return true;
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }
    return false;
}

// Reset simulator - clear all data and refresh page
function resetSimulator() {
    if (confirm('This will reset all data and refresh the page. Continue?')) {
        // Clear localStorage
        localStorage.removeItem('electoralSimulatorState');
        localStorage.removeItem('lastElectionResults');
        
        // Refresh page
        window.location.reload();
    }
}

// Get election data from localStorage (for learn-more AI analysis)
function getLastElectionDataLearn() {
    try {
        const data = localStorage.getItem('lastElectionResults');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading election data:', e);
        return null;
    }
}

async function getAIAnalysisLearn() {
    const btn = document.getElementById('aiAnalysisBtnLearn');
    const responseDiv = document.getElementById('aiResponseLearn');
    
    // Get election data
    const electionData = getLastElectionDataLearn();
    
    if (!electionData) {
        responseDiv.innerHTML = '<p style="color: #e74c3c;"><strong>⚠️ No election data found.</strong> Please run an election simulation first.</p>';
        responseDiv.style.display = 'block';
        return;
    }
    
    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Analyzing...';
    
    // Build the prompt
    const prompt = buildAnalysisPromptLearn(electionData);
    
    try {
        // Call Mistral API
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer nnVBj4Z7f9Iib41hpG2JFZ9KpHdaL6Bv'
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Assume the role of a political science expert specializing in comparative electoral systems and voting theory.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const analysis = data.choices[0].message.content;
        
        // Display response
        responseDiv.innerHTML = `
            <h3 style="color: #667eea; margin-bottom: 15px;">🎓 Expert Analysis</h3>
            <div style="line-height: 1.8;">${analysis}</div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 0.9em;">
                <em>Analysis provided by Mistral AI</em>
            </div>
        `;
        responseDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error calling Mistral API:', error);
        
        // Check if it's an API key issue
        if (error.message.includes('401') || error.message.includes('403')) {
            responseDiv.innerHTML = `
                <p style="color: #e74c3c;"><strong>⚠️ API Key Required</strong></p>
                <p>To use this feature, you need to:</p>
                <ol style="margin-left: 20px; margin-top: 10px; line-height: 1.8;">
                    <li>Sign up for a Mistral AI account at <a href="https://console.mistral.ai/" target="_blank">console.mistral.ai</a></li>
                    <li>Get your API key from the dashboard</li>
                    <li>Open the code in a text editor</li>
                    <li>Find the line with the API key and replace it with your actual API key</li>
                </ol>
            `;
        } else {
            responseDiv.innerHTML = `
                <p style="color: #e74c3c;"><strong>⚠️ Error:</strong> ${error.message}</p>
                <p>Please check your internet connection and API key.</p>
            `;
        }
        responseDiv.style.display = 'block';
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.innerHTML = '<span>🔍</span> Get AI Analysis of Last Election';
    }
}

function buildAnalysisPromptLearn(data) {
    const { system, results, parameters } = data;
    
    let prompt = `Analyze the following hypothetical election results, generated using the ${system} system `;
    
    if (parameters?.seats) {
        prompt += `(Total Seats: ${parameters.seats}`;
    }
    
    // Add vote totals
    if (results?.results) {
        prompt += `; Results: `;
        const resultsSummary = results.results.slice(0, 5).map(r => {
            if (r.votes !== undefined) {
                return `${r.party || r.name}: ${r.votes} votes`;
            } else if (r.seats !== undefined) {
                const voteShare = r.voteShare || r.vote_share || 0;
                return `${r.party}: ${voteShare.toFixed(1)}% votes, ${r.seats} seats`;
            }
            return `${r.party || r.name}`;
        }).join('; ');
        prompt += resultsSummary;
    }
    
    prompt += `).

In under 150 words, identify the primary systemic flaw demonstrated by these results, citing the relevant voting principle (e.g., Loosemore-Hanby Index/Arrow's Theorem), and briefly explain the systemic change (e.g., switch to RCV, adjust threshold, adopt MMP) that would have produced a more proportional or representative outcome for this specific scenario.`;
    
    return prompt;
}

// Initialize - wrap in DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load saved state if available
    loadState();
    
    document.getElementById('electoralSystem').addEventListener('change', onSystemChange);
    
    // Add event listener to legislature seats input to update labels dynamically
    const seatsInput = document.getElementById('totalLegislatureSeats');
    if (seatsInput) {
        seatsInput.addEventListener('input', function() {
            const currentSystem = document.getElementById('electoralSystem').value;
            if (currentSystem) {
                configureRaceTypeForSystem(currentSystem);
            }
        });
    }
    
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
    
    // Get system rules from centralized configuration
    const rules = SYSTEM_RULES[system];
    if (!rules) return; // Unknown system
    
    // Update system description
    document.getElementById('systemDescription').innerHTML = `<p>${systemDescriptions[system]}</p>`;
    
    // Show/hide electoral threshold input (for systems with party vote)
    const thresholdContainer = document.getElementById('electoralThresholdContainer');
    if (rules.needsPartyVote) {
        thresholdContainer.style.display = 'block';
    } else {
        thresholdContainer.style.display = 'none';
    }
    
    // Show/hide allocation method selector (for systems with party vote)
    const allocationContainer = document.getElementById('allocationMethodContainer');
    if (rules.needsPartyVote) {
        allocationContainer.style.display = 'block';
    } else {
        allocationContainer.style.display = 'none';
    }
    
    // Configure race type options based on system
    configureRaceTypeForSystem(system);
    
    // Update seats/members label based on system
    updateSeatsLabel();
    
    // Update parliament presets dropdown based on system
    updateParliamentPresets();
    
    // Configure advanced features visibility based on system
    configureAdvancedFeatures(system);
    
    // Show/hide sections based on system requirements
    const partiesSection = document.getElementById('partiesSection');
    const candidatesSection = document.getElementById('candidatesSection');
    const votingSection = document.getElementById('votingSection');
    
    if (!rules.needsCandidates && rules.needsPartyVote) {
        // Only parties, no candidates (e.g., Party-List PR)
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'none';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, null, 3);
    } else if (rules.needsCandidates && rules.needsPartyVote) {
        // Both parties and candidates (e.g., MMP, Parallel)
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'block';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, 3, 4);
    } else if (rules.needsCandidates && !rules.needsPartyVote) {
        // Candidates only - parties just for grouping/colors (e.g., FPTP, IRV, STV)
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
    
    // Get system rules from centralized configuration
    const rules = SYSTEM_RULES[system];
    if (!rules) return; // Unknown system
    
    // Get the span elements that contain the label text
    const singleSpan = singleOption.querySelector('span');
    const legislativeSpan = legislativeOption.querySelector('span');
    
    // Get the current race type and seat count
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    const seats = raceType === 'single' ? 1 : getCustomSeatCount();
    
    // Update span text based on system (keeps radio buttons intact)
    if (system === 'irv') {
        if (singleSpan) singleSpan.textContent = '🏁 Single District';
        // For legislative label, always use getCustomSeatCount() regardless of current selection
        if (legislativeSpan) {
            const legislativeSeats = getCustomSeatCount();
            legislativeSpan.textContent = `🏛️ ${legislativeSeats} Single-Member Districts`;
        }
    } else if (system === 'stv') {
        if (singleSpan) singleSpan.textContent = '🏁 Single Winner (IRV mode)';
        // For legislative label, always use getCustomSeatCount() regardless of current selection
        if (legislativeSpan) {
            const legislativeSeats = getCustomSeatCount();
            legislativeSpan.textContent = `🏛️ Multi-Member District (${legislativeSeats} members)`;
        }
    } else {
        // Default labels for other systems
        if (singleSpan) singleSpan.textContent = '🏁 Single Race (1 seat or district)';
        // For legislative label, always use getCustomSeatCount() regardless of current selection
        if (legislativeSpan) {
            const legislativeSeats = getCustomSeatCount();
            legislativeSpan.textContent = `🏛️ Entire Legislature (${legislativeSeats} seats)`;
        }
    }
    
    // Reset styles
    singleOption.style.opacity = '1';
    singleOption.style.cursor = 'pointer';
    legislativeOption.style.opacity = '1';
    legislativeOption.style.cursor = 'pointer';
    singleRadio.disabled = false;
    legislativeRadio.disabled = false;
    
    // Check if system only supports one race scope
    if (rules.raceScopes.length === 1) {
        const allowedScope = rules.raceScopes[0];
        
        if (allowedScope === 'single') {
            // Disable legislative, enable single only
            legislativeRadio.disabled = true;
            legislativeOption.style.opacity = '0.4';
            legislativeOption.style.cursor = 'not-allowed';
            
            // Force selection to single
            if (legislativeRadio.checked) {
                singleRadio.checked = true;
                updateRaceType();
            }
        } else if (allowedScope === 'legislative') {
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
    }
    // For systems with multiple race scopes, leave both enabled (no changes needed)
}

function configureAdvancedFeatures(system) {
    const rules = SYSTEM_RULES[system];
    if (!rules) return;
    
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
    if (ballotGenBtn) {
        if (rules.isRanking) {
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
    const seatsContainer = document.getElementById('legislatureSeatsContainer');
    
    if (raceType === 'single') {
        description.textContent = 'Single race: Simulate one electoral district or seat.';
        if (seatsContainer) seatsContainer.style.display = 'none';
    } else {
        description.textContent = 'Entire legislature: Simulate a full parliament with a custom number of seats.';
        if (seatsContainer) seatsContainer.style.display = 'flex';
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
    saveState(); // Auto-save
}

function removeParty(id) {
    parties = parties.filter(p => p.id !== id);
    candidates = candidates.filter(c => c.partyId !== id);
    
    // If all parties removed, clear country indicator
    if (parties.length === 0) {
        currentImportedCountry = null;
        updateCountryIndicator();
    }
    
    updatePartiesList();
    updateCandidatesList();
    updateCandidatePartySelect();
    updateVotingInputs();
    saveState(); // Auto-save
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

// Update country import indicator badge
function updateCountryIndicator() {
    // Remove existing indicator
    const existingIndicator = document.getElementById('countryIndicator');
    if (existingIndicator) existingIndicator.remove();
    
    // Add new indicator if country is imported
    if (currentImportedCountry) {
        const countryFlags = {
            'USA': '🇺🇸',
            'Canada': '🇨🇦',
            'Taiwan': '🇹🇼',
            'France': '🇫🇷',
            'Germany': '🇩🇪',
            'Chile': '🇨🇱',
            'Spain': '🇪🇸',
            'Finland': '🇫🇮',
            'Austria': '🇦🇹',
            'Portugal': '🇵🇹',
            'Poland': '🇵🇱',
            'Ireland': '🇮🇪',
            'Estonia': '🇪🇪',
            'Latvia': '🇱🇻',
            'Lithuania': '🇱🇹',
            'Italy': '🇮🇹',
            'Sweden': '🇸🇪'
        };
        
        const indicator = document.createElement('div');
        indicator.id = 'countryIndicator';
        indicator.style.cssText = 'background: #e6f7ff; border: 2px solid #1890ff; border-radius: 8px; padding: 8px 12px; margin: 15px 0; display: block; font-weight: 600; color: #0050b3;';
        indicator.innerHTML = `${countryFlags[currentImportedCountry] || '🌍'} Imported from: ${currentImportedCountry}`;
        
        // Insert into the parties section directly after the h2
        const partiesSection = document.getElementById('partiesSection');
        if (partiesSection) {
            const h2 = partiesSection.querySelector('h2');
            if (h2) {
                h2.insertAdjacentElement('afterend', indicator);
            }
        }
    }
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
    saveState(); // Auto-save
}

function removeCandidate(id) {
    candidates = candidates.filter(c => c.id !== id);
    updateCandidatesList();
    updateVotingInputs();
    saveState(); // Auto-save
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
    
    // Store for shadow results comparison
    window.lastCalculationSystem = system;
    window.lastCalculationVotes = votes;
    
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
    
    // Store results for shadow comparison
    window.lastCalculationResults = results;
    
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
    
    // Track exhausted ballots (ballots with no remaining valid preferences)
    let exhaustedVotes = 0;
    
    while (roundNumber < maxRounds) {
        roundNumber++;
        
        // Count current votes
        const voteCounts = {};
        candidateIds.forEach(id => voteCounts[id] = 0);
        exhaustedVotes = 0; // Reset each round
        
        ballots.forEach(ballot => {
            // Handle empty ballots (no preferences at all)
            if (ballot.preferences.length === 0) {
                exhaustedVotes += ballot.count;
                return;
            }
            
            // Find first non-eliminated preference
            let assigned = false;
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId)) {
                    voteCounts[prefId] += ballot.count;
                    assigned = true;
                    break;
                }
            }
            
            // If no valid preference found, ballot is exhausted
            if (!assigned) {
                exhaustedVotes += ballot.count;
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
    
    // Final count (with exhausted ballot tracking)
    const finalCounts = {};
    candidateIds.forEach(id => finalCounts[id] = 0);
    let finalExhaustedVotes = 0;
    
    ballots.forEach(ballot => {
        // Handle empty ballots
        if (ballot.preferences.length === 0) {
            finalExhaustedVotes += ballot.count;
            return;
        }
        
        let assigned = false;
        for (let prefId of ballot.preferences) {
            if (!eliminated.has(prefId)) {
                finalCounts[prefId] += ballot.count;
                assigned = true;
                break;
            }
        }
        
        // Track exhausted ballots in final count
        if (!assigned) {
            finalExhaustedVotes += ballot.count;
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
    
    const exhaustedPercentage = totalBallots > 0 ? (finalExhaustedVotes / totalBallots * 100) : 0;
    
    // Check for Condorcet violation
    function checkCondorcetWinner(ballots, candidates, totalBallots) {
        const pairwiseWins = {};
        candidates.forEach(c1 => {
            pairwiseWins[c1.id] = 0;
            candidates.forEach(c2 => {
                if (c1.id !== c2.id) {
                    let c1Pref = 0;
                    ballots.forEach(ballot => {
                        const c1Rank = ballot.preferences.indexOf(c1.id);
                        const c2Rank = ballot.preferences.indexOf(c2.id);
                        if (c1Rank !== -1 && (c2Rank === -1 || c1Rank < c2Rank)) {
                            c1Pref += ballot.count;
                        }
                    });
                    if (c1Pref > (totalBallots / 2)) {
                        pairwiseWins[c1.id]++;
                    }
                }
            });
        });
        
        const condorcetWinner = candidates.find(c => 
            pairwiseWins[c.id] === candidates.length - 1
        );
        
        return condorcetWinner;
    }
    
    const condorcetWinner = checkCondorcetWinner(ballots, candidates, totalBallots);
    const irvWinner = results.find(r => r.winner);
    
    // Check for paradox
    let paradox = null;
    if (condorcetWinner && irvWinner && irvWinner.name !== condorcetWinner.name) {
        paradox = {
            type: 'condorcet_violation',
            message: `⚠️ Condorcet Criterion Violation: ${condorcetWinner.name} would beat every other candidate head-to-head, but ${irvWinner.name} won under IRV.`,
            severity: 'moderate'
        };
    }
    
    return {
        type: 'candidate',
        results: results,
        totalVotes: totalBallots,
        exhaustedVotes: finalExhaustedVotes,
        exhaustedPercentage: exhaustedPercentage,
        rounds: roundsData,
        paradox: paradox,  // NEW: Paradox detection
        note: `Instant-Runoff Voting with ranked ballots (${roundNumber} elimination rounds)` +
              (finalExhaustedVotes > 0 ? `. ${formatNumber(finalExhaustedVotes)} ballots (${exhaustedPercentage.toFixed(1)}%) exhausted with no remaining valid preferences.` : '')
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
    
    // Calculate disproportionality (both indices)
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = seats > 0 ? (r.seats / seats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    const gallagher = calculateGallagher(voteShares, seatShares);
    
    return {
        type: 'party',
        results: results,
        totalVotes: totalVotes,
        totalSeats: seats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        gallagher: gallagher  // NEW: Gallagher Index
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
    const seats = getSeatsCount(); // Use same function as other systems for fair comparison
    
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
                const ballot = { 
                    count: count, 
                    preferences: [],
                    weight: 1.0,  // Gregory Method: fractional transfer value
                    currentPreference: 0  // Track which preference we're currently at
                };
                
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
    // DROOP QUOTA: Calculated once at start, never recalculated (even as ballots exhaust)
    const quota = Math.floor(totalBallots / (seats + 1)) + 1;
    const candidateIds = candidates.map(c => c.id);
    let elected = [];
    let eliminated = new Set();
    const roundsData = []; // Track rounds for visualization
    let roundNumber = 0;
    let exhaustedVotes = 0; // Track exhausted ballots
    
    // Run rounds until all seats filled or no more candidates
    while (elected.length < seats && eliminated.size + elected.length < candidateIds.length) {
        roundNumber++;
        
        // Count current votes
        const voteCounts = {};
        candidateIds.forEach(id => voteCounts[id] = 0);
        exhaustedVotes = 0; // Reset each round
        
        ballots.forEach(ballot => {
            // Handle empty ballots (no preferences at all)
            if (ballot.preferences.length === 0) {
                exhaustedVotes += ballot.count * ballot.weight;
                return;
            }
            
            // Find first non-eliminated, non-elected preference
            let assigned = false;
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId) && !elected.includes(prefId)) {
                    voteCounts[prefId] += ballot.count * ballot.weight;  // Gregory Method: apply weight
                    assigned = true;
                    break;
                }
            }
            
            // If no valid preference found, ballot is exhausted
            if (!assigned) {
                exhaustedVotes += ballot.count * ballot.weight;
            }
        });
        
        // Check if anyone meets quota
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id) && !elected.includes(id));
        const maxVotes = Math.max(...activeCandidates.map(id => voteCounts[id] || 0));
        
        if (maxVotes >= quota) {
            // Elect candidate with most votes
            const winner = activeCandidates.find(id => voteCounts[id] === maxVotes);
            elected.push(winner);
            
            const surplus = maxVotes - quota;
            const transferValue = maxVotes > 0 ? surplus / maxVotes : 0;  // Gregory Method
            
            // Transfer surplus to next preferences using Gregory Method
            let surplusExhausted = 0;
            
            if (surplus > 0) {
                ballots.forEach(ballot => {
                    // Check if this ballot is currently with the winner
                    const currentPref = ballot.preferences[ballot.currentPreference];
                    if (currentPref === winner) {
                        // Find next valid preference
                        let nextPrefFound = false;
                        for (let i = ballot.currentPreference + 1; i < ballot.preferences.length; i++) {
                            const nextPref = ballot.preferences[i];
                            if (!eliminated.has(nextPref) && !elected.includes(nextPref)) {
                                ballot.currentPreference = i;
                                ballot.weight *= transferValue;  // Apply fractional transfer
                                nextPrefFound = true;
                                break;
                            }
                        }
                        
                        // If no next preference, surplus is exhausted
                        if (!nextPrefFound) {
                            surplusExhausted += ballot.count * ballot.weight * transferValue;
                        }
                    }
                });
                
                exhaustedVotes += surplusExhausted;
            }
            
            // Record round data
            roundsData.push({
                round: roundNumber,
                voteCounts: {...voteCounts},
                quota: quota,
                candidate_id: winner,
                action: 'elected',
                surplus: surplus,
                transferValue: transferValue,
                surplusExhausted: surplusExhausted
            });
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
        
        // Safety check - scale with seat count to handle large legislatures
        const maxRounds = seats * 2; // Allow 2 rounds per seat
        if (roundNumber > maxRounds) {
            console.warn(`STV: Maximum rounds (${maxRounds}) reached for ${seats} seats`);
            break;
        }
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
    
    const exhaustedPercentage = totalBallots > 0 ? (exhaustedVotes / totalBallots * 100) : 0;
    
    return {
        type: 'multi-winner',
        results: results,
        totalVotes: totalBallots,
        seats: seats,
        quota: quota,
        exhaustedVotes: exhaustedVotes,
        exhaustedPercentage: exhaustedPercentage,
        surplusLoss: exhaustedVotes,  // Track fractional surplus loss
        rounds: roundsData,
        note: `Single Transferable Vote with Gregory Method surplus transfer (Quota: ${quota} votes)` +
              (exhaustedVotes > 0 ? `. ${formatNumber(exhaustedVotes)} ballots (${exhaustedPercentage.toFixed(1)}%) exhausted with no remaining valid preferences.` : '')
    };
}

// ============================================
// Helper Function: Simulate District Elections
// ============================================
// Used by MMP and Parallel systems to simulate multiple FPTP district races
// Applies variance to prevent one party from sweeping all districts
function simulateDistricts(candidateVotes, districtCount) {
    const partyDistrictWins = {};
    parties.forEach(p => partyDistrictWins[p.id] = 0);
    
    for (let d = 0; d < districtCount; d++) {
        const districtResults = {};
        
        candidates.forEach(candidate => {
            // Partition: Divide total votes by number of districts
            const baseVotes = (candidateVotes[candidate.id] || 0) / districtCount;
            
            // Zero Candidate Catch: Ensure parties with 0 votes cannot win
            if (baseVotes === 0) {
                districtResults[candidate.id] = 0; // No variance for zero-vote candidates
            } else {
                // Variance: ±20% noise so different parties win different districts
                const variance = 0.8 + Math.random() * 0.4; // 80% to 120% of base
                districtResults[candidate.id] = baseVotes * variance;
            }
        });
        
        // Find FPTP winner for this district
        let maxVotes = 0;
        let winnerId = null;
        
        Object.entries(districtResults).forEach(([candidateId, votes]) => {
            if (votes > maxVotes) {
                maxVotes = votes;
                winnerId = candidateId;
            } else if (votes === maxVotes && winnerId) {
                // TIE: Use cryptographically secure random to pick winner
                if (getSecureRandomInt(2) === 1) {
                    winnerId = candidateId;
                }
            }
        });
        
        if (winnerId) {
            const winningCandidate = candidates.find(c => c.id == winnerId);
            if (winningCandidate) {
                partyDistrictWins[winningCandidate.partyId]++;
            }
        }
    }
    
    return partyDistrictWins; // { partyId: districtWinsCount }
}

function calculateMMP(votes) {
    // Mixed-Member Proportional: Compensatory system with district + list seats
    const totalSeats = getSeatsCount();
    
    // Germany Model: 50% Districts, 50% List (base allocation)
    const districtSeats = Math.floor(totalSeats / 2);
    const baseListSeats = totalSeats - districtSeats;
    
    // ============================================
    // Step A: District Tier (FPTP)
    // ============================================
    const partyDistrictWins = simulateDistricts(votes.candidates, districtSeats);
    
    // ============================================
    // Step B: Calculate Proportional Target Seats
    // ============================================
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    const threshold = parseFloat(document.getElementById('electoralThreshold')?.value) || 0;
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // Filter eligible parties (meet threshold OR won a district - Double Gate)
    const eligiblePartyVotes = {};
    parties.forEach(party => {
        const voteShare = votes.parties[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (voteShare / totalPartyVotes * 100) : 0;
        const wonADistrict = (partyDistrictWins[party.id] || 0) > 0;
        
        // DOUBLE GATE: Meet threshold OR win at least one district (Germany/New Zealand rule)
        if ((percentage >= threshold || wonADistrict) && voteShare > 0) {
            eligiblePartyVotes[party.id] = voteShare;
        }
    });
    
    // REFINEMENT: Use allocateSeats_DHondt/SainteLague for precise target calculation
    // This ensures targets sum exactly to totalSeats (avoids rounding errors)
    const proportionalTargets = allocationMethod === 'sainte-lague'
        ? allocateSeats_SainteLague(eligiblePartyVotes, totalSeats)
        : allocateSeats_DHondt(eligiblePartyVotes, totalSeats);
    
    // Initialize parties not meeting threshold
    parties.forEach(party => {
        if (!proportionalTargets[party.id]) {
            proportionalTargets[party.id] = 0;
        }
    });
    
    // ============================================
    // Step C: Calculate Top-Up (List Seats = Target - District)
    // ============================================
    const finalSeats = {};
    let overhangTotal = 0;
    
    parties.forEach(party => {
        const districtWon = partyDistrictWins[party.id] || 0;
        const target = proportionalTargets[party.id] || 0;
        
        if (districtWon > target) {
            // OVERHANG: Party keeps all district seats (expands parliament)
            finalSeats[party.id] = districtWon;
            overhangTotal += (districtWon - target);
        } else {
            // NORMAL: Award list seats to reach target (already an integer from allocateSeats)
            finalSeats[party.id] = target;
        }
    });
    
    // ============================================
    // Step D: Handle Overhang - BASIC APPROACH
    // ============================================
    // Simply expand parliament size, don't recalculate other parties (no leveling)
    const actualTotalSeats = Object.values(finalSeats).reduce((sum, s) => sum + s, 0);
    
    // Format results
    const results = parties.map(party => {
        const partyVotes = votes.parties[party.id] || 0;
        const districtWon = partyDistrictWins[party.id] || 0;
        const totalSeatsWon = finalSeats[party.id] || 0;
        const listSeatsWon = totalSeatsWon - districtWon;
        const percentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: partyVotes,
            percentage: percentage,
            seats: totalSeatsWon,
            districtSeats: districtWon,
            listSeats: listSeatsWon,
            targetSeats: proportionalTargets[party.id] || 0,
            meetsThreshold: percentage >= threshold,
            belowThreshold: percentage < threshold && partyVotes > 0,
            hasOverhang: districtWon > (proportionalTargets[party.id] || 0)
        };
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality (both indices)
    // NOTE: MMP should have LOW disproportionality (compensatory)
    // Parallel will have HIGHER disproportionality (non-compensatory)
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = actualTotalSeats > 0 ? (r.seats / actualTotalSeats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    const gallagher = calculateGallagher(voteShares, seatShares);
    
    const overhangNote = overhangTotal > 0 
        ? ` Parliament expanded by ${overhangTotal} overhang seat(s) from ${totalSeats} to ${actualTotalSeats}.`
        : '';
    
    return {
        type: 'mixed',
        results: results,
        totalSeats: actualTotalSeats,
        plannedSeats: totalSeats,
        totalVotes: totalPartyVotes,
        overhangSeats: overhangTotal,
        districtSeats: districtSeats,
        listSeats: actualTotalSeats - districtSeats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        gallagher: gallagher,  // NEW: Gallagher Index
        note: `Mixed-Member Proportional (Germany Model): ${districtSeats} district seats (${Math.round(districtSeats/totalSeats*100)}%) with compensatory list seats to ensure overall proportionality. Threshold: ${threshold}% OR 1+ district win for eligibility (Double Gate).${overhangNote}`
    };
}

function calculateParallel(votes) {
    // Parallel Voting (MMM): Non-compensatory mixed system
    const totalSeats = getSeatsCount();
    
    // Japan Model: ~62% Districts, ~38% List
    // This reflects real-world Parallel systems where district seats dominate
    const districtSeats = Math.floor(totalSeats * 0.62);
    const listSeats = totalSeats - districtSeats;
    
    // ============================================
    // SILO 1: District Tier (FPTP)
    // ============================================
    const partyDistrictWins = simulateDistricts(votes.candidates, districtSeats);
    
    // CRITICAL: Clear district variables before list calculation
    // The two tiers must be completely independent
    
    // ============================================
    // SILO 2: List Tier (Proportional - INDEPENDENT)
    // ============================================
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    const threshold = parseFloat(document.getElementById('electoralThreshold')?.value) || 0;
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // Filter parties meeting threshold
    const eligiblePartyVotes = {};
    parties.forEach(party => {
        const voteShare = votes.parties[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (voteShare / totalPartyVotes * 100) : 0;
        
        if (percentage >= threshold && voteShare > 0) {
            eligiblePartyVotes[party.id] = voteShare;
        }
    });
    
    // Allocate list seats using D'Hondt or Sainte-Laguë
    const partyListSeats = allocationMethod === 'sainte-lague'
        ? allocateSeats_SainteLague(eligiblePartyVotes, listSeats)
        : allocateSeats_DHondt(eligiblePartyVotes, listSeats);
    
    // Ensure all parties initialized
    parties.forEach(p => {
        if (!partyListSeats[p.id]) partyListSeats[p.id] = 0;
    });
    
    // ============================================
    // Step C: Simple Addition (NO COMPENSATION)
    // ============================================
    const results = parties.map(party => {
        const partyVotes = votes.parties[party.id] || 0;
        const districtWon = partyDistrictWins[party.id] || 0;
        const listWon = partyListSeats[party.id] || 0;
        const percentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: partyVotes,
            percentage: percentage,
            seats: districtWon + listWon, // Simple sum - NO COMPENSATION
            districtSeats: districtWon,
            listSeats: listWon,
            meetsThreshold: percentage >= threshold,
            belowThreshold: percentage < threshold && partyVotes > 0
        };
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality (both indices)
    // NOTE: Parallel voting will naturally have HIGHER disproportionality than MMP
    // This is expected and proves the non-compensatory nature of the system
    const voteShares = {};
    const seatShares = {};
    results.forEach(r => {
        voteShares[r.id] = r.percentage;
        seatShares[r.id] = totalSeats > 0 ? (r.seats / totalSeats * 100) : 0;
    });
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    const gallagher = calculateGallagher(voteShares, seatShares);
    
    // Check for "Majority Manufacture"
    let paradox = null;
    const winningParty = results[0];
    if (winningParty) {
        const seatPercentage = totalSeats > 0 ? (winningParty.seats / totalSeats * 100) : 0;
        const votePercentage = winningParty.percentage;
        
        if (seatPercentage > 50 && votePercentage < 40) {
            paradox = {
                type: 'majority_manufacture',
                message: `⚠️ Majority Manufacture: ${winningParty.name} won ${seatPercentage.toFixed(1)}% of seats with only ${votePercentage.toFixed(1)}% of votes. This is a common feature of non-compensatory mixed systems.`,
                severity: 'informational'
            };
        }
    }
    
    return {
        type: 'mixed',
        results: results,
        totalSeats: totalSeats,
        totalVotes: totalPartyVotes,
        districtSeats: districtSeats,
        listSeats: listSeats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        gallagher: gallagher,  // NEW: Gallagher Index
        paradox: paradox,  // NEW: Paradox detection
        note: `Parallel voting (Japan Model): ${districtSeats} district seats (${Math.round(districtSeats/totalSeats*100)}%) + ${listSeats} list seats (${Math.round(listSeats/totalSeats*100)}%) calculated independently (non-compensatory)`
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

// Get Gallagher Index grade with color and label
function getGallagherGrade(score, systemType) {
    let gradeInfo;
    if (score < 3) gradeInfo = { grade: 'A', color: '#2ecc71', label: 'Excellent' };
    else if (score < 5) gradeInfo = { grade: 'B', color: '#3498db', label: 'Very Good' };
    else if (score < 8) gradeInfo = { grade: 'C', color: '#f39c12', label: 'Fair' };
    else if (score < 12) gradeInfo = { grade: 'D', color: '#e67e22', label: 'Poor' };
    else if (score < 18) gradeInfo = { grade: 'E', color: '#e74c3c', label: 'Very Poor' };
    else gradeInfo = { grade: 'F', color: '#c0392b', label: 'Highly Disproportional' };
    
    // Add educational note for Parallel (MMM) systems
    if (systemType === 'parallel' && (gradeInfo.grade === 'D' || gradeInfo.grade === 'E')) {
        gradeInfo.note = 'This is expected behavior for Parallel Voting, which prioritizes local representation over proportionality.';
    }
    
    return gradeInfo;
}

// Translate ranked ballot data to party vote totals (for hybrid comparisons)
function translateRankedToPartyVotes(ballots) {
    const partyTotals = {};
    ballots.forEach(ballot => {
        const firstChoiceId = ballot.preferences[0];
        const candidate = candidates.find(c => c.id === firstChoiceId);
        if (candidate) {
            partyTotals[candidate.partyId] = (partyTotals[candidate.partyId] || 0) + ballot.count;
        }
    });
    return partyTotals;
}

// Convert FPTP candidate votes to synthetic IRV ballots
function convertFPTPtoIRVballots(candidateVotes) {
    const ballots = [];
    
    // For each candidate's vote count, create that many ballots with only that candidate
    Object.keys(candidateVotes).forEach(candidateId => {
        const votes = candidateVotes[candidateId] || 0;
        if (votes > 0) {
            ballots.push({
                preferences: [parseInt(candidateId)],
                count: votes
            });
        }
    });
    
    return ballots;
}

// Convert IRV ranked ballots to FPTP candidate votes (first preferences only)
function convertIRVtoFPTP(ballots) {
    const candidateVotes = {};
    
    ballots.forEach(ballot => {
        if (ballot.preferences && ballot.preferences.length > 0) {
            const firstChoice = ballot.preferences[0];
            candidateVotes[firstChoice] = (candidateVotes[firstChoice] || 0) + (ballot.count || 1);
        }
    });
    
    return candidateVotes;
}

// Calculate shadow result for cross-system comparison
function calculateShadowResult(currentSystem, compareToSystem, votes) {
    // Validate compatibility
    const compatibility = {
        'fptp': ['irv'],
        'irv': ['fptp'],
        'party-list': ['mmp', 'parallel'],
        'mmp': ['party-list', 'parallel'],
        'parallel': ['party-list', 'mmp'],
        'stv': ['mmp', 'party-list'] // Translate ranked → party
    };
    
    if (!compatibility[currentSystem]?.includes(compareToSystem)) {
        return { error: 'Systems not comparable with current data' };
    }
    
    // Data translation for hybrid comparisons
    let translatedVotes = votes;
    
    // FPTP → IRV: Create synthetic ballots from candidate votes
    if (currentSystem === 'fptp' && compareToSystem === 'irv') {
        translatedVotes = {
            ...votes,
            ballots: convertFPTPtoIRVballots(votes.candidates)
        };
    }
    
    // IRV → FPTP: Extract first preferences from ballots
    if (currentSystem === 'irv' && compareToSystem === 'fptp') {
        const candidateVotes = convertIRVtoFPTP(votes.ballots);
        
        // Calculate totalVoters from ballots
        let totalVoters = 0;
        if (votes.ballots) {
            votes.ballots.forEach(ballot => {
                totalVoters += ballot.count || 0;
            });
        }
        
        translatedVotes = {
            ...votes,
            candidates: candidateVotes,
            totalVoters: totalVoters
        };
    }
    
    // STV → Party-List/MMP: Translate ranked to party votes
    if (currentSystem === 'stv' && ['mmp', 'party-list'].includes(compareToSystem)) {
        translatedVotes = translateRankedToPartyVotes(votes.ballots);
    }
    
    // Run calculation
    const calculators = {
        'fptp': calculateFPTP,
        'irv': calculateIRV,
        'party-list': calculatePartyListPR,
        'mmp': calculateMMP,
        'parallel': calculateParallel,
        'stv': calculateSTV
    };
    
    const shadowResults = calculators[compareToSystem](translatedVotes);
    return shadowResults;
}

// Get compatible systems for shadow comparison
function getCompatibleSystems(currentSystem) {
    const compatibility = {
        'fptp': ['irv'],       // Re-enabled with synthetic ballot translation
        'irv': ['fptp'],       // Re-enabled with first-preference extraction
        'party-list': ['mmp', 'parallel'],
        'mmp': ['party-list', 'parallel'],
        'parallel': ['party-list', 'mmp'],
        'stv': ['mmp', 'party-list']
    };
    return compatibility[currentSystem] || [];
}

// Generate comparison rows for shadow results table
function generateComparisonRows(primaryResults, shadowResults) {
    let html = '';
    
    // Get party results from both systems
    const primaryParties = primaryResults.results || [];
    const shadowParties = shadowResults.results || [];
    
    // Create a map of parties
    const partyMap = new Map();
    
    // Handle single-winner systems (IRV/FPTP) vs multi-winner systems
    const isSingleWinner = primaryResults.type === 'candidate' || shadowResults.type === 'candidate';
    
    primaryParties.forEach(p => {
        // For single-winner systems, use winner flag or votes; for multi-winner, use seats
        const value = isSingleWinner ? (p.winner ? 1 : 0) : (p.seats || 0);
        partyMap.set(p.name, { primary: value, shadow: 0, color: p.color });
    });
    
    shadowParties.forEach(p => {
        const value = isSingleWinner ? (p.winner ? 1 : 0) : (p.seats || 0);
        if (partyMap.has(p.name)) {
            partyMap.get(p.name).shadow = value;
        } else {
            partyMap.set(p.name, { primary: 0, shadow: value, color: p.color });
        }
    });
    
    // Generate rows
    partyMap.forEach((data, partyName) => {
        const diff = data.shadow - data.primary;
        const diffSign = diff > 0 ? '+' : '';
        let diffClass = diff > 0 ? 'diff-positive' : (diff < 0 ? 'diff-negative' : 'diff-neutral');
        let diffText = diff > 0 ? `+${diff}` : (diff < 0 ? diff : '—');
        
        // For single-winner systems, show "Winner" instead of seat count
        const primaryDisplay = isSingleWinner ? (data.primary === 1 ? 'Winner' : '—') : data.primary;
        const shadowDisplay = isSingleWinner ? (data.shadow === 1 ? 'Winner' : '—') : data.shadow;
        
        html += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">
                    <span style="display: inline-block; width: 12px; height: 12px; background: ${data.color}; border-radius: 2px; margin-right: 8px;"></span>
                    ${partyName}
                </td>
                <td style="padding: 10px; text-align: center;">${primaryDisplay}</td>
                <td style="padding: 10px; text-align: center;">${shadowDisplay}</td>
                <td style="padding: 10px; text-align: center;" class="${diffClass}">
                    ${diffText}
                </td>
            </tr>
        `;
    });
    
    return html;
}

// Generate insight text for comparison
function generateComparisonInsight(primaryResults, shadowResults, currentSystem, compareSystem) {
    const systemNames = {
        'fptp': 'First-Past-the-Post',
        'irv': 'Instant-Runoff Voting',
        'party-list': 'Party-List PR',
        'mmp': 'Mixed-Member Proportional',
        'parallel': 'Parallel Voting',
        'stv': 'Single Transferable Vote'
    };
    
    const currentName = systemNames[currentSystem] || currentSystem;
    const compareName = systemNames[compareSystem] || compareSystem;
    
    // Calculate total seat shifts
    const primaryParties = primaryResults.results || [];
    const shadowParties = shadowResults.results || [];
    
    let totalShift = 0;
    const partyMap = new Map();
    
    primaryParties.forEach(p => {
        partyMap.set(p.name, { primary: p.seats || 0, shadow: 0 });
    });
    
    shadowParties.forEach(p => {
        if (partyMap.has(p.name)) {
            partyMap.get(p.name).shadow = p.seats || 0;
        }
    });
    
    partyMap.forEach(data => {
        totalShift += Math.abs(data.shadow - data.primary);
    });
    
    const halfShift = totalShift / 2; // Each seat shift is counted twice
    
    let insight = '';
    
    // Gallagher Index comparison (if available)
    if (primaryResults.gallagher !== undefined && shadowResults.gallagher !== undefined) {
        const gDiff = (shadowResults.gallagher - primaryResults.gallagher).toFixed(2);
        insight += `<p style="font-weight: 600; color: #2d3748; margin-bottom: 10px;">📊 Gallagher Index Shift: ${gDiff > 0 ? '+' : ''}${gDiff}</p>`;
        
        if (Math.abs(gDiff) < 0.5) {
            insight += `<p style="margin-bottom: 10px;">Both systems produced remarkably similar levels of proportionality for this specific vote distribution.</p>`;
        } else if (parseFloat(gDiff) < 0) {
            insight += `<p style="margin-bottom: 10px;">Switching from ${currentName} to ${compareName} improved proportionality by ${Math.abs(gDiff)} points, reducing the distortion between votes and seats.</p>`;
        } else {
            insight += `<p style="margin-bottom: 10px;">Switching from ${currentName} to ${compareName} increased disproportionality by ${gDiff} points, likely favoring larger parties and creating a more "stable" but less representative majority.</p>`;
        }
    }
    
    // Seat shift analysis
    insight += `Under ${currentName}, the seat allocation differs from ${compareName} by ${halfShift} seat${halfShift !== 1 ? 's' : ''}. `;
    
    // Add max shift if available
    if (partyMap.size > 0) {
        const maxShift = Math.max(...Array.from(partyMap.values()).map(d => Math.abs(d.shadow - d.primary)));
        if (maxShift > 0) {
            insight += `The largest seat shift was ${maxShift} seats, demonstrating how electoral systems can significantly impact representation. `;
        }
    }
    
    // Add system-specific insights
    if (currentSystem === 'mmp' && compareSystem === 'parallel') {
        insight += 'MMP\'s compensatory mechanism makes it more proportional than Parallel Voting.';
    } else if (currentSystem === 'parallel' && compareSystem === 'mmp') {
        insight += 'Parallel Voting prioritizes local representation, while MMP balances it with proportionality.';
    } else if ((currentSystem === 'mmp' || currentSystem === 'parallel') && compareSystem === 'party-list') {
        insight += 'The mixed system includes district seats, which can create deviations from pure proportionality.';
    } else if (currentSystem === 'fptp' && compareSystem === 'irv') {
        insight += 'IRV eliminates the "spoiler effect" by considering voters\' full ranking preferences.';
    } else if (currentSystem === 'irv' && compareSystem === 'fptp') {
        insight += 'FPTP only considers first preferences, which can lead to different outcomes when there are multiple candidates.';
    }
    
    // Add educational note for FPTP ↔ IRV comparisons
    if ((currentSystem === 'fptp' && compareSystem === 'irv') || 
        (currentSystem === 'irv' && compareSystem === 'fptp')) {
        insight += `
        <p style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-left: 3px solid #2196f3;">
            <strong>📘 Note:</strong> This comparison uses ${currentSystem === 'fptp' ? 'synthetic ranked ballots (each voter ranks only their chosen candidate)' : 'first-preference votes only'} 
            to enable cross-system comparison. In reality, voters might rank differently if given the option.
        </p>`;
    }
    
    return insight;
}

// Show shadow result comparison
function showShadowResult() {
    const compareSystem = document.getElementById('shadowSystemSelect').value;
    if (!compareSystem) {
        alert('Please select a system to compare');
        return;
    }
    
    const currentSystem = window.lastCalculationSystem;
    const votes = window.lastCalculationVotes;
    const primaryResults = window.lastCalculationResults;
    
    // DEBUG: Log to verify data exists
    console.log('Shadow Result Debug:', {
        currentSystem,
        compareSystem,
        hasVotes: !!votes,
        hasPrimaryResults: !!primaryResults,
        votesStructure: votes ? Object.keys(votes) : null,
        primaryResultsStructure: primaryResults ? Object.keys(primaryResults) : null
    });
    
    if (!currentSystem || !votes || !primaryResults) {
        alert('Please calculate results first');
        return;
    }
    
    const shadowResults = calculateShadowResult(currentSystem, compareSystem, votes);
    
    if (shadowResults.error) {
        alert(shadowResults.error);
        return;
    }
    
    const systemNames = {
        'fptp': 'FPTP',
        'irv': 'IRV',
        'party-list': 'Party-List PR',
        'mmp': 'MMP',
        'parallel': 'Parallel',
        'stv': 'STV'
    };
    
    // Build comparison table with research-grade styling
    const comparisonHTML = `
        <div class="comparison-table-wrapper">
            <div class="shadow-header">
                🔬 Counterfactual Analysis: ${SYSTEM_RULES[compareSystem].name}
            </div>
            <table class="comparison-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #667eea; color: white;">
                        <th style="padding: 12px; text-align: left;">Party</th>
                        <th style="padding: 12px; text-align: center;">${systemNames[currentSystem]} Seats</th>
                        <th style="padding: 12px; text-align: center;">${systemNames[compareSystem]} Seats</th>
                        <th style="padding: 12px; text-align: center;">Difference</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateComparisonRows(primaryResults, shadowResults)}
                </tbody>
            </table>
            
            <div style="margin-top: 15px; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <strong style="color: #1565c0;">💡 Key Insight:</strong>
                <div style="margin: 8px 0 0 0; color: #333; line-height: 1.6;">${generateComparisonInsight(primaryResults, shadowResults, currentSystem, compareSystem)}</div>
            </div>
        </div>
    `;
    
    document.getElementById('shadowResultsDisplay').innerHTML = comparisonHTML;
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
    
    // Display paradox warnings if present
    if (results.paradox) {
        const severityColor = results.paradox.severity === 'moderate' ? '#ff9800' : '#2196f3';
        html += `<div style="background: #e3f2fd; border-left: 4px solid ${severityColor}; 
                             padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: ${severityColor};">
                🔔 Electoral Paradox Detected
            </h4>
            <p style="margin: 0 0 10px 0; color: #1565c0; line-height: 1.6;">
                ${results.paradox.message}
            </p>
            <p style="margin: 0; font-size: 0.9em; color: #666; line-height: 1.5;">
                ℹ️ This demonstrates why no electoral system can satisfy all fairness criteria simultaneously (Arrow's Impossibility Theorem).
            </p>
        </div>`;
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
            // Enhanced three-tier color grading
            let dispColor, dispRating, dispGrade, bgColor;
            if (results.disproportionality < 5) {
                dispColor = '#2ecc71';
                dispRating = 'Highly Proportional';
                dispGrade = 'Excellent';
                bgColor = '#d4edda';
            } else if (results.disproportionality < 15) {
                dispColor = '#f39c12';
                dispRating = 'Moderately Disproportional';
                dispGrade = 'Fair';
                bgColor = '#fff3cd';
            } else {
                dispColor = '#e74c3c';
                dispRating = 'Highly Disproportional';
                dispGrade = 'Poor';
                bgColor = '#f8d7da';
            }
            
            html += `<div style="background: ${bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${dispColor};">
                <strong style="color: ${dispColor};">📊 Disproportionality Metrics - ${dispGrade}</strong>
                <p style="margin-top: 8px; color: #333; line-height: 1.6;">
                    <strong>Loosemore-Hanby Index:</strong> ${results.disproportionality.toFixed(2)}%<br>
                    <strong>Gallagher Index (LSq):</strong> ${results.gallagher.toFixed(2)}%
                </p>`;
            
            // Add Gallagher grade visual meter
            if (results.gallagher !== undefined) {
                const gradeInfo = getGallagherGrade(results.gallagher, system);
                html += `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 8px;">
                        <strong>Fairness Grade:</strong>
                        <span style="font-size: 2em; font-weight: bold; color: ${gradeInfo.color}; margin-left: 10px;">
                            ${gradeInfo.grade}
                        </span>
                        <span style="color: #666; margin-left: 8px;">(${gradeInfo.label})</span>
                    </div>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="background: ${gradeInfo.color}; height: 100%; width: ${Math.min(100, results.gallagher * 5)}%; transition: width 0.3s;"></div>
                    </div>
                    ${gradeInfo.note ? `<p style="margin-top: 8px; font-size: 0.9em; color: #666; font-style: italic;">💡 ${gradeInfo.note}</p>` : ''}
                </div>`;
            }
            
            // Add educational note for small legislatures (Rounding Error Effect)
            const totalSeats = results.totalSeats || results.seats || getSeatsCount();
            if (totalSeats < 50) {
                html += `
                <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <strong>📚 Educational Note: The "Rounding Error Effect"</strong>
                    <p style="margin: 8px 0 0 0; color: #856404; line-height: 1.6;">
                        Small legislatures (< 50 seats) show higher disproportionality even with PR systems. 
                        With only ${totalSeats} seats, each seat represents ${(100/totalSeats).toFixed(1)}% of representation, 
                        making perfect proportionality mathematically impossible. For example, a party with 12% of votes 
                        cannot receive exactly 12% of ${totalSeats} seats (${(totalSeats * 0.12).toFixed(1)} seats), 
                        so it must be rounded to ${Math.round(totalSeats * 0.12)} seats 
                        (${(Math.round(totalSeats * 0.12) / totalSeats * 100).toFixed(1)}%), 
                        creating a ${Math.abs(12 - (Math.round(totalSeats * 0.12) / totalSeats * 100)).toFixed(1)}% allocation error.
                    </p>
                </div>`;
            }
            
            html += `
                <p style="margin-top: 8px; color: #333; line-height: 1.6;"><strong>${dispRating}:</strong> This means ${results.disproportionality.toFixed(1)}% of the seats in the legislature are held by parties that would not have them if the results were perfectly proportional to the vote share.</p>
                <p style="margin-top: 5px; font-size: 0.9em; color: #666;">The Gallagher Index penalizes large deviations more heavily and is the academic standard.</p>
                ${results.allocationMethod ? `<p style="margin-top: 5px; color: #666;"><em>Using ${results.allocationMethod === 'dhondt' ? 'D\'Hondt' : 'Sainte-Laguë'} method for seat allocation</em></p>` : ''}
                
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #667eea; font-weight: 600;">📈 Compare to Real-World Elections</summary>
                    <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.6); border-radius: 4px;">
                        <p style="margin: 5px 0;"><span style="color: #e74c3c;">●</span> <strong>UK (FPTP):</strong> 15-25% - Highly Disproportional</p>
                        <p style="margin: 5px 0;"><span style="color: #f39c12;">●</span> <strong>Japan (Parallel):</strong> 8-14% - Moderately Disproportional</p>
                        <p style="margin: 5px 0;"><span style="color: #2ecc71;">●</span> <strong>Germany (MMP):</strong> 1-4% - Highly Proportional</p>
                    </div>
                </details>
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
                        <div class="result-bar-fill" style="width: ${seatPercentage}%;">
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
            // Enhanced three-tier color grading
            let dispColor, dispRating, dispGrade, bgColor;
            if (results.disproportionality < 5) {
                dispColor = '#2ecc71';
                dispRating = 'Highly Proportional';
                dispGrade = 'Excellent';
                bgColor = '#d4edda';
            } else if (results.disproportionality < 15) {
                dispColor = '#f39c12';
                dispRating = 'Moderately Disproportional';
                dispGrade = 'Fair';
                bgColor = '#fff3cd';
            } else {
                dispColor = '#e74c3c';
                dispRating = 'Highly Disproportional';
                dispGrade = 'Poor';
                bgColor = '#f8d7da';
            }
            
            html += `<div style="background: ${bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${dispColor};">
                <strong style="color: ${dispColor};">📊 Disproportionality Metrics - ${dispGrade}</strong>
                <p style="margin-top: 8px; color: #333; line-height: 1.6;">
                    <strong>Loosemore-Hanby Index:</strong> ${results.disproportionality.toFixed(2)}%<br>
                    <strong>Gallagher Index (LSq):</strong> ${results.gallagher.toFixed(2)}%
                </p>`;
            
            // Add Gallagher grade visual meter
            if (results.gallagher !== undefined) {
                const gradeInfo = getGallagherGrade(results.gallagher, system);
                html += `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 8px;">
                        <strong>Fairness Grade:</strong>
                        <span style="font-size: 2em; font-weight: bold; color: ${gradeInfo.color}; margin-left: 10px;">
                            ${gradeInfo.grade}
                        </span>
                        <span style="color: #666; margin-left: 8px;">(${gradeInfo.label})</span>
                    </div>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="background: ${gradeInfo.color}; height: 100%; width: ${Math.min(100, results.gallagher * 5)}%; transition: width 0.3s;"></div>
                    </div>
                    ${gradeInfo.note ? `<p style="margin-top: 8px; font-size: 0.9em; color: #666; font-style: italic;">💡 ${gradeInfo.note}</p>` : ''}
                </div>`;
            }
            
            // Add educational note for small legislatures (Rounding Error Effect)
            const totalSeatsMixed = results.totalSeats || results.seats || getSeatsCount();
            if (totalSeatsMixed < 50) {
                html += `
                <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <strong>📚 Educational Note: The "Rounding Error Effect"</strong>
                    <p style="margin: 8px 0 0 0; color: #856404; line-height: 1.6;">
                        Small legislatures (< 50 seats) show higher disproportionality even with PR systems. 
                        With only ${totalSeatsMixed} seats, each seat represents ${(100/totalSeatsMixed).toFixed(1)}% of representation, 
                        making perfect proportionality mathematically impossible. For example, a party with 12% of votes 
                        cannot receive exactly 12% of ${totalSeatsMixed} seats (${(totalSeatsMixed * 0.12).toFixed(1)} seats), 
                        so it must be rounded to ${Math.round(totalSeatsMixed * 0.12)} seats 
                        (${(Math.round(totalSeatsMixed * 0.12) / totalSeatsMixed * 100).toFixed(1)}%), 
                        creating a ${Math.abs(12 - (Math.round(totalSeatsMixed * 0.12) / totalSeatsMixed * 100)).toFixed(1)}% allocation error.
                    </p>
                </div>`;
            }
            
            html += `
                <p style="margin-top: 8px; color: #333; line-height: 1.6;"><strong>${dispRating}:</strong> ${results.disproportionality.toFixed(1)}% of seats deviate from perfect proportionality.</p>
                <p style="margin-top: 5px; font-size: 0.9em; color: #666;">The Gallagher Index penalizes large deviations more heavily and is the academic standard.</p>
                ${results.allocationMethod ? `<p style="margin-top: 5px; color: #666;"><em>Using ${results.allocationMethod === 'dhondt' ? 'D\'Hondt' : 'Sainte-Laguë'} method for list seats</em></p>` : ''}
                
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #667eea; font-weight: 600;">📈 Compare to Real-World Elections</summary>
                    <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.6); border-radius: 4px;">
                        <p style="margin: 5px 0;"><span style="color: #e74c3c;">●</span> <strong>UK (FPTP):</strong> 15-25% - Highly Disproportional</p>
                        <p style="margin: 5px 0;"><span style="color: #f39c12;">●</span> <strong>Japan (Parallel):</strong> 8-14% - Moderately Disproportional</p>
                        <p style="margin: 5px 0;"><span style="color: #2ecc71;">●</span> <strong>Germany (MMP):</strong> 1-4% - Highly Proportional</p>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666; font-style: italic;"><strong>Note:</strong> Parallel voting naturally shows higher disproportionality than MMP - this is a feature, not a bug! The system is non-compensatory by design.</p>
                    </div>
                </details>
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
                        <div class="result-bar-fill" style="width: ${seatPercentage}%;">
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
    
    // Add Shadow Result Comparison UI
    const compatibleSystems = getCompatibleSystems(system);
    if (compatibleSystems.length > 0) {
        const systemFullNames = {
            'fptp': 'First-Past-the-Post',
            'irv': 'Instant-Runoff Voting',
            'party-list': 'Party-List Proportional Representation',
            'mmp': 'Mixed-Member Proportional',
            'parallel': 'Parallel Voting',
            'stv': 'Single Transferable Vote'
        };
        
        html += `
        <div class="comparison-section" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef;">
            <h3 style="color: #495057; margin: 0 0 10px 0;">📊 Compare to Alternative System</h3>
            <p style="color: #666; margin-bottom: 15px;">See how these same votes would produce different results under another electoral system.</p>
            
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <select id="shadowSystemSelect" style="padding: 10px 15px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; min-width: 250px;">
                    <option value="">-- Select System to Compare --</option>
                    ${compatibleSystems.map(s => 
                        `<option value="${s}">${systemFullNames[s]}</option>`
                    ).join('')}
                </select>
                
                <button onclick="showShadowResult()" class="btn-calculate" style="padding: 10px 20px;">
                    Compare Results
                </button>
            </div>
            
            <div id="shadowResultsDisplay" style="margin-top: 15px;"></div>
        </div>`;
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

