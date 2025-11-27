# Debug Steps for Electoral System Selection Issue

## Problem
Electoral system selection dropdown does not trigger the display of party/candidate sections.

## Fixes Applied

### 1. Added DOMContentLoaded wrapper ✅
```javascript
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('electoralSystem').addEventListener('change', onSystemChange);
    setupColorPicker();
    onSystemChange();
});
```

### 2. Added Borda and Condorcet to candidateFocused array ✅
```javascript
const candidateFocused = [
    'fptp',
    'trs', 
    'irv',
    'borda',      // ADDED
    'condorcet',  // ADDED
    'stv',
    'block',
    'limited',
    'approval'
];
```

## Debugging Steps

### Check Browser Console
1. Open `index.html` in browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Select an electoral system from dropdown
5. Look for errors

### Expected Console Output
Should see something like:
```
DOM loaded, attaching event listener
Select element: <select id="electoralSystem">...</select>
Change event fired! Value: fptp
onSystemChange called
Selected system: fptp
Sections found: {parties: true, candidates: true, voting: true}
System selected, showing sections
```

### Common Issues to Check

**Issue 1: Script loading order**
- Check if `app.js` is loaded AFTER the HTML body
- Verify `<script src="app.js"></script>` is at end of body

**Issue 2: Element ID mismatch**
- Verify element IDs match exactly:
  - `electoralSystem`
  - `partiesSection`
  - `candidatesSection`
  - `votingSection`

**Issue 3: CSS override**
- Check if CSS has `display: none !important` somewhere
- Inspect element in DevTools to see computed styles

**Issue 4: JavaScript error before event**
- Check console for errors before selection
- Any error in setupColorPicker() would prevent attachment

**Issue 5: Multiple script tags**
- Check if app.js is loaded multiple times
- Check if there's a conflict with other scripts

## Manual Test

Created `debug-test.html` with minimal code to isolate the issue.

**To test**:
1. Open `debug-test.html`
2. Select "FPTP" or "Borda Count"
3. Red-bordered "PARTIES SECTION" should appear
4. Check console for debug messages

If debug-test.html works but main app doesn't, the issue is in the main app's complexity (multiple scripts, CSS, etc.)

## Next Steps if Still Not Working

1. **Hard refresh** the browser (Cmd+Shift+R or Ctrl+F5)
2. **Clear browser cache**
3. **Check file saved** - verify app.js shows the changes
4. **Try different browser** - test in Safari, Chrome, Firefox
5. **Check file permissions** - ensure files are readable

## Files Modified
- `app.js` (lines 529-537, 617-627)
- `debug-test.html` (created for testing)

---

*Debug guide created: November 27, 2025*

