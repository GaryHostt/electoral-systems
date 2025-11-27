/**
 * AI Analysis for Main Page
 * Integrated Mistral AI analysis directly in the simulation
 */

async function getAIAnalysisMain() {
    const btn = document.getElementById('aiAnalysisBtn');
    const responseDiv = document.getElementById('aiResponseMain');
    
    // Get election data from global variable or localStorage
    const electionData = window.lastElectionResults || (() => {
        try {
            const data = localStorage.getItem('lastElectionResults');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading election data:', e);
            return null;
        }
    })();
    
    if (!electionData) {
        responseDiv.innerHTML = '<div class="error-message"><strong>⚠️ No election data found.</strong><br>Please run an election simulation first.</div>';
        responseDiv.classList.add('show');
        return;
    }
    
    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
    
    // Build the prompt
    const prompt = buildAnalysisPromptMain(electionData);
    
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
            <h3>🎓 Expert Analysis</h3>
            <div class="ai-content">${analysis.replace(/\n/g, '<br>')}</div>
            <div class="ai-footer">
                <em>Analysis provided by Mistral AI</em>
            </div>
        `;
        responseDiv.classList.add('show');
        
    } catch (error) {
        console.error('Error calling Mistral API:', error);
        
        // Check if it's an API key issue
        if (error.message.includes('401') || error.message.includes('403')) {
            responseDiv.innerHTML = `
                <div class="error-message">
                    <p><strong>⚠️ API Authentication Error</strong></p>
                    <p>There was an issue with the Mistral API key. Please check the configuration.</p>
                </div>
            `;
        } else {
            responseDiv.innerHTML = `
                <div class="error-message">
                    <p><strong>⚠️ Error:</strong> ${error.message}</p>
                    <p>Please check your internet connection and try again.</p>
                </div>
            `;
        }
        responseDiv.classList.add('show');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.innerHTML = '<span>🔍</span> Get AI Analysis of This Election';
    }
}

function buildAnalysisPromptMain(data) {
    const { system, systemKey, results, parameters } = data;
    
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

// Make functions globally available
window.getAIAnalysisMain = getAIAnalysisMain;
window.buildAnalysisPromptMain = buildAnalysisPromptMain;

