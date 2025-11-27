# System Verification and Race Type Fix

**Date:** November 27, 2025  
**Issue:** MMP and Parallel not distinguishing between Single Race and Legislative simulations

---

## Problem Identified

The user correctly identified that **MMP** and **Parallel Voting** were not properly handling the race type selection:

### What Should Happen:

| System | Single Race (1 seat) | Legislative (10 seats) |
|--------|---------------------|------------------------|
| **STV** | ❌ Disabled (needs multi-seat) | ✅ 3 seats elected via ranked ballots |
| **Party-List PR** | ❌ Disabled (legislative only) | ✅ 10 seats allocated proportionally |
| **MMP** | ✅ 1 district + compensatory list | ✅ 5 districts + 5 compensatory list |
| **Parallel** | ✅ 1 district + independent list | ✅ 5 districts + 5 independent list |

### What Was Happening:

MMP and Parallel were **always** splitting seats 50/50 between district and list, regardless of race type selection. This meant:
- **Single Race** mode: Still calculated 0.5 district seats (nonsensical)
- **Legislative** mode: Worked correctly but without clear distinction

---

## Solution Applied

### Fix 1: Detect Race Type in Calculations

**MMP (`calculateMMP()`):**
```javascript
// BEFORE (WRONG):
const districtSeats = Math.floor(totalSeats / 2);
const listSeats = totalSeats - districtSeats;

// AFTER (CORRECT):
const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
const districtSeats = raceType === 'single' ? 1 : Math.floor(totalSeats / 2);
const listSeats = totalSeats - districtSeats;
```

**Parallel (`calculateParallel()`):**
```javascript
// BEFORE (WRONG):
const districtSeats = Math.floor(totalSeats / 2);
const listSeats = totalSeats - districtSeats;

// AFTER (CORRECT):
const raceType = document.querySelector('input[name="raceType"]:checked')?.value || 'single';
const districtSeats = raceType === 'single' ? 1 : Math.floor(totalSeats / 2);
const listSeats = totalSeats - districtSeats;
```

### Fix 2: Add Descriptive Notes

**MMP:**
```javascript
const raceTypeNote = raceType === 'single' 
    ? "Single District: Simulating 1 constituency race (FPTP) with compensatory list seats added to achieve proportionality"
    : `Legislative Simulation: ${districtSeats} district races (FPTP) with ${listSeats} compensatory list seats for overall proportionality`;

return {
    ...
    raceType: raceType,
    note: raceTypeNote
};
```

**Parallel:**
```javascript
const raceTypeNote = raceType === 'single'
    ? "Single District: Simulating 1 constituency race (FPTP) with separate list seats (non-compensatory)"
    : `Legislative Simulation: ${districtSeats} district races (FPTP) with ${listSeats} list seats calculated independently (non-compensatory)`;

return {
    ...
    raceType: raceType,
    note: raceTypeNote
};
```

---

## Verification Tests

### Test 1: STV (Legislative Only) ✅

**Setup:**
1. Select "Single Transferable Vote (STV)"
2. Race type: "Entire Legislature" (forced, single disabled)
3. Add 5 parties and candidates
4. Set up ranking ballots

**Expected:**
- 3 seats elected
- Round-by-round elimination/election table
- Droop Quota displayed

**Result:** ✅ Works correctly

---

### Test 2: Party-List PR (Legislative Only) ✅

**Setup:**
1. Select "Party-List Proportional Representation (PR)"
2. Race type: "Entire Legislature" (forced, single disabled)
3. Add 4 parties
4. Set party votes (or auto-fill)
5. Set threshold: 5%
6. Set allocation method: D'Hondt or Sainte-Laguë

**Expected:**
- 10 seats allocated proportionally
- Parties below threshold flagged
- Disproportionality index shown
- Vote% vs Seat% comparison chart

**Result:** ✅ Works correctly

---

### Test 3: MMP - Single Race Mode ✅

**Setup:**
1. Select "Mixed-Member Proportional (MMP)"
2. Race type: **🏁 Single Race (1 seat)**
3. Add 4 parties
4. Add 4 candidates (one per party)
5. Enter candidate votes (district vote)
6. Enter party votes (list vote)
7. Set threshold: 5%

**Expected Results:**
- **Total Seats:** 1 seat
- **District Seats:** 1 (winner of candidate race)
- **List Seats:** 0 (compensatory to achieve proportionality for 1 seat)
- **Note:** "Single District: Simulating 1 constituency race (FPTP) with compensatory list seats added to achieve proportionality"

**Interpretation:**
This simulates ONE electoral district where:
- The district winner gets a seat (FPTP)
- No additional list seats needed (already proportional with 1 seat total)

**Result:** ✅ Now works correctly

---

### Test 4: MMP - Legislative Mode ✅

**Setup:**
1. Select "Mixed-Member Proportional (MMP)"
2. Race type: **🏛️ Entire Legislature (10 seats)**
3. Add 4 parties
4. Add 4 candidates (one per party)
5. Enter candidate votes (district votes)
6. Enter party votes (list votes)
7. Set threshold: 5%

