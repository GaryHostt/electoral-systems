// Country Political Parties Data
const countryParties = {
    USA: [
        { name: 'Democratic Party', color: '#0015BC' },
        { name: 'Republican Party', color: '#E81B23' },
        { name: 'Libertarian Party', color: '#FED105' },
        { name: 'Green Party', color: '#17AA5C' }
    ],
    Canada: [
        { name: 'Liberal Party', color: '#D71920' },
        { name: 'Conservative Party', color: '#1A4782' },
        { name: 'New Democratic Party', color: '#F37021' },
        { name: 'Bloc Québécois', color: '#33B2CC' },
        { name: 'Green Party', color: '#3D9B35' }
    ],
    Taiwan: [
        { name: 'Democratic Progressive Party (DPP)', color: '#1B9431' },
        { name: 'Kuomintang (KMT)', color: '#000095' },
        { name: 'Taiwan People\'s Party (TPP)', color: '#28C7C7' },
        { name: 'Taiwan Statebuilding Party', color: '#C20F2F' }
    ],
    France: [
        { name: 'La République En Marche! (LREM)', color: '#FFB400' },
        { name: 'National Rally (RN)', color: '#0D378A' },
        { name: 'La France Insoumise (LFI)', color: '#CC2443' },
        { name: 'The Republicans (LR)', color: '#0066CC' },
        { name: 'Socialist Party (PS)', color: '#E4007C' },
        { name: 'Europe Ecology – The Greens', color: '#00C000' }
    ],
    Germany: [
        { name: 'Christian Democratic Union (CDU)', color: '#000000' },
        { name: 'Social Democratic Party (SPD)', color: '#E3000F' },
        { name: 'Alliance 90/The Greens', color: '#64A12D' },
        { name: 'Free Democratic Party (FDP)', color: '#FFED00' },
        { name: 'The Left', color: '#BE3075' },
        { name: 'Alternative for Germany (AfD)', color: '#009EE0' }
    ],
    Chile: [
        { name: 'Christian Democratic Party', color: '#FF7F00' },
        { name: 'Socialist Party', color: '#ED1624' },
        { name: 'Communist Party', color: '#C8161D' },
        { name: 'Independent Democratic Union (UDI)', color: '#003F87' },
        { name: 'National Renewal (RN)', color: '#00A8E1' },
        { name: 'Social Convergence', color: '#9B1D20' }
    ],
    Spain: [
        { name: 'Spanish Socialist Workers\' Party (PSOE)', color: '#EF1921' },
        { name: 'People\'s Party (PP)', color: '#0AB2DB' },
        { name: 'Vox', color: '#5AC035' },
        { name: 'Podemos', color: '#682283' },
        { name: 'Citizens (Cs)', color: '#EB5E0B' }
    ],
    Italy: [
        { name: 'Brothers of Italy (FdI)', color: '#003366' },
        { name: 'Democratic Party (PD)', color: '#EF3E42' },
        { name: 'Five Star Movement (M5S)', color: '#FFDE16' },
        { name: 'League (Lega)', color: '#0E6F3E' },
        { name: 'Forza Italia', color: '#0047AB' },
        { name: 'Action–Italy Alive', color: '#E9B000' }
    ],
    Finland: [
        { name: 'Social Democratic Party (SDP)', color: '#E11931' },
        { name: 'Finns Party', color: '#FFDE55' },
        { name: 'National Coalition Party', color: '#006288' },
        { name: 'Centre Party', color: '#3AAA35' },
        { name: 'Green League', color: '#61BF1A' },
        { name: 'Left Alliance', color: '#D71920' },
        { name: 'Swedish People\'s Party', color: '#FFDD00' },
        { name: 'Christian Democrats', color: '#2B5797' }
    ],
    Austria: [
        { name: 'Austrian People\'s Party (ÖVP)', color: '#63C3D1' },
        { name: 'Social Democratic Party (SPÖ)', color: '#CE000C' },
        { name: 'Freedom Party (FPÖ)', color: '#0056A2' },
        { name: 'The Greens', color: '#87B52D' },
        { name: 'NEOS', color: '#E83896' }
    ],
    Portugal: [
        { name: 'Socialist Party (PS)', color: '#FF66FF' },
        { name: 'Social Democratic Party (PSD)', color: '#FF6600' },
        { name: 'Chega', color: '#1A1A4E' },
        { name: 'Liberal Initiative', color: '#00ADEF' },
        { name: 'Left Bloc', color: '#8B0000' }
    ],
    Poland: [
        { name: 'Law and Justice (PiS)', color: '#003A79' },
        { name: 'Civic Platform (PO)', color: '#FF5800' },
        { name: 'The Left', color: '#EC1D25' },
        { name: 'Polish Coalition', color: '#00A550' },
        { name: 'Confederation', color: '#2B4C8A' },
        { name: 'Poland 2050', color: '#FFDE00' }
    ],
    Ireland: [
        { name: 'Fianna Fáil', color: '#66BB66' },
        { name: 'Fine Gael', color: '#6699FF' },
        { name: 'Sinn Féin', color: '#326760' },
        { name: 'Labour Party', color: '#CC0000' },
        { name: 'Green Party', color: '#99CC33' }
    ],
    Estonia: [
        { name: 'Reform Party', color: '#FFB600' },
        { name: 'Centre Party', color: '#007B5F' },
        { name: 'Conservative People\'s Party (EKRE)', color: '#0E4C92' },
        { name: 'Social Democratic Party', color: '#E10600' },
        { name: 'Isamaa', color: '#00AEEF' }
    ],
    Latvia: [
        { name: 'New Unity', color: '#F7941D' },
        { name: 'National Alliance', color: '#70147A' },
        { name: 'Union of Greens and Farmers', color: '#00A84F' },
        { name: 'Harmony', color: '#E30613' },
        { name: 'For Stability!', color: '#0066B3' },
        { name: 'Latvia First', color: '#ED1B24' }
    ],
    Lithuania: [
        { name: 'Homeland Union', color: '#004B9B' },
        { name: 'Lithuanian Social Democratic Party', color: '#E30613' },
        { name: 'Liberal Movement', color: '#F5A300' },
        { name: 'Labour Party', color: '#DD1F21' },
        { name: 'Freedom Party', color: '#F37021' },
        { name: 'Lithuanian Farmers and Greens Union', color: '#00843D' }
    ],
    Sweden: [
        { name: 'Moderates (Moderaterna)', color: '#005EA8' },
        { name: 'Sweden Democrats (Sverigedemokraterna)', color: '#FFD500' },
        { name: 'Christian Democrats (Kristdemokraterna)', color: '#0059A3' },
        { name: 'Liberals (Liberalerna)', color: '#006AB3' },
        { name: 'Social Democrats (Socialdemokraterna)', color: '#E8112D' },
        { name: 'Left Party (Vänsterpartiet)', color: '#DA291C' },
        { name: 'Green Party (Miljöpartiet)', color: '#53A045' },
        { name: 'Centre Party (Centerpartiet)', color: '#009933' }
    ]
};

