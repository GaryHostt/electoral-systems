// Diagnostic script to debug the issue
console.log('🔍 DIAGNOSTIC SCRIPT LOADED');

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM Content Loaded');
    
    // Check if elements exist
    const elements = {
        select: document.getElementById('electoralSystem'),
        parties: document.getElementById('partiesSection'),
        candidates: document.getElementById('candidatesSection'),
        voting: document.getElementById('votingSection')
    };
    
    console.log('🔍 Elements check:', {
        select: !!elements.select,
        parties: !!elements.parties,
        candidates: !!elements.candidates,
        voting: !!elements.voting
    });
    
    if (elements.parties) {
        console.log('🔍 Parties section initial style:', {
            display: elements.parties.style.display,
            computed: window.getComputedStyle(elements.parties).display
        });
    }
    
    // Add a test change listener
    if (elements.select) {
        elements.select.addEventListener('change', function() {
            console.log('🔍 DROPDOWN CHANGED to:', this.value);
            
            setTimeout(() => {
                if (elements.parties) {
                    console.log('🔍 After 100ms - Parties section:', {
                        inlineDisplay: elements.parties.style.display,
                        computedDisplay: window.getComputedStyle(elements.parties).display,
                        visibility: window.getComputedStyle(elements.parties).visibility,
                        height: elements.parties.offsetHeight,
                        width: elements.parties.offsetWidth
                    });
                }
            }, 100);
        });
    }
});
