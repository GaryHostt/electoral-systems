# ✨ Percentage-Based Ballot Input for Ranked Voting Systems

## Feature Update
Changed ballot input from **absolute counts** to **percentages** for ranked voting systems (IRV, STV, Borda, Condorcet).

## Why This Change?
**Before**: Users had to manually calculate how many ballots represented each ranking pattern  
**After**: Users simply enter the percentage of voters with each pattern

### Example:
- **Old way**: "If I have 10,000 voters and 35% rank Alice > Bob > Carol, I need to enter 3,500" ❌
- **New way**: "35% of voters rank Alice > Bob > Carol, so I enter 35" ✅

## Implementation

### User Interface (`app.js`)
**Updated: `updateRankingBallots()`**
- Changed input from text field ("Ballots:") to number field ("% of Voters:")
- Input type: `number` with `min="0"`, `max="100"`, `step="0.1"`
- Visual indicator: "%" symbol next to input
- Updated helper text to explain percentage usage

### Calculation Logic
**All ranking system calculators now:**

1. **Get total vote count** from first-preference candidate votes
2. **Read percentage inputs** (0-100%)
3. **Convert to actual ballot counts**: 
   ```javascript
   const count = Math.round((percentage / 100) * totalVotes);
   ```
4. **Use these counts** in ranking calculations

**Files Updated:**
- `app.js` - `calculateIRV()` and `calculateSTV()`
- `borda-condorcet.js` - `calculateBorda()` and `calculateCondorcet()`

### Backend Integration (`advanced-features.js`)
**Updated: `generateRealisticBallots()`**
- Calculates percentages from generated ballot counts
- Fills percentage inputs instead of count inputs
- Formula: `percentage = (ballot.count / total_voters * 100).toFixed(1)`

## Benefits

### For Users:
- ✅ **No mental math required** - think in natural percentages
- ✅ **More intuitive** - "30% of voters prefer X" is clearer than "3,742 ballots"
- ✅ **Scale independent** - percentages work whether you have 100 or 1,000,000 voters
- ✅ **Flexible** - percentages don't need to sum to 100% (accounts for voters not in these patterns)

### Technical:
- ✅ **Automatic scaling** - ballot counts calculated from total votes
- ✅ **Precision** - uses floating point for accurate calculations (step="0.1")
- ✅ **Validation** - min/max constraints prevent invalid input

## Usage Flow

### Manual Input:
1. Select ranking system (IRV, STV, Borda, Condorcet)
2. Add parties and candidates
3. **Enter first-preference votes** (used as base total)
4. In ranking ballots section, **enter percentages** for each ballot pattern
5. Calculate results - percentages automatically converted to counts

### Generated Input:
1. Use "Generate Realistic Ballots" feature
2. Backend returns ballot counts
3. Frontend **automatically calculates and displays percentages**
4. User can adjust percentages as needed

## Example

**Scenario**: 10,000 total voters across 3 candidates

**Ballot Types**:
- 45% rank: Alice > Bob > Carol (→ 4,500 ballots)
- 35% rank: Bob > Alice > Carol (→ 3,500 ballots)
- 20% rank: Carol > Bob > Alice (→ 2,000 ballots)

**User enters**: 45, 35, 20  
**System calculates**: 4,500, 3,500, 2,000 ballots internally

## Technical Details

### Input Element:
```html
<input type="number" id="ballot-${i}-percentage" 
       min="0" max="100" step="0.1" value="0" />
<span>%</span>
```

### Conversion Formula:
```javascript
// Get total from first-preference votes
let totalVotes = candidates.reduce((sum, c) => 
    sum + parseFormattedNumber(document.getElementById(`candidate-${c.id}`).value), 0
);

// Convert each percentage to count
const percentage = parseFloat(document.getElementById(`ballot-${i}-percentage`).value);
const count = Math.round((percentage / 100) * totalVotes);
```

### Validation:
- **Min**: 0% (no negative values)
- **Max**: 100% (can't exceed 100% for a single pattern)
- **Step**: 0.1% (allows precision like 12.5%)
- **Total can exceed 100%**: Valid if voters vote multiple times or patterns overlap

## Files Modified
- ✅ `app.js` - Updated `updateRankingBallots()`, `calculateIRV()`, `calculateSTV()`
- ✅ `borda-condorcet.js` - Updated `calculateBorda()`, `calculateCondorcet()`
- ✅ `advanced-features.js` - Updated `generateRealisticBallots()` to fill percentages
- ✅ `docs/PERCENTAGE_BALLOT_INPUT.md` - This documentation

## Backward Compatibility
- Old ballot count inputs (`ballot-${i}-count`) replaced entirely
- No migration needed - fresh UI on each load
- Previous results/scenarios using counts will need re-entry as percentages

---

**Status**: ✅ Complete and tested  
**Date**: November 27, 2025  
**User Benefit**: Eliminates manual math, more intuitive input

