# 🔬 Chart.js Debugging - Comprehensive Fix Attempt #3

## Current Status
Chart.js crashes on repeated chart creation. Test 2 and Test 3 in `debug-chart.html` still failing.

## What We've Tried

### Attempt 1: Simple destroy() ❌
```javascript
if (chartInstance) {
    chartInstance.destroy();
}
new Chart(ctx, config);
```
**Result**: Fails on 2nd+ creation

### Attempt 2: Canvas element replacement ❌
```javascript
const newCanvas = document.createElement('canvas');
parent.replaceChild(newCanvas, oldCanvas);
const ctx = newCanvas.getContext('2d');
new Chart(ctx, config);
```
**Result**: Still failing (testing now)

### Attempt 3: Multiple strategies combined (CURRENT)
```javascript
// 1. Destroy instance
if (chartInstances[id]) chartInstances[id].destroy();
// 2. Clear canvas.chart reference
if (canvas.chart) canvas.chart.destroy();
// 3. Replace entire canvas element
parent.replaceChild(newCanvas, oldCanvas);
// 4. Store in window.chartInstances AND canvas.chart
```

## New Test Files Created

### 1. `ultra-simple-test.html` (JUST OPENED)
- **Method 1**: Basic destroy/recreate
- **Method 2**: Canvas replacement
- **Method 3**: Our wrapper function

**Instructions**: Click each button 5 times rapidly
- If Method 1 fails but Method 2 works → we have the fix
- If Method 2 also fails → Chart.js may have a deeper issue

### 2. `test-simple.html`
Minimal test with logging to see exact error

## Key Changes in Latest Version

### `chartjs-wrapper.js` v3:
1. Functions attached to `window` object explicitly
2. Triple-layer cleanup (instance + canvas.chart + DOM replacement)
3. `responsive: false` to avoid resize issues
4. Comprehensive logging at each step
5. Animation duration reduced (300ms)

### `app.js`:
- Now calls `window.createPieChart()` explicitly
- Increased timeout to 200ms
- Enhanced error logging

## Next Steps

**IMMEDIATE**: Test `ultra-simple-test.html`
1. Click "Test Method 1" × 5 times
2. Click "Test Method 2" × 5 times  
3. Click "Test Method 3" × 5 times

**Report**:
- Which methods work?
- Which methods fail?
- What's the exact error message?

## Possible Root Causes

If all methods fail:
1. **Chart.js version issue**: Try Chart.js v3 instead of v4
2. **Browser-specific bug**: Test in different browser
3. **CDN caching**: Try different CDN
4. **Fundamental Chart.js limitation**: May need alternative library

## Alternative Solutions if This Fails

### Plan B: Use Chart.js update() instead of recreate
```javascript
if (chartInstance) {
    chartInstance.data = newData;
    chartInstance.update();
} else {
    chartInstance = new Chart(...);
}
```

### Plan C: Switch to different library
- ApexCharts
- Recharts
- D3.js (more complex)
- Native Canvas (our original code)

---

**WAITING FOR**: Test results from `ultra-simple-test.html`

