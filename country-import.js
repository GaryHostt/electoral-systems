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
    
    // Clear existing parties
    if (parties.length > 0) {
        if (!confirm(`This will replace your current ${parties.length} parties with parties from ${country}. Continue?`)) {
            return;
        }
    }
    
    parties = [];
    candidates = [];
    
    // Add parties from country
    partyData.forEach((party, index) => {
        parties.push({
            id: Date.now() + index,
            name: party.name,
            color: party.color
        });
    });
    
    // Update all UI elements
    updatePartiesList();  // This updates the parties display
    updateCandidatePartySelect();
    updateVotingInputs();
    
    // Collapse the import panel after import
    const panel = document.getElementById('countryImportPanel');
    const icon = document.getElementById('countryToggleIcon');
    panel.style.display = 'none';
    icon.textContent = '▶';
    icon.classList.remove('open');
    
    alert(`✅ Imported ${parties.length} political parties from ${country}!\n\nParties now appear in the list below.`);
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
    
    alert('✅ Votes auto-filled with realistic random values!');
};

