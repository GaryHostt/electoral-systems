# Electoral Systems Simulator - Comprehensive Improvements Implementation Plan

## ✅ Completed So Far:

### 1. Code Organization
- ✅ Created separate `calculations.js` module for core algorithms
- ✅ Added `getSeatsCount()` function for configurable seats based on race type
- ✅ Integrated calculations.js into index.html

### 2. Seat Allocation Methods
- ✅ Implemented D'Hondt method (favors larger parties)
- ✅ Implemented Sainte-Laguë method (more proportional)
- ✅ Added UI selector for allocation method
- ✅ Implemented Loosemore-Hanby Index for disproportionality measurement
- ✅ Updated calculateClosedList() to use new methods

### 3. IRV/STV Improvements
- ✅ Implemented full IRV with proper vote transfers in calculations.js
- ✅ Implemented full STV with Droop Quota and surplus transfer in calculations.js

## 🔄 In Progress:

### 4. Update All Calculation Functions
Need to update the following functions to use new methods:
- calculateOpenList() - use new allocation methods
- calculateMMP() - implement overhang seats properly
- calculateParallel() - use new allocation methods
- calculateIRV() - integrate full IRV implementation with round-by-round display
- calculateSTV() - integrate full STV implementation with round-by-round display

### 5. Visualization Improvements
- Add vote vs seat comparison bar charts
- Display Loosemore-Hanby Index prominently for PR systems
- Add round-by-round visualization for IRV/STV
- Replace second pie chart with comparative bar chart for PR systems

### 6. Gibbard-Satterthwaite Analysis
- Add strategic voting susceptibility analysis for each system
- Integrate into Arrow's Theorem section

### 7. MMP Overhang Seats
- Implement proper overhang seat calculation
- Expand parliament size when parties win more district seats than entitled

### 8. Multi-Seat Plurality Systems
- Improve Block Voting simulation
- Enhance Limited Voting with strategic considerations

## 📋 Remaining Tasks:

1. Update calculateOpenList to use allocation methods
2. Implement proper MMP overhang seats
3. Update calculateParallel to use allocation methods
4. Integrate full IRV implementation with UI display
5. Integrate full STV implementation with UI display
6. Add round-by-round visualization component
7. Create bar chart comparison function
8. Add Gibbard-Satterthwaite analysis text
9. Update displayResults() to show new metrics
10. Test all systems with new implementations

## Implementation Notes:

### Loosemore-Hanby Index
- Formula: D = (1/2) × Σ|Vote Share - Seat Share|
- 0 = perfect proportionality
- Higher values = more disproportional

### Droop Quota (STV)
- Formula: Q = floor(Total Votes / (Seats + 1)) + 1
- Minimum votes needed to guarantee election

### Overhang Seats (MMP)
- When party wins more district seats than proportional entitlement
- Keep the won seats, expand parliament size
- Recalculate other parties' seats to maintain proportionality

### Strategic Voting (Gibbard-Satterthwaite)
- All non-dictatorial systems with 3+ candidates are manipulable
- FPTP: Vote splitting, tactical voting for "lesser evil"
- IRV: Candidate ranking manipulation
- Approval: Strategic threshold setting

## Current File Structure:

```
/Users/alex.macdonald/cursor-1234/
├── index.html (main UI)
├── styles.css (styling)
├── app.js (main application logic)
├── calculations.js (NEW - core algorithms)
└── README.md (documentation)
```

