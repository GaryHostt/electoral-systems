// ===== STATE MANAGEMENT =====
// Replace global variables with state object
let electionState = {
    parties: [],
    candidates: [],
    votes: {},
    rankings: {}, // Store ranking preferences for IRV/STV
    importedCountry: null, // Track which country is currently imported
    system: null,
    raceType: 'single',
    totalSeats: 100,          // Keep for party-list, IRV, STV, FPTP
    districtSeats: 0,         // NEW: For MMP/MMM district tier
    baseListSeats: 0,         // NEW: For MMP/MMM list tier
    threshold: 5,
    bypassThreshold: 1,              // NEW: Minimum electorate seats to bypass threshold
    enableOverhangSeats: true,        // NEW: Allow overhang seats (NZ style)
    enableFullCompensation: false,    // NEW: Enable leveling seats (German style)
    allocationMethod: 'dhondt',
    levelingEnabled: false,           // Keep for backward compatibility
    isManualSeatMode: false,  // NEW: Tracks if manual mode is active
    manualSeats: {},          // NEW: Stores user-entered seats {partyId: seatCount}
    manualDistrictSeats: {},  // NEW: For Parallel voting - stores district seats separately {partyId: districtSeatCount}
    calculatedSeats: {}       // NEW: Stores system-calculated seats for comparison
};

// Keep backward compatibility aliases for now (will remove after full migration)
let parties = electionState.parties;
let candidates = electionState.candidates;
let votes = electionState.votes;
let rankings = electionState.rankings;
let currentImportedCountry = electionState.importedCountry;

// State management functions
function getState() {
    return JSON.parse(JSON.stringify(electionState)); // Deep copy
}

function setState(newState) {
    electionState = { ...electionState, ...newState };
    // Update backward compatibility aliases
    parties = electionState.parties;
    candidates = electionState.candidates;
    votes = electionState.votes;
    rankings = electionState.rankings;
    currentImportedCountry = electionState.importedCountry;
    updateUI();
    saveState(); // Auto-save to localStorage
}

function resetState() {
    electionState = {
        parties: [],
        candidates: [],
        votes: {},
        rankings: {},
        importedCountry: null,
        system: null,
        raceType: 'single',
        totalSeats: 100,
        districtSeats: 0,
        baseListSeats: 0,
        threshold: 5,
        bypassThreshold: 1,
        enableOverhangSeats: true,
        enableFullCompensation: false,
        allocationMethod: 'dhondt',
        levelingEnabled: false,
        isManualSeatMode: false,
        manualSeats: {},
        manualDistrictSeats: {},
        calculatedSeats: {}
    };
    // Update backward compatibility aliases
    parties = electionState.parties;
    candidates = electionState.candidates;
    votes = electionState.votes;
    rankings = electionState.rankings;
    currentImportedCountry = electionState.importedCountry;
    updateUI();
}

function updateUI() {
    // Update all UI elements from state
    // This will be called after state changes
    // Individual functions will handle their own UI updates
}

// Historical Election Preset Import Functions
function importElectionPreset(presetKey) {
    try {
        if (!presetKey) return; // Empty selection
        
        if (typeof ELECTION_PRESETS === 'undefined') {
            console.error('ELECTION_PRESETS is not defined. Make sure presets.js is loaded.');
            alert('Error: Election presets data not loaded. Please refresh the page.');
            return;
        }
        
        const preset = ELECTION_PRESETS[presetKey];
        if (!preset) {
            console.error(`Preset ${presetKey} not found`);
            alert(`Preset "${presetKey}" not found.`);
            return;
        }
        
        console.log(`Loading preset: ${preset.name}`);
        
        // Reset current state
        resetState();
    
    // Inject preset data into state
    setState({
        parties: preset.parties,
        candidates: preset.candidates || [],
        system: preset.system,
        totalSeats: preset.totalSeats || 100,           // For non-mixed systems
        districtSeats: preset.districtSeats || 0,       // NEW: For MMP/MMM
        baseListSeats: preset.baseListSeats || 0,       // NEW: For MMP/MMM
        threshold: preset.threshold || 0,
        allocationMethod: preset.allocationMethod || 'dhondt',
        levelingEnabled: preset.levelingEnabled || false,
        importedCountry: presetKey // Track preset source
    });
    
    // For ranking systems, pre-configure numBallotTypes BEFORE onSystemChange
    // (numBallotTypes exists in static HTML, but totalVoters is created dynamically)
    if (preset.ballots && (preset.system === 'irv' || preset.system === 'stv')) {
        const numBallotsInput = document.getElementById('numBallotTypes');
        if (numBallotsInput) {
            numBallotsInput.value = preset.ballots.length;
        }
    }
    
    // Sync UI controls
    document.getElementById('electoralSystem').value = preset.system;
    onSystemChange(); // Trigger system-specific UI updates
    
    // For FPTP legislative mode presets, set the race type radio button
    if (preset.system === 'fptp' && preset.raceType === 'legislative') {
        const legislativeRadio = document.getElementById('legislativeRaceRadio');
        if (legislativeRadio) {
            legislativeRadio.checked = true;
            updateRaceType(); // Trigger race type change to hide candidates section
        }
    }
    
    // For ranking systems, set totalVoters AFTER onSystemChange creates the input
    if (preset.ballots && (preset.system === 'irv' || preset.system === 'stv')) {
        const totalVotersInput = document.getElementById('totalVoters');
        if (totalVotersInput && preset.totalVoters) {
            totalVotersInput.value = formatNumber(preset.totalVoters);
        }
        // Note: Don't call updateRankingBallots() here - UI already built by onSystemChange
        // Calling it again would rebuild HTML and clear any values before they can be populated
    }
    
    // Update parties and candidates lists in UI
    updatePartiesList();
    updateCandidatesList();
    
    // Update parliament size inputs based on system type
    if (preset.system === 'mmp' || preset.system === 'parallel') {
        const districtInput = document.getElementById('districtSeatsInput');
        const listInput = document.getElementById('listSeatsInput');
        if (districtInput) districtInput.value = preset.districtSeats;
        if (listInput) listInput.value = preset.baseListSeats;
        
        // CRITICAL: Also update electionState directly (input.value changes don't trigger events)
        electionState.districtSeats = preset.districtSeats;
        electionState.baseListSeats = preset.baseListSeats;
        
        updateTotalSeatsDisplay();
    } else {
        const seatsInput = document.getElementById('totalLegislatureSeats');
        if (seatsInput) seatsInput.value = preset.totalSeats;
    }
    
    // Update threshold (if visible)
    const electoralThreshold = document.getElementById('electoralThreshold');
    if (electoralThreshold) electoralThreshold.value = preset.threshold || 0;
    
    // Update allocation method (if visible)
    const allocationSelect = document.getElementById('allocationMethod');
    if (allocationSelect) allocationSelect.value = preset.allocationMethod || 'dhondt';
    
    // Update MMP leveling toggle (if visible) - keep for backward compatibility
    const levelingToggle = document.getElementById('mmpLevelingToggle');
    if (levelingToggle) levelingToggle.checked = preset.levelingEnabled || false;
    
    // NEW: Set bypass threshold and overhang/compensation settings for MMP presets
    if (preset.system === 'mmp') {
        try {
            // Set bypass threshold based on country/system
            if (presetKey.includes('germany')) {
                electionState.bypassThreshold = preset.bypassThreshold || 3;
            } else if (presetKey.includes('new_zealand')) {
                electionState.bypassThreshold = preset.bypassThreshold || 1;
            } else {
                electionState.bypassThreshold = preset.bypassThreshold || 1;  // Default
            }
            
            // Set overhang enabled (default true for MMP)
            electionState.enableOverhangSeats = preset.enableOverhangSeats !== undefined 
                ? preset.enableOverhangSeats 
                : true;
            
            // Map levelingEnabled to enableFullCompensation
            electionState.enableFullCompensation = preset.levelingEnabled || false;
            
            // Update UI controls (onSystemChange should have created them)
            // Use a small delay to ensure onSystemChange has completed
            requestAnimationFrame(() => {
                const bypassThresholdInput = document.getElementById('bypassThresholdInput');
                if (bypassThresholdInput) {
                    bypassThresholdInput.value = electionState.bypassThreshold;
                }
                
                const enableOverhangToggle = document.getElementById('enableOverhangToggle');
                if (enableOverhangToggle) {
                    enableOverhangToggle.checked = electionState.enableOverhangSeats;
                    // Trigger change event to update full compensation toggle state
                    try {
                        enableOverhangToggle.dispatchEvent(new Event('change'));
                    } catch (e) {
                        console.warn('Could not dispatch change event on overhang toggle:', e);
                    }
                }
                
                const enableFullCompensationToggle = document.getElementById('enableFullCompensationToggle');
                if (enableFullCompensationToggle) {
                    enableFullCompensationToggle.checked = electionState.enableFullCompensation;
                }
            });
        } catch (e) {
            console.error('Error setting MMP preset options:', e);
        }
    }
    
    // NEW: If preset includes actual seats, automatically enable manual mode
    if (preset.actualSeats) {
        electionState.isManualSeatMode = true;
        electionState.manualSeats = { ...preset.actualSeats };
        // For Parallel voting, populate district seats from actualDistrictWins if available
        if (preset.system === 'parallel' && preset.actualDistrictWins) {
            electionState.manualDistrictSeats = { ...preset.actualDistrictWins };
        } else {
            electionState.manualDistrictSeats = {};
        }
        electionState.calculatedSeats = {};  // Reset calculated seats
        
        // Show manual seat section if MMP/MMM
        if (preset.system === 'mmp' || preset.system === 'parallel') {
            const manualToggle = document.getElementById('manualSeatOverrideToggle');
            if (manualToggle) {
                manualToggle.checked = true;
                const inputsDiv = document.getElementById('manualSeatInputs');
                if (inputsDiv) inputsDiv.style.display = 'block';
            }
        }
        
        // Show info message
        setTimeout(() => {
            const message = preset.overhangSeats > 0 
                ? `Imported actual results with ${preset.overhangSeats} overhang/leveling seats (Total: ${preset.finalParliamentSize} seats)`
                : `Imported actual results (Total: ${preset.finalParliamentSize} seats)`;
            
            console.log(message);
            // Could add UI notification here
        }, 200);
    }
    
    // Populate voting boxes with preset vote counts
    setTimeout(() => {
        // Only populate vote boxes if preset has votes (party-list, MMP, MMM systems)
        if (preset.votes) {
            populateVotingBoxes(preset.votes, preset);
        }
        
        // For ranking systems (IRV, STV), populate ranking ballots
        if (preset.ballots && (preset.system === 'irv' || preset.system === 'stv')) {
            populateRankingBallots(preset.ballots, preset.totalVoters);
        }
        
        // Show success message AFTER population completes
        setTimeout(() => {
            alert(`✅ Loaded: ${preset.name}\n\n${preset.description || ''}\n\nYou can now:\n• Click "Calculate" to see results\n• Change the electoral system to run counterfactual analysis\n• Edit vote counts before calculating`);
        }, 500); // Wait for ballot population to complete
    }, 800); // Increased from 500ms to 800ms for more stability
    } catch (error) {
        console.error('Error loading preset:', error);
        alert(`Error loading preset: ${error.message}\n\nPlease check the browser console for details.`);
    }
}

function populateVotingBoxes(voteData, preset) {
    // Fill Party Vote inputs
    if (voteData.parties) {
        Object.entries(voteData.parties).forEach(([id, count]) => {
            const input = document.getElementById(`party-${id}`);
            if (input) {
                input.value = formatNumber(count);
            }
        });
    }
    
    // Fill Candidate Vote inputs
    if (voteData.candidates) {
        Object.entries(voteData.candidates).forEach(([id, count]) => {
            const input = document.getElementById(`candidate-${id}`);
            if (input) {
                input.value = formatNumber(count);
            }
        });
    }
    
    // For FPTP legislative mode, also populate seats won
    if (preset && preset.system === 'fptp' && preset.raceType === 'legislative' && preset.seats) {
        setTimeout(() => {
            Object.entries(preset.seats).forEach(([partyId, seatCount]) => {
                const seatsInput = document.getElementById(`fptp-seats-${partyId}`);
                if (seatsInput) {
                    seatsInput.value = seatCount;
                }
            });
            // Update seat validator
            if (typeof validateFPTPSeatsTotal === 'function') {
                validateFPTPSeatsTotal();
            }
        }, 100);
    }
    
    // NEW: Populate manual seats if provided
    if (preset && preset.actualSeats && (preset.system === 'mmp' || preset.system === 'parallel')) {
        setTimeout(() => {
            updateManualSeatInputs(); // Generate inputs first
            
            const system = preset.system || electionState.system;
            const isParallel = system === 'parallel';
            
            if (isParallel && preset.actualDistrictWins) {
                // For Parallel voting, populate district and list inputs separately
                Object.entries(preset.actualDistrictWins).forEach(([partyId, districtCount]) => {
                    const partyIdInt = parseInt(partyId);
                    const districtInput = document.getElementById(`manual-district-seats-${partyIdInt}`);
                    if (districtInput) {
                        districtInput.value = districtCount;
                        // Update state
                        electionState.manualDistrictSeats[partyIdInt] = districtCount;
                    } else {
                        console.warn(`Could not find district input for party ${partyIdInt}`);
                    }
                });
                Object.entries(preset.actualSeats).forEach(([partyId, totalSeats]) => {
                    const partyIdInt = parseInt(partyId);
                    // Try both string and int keys for lookup
                    const districtWins = preset.actualDistrictWins[partyId] || preset.actualDistrictWins[partyIdInt] || 0;
                    const listSeats = totalSeats - districtWins;
                    const listInput = document.getElementById(`manual-list-seats-${partyIdInt}`);
                    if (listInput) {
                        listInput.value = listSeats;
                    } else {
                        console.warn(`Could not find list input for party ${partyIdInt}`);
                    }
                    // Ensure manualSeats is set to total
                    electionState.manualSeats[partyIdInt] = totalSeats;
                });
            } else {
                // For MMP, use single total seats input
                Object.entries(preset.actualSeats).forEach(([partyId, seatCount]) => {
                    const seatsInput = document.getElementById(`manual-seats-${partyId}`);
                    if (seatsInput) {
                        seatsInput.value = seatCount;
                    }
                });
            }
            
            updateManualSeatTotal(); // Update validation
        }, 150);
    }
}

function populateRankingBallots(ballotData, totalVotersCount) {
    if (!ballotData || ballotData.length === 0) return;
    
    // UI already built by onSystemChange() with correct number of ballots
    // Just wait for DOM stability, then populate values
    setTimeout(() => {
        ballotData.forEach((ballot, index) => {
            // Set ballot name
            const nameInput = document.getElementById(`ballot-${index}-name`);
            if (nameInput && ballot.name) {
                nameInput.value = ballot.name;
            }
            
            // Set percentage
            const percentageInput = document.getElementById(`ballot-${index}-percentage`);
            if (percentageInput) {
                percentageInput.value = ballot.percentage.toFixed(2);
            }
            
            // Set ranking preferences
            ballot.preferences.forEach((candidateId, rankIndex) => {
                const rank = rankIndex + 1;
                const select = document.getElementById(`ballot-${index}-rank-${rank}`);
                if (select) {
                    select.value = candidateId;
                }
            });
        });
    }, 200); // Shorter delay since no rebuild needed
}

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

// Update total seats display for discrete tier systems
function updateTotalSeatsDisplay() {
    const total = electionState.districtSeats + electionState.baseListSeats;
    const displayElement = document.getElementById('totalSeatsDisplay');
    if (displayElement) {
        displayElement.textContent = total;
    }
    
    // CRITICAL: Also update electionState.totalSeats for backward compatibility
    // This ensures other parts of the code (charts, exports) that still reference
    // totalSeats will have the correct base value
    electionState.totalSeats = total;
}

// Apply parliament preset from dropdown
function applyParliamentPreset() {
    const regularSelect = document.getElementById('parliamentPresets');
    const mixedSelect = document.getElementById('parliamentPresetsMixed');
    const currentSystem = document.getElementById('electoralSystem').value;
    
    // Handle mixed system presets (MMP/MMM)
    if ((currentSystem === 'mmp' || currentSystem === 'parallel') && mixedSelect && mixedSelect.value) {
        const presetConfig = {
            'germany': { district: 299, list: 299 },
            'japan': { district: 289, list: 176 },
            'new_zealand': { district: 72, list: 48 },
            'taiwan': { district: 79, list: 34 }
        };
        
        const config = presetConfig[mixedSelect.value];
        if (config) {
            const districtInput = document.getElementById('districtSeatsInput');
            const listInput = document.getElementById('listSeatsInput');
            
            if (districtInput) districtInput.value = config.district;
            if (listInput) listInput.value = config.list;
            
            // CRITICAL: Also update electionState
            electionState.districtSeats = config.district;
            electionState.baseListSeats = config.list;
            
            updateTotalSeatsDisplay();
        }
        
        // Reset dropdown
        mixedSelect.value = '';
    }
    // Handle regular single-seat presets
    else if (regularSelect && regularSelect.value) {
        const seatsInput = document.getElementById('totalLegislatureSeats');
        if (seatsInput) {
            seatsInput.value = regularSelect.value;
            electionState.totalSeats = parseInt(regularSelect.value);
        }
        
        // Reset dropdown
        regularSelect.value = '';
        
        // Re-render the race type labels with new seat count
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
        // Set default seats for STV to 12 (Australian Senate standard)
        const seatsInput = document.getElementById('totalLegislatureSeats');
        if (seatsInput && seatsInput.value === '100') {
            seatsInput.value = '12';
        }
        
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
        raceScopes: ['single', 'legislative'],  // Legislative mode now enabled for aggregate entry
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
        monotonicity: "❌ Fail - Referendum Paradox (No-Show Paradox): In multi-winner STV, voters can paradoxically help their preferred candidate by not voting",
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
            ...electionState,
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
            // Migrate old format to new state object format
            const migratedState = {
                parties: state.parties || [],
                candidates: state.candidates || [],
                votes: state.votes || {},
                rankings: state.rankings || {},
                importedCountry: state.importedCountry || state.importedCountry || null,
                system: state.system || null,
                raceType: state.raceType || 'single',
                totalSeats: state.totalSeats || 100,
                threshold: state.threshold || 5,
                allocationMethod: state.allocationMethod || 'dhondt',
                levelingEnabled: state.levelingEnabled || false
            };
            setState(migratedState);
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
        
        // Reset state object
        resetState();
        
        // Clear URL parameters if present
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Refresh page
        window.location.reload();
    }
}

// Share scenario functionality with LZString compression
function shareScenario() {
    // Ensure we have parties and candidates to share
    if (electionState.parties.length === 0) {
        alert('Please add parties and candidates before sharing.');
        return;
    }
    
    // Step 1: Stringify state
    const stateJson = JSON.stringify(electionState);
    
    // Step 2: Compress using LZString (reduces URL length by ~70-80%)
    const compressed = LZString.compressToEncodedURIComponent(stateJson);
    
    // Step 3: Create shareable URL
    const url = `${window.location.origin}${window.location.pathname}?scenario=${compressed}`;
    
    // Step 4: Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ Scenario URL copied to clipboard! Share this link to let others load your exact simulation.');
    }).catch(() => {
        // Fallback: show URL in prompt
        prompt('Copy this URL to share your scenario:', url);
    });
}