**Expected Results:**
- **Total Seats:** 10 seats (or more with overhang)
- **District Seats:** 5 (top 5 candidates win)
- **List Seats:** 5 (compensatory to achieve proportionality)
- **Note:** "Legislative Simulation: 5 district races (FPTP) with 5 compensatory list seats for overall proportionality"

**Interpretation:**
This simulates:
- 5 electoral districts (5 district seats via FPTP)
- 5 list seats allocated to compensate for district disproportionality
- Overall parliament is proportional to party votes

**Result:** ✅ Now works correctly

---

### Test 5: Parallel - Single Race Mode ✅

**Setup:**
1. Select "Parallel Voting (MMM)"
2. Race type: **🏁 Single Race (1 seat)**
3. Add 4 parties
4. Add 4 candidates
5. Enter candidate votes
6. Enter party votes
7. Set threshold: 5%

**Expected Results:**
- **Total Seats:** 1 seat
- **District Seats:** 1 (winner of candidate race)
- **List Seats:** 0 (independent allocation for 1 seat)
- **Note:** "Single District: Simulating 1 constituency race (FPTP) with separate list seats (non-compensatory)"

**Interpretation:**
This simulates ONE electoral district where:
- The district winner gets a seat (FPTP)
- No additional list seats (1 total seat)
- NOT compensatory (district and list independent)

**Result:** ✅ Now works correctly

---

### Test 6: Parallel - Legislative Mode ✅

**Setup:**
1. Select "Parallel Voting (MMM)"
2. Race type: **🏛️ Entire Legislature (10 seats)**
3. Add 4 parties
4. Add 4 candidates
5. Enter candidate votes
6. Enter party votes
7. Set threshold: 5%

**Expected Results:**
- **Total Seats:** 10 seats
- **District Seats:** 5 (top 5 candidates win)
- **List Seats:** 5 (independent PR allocation)
- **Note:** "Legislative Simulation: 5 district races (FPTP) with 5 list seats calculated independently (non-compensatory)"

**Interpretation:**
This simulates:
- 5 electoral districts (5 district seats via FPTP)
- 5 list seats allocated independently (NOT compensatory)
- Overall parliament is NOT necessarily proportional
- Higher disproportionality than MMP

**Result:** ✅ Now works correctly

---

## Key Differences Explained

### MMP (Compensatory)

**Single Race (1 seat):**
- Simulates ONE district election
- Winner takes the seat
- List seats adjust to maintain proportionality (but with only 1 seat, little adjustment needed)

**Legislative (10 seats):**
- Simulates MULTIPLE districts (5) + list seats (5)
- District winners determined by FPTP
- List seats **compensate** to achieve overall proportionality
- If party wins more districts than entitled: **overhang seats**

### Parallel (Non-Compensatory)

**Single Race (1 seat):**
- Simulates ONE district election
- Winner takes the seat
- No compensatory adjustment (already just 1 seat)

**Legislative (10 seats):**
- Simulates MULTIPLE districts (5) + list seats (5)
- District winners determined by FPTP
- List seats allocated **independently** (NOT compensatory)
- No overhang seats
- Higher disproportionality than MMP

---

## UI Enhancement Considered

The user suggested using **tabs instead of radio buttons** for race type selection in MMP/Parallel. This could make it clearer that these are two distinct simulation modes.

### Current UI (Radio Buttons):
```
Election Scope:
○ 🏁 Single Race (1 seat or district)
● 🏛️ Entire Legislature (10 seats)
```

### Potential Alternative (Tabs):
```
┌─────────────┬─────────────────┐
│ Single Race │ Legislature     │ ← Tabs
└─────────────┴─────────────────┘
```

**Decision:** Keep radio buttons for now
- Consistent with rest of UI
- Clear with improved descriptive text
- Tabs would require more extensive UI changes

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `app.js` | Added race type detection in `calculateMMP()` | 3 lines |
| `app.js` | Added race type detection in `calculateParallel()` | 3 lines |
| `app.js` | Added descriptive notes for MMP results | 7 lines |
| `app.js` | Added descriptive notes for Parallel results | 7 lines |

**Total:** 20 lines modified

---

## Status

✅ **ALL 4 SYSTEMS VERIFIED**

1. ✅ **STV** - Legislative only, 3 seats, round-by-round display
2. ✅ **Party-List PR** - Legislative only, proportional allocation
3. ✅ **MMP** - Both modes, properly distinguishes single vs legislative
4. ✅ **Parallel** - Both modes, properly distinguishes single vs legislative

**Linting:** ✅ 0 errors  
**Testing:** ✅ All scenarios verified  
**Documentation:** ✅ Complete

---

**Fixed by:** AI Development Assistant  
**Date:** November 27, 2025  
**User Feedback:** Issue correctly identified and resolved

