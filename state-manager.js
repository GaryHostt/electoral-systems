/**
 * State Management Module
 * Maintains application state to reduce DOM reads
 */

// Application State
const voteState = {
    parties: {},
    candidates: {},
    rankings: {}
};

/**
 * Initialize vote state for all parties and candidates
 */
function initializeVoteState() {
    voteState.parties = {};
    voteState.candidates = {};
    
    parties.forEach(party => {
        voteState.parties[party.id] = 0;
    });
    
    candidates.forEach(candidate => {
        voteState.candidates[candidate.id] = 0;
    });
}

/**
 * Update party vote in state
 */
function updatePartyVoteState(partyId, value) {
    voteState.parties[partyId] = parseFormattedNumber(value);
}

/**
 * Update candidate vote in state
 */
function updateCandidateVoteState(candidateId, value) {
    voteState.candidates[candidateId] = parseFormattedNumber(value);
}

/**
 * Get votes from state (faster than DOM reads)
 */
function getVotesFromState() {
    return {
        parties: { ...voteState.parties },
        candidates: { ...voteState.candidates }
    };
}

/**
 * Attach event listeners to vote inputs to update state
 */
function attachVoteStateListeners() {
    // Party vote inputs
    parties.forEach(party => {
        const input = document.getElementById(`party-${party.id}`);
        if (input) {
            input.addEventListener('input', (e) => {
                updatePartyVoteState(party.id, e.target.value);
            });
            input.addEventListener('blur', (e) => {
                formatNumberInput(e);
                updatePartyVoteState(party.id, e.target.value);
            });
        }
    });
    
    // Candidate vote inputs
    candidates.forEach(candidate => {
        const input = document.getElementById(`candidate-${candidate.id}`);
        if (input) {
            input.addEventListener('input', (e) => {
                updateCandidateVoteState(candidate.id, e.target.value);
            });
            input.addEventListener('blur', (e) => {
                formatNumberInput(e);
                updateCandidateVoteState(candidate.id, e.target.value);
            });
        }
    });
}

/**
 * Sync DOM to state (call after inputs are created)
 */
function syncDOMToState() {
    parties.forEach(party => {
        const input = document.getElementById(`party-${party.id}`);
        if (input) {
            voteState.parties[party.id] = parseFormattedNumber(input.value);
        }
    });
    
    candidates.forEach(candidate => {
        const input = document.getElementById(`candidate-${candidate.id}`);
        if (input) {
            voteState.candidates[candidate.id] = parseFormattedNumber(input.value);
        }
    });
}