// Toggle country import panel
window.toggleCountryImport = function() {
    const panel = document.getElementById('countryImportPanel');
    const icon = document.getElementById('countryToggleIcon');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        icon.textContent = '▼';
        icon.classList.add('open');
    } else {
        panel.style.display = 'none';
        icon.textContent = '▶';
        icon.classList.remove('open');
    }
};

// Import country parties function
window.importCountryParties = function(country) {
    const partyData = countryParties[country];
    if (!partyData) {
        alert(`No party data available for ${country}`);
        return;
    }
    
    // If switching countries, clear existing parties with confirmation
    if (electionState.parties.length > 0) {
        const confirmMsg = electionState.importedCountry && electionState.importedCountry !== country
            ? `This will replace your current ${electionState.importedCountry} parties with parties from ${country}. Continue?`
            : `This will replace your current ${electionState.parties.length} parties with parties from ${country}. Continue?`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
    }
    
    // Add parties from country
    const importedParties = partyData.map((party, index) => ({
        id: Date.now() + index,
        name: party.name,
        color: party.color
    }));
    
    // Use setState to update state
    setState({
        importedCountry: country,
        parties: importedParties,
        candidates: [] // Clear candidates when importing new country
    });
    
    // Update all UI elements
    updatePartiesList();  // This updates the parties display
    updateCountryIndicator(); // Show which country is imported
    updateCandidatePartySelect();
    updateVotingInputs();
    
    // Collapse the import panel after import
    const panel = document.getElementById('countryImportPanel');
    const icon = document.getElementById('countryToggleIcon');
    panel.style.display = 'none';
    icon.textContent = '▶';
    icon.classList.remove('open');
    
    alert(`✅ Imported ${importedParties.length} political parties from ${country}!\n\nParties now appear in the list below.`);
};

