/**
 * Tie-Breaking Helper Functions
 * Implements explicit tie resolution with notification
 */

/**
 * Generate cryptographically secure random integer
 * Uses Web Crypto API for unpredictable random number generation
 * @param {Number} max - Upper bound (exclusive)
 * @returns {Number} - Random integer from 0 to max-1
 */
function getSecureRandomInt(max) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}

/**
 * Detect and resolve ties in candidate/party results
 * @param {Array} results - Array of result objects with votes property
 * @param {String} type - 'candidate' or 'party'
 * @returns {Object} - {winner, tieDetected, tiedEntities, method}
 */
function resolveTie(results, type = 'candidate') {
    if (results.length === 0) return null;
    
    // Find maximum votes
    const maxVotes = Math.max(...results.map(r => r.votes));
    
    // Find all entities with max votes
    const topResults = results.filter(r => r.votes === maxVotes);
    
    if (topResults.length === 1) {
        // No tie - clear winner
        return {
            winner: topResults[0],
            tieDetected: false
        };
    }
    
    // Tie detected - use cryptographically secure random lot drawing
    const winner = topResults[getSecureRandomInt(topResults.length)];
    
    return {
        winner: winner,
        tieDetected: true,
        tiedEntities: topResults.map(r => r.name),
        tieVotes: maxVotes,
        method: 'cryptographic_random_lot',
        numTied: topResults.length
    };
}

/**
 * Create HTML for tie notification
 * @param {Object} tieInfo - Tie information from resolveTie()
 * @param {String} systemName - Name of electoral system
 * @returns {String} - HTML string
 */
function createTieNotification(tieInfo, systemName) {
    if (!tieInfo.tieDetected) return '';
    
    const entities = tieInfo.tiedEntities.join(', ');
    const votes = tieInfo.tieVotes.toLocaleString();
    
    return `
        <div class="tie-notification" style="
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            animation: slideDown 0.3s ease-out;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">
                ⚖️ Tie Detected
            </h4>
            <p style="margin: 0 0 10px 0; color: #856404;">
                <strong>${tieInfo.numTied} candidates tied</strong> with ${votes} votes each:
            </p>
            <p style="margin: 0 0 10px 0; color: #856404; font-style: italic;">
                ${entities}
            </p>
            <p style="margin: 0; color: #856404;">
                <strong>Resolution Method:</strong> Random lot drawing (simulated coin toss)
                <br>
                <strong>Winner:</strong> ${tieInfo.winner.name}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">
                ℹ️ In real ${systemName} elections, ties are typically resolved by:
                drawing lots, coin toss, or using secondary criteria (age, alphabetical order, etc.)
            </p>
        </div>
    `;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        resolveTie,
        createTieNotification
    };
}