function loadScenarioFromURL() {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get('scenario');
    if (compressed) {
        try {
            // Step 1: Decompress
            const stateJson = LZString.decompressFromEncodedURIComponent(compressed);
            
            if (!stateJson) {
                // Fallback: try base64 decoding (for backward compatibility)
                try {
                    const stateJson = atob(compressed);
                    const state = JSON.parse(stateJson);
                    setState(state);
                    return;
                } catch (e) {
                    console.error('Error loading scenario (both methods failed):', e);
                    return;
                }
            }
            
            // Step 2: Parse JSON
            const state = JSON.parse(stateJson);
            setState(state);
        } catch (e) {
            console.error('Error loading scenario:', e);
            alert('Error loading scenario. The link may be corrupted or from an older version.');
        }
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
    // Load scenario from URL if present (takes precedence over localStorage)
    loadScenarioFromURL();
    
    // Load saved state if available (only if no URL scenario)
    if (!new URLSearchParams(window.location.search).get('scenario')) {
        loadState();
    }
    
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
    
    // Add event listeners for discrete tier seat inputs (MMP/MMM)
    const districtSeatsInput = document.getElementById('districtSeatsInput');
    const listSeatsInput = document.getElementById('listSeatsInput');
    
    if (districtSeatsInput) {
        districtSeatsInput.addEventListener('change', (e) => {
            electionState.districtSeats = parseInt(e.target.value) || 0;
            updateTotalSeatsDisplay();
        });
    }
    
    if (listSeatsInput) {
        listSeatsInput.addEventListener('change', (e) => {
            electionState.baseListSeats = parseInt(e.target.value) || 0;
            updateTotalSeatsDisplay();
        });
    }
    
    // NEW: Setup manual seat override toggle
    const manualToggle = document.getElementById('manualSeatOverrideToggle');
    if (manualToggle) {
        manualToggle.addEventListener('change', (e) => {
            electionState.isManualSeatMode = e.target.checked;
            const inputsDiv = document.getElementById('manualSeatInputs');
            
            if (e.target.checked) {
                if (inputsDiv) inputsDiv.style.display = 'block';
                updateManualSeatInputs();
                updateManualSeatTotal();
            } else {
                if (inputsDiv) inputsDiv.style.display = 'none';
                electionState.manualSeats = {};
                electionState.calculatedSeats = {};
            }
        });
    }
    
    // NEW: Setup threshold input (for MMP) - only electoralThreshold, no duplicate
    const electoralThreshold = document.getElementById('electoralThreshold');
    if (electoralThreshold) {
        electoralThreshold.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value) || 5;
            electionState.threshold = value;
        });
    }
    
    // NEW: Setup bypass threshold input
    const bypassThresholdInput = document.getElementById('bypassThresholdInput');
    if (bypassThresholdInput) {
        bypassThresholdInput.addEventListener('change', (e) => {
            electionState.bypassThreshold = parseInt(e.target.value) || 1;
        });
    }
    
    // NEW: Setup overhang toggle
    const enableOverhangToggle = document.getElementById('enableOverhangToggle');
    if (enableOverhangToggle) {
        enableOverhangToggle.addEventListener('change', (e) => {
            electionState.enableOverhangSeats = e.target.checked;
            // Enable/disable full compensation toggle based on overhang
            const fullCompensationToggle = document.getElementById('enableFullCompensationToggle');
            const fullCompensationLabel = document.getElementById('fullCompensationLabel');
            if (fullCompensationToggle && fullCompensationLabel) {
                fullCompensationToggle.disabled = !e.target.checked;
                if (!e.target.checked) {
                    fullCompensationToggle.checked = false;
                    electionState.enableFullCompensation = false;
                }
            }
        });
    }
    
    // NEW: Setup full compensation toggle
    const enableFullCompensationToggle = document.getElementById('enableFullCompensationToggle');
    if (enableFullCompensationToggle) {
        enableFullCompensationToggle.addEventListener('change', (e) => {
            electionState.enableFullCompensation = e.target.checked;
        });
    }
    
    // Setup color picker
    setupColorPicker();
    
    // Show presets section on page load
    const presetsSection = document.getElementById('presetsSection');
    if (presetsSection) {
        presetsSection.style.display = 'block';
    }
    
    // Initial state
    onSystemChange();
    
    // Populate candidate party dropdown if parties exist (for page reload with saved state)
    if (parties.length > 0) {
        updateCandidatePartySelect();
    }
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
    
    // Toggle between single and discrete seat inputs
    const singleSeatsInput = document.getElementById('singleSeatsInput');
    const discreteTierInputs = document.getElementById('discreteTierSeatsInputs');
    
    // Show discrete tier inputs for MMP and Parallel only
    if (system === 'mmp' || system === 'parallel') {
        if (singleSeatsInput) singleSeatsInput.style.display = 'none';
        if (discreteTierInputs) discreteTierInputs.style.display = 'flex';
    } else {
        if (singleSeatsInput) singleSeatsInput.style.display = 'flex';
        if (discreteTierInputs) discreteTierInputs.style.display = 'none';
    }
    
    // Toggle parliament presets dropdown based on system type
    const regularPresets = document.getElementById('parliamentPresets');
    const mixedPresets = document.getElementById('parliamentPresetsMixed');
    
    if (system === 'mmp' || system === 'parallel') {
        if (regularPresets) regularPresets.style.display = 'none';
        if (mixedPresets) mixedPresets.style.display = 'inline-block';
    } else {
        if (regularPresets) regularPresets.style.display = 'inline-block';
        if (mixedPresets) mixedPresets.style.display = 'none';
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
    
    // Safety check: ensure sections exist
    if (!partiesSection || !candidatesSection || !votingSection) {
        console.error('onSystemChange: Section elements not found', {
            partiesSection: !!partiesSection,
            candidatesSection: !!candidatesSection,
            votingSection: !!votingSection
        });
        return;
    }
    
    if (!rules.needsCandidates && rules.needsPartyVote) {
        // Only parties, no candidates (e.g., Party-List PR)
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'none';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, null, 3);
    } else if (rules.needsCandidates && rules.needsPartyVote) {
        // Both parties and candidates (e.g., MMP, Parallel)
        // Hide candidates section for MMP/Parallel since they're auto-generated
        partiesSection.style.display = 'block';
        candidatesSection.style.display = system === 'mmp' || system === 'parallel' ? 'none' : 'block';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, system === 'mmp' || system === 'parallel' ? null : 3, system === 'mmp' || system === 'parallel' ? 3 : 4);
        if (system !== 'mmp' && system !== 'parallel') {
            updateCandidatePartySelect(); // Populate the dropdown
        }
    } else if (rules.needsCandidates && !rules.needsPartyVote) {
        // Candidates only - parties just for grouping/colors (e.g., FPTP, IRV, STV)
        partiesSection.style.display = 'block';
        const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
        
        // Hide candidates for FPTP in legislative mode
        if (system === 'fptp' && raceType === 'legislative') {
            candidatesSection.style.display = 'none';
            updateSectionNumbers(2, null, 3);
        } else {
            candidatesSection.style.display = 'block';
            updateSectionNumbers(2, 3, 4);
            updateCandidatePartySelect(); // Populate the dropdown
        }
        votingSection.style.display = 'block';
        
        if (system !== 'fptp' || raceType === 'single') {
            updateCandidatePartySelect(); // Populate the dropdown
        }
    } else {
        // Fallback: show parties section for any system (shouldn't happen, but safety net)
        console.warn('onSystemChange: Unexpected rule combination, showing all sections', rules);
        partiesSection.style.display = 'block';
        candidatesSection.style.display = 'block';
        votingSection.style.display = 'block';
        updateSectionNumbers(2, 3, 4);
        updateCandidatePartySelect(); // Populate the dropdown
    }
    
    // Show/hide auto-generate candidates button based on system
    const autoGenButton = document.querySelector('button[onclick="autoGenerateCandidates()"]');
    if (autoGenButton) {
        // Hide for STV since it's party-based and auto-generates during calculation
        // But users can still manually add famous candidates if they want
        if (system === 'stv') {
            autoGenButton.style.display = 'none';
            // Add helpful note for STV users
            const candidatesSection = document.getElementById('candidatesSection');
            if (candidatesSection && !document.getElementById('stvCandidateNote')) {
                const note = document.createElement('p');
                note.id = 'stvCandidateNote';
                note.style.cssText = 'color: #666; font-size: 0.9em; font-style: italic; margin-top: 10px;';
                note.textContent = '💡 Tip: You can add specific famous candidates here; otherwise, the system will generate generic ones during calculation.';
                candidatesSection.querySelector('.input-group').after(note);
            }
        } else {
            autoGenButton.style.display = 'inline-block';
            // Remove STV note if switching away from STV
            const stvNote = document.getElementById('stvCandidateNote');
            if (stvNote) stvNote.remove();
        }
    }
    
    updateVotingInputs();
    
    // NEW: Show/hide manual seat override section
    const manualSeatSection = document.getElementById('manualSeatOverrideSection');
    if (manualSeatSection) {
        if (system === 'mmp' || system === 'parallel') {
            manualSeatSection.style.display = 'block';
        } else {
            manualSeatSection.style.display = 'none';
            // Reset manual mode if switching away
            electionState.isManualSeatMode = false;
            const toggle = document.getElementById('manualSeatOverrideToggle');
            if (toggle) toggle.checked = false;
        }
    }
    
    // NEW: Show/hide threshold & bypass container (MMP only)
    try {
        const thresholdBypassContainer = document.getElementById('thresholdBypassContainer');
        if (thresholdBypassContainer) {
            if (system === 'mmp') {
                thresholdBypassContainer.style.display = 'block';
                // Initialize bypass threshold from state
                const bypassThresholdInput = document.getElementById('bypassThresholdInput');
                if (bypassThresholdInput) {
                    bypassThresholdInput.value = electionState.bypassThreshold || 1;
                }
            } else {
                thresholdBypassContainer.style.display = 'none';
            }
        }
    } catch (e) {
        console.warn('Error updating thresholdBypassContainer:', e);
    }
    
    // NEW: Show/hide overhang & compensation container (MMP only)
    try {
        const overhangCompensationContainer = document.getElementById('overhangCompensationContainer');
        if (overhangCompensationContainer) {
            if (system === 'mmp') {
                overhangCompensationContainer.style.display = 'block';
                // Initialize full compensation toggle state based on overhang
                const enableOverhangToggle = document.getElementById('enableOverhangToggle');
                const enableFullCompensationToggle = document.getElementById('enableFullCompensationToggle');
                const fullCompensationLabel = document.getElementById('fullCompensationLabel');
                if (enableOverhangToggle && enableFullCompensationToggle && fullCompensationLabel) {
                    enableFullCompensationToggle.disabled = !enableOverhangToggle.checked;
                }
            } else {
                overhangCompensationContainer.style.display = 'none';
            }
        }
    } catch (e) {
        console.warn('Error updating overhangCompensationContainer:', e);
    }
    
    // NEW: Show/hide PR tier percentage container (Parallel only)
    try {
        const prTierPercentageContainer = document.getElementById('prTierPercentageContainer');
        if (prTierPercentageContainer) {
            if (system === 'parallel') {
                prTierPercentageContainer.style.display = 'block';
                // Initialize calculated seats display
                updateSeatsFromPRPercentage();
            } else {
                prTierPercentageContainer.style.display = 'none';
            }
        }
    } catch (e) {
        console.warn('Error updating prTierPercentageContainer:', e);
    }
    
    // Auto-generate candidates for MMP/MMM if needed
    autoGenerateMixedSystemCandidates();
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
            legislativeSpan.textContent = `🏛️ Multi-Member District`;
        }
    } else {
        // Default labels for other systems
        if (singleSpan) singleSpan.textContent = '🏁 Single Race (1 seat or district)';
        // For legislative label, always use getCustomSeatCount() regardless of current selection
        if (legislativeSpan) {
            const legislativeSeats = getCustomSeatCount();
            legislativeSpan.textContent = `🏛️ Entire Legislature`;
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
    
    // Show/hide MMP leveling toggle (only for MMP)
    const levelingContainer = document.getElementById('mmpLevelingContainer');
    if (levelingContainer) {
        levelingContainer.style.display = system === 'mmp' ? 'block' : 'none';
    }
    
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
    const system = document.getElementById('electoralSystem').value;
    
    if (raceType === 'single') {
        description.textContent = 'Single race: Simulate one electoral district or seat.';
        if (seatsContainer) seatsContainer.style.display = 'none';
    } else {
        description.textContent = 'Entire legislature: Simulate a full parliament with a custom number of seats.';
        if (seatsContainer) seatsContainer.style.display = 'flex';
    }
    
    // Hide Candidates section for FPTP in legislative mode
    const candidatesSection = document.getElementById('candidatesSection');
    if (system === 'fptp' && raceType === 'legislative') {
        candidatesSection.style.display = 'none';
        // Update section numbers: 2 (Parties), 3 (Voting)
        updateSectionNumbers(2, null, 3);
    } else if (system === 'fptp' && raceType === 'single') {
        candidatesSection.style.display = 'block';
        // Restore section numbers: 2 (Parties), 3 (Candidates), 4 (Voting)
        updateSectionNumbers(2, 3, 4);
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
    
    // Use setState instead of direct mutation
    setState({ parties: [...electionState.parties, party] });
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
    
    // Auto-generate candidate for MMP/MMM
    autoGenerateMixedSystemCandidates();
}

function removeParty(id) {
    // Use setState instead of direct mutation
    const updatedParties = electionState.parties.filter(p => p.id !== id);
    const updatedCandidates = electionState.candidates.filter(c => c.partyId !== id);
    
    const newState = {
        parties: updatedParties,
        candidates: updatedCandidates
    };
    
    // If all parties removed, clear country indicator
    if (updatedParties.length === 0) {
        newState.importedCountry = null;
    }
    
    setState(newState);
    
    if (updatedParties.length === 0) {
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
    if (!select) return; // Safety check
    
    // CRITICAL: Clear existing options first to prevent dropdown from growing
    select.innerHTML = '<option value="">Select Party</option>' + 
        parties.map(party => `<option value="${party.id}">${party.name}</option>`).join('');
}

function autoGenerateMixedSystemCandidates() {
    // Auto-generate one candidate per party for MMP/MMM systems
    const system = document.getElementById('electoralSystem').value;
    if (system !== 'mmp' && system !== 'parallel') return;
    
    // Check which parties need candidates
    parties.forEach(party => {
        const hasCandidate = candidates.some(c => c.partyId === party.id);
        if (!hasCandidate) {
            const candidateId = Date.now() + Math.random();
            candidates.push({
                id: candidateId,
                name: `${party.name} Candidate`,
                partyId: party.id
            });
        }
    });
    
    // Update UI to show the new candidate vote inputs
    updateVotingInputs();
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
    
    // Use setState instead of direct mutation
    setState({ candidates: [...electionState.candidates, candidate] });
    nameInput.value = '';
    partySelect.value = '';
    
    updateCandidatesList();
    updateVotingInputs();
}

function removeCandidate(id) {
    // Use setState instead of direct mutation
    setState({ candidates: electionState.candidates.filter(c => c.id !== id) });
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
    
    // Special case: FPTP Legislative Mode (aggregate entry)
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';

    if (system === 'fptp' && raceType === 'legislative') {
        // RISK MITIGATION #1: Clear any persisted candidate vote state when entering legislative mode
        // This prevents DOM/state sync issues when toggling between modes
        
        // Hide candidate section entirely - we're doing aggregate entry
        html += '<div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">';
        html += '<p style="margin: 0; color: #856404;"><strong>📊 Aggregate Mode:</strong> Enter total votes and seats won across all districts.</p>';
        html += '<p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">This mode demonstrates disproportionality in FPTP multi-seat elections.</p>';
        html += '</div>';
        
        // Section 1: Aggregate party votes
        html += '<div class="voting-input-section"><h4>Aggregate Party Votes</h4>';
        html += '<p style="margin-bottom: 10px; color: #666; font-style: italic;">Total votes received by each party across all districts</p>';
        
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
        
        // Section 2: Actual seats won
        html += '<div class="voting-input-section"><h4>Seats Won</h4>';
        html += '<p style="margin-bottom: 10px; color: #666; font-style: italic;">Number of seats actually won by each party</p>';
        
        parties.forEach(party => {
            html += `
                <div class="vote-input-row">
                    <label>
                        <span class="party-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${party.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${party.name}
                    </label>
                    <input type="number" min="0" value="0" id="fptp-seats-${party.id}" class="number-input" style="width: 100px;" oninput="validateFPTPSeatsTotal()" />
                </div>
            `;
        });
        
        // RISK MITIGATION #2: Add running total validator
        html += '<div id="fptp-seats-validator" style="margin-top: 15px; padding: 10px; border-radius: 8px; background: #f5f5f5;">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center;">';
        html += '<span style="font-weight: 600;">Total Seats Allocated:</span>';
        html += '<span id="fptp-seats-total" style="font-size: 1.2em; font-weight: bold;">0</span>';
        html += '</div>';
        html += '<div style="margin-top: 5px; font-size: 0.9em; color: #666;">';
        html += 'Expected: <span id="fptp-seats-expected">100</span> seats';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Add event listeners for number formatting
        document.querySelectorAll('.number-input').forEach(input => {
            input.addEventListener('blur', formatNumberInput);
            input.addEventListener('focus', function() {
                this.value = this.value.replace(/,/g, '');
            });
        });
        
        // Initialize validator
        validateFPTPSeatsTotal();
        
        return; // Exit early - don't show candidate inputs
    }
    
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
    // For STV (party-based), check parties; for IRV (candidate-based), check candidates
    const hasRequiredEntities = system === 'stv' 
        ? parties.length > 0 
        : candidates.length > 0;
    
    if (isRankingSystem && hasRequiredEntities) {
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

// Generate manual seat input fields for each party
function updateManualSeatInputs() {
    const container = document.getElementById('manualSeatInputGrid');
    if (!container) return;
    
    const system = document.getElementById('electoralSystem')?.value || electionState.system;
    const isParallel = system === 'parallel';
    
    let html = '<h4 style="margin: 0 0 15px 0;">Seats Won by Party</h4>';
    
    if (isParallel) {
        // For Parallel voting, show separate district and list inputs
        html += '<p style="margin-bottom: 10px; color: #666; font-size: 0.9em;">Enter district seats and list seats separately for each party.</p>';
        html += '<div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 10px; font-weight: 600; color: #667eea; padding: 5px;">';
        html += '<div>Party</div><div style="text-align: center;">District</div><div style="text-align: center;">List</div>';
        html += '</div>';
        
        parties.forEach(party => {
            const currentDistrictValue = electionState.manualDistrictSeats[party.id] || 0;
            const currentListValue = (electionState.manualSeats[party.id] || 0) - currentDistrictValue;
            
            html += `
                <div class="vote-input-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; align-items: center;">
                    <label style="display: flex; align-items: center;">
                        <span class="party-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${party.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${party.name}
                    </label>
                    <input type="number" min="0" max="1000" value="${currentDistrictValue}" 
                           id="manual-district-seats-${party.id}" 
                           class="number-input"
                           style="text-align: center;"
                           oninput="updateManualSeatTotal()" />
                    <input type="number" min="0" max="1000" value="${currentListValue}" 
                           id="manual-list-seats-${party.id}" 
                           class="number-input"
                           style="text-align: center;"
                           oninput="updateManualSeatTotal()" />
                </div>
            `;
        });
    } else {
        // For MMP, show single total seats input with direct mandate indicator
        parties.forEach(party => {
            const currentValue = electionState.manualSeats[party.id] || 0;
            const hasDirectMandate = currentValue > 0;
            const directMandateIndicator = hasDirectMandate 
                ? '<span title="Direct Mandate: Party has won electorate seats and bypasses threshold requirement" style="color: #28a745; font-weight: bold; margin-left: 8px;">✓ Direct Mandate</span>'
                : '';
            html += `
                <div class="vote-input-row">
                    <label>
                        <span class="party-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${party.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${party.name}${directMandateIndicator}
                    </label>
                    <input type="number" min="0" max="1000" value="${currentValue}" 
                           id="manual-seats-${party.id}" 
                           class="number-input"
                           oninput="updateManualSeatTotal()" />
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// Real-time validation of manual seat total
function updateManualSeatTotal() {
    const currentSystem = document.getElementById('electoralSystem')?.value || electionState.system;
    const isParallel = currentSystem === 'parallel';
    
    let total = 0;
    parties.forEach(party => {
        if (isParallel) {
            // For Parallel voting, sum district and list seats separately
            const districtInput = document.getElementById(`manual-district-seats-${party.id}`);
            const listInput = document.getElementById(`manual-list-seats-${party.id}`);
            const districtValue = districtInput ? (parseInt(districtInput.value) || 0) : 0;
            const listValue = listInput ? (parseInt(listInput.value) || 0) : 0;
            const totalValue = districtValue + listValue;
            
            electionState.manualDistrictSeats[party.id] = districtValue;
            electionState.manualSeats[party.id] = totalValue;
            total += totalValue;
        } else {
            // For MMP, use single total seats input
            const input = document.getElementById(`manual-seats-${party.id}`);
            if (input) {
                const value = parseInt(input.value) || 0;
                electionState.manualSeats[party.id] = value;
                total += value;
            }
        }
    });
    
    const system = document.getElementById('electoralSystem').value;
    const districtSeats = parseInt(document.getElementById('districtSeatsInput')?.value) || 0;
    const listSeats = parseInt(document.getElementById('listSeatsInput')?.value) || 0;
    const expectedTotal = districtSeats + listSeats;
    
    // Update display
    const totalDisplay = document.getElementById('manualSeatsTotal');
    const expectedDisplay = document.getElementById('expectedSeatsTotal');
    if (totalDisplay) totalDisplay.textContent = total;
    if (expectedDisplay) expectedDisplay.textContent = expectedTotal;
    
    // Show validation indicator
    const indicator = document.getElementById('seatValidationIndicator');
    if (indicator) {
        indicator.style.display = 'block';
        
        if (total === expectedTotal) {
            indicator.style.background = '#d4edda';
            indicator.style.borderLeft = '4px solid #2ecc71';
            indicator.style.color = '#155724';
            indicator.innerHTML = '✓ Seat total matches base parliament size';
        } else if (total < expectedTotal) {
            const diff = expectedTotal - total;
            indicator.style.background = '#fff3cd';
            indicator.style.borderLeft = '4px solid #ffc107';
            indicator.style.color = '#856404';
            indicator.innerHTML = `⚠ ${diff} seat${diff !== 1 ? 's' : ''} short of base size`;
        } else {
            const diff = total - expectedTotal;
            // Overhang is normal in MMP - show as info, not error
            indicator.style.background = '#e3f2fd';
            indicator.style.borderLeft = '4px solid #2196f3';
            indicator.style.color = '#1565c0';
            indicator.innerHTML = `ℹ ${diff} overhang seat${diff !== 1 ? 's' : ''} (Total: ${total}, Base: ${expectedTotal})`;
        }
    }
}

// Comprehensive validation check
function validateManualSeatsComprehensive() {
    const total = Object.values(electionState.manualSeats).reduce((sum, s) => sum + s, 0);
    const system = document.getElementById('electoralSystem').value;
    const districtSeats = parseInt(document.getElementById('districtSeatsInput')?.value) || 0;
    const listSeats = parseInt(document.getElementById('listSeatsInput')?.value) || 0;
    const expectedTotal = districtSeats + listSeats;
    
    let issues = [];
    
    // Check 1: Total seats match
    if (total !== expectedTotal) {
        issues.push(`Total seats (${total}) does not match expected parliament size (${expectedTotal})`);
    }
    
    // Check 2: No negative values
    parties.forEach(party => {
        const seats = electionState.manualSeats[party.id] || 0;
        if (seats < 0) {
            issues.push(`${party.name} has negative seats (${seats})`);
        }
    });
    
    // Check 3: At least one party has seats
    if (total === 0) {
        issues.push('No seats allocated to any party');
    }
    
    // Display results
    if (issues.length === 0) {
        alert('✓ Validation Passed\n\nAll seat allocations are valid:\n• Total matches expected parliament size\n• No negative values\n• All data is consistent');
    } else {
        alert('⚠ Validation Issues Found\n\n' + issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n'));
    }
}

// Show logic trace modal for manual seat mode
function showLogicTrace() {
    const results = window.lastCalculationResults;
    if (!results || !results.isManualMode) return;
    
    let traceHTML = '<div style="font-family: monospace; background: #f8f9fa; padding: 20px; border-radius: 8px;">';
    traceHTML += '<h3 style="margin: 0 0 15px 0;">Logic Trace: Calculated vs Manual Seats</h3>';
    traceHTML += '<table style="width: 100%; border-collapse: collapse;">';
    traceHTML += '<thead><tr style="background: #667eea; color: white;">';
    traceHTML += '<th style="padding: 10px; text-align: left;">Party</th>';
    traceHTML += '<th style="padding: 10px; text-align: right;">Vote %</th>';
    traceHTML += '<th style="padding: 10px; text-align: right;">Calculated Seats</th>';
    traceHTML += '<th style="padding: 10px; text-align: right;">Manual Seats</th>';
    traceHTML += '<th style="padding: 10px; text-align: right;">Difference</th>';
    traceHTML += '</tr></thead><tbody>';
    
    results.results.forEach(r => {
        const diffColor = r.seatDifference === 0 ? '#666' : (r.seatDifference > 0 ? '#2ecc71' : '#e74c3c');
        traceHTML += `<tr style="border-bottom: 1px solid #ddd;">`;
        traceHTML += `<td style="padding: 10px;">${r.name}</td>`;
        traceHTML += `<td style="padding: 10px; text-align: right;">${r.percentage.toFixed(1)}%</td>`;
        traceHTML += `<td style="padding: 10px; text-align: right;">${r.calculatedSeats}</td>`;
        traceHTML += `<td style="padding: 10px; text-align: right;">${r.seats}</td>`;
        traceHTML += `<td style="padding: 10px; text-align: right; color: ${diffColor}; font-weight: 600;">`;
        traceHTML += `${r.seatDifference > 0 ? '+' : ''}${r.seatDifference}`;
        traceHTML += `</td></tr>`;
    });
    
    traceHTML += '</tbody></table>';
    traceHTML += '<p style="margin-top: 15px; color: #666;">Differences show how manual entry diverges from system calculations.</p>';
    traceHTML += '</div>';
    
    // Display in modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000; max-width: 800px; max-height: 80vh; overflow: auto;';
    modal.innerHTML = traceHTML + '<button onclick="this.parentElement.remove(); document.querySelector(\'.logic-trace-backdrop\').remove()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">Close</button>';
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'logic-trace-backdrop';
    backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;';
    backdrop.onclick = () => { modal.remove(); backdrop.remove(); };
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

function validateFPTPSeatsTotal() {
    // Get expected total from legislature seats input
    const expectedSeats = parseInt(document.getElementById('totalLegislatureSeats')?.value) || 100;
    
    // Calculate actual total from all party seat inputs
    let actualTotal = 0;
    parties.forEach(party => {
        const seatInput = document.getElementById(`fptp-seats-${party.id}`);
        if (seatInput) {
            actualTotal += parseInt(seatInput.value) || 0;
        }
    });
    
    // Update display
    const totalDisplay = document.getElementById('fptp-seats-total');
    const expectedDisplay = document.getElementById('fptp-seats-expected');
    const validator = document.getElementById('fptp-seats-validator');
    
    if (totalDisplay) totalDisplay.textContent = actualTotal;
    if (expectedDisplay) expectedDisplay.textContent = expectedSeats;
    
    // Color code based on match
    if (validator) {
        if (actualTotal === expectedSeats && actualTotal > 0) {
            validator.style.background = '#d4edda';
            validator.style.borderLeft = '4px solid #28a745';
            totalDisplay.style.color = '#28a745';
        } else if (actualTotal === 0) {
            validator.style.background = '#f5f5f5';
            validator.style.borderLeft = '4px solid #ccc';
            totalDisplay.style.color = '#666';
        } else {
            validator.style.background = '#f8d7da';
            validator.style.borderLeft = '4px solid #dc3545';
            totalDisplay.style.color = '#dc3545';
        }
    }
}

function incrementBallotTypes() {
    const input = document.getElementById('numBallotTypes');
    const current = parseInt(input.value) || 3;
    const newValue = Math.min(20, current + 1);
    input.value = newValue;
    updateRankingBallots();
}

function decrementBallotTypes() {
    const input = document.getElementById('numBallotTypes');
    const current = parseInt(input.value) || 3;
    const newValue = Math.max(1, current - 1);
    input.value = newValue;
    updateRankingBallots();
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
        // For STV (party-based), use parties; for IRV (candidate-based), use candidates
        const currentSystem = document.getElementById('electoralSystem')?.value || '';
        const maxRanks = currentSystem === 'stv' 
            ? Math.min(parties.length, 5) 
            : Math.min(candidates.length, 5);
        for (let rank = 1; rank <= maxRanks; rank++) {
            const savedValue = existingValues[i]?.rankings[rank] || '';
            html += `
                <div class="ranking-row">
                    <label>${rank}${getOrdinalSuffix(rank)} choice:</label>
                    <select id="ballot-${i}-rank-${rank}" onchange="updateRankings()">
                        <option value="">--</option>
            `;
            
            // For STV, show parties instead of candidates (party-based ranking)
            const currentSystem = document.getElementById('electoralSystem')?.value || '';
            if (currentSystem === 'stv') {
                parties.forEach(party => {
                    const selected = savedValue == party.id ? ' selected' : '';
                    html += `<option value="${party.id}"${selected}>${party.name}</option>`;
                });
            } else {
                // For IRV, keep candidate-based ranking
                candidates.forEach(candidate => {
                    const party = parties.find(p => p.id === candidate.partyId);
                    const selected = savedValue == candidate.id ? ' selected' : '';
                    html += `<option value="${candidate.id}"${selected}>${candidate.name} (${party.name})</option>`;
                });
            }
            
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
    
    // Dispatch custom event when DOM is ready (for autofill)
    container.dispatchEvent(new CustomEvent('ballotsRendered'));
    
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
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 3;
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

// ===== ADAPTER LAYER (Bridge between UI and Engine) =====
// Helper function to collect ballots from UI
function collectBallotsFromUI(totalVotes) {
    const ballots = [];
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 5;
    
    for (let i = 0; i < numBallotTypes; i++) {
        const percentageInput = document.getElementById(`ballot-${i}-percentage`);
        if (percentageInput) {
            const percentage = parseFloat(percentageInput.value) || 0;
            if (percentage > 0) {
                // Convert percentage to actual ballot count
                const count = totalVotes > 0 ? Math.round((percentage / 100) * totalVotes) : 0;
                const ballot = { 
                    count: count, 
                    preferences: [],
                    weight: 1.0,  // For STV Gregory Method
                    currentPreference: 0  // Track which preference we're currently at
                };
                
                // Get preferences for this ballot
                // For STV, store party IDs; for IRV, store candidate IDs
                const currentSystem = document.getElementById('electoralSystem')?.value || '';
                for (let rank = 1; rank <= 5; rank++) {
                    const select = document.getElementById(`ballot-${i}-rank-${rank}`);
                    if (select && select.value) {
                        if (currentSystem === 'stv') {
                            // Store party ID as string for STV - FORCE to String to prevent type coercion
                            ballot.preferences.push(String(select.value));
                        } else {
                            // Store candidate ID as integer for IRV
                            ballot.preferences.push(parseInt(select.value));
                        }
                    }
                }
                
                if (ballot.preferences.length > 0 && count > 0) {
                    ballots.push(ballot);
                }
            }
        }
    }
    
    return ballots;
}

// Adapter function: Gathers all UI state and converts to calculation parameters
function adaptUIStateToCalculationParams() {
    const system = document.getElementById('electoralSystem').value;
    const votes = getVotes();
    const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
    const totalSeats = getSeatsCount();
    
    // Get discrete tier seats for MMP/MMM systems
    const districtSeatsInput = document.getElementById('districtSeatsInput');
    const listSeatsInput = document.getElementById('listSeatsInput');
    const districtSeats = districtSeatsInput ? (parseInt(districtSeatsInput.value) || 0) : (electionState.districtSeats || 0);
    const baseListSeats = listSeatsInput ? (parseInt(listSeatsInput.value) || 0) : (electionState.baseListSeats || 0);
    
    // Get threshold and allocation method (for PR systems)
    const threshold = parseFloat(document.getElementById('electoralThreshold')?.value) || 0;
    const allocationMethod = document.getElementById('allocationMethod')?.value || 'dhondt';
    
    // Get MMP leveling toggle (if exists) - keep for backward compatibility
    const levelingEnabled = document.getElementById('mmpLevelingToggle')?.checked || false;
    
    // NEW: Get bypass threshold, overhang, and full compensation settings
    const bypassThreshold = parseInt(document.getElementById('bypassThresholdInput')?.value) || electionState.bypassThreshold || 1;
    const enableOverhang = document.getElementById('enableOverhangToggle')?.checked ?? electionState.enableOverhangSeats ?? true;
    const enableFullCompensation = document.getElementById('enableFullCompensationToggle')?.checked || electionState.enableFullCompensation || false;
    
    // Get total voters and ballots (for ranking systems)
    const totalVotersInput = document.getElementById('totalVoters');
    const totalVoters = totalVotersInput ? parseFormattedNumber(totalVotersInput.value) : 0;
    const ballots = totalVoters > 0 ? collectBallotsFromUI(totalVoters) : [];
    const numBallotTypes = parseInt(document.getElementById('numBallotTypes')?.value) || 5;
    
    return {
        system: system,
        votes: votes,
        raceType: raceType,
        totalSeats: totalSeats,
        districtSeats: districtSeats,      // NEW: For MMP/MMM
        baseListSeats: baseListSeats,      // NEW: For MMP/MMM
        threshold: threshold,
        allocationMethod: allocationMethod,
        levelingEnabled: levelingEnabled,
        bypassThreshold: bypassThreshold,  // NEW: Bypass threshold for MMP
        enableOverhang: enableOverhang,    // NEW: Enable overhang seats
        enableFullCompensation: enableFullCompensation,  // NEW: Enable full compensation
        totalVoters: totalVoters,
        ballots: ballots,
        numBallotTypes: numBallotTypes
    };
}

// ===== UI LAYER (Orchestration) =====
function calculateResults() {
    // Step 1: Gather all UI state using adapter
    const params = adaptUIStateToCalculationParams();
    
    // Store for shadow results comparison
    window.lastCalculationSystem = params.system;
    window.lastCalculationVotes = params.votes;
    window.lastCalculationParams = params; // Store all params for STV comparison
    
    // For STV and IRV, also store ballots in votes object for comparison
    if ((params.system === 'stv' || params.system === 'irv') && params.ballots) {
        window.lastCalculationVotes.ballots = params.ballots;
    }
    
    // Step 2: Call pure calculation function
    let results;
    switch(params.system) {
        case 'fptp':
            const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
            
            if (raceType === 'legislative') {
                // Collect party seats from fptp-seats-{id} inputs
                const partySeats = {};
                let totalSeatsEntered = 0;
                
                parties.forEach(party => {
                    const seatsInput = document.getElementById(`fptp-seats-${party.id}`);
                    const seats = seatsInput ? parseInt(seatsInput.value) || 0 : 0;
                    partySeats[party.id] = seats;
                    totalSeatsEntered += seats;
                });
                
                // RISK MITIGATION #2: Validate total seats before calculating
                if (totalSeatsEntered !== params.totalSeats) {
                    alert(`Warning: Total seats entered (${totalSeatsEntered}) does not match legislature size (${params.totalSeats}). Please adjust the seat allocations.`);
                    return;
                }
                
                if (totalSeatsEntered === 0) {
                    alert('Please enter seat counts for at least one party.');
                    return;
                }
                
                results = calculateFPTP_Legislative(params.votes.parties, partySeats, params.totalSeats);
            } else {
                // Original single-race FPTP
                results = calculateFPTP(params.votes, params.totalSeats);
            }
            break;
        case 'irv':
            if (params.totalVoters === 0) {
                alert('Please enter the total number of voters');
                return;
            }
            // Global ballot validity check
            if (!params.ballots || params.ballots.length === 0) {
                alert('No ranking ballots defined. Please add at least one ballot type below.');
                return;
            }
            // Debug logging
            console.log('IRV Calculation Debug:', {
                totalVoters: params.totalVoters,
                ballotsCount: params.ballots.length,
                ballots: params.ballots
            });
            results = calculateIRV(params.votes, params.totalVoters, params.ballots, params.numBallotTypes);
            if (!results) {
                console.error('IRV calculation returned null');
                alert('IRV calculation failed. Please check your ballot data.');
                return; // Don't display if calculation failed
            }
            break;
        case 'party-list':
            results = calculatePartyListPR(params.votes, params.totalSeats, params.threshold, params.allocationMethod);
            break;
        case 'stv':
            if (params.totalVoters === 0) {
                alert('Please enter the total number of voters');
                return;
            }
            if (!params.ballots || params.ballots.length === 0) {
                alert('No ballot data found. Please fill in the ranking ballots section with party preferences and percentages.');
                return;
            }
            try {
                results = calculateSTV(params.votes, params.totalSeats, params.totalVoters, params.ballots, params.numBallotTypes);
                if (!results) {
                    console.error('STV calculation returned null');
                    alert('STV calculation failed. Please check your ballot data.');
                    return;
                }
            } catch (e) {
                console.error('STV Engine Error:', e);
                alert('STV Engine Error: ' + e.message);
                return;
            }
            break;
        case 'mmp':
            // Validate MMP input data
            if (!params.votes || !params.votes.parties || !params.votes.candidates) {
                console.error('MMP Calculation Error: Missing required vote data', {
                    hasVotes: !!params.votes,
                    hasParties: !!(params.votes && params.votes.parties),
                    hasCandidates: !!(params.votes && params.votes.candidates)
                });
                alert('MMP calculation requires both party votes and candidate votes. Please add parties and candidates.');
                return;
            }
            
            if (!params.districtSeats || !params.baseListSeats || (params.districtSeats + params.baseListSeats) < 1) {
                console.error('MMP Calculation Error: Invalid seat counts', { districtSeats: params.districtSeats, baseListSeats: params.baseListSeats });
                alert('Please set valid numbers for District Seats and List Seats.');
                return;
            }
            
            console.log('MMP Calculation Debug:', {
                districtSeats: params.districtSeats,
                baseListSeats: params.baseListSeats,
                totalSeats: params.districtSeats + params.baseListSeats,
                threshold: params.threshold,
                levelingEnabled: params.levelingEnabled,
                partiesCount: Object.keys(params.votes.parties).length,
                candidatesCount: Object.keys(params.votes.candidates).length
            });
            
            try {
                // Use enableFullCompensation instead of levelingEnabled for new logic
                const levelingEnabled = params.enableFullCompensation !== undefined ? params.enableFullCompensation : params.levelingEnabled;
                results = calculateMMP(
                    params.votes, 
                    params.districtSeats, 
                    params.baseListSeats, 
                    params.threshold, 
                    params.allocationMethod, 
                    levelingEnabled,
                    null,  // forcedDistrictWins
                    params.bypassThreshold || 1,  // NEW: bypass threshold
                    params.enableOverhang !== undefined ? params.enableOverhang : true  // NEW: enable overhang
                );
                
                if (!results) {
                    console.error('MMP calculation returned null');
                    alert('MMP calculation failed. Please check your party and candidate data.');
                    return;
                }
            } catch (error) {
                console.error('MMP Calculation Error:', error);
                alert('MMP calculation encountered an error: ' + error.message);
                return;
            }
            break;
        case 'parallel':
            // Validate Parallel input data
            if (!params.votes || !params.votes.parties || !params.votes.candidates) {
                console.error('Parallel Calculation Error: Missing required vote data', {
                    hasVotes: !!params.votes,
                    hasParties: !!(params.votes && params.votes.parties),
                    hasCandidates: !!(params.votes && params.votes.candidates)
                });
                alert('Parallel voting (MMM) requires both party votes and candidate votes. Please add parties and candidates.');
                return;
            }
            
            if (!params.districtSeats || !params.baseListSeats || (params.districtSeats + params.baseListSeats) < 1) {
                console.error('Parallel Calculation Error: Invalid seat counts', { districtSeats: params.districtSeats, baseListSeats: params.baseListSeats });
                alert('Please set valid numbers for District Seats and List Seats.');
                return;
            }
            
            console.log('Parallel Calculation Debug:', {
                districtSeats: params.districtSeats,
                baseListSeats: params.baseListSeats,
                totalSeats: params.districtSeats + params.baseListSeats,
                threshold: params.threshold,
                allocationMethod: params.allocationMethod,
                partiesCount: Object.keys(params.votes.parties).length,
                candidatesCount: Object.keys(params.votes.candidates).length
            });
            
            try {
                results = calculateParallel(params.votes, params.districtSeats, params.baseListSeats, params.threshold, params.allocationMethod);
            } catch (error) {
                console.error('Parallel calculation encountered an error:', error.message);
                alert('Parallel/MMM calculation failed: ' + error.message);
                return;
            }
            break;
    }
    
    // Store results for shadow comparison
    window.lastCalculationResults = results;
    
    // For STV results, extract ballots from results if available and store in votes
    if (params.system === 'stv' && results && results.ballots) {
        window.lastCalculationVotes.ballots = results.ballots;
    }
    
    // Step 3: Display results
    displayResults(results, params.system);
}

// ===== ENGINE LAYER (Pure Functions) =====
function calculateFPTP(votes, totalSeats) {
    // Pure function - no DOM access
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

function calculateFPTP_Legislative(partyVotes, partySeats, totalSeats) {
    // Calculate vote shares and seat shares
    const totalVotes = Object.values(partyVotes).reduce((sum, v) => sum + v, 0);
    const totalSeatsWon = Object.values(partySeats).reduce((sum, v) => sum + v, 0);
    
    const results = parties.map(party => {
        const votes = partyVotes[party.id] || 0;
        const seats = partySeats[party.id] || 0;
        const voteShare = totalVotes > 0 ? (votes / totalVotes * 100) : 0;
        const seatShare = totalSeatsWon > 0 ? (seats / totalSeatsWon * 100) : 0;
        const bonus = seatShare - voteShare; // Seat bonus/penalty
        
        return {
            name: party.name,
            party: party.name,
            color: party.color,
            votes: votes,
            seats: seats,
            votePercentage: voteShare,
            seatPercentage: seatShare,
            bonus: bonus
        };
    });
    
    // RISK MITIGATION #3: Filter out parties with 0 votes AND 0 seats for cleaner charts
    // But keep parties with 0 in one column but not the other (important for analysis)
    const filteredResults = results.filter(r => r.votes > 0 || r.seats > 0);
    
    filteredResults.sort((a, b) => b.seats - a.seats);
    
    // Calculate Loosemore-Hanby Index (disproportionality measure)
    const loosemoreHanby = filteredResults.reduce((sum, r) => 
        sum + Math.abs(r.seatPercentage - r.votePercentage), 0
    ) / 2;
    
    // Calculate Gallagher Index (disproportionality measure)
    const gallagherIndex = Math.sqrt(
        filteredResults.reduce((sum, r) => sum + Math.pow(r.seatPercentage - r.votePercentage, 2), 0) / 2
    );
    
    return {
        type: 'fptp-legislative',
        parties: filteredResults,
        totalVotes: totalVotes,
        totalSeats: totalSeatsWon,
        expectedSeats: totalSeats,  // Add expected for validation
        disproportionality: loosemoreHanby,  // Loosemore-Hanby Index
        gallagher: gallagherIndex,  // Gallagher Index (changed from gallagherIndex for consistency)
        gallagherIndex: gallagherIndex.toFixed(2),  // Keep for backward compatibility
        note: `FPTP Legislative Analysis: ${totalSeatsWon} seats distributed across ${parties.length} parties. Gallagher Index: ${gallagherIndex.toFixed(2)} (measures disproportionality - 0 is perfect proportionality, >20 is very disproportional).`
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

function calculateIRV(votes, totalVoters, ballots, numBallotTypes) {
    // Pure function - no DOM access
    console.log('calculateIRV called with:', { totalVoters, ballotsCount: ballots?.length, numBallotTypes });
    
    if (totalVoters === 0) {
        // Return null to signal error (UI layer will handle alert)
        console.warn('calculateIRV: totalVoters is 0');
        return null;
    }
    
    // Check if we have ranking data
    const hasRankingData = ballots && ballots.length > 0;
    console.log('calculateIRV: hasRankingData =', hasRankingData);
    
    // If no ranking data, auto-inject "Sincere Vote" ballots from candidate votes
    if (!hasRankingData || ballots.length === 0) {
        console.warn('calculateIRV: No ranking data, auto-injecting sincere vote ballots');
        // Create ballots from candidate votes: each candidate gets a ballot with only themselves ranked
        const syntheticBallots = [];
        candidates.forEach(candidate => {
            const voteCount = votes.candidates[candidate.id] || 0;
            if (voteCount > 0) {
                syntheticBallots.push({
                    preferences: [candidate.id],
                    count: voteCount,
                    weight: 1.0,
                    currentPreference: 0
                });
            }
        });
        
        // Use synthetic ballots for calculation
        ballots = syntheticBallots;
        console.log('calculateIRV: Created', syntheticBallots.length, 'sincere vote ballots');
    }
    
    // Now proceed with IRV calculation using ballots
    if (!ballots || ballots.length === 0) {
        console.error('calculateIRV: Still no ballots after auto-injection');
        return null;
    }
    
    // Calculate total ballots for exhausted ballot tracking
    const totalBallots = ballots.reduce((sum, b) => sum + (b.count || 0), 0);
    
    // Run IRV with full ranking data
    const candidateIds = candidates.map(c => c.id);
    const eliminated = new Set();
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

function calculatePartyListPR(votes, totalSeats, threshold, allocationMethod) {
    // Pure function - no DOM access
    const totalVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    const seats = totalSeats;
    
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
    } else if (allocationMethod === 'hare') {
        allocatedSeats = allocateSeats_HareLR(partyVotes, seats);
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

function calculateSTV(votes, seats, totalVoters, ballots, numBallotTypes) {
    // Pure function - no DOM access
    if (totalVoters === 0) {
        // Return null to signal error (UI layer will handle alert)
        return null;
    }
    
    // Check if we have ranking data
    const hasRankingData = ballots && ballots.length > 0;
    
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
    // INTEGER SCALING: Multiply by 100,000 to preserve precision (5 decimal places)
    const SCALE_FACTOR = 100000;
    
    // For STV system, always use party-based logic
    // This is more reliable than checking ballot structure due to JavaScript type coercion
    const currentSystem = document.getElementById('electoralSystem')?.value || '';
    const isPartyBasedSTV = currentSystem === 'stv';
    
    console.log('STV Calculation Debug:', {
        system: currentSystem,
        isPartyBasedSTV: isPartyBasedSTV,
        ballotsCount: ballots.length,
        firstBallotPreferences: ballots[0]?.preferences,
        firstPreferenceType: typeof ballots[0]?.preferences[0],
        partiesCount: parties.length,
        candidatesCount: candidates.length
    });
    
    // Expand ballots: Each ballot type becomes multiple individual ballots
    const scaledBallots = ballots.flatMap((ballot, ballotTypeIndex) => {
        const count = ballot.count || 0;
        const numBallots = Math.round(count); // Number of individual ballots to create
        
        // Create one ballot object per voter
        return Array.from({ length: numBallots }, (_, voterIndex) => ({
            preferences: [...ballot.preferences], // Copy preferences
            weight: SCALE_FACTOR, // Each ballot has unit weight (scaled)
            currentPreference: 0,
            id: `ballot-${ballotTypeIndex}-${voterIndex}` // Unique ID per voter
        }));
    });
    
    console.log(`Expanded ${ballots.length} ballot types into ${scaledBallots.length} individual ballots`);
    
    // Calculate total votes (integer)
    const totalVotesScaled = scaledBallots.reduce((sum, b) => sum + b.weight, 0);
    
    // DROOP QUOTA: Calculated once at start with integer math
    const quotaScaled = Math.floor(totalVotesScaled / (seats + 1)) + 1;
    const quota = quotaScaled / SCALE_FACTOR; // For display only
    
    // ============================================
    // PARTY-BASED STV LOGIC
    // ============================================
    if (isPartyBasedSTV) {
        // Count manually-added candidates per party
        const manuallyAddedCandidatesPerParty = {};
        candidates.forEach(candidate => {
            if (!candidate.isGenerated) { // Only count manually-added candidates
                manuallyAddedCandidatesPerParty[candidate.partyId] = 
                    (manuallyAddedCandidatesPerParty[candidate.partyId] || 0) + 1;
            }
        });
        
        // Helper function to generate candidates for parties
        function generateCandidateForParty(party, candidateNumber, reason) {
            // reason: 'no-candidates' (party had 0 manually-added candidates)
            //         'insufficient' (party had some but not enough candidates)
            return {
                id: `generated-${party.id}-${candidateNumber}`,
                name: `${party.name} Candidate ${candidateNumber}`,
                partyId: party.id,
                party: party.name,
                color: party.color,
                isGenerated: true,
                generationReason: reason, // Track why candidate was generated
                displayName: `${party.name} Candidate ${candidateNumber}` // CRITICAL: prevent ID-as-Name bug
            };
        }
        
        // Helper function to get next candidate for a party (manual or generated)
        function getNextCandidateForParty(party, seatNumber) {
            // 1. Look for manual candidates first (not yet elected)
            const manualCands = candidates.filter(c => 
                c.partyId.toString() === party.id.toString() && 
                !c.isGenerated &&
                !electedCandidates.includes(c.id)
            );
            
            if (manualCands.length > 0 && manualCands[0]) {
                return { 
                    ...manualCands[0], 
                    isGenerated: false,
                    displayName: manualCands[0].name 
                };
            }
            
            // 2. Fallback to generation
            const manuallyAddedCount = candidates.filter(c => 
                c.partyId.toString() === party.id.toString() && 
                !c.isGenerated
            ).length;
            
            return {
                id: `gen-${party.id}-${seatNumber}-${Date.now()}`,
                name: `${party.name} Candidate ${seatNumber}`,
                partyId: party.id,
                party: party.name,
                color: party.color,
                isGenerated: true,
                generationReason: manuallyAddedCount === 0 ? 'no-candidates' : 'insufficient',
                displayName: `${party.name} Candidate ${seatNumber}`
            };
        }
        
        // Track party vote counts and election status
        const partyVoteCountsScaled = {};
        const partySeatsWon = {}; // Track seats won per party
        const electedParties = []; // Parties that have been elected
        const eliminatedParties = new Set(); // Parties eliminated
        const allCandidates = [...candidates]; // All candidates (manually-added + generated)
        const electedCandidates = []; // Track which candidates are elected
        const roundsData = [];
        let roundNumber = 0;
        let exhaustedVotesScaled = 0;
        
        // NEW: Track running tally that persists across rounds
        const runningTally = {};
        parties.forEach(party => {
            runningTally[party.id] = 0;
        });
        
        // Track which ballots are locked to elected candidates (using ballot IDs)
        const lockedBallotIds = new Set(); // Set of ballot IDs that are quota-locked
        const ballotLockMap = new Map(); // ballotId -> { candidateId, lockedWeight }
        
        // Initialize party vote counts
        parties.forEach(party => {
            partyVoteCountsScaled[party.id] = 0;
            partySeatsWon[party.id] = 0;
        });
        
        // Main STV loop - operate on parties
        while (electedCandidates.length < seats && eliminatedParties.size < parties.length) {
            roundNumber++;
            
            // Diagnostic logging
            console.log(`=== Round ${roundNumber} Start ===`);
            console.log(`Total ballots: ${scaledBallots.length}, Locked: ${lockedBallotIds.size}, Elected: ${electedCandidates.length}/${seats}`);
            
            // Count current votes for each party based on ballot weights
            // ONLY count ballots that are NOT quota-locked
            const currentPartyVotesScaled = {};
            parties.forEach(party => {
                if (!eliminatedParties.has(party.id)) {
                    currentPartyVotesScaled[party.id] = 0;
                }
            });
            exhaustedVotesScaled = 0;
            
            scaledBallots.forEach((ballot, ballotIndex) => {
                // CRITICAL: Skip ballots that are quota-locked to elected candidates
                if (lockedBallotIds.has(ballot.id)) {
                    return; // This ballot's quota portion is already allocated
                }
                
                // Handle empty ballots
                if (ballot.preferences.length === 0) {
                    exhaustedVotesScaled += ballot.weight;
                    return;
                }
                
                // Find first non-eliminated party preference
                const startIndex = ballot.currentPreference !== undefined ? ballot.currentPreference : 0;
                let assigned = false;
                
                for (let i = startIndex; i < ballot.preferences.length; i++) {
                    const partyId = ballot.preferences[i];
                    if (!eliminatedParties.has(partyId)) {
                        // Count the ballot's current weight
                        currentPartyVotesScaled[partyId] = (currentPartyVotesScaled[partyId] || 0) + ballot.weight;
                        ballot.currentPreference = i;
                        assigned = true;
                        break;
                    }
                }
                
                if (!assigned) {
                    exhaustedVotesScaled += ballot.weight;
                    ballot.currentPreference = ballot.preferences.length; // Mark as exhausted
                }
            });
            
            // Update running tally
            Object.keys(currentPartyVotesScaled).forEach(partyId => {
                runningTally[partyId] = currentPartyVotesScaled[partyId];
                partyVoteCountsScaled[partyId] = currentPartyVotesScaled[partyId];
            });
            
            // Diagnostic: Show party tallies
            const partyTallies = {};
            Object.entries(currentPartyVotesScaled).forEach(([id, votes]) => {
                const party = parties.find(p => p.id == id);  // Use == for type-coercion comparison (string vs number)
                partyTallies[party ? party.name : id] = (votes / SCALE_FACTOR).toFixed(2);
            });
            console.log(`Party tallies:`, partyTallies);
            console.log(`Exhausted: ${(exhaustedVotesScaled / SCALE_FACTOR).toFixed(2)}`);
            
            // DEBUG: Track total votes in system to detect leaks
            const currentTotalVotes = Object.values(currentPartyVotesScaled).reduce((sum, v) => sum + v, 0) + exhaustedVotesScaled;
            console.log(`Round ${roundNumber}: Total Active Votes in System = ${(currentTotalVotes / SCALE_FACTOR).toFixed(2)}`);
            
            // Check if any party meets quota
            const activeParties = parties.filter(p => 
                !eliminatedParties.has(p.id)
            );
            const partiesAboveQuota = activeParties.filter(p => 
                (partyVoteCountsScaled[p.id] || 0) >= quotaScaled
            );
            
            if (partiesAboveQuota.length > 0) {
                // Elect party with most votes
                const winnerParty = partiesAboveQuota.reduce((a, b) => 
                    (partyVoteCountsScaled[a.id] || 0) > (partyVoteCountsScaled[b.id] || 0) ? a : b
                );
                
                // Determine candidate to elect
                partySeatsWon[winnerParty.id] = (partySeatsWon[winnerParty.id] || 0) + 1;
                const seatNumber = partySeatsWon[winnerParty.id];
                const electedCandidate = getNextCandidateForParty(winnerParty, seatNumber);
                
                if (!allCandidates.find(c => c.id === electedCandidate.id)) {
                    allCandidates.push(electedCandidate);
                }
                
                electedCandidates.push(electedCandidate.id);
                
                // CRITICAL: Lock ballots that contribute to this candidate's quota
                const totalVotesForWinner = partyVoteCountsScaled[winnerParty.id];
                let weightToLock = quotaScaled;
                let weightLocked = 0;
                const ballotsContributing = [];
                
                // Identify ballots currently supporting winner party
                scaledBallots.forEach((ballot, index) => {
                    if (lockedBallotIds.has(ballot.id)) return; // Already locked
                    if (ballot.preferences.length === 0) return;
                    
                    const currentPrefIndex = ballot.currentPreference !== undefined ? ballot.currentPreference : 0;
                    if (currentPrefIndex >= ballot.preferences.length) return;
                    
                    const currentPref = ballot.preferences[currentPrefIndex];
                    
                    if (currentPref == winnerParty.id) {  // Use == for type-coercion comparison (string vs number)
                        ballotsContributing.push({
                            id: ballot.id,
                            weight: ballot.weight,
                            ballot: ballot
                        });
                    }
                });
                
                console.log(`Electing ${electedCandidate.displayName}: need to lock ${quotaScaled/SCALE_FACTOR} votes from ${ballotsContributing.length} ballots`);
                
                // Lock ballots up to quota amount
                const surplusScaled = Math.max(0, totalVotesForWinner - quotaScaled);
                let surplusExhaustedScaled = 0;
                let ballotsFullyLocked = 0;
                let ballotsPartiallyLocked = 0;
                
                for (const ballotInfo of ballotsContributing) {
                    if (weightLocked >= quotaScaled) break; // Quota filled
                    
                    const weightNeeded = quotaScaled - weightLocked;
                    const weightFromThisBallot = Math.min(ballotInfo.weight, weightNeeded);
                    
                    if (weightFromThisBallot >= ballotInfo.weight) {
                        // Fully lock this ballot
                        lockedBallotIds.add(ballotInfo.id);
                        ballotLockMap.set(ballotInfo.id, {
                            candidateId: electedCandidate.id,
                            lockedWeight: ballotInfo.weight
                        });
                        weightLocked += ballotInfo.weight;
                        ballotsFullyLocked++;
                        
                        // Ballot is fully consumed - can't transfer anywhere
                        ballotInfo.ballot.weight = 0;
                    } else {
                        // Partially lock - ballot has surplus
                        const surplusWeight = ballotInfo.weight - weightFromThisBallot;
                        
                        // Lock the quota portion
                        lockedBallotIds.add(ballotInfo.id);
                        ballotLockMap.set(ballotInfo.id, {
                            candidateId: electedCandidate.id,
                            lockedWeight: weightFromThisBallot
                        });
                        weightLocked += weightFromThisBallot;
                        ballotsPartiallyLocked++;
                        
                        // Create a NEW ballot for the surplus with next preference
                        const surplusBallot = {
                            preferences: [...ballotInfo.ballot.preferences],
                            weight: surplusWeight,
                            currentPreference: ballotInfo.ballot.currentPreference,
                            id: `surplus-${ballotInfo.id}` // Simpler ID for surplus
                        };
                        
                        // Move surplus ballot to next preference
                        let movedToNext = false;
                        const currentPrefIndex = surplusBallot.currentPreference !== undefined ? surplusBallot.currentPreference : 0;
                        for (let i = currentPrefIndex + 1; i < surplusBallot.preferences.length; i++) {
                            const nextPartyId = surplusBallot.preferences[i];
                            if (!eliminatedParties.has(nextPartyId)) {
                                surplusBallot.currentPreference = i;
                                scaledBallots.push(surplusBallot); // Add as new ballot with unique ID
                                movedToNext = true;
                                break;
                            }
                        }
                        
                        if (!movedToNext) {
                            surplusExhaustedScaled += surplusWeight;
                        }
                        
                        // Original ballot is now fully locked (weight set to 0 to prevent recount)
                        ballotInfo.ballot.weight = 0;
                    }
                }
                
                exhaustedVotesScaled += surplusExhaustedScaled;
                
                console.log(`Locked ${ballotsFullyLocked} ballots fully, ${ballotsPartiallyLocked} partially. Total locked: ${weightLocked/SCALE_FACTOR}, surplus exhausted: ${surplusExhaustedScaled/SCALE_FACTOR}`);
                
                // Record round data
                const voteCounts = {};
                parties.forEach(party => {
                    voteCounts[party.id] = (partyVoteCountsScaled[party.id] || 0) / SCALE_FACTOR;
                });
                
                roundsData.push({
                    round: roundNumber,
                    voteCounts: voteCounts,
                    quota: quota,
                    party_id: winnerParty.id,
                    candidate_id: electedCandidate.id,
                    candidate_name: electedCandidate.name || electedCandidate.displayName,
                    party_name: winnerParty.name,
                    seat_number: seatNumber,
                    action: 'elected',
                    votes: totalVotesForWinner,
                    surplus: surplusScaled / SCALE_FACTOR,
                    quotaLocked: weightLocked / SCALE_FACTOR,
                    ballotsFullyLocked: ballotsFullyLocked,
                    ballotsPartiallyLocked: ballotsPartiallyLocked,
                    surplusExhausted: surplusExhaustedScaled / SCALE_FACTOR
                });
                
                continue; // Start next round
            } else {
                // Eliminate party with fewest votes
                const minVotesScaled = Math.min(...activeParties.map(p => partyVoteCountsScaled[p.id] || 0));
                const toEliminate = activeParties.find(p => partyVoteCountsScaled[p.id] === minVotesScaled);
                
                if (toEliminate) {
                    eliminatedParties.add(String(toEliminate.id));  // Store as string to match ballot preferences
                    
                    // Transfer eliminated party's ballots to next preferences
                    scaledBallots.forEach(ballot => {
                        if (ballot.preferences.length === 0) return;
                        const currentPref = ballot.preferences[ballot.currentPreference];
                        if (currentPref == toEliminate.id) {  // Use == for type-coercion comparison (string vs number)
                            // Find next valid preference
                            let nextPrefFound = false;
                            for (let i = ballot.currentPreference + 1; i < ballot.preferences.length; i++) {
                                const nextPref = ballot.preferences[i];
                                if (!eliminatedParties.has(nextPref)) {
                                    ballot.currentPreference = i;
                                    nextPrefFound = true;
                                    break;
                                }
                            }
                            
                            // If no next preference, ballot is exhausted
                            if (!nextPrefFound) {
                                exhaustedVotesScaled += ballot.weight;
                            }
                        }
                    });
                    
                    // Convert to display values
                    const voteCounts = {};
                    parties.forEach(party => {
                        voteCounts[party.id] = (partyVoteCountsScaled[party.id] || 0) / SCALE_FACTOR;
                    });
                    
                    roundsData.push({
                        round: roundNumber,
                        voteCounts: voteCounts,
                        quota: quota,
                        party_id: toEliminate.id,
                        action: 'eliminated'
                    });
                } else {
                    break;
                }
            }
            
            // Safety check
            const maxRounds = (parties.length * seats) + 100;
            if (roundNumber > maxRounds) {
                console.warn(`STV: Maximum rounds (${maxRounds}) reached for ${seats} seats with ${parties.length} parties`);
                break;
            }
        }
        
        // Build results from all candidates
        const totalVotes = totalVotesScaled / SCALE_FACTOR;
        const exhaustedVotes = exhaustedVotesScaled / SCALE_FACTOR;
        const exhaustedPercentage = totalVotes > 0 ? (exhaustedVotes / totalVotes * 100) : 0;
        
        const results = allCandidates.map(candidate => {
            const party = parties.find(p => p.id.toString() === candidate.partyId.toString());
            const isElected = electedCandidates.includes(candidate.id);
            
            // Determine vote count based on election status
            let candidateVotes;
            let voteStatus = '';
            
            if (isElected) {
                // Elected candidates show exactly 1.00 quota (locked)
                candidateVotes = quota;
                voteStatus = 'Quota Locked';
            } else {
                // Non-elected candidates use running tally (current party vote count after all transfers)
                candidateVotes = (runningTally[party.id] || 0) / SCALE_FACTOR;
                voteStatus = 'Active Remainder';
            }
            
            return {
                id: candidate.id,
                name: candidate.displayName || candidate.name, // Use displayName to prevent ID display
                party: party.name,
                color: party.color,
                votes: candidateVotes,
                percentage: totalVotes > 0 ? (candidateVotes / totalVotes * 100) : 0,
                elected: isElected,
                meetsQuota: isElected,
                voteStatus: voteStatus, // For debugging/transparency
                isGenerated: candidate.isGenerated || false,
                generationReason: candidate.generationReason || null
            };
        });
        
        results.sort((a, b) => {
            if (a.elected && !b.elected) return -1;
            if (!a.elected && b.elected) return 1;
            return b.votes - a.votes;
        });
        
        // Vote Conservation Test - verify no votes leaked
        const totalLockedWeight = Array.from(ballotLockMap.values())
            .reduce((sum, lock) => sum + lock.lockedWeight, 0);
        
        const totalActiveWeight = Object.values(runningTally).reduce((sum, v) => sum + v, 0);
        
        const totalVotesInSystem = totalLockedWeight + totalActiveWeight + exhaustedVotesScaled;
        
        const expectedVotes = totalVoters * SCALE_FACTOR;
        const voteDifference = Math.abs(totalVotesInSystem - expectedVotes);
        const allowedError = seats * 100; // Larger tolerance for rounding
        
        if (voteDifference > allowedError) {
            console.error(`❌ Vote Conservation FAILED: Expected ${expectedVotes/SCALE_FACTOR}, got ${totalVotesInSystem/SCALE_FACTOR}, difference ${voteDifference/SCALE_FACTOR}`);
            console.error(`  - Locked: ${totalLockedWeight/SCALE_FACTOR}, Active: ${totalActiveWeight/SCALE_FACTOR}, Exhausted: ${exhaustedVotesScaled/SCALE_FACTOR}`);
        } else {
            console.log(`✅ Vote Conservation: ${(totalVotesInSystem / SCALE_FACTOR).toFixed(2)} votes preserved`);
            console.log(`  - Locked: ${(totalLockedWeight/SCALE_FACTOR).toFixed(2)}, Active: ${(totalActiveWeight/SCALE_FACTOR).toFixed(2)}, Exhausted: ${(exhaustedVotesScaled/SCALE_FACTOR).toFixed(2)}`);
        }
        
        // Store ballots for shadow comparison
        const resultBallots = scaledBallots.map(b => ({
            preferences: [...b.preferences],
            count: b.weight / SCALE_FACTOR,
            weight: 1.0
        }));
        
        // Calculate disproportionality using FINAL ROUND vote totals (after all transfers)
        // This is critical for accurate comparisons - we use where votes ended up, not where they started
        // IMPORTANT: Handle SCALE_FACTOR correctly to avoid mixing scaled/unscaled values

        const voteShares = {};
        const seatShares = {};
        const partySeats = {}; // Count seats per party

        // Count seats per party from elected candidates
        results.forEach(r => {
            if (r.elected) {
                const partyName = r.party;
                partySeats[partyName] = (partySeats[partyName] || 0) + 1;
            }
        });

        // Calculate effective votes (total votes minus exhausted)
        // CRITICAL: Both totalVotes and exhaustedVotes are already descaled at lines 2603-2604
        const effectiveVotes = totalVotes - exhaustedVotes;

        // Calculate vote shares from FINAL running tally (not first preferences)
        parties.forEach(party => {
            // CRITICAL: runningTally contains scaled integers, must divide by SCALE_FACTOR
            const finalVotesScaled = runningTally[party.id] || 0;
            const finalVotes = finalVotesScaled / SCALE_FACTOR;
            const partyId = party.id.toString();
            
            // Calculate as percentage of effective votes (excluding exhausted)
            voteShares[partyId] = effectiveVotes > 0 ? (finalVotes / effectiveVotes * 100) : 0;
            seatShares[partyId] = seats > 0 ? ((partySeats[party.name] || 0) / seats * 100) : 0;
        });

        const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
        const gallagher = calculateGallagher(voteShares, seatShares);
        
        return {
            type: 'multi-winner',
            results: results,
            totalVotes: totalVotes,
            seats: seats,
            quota: quota,
            exhaustedVotes: exhaustedVotes,
            exhaustedPercentage: exhaustedPercentage,
            surplusLoss: exhaustedVotes,
            rounds: roundsData,
            ballots: resultBallots,
            otherNotes: [], // Will be populated in displayResults
            disproportionality: disproportionality,  // NEW
            gallagher: gallagher,  // NEW
            finalVoteShares: voteShares,  // NEW - for comparison logic
            note: `Single Transferable Vote (Party-Based) with Gregory Method surplus transfer using integer scaling for precision (Quota: ${quota.toFixed(2)} votes)` +
                  (exhaustedVotes > 0 ? `. ${formatNumber(exhaustedVotes)} ballots (${exhaustedPercentage.toFixed(1)}%) exhausted with no remaining valid preferences.` : '')
        };
    }
    
    // ============================================
    // CANDIDATE-BASED STV LOGIC (for IRV compatibility)
    // ============================================
    const candidateIds = candidates.map(c => c.id);
    let elected = [];
    let eliminated = new Set();
    const roundsData = []; // Track rounds for visualization
    let roundNumber = 0;
    let exhaustedVotesScaled = 0; // Track exhausted ballots (integer)
    
    // Running tally: tracks current vote counts for active candidates (updated each round)
    const runningTally = {};
    candidateIds.forEach(id => runningTally[id] = 0);
    
    // Final tally: tracks quota-locked votes for elected candidates
    const finalTally = {};
    candidateIds.forEach(id => finalTally[id] = 0);
    
    // Quota locked: tracks how much weight was locked to each elected candidate
    const quotaLocked = {};
    candidateIds.forEach(id => quotaLocked[id] = 0);
    
    // Elimination tracking: records when each candidate was eliminated
    const eliminationRound = {};
    const finalVoteCounts = {}; // Store vote count at elimination
    
    // Run rounds until all seats filled or no more candidates
    while (elected.length < seats && eliminated.size + elected.length < candidateIds.length) {
        roundNumber++;
        
        // Count current votes (integer math)
        const voteCountsScaled = {};
        candidateIds.forEach(id => voteCountsScaled[id] = 0);
        exhaustedVotesScaled = 0; // Reset each round
        
        scaledBallots.forEach(ballot => {
            // Handle empty ballots (no preferences at all)
            if (ballot.preferences.length === 0) {
                exhaustedVotesScaled += ballot.weight; // Already integer
                return;
            }
            
            // Find first non-eliminated, non-elected preference
            // Start from currentPreference if set, otherwise from 0
            const startIndex = ballot.currentPreference !== undefined ? ballot.currentPreference : 0;
            let assigned = false;
            
            for (let i = startIndex; i < ballot.preferences.length; i++) {
                const prefId = ballot.preferences[i];
                if (!eliminated.has(prefId) && !elected.includes(prefId)) {
                    voteCountsScaled[prefId] += ballot.weight;  // Integer addition
                    ballot.currentPreference = i; // Track which preference we're on
                    assigned = true;
                    break;
                }
            }
            
            // If no valid preference found, ballot is exhausted
            if (!assigned) {
                exhaustedVotesScaled += ballot.weight;
            }
        });
        
        // Update running tally with current vote counts for active candidates
        Object.keys(voteCountsScaled).forEach(id => {
            if (!eliminated.has(id) && !elected.includes(id)) {
                runningTally[id] = voteCountsScaled[id];
            }
        });
        
        // Check if anyone meets quota (integer comparison)
        const activeCandidates = candidateIds.filter(id => !eliminated.has(id) && !elected.includes(id));
        const maxVotesScaled = Math.max(...activeCandidates.map(id => voteCountsScaled[id] || 0));
        
        if (maxVotesScaled >= quotaScaled) {
            // Elect candidate with most votes
            const winner = activeCandidates.find(id => voteCountsScaled[id] === maxVotesScaled);
            elected.push(winner);
            
            // QUOTA LOCKING: Lock the quota portion to this candidate
            // Only the surplus will transfer to next preferences
            quotaLocked[winner] = quotaScaled;
            finalTally[winner] = quotaScaled; // Add quota to final tally
            runningTally[winner] = 0; // Clear from running tally (now in final)
            
            const surplusScaled = maxVotesScaled - quotaScaled;
            
            // Transfer surplus to next preferences using Gregory Method (integer math)
            // Only transfer the surplus portion, quota stays locked to winner
            let surplusExhaustedScaled = 0;
            
            if (surplusScaled > 0) {
                // Calculate total weight of ballots currently assigned to winner
                let totalWeightForWinner = 0;
                
                scaledBallots.forEach(ballot => {
                    if (ballot.preferences.length === 0) return;
                    const currentPref = ballot.preferences[ballot.currentPreference];
                    if (currentPref === winner) {
                        totalWeightForWinner += ballot.weight;
                    }
                });
                
                // Transfer surplus proportionally from each ballot
                scaledBallots.forEach(ballot => {
                    // Check if this ballot is currently with the winner
                    if (ballot.preferences.length === 0) return;
                    const currentPref = ballot.preferences[ballot.currentPreference];
                    if (currentPref === winner && totalWeightForWinner > 0) {
                        // Calculate surplus portion for this ballot
                        // Surplus transfer ratio: surplusScaled / totalWeightForWinner
                        const surplusPortion = Math.floor((surplusScaled * ballot.weight) / totalWeightForWinner);
                        
                        // Find next valid preference
                        let nextPrefFound = false;
                        for (let i = ballot.currentPreference + 1; i < ballot.preferences.length; i++) {
                            const nextPref = ballot.preferences[i];
                            if (!eliminated.has(nextPref) && !elected.includes(nextPref)) {
                                ballot.currentPreference = i;
                                // Transfer only the surplus portion
                                ballot.weight = surplusPortion;
                                nextPrefFound = true;
                                
                                // Update running tally for receiving candidate
                                if (!runningTally[nextPref]) runningTally[nextPref] = 0;
                                runningTally[nextPref] += surplusPortion;
                                break;
                            }
                        }
                        
                        // If no next preference, surplus is exhausted (Loss to System)
                        if (!nextPrefFound) {
                            surplusExhaustedScaled += surplusPortion;
                        }
                    }
                });
                
                exhaustedVotesScaled += surplusExhaustedScaled;
            }
            
            // Convert to display values for round data
            const surplus = surplusScaled / SCALE_FACTOR;
            const transferValue = maxVotesScaled > 0 ? surplusScaled / maxVotesScaled : 0;
            const surplusExhausted = surplusExhaustedScaled / SCALE_FACTOR;
            
            // Convert vote counts for display
            const voteCounts = {};
            Object.keys(voteCountsScaled).forEach(id => {
                voteCounts[id] = voteCountsScaled[id] / SCALE_FACTOR;
            });
            
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
            // Convert vote counts for display
            const voteCounts = {};
            Object.keys(voteCountsScaled).forEach(id => {
                voteCounts[id] = voteCountsScaled[id] / SCALE_FACTOR;
            });
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
            // Eliminate candidate with fewest votes (integer comparison)
            const minVotesScaled = Math.min(...activeCandidates.map(id => voteCountsScaled[id] || 0));
            const toEliminate = activeCandidates.find(id => voteCountsScaled[id] === minVotesScaled);
            
            // Convert vote counts for display
            const voteCounts = {};
            Object.keys(voteCountsScaled).forEach(id => {
                voteCounts[id] = voteCountsScaled[id] / SCALE_FACTOR;
            });
            if (toEliminate) {
                eliminated.add(toEliminate);
                
                // Track elimination round and final vote count
                eliminationRound[toEliminate] = roundNumber;
                finalVoteCounts[toEliminate] = voteCountsScaled[toEliminate] / SCALE_FACTOR;
                
                // Clear from running tally (eliminated candidates don't receive transfers)
                runningTally[toEliminate] = 0;
                
                // Transfer eliminated candidate's ballots to next preferences
                scaledBallots.forEach(ballot => {
                    if (ballot.preferences.length === 0) return;
                    const currentPref = ballot.preferences[ballot.currentPreference];
                    if (currentPref === toEliminate) {
                        // Find next valid preference
                        let nextPrefFound = false;
                        for (let i = ballot.currentPreference + 1; i < ballot.preferences.length; i++) {
                            const nextPref = ballot.preferences[i];
                            if (!eliminated.has(nextPref) && !elected.includes(nextPref)) {
                                ballot.currentPreference = i;
                                nextPrefFound = true;
                                
                                // Update running tally for receiving candidate
                                if (!runningTally[nextPref]) runningTally[nextPref] = 0;
                                runningTally[nextPref] += ballot.weight;
                                break;
                            }
                        }
                        
                        // If no next preference, ballot is exhausted
                        if (!nextPrefFound) {
                            exhaustedVotesScaled += ballot.weight;
                        }
                    }
                });
                
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
        // Safety check - scale with seat count and candidate count to handle large legislatures
        // Dynamic limit: (candidates * seats) + 100 to prevent truncation in large parliaments
        const maxRounds = (candidates.length * seats) + 100;
        if (roundNumber > maxRounds) {
            console.warn(`STV: Maximum rounds (${maxRounds}) reached for ${seats} seats with ${candidates.length} candidates`);
            break;
        }
    }
    
    // ============================================
    // Post-processing: Internal Party Substitution
    // ============================================
    // Calculate party quotas and generate list candidates for unused quotas
    
    // Count actual seats won per party (excluding any previously generated candidates)
    const partySeatCounts = {};
    elected.forEach(id => {
        const cand = candidates.find(c => c.id === id);
        if (cand && !cand.isGenerated) { // Don't count generated candidates in seat counts
            partySeatCounts[cand.partyId] = (partySeatCounts[cand.partyId] || 0) + 1;
        }
    });
    
    // Calculate quotas earned per party from first preferences (use original ballots, not scaled)
    const partyTotalVotesScaled = {};
    const partyQuotasEarned = {};
    const partyRemainders = {};
    
    parties.forEach(party => {
        let partyTotalVotes = 0;
        ballots.forEach(ballot => {
            if (ballot.preferences && ballot.preferences.length > 0) {
                const firstPrefId = ballot.preferences[0];
                const firstPrefCandidate = candidates.find(c => c.id === firstPrefId);
                if (firstPrefCandidate && firstPrefCandidate.partyId === party.id) {
                    // Count original ballot count (before scaling/transfers)
                    partyTotalVotes += (ballot.count || 1) * SCALE_FACTOR;
                }
            }
        });
        
        partyTotalVotesScaled[party.id] = partyTotalVotes;
        const quotasDecimal = partyTotalVotes / quotaScaled;
        const quotasFull = Math.floor(quotasDecimal);
        const remainder = quotasDecimal - quotasFull;
        
        partyQuotasEarned[party.id] = quotasFull;
        partyRemainders[party.id] = remainder;
    });
    
    // Generate list candidates for unused quotas
    const generatedCandidates = [];
    let seatsRemaining = seats - elected.length;
    
    // Phase 1: Fill full quotas (parties that earned complete quotas)
    // Sort parties by total quotas earned (including decimals) for priority
    const sortedParties = [...parties].sort((a, b) => {
        const aQuotas = partyTotalVotesScaled[a.id] / quotaScaled;
        const bQuotas = partyTotalVotesScaled[b.id] / quotaScaled;
        return bQuotas - aQuotas; // Highest quotas first
    });
    
    sortedParties.forEach(party => {
        const quotasEarned = partyQuotasEarned[party.id] || 0;
        const actualSeats = partySeatCounts[party.id] || 0;
        
        // If party earned more full quotas than they have candidates
        if (quotasEarned > actualSeats && seatsRemaining > 0) {
            const extraSeatsNeeded = Math.min(quotasEarned - actualSeats, seatsRemaining);
            
            for (let i = 0; i < extraSeatsNeeded; i++) {
                const generatedId = `generated-${party.id}-${actualSeats + i}`;
                const generatedCandidate = {
                    id: generatedId,
                    name: `${party.name} List Candidate ${actualSeats + i + 1}`,
                    partyId: party.id,
                    party: party.name,
                    color: party.color,
                    isGenerated: true // Flag for UI
                };
                generatedCandidates.push(generatedCandidate);
                elected.push(generatedId);
                seatsRemaining--;
            }
        }
    });
    
    // Phase 2: Fill remainder seats using Largest Remainder Method
    if (seatsRemaining > 0) {
        // Create array of parties with remainders, sorted by remainder size
        const partiesWithRemainders = sortedParties
            .filter(party => partyRemainders[party.id] > 0)
            .sort((a, b) => partyRemainders[b.id] - partyRemainders[a.id]);
        
        // Award remainder seats to parties with largest remainders
        for (let i = 0; i < Math.min(seatsRemaining, partiesWithRemainders.length); i++) {
            const party = partiesWithRemainders[i];
            const actualSeats = partySeatCounts[party.id] || 0;
            const generatedId = `generated-${party.id}-remainder-${i}`;
            const generatedCandidate = {
                id: generatedId,
                name: `${party.name} List Candidate (Remainder Seat)`,
                partyId: party.id,
                party: party.name,
                color: party.color,
                isGenerated: true,
                isRemainderSeat: true // Flag to distinguish remainder seats
            };
            generatedCandidates.push(generatedCandidate);
            elected.push(generatedId);
            seatsRemaining--;
        }
    }
    
    // Add generated candidates to candidates array for results mapping
    const allCandidates = [...candidates, ...generatedCandidates];
    
    // Build results (convert from integer scaling)
    const totalVotes = totalVotesScaled / SCALE_FACTOR;
    const exhaustedVotes = exhaustedVotesScaled / SCALE_FACTOR;
    
    // Initialize otherNotes array for simulation notes
    const otherNotes = [];
    
    const results = allCandidates.map(candidate => {
        const party = parties.find(p => p.id === candidate.partyId);
        const isElected = elected.includes(candidate.id);
        const isGenerated = candidate.isGenerated || false;
        
        // For generated candidates, use quota as vote count and skip normal vote counting
        if (isGenerated && isElected) {
            const voteCountForGenerated = quotaScaled / SCALE_FACTOR;
            
            // Add note explaining the "ghost vote" - this candidate represents unused quota
            const noteText = `${party.name} was awarded a list seat based on ${candidate.isRemainderSeat ? 'a remainder quota' : 'a full quota'} of first-preference votes.`;
            if (!otherNotes.includes(noteText)) {
                otherNotes.push(noteText);
            }
            
            return {
                name: candidate.name,
                party: party.name,
                color: party.color,
                votes: voteCountForGenerated,
                percentage: totalVotes > 0 ? (voteCountForGenerated / totalVotes * 100) : 0,
                elected: isElected,
                meetsQuota: true,
                isGenerated: isGenerated,
                isRemainderSeat: candidate.isRemainderSeat || false,
                eliminationRound: null,
                quotaPercentage: quota > 0 ? (voteCountForGenerated / quota * 100) : 0
            };
        }
        
        // Get final vote count using running/final tally
        // For elected candidates: quota (locked) + any surplus they received
        // For active candidates: current running tally
        // For eliminated candidates: final vote count at elimination
        let voteCountScaled = 0;
        
        if (isElected) {
            // Elected candidates: quota locked + any surplus received in later rounds
            voteCountScaled = finalTally[candidate.id] || 0;
            
            // Also count any ballots currently assigned to them (surplus they received)
            scaledBallots.forEach(ballot => {
                if (ballot.preferences.length === 0) return;
                const currentPrefIndex = ballot.currentPreference !== undefined ? ballot.currentPreference : -1;
                if (currentPrefIndex >= 0 && currentPrefIndex < ballot.preferences.length) {
                    const currentPref = ballot.preferences[currentPrefIndex];
                    if (currentPref === candidate.id) {
                        voteCountScaled += ballot.weight;
                    }
                }
            });
        } else if (eliminated.has(candidate.id)) {
            // Eliminated candidates: use final vote count at elimination
            voteCountScaled = (finalVoteCounts[candidate.id] || 0) * SCALE_FACTOR;
        } else {
            // Active (non-elected, non-eliminated) candidates: use running tally
            voteCountScaled = runningTally[candidate.id] || 0;
        }
        
        const voteCount = voteCountScaled / SCALE_FACTOR;
        
        // Validate: If elected, should have votes >= quota (except in final fallback case where all remaining are elected)
        const meetsQuota = voteCount >= quota;
        if (isElected && !meetsQuota) {
            // Check if this is the final fallback case (all remaining candidates elected)
            const remainingCandidates = candidateIds.filter(id => !eliminated.has(id) && !elected.includes(id));
            const wasFinalFallback = remainingCandidates.length === 0 && elected.length <= seats;
            if (!wasFinalFallback) {
                console.warn(`STV Warning: ${candidate.name} elected with ${voteCount.toFixed(2)} votes (quota: ${quota.toFixed(2)})`);
            }
        }
        
        // Calculate quota percentage for eliminated candidates
        const quotaPercentage = quota > 0 ? (voteCount / quota * 100) : 0;
        
        return {
            name: candidate.name,
            party: party.name,
            color: party.color,
            votes: voteCount,
            percentage: totalVotes > 0 ? (voteCount / totalVotes * 100) : 0,
            elected: isElected,
            meetsQuota: meetsQuota,
            isGenerated: isGenerated,
            isRemainderSeat: false,
            eliminationRound: eliminationRound[candidate.id] || null,
            quotaPercentage: quotaPercentage
        };
    });
    
    results.sort((a, b) => {
        if (a.elected && !b.elected) return -1;
        if (!a.elected && b.elected) return 1;
        return b.votes - a.votes;
    });
    
    const exhaustedPercentage = totalVotes > 0 ? (exhaustedVotes / totalVotes * 100) : 0;
    
    // Verify vote conservation (integer comparison - exact match)
    // Recalculate final vote totals from scaled ballots
    let finalTotalScaled = exhaustedVotesScaled;
    scaledBallots.forEach(ballot => {
        if (ballot.preferences.length > 0) {
            // Find first valid preference
            for (let prefId of ballot.preferences) {
                if (!eliminated.has(prefId) && !elected.includes(prefId)) {
                    finalTotalScaled += ballot.weight;
                    break;
                }
            }
        }
    });
    
    if (finalTotalScaled !== totalVotesScaled) {
        console.warn(`STV Vote conservation warning: Expected ${totalVotesScaled}, got ${finalTotalScaled}. Difference: ${totalVotesScaled - finalTotalScaled}`);
    }
    
    // Store ballots for shadow comparison (convert from scaled back to decimal)
    // Note: scaledBallots contains integer-scaled weights, need to convert back
    const resultBallots = [];
    if (scaledBallots && scaledBallots.length > 0) {
        scaledBallots.forEach(b => {
            resultBallots.push({
                preferences: [...b.preferences],
                count: b.weight / SCALE_FACTOR, // Convert back to decimal
                weight: 1.0
            });
        });
    }
    
    return {
        type: 'multi-winner',
        results: results,
        totalVotes: totalVotes,
        seats: seats,
        quota: quota,
        exhaustedVotes: exhaustedVotes,
        exhaustedPercentage: exhaustedPercentage,
        surplusLoss: exhaustedVotes,  // Track fractional surplus loss
        rounds: roundsData,
        ballots: resultBallots, // CRITICAL: Save ballots for comparison
        otherNotes: otherNotes, // Simulation notes for generated candidates
        note: `Single Transferable Vote with Gregory Method surplus transfer using integer scaling for precision (Quota: ${quota.toFixed(2)} votes)` +
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

// Calculate iterative leveling seats (German Ausgleichsmandate)
function calculateIterativeLeveling(districtWins, targets, partyVotes, baseParliamentSize, totalVotes) {
    // Start with basic overhang seats
    let currentSeats = {};
    Object.keys(districtWins).forEach(partyId => {
        const target = targets[partyId] || 0;
        const districtWon = districtWins[partyId] || 0;
        const topUp = Math.max(0, target - districtWon);
        currentSeats[partyId] = districtWon + topUp;
    });
    
    let currentParliamentSize = baseParliamentSize;
    const MAX_ITERATIONS = 100; // Safety limit
    let iterations = 0;
    
    // Iteratively add leveling seats until proportionality is restored
    while (iterations < MAX_ITERATIONS) {
        let needsLeveling = false;
        const levelingSeats = {};
        
        // Check each party: if seat share > vote share, add leveling seats to others
        Object.keys(partyVotes).forEach(partyId => {
            const voteShare = partyVotes[partyId] / totalVotes;
            const currentTotal = Object.values(currentSeats).reduce((sum, s) => sum + s, 0);
            if (currentTotal === 0) return; // Safety check
            
            const seatShare = (currentSeats[partyId] || 0) / currentTotal;
            
            if (seatShare > voteShare + 0.001) { // Small tolerance for floating point
                needsLeveling = true;
                
                // Add leveling seats to other parties proportionally
                Object.keys(partyVotes).forEach(otherPartyId => {
                    if (otherPartyId !== partyId) {
                        const otherVoteShare = partyVotes[otherPartyId] / totalVotes;
                        const otherSeatShare = (currentSeats[otherPartyId] || 0) / currentTotal;
                        
                        if (otherSeatShare < otherVoteShare) {
                            // This party needs leveling seats
                            levelingSeats[otherPartyId] = (levelingSeats[otherPartyId] || 0) + 1;
                        }
                    }
                });
            }
        });
        
        if (!needsLeveling) break; // Proportionality achieved
        
        // Apply leveling seats
        Object.keys(levelingSeats).forEach(partyId => {
            currentSeats[partyId] = (currentSeats[partyId] || 0) + (levelingSeats[partyId] || 0);
            currentParliamentSize += (levelingSeats[partyId] || 0);
        });
        
        iterations++;
    }
    
    return {
        finalSeats: currentSeats,
        finalParliamentSize: currentParliamentSize
    };
}

function calculateMMP(votes, districtSeats, baseListSeats, threshold, allocationMethod, levelingEnabled, forcedDistrictWins = null, bypassThreshold = 1, enableOverhang = true) {
    // CHECK: If manual seat mode is active, use manual seats
    if (electionState.isManualSeatMode && Object.keys(electionState.manualSeats).length > 0) {
        return calculateMMPWithManualSeats(votes, districtSeats, baseListSeats, threshold, allocationMethod, levelingEnabled, forcedDistrictWins, bypassThreshold, enableOverhang);
    }
    
    // Pure function - no DOM access
    // Mixed-Member Proportional: Compensatory system with district + list seats
    
    // ============================================
    // Step A: District Tier (FPTP)
    // ============================================
    // Use forced district wins if provided (for shadow comparisons), otherwise simulate
    const partyDistrictWins = forcedDistrictWins || simulateDistricts(votes.candidates, districtSeats);
    
    // ============================================
    // Step B: Filter Qualifying Parties and Calculate Qualifying Vote Total
    // ============================================
    // First calculate total votes for percentage calculation
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    
    // Filter qualifying parties (meet threshold OR bypass via electorate seats)
    // CRITICAL: In normal calculation mode, use districtWins for bypass check, NOT manualSeats
    const qualifyingParties = parties.filter(p => {
        const partyVotes = votes.parties[p.id] || 0;
        const votePercentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        const districtWins = partyDistrictWins[p.id] || 0;
        
        const meetsThreshold = votePercentage >= threshold;
        const meetsBypass = districtWins >= bypassThreshold;
        return (meetsThreshold || meetsBypass) && partyVotes > 0;
    });
    
    // Calculate qualifying vote total (denominator for allocation)
    const qualifyingVoteTotal = qualifyingParties.reduce((sum, p) => {
        return sum + (votes.parties[p.id] || 0);
    }, 0);
    
    // DEBUG: Log qualifying parties and vote total for debugging
    console.log('MMP Qualifying Parties Debug:', {
        totalPartyVotes: totalPartyVotes,
        qualifyingVoteTotal: qualifyingVoteTotal,
        qualifyingParties: qualifyingParties.map(p => ({
            name: p.name,
            votes: votes.parties[p.id] || 0,
            percentage: totalPartyVotes > 0 ? ((votes.parties[p.id] || 0) / totalPartyVotes * 100).toFixed(2) + '%' : '0%',
            districtWins: partyDistrictWins[p.id] || 0,
            meetsThreshold: (votes.parties[p.id] || 0) / totalPartyVotes * 100 >= threshold,
            meetsBypass: (partyDistrictWins[p.id] || 0) >= bypassThreshold
        })),
        threshold: threshold,
        bypassThreshold: bypassThreshold
    });
    
    // Build eligible party votes object for allocation functions
    const eligiblePartyVotes = {};
    let sumOfEligibleVotes = 0;
    qualifyingParties.forEach(p => {
        const partyVotes = votes.parties[p.id] || 0;
        eligiblePartyVotes[p.id] = partyVotes;
        sumOfEligibleVotes += partyVotes;
    });
    
    // VALIDATION: Ensure sum of eligible votes matches qualifying vote total
    if (Math.abs(sumOfEligibleVotes - qualifyingVoteTotal) > 1) {
        console.error('MMP ERROR: Sum of eligible votes does not match qualifying vote total!', {
            sumOfEligibleVotes: sumOfEligibleVotes,
            qualifyingVoteTotal: qualifyingVoteTotal,
            difference: sumOfEligibleVotes - qualifyingVoteTotal
        });
    }
    
    // Calculate proportional targets based on TOTAL parliament size (district + list)
    // CRITICAL: The allocation functions allocate seats proportionally based on the votes passed.
    // Since we only pass qualifying parties' votes, they will allocate proportionally among qualifying parties.
    // The functions will ensure the total seats allocated equals totalParliamentSeats.
    const totalParliamentSeats = districtSeats + baseListSeats;
    const proportionalTargets = allocationMethod === 'sainte-lague'
        ? allocateSeats_SainteLague(eligiblePartyVotes, totalParliamentSeats)
        : allocationMethod === 'hare'
            ? allocateSeats_HareLR(eligiblePartyVotes, totalParliamentSeats)
            : allocateSeats_DHondt(eligiblePartyVotes, totalParliamentSeats);
    
    // Initialize parties not meeting threshold
    parties.forEach(party => {
        if (!proportionalTargets[party.id]) {
            proportionalTargets[party.id] = 0;
        }
    });
    
    // VALIDATION: Ensure total target seats equals expected parliament size
    const totalTargetSeats = Object.values(proportionalTargets).reduce((sum, s) => sum + s, 0);
    if (totalTargetSeats !== totalParliamentSeats) {
        console.error('MMP ERROR: Total target seats does not match expected parliament size!', {
            totalTargetSeats: totalTargetSeats,
            expectedTotal: totalParliamentSeats,
            difference: totalTargetSeats - totalParliamentSeats
        });
    }
    
    // DEBUG: Log proportional targets (after initializing all parties)
    console.log('MMP Proportional Targets Debug:', {
        totalParliamentSeats: totalParliamentSeats,
        totalTargetSeats: totalTargetSeats,
        targets: Object.entries(proportionalTargets).map(([id, seats]) => {
            const party = parties.find(p => p.id === parseInt(id));
            return {
                name: party ? party.name : `Party ${id}`,
                targetSeats: seats,
                votes: eligiblePartyVotes[id] || 0,
                voteShare: qualifyingVoteTotal > 0 ? ((eligiblePartyVotes[id] || 0) / qualifyingVoteTotal * 100).toFixed(2) + '%' : '0%'
            };
        })
    });
    
    // ============================================
    // Step C: Calculate Initial Top-Up (List Seats = Target - District)
    // ============================================
    const baseSeats = {};
    let overhangTotal = 0;
    
    parties.forEach(party => {
        const districtWon = partyDistrictWins[party.id] || 0;
        const target = proportionalTargets[party.id] || 0;
        const partyVotes = votes.parties[party.id] || 0;
        
        // CRITICAL: If party has votes but entitlement rounds to 0, they only get district seats
        // This prevents tiny parties with 1 electorate from getting list seats
        if (target === 0 && districtWon > 0 && partyVotes > 0) {
            // Party bypassed threshold but has no proportional entitlement
            // They only get their district seats, no list seats
            baseSeats[party.id] = districtWon;
        } else if (districtWon > target) {
            // OVERHANG: Party keeps all district seats (if enabled)
            if (enableOverhang) {
                baseSeats[party.id] = districtWon;
                overhangTotal += (districtWon - target);
            } else {
                // NO OVERHANG: Cap at proportional entitlement
                baseSeats[party.id] = target;
            }
        } else {
            // NORMAL: Award list seats to reach target (already an integer from allocateSeats)
            baseSeats[party.id] = target;
        }
    });
    
    // Calculate base parliament size
    const baseParliamentSize = Object.values(baseSeats).reduce((sum, s) => sum + s, 0);
    
    // DEBUG: Log base seats and overhang
    console.log('MMP Base Seats Debug:', {
        baseParliamentSize: baseParliamentSize,
        expectedParliamentSize: totalParliamentSeats,
        overhangTotal: overhangTotal,
        baseSeats: Object.entries(baseSeats).map(([id, seats]) => {
            const party = parties.find(p => p.id === parseInt(id));
            const districtWon = partyDistrictWins[id] || 0;
            const target = proportionalTargets[id] || 0;
            return {
                name: party ? party.name : `Party ${id}`,
                baseSeats: seats,
                districtWon: districtWon,
                target: target,
                isOverhang: districtWon > target
            };
        })
    });
    
    // ============================================
    // Step D: Handle Overhang - Basic or Full Compensation
    // ============================================
    let finalSeats = { ...baseSeats };
    let finalParliamentSize = baseParliamentSize;
    
    // CRITICAL: Ensure total house size is strictly totalParliamentSeats unless actual overhang
    // If no overhang and baseParliamentSize doesn't match, there's a calculation error
    if (overhangTotal === 0 && baseParliamentSize !== totalParliamentSeats) {
        console.warn('MMP Warning: Base parliament size does not match expected total. Adjusting...', {
            baseParliamentSize: baseParliamentSize,
            expectedTotal: totalParliamentSeats,
            difference: baseParliamentSize - totalParliamentSeats
        });
        // This shouldn't happen, but if it does, we need to investigate
    }
    
    if (levelingEnabled && overhangTotal > 0) {
        // Perform iterative leveling (German Ausgleichsmandate)
        // Use qualifyingVoteTotal for leveling calculations
        const levelingResult = calculateIterativeLeveling(
            partyDistrictWins,
            proportionalTargets,
            eligiblePartyVotes,
            baseParliamentSize,
            qualifyingVoteTotal  // Use qualifying votes instead of total votes
        );
        finalSeats = levelingResult.finalSeats;
        finalParliamentSize = levelingResult.finalParliamentSize;
    }
    
    const actualTotalSeats = finalParliamentSize;
    
    // DEBUG: Log final seat allocation
    console.log('MMP Final Seats Debug:', {
        actualTotalSeats: actualTotalSeats,
        expectedTotal: totalParliamentSeats,
        overhangTotal: overhangTotal,
        levelingEnabled: levelingEnabled,
        finalSeats: Object.entries(finalSeats).map(([id, seats]) => {
            const party = parties.find(p => p.id === parseInt(id));
            const partyVotes = votes.parties[id] || 0;
            const voteShare = qualifyingVoteTotal > 0 ? ((partyVotes / qualifyingVoteTotal) * 100).toFixed(2) + '%' : '0%';
            const seatShare = actualTotalSeats > 0 ? ((seats / actualTotalSeats) * 100).toFixed(2) + '%' : '0%';
            return {
                name: party ? party.name : `Party ${id}`,
                votes: partyVotes,
                voteShare: voteShare,
                seats: seats,
                seatShare: seatShare
            };
        }).filter(p => p.seats > 0 || p.votes > 0)
    });
    
    // Format results using final seats
    const results = parties.map(party => {
        const partyVotes = votes.parties[party.id] || 0;
        const districtWon = partyDistrictWins[party.id] || 0;
        const totalSeatsWon = finalSeats[party.id] || 0;
        const listSeatsWon = totalSeatsWon - districtWon;
        const percentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        // Calculate qualifying percentage (share of qualifying votes)
        const qualifyingPercentage = qualifyingVoteTotal > 0 ? (partyVotes / qualifyingVoteTotal * 100) : 0;
        
        return {
            id: party.id,
            name: party.name,
            color: party.color,
            votes: partyVotes,
            percentage: percentage,
            qualifyingPercentage: qualifyingPercentage,  // NEW: Share of qualifying votes
            seats: totalSeatsWon,
            districtSeats: districtWon,
            listSeats: listSeatsWon,
            targetSeats: proportionalTargets[party.id] || 0,
            meetsThreshold: percentage >= threshold,
            belowThreshold: percentage < threshold && partyVotes > 0,
            hasOverhang: districtWon > (proportionalTargets[party.id] || 0),
            isQualifying: qualifyingParties.some(p => p.id === party.id)  // NEW: Track if party qualifies
        };
    });
    
    results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
    
    // Calculate disproportionality (both indices) using final seats
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
    
    const levelingSeatsAdded = finalParliamentSize - baseParliamentSize;
    const overhangNote = overhangTotal > 0 
        ? levelingEnabled
            ? ` Parliament expanded by ${levelingSeatsAdded} leveling seat(s) from ${baseParliamentSize} to ${finalParliamentSize} to restore proportionality.`
            : ` Parliament expanded by ${overhangTotal} overhang seat(s) from ${totalParliamentSeats} to ${baseParliamentSize}.`
        : '';
    
    return {
        type: 'mixed',
        results: results,
        totalSeats: actualTotalSeats,
        plannedSeats: totalParliamentSeats,
        totalVotes: totalPartyVotes,
        overhangSeats: overhangTotal,
        districtSeats: districtSeats,
        listSeats: actualTotalSeats - districtSeats,
        threshold: threshold,
        allocationMethod: allocationMethod,
        disproportionality: disproportionality,
        gallagher: gallagher,
        // Base vs Final seats for UI display
        baseSeats: baseSeats,
        finalSeats: finalSeats,
        baseParliamentSize: baseParliamentSize,
        finalParliamentSize: finalParliamentSize,
        levelingSeatsAdded: levelingSeatsAdded,
        levelingEnabled: levelingEnabled,
        partyDistrictWins: partyDistrictWins, // Store for shadow comparison (Issue 6)
        note: `Mixed-Member Proportional (Germany Model): ${districtSeats} district seats (${Math.round(districtSeats/totalParliamentSeats*100)}%) with compensatory list seats to ensure overall proportionality. Threshold: ${threshold}% OR 1+ district win for eligibility (Double Gate).${overhangNote}`
    };
}

// Manual seat calculation for MMP
function calculateMMPWithManualSeats(votes, districtSeats, baseListSeats, threshold, allocationMethod, levelingEnabled, forcedDistrictWins, bypassThreshold = 1, enableOverhang = true) {
    // Ensure calculatedSeats object exists
    if (!electionState.calculatedSeats || typeof electionState.calculatedSeats !== 'object') {
        electionState.calculatedSeats = {};
    }
    
    // First, run normal calculation to get what SHOULD have happened
    // CRITICAL: For the "calculated" comparison, we need to use the actual district wins
    // from manual seats to determine qualification, not simulated district wins
    // Build forcedDistrictWins from manual seats for accurate qualification check
    const forcedDistrictWinsForCalculation = {};
    parties.forEach(p => {
        // Use manual seats as district wins for the bypass check in calculated mode
        forcedDistrictWinsForCalculation[p.id] = electionState.manualSeats[p.id] || 0;
    });
    
    electionState.isManualSeatMode = false; // Temporarily disable
    const calculatedResults = calculateMMP(votes, districtSeats, baseListSeats, threshold, allocationMethod, levelingEnabled, forcedDistrictWinsForCalculation, bypassThreshold, enableOverhang);
    electionState.isManualSeatMode = true; // Re-enable
    
    // Store calculated seats for comparison
    calculatedResults.results.forEach(party => {
        const partyObj = parties.find(p => p.name === party.name);
        if (partyObj) {
            electionState.calculatedSeats[partyObj.id] = party.seats;
        }
    });
    
    // Build results using manual seats
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    
    // Calculate qualifying parties and qualifying vote total (same logic as main function)
    const qualifyingParties = parties.filter(p => {
        const partyVotes = votes.parties[p.id] || 0;
        const votePercentage = totalPartyVotes > 0 ? (partyVotes / totalPartyVotes * 100) : 0;
        const manualSeats = electionState.manualSeats[p.id] || 0;
        const meetsThreshold = votePercentage >= threshold;
        const meetsBypass = manualSeats >= bypassThreshold;
        return (meetsThreshold || meetsBypass) && partyVotes > 0;
    });
    
    const qualifyingVoteTotal = qualifyingParties.reduce((sum, p) => {
        return sum + (votes.parties[p.id] || 0);
    }, 0);
    
    const manualResults = parties.map(party => {
        const voteCount = votes.parties[party.id] || 0;
        const votePercentage = totalPartyVotes > 0 ? (voteCount / totalPartyVotes * 100) : 0;
        const qualifyingPercentage = qualifyingVoteTotal > 0 ? (voteCount / qualifyingVoteTotal * 100) : 0;
        const manualSeats = electionState.manualSeats[party.id] || 0;
        const calculatedSeats = electionState.calculatedSeats[party.id] || 0;
        const seatDifference = manualSeats - calculatedSeats;
        
        return {
            name: party.name,
            color: party.color,
            votes: voteCount,
            percentage: votePercentage,
            qualifyingPercentage: qualifyingPercentage,  // NEW: Share of qualifying votes
            seats: manualSeats,
            calculatedSeats: calculatedSeats,
            seatDifference: seatDifference,
            isManualOverride: true,
            isQualifying: qualifyingParties.some(p => p.id === party.id)  // NEW: Track if party qualifies
        };
    }).filter(r => r.votes > 0 || r.seats > 0);
    
    manualResults.sort((a, b) => b.seats - a.seats);
    
    // Calculate disproportionality using manual seats
    const totalManualSeats = manualResults.reduce((sum, r) => sum + r.seats, 0);
    const voteShares = {};
    const seatShares = {};
    manualResults.forEach(r => {
        voteShares[r.name] = r.percentage;
        seatShares[r.name] = totalManualSeats > 0 ? (r.seats / totalManualSeats * 100) : 0;
    });
    
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    const gallagher = calculateGallagher(voteShares, seatShares);
    
    return {
        type: 'mixed',
        results: manualResults,
        totalSeats: totalManualSeats,
        totalVotes: totalPartyVotes,
        disproportionality: disproportionality,
        gallagher: gallagher,
        isManualMode: true,
        calculatedResults: calculatedResults,
        threshold: threshold,
        allocationMethod: allocationMethod
    };
}

// Helper function to extract district wins from candidate votes (deterministic for Parallel voting)
// This uses candidate votes to determine district wins without randomness
function extractDistrictWinsFromCandidateVotes(candidateVotes, districtCount) {
    const partyDistrictWins = {};
    parties.forEach(p => partyDistrictWins[p.id] = 0);
    
    // Aggregate candidate votes by party
    const partyVoteTotals = {};
    parties.forEach(p => partyVoteTotals[p.id] = 0);
    
    candidates.forEach(candidate => {
        const votes = candidateVotes[candidate.id] || 0;
        if (candidate.partyId) {
            partyVoteTotals[candidate.partyId] = (partyVoteTotals[candidate.partyId] || 0) + votes;
        }
    });
    
    // Calculate each party's share of total candidate votes
    const totalCandidateVotes = Object.values(partyVoteTotals).reduce((sum, v) => sum + v, 0);
    if (totalCandidateVotes === 0) return partyDistrictWins;
    
    // Allocate districts proportionally based on candidate vote share (deterministic)
    // This gives a reasonable estimate of district wins without randomness
    const partyShares = {};
    parties.forEach(p => {
        partyShares[p.id] = totalCandidateVotes > 0 ? (partyVoteTotals[p.id] / totalCandidateVotes) : 0;
    });
    
    // Allocate districts using largest remainder method for deterministic results
    const partyDistricts = {};
    let allocated = 0;
    
    // First allocation: integer part
    parties.forEach(p => {
        const share = partyShares[p.id] * districtCount;
        const integerPart = Math.floor(share);
        partyDistricts[p.id] = integerPart;
        allocated += integerPart;
    });
    
    // Remaining districts: allocate to parties with largest fractional parts
    const remaining = districtCount - allocated;
    if (remaining > 0) {
        const fractionalParts = parties.map(p => ({
            partyId: p.id,
            fractional: (partyShares[p.id] * districtCount) - Math.floor(partyShares[p.id] * districtCount)
        })).sort((a, b) => b.fractional - a.fractional);
        
        for (let i = 0; i < remaining && i < fractionalParts.length; i++) {
            partyDistricts[fractionalParts[i].partyId]++;
        }
    }
    
    // Copy to partyDistrictWins
    Object.keys(partyDistricts).forEach(partyId => {
        partyDistrictWins[parseInt(partyId)] = partyDistricts[partyId] || 0;
    });
    
    return partyDistrictWins;
}

// Manual seat calculation for Parallel/MMM
function calculateParallelWithManualSeats(votes, districtSeats, listSeats, threshold, allocationMethod, forcedDistricts) {
    // Ensure calculatedSeats object exists
    if (!electionState.calculatedSeats || typeof electionState.calculatedSeats !== 'object') {
        electionState.calculatedSeats = {};
    }
    
    // CRITICAL: For "calculated" comparison, use manual district seats if available
    // This ensures the calculated seats reflect what the system would compute with actual district results
    let actualDistrictWins = forcedDistricts;
    if (!actualDistrictWins && Object.keys(electionState.manualDistrictSeats).length > 0) {
        // Use manual district seats if they were entered
        actualDistrictWins = { ...electionState.manualDistrictSeats };
    } else if (!actualDistrictWins && votes.candidates) {
        // Fallback to extracting from candidate votes deterministically
        actualDistrictWins = extractDistrictWinsFromCandidateVotes(votes.candidates, districtSeats);
    }
    
    // First, run normal calculation to get what SHOULD have happened
    electionState.isManualSeatMode = false;
    const calculatedResults = calculateParallel(votes, districtSeats, listSeats, threshold, allocationMethod, actualDistrictWins);
    electionState.isManualSeatMode = true;
    
    // Store calculated seats
    calculatedResults.results.forEach(party => {
        const partyObj = parties.find(p => p.name === party.name);
        if (partyObj) {
            electionState.calculatedSeats[partyObj.id] = party.seats;
        }
    });
    
    // Build results using manual seats (same logic as MMP)
    const totalPartyVotes = Object.values(votes.parties).reduce((sum, v) => sum + v, 0);
    const manualResults = parties.map(party => {
        const voteCount = votes.parties[party.id] || 0;
        const votePercentage = totalPartyVotes > 0 ? (voteCount / totalPartyVotes * 100) : 0;
        const manualSeats = electionState.manualSeats[party.id] || 0;
        const calculatedSeats = electionState.calculatedSeats[party.id] || 0;
        const seatDifference = manualSeats - calculatedSeats;
        
        return {
            name: party.name,
            color: party.color,
            votes: voteCount,
            percentage: votePercentage,
            seats: manualSeats,
            calculatedSeats: calculatedSeats,
            seatDifference: seatDifference,
            isManualOverride: true
        };
    }).filter(r => r.votes > 0 || r.seats > 0);
    
    manualResults.sort((a, b) => b.seats - a.seats);
    
    // Calculate disproportionality
    const totalManualSeats = manualResults.reduce((sum, r) => sum + r.seats, 0);
    const voteShares = {};
    const seatShares = {};
    manualResults.forEach(r => {
        voteShares[r.name] = r.percentage;
        seatShares[r.name] = totalManualSeats > 0 ? (r.seats / totalManualSeats * 100) : 0;
    });
    
    const disproportionality = calculateLoosemoreHanby(voteShares, seatShares);
    const gallagher = calculateGallagher(voteShares, seatShares);
    
    return {
        type: 'mixed',
        results: manualResults,
        totalSeats: totalManualSeats,
        totalVotes: totalPartyVotes,
        disproportionality: disproportionality,
        gallagher: gallagher,
        isManualMode: true,
        calculatedResults: calculatedResults,
        threshold: threshold,
        allocationMethod: allocationMethod
    };
}

function calculateParallel(votes, districtSeats, listSeats, threshold, allocationMethod, forcedDistricts = null) {
    // CHECK: If manual seat mode is active, use manual seats
    if (electionState.isManualSeatMode && Object.keys(electionState.manualSeats).length > 0) {
        return calculateParallelWithManualSeats(votes, districtSeats, listSeats, threshold, allocationMethod, forcedDistricts);
    }
    
    // Pure function - no DOM access
    // Parallel Voting (MMM): Non-compensatory mixed system
    
    // Calculate total seats for use in return statement and calculations
    const totalSeats = districtSeats + listSeats;
    
    // ============================================
    // SILO 1: District Tier (FPTP)
    // ============================================
    // If forcedDistricts provided (for shadow comparisons), use it instead of simulating
    const partyDistrictWins = forcedDistricts || simulateDistricts(votes.candidates, districtSeats);
    
    // CRITICAL: Clear district variables before list calculation
    // The two tiers must be completely independent
    
    // ============================================
    // SILO 2: List Tier (Proportional - INDEPENDENT)
    // ============================================
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
    
    // Allocate list seats using D'Hondt, Sainte-Laguë, or Hare Quota
    const partyListSeats = allocationMethod === 'sainte-lague'
        ? allocateSeats_SainteLague(eligiblePartyVotes, listSeats)
        : allocationMethod === 'hare'
            ? allocateSeats_HareLR(eligiblePartyVotes, listSeats)
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

// Translate STV ranked ballots to party and candidate votes (Data Transformer for STV → MMP/PR comparisons)
function translateSTVtoPartyVotes(ballots, candidates) {
    const partyVotes = {};
    const candidateVotes = {};
    let exhaustedBallots = 0;  // NEW

    ballots.forEach(ballot => {
        if (ballot.preferences && ballot.preferences.length > 0) {
            const firstPrefId = ballot.preferences[0];
            const candidate = candidates.find(c => c.id === firstPrefId);
            
            if (candidate) {
                // Aggregate for Party-List/MMP party tier
                partyVotes[candidate.partyId] = (partyVotes[candidate.partyId] || 0) + ballot.count;
                // Aggregate for MMP district tier
                candidateVotes[candidate.id] = (candidateVotes[candidate.id] || 0) + ballot.count;
            }
        } else {
            // Track empty/exhausted ballots
            exhaustedBallots += ballot.count || 0;  // NEW
        }
    });

    return { 
        parties: partyVotes, 
        candidates: candidateVotes,
        exhaustedBallots: exhaustedBallots  // NEW - for comparison adjustments
    };
}

// Flatten ranked ballots to party votes (Data Transformer for STV → MMP/PR comparisons)
function flattenRankedToPartyVotes(ballots, candidates) {
    const partyVotes = {};
    ballots.forEach(ballot => {
        const firstPrefId = ballot.preferences[0];
        const candidate = candidates.find(c => c.id === firstPrefId);
        if (candidate) {
            partyVotes[candidate.partyId] = (partyVotes[candidate.partyId] || 0) + ballot.count;
        }
    });
    return partyVotes;
}

/**
 * Generates synthetic ranked ballots from simple party/candidate totals.
 * Accounts for the "Exhausted Ballot" gap by varying the length of rankings.
 * Used for MMP/PR → IRV/STV shadow comparisons.
 */
function generateSyntheticBallotsFromTotals(votes, candidates, parties) {
    const syntheticBallots = [];
    
    // 1. Identify "Neighbors" (for redistribution logic)
    // We assume parties closer in the list are more likely to be 2nd choices
    const partyList = parties.map(p => p.id);

    parties.forEach(party => {
        const partyTotalVotes = votes.parties[party.id] || 0;
        if (partyTotalVotes === 0) return;

        // Get this party's candidates
        const partyCands = candidates.filter(c => c.partyId === party.id);
        if (partyCands.length === 0) return;

        // Pattern A: "The Loyalists" (60%) - Rank all party candidates, then neighbors
        const loyalistCount = Math.round(partyTotalVotes * 0.60);
        syntheticBallots.push({
            preferences: generateLoyalistPath(party.id, candidates, partyList),
            count: loyalistCount,
            weight: 1.0
        });

        // Pattern B: "The Pluralists" (25%) - Rank ONLY the first preference (Exhaustion trigger)
        const pluralistCount = Math.round(partyTotalVotes * 0.25);
        syntheticBallots.push({
            preferences: [partyCands[0].id],
            count: pluralistCount,
            weight: 1.0
        });

        // Pattern C: "The Ideologues" (15%) - Rank party candidates, then stop
        const ideologueCount = partyTotalVotes - loyalistCount - pluralistCount; // Remaining
        syntheticBallots.push({
            preferences: partyCands.map(c => c.id),
            count: ideologueCount,
            weight: 1.0
        });
    });

    return syntheticBallots;
}

/** Helper: Creates a full ranking path based on party list proximity **/
function generateLoyalistPath(partyId, allCandidates, partyIdList) {
    const path = [];
    const partyIndex = partyIdList.indexOf(partyId);
    
    // 1. All candidates of own party first
    const ownCands = allCandidates.filter(c => c.partyId === partyId);
    path.push(...ownCands.map(c => c.id));
    
    // 2. Add candidates of the "closest" neighbor party
    if (partyIdList.length > 1) {
        const neighborIndex = partyIndex === 0 ? 1 : partyIndex - 1;
        const neighborId = partyIdList[neighborIndex];
        const neighborCands = allCandidates.filter(c => c.partyId === neighborId);
        path.push(...neighborCands.map(c => c.id));
    }
    
    return path;
}

// Translate ranked ballot data to party vote totals (for hybrid comparisons)
function translateRankedToPartyVotes(ballots) {
    // Use the flattenRankedToPartyVotes helper
    return flattenRankedToPartyVotes(ballots, candidates);
}

// Convert FPTP candidate votes to synthetic IRV ballots
function convertFPTPtoIRVballots(candidateVotes) {
    const ballots = [];
    let totalVotesGenerated = 0; // EDGE CASE: Track total to ensure vote preservation
    
    // Build party index for proximity logic
    const partyList = parties.map(p => p.id); // Represents ideological spectrum
    
    Object.keys(candidateVotes).forEach(candidateId => {
        const votes = candidateVotes[candidateId] || 0;
        if (votes === 0) return;
        
        const candidate = candidates.find(c => c.id == candidateId);
        if (!candidate) return;
        
        const partyIdx = partyList.indexOf(candidate.partyId);
        
        // Find neighboring parties (proximity logic)
        const prevPartyId = partyIdx > 0 ? partyList[partyIdx - 1] : null;
        const nextPartyId = partyIdx < partyList.length - 1 ? partyList[partyIdx + 1] : null;
        
        // Pattern 1: "Loyalist" voters (70%) - rank candidate 1st, then neighbors
        const loyalistCount = Math.round(votes * 0.7);
        if (loyalistCount > 0) {
            ballots.push({
                preferences: generateProximityPath(candidateId, prevPartyId, nextPartyId),
                count: loyalistCount
            });
            totalVotesGenerated += loyalistCount;
        }
        
        // Pattern 2: "Pluralist" voters (30%) - rank ONLY their candidate (simulates exhaustion)
        const pluralistCount = votes - loyalistCount;
        if (pluralistCount > 0) {
            ballots.push({
                preferences: [parseInt(candidateId)],
                count: pluralistCount
            });
            totalVotesGenerated += pluralistCount;
        }
    });
    
    // EDGE CASE: Verify vote count preservation
    const originalTotal = Object.values(candidateVotes).reduce((sum, v) => sum + v, 0);
    if (Math.abs(totalVotesGenerated - originalTotal) > 1) {
        console.warn(`FPTP → IRV: Vote count mismatch - Original: ${originalTotal}, Generated: ${totalVotesGenerated}`);
    }
    
    return ballots;
}

// Helper function to generate proximity-based preference paths
function generateProximityPath(candId, prevPartyId, nextPartyId) {
    const path = [parseInt(candId)];
    
    // Add neighbor candidates if they exist
    if (prevPartyId) {
        const neighbor = candidates.find(c => c.partyId == prevPartyId);
        if (neighbor) path.push(neighbor.id);
    }
    if (nextPartyId) {
        const neighbor = candidates.find(c => c.partyId == nextPartyId);
        if (neighbor) path.push(neighbor.id);
    }
    
    return path;
}

// Convert IRV ranked ballots to FPTP candidate votes (first preferences only)
function convertIRVtoFPTP(ballots) {
    if (!ballots || !Array.isArray(ballots) || ballots.length === 0) {
        console.warn('convertIRVtoFPTP: Invalid or empty ballots array');
        return {};
    }
    
    const candidateVotes = {};
    
    ballots.forEach(ballot => {
        if (ballot && ballot.preferences && ballot.preferences.length > 0) {
            const firstChoice = ballot.preferences[0];
            const count = ballot.count || 1;
            candidateVotes[firstChoice] = (candidateVotes[firstChoice] || 0) + count;
        }
    });
    
    return candidateVotes;
}

// Calculate shadow result for cross-system comparison
function calculateShadowResult(currentSystem, compareToSystem, votes) {
    // Validate compatibility
    const compatibility = {
        'fptp': ['mmp', 'parallel'],  // Enable FPTP to MMP and MMM/Parallel comparison
        'irv': ['fptp'], // Keep IRV → FPTP (simpler: first preference extraction)
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
    let shadowDisclaimer = null;
    
    // MMP/PR → IRV/STV: Generate synthetic ballots with exhausted ballot simulation
    if ((currentSystem === 'mmp' || currentSystem === 'party-list' || currentSystem === 'parallel') && 
        (compareToSystem === 'irv' || compareToSystem === 'stv')) {
        const syntheticBallots = generateSyntheticBallotsFromTotals(votes, candidates, parties);
        translatedVotes = {
            ...votes,
            ballots: syntheticBallots
        };
        shadowDisclaimer = "Note: Ranked ballots were synthesized from party totals using a 60/25/15 distribution model to simulate exhausted ballots.";
    }
    
    // FPTP → IRV: Create synthetic ballots from candidate votes
    if (currentSystem === 'fptp' && compareToSystem === 'irv') {
        translatedVotes = {
            ...votes,
            ballots: convertFPTPtoIRVballots(votes.candidates)
        };
    }
    
    // IRV → FPTP: Extract first preferences from ballots
    if (currentSystem === 'irv' && compareToSystem === 'fptp') {
        // Get ballots from votes object or fallback to stored params
        let ballots = votes.ballots;
        if (!ballots && window.lastCalculationParams && window.lastCalculationParams.ballots) {
            ballots = window.lastCalculationParams.ballots;
            console.log('IRV Comparison: Using ballots from lastCalculationParams');
        }
        
        if (!ballots || ballots.length === 0) {
            console.error('IRV Comparison: No ballots found', {
                votesHasBallots: !!votes.ballots,
                paramsHasBallots: !!(window.lastCalculationParams && window.lastCalculationParams.ballots)
            });
            return { error: 'No ballot data available for IRV to FPTP comparison' };
        }
        
        const candidateVotes = convertIRVtoFPTP(ballots);
        
        // Calculate totalVoters from ballots
        let totalVoters = 0;
        ballots.forEach(ballot => {
            totalVoters += ballot.count || 0;
        });
        
        translatedVotes = {
            ...votes,
            candidates: candidateVotes,
            totalVoters: totalVoters
        };
        
        console.log('IRV → FPTP: Converted ballots to candidate votes', {
            ballotsCount: ballots.length,
            totalVoters: totalVoters,
            candidateVotes: candidateVotes
        });
    }
    
    // FPTP → MMP: Use FPTP party votes as MMP party votes, actual seats as district wins
    if (currentSystem === 'fptp' && compareToSystem === 'mmp') {
        console.log('FPTP → MMP: Translating FPTP legislative data to MMP format');
        
        // FPTP legislative mode already has party votes - use them directly
        translatedVotes = {
            parties: votes.parties,  // Party votes from FPTP legislative
            candidates: {}  // MMP will simulate districts, not needed for shadow comparison
        };
        
        // Get actual FPTP seat distribution to use as forced district wins
        // This shows how MMP would compensate for FPTP's disproportional district results
        const primaryResults = window.lastCalculationResults;
        if (primaryResults && primaryResults.type === 'fptp-legislative' && primaryResults.parties) {
            const fptpDistrictWins = {};
            primaryResults.parties.forEach(party => {
                const partyObj = parties.find(p => p.name === party.name);
                if (partyObj) {
                    fptpDistrictWins[partyObj.id] = party.seats || 0;
                }
            });
            
            translatedVotes._fptpDistrictWins = fptpDistrictWins;
            
            console.log('FPTP → MMP: District wins mapped from FPTP results', fptpDistrictWins);
        }
        
        shadowDisclaimer = "Note: FPTP seat distribution treated as district wins. MMP calculation shows how list seats would compensate for disproportionality.";
    }
    
    // FPTP → Parallel: Use FPTP party votes as Parallel party votes, actual seats as district wins
    if (currentSystem === 'fptp' && compareToSystem === 'parallel') {
        console.log('FPTP → Parallel: Translating FPTP legislative data to Parallel format');
        
        // FPTP legislative mode already has party votes - use them directly
        translatedVotes = {
            parties: votes.parties,  // Party votes from FPTP legislative
            candidates: {}  // Parallel will simulate districts, not needed for shadow comparison
        };
        
        // Get actual FPTP seat distribution to use as forced district wins
        // This shows how Parallel's independent list tier would work with FPTP's district results
        const primaryResults = window.lastCalculationResults;
        if (primaryResults && primaryResults.type === 'fptp-legislative' && primaryResults.parties) {
            const fptpDistrictWins = {};
            primaryResults.parties.forEach(party => {
                const partyObj = parties.find(p => p.name === party.name);
                if (partyObj) {
                    fptpDistrictWins[partyObj.id] = party.seats || 0;
                }
            });
            
            translatedVotes._fptpDistrictWins = fptpDistrictWins;
            
            console.log('FPTP → Parallel: District wins mapped from FPTP results', fptpDistrictWins);
        }
        
        shadowDisclaimer = "Note: FPTP seat distribution treated as district wins. Parallel/MMM calculation shows independent list tier allocation (non-compensatory).";
    }
    
    // STV → Party-List/MMP: Translate ranked to party votes
    if (currentSystem === 'stv' && ['mmp', 'party-list'].includes(compareToSystem)) {
        console.log('STV Comparison Debug: Translating STV ballots to party votes', {
            ballotsCount: votes.ballots?.length,
            compareToSystem: compareToSystem
        });
        
        if (!votes.ballots || votes.ballots.length === 0) {
            console.error('STV Comparison: No ballots found in votes object');
            return { error: 'No ballot data available for comparison' };
        }
        
        // Use translateSTVtoPartyVotes to get both party and candidate votes
        const flattenedData = translateSTVtoPartyVotes(votes.ballots, candidates);
        console.log('STV Comparison Debug: Flattened data', flattenedData);
        
        translatedVotes = {
            parties: flattenedData.parties,
            candidates: flattenedData.candidates
        };
        
        // For MMP Double-Gate: Map STV elected seats to district wins
        // If a party won seats in STV, they should bypass threshold in shadow MMP
        if (compareToSystem === 'mmp') {
            const primaryResults = window.lastCalculationResults;
            const stvDistrictWins = {}; // Map STV seats to "district wins"
            
            if (primaryResults && primaryResults.results) {
                primaryResults.results.forEach(r => {
                    if (r.elected) {
                        const candidate = candidates.find(c => c.name === r.name);
                        if (candidate) {
                            stvDistrictWins[candidate.partyId] = (stvDistrictWins[candidate.partyId] || 0) + 1;
                        }
                    }
                });
            }
            
            // Store district wins for Double-Gate logic in shadow MMP calculation
            translatedVotes._stvDistrictWins = stvDistrictWins;
            console.log('STV Comparison Debug: Mapped STV seats to district wins for Double-Gate', stvDistrictWins);
            
            // NEW: Adjust total voters to account for exhausted ballots in STV
            // This creates a meaningful difference: MMP counts all votes, STV loses some to exhaustion
            if (primaryResults && primaryResults.exhaustedVotes > 0) {
                const originalTotalVoters = primaryResults.totalVotes || 0;
                const exhaustedVotes = primaryResults.exhaustedVotes || 0;
                
                // Shadow MMP calculation should use effective votes (total - exhausted)
                // This simulates: "What if those exhausted voters had voted for a party list instead?"
                translatedVotes.totalVoters = originalTotalVoters - exhaustedVotes;
                translatedVotes._exhaustedInfo = {
                    count: exhaustedVotes,
                    percentage: primaryResults.exhaustedPercentage || 0,
                    note: "STV exhausted ballots would have counted in Party-List/MMP"
                };
                
                console.log(`STV Comparison: ${exhaustedVotes} exhausted votes reduce effective turnout for shadow calculation`);
            }
        }
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
    
    // Handle STV's special parameter requirements
    let shadowResults;
    if (compareToSystem === 'stv') {
        // When comparing TO STV, we need seats, totalVoters, ballots, numBallotTypes
        // Use stored params if available, otherwise extract from translatedVotes
        const params = window.lastCalculationParams || {};
        const seats = params.totalSeats || 10;
        const totalVoters = params.totalVoters || 0;
        const ballots = translatedVotes.ballots || [];
        const numBallotTypes = params.numBallotTypes || 5;
        
        shadowResults = calculateSTV(translatedVotes, seats, totalVoters, ballots, numBallotTypes);
    } else if (currentSystem === 'stv') {
        // When comparing FROM STV, use stored params for additional context
        const params = window.lastCalculationParams || {};
        // For party-list systems, we need threshold and allocationMethod
        if (compareToSystem === 'party-list') {
            shadowResults = calculatePartyListPR(
                translatedVotes, 
                params.totalSeats || 10, 
                params.threshold || 5, 
                params.allocationMethod || 'dhondt'
            );
        } else if (compareToSystem === 'mmp') {
            // For STV → MMP, use district wins from STV results for Double-Gate
            const districtWins = translatedVotes._stvDistrictWins || null;
            
            // CRITICAL: Temporarily disable manual mode for shadow calculation
            const wasManualMode = electionState.isManualSeatMode;
            electionState.isManualSeatMode = false;
            
            shadowResults = calculateMMP(
                translatedVotes, 
                params.districtSeats || Math.floor((params.totalSeats || 10) / 2),
                params.baseListSeats || Math.floor((params.totalSeats || 10) / 2),
                params.threshold || 5,
                params.allocationMethod || 'dhondt',
                params.levelingEnabled || false,
                districtWins // Pass district wins for Double-Gate
            );
            
            // Restore manual mode state
            electionState.isManualSeatMode = wasManualMode;
        } else {
            shadowResults = calculators[compareToSystem](translatedVotes);
        }
    } else if (currentSystem === 'mmp' && compareToSystem === 'parallel') {
        // MMP → Parallel: Use same district winners as primary result
        const params = window.lastCalculationParams || {};
        const primaryResults = window.lastCalculationResults;
        const forcedDistricts = primaryResults?.partyDistrictWins || null;
        
        // CRITICAL: Temporarily disable manual mode for shadow calculation
        const wasManualMode = electionState.isManualSeatMode;
        electionState.isManualSeatMode = false;
        
        shadowResults = calculateParallel(
            translatedVotes,
            params.districtSeats || Math.floor((params.totalSeats || 10) * 0.62),
            params.baseListSeats || Math.floor((params.totalSeats || 10) * 0.38),
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            forcedDistricts // Pass district wins to ensure consistency
        );
        
        // Restore manual mode state
        electionState.isManualSeatMode = wasManualMode;
    } else if (currentSystem === 'parallel' && compareToSystem === 'mmp') {
        // Parallel → MMP: Use same district winners as primary result
        const params = window.lastCalculationParams || {};
        const primaryResults = window.lastCalculationResults;
        const forcedDistricts = primaryResults?.partyDistrictWins || null;
        
        // CRITICAL: Temporarily disable manual mode for shadow calculation
        const wasManualMode = electionState.isManualSeatMode;
        electionState.isManualSeatMode = false;
        
        shadowResults = calculateMMP(
            translatedVotes,
            params.districtSeats || Math.floor((params.totalSeats || 10) / 2),
            params.baseListSeats || Math.floor((params.totalSeats || 10) / 2),
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            params.levelingEnabled || false,
            forcedDistricts // Pass district wins to ensure consistency
        );
        
        // Restore manual mode state
        electionState.isManualSeatMode = wasManualMode;
    } else if (currentSystem === 'fptp' && compareToSystem === 'mmp') {
        // FPTP → MMP: Use FPTP total seats as district count
        const params = window.lastCalculationParams || {};
        const fptpSeats = params.totalSeats || 650;  // Default to UK size if not available
        
        // Use FPTP seats as district tier, add proportional list tier
        // Use 1:1 ratio (same number of list seats as districts) for fair comparison
        const districtSeats = fptpSeats;
        const baseListSeats = fptpSeats;  // Equal tier sizes for proportional compensation
        
        const forcedDistricts = translatedVotes._fptpDistrictWins || null;
        
        // CRITICAL: Temporarily disable manual mode for shadow calculation
        const wasManualMode = electionState.isManualSeatMode;
        electionState.isManualSeatMode = false;
        
        shadowResults = calculateMMP(
            translatedVotes,
            districtSeats,
            baseListSeats,
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            false,  // No leveling for shadow comparison
            forcedDistricts  // Use FPTP's actual seat distribution as district wins
        );
        
        // Restore manual mode state
        electionState.isManualSeatMode = wasManualMode;
        
        console.log('FPTP → MMP Shadow calculation:', {
            districtSeats,
            baseListSeats,
            forcedDistricts,
            shadowResultsSeats: shadowResults?.totalSeats
        });
    } else if (currentSystem === 'fptp' && compareToSystem === 'parallel') {
        // FPTP → Parallel: Use FPTP total seats as district count
        const params = window.lastCalculationParams || {};
        const fptpSeats = params.totalSeats || 650;  // Default to UK size if not available
        
        // For Parallel, use similar tier split to MMP but list tier is independent (non-compensatory)
        // Common Parallel ratios: 60/40 or 62/38 (district/list)
        const districtSeats = fptpSeats;
        const listSeats = Math.round(fptpSeats * 0.6);  // 60% of district seats as list tier
        
        const forcedDistricts = translatedVotes._fptpDistrictWins || null;
        
        // CRITICAL: Temporarily disable manual mode for shadow calculation
        const wasManualMode = electionState.isManualSeatMode;
        electionState.isManualSeatMode = false;
        
        shadowResults = calculateParallel(
            translatedVotes,
            districtSeats,
            listSeats,
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            forcedDistricts  // Use FPTP's actual seat distribution as district wins
        );
        
        // Restore manual mode state
        electionState.isManualSeatMode = wasManualMode;
        
        console.log('FPTP → Parallel Shadow calculation:', {
            districtSeats,
            listSeats,
            totalSeats: districtSeats + listSeats,
            forcedDistricts,
            shadowResultsSeats: shadowResults?.totalSeats
        });
    } else if (currentSystem === 'parallel' && compareToSystem === 'party-list') {
        // Parallel → Party-List: Use party votes only (ignore districts)
        const params = window.lastCalculationParams || {};
        
        shadowResults = calculatePartyListPR(
            translatedVotes,
            params.totalSeats || 10,
            params.threshold || 5,
            params.allocationMethod || 'dhondt'
        );
    } else if (currentSystem === 'mmp' && compareToSystem === 'party-list') {
        // MMP → Party-List: Use only party votes (ignore district seats)
        const params = window.lastCalculationParams || {};
        
        shadowResults = calculatePartyListPR(
            translatedVotes, // Already has votes.parties from MMP
            params.totalSeats || 10,
            params.threshold || 5,
            params.allocationMethod || 'dhondt'
        );
    } else if (currentSystem === 'party-list' && compareToSystem === 'mmp') {
        // Party-List → MMP: Synthesize candidate votes from party votes
        // Assign all party votes to party's first candidate to simulate districts
        const params = window.lastCalculationParams || {};
        const syntheticCandidateVotes = {};
        
        parties.forEach(party => {
            const partyVotes = translatedVotes.parties[party.id] || 0;
            if (partyVotes > 0) {
                // EDGE CASE: Find or create a candidate for this party
                let partyCandidate = candidates.find(c => c.partyId === party.id);
                
                if (!partyCandidate) {
                    // Fallback: Create a "ghost candidate" if party has no candidates
                    console.warn(`Party-List → MMP: Creating ghost candidate for party ${party.name}`);
                    const ghostId = Date.now() + Math.random(); // Unique ID
                    partyCandidate = {
                        id: ghostId,
                        name: `${party.name} Representative`,
                        partyId: party.id
                    };
                    candidates.push(partyCandidate); // Add to candidates array
                }
                
                syntheticCandidateVotes[partyCandidate.id] = partyVotes;
            }
        });
        
        // Add synthetic candidates to translated votes
        translatedVotes.candidates = syntheticCandidateVotes;
        
        shadowResults = calculateMMP(
            translatedVotes,
            params.districtSeats || Math.floor((params.totalSeats || 10) / 2),
            params.baseListSeats || Math.floor((params.totalSeats || 10) / 2),
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            params.levelingEnabled || false,
            null // No forced district wins - let MMP simulate them
        );
    } else if (currentSystem === 'party-list' && compareToSystem === 'parallel') {
        // Party-List → Parallel: Synthesize candidate votes from party votes
        const params = window.lastCalculationParams || {};
        const syntheticCandidateVotes = {};
        
        parties.forEach(party => {
            const partyVotes = translatedVotes.parties[party.id] || 0;
            if (partyVotes > 0) {
                // EDGE CASE: Find or create a candidate for this party
                let partyCandidate = candidates.find(c => c.partyId === party.id);
                
                if (!partyCandidate) {
                    // Fallback: Create a "ghost candidate" if party has no candidates
                    console.warn(`Party-List → Parallel: Creating ghost candidate for party ${party.name}`);
                    const ghostId = Date.now() + Math.random(); // Unique ID
                    partyCandidate = {
                        id: ghostId,
                        name: `${party.name} Representative`,
                        partyId: party.id
                    };
                    candidates.push(partyCandidate); // Add to candidates array
                }
                
                syntheticCandidateVotes[partyCandidate.id] = partyVotes;
            }
        });
        
        translatedVotes.candidates = syntheticCandidateVotes;
        
        shadowResults = calculateParallel(
            translatedVotes,
            params.districtSeats || Math.floor((params.totalSeats || 10) * 0.62),
            params.baseListSeats || Math.floor((params.totalSeats || 10) * 0.38),
            params.threshold || 5,
            params.allocationMethod || 'dhondt',
            null // No forced districts - let Parallel simulate them
        );
    } else {
        // For other systems, use standard calculator call
        shadowResults = calculators[compareToSystem](translatedVotes);
    }
    
    // Add disclaimer to shadow results if available
    if (shadowDisclaimer && shadowResults && !shadowResults.error) {
        shadowResults._shadowDisclaimer = shadowDisclaimer;
    }
    
    return shadowResults;
}

// Get compatible systems for shadow comparison
function getCompatibleSystems(currentSystem) {
    const compatibility = {
        'fptp': ['mmp', 'parallel'],  // Enable FPTP to MMP and MMM/Parallel comparison
        'irv': ['fptp'], // Keep IRV → FPTP (simpler: first preference extraction)
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
    // FPTP legislative uses .parties, other systems use .results
    const primaryParties = primaryResults.parties || primaryResults.results || [];
    const shadowParties = shadowResults.parties || shadowResults.results || [];
    
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
    
    // Calculate totals for percentage calculations
    let totalPrimarySeats = 0;
    let totalShadowSeats = 0;
    partyMap.forEach((data) => {
        totalPrimarySeats += data.primary;
        totalShadowSeats += data.shadow;
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
        
        // Calculate old seat share percentage
        const oldSeatSharePercent = totalPrimarySeats > 0 
            ? (data.primary / totalPrimarySeats * 100).toFixed(1) + '%'
            : '0%';
        const oldSeatShareDisplay = isSingleWinner 
            ? (data.primary === 1 ? '100%' : '0%') 
            : oldSeatSharePercent;
        
        // Calculate new seat share percentage
        const seatSharePercent = totalShadowSeats > 0 
            ? (data.shadow / totalShadowSeats * 100).toFixed(1) + '%'
            : '0%';
        const newSeatShareDisplay = isSingleWinner 
            ? (data.shadow === 1 ? '100%' : '0%') 
            : seatSharePercent;
        
        html += `
            <tr>
                <td class="comparison-table td">
                    <span class="party-label" style="--party-color: ${data.color}; display: inline-block; width: 12px; height: 12px; background: var(--party-color); border-radius: 2px; margin-right: 8px;"></span>
                    ${partyName}
                </td>
                <td class="comparison-table td comparison-table__td--center">${primaryDisplay}</td>
                <td class="comparison-table td comparison-table__td--center">${oldSeatShareDisplay}</td>
                <td class="comparison-table td comparison-table__td--center">${shadowDisplay}</td>
                <td class="comparison-table td comparison-table__td--center">${newSeatShareDisplay}</td>
                <td class="comparison-table td comparison-table__td--center ${diffClass}">
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
    // FPTP legislative uses .parties, other systems use .results
    const primaryParties = primaryResults.parties || primaryResults.results || [];
    const shadowParties = shadowResults.parties || shadowResults.results || [];
    
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
        const isImprovement = parseFloat(gDiff) < 0;
        
        // Skip detailed metrics here since we now have dedicated metrics section above
        // Just provide high-level interpretation
        
        if (Math.abs(gDiff) < 0.5) {
            insight += `<p style="margin-bottom: 10px;">Both systems produced remarkably similar levels of proportionality for this specific vote distribution.</p>`;
        } else if (isImprovement) {
            insight += `<p style="margin-bottom: 10px;">Switching from ${currentName} to ${compareName} significantly improves proportionality, reducing representation gaps and giving smaller parties fairer seat allocations.</p>`;
        } else {
            insight += `<p style="margin-bottom: 10px;">Switching from ${currentName} to ${compareName} increases disproportionality, which may strengthen governing majorities but reduces proportional representation.</p>`;
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
    
    // Add STV-specific insight about exhausted ballots
    if (currentSystem === 'stv' && (compareSystem === 'mmp' || compareSystem === 'party-list')) {
        const primaryResults = window.lastCalculationResults;
        if (primaryResults.exhaustedVotes && primaryResults.exhaustedVotes > 0) {
            const exhaustedPct = primaryResults.exhaustedPercentage || 0;
            insight += `<p style="margin-top: 15px; padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                <strong>🔍 Key Difference:</strong> In STV, ${formatNumber(primaryResults.exhaustedVotes)} ballots (${exhaustedPct.toFixed(1)}%) were exhausted 
                when all their ranked preferences were eliminated. In ${compareName}, these voters would have their votes count toward their first-choice party, 
                potentially changing the final seat distribution. This is why ranked-choice systems can produce different outcomes than party-list systems 
                even with similar voter preferences.
            </p>`;
        }
    }
    
    // Add insight about final round vs first choice
    if (currentSystem === 'stv') {
        insight += `<p style="margin-top: 10px; font-size: 0.95em; color: #666;">
            <strong>Note:</strong> STV's seat distribution reflects the final round tallies after vote transfers, 
            while the comparison system uses only first preferences. This difference captures the unique effect of ranked voting.
        </p>`;
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

// Generate metrics display for a single system
function generateMetricsDisplay(results) {
    // Handle different result structures (FPTP legislative uses .parties)
    const hasDisproportionality = results.disproportionality !== undefined;
    const hasGallagher = results.gallagher !== undefined;
    
    if (!hasDisproportionality || !hasGallagher) {
        return '<p style="color: #718096; font-style: italic;">Metrics not available for this system</p>';
    }
    
    const lhIndex = results.disproportionality;
    const gallagherIndex = results.gallagher;
    
    // Get fairness grade based on Gallagher Index
    const gradeInfo = getGallagherGrade(gallagherIndex, results.type);
    
    return `
        <div style="margin-bottom: 10px;">
            <strong style="color: #2d3748;">Loosemore-Hanby Index:</strong> 
            <span style="font-size: 1.1em; color: #4a5568;">${lhIndex.toFixed(2)}%</span>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #2d3748;">Gallagher Index (LSq):</strong> 
            <span style="font-size: 1.1em; color: #4a5568;">${gallagherIndex.toFixed(2)}%</span>
        </div>
        <div style="margin-top: 12px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid ${gradeInfo.color};">
            <strong style="color: ${gradeInfo.color};">Fairness Grade: ${gradeInfo.grade}</strong>
            <span style="color: #718096;"> (${gradeInfo.label})</span>
            <div style="margin-top: 5px; font-size: 0.9em; color: #4a5568;">
                ${getProportionalityDescription(gallagherIndex)}
            </div>
        </div>
    `;
}

function getProportionalityDescription(gallagherIndex) {
    if (gallagherIndex < 3) {
        return `Highly Proportional: ${gallagherIndex.toFixed(1)}% of seats deviate from perfect proportionality.`;
    } else if (gallagherIndex < 5) {
        return `Very Proportional: ${gallagherIndex.toFixed(1)}% deviation from perfect proportionality.`;
    } else if (gallagherIndex < 8) {
        return `Moderately Proportional: ${gallagherIndex.toFixed(1)}% deviation from ideal representation.`;
    } else if (gallagherIndex < 12) {
        return `Low Proportionality: ${gallagherIndex.toFixed(1)}% deviation indicates significant distortion.`;
    } else if (gallagherIndex < 18) {
        return `Poor Proportionality: ${gallagherIndex.toFixed(1)}% deviation shows major representation gaps.`;
    } else {
        return `Highly Disproportional: ${gallagherIndex.toFixed(1)}% deviation indicates severe representation distortion.`;
    }
}

function generateMetricsComparison(primaryResults, shadowResults, currentSystem, compareSystem) {
    const systemNames = {
        'fptp': 'FPTP',
        'irv': 'IRV',
        'party-list': 'Party-List PR',
        'mmp': 'MMP',
        'parallel': 'Parallel',
        'stv': 'STV'
    };
    
    // Check if metrics are available
    if (!primaryResults.disproportionality || !shadowResults.disproportionality ||
        !primaryResults.gallagher || !shadowResults.gallagher) {
        return '';
    }
    
    const lhDiff = shadowResults.disproportionality - primaryResults.disproportionality;
    const gallagherDiff = shadowResults.gallagher - primaryResults.gallagher;
    
    // Determine if it's an improvement (negative diff) or regression (positive diff)
    const lhImprovement = lhDiff < 0;
    const gallagherImprovement = gallagherDiff < 0;
    
    const lhIcon = lhImprovement ? '📈 Improvement' : '📉 Regression';
    const gallagherIcon = gallagherImprovement ? '📈 Improvement' : '📉 Regression';
    
    const lhColor = lhImprovement ? '#2ecc71' : '#e74c3c';
    const gallagherColor = gallagherImprovement ? '#2ecc71' : '#e74c3c';
    
    const lhSign = lhDiff > 0 ? '+' : '';
    const gallagherSign = gallagherDiff > 0 ? '+' : '';
    
    return `
        <div style="padding: 15px; background: #edf2f7; border-radius: 6px; border-top: 2px solid #cbd5e0;">
            <h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 0.95em;">Impact Analysis</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 12px; background: white; border-radius: 4px; border-left: 3px solid ${lhColor};">
                    <div style="font-weight: 600; color: ${lhColor}; margin-bottom: 5px;">${lhIcon}</div>
                    <div style="color: #2d3748;">Loosemore-Hanby: <strong style="color: ${lhColor};">${lhSign}${Math.abs(lhDiff).toFixed(2)}%</strong></div>
                    <div style="margin-top: 5px; font-size: 0.85em; color: #718096;">
                        ${Math.abs(lhDiff).toFixed(2)}% ${lhImprovement ? 'reduction' : 'increase'} in disproportionality
                    </div>
                </div>
                
                <div style="padding: 12px; background: white; border-radius: 4px; border-left: 3px solid ${gallagherColor};">
                    <div style="font-weight: 600; color: ${gallagherColor}; margin-bottom: 5px;">${gallagherIcon}</div>
                    <div style="color: #2d3748;">Gallagher Index: <strong style="color: ${gallagherColor};">${gallagherSign}${Math.abs(gallagherDiff).toFixed(2)}%</strong></div>
                    <div style="margin-top: 5px; font-size: 0.85em; color: #718096;">
                        ${Math.abs(gallagherDiff).toFixed(2)}% ${gallagherImprovement ? 'improvement' : 'worsening'} (academic standard)
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 12px; padding: 10px; background: white; border-radius: 4px;">
                <em style="color: #4a5568; font-size: 0.9em;">
                    💡 The Gallagher Index penalizes large deviations more heavily and is the academic standard for measuring proportionality.
                </em>
            </div>
        </div>
    `;
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
    
    console.log('showShadowResult Debug:', {
        currentSystem,
        compareSystem,
        votesExists: !!votes,
        primaryResultsExists: !!primaryResults,
        votesStructure: votes ? Object.keys(votes) : null,
        primaryResultsStructure: primaryResults ? Object.keys(primaryResults) : null
    });
    
    if (!currentSystem || !votes || !primaryResults) {
        alert('Please calculate results first');
        return;
    }
    
    const shadowResults = calculateShadowResult(currentSystem, compareSystem, votes);
    
    console.log('showShadowResult: Shadow results received', {
        hasError: !!shadowResults.error,
        error: shadowResults.error,
        resultsType: shadowResults?.type,
        resultsCount: shadowResults?.results?.length
    });
    
    if (shadowResults.error) {
        alert(shadowResults.error);
        return;
    }
    
    if (!shadowResults || !shadowResults.results) {
        console.error('showShadowResult: Invalid shadow results', shadowResults);
        alert('Failed to calculate comparison. Please check console for details.');
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
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th style="padding: 12px; text-align: left;">Party</th>
                        <th style="padding: 12px; text-align: center;">${systemNames[currentSystem]} Seats</th>
                        <th style="padding: 12px; text-align: center;">Old Seat Share</th>
                        <th style="padding: 12px; text-align: center;">${systemNames[compareSystem]} Seats</th>
                        <th style="padding: 12px; text-align: center;">New Seat Share</th>
                        <th style="padding: 12px; text-align: center;">Difference</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateComparisonRows(primaryResults, shadowResults)}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 1.1em;">📊 Disproportionality Metrics</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                    <!-- Primary System Metrics -->
                    <div style="padding: 15px; background: #f7fafc; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #4a5568; font-size: 0.95em;">${systemNames[currentSystem]}</h4>
                        ${generateMetricsDisplay(primaryResults)}
                    </div>
                    
                    <!-- Shadow System Metrics -->
                    <div style="padding: 15px; background: #f7fafc; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #4a5568; font-size: 0.95em;">${systemNames[compareSystem]}</h4>
                        ${generateMetricsDisplay(shadowResults)}
                    </div>
                </div>
                
                <!-- Improvement/Regression Indicators -->
                ${generateMetricsComparison(primaryResults, shadowResults, currentSystem, compareSystem)}
            </div>
            
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
        
        // NEW: Store results for logic trace
        window.lastCalculationResults = results;
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
    
    // Add Simulation Notes section for auditability
    const simulationNotes = [];
    if (results.tieDetected && results.tieInfo) {
        const entities = results.tieInfo.tiedEntities.join(' and ');
        simulationNotes.push(`<strong>Tie-Breaking:</strong> Winner chosen by secure random draw due to absolute tie between ${entities}.`);
    }
    if (results.otherNotes && Array.isArray(results.otherNotes)) {
        results.otherNotes.forEach(note => simulationNotes.push(note));
    }
    
    if (simulationNotes.length > 0) {
        html += `
            <div class="simulation-notes" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #495057;">📋 Simulation Notes</h3>
                <div class="notes-content">
                    ${simulationNotes.map(note => `<p style="margin: 8px 0; color: #495057;">${note}</p>`).join('')}
                </div>
            </div>
        `;
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
    let candidateVotesChartData = [];  // NEW: Add function-scope declaration for MMP/Parallel
    
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
    } else if (results.type === 'fptp-legislative') {
        html += '<h3>FPTP Legislative Results</h3>';
        html += `<p>${results.note}</p>`;
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
        html += '<thead><tr>';
        html += '<th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Party</th>';
        html += '<th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Votes</th>';
        html += '<th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Vote %</th>';
        html += '<th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Seats</th>';
        html += '<th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Seat %</th>';
        html += '<th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Bonus/Penalty</th>';
        html += '</tr></thead><tbody>';
        
        results.parties.forEach(party => {
            const bonusColor = party.bonus > 0 ? '#4caf50' : (party.bonus < 0 ? '#f44336' : '#666');
            const bonusSign = party.bonus > 0 ? '+' : '';
            html += '<tr>';
            html += `<td style="padding: 10px; border-bottom: 1px solid #eee;">
                       <span style="display: inline-block; width: 12px; height: 12px; background-color: ${party.color}; border-radius: 50%; margin-right: 8px;"></span>
                       ${party.name}
                     </td>`;
            html += `<td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${party.votes.toLocaleString()}</td>`;
            html += `<td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${party.votePercentage.toFixed(2)}%</td>`;
            html += `<td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${party.seats}</td>`;
            html += `<td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${party.seatPercentage.toFixed(2)}%</td>`;
            html += `<td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee; color: ${bonusColor}; font-weight: 600;">
                       ${bonusSign}${party.bonus.toFixed(2)}%
                     </td>`;
            html += '</tr>';
        });
        html += '</tbody></table>';
        
        // Add charts section
        html += '<div class="charts-container">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="seatsChart" width="400" height="400"></canvas>';
        html += '<canvas id="comparisonChart" width="600" height="400"></canvas>';
        html += '</div>';
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
        
        // Show Base vs Final parliament size for MMP with leveling
        if (results.type === 'mixed' && results.levelingEnabled && results.baseParliamentSize !== results.finalParliamentSize) {
            html += `
                <div class="parliament-size-info">
                    <h3>🏛️ Parliament Size</h3>
                    <p><strong>Base Size:</strong> ${results.baseParliamentSize} seats</p>
                    <p><strong>Final Size:</strong> ${results.finalParliamentSize} seats</p>
                    <p><strong>Leveling Seats Added:</strong> ${results.levelingSeatsAdded} seats</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        German-style leveling seats were added to restore proportionality.
                    </p>
                </div>
            `;
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
            
            // Show dual percentage if different (for qualifying vote share)
            const percentageDisplay = r.qualifyingPercentage !== undefined && 
                                    Math.abs(r.percentage - r.qualifyingPercentage) > 0.1
                ? `${r.percentage.toFixed(1)}% of total (${r.qualifyingPercentage.toFixed(1)}% of qualifying votes)`
                : `${r.percentage.toFixed(1)}%`;
            
            // Show "wasted votes" indicator for non-qualifying parties
            const wastedVotesIndicator = r.isQualifying === false && r.votes > 0
                ? ' <span style="color: #e74c3c; font-size: 0.9em;">(wasted votes)</span>'
                : '';
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}; ${r.belowThreshold ? 'opacity: 0.6;' : ''}">
                    <div class="result-info">
                        <div class="result-name">${r.name}${statusBadge}</div>
                        <div class="result-stats">
                            ${formatNumber(r.votes)} votes (${percentageDisplay})${wastedVotesIndicator} • ${r.seats} seats (${seatPercentage.toFixed(1)}%)
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
        
        // Top Candidates section removed - candidates are auto-generated for party-list systems
    } else if (results.type === 'mixed') {
        // NEW: Show manual mode indicator
        if (results.isManualMode) {
            html += `
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
                    <h3 style="margin: 0 0 10px 0; color: #1565c0;">🔧 Manual Seat Entry Mode Active</h3>
                    <p style="margin: 0 0 10px 0; color: #1976d2;">
                        Results show manually entered seat allocations compared to calculated values.
                    </p>
                    <button onclick="showLogicTrace()" style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        📊 View Logic Trace
                    </button>
                </div>
            `;
        }
        
        // Add charts section with two-row layout (Option B)
        html += '<div class="charts-container" style="flex-direction: column; gap: 20px;">';
        // Top row: Party votesChart and comparisonChart
        html += '<div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 20px;">';
        html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        html += '<canvas id="comparisonChart" width="600" height="400"></canvas>';
        html += '</div>';
        // Bottom row: candidateVotesChart and seatsChart
        html += '<div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 20px;">';
        html += '<canvas id="candidateVotesChart" width="400" height="400"></canvas>';
        html += '<canvas id="seatsChart" width="400" height="400"></canvas>';
        html += '</div>';
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
            
            // NEW: Add mismatch indicator for manual mode
            if (results.isManualMode && r.seatDifference !== undefined && r.seatDifference !== 0) {
                const diffColor = r.seatDifference > 0 ? '#2ecc71' : '#e74c3c';
                const diffSign = r.seatDifference > 0 ? '+' : '';
                statusBadge += ` <span style="background: ${diffColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.85em; margin-left: 8px;">
                    ${diffSign}${r.seatDifference} vs calculated
                </span>`;
            }
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}; ${r.belowThreshold ? 'opacity: 0.6;' : ''}">
                    <div class="result-info">
                        <div class="result-name">${r.name}${statusBadge}</div>
                        <div class="result-stats">
                            ${formatNumber(r.votes)} votes (${r.percentage.toFixed(1)}%) • 
                            ${r.seats} total seats ${r.districtSeats !== undefined ? `(${r.districtSeats} district + ${r.listSeats} list)` : `(${seatPercentage.toFixed(1)}%)`}
                            ${results.isManualMode && r.calculatedSeats !== undefined ? ` • Calculated: ${r.calculatedSeats} seats` : ''}
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
        
        // Sort votesChartData by vote count (highest to lowest) for MMP/Parallel
        votesChartData.sort((a, b) => b.value - a.value);
        
        // NEW: Collect candidate vote data for the 4th chart
        // candidateVotesChartData already declared at function scope
        const candidateVotes = window.lastCalculationVotes.candidates || {};
        
        candidates.forEach(candidate => {
            const party = parties.find(p => p.id === candidate.partyId);
            const votes = candidateVotes[candidate.id] || 0;
            
            if (votes > 0) {
                candidateVotesChartData.push({
                    label: candidate.name,
                    value: votes,
                    color: party ? party.color : '#999'
                });
            }
        });
        
        // Sort candidateVotesChartData by vote count (highest to lowest)
        candidateVotesChartData.sort((a, b) => b.value - a.value);
        
        // Store comparison data for later use
        results._comparisonData = comparisonData;
    } else if (results.type === 'multi-winner') {
        // Add pie charts section
        // For STV (ranking system), only show seats chart centered
        const isSTV = system === 'stv';
        html += '<div class="charts-container">';
        if (!isSTV) {
            html += '<canvas id="votesChart" width="400" height="400"></canvas>';
        }
        html += '<canvas id="seatsChart" width="400" height="400"' + (isSTV ? ' style="margin: 0 auto;"' : '') + '></canvas>';
        html += '</div>';
        
        html += `
            <div style="margin-top: 20px;">
                <button onclick="toggleElectedCandidates()" style="
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
                    <span><span id="electedCandidatesIcon">▶</span> Elected Candidates</span>
                    <span style="font-size: 0.9em; opacity: 0.9;">(Click to expand)</span>
                </button>
                <div id="electedCandidatesPanel" style="display: none; margin-top: 15px;">
        `;
        results.results.forEach(r => {
            const isGenerated = r.isGenerated || false;
            const generationReason = r.generationReason; // 'no-candidates' or 'insufficient'
            
            let badgeHtml = '';
            if (isGenerated) {
                if (generationReason === 'no-candidates') {
                    badgeHtml = `
                        <span style="
                            background: #e74c3c; 
                            color: white; 
                            padding: 2px 8px; 
                            border-radius: 4px; 
                            font-size: 0.75em; 
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-left: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">Auto-Generated (No Candidates Added)</span>
                    `;
                } else if (generationReason === 'insufficient') {
                    badgeHtml = `
                        <span style="
                            background: #f39c12; 
                            color: white; 
                            padding: 2px 8px; 
                            border-radius: 4px; 
                            font-size: 0.75em; 
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-left: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">Auto-Generated (Insufficient Candidates)</span>
                    `;
                } else {
                    // Generic generated badge (for backward compatibility)
                    badgeHtml = `
                        <span style="
                            background: #667eea; 
                            color: white; 
                            padding: 2px 8px; 
                            border-radius: 4px; 
                            font-size: 0.75em; 
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-left: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">Auto-Generated</span>
                    `;
                }
            }
            
            html += `
                <div class="result-item" style="border-left-color: ${r.color}; ${isGenerated ? 'background: #f0f4ff;' : ''}">
                    <div class="result-info">
                        <div class="result-name">
                            ${r.name}
                            ${badgeHtml}
                            ${r.elected ? '<span class="winner-badge">ELECTED</span>' : ''}
                        </div>
                        <div class="result-stats">
                            ${r.party} • ${formatNumber(Math.round(r.votes))} votes • ${r.percentage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="result-bar">
                        <div class="result-bar-fill" style="width: ${r.percentage}%">
                        </div>
                    </div>
                    ${!r.elected && r.eliminationRound ? `
                        <p style="font-size: 0.9em; color: #666; margin-top: 4px; font-style: italic;">
                            Eliminated in Round ${r.eliminationRound} with ${r.quotaPercentage.toFixed(1)}% of quota
                        </p>
                    ` : ''}
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
        
        html += `
                </div>
            </div>
        `;
        
        // Group seats by party for the pie chart (STV only)
        if (system === 'stv') {
            const partySeats = {};
            const partyColors = {};
            
            results.results.forEach(r => {
                if (r.elected) {
                    partySeats[r.party] = (partySeats[r.party] || 0) + 1;
                    if (!partyColors[r.party]) {
                        partyColors[r.party] = r.color;
                    }
                }
            });
            
            // Rebuild seatsChartData with party aggregates
            seatsChartData = [];
            Object.keys(partySeats).forEach(partyName => {
                seatsChartData.push({
                    label: partyName,
                    value: partySeats[partyName],
                    color: partyColors[partyName]
                });
            });
            
            // Display aggregate party results below the candidate list
            html += '<h3 style="margin-top: 30px;">Party Seat Distribution</h3>';
            html += '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">';
            
            // Sort parties by seats (descending)
            const sortedParties = Object.keys(partySeats).sort((a, b) => partySeats[b] - partySeats[a]);
            
            const totalSeats = Object.values(partySeats).reduce((sum, seats) => sum + seats, 0);
            
            sortedParties.forEach(partyName => {
                const seats = partySeats[partyName];
                const percentage = ((seats / totalSeats) * 100).toFixed(1);
                const color = partyColors[partyName];
                
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; background: white; border-radius: 6px; border-left: 4px solid ${color};">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 20px; height: 20px; background: ${color}; border-radius: 4px;"></div>
                            <strong style="font-size: 1.1em;">${partyName}</strong>
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <span style="font-size: 1.1em; color: #666;">${percentage}%</span>
                            <span style="font-size: 1.2em; font-weight: bold; color: #333; min-width: 80px; text-align: right;">${seats} seat${seats !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        // Display simulation notes if any generated candidates exist
        const hasGeneratedCandidates = results.results.some(r => r.isGenerated);
        if (hasGeneratedCandidates) {
            const noCandidatesCount = results.results.filter(r => r.generationReason === 'no-candidates').length;
            const insufficientCount = results.results.filter(r => r.generationReason === 'insufficient').length;
            
            html += `<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196f3;">
                <strong>📘 Candidate Generation Notes:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                    ${noCandidatesCount > 0 ? `<li style="margin: 5px 0;"><strong>${noCandidatesCount} candidate(s)</strong> were auto-generated because their party earned seats but had no candidates added in Step 3 (Political Parties section).</li>` : ''}
                    ${insufficientCount > 0 ? `<li style="margin: 5px 0;"><strong>${insufficientCount} candidate(s)</strong> were auto-generated because their party earned more seats than the number of candidates added in Step 3.</li>` : ''}
                </ul>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <strong>Tip:</strong> To avoid auto-generation, ensure each party has at least as many candidates as seats they might win. 
                    In STV, parties can win multiple seats based on their vote share.
                </p>
            </div>`;
        }
        
        // Display simulation notes if any generated candidates exist
        if (results.otherNotes && results.otherNotes.length > 0) {
            html += `<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196f3;">
                <strong>📘 Simulation Notes:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                    ${results.otherNotes.map(note => `<li style="margin: 5px 0;">${note}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        if (results.quota) {
            html += `<p style="margin-top: 10px;"><strong>Quota needed:</strong> ${formatNumber(Math.round(results.quota))} votes</p>`;
        }
        
        // Display round-by-round flow for STV
        if (system === 'stv' && results.rounds && results.rounds.length > 0) {
            // Build candidates array from results (includes generated candidates for party-based STV)
            // Check if rounds contain party_id (indicating party-based STV)
            const isPartyBased = results.rounds.length > 0 && results.rounds[0].party_id !== undefined;
            
            let allCandidatesForDisplay = candidates; // Default to original candidates
            
            if (isPartyBased && results.results) {
                // For party-based STV, reconstruct candidate objects from results
                // Results contain candidate IDs and all necessary information
                const candidatesMap = new Map();
                
                // Add all candidates from results (these include generated candidates with their IDs)
                results.results.forEach(r => {
                    if (r.id) {
                        const party = parties.find(p => p.name === r.party);
                        if (party) {
                            // Check if this candidate already exists in the original candidates array
                            const existingCandidate = candidates.find(c => c.id === r.id);
                            if (existingCandidate) {
                                candidatesMap.set(r.id, existingCandidate);
                            } else {
                                // This is a generated candidate - create object with stored ID
                                candidatesMap.set(r.id, {
                                    id: r.id,
                                    name: r.name,
                                    partyId: party.id,
                                    party: r.party,
                                    color: r.color,
                                    isGenerated: r.isGenerated || false,
                                    generationReason: r.generationReason || null
                                });
                            }
                        }
                    }
                });
                
                // Also add original candidates that might not be in results
                candidates.forEach(c => {
                    if (!candidatesMap.has(c.id)) {
                        candidatesMap.set(c.id, c);
                    }
                });
                
                allCandidatesForDisplay = Array.from(candidatesMap.values());
            }
            
            html += createRoundByRoundDisplay(results.rounds, allCandidatesForDisplay, 'stv', parties);
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
    // Skip comparison section for STV (per user request)
    const compatibleSystems = getCompatibleSystems(system);
    // Show comparison section if there are compatible systems
    if (compatibleSystems.length > 0 && system !== 'stv') {
        const systemFullNames = {
            'fptp': 'First-Past-the-Post',
            'irv': 'Instant-Runoff Voting',
            'party-list': 'Party-List Proportional Representation',
            'mmp': 'Mixed-Member Proportional',
            'parallel': 'Parallel Voting / Mixed-Member Majoritarian',
            'stv': 'Single Transferable Vote'
        };
        
        html += `
        <div class="comparison-section" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef;">
            <h3 style="color: #495057; margin: 0 0 10px 0;">📊 Compare to Alternative System</h3>
            <p style="color: #666; margin-bottom: 15px;">See how these same votes would produce different results under another electoral system.</p>
        `;
        
        // Show normal dropdown for all systems that have compatible options
        html += `
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
        `;
        
        html += `</div>`;
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
                const votesTitle = results.type === 'approval' ? 'Vote Distribution (Approvals)' 
                    : (results.type === 'mixed' ? 'Party Vote Distribution' : 'Vote Distribution');
                window.createPieChart('votesChart', votesChartData, votesTitle);
            }
            
            // For party and mixed systems, use comparison bar chart instead of pie chart
            if ((results.type === 'party' || results.type === 'mixed') && results._comparisonData) {
                window.createComparisonBarChart('comparisonChart', results._comparisonData, 'Vote Share vs Seat Share');
                
                // For mixed systems, also create seat distribution pie chart
                if (results.type === 'mixed' && seatsChartData.length > 0) {
                    window.createPieChart('seatsChart', seatsChartData, 'Seat Distribution');
                }
                
                // Create candidate votes chart for MMP/Parallel systems
                if (results.type === 'mixed' && candidateVotesChartData && candidateVotesChartData.length > 0) {
                    window.createPieChart('candidateVotesChart', candidateVotesChartData, 'Candidate Vote Distribution');
                }
            } else if (results.type === 'fptp-legislative') {
                // FPTP Legislative mode: display vote share and seat distribution
                const voteChartData = results.parties.map(p => ({
                    label: p.name,
                    value: p.votePercentage,
                    color: p.color
                }));
                
                const seatChartData = results.parties.map(p => ({
                    label: p.name,
                    value: p.seatPercentage,
                    color: p.color
                }));
                
                const comparisonData = results.parties.map(p => ({
                    label: p.name,        // Changed from 'party' to 'label'
                    votePct: p.votePercentage,   // Changed from 'voteShare' to 'votePct'
                    seatPct: p.seatPercentage,   // Changed from 'seatShare' to 'seatPct'
                    color: p.color
                }));
                
                window.createPieChart('votesChart', voteChartData, 'Vote Share');
                window.createPieChart('seatsChart', seatChartData, 'Seat Distribution');
                window.createComparisonBarChart('comparisonChart', comparisonData, 'Vote Share vs Seat Share');
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

// Toggle function for STV elected candidates collapsible section
window.toggleElectedCandidates = function() {
    const panel = document.getElementById('electedCandidatesPanel');
    const icon = document.getElementById('electedCandidatesIcon');
    
    if (panel && icon) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            icon.textContent = '▼';
        } else {
            panel.style.display = 'none';
            icon.textContent = '▶';
        }
    }
};

// Toggle function for elimination rounds collapsible section
window.toggleEliminationRounds = function() {
    const panel = document.getElementById('eliminationRoundsPanel');
    const icon = document.getElementById('eliminationRoundsIcon');
    
    if (panel && icon) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            icon.textContent = '▼';
        } else {
            panel.style.display = 'none';
            icon.textContent = '▶';
        }
    }
};

// Toggle function for presets panel
window.togglePresetsPanel = function() {
    const panel = document.getElementById('presetsPanel');
    const icon = document.getElementById('presetsToggleIcon');
    
    if (panel && icon) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            icon.textContent = '▼';
        } else {
            panel.style.display = 'none';
            icon.textContent = '▶';
        }
    }
};
