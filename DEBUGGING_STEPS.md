# 🔍 Debugging Instructions

## The Issue
`debug-test.html` works, but `index.html` doesn't show the parties section after selecting an electoral system.

## Diagnostic Steps

### Step 1: Open index.html with Console
1. **Hard refresh** index.html (Cmd+Shift+R)
2. **Open Developer Tools** (Cmd+Option+I or F12)
3. **Go to Console tab**
4. **Select an electoral system** from the dropdown

### Step 2: Check Console Output

You should see messages like this:

```
🔍 DIAGNOSTIC SCRIPT LOADED
🔍 DOM Content Loaded
🔍 Elements check: {select: true, parties: true, candidates: true, voting: true}
🔍 Parties section initial style: {display: "none", computed: "none"}
✅ DOMContentLoaded fired
✅ Attaching event listener to select
✅ Select element found: <select>...
✅ Event listener attached
✅ Initial onSystemChange called
```

**When you select a system**, you should see:
```
🔍 DROPDOWN CHANGED to: fptp
🔵 onSystemChange START
System value: fptp
System selected: fptp
Sections found: {parties: true, candidates: true, voting: true}
✅ Setting display to block
✅ Styles set
🔵 onSystemChange END
🔍 After 100ms - Parties section: {
  inlineDisplay: "block",
  computedDisplay: "block",
  visibility: "visible",
  height: 350,
  width: 800
}
```

### Step 3: What to Look For

**❌ Bad Signs**:
- "Uncaught ReferenceError" or "undefined" errors
- `computedDisplay: "none"` even though `inlineDisplay: "block"`
- `height: 0` or `width: 0`
- Missing console messages

**✅ Good Signs**:
- All diagnostic messages appear
- `inlineDisplay: "block"` and `computedDisplay: "block"`
- `height` and `width` > 0
- No errors in console

### Step 4: Report Back

Please copy and paste:
1. **All console messages** when you load the page
2. **All console messages** when you select a system
3. **Any red error messages**

This will tell me exactly what's happening!

---

## Files I've Added for Debugging

1. **`diagnostic.js`** - Logs everything that happens
2. **`test-console.html`** - Minimal test with full logging
3. **Modified `index.html`** - Added diagnostic.js script

---

## Quick Test

Try `test-console.html` first:
1. Open `test-console.html`
2. Open console (F12)
3. Select "FPTP"
4. Watch console messages
5. Does the red box appear?

If yes: The logic works, something in index.html is interfering
If no: Browser cache issue - try a different browser

---

*Diagnostic tools ready - please run and share console output!*

