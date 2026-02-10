// Chart.js Wrapper Functions for Electoral Systems Simulator
// Ultra-robust version with multiple fallback strategies

// Store chart instances globally
window.chartInstances = window.chartInstances || {};

/**
 * Create or update a pie chart using Chart.js
 * @param {string} canvasId - ID of the canvas element
 * @param {Array} data - Array of {label, value, color}
 * @param {string} title - Chart title
 */
window.createPieChart = function(canvasId, data, title) {
    console.log(`📊 createPieChart called for: ${canvasId}`);
    
    // Get canvas element
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return;
    }
    
    // STRATEGY 1: Destroy existing chart instance
    if (window.chartInstances[canvasId]) {
        console.log(`🗑️ Destroying existing chart: ${canvasId}`);
        try {
            window.chartInstances[canvasId].destroy();
        } catch (e) {
            console.warn(`Warning during destroy: ${e.message}`);
        }
        delete window.chartInstances[canvasId];
    }
    
    // STRATEGY 2: Clear any Chart.js references on the canvas itself
    if (canvas.chart) {
        console.log(`🗑️ Clearing canvas.chart reference`);
        try {
            canvas.chart.destroy();
        } catch (e) {
            console.warn(`Warning clearing canvas.chart: ${e.message}`);
        }
        delete canvas.chart;
    }
    
    // STRATEGY 3: Replace canvas element completely
    console.log(`♻️ Replacing canvas element`);
    const parent = canvas.parentNode;
    const newCanvas = document.createElement('canvas');
    newCanvas.id = canvasId;
    newCanvas.width = canvas.width || 400;
    newCanvas.height = canvas.height || 400;
    newCanvas.style.cssText = canvas.style.cssText;
    parent.replaceChild(newCanvas, canvas);
    canvas = newCanvas; // Use the new canvas from now on
    
    // Get fresh context
    const ctx = canvas.getContext('2d');
    
    // Filter out zero values
    const filteredData = data.filter(d => d.value > 0);
    
    if (filteredData.length === 0) {
        console.log(`⚠️ No data for ${canvasId}`);
        ctx.fillStyle = '#666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    try {
        console.log(`✨ Creating chart with ${filteredData.length} data points`);
        
        const chartConfig = {
            type: 'pie',
            data: {
                labels: filteredData.map(d => d.label),
                datasets: [{
                    data: filteredData.map(d => d.value),
                    backgroundColor: filteredData.map(d => d.color),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        
                                        // Determine unit based on chart title
                                        const chartTitle = chart.options.plugins.title.text || '';
                                        const isVoteChart = chartTitle.includes('Vote') || chartTitle.includes('vote');
                                        const unit = isVoteChart ? 'vote' : 'seat';
                                        
                                        return {
                                            text: `${label}: ${percentage}% (${value.toLocaleString()} ${unit}${value !== 1 ? 's' : ''})`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        const newChart = new Chart(ctx, chartConfig);
        
        // Store in BOTH places for redundancy
        window.chartInstances[canvasId] = newChart;
        canvas.chart = newChart;
        
        console.log(`✅ Chart created successfully: ${canvasId}`);
    } catch (error) {
        console.error(`❌ Error creating pie chart for ${canvasId}:`, error);
        console.error('Stack:', error.stack);
        
        // Fallback: show error message
        ctx.fillStyle = '#f44336';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chart error - see console', canvas.width / 2, canvas.height / 2);
        
        throw error;
    }
};

/**
 * Create or update a horizontal grouped bar chart for vote/seat comparison
 */
window.createComparisonBarChart = function(canvasId, data, title) {
    console.log(`📊 createComparisonBarChart called for: ${canvasId}`);
    
    // Get canvas element
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas ${canvasId} not found`);
        return;
    }
    
    // Store original data for filtering
    if (!window.comparisonChartData) {
        window.comparisonChartData = {};
    }
    window.comparisonChartData[canvasId] = JSON.parse(JSON.stringify(data));
    
    // Destroy existing chart instance
    if (window.chartInstances[canvasId]) {
        console.log(`🗑️ Destroying existing chart: ${canvasId}`);
        try {
            window.chartInstances[canvasId].destroy();
        } catch (e) {
            console.warn(`Warning during destroy: ${e.message}`);
        }
        delete window.chartInstances[canvasId];
    }
    
    // Clear canvas.chart reference
    if (canvas.chart) {
        try {
            canvas.chart.destroy();
        } catch (e) {
            console.warn(`Warning clearing canvas.chart: ${e.message}`);
        }
        delete canvas.chart;
    }
    
    // Replace canvas element
    console.log(`♻️ Replacing canvas element`);
    const parent = canvas.parentNode;
    const newCanvas = document.createElement('canvas');
    newCanvas.id = canvasId;
    // Use larger default size, or get from existing canvas attributes
    const existingWidth = parseInt(canvas.getAttribute('width')) || 800;
    const existingHeight = parseInt(canvas.getAttribute('height')) || 600;
    newCanvas.setAttribute('width', existingWidth);
    newCanvas.setAttribute('height', existingHeight);
    newCanvas.width = existingWidth;
    newCanvas.height = existingHeight;
    newCanvas.style.cssText = canvas.style.cssText;
    parent.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    
    const ctx = canvas.getContext('2d');
    
    if (data.length === 0) {
        console.log(`⚠️ No data for ${canvasId}`);
        ctx.fillStyle = '#666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Create checkboxes for party filtering
    const filterContainer = document.getElementById('comparisonChartFilters');
    if (filterContainer && data.length > 0) {
        // Clear existing checkboxes
        const existingCheckboxes = filterContainer.querySelectorAll('.party-filter-checkbox');
        existingCheckboxes.forEach(cb => cb.remove());
        
        // Create checkboxes for each party
        data.forEach((party, index) => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.style.display = 'flex';
            checkboxDiv.style.alignItems = 'center';
            checkboxDiv.style.gap = '5px';
            checkboxDiv.style.fontSize = '0.9em';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `party-filter-${canvasId}-${index}`;
            checkbox.className = 'party-filter-checkbox';
            checkbox.checked = true;
            checkbox.dataset.partyLabel = party.label;
            checkbox.dataset.canvasId = canvasId;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '5px';
            label.style.cursor = 'pointer';
            
            const colorBox = document.createElement('span');
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = party.color;
            colorBox.style.borderRadius = '2px';
            colorBox.style.display = 'inline-block';
            
            const text = document.createTextNode(party.label);
            
            label.appendChild(colorBox);
            label.appendChild(text);
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            filterContainer.appendChild(checkboxDiv);
            
            // Add event listener
            checkbox.addEventListener('change', function() {
                updateComparisonChart(canvasId);
            });
        });
    }
    
    // Create lighter shade for seat bars
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    };
    
    try {
        console.log(`✨ Creating comparison chart with ${data.length} parties`);
        
        // Calculate dynamic height based on number of parties (minimum 600, ~40px per party)
        const minHeight = 600;
        const heightPerParty = 40;
        const calculatedHeight = Math.max(minHeight, data.length * heightPerParty + 150);
        canvas.height = calculatedHeight;
        canvas.setAttribute('height', calculatedHeight);
        
        const newChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [
                    {
                        label: 'Vote Share (%)',
                        data: data.map(d => d.votePct),
                        backgroundColor: data.map(d => d.color),
                        borderColor: data.map(d => d.color),
                        borderWidth: 1
                    },
                    {
                        label: 'Seat Share (%)',
                        data: data.map(d => d.seatPct),
                        backgroundColor: data.map(d => lightenColor(d.color, 40)),
                        borderColor: data.map(d => d.color),
                        borderWidth: 1,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: false,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.x.toFixed(1);
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: '#e0e0e0'
                        },
                        title: {
                            display: true,
                            text: 'Percentage (%)',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Store in BOTH places
        window.chartInstances[canvasId] = newChart;
        canvas.chart = newChart;
        
        console.log(`✅ Comparison chart created successfully: ${canvasId}`);
    } catch (error) {
        console.error(`❌ Error creating comparison chart for ${canvasId}:`, error);
        console.error('Stack:', error.stack);
        
        ctx.fillStyle = '#f44336';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chart error - see console', canvas.width / 2, canvas.height / 2);
        
        throw error;
    }
};

/**
 * Update comparison chart based on checkbox filters
 */
function updateComparisonChart(canvasId) {
    const originalData = window.comparisonChartData && window.comparisonChartData[canvasId];
    if (!originalData) {
        console.warn(`No original data found for ${canvasId}`);
        return;
    }
    
    // Get all checkboxes for this chart
    const checkboxes = document.querySelectorAll(`.party-filter-checkbox[data-canvas-id="${canvasId}"]`);
    const visibleParties = new Set();
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            visibleParties.add(checkbox.dataset.partyLabel);
        }
    });
    
    // Filter data based on checked parties
    const filteredData = originalData.filter(party => visibleParties.has(party.label));
    
    // Get the chart instance
    const chart = window.chartInstances[canvasId];
    if (!chart) {
        console.warn(`No chart instance found for ${canvasId}`);
        return;
    }
    
    // Get canvas and adjust height dynamically
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const minHeight = 600;
        const heightPerParty = 40;
        const calculatedHeight = Math.max(minHeight, filteredData.length * heightPerParty + 150);
        canvas.height = calculatedHeight;
        canvas.setAttribute('height', calculatedHeight);
        chart.resize();
    }
    
    // Update chart data
    chart.data.labels = filteredData.map(d => d.label);
    chart.data.datasets[0].data = filteredData.map(d => d.votePct);
    chart.data.datasets[0].backgroundColor = filteredData.map(d => d.color);
    chart.data.datasets[0].borderColor = filteredData.map(d => d.color);
    chart.data.datasets[1].data = filteredData.map(d => d.seatPct);
    
    // Create lighter shade for seat bars
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    };
    
    chart.data.datasets[1].backgroundColor = filteredData.map(d => lightenColor(d.color, 40));
    chart.data.datasets[1].borderColor = filteredData.map(d => d.color);
    
    // Update chart
    chart.update();
}

// Make updateComparisonChart available globally
window.updateComparisonChart = updateComparisonChart;

console.log('✅ chartjs-wrapper.js loaded - functions attached to window object');