// Autofill votes function
window.autofillVotes = function() {
    const system = document.getElementById('electoralSystem').value;
    
    if (!system) {
        alert('Please select an electoral system first');
        return;
    }
    
    if (candidates.length === 0 && parties.length === 0) {
        alert('Please add parties and/or candidates first');
        return;
    }
    
    // Helper function to format numbers with commas
    const formatNum = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // Generate random realistic vote totals
    const baseVotes = 50000;
    const variation = 0.7; // 70% variation
    
    // Fill candidate votes
    candidates.forEach(candidate => {
        const randomFactor = 0.3 + Math.random() * variation;
        const votes = Math.floor(baseVotes * randomFactor);
        const input = document.getElementById(`candidate-${candidate.id}`);
        if (input) {
            input.value = formatNum(votes);
        } else {
            console.warn(`Input not found for candidate ${candidate.id}`);
        }
    });
    
    // Fill party votes (for systems that use them)
    const systemsWithPartyVote = ['party-list', 'mmp', 'parallel'];
    if (systemsWithPartyVote.includes(system)) {
        parties.forEach(party => {
            const randomFactor = 0.3 + Math.random() * variation;
            const votes = Math.floor(baseVotes * randomFactor * 1.5); // Party votes are typically higher
            const input = document.getElementById(`party-${party.id}`);
            if (input) {
                input.value = formatNum(votes);
            } else {
                console.warn(`Input not found for party ${party.id}`);
            }
        });
    }
    
    // Fill ranking ballots for IRV/STV systems
    const rankingSystems = ['irv', 'stv'];
    if (rankingSystems.includes(system)) {
        const isSTV = system === 'stv';
        
        // Validation: STV needs parties, IRV needs candidates
        if (isSTV) {
            if (parties.length < 2) {
                alert('Please add at least 2 parties first for STV ranking');
                return;
            }
        } else {
            if (candidates.length === 0) {
                alert('Please add candidates first for IRV ranking');
                return;
            }
        }
        
        // Ensure numBallotTypes is set to 3
        const numBallotTypesInput = document.getElementById('numBallotTypes');
        if (numBallotTypesInput) {
            numBallotTypesInput.value = 3;
        }
        
        // Generate "Core Strength" pattern: creates Condorcet cycle
        let partyIds;
        let candidatesByParty = {};
        
        if (isSTV) {
            // For STV: use party IDs directly
            partyIds = parties.map(p => p.id);
        } else {
            // For IRV: group candidates by party
            candidates.forEach(candidate => {
                if (!candidatesByParty[candidate.partyId]) {
                    candidatesByParty[candidate.partyId] = [];
                }
                candidatesByParty[candidate.partyId].push(candidate);
            });
            partyIds = Object.keys(candidatesByParty);
        }
        
        if (partyIds.length < 2) {
            alert(`Please add ${isSTV ? 'at least 2 parties' : 'candidates from at least 2 different parties'} for ranking systems`);
            return;
        }
        
        // Create 3 ballot patterns with "Core Strength" approach
        const percentages = [40, 35, 25];
        const ballotNames = ['Ballot Type 1', 'Ballot Type 2', 'Ballot Type 3'];
        
        // Use custom event pattern instead of setTimeout
        const container = document.getElementById('rankingBallotsContainer');
        if (!container) {
            alert('Ranking ballots container not found');
            return;
        }
        
        // Listen for ballotsRendered event
        const handleBallotsRendered = () => {
            for (let i = 0; i < 3; i++) {
                // Set ballot name
                const nameInput = document.getElementById(`ballot-${i}-name`);
                if (nameInput) {
                    nameInput.value = ballotNames[i];
                }
                
                // Set percentage
                const percentageInput = document.getElementById(`ballot-${i}-percentage`);
                if (percentageInput) {
                    percentageInput.value = percentages[i];
                }
                
                // Set rankings using "Core Strength" pattern
                // Ballot 1: Party A strong (1st), Party B 2nd, Party C 3rd...
                // Ballot 2: Party B strong (1st), Party C 2nd, Party A 3rd...
                // Ballot 3: Party C strong (1st), Party A 2nd, Party B 3rd...
                const primaryPartyIndex = i % partyIds.length;
                const secondaryPartyIndex = (i + 1) % partyIds.length;
                const tertiaryPartyIndex = (i + 2) % partyIds.length;
                
                if (isSTV) {
                    // STV: Set party IDs directly
                    const primaryPartyId = partyIds[primaryPartyIndex];
                    const secondaryPartyId = partyIds[secondaryPartyIndex];
                    const tertiaryPartyId = partyIds[tertiaryPartyIndex];
                    
                    // Set 1st choice: primary party
                    const firstChoiceSelect = document.getElementById(`ballot-${i}-rank-1`);
                    if (firstChoiceSelect) {
                        firstChoiceSelect.value = primaryPartyId;
                        firstChoiceSelect.dispatchEvent(new Event('change'));
                    }
                    
                    // Set 2nd choice: secondary party
                    if (partyIds.length >= 2) {
                        const secondChoiceSelect = document.getElementById(`ballot-${i}-rank-2`);
                        if (secondChoiceSelect) {
                            secondChoiceSelect.value = secondaryPartyId;
                            secondChoiceSelect.dispatchEvent(new Event('change'));
                        }
                    }
                    
                    // Set 3rd choice: tertiary party (if exists)
                    if (partyIds.length >= 3) {
                        const thirdChoiceSelect = document.getElementById(`ballot-${i}-rank-3`);
                        if (thirdChoiceSelect) {
                            thirdChoiceSelect.value = tertiaryPartyId;
                            thirdChoiceSelect.dispatchEvent(new Event('change'));
                        }
                    }
                } else {
                    // IRV: Set candidate IDs (existing logic)
                    const primaryParty = partyIds[primaryPartyIndex];
                    const secondaryParty = partyIds[secondaryPartyIndex];
                    const tertiaryParty = partyIds[tertiaryPartyIndex];
                    
                    // Set 1st choice: first candidate from primary party
                    const firstChoiceSelect = document.getElementById(`ballot-${i}-rank-1`);
                    if (firstChoiceSelect && candidatesByParty[primaryParty].length > 0) {
                        firstChoiceSelect.value = candidatesByParty[primaryParty][0].id;
                        firstChoiceSelect.dispatchEvent(new Event('change'));
                    }
                    
                    // Set 2nd choice: first candidate from secondary party
                    if (candidates.length >= 2) {
                        const secondChoiceSelect = document.getElementById(`ballot-${i}-rank-2`);
                        if (secondChoiceSelect && candidatesByParty[secondaryParty].length > 0) {
                            secondChoiceSelect.value = candidatesByParty[secondaryParty][0].id;
                            secondChoiceSelect.dispatchEvent(new Event('change'));
                        }
                    }
                    
                    // Set 3rd choice: first candidate from tertiary party (if exists)
                    if (candidates.length >= 3 && partyIds.length >= 3) {
                        const thirdChoiceSelect = document.getElementById(`ballot-${i}-rank-3`);
                        if (thirdChoiceSelect && candidatesByParty[tertiaryParty].length > 0) {
                            thirdChoiceSelect.value = candidatesByParty[tertiaryParty][0].id;
                            thirdChoiceSelect.dispatchEvent(new Event('change'));
                        }
                    }
                }
            }
            
            // Trigger percentage validation
            if (typeof validateBallotPercentages === 'function') {
                validateBallotPercentages();
            }
            
            alert('✅ Ranking ballots auto-filled with "Core Strength" pattern (creates Condorcet cycle)!');
            
            // Remove event listener after handling
            container.removeEventListener('ballotsRendered', handleBallotsRendered);
        };
        
        // Add event listener
        container.addEventListener('ballotsRendered', handleBallotsRendered, { once: true });
        
        // Trigger rendering
        if (typeof updateRankingBallots === 'function') {
            updateRankingBallots();
        }
        
        return; // Don't show the generic alert for ranking systems
    }
    
    alert('✅ Votes auto-filled with realistic random values!');
};

