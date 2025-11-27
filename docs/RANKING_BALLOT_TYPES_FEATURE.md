# ✨ Customizable Ballot Types for Ranked Voting Systems

## Feature Added
Users can now specify how many ballot types they want for ranked voting systems (IRV, STV, Borda, Condorcet).

## Implementation

### User Interface (`index.html`)
Added a new control in the Ranking Ballots section:
- **Input field**: "Number of Ballot Types" (range: 1-20, default: 5)
- Updates dynamically when changed using `onchange="updateRankingBallots()"`
- Provides clear guidance with helper text

### JavaScript Logic (`app.js`)
**New Function: `updateRankingBallots()`**
- Reads the `numBallotTypes` input value
- Dynamically generates ballot type cards (min: 1, max: 20)
- Each ballot type includes:
  - Ranking dropdowns (1st choice, 2nd choice, etc.)
  - Ballot count input
  - Clear visual numbering

**Updated: `updateVotingInputs()`**
- Now shows/hides ranking section based on system type
- Calls `updateRankingBallots()` when ranking systems are selected
- Ranking section is separate from main voting inputs

### Backend Integration (`advanced-features.js`)
**Updated: `generateRealisticBallots()`**
- Now respects user-specified number of ballot types
- Fills up to the maximum user-defined slots
- Provides feedback: "Filled X out of Y ballot type slots"

## Usage

### For Users:
1. Select a ranking system (IRV, STV, Borda, or Condorcet)
2. Add parties and candidates
3. In the **Ranking Ballots** section, adjust "Number of Ballot Types" (1-20)
4. The ballot type cards update instantly
5. Fill in manually OR use "Generate Realistic Ballots" to auto-fill

### Example Scenarios:
- **Small election (3-4 candidates)**: Set to 3-5 ballot types
- **Medium election (5-8 candidates)**: Set to 8-12 ballot types
- **Large election (10+ candidates)**: Set to 15-20 ballot types

## Benefits
- **Flexibility**: Users control the level of detail in their simulation
- **Scalability**: Can simulate simple or complex voter preference patterns
- **Realism**: More ballot types = more realistic voter behavior modeling
- **Performance**: Fewer ballot types = faster input for quick tests

## Technical Details

### HTML Structure:
```html
<div id="rankingBallotsSection" style="display: none;">
    <input type="number" id="numBallotTypes" min="1" max="20" value="5" 
           onchange="updateRankingBallots()">
    <div id="rankingBallotsContainer"></div>
</div>
```

### JavaScript Flow:
1. User changes number → `updateRankingBallots()` fires
2. Function reads value, clamps between 1-20
3. Generates HTML for N ballot cards
4. Each card has ranking dropdowns + count input
5. Existing values preserved if ballot types already filled

### Compatibility:
- ✅ Works with manual input
- ✅ Works with "Generate Realistic Ballots" (Python backend)
- ✅ Responsive design (grid layout)
- ✅ Number formatting preserved

## Files Modified
- `index.html` - Added ranking ballots section with control
- `app.js` - Added `updateRankingBallots()` function, updated `updateVotingInputs()`
- `advanced-features.js` - Updated `generateRealisticBallots()` to respect user limit
- `RANKING_BALLOT_TYPES_FEATURE.md` - This documentation

---

**Status**: ✅ Complete and tested
**Date**: November 27, 2025

