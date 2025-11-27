# 🧪 Final Testing Instructions

## Test 1: Debug Page (Isolated Chart.js Test)
1. Open `debug-chart.html` in browser
2. **Test 1** should show all ✅ LOADED
3. Click "Create Pie Chart" button **3 times**
   - ✅ Should work every time without error
   - ✅ Chart should redraw each time
4. Click "Test createPieChart()" button **3 times**
   - ✅ Should work every time without error
   - ✅ Chart should redraw each time
5. Click "Run Full Simulation"
   - ✅ Should show all green checkmarks

**Expected**: All tests pass, no crashes ✅

---

## Test 2: Main App (Full Integration Test)

### Setup:
1. **Hard refresh** index.html (Cmd+Shift+R or Ctrl+Shift+F5)
2. Open browser console (F12)
3. Look for: `✅ Chart.js loaded successfully [version]`

### Test FPTP (Simple System):
1. Select "First-Past-the-Post (FPTP)"
2. Click "📥 Import Countries" → Expand → Click "🇺🇸 United States"
3. Click "🤖 Auto-Generate Candidates"
4. Click "🎲 Auto-Fill Random Votes"
   - ✅ Should see numbers in all candidate vote boxes
5. Click "🗳️ Calculate Election Results"
   - ✅ Should see 2 pie charts (votes + winner)
   - ✅ Should see Arrow's Theorem analysis
   - ✅ No crashes, no errors in console

### Test MMP (Complex System):
1. Select "Mixed-Member Proportional (MMP)"
2. Import "🇩🇪 Germany"
3. Auto-generate candidates
4. Auto-fill votes
5. Set Electoral Threshold: 5%
6. Calculate results
   - ✅ Should see pie chart + comparison bar chart
   - ✅ Should see disproportionality index
   - ✅ Should see overhang seats if applicable

### Test IRV (Ranking System):
1. Select "Instant-Runoff Voting (IRV)"
2. Import "🇦🇺 Australia" (if available, or any country)
3. Auto-generate candidates
4. Auto-fill votes
5. In "Advanced Features" → Ballot Generation:
   - Set "Number of Voters": 10000
   - Click "📊 Generate Realistic Ballots"
   - ✅ Should populate ranking ballot boxes
6. Calculate results
   - ✅ Should show round-by-round elimination
   - ✅ Charts should display without crashing

### Test Multiple Calculations:
1. Stay on any system
2. Click "Calculate" **5 times in a row**
   - ✅ Charts should redraw each time
   - ✅ No crashes
   - ✅ Console shows: "✅ Charts created successfully" each time

---

## Console Messages to Look For

### ✅ Good (Success):
```
✅ Chart.js loaded successfully 4.4.0
✅ Python backend connected
📊 Creating charts with data: {...}
✅ Created pie chart: votesChart
✅ Created pie chart: seatsChart
✅ Charts created successfully
```

### ❌ Bad (Problems):
```
❌ Chart.js library not loaded!
❌ Chart wrapper functions not loaded!
❌ Error creating pie chart for votesChart: [error message]
Canvas is already in use
```

---

## What to Report

If any test fails, please provide:
1. **Which test failed** (Debug page Test #, or Main App system)
2. **Exact error message** from console (copy/paste)
3. **Screenshot** if the page crashed

If everything works:
✅ Reply "All tests passed!" and we can move forward!

---

## Known Behavior (Not Bugs):
- "Generate Realistic Ballots" only works for ranking systems (IRV, STV, Borda, Condorcet)
  - For other systems, use "Auto-Fill Random Votes" instead
- Python backend features require running `python3 backend.py`
- First chart render may take 200-300ms (normal for Chart.js initialization)
