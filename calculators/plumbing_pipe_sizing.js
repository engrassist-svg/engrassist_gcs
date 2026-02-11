// ========================================
// PLUMBING PIPE SIZING CALCULATOR
// Standalone module - include this file on any page with the plumbing pipe sizing calculator
// ========================================

// Tab switching function for plumbing pipe sizing page
function switchTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Scroll to top of tabs for better UX
    window.scrollTo({
        top: document.querySelector('.tab-navigation').offsetTop - 100,
        behavior: 'smooth'
    });
}

// Toggle calculation method (fixture units vs direct GPM) - DEPRECATED
// Use switchCalculationMode instead for button-based selectors
function toggleCalcMethod() {
    const method = document.getElementById('calcMethod').value;
    const fixtureTable = document.querySelector('.pipe-table-wrapper');
    const directGPM = document.getElementById('directGPMInput');

    if (method === 'fixtureUnits') {
        fixtureTable.style.display = 'block';
        directGPM.style.display = 'none';
    } else {
        fixtureTable.style.display = 'none';
        directGPM.style.display = 'flex';
    }
}

// Switch calculation mode using button selector (for plumbing calculators)
// mode: 'dfu' or 'fixtureUnits' for fixture unit mode, 'gpm' for GPM mode
// event: the click event from the button
function switchCalculationMode(mode, event) {
    // Update button states
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(button => {
        button.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Show/hide input sections based on mode
    // For drain sizing page (uses 'dfu' and 'gpm')
    const dfuInputs = document.getElementById('dfu-inputs');
    const gpmInputsSection = document.getElementById('gpm-inputs');

    // For plumbing pipe sizing page (uses 'fixtureUnits' and 'gpm')
    const fixtureTable = document.querySelector('.pipe-table-wrapper');
    const directGPMInput = document.getElementById('directGPMInput');

    if (mode === 'dfu' || mode === 'fixtureUnits') {
        // Show fixture unit inputs
        if (dfuInputs) {
            dfuInputs.classList.add('active');
        }
        if (gpmInputsSection) {
            gpmInputsSection.classList.remove('active');
        }
        if (fixtureTable) {
            fixtureTable.style.display = 'block';
        }
        if (directGPMInput) {
            directGPMInput.style.display = 'none';
        }
    } else if (mode === 'gpm') {
        // Show GPM inputs
        if (dfuInputs) {
            dfuInputs.classList.remove('active');
        }
        if (gpmInputsSection) {
            gpmInputsSection.classList.add('active');
        }
        if (fixtureTable) {
            fixtureTable.style.display = 'none';
        }
        if (directGPMInput) {
            directGPMInput.style.display = 'flex';
        }
    }

    // Hide results when switching modes (if present)
    const drainResults = document.getElementById('drainResults');
    const pipeSizingResults = document.getElementById('pipeSizingResults');
    if (drainResults) {
        drainResults.classList.remove('visible');
    }
    if (pipeSizingResults) {
        pipeSizingResults.style.display = 'none';
    }
}

// Convert fixture units to GPM using simplified Hunter's Curve
function fixtureUnitsToGPM(wsfu) {
    if (wsfu <= 0) return 0;

    // Simplified Hunter's Curve approximation
    // Based on IPC/UPC conversion tables
    if (wsfu <= 1) return 3.0;
    if (wsfu <= 2) return 4.0;
    if (wsfu <= 3) return 5.0;
    if (wsfu <= 4) return 6.0;
    if (wsfu <= 5) return 6.5;
    if (wsfu <= 6) return 7.0;
    if (wsfu <= 8) return 8.0;
    if (wsfu <= 10) return 9.0;
    if (wsfu <= 12) return 10.5;
    if (wsfu <= 15) return 12.0;
    if (wsfu <= 20) return 15.0;
    if (wsfu <= 25) return 18.0;
    if (wsfu <= 30) return 21.0;
    if (wsfu <= 40) return 25.0;
    if (wsfu <= 50) return 30.0;
    if (wsfu <= 60) return 35.0;
    if (wsfu <= 70) return 39.0;
    if (wsfu <= 80) return 43.0;
    if (wsfu <= 90) return 46.0;
    if (wsfu <= 100) return 50.0;
    if (wsfu <= 120) return 56.0;
    if (wsfu <= 140) return 62.0;
    if (wsfu <= 160) return 67.0;
    if (wsfu <= 180) return 72.0;
    if (wsfu <= 200) return 77.0;

    // For larger values, use approximation: GPM ≈ sqrt(WSFU) * 5
    return Math.sqrt(wsfu) * 5;
}

// Get pipe inner diameter based on material and nominal size
function getPipeID(pipeType, nominalSize) {
    const pipeDimensions = {
        'copper': {
            '3/8': 0.430,
            '1/2': 0.545,
            '3/4': 0.785,
            '1': 1.025,
            '1-1/4': 1.265,
            '1-1/2': 1.505,
            '2': 1.985
        },
        'copper_k': {
            '3/8': 0.402,
            '1/2': 0.527,
            '3/4': 0.745,
            '1': 0.995,
            '1-1/4': 1.245,
            '1-1/2': 1.481,
            '2': 1.959
        },
        'copper_m': {
            '3/8': 0.450,
            '1/2': 0.569,
            '3/4': 0.811,
            '1': 1.055,
            '1-1/4': 1.291,
            '1-1/2': 1.527,
            '2': 2.009
        },
        'pex': {
            '3/8': 0.350,
            '1/2': 0.475,
            '3/4': 0.671,
            '1': 0.875,
            '1-1/4': 1.110,
            '1-1/2': 1.360,
            '2': 1.822
        },
        'cpvc': {
            '3/8': 0.430,
            '1/2': 0.545,
            '3/4': 0.785,
            '1': 1.025,
            '1-1/4': 1.265,
            '1-1/2': 1.505,
            '2': 1.985
        },
        'galvanized': {
            '3/8': 0.493,
            '1/2': 0.622,
            '3/4': 0.824,
            '1': 1.049,
            '1-1/4': 1.380,
            '1-1/2': 1.610,
            '2': 2.067
        }
    };

    return pipeDimensions[pipeType][nominalSize] || 0;
}

// Calculate velocity in ft/s
function calculateVelocity(gpm, pipeID) {
    // Velocity (ft/s) = (GPM × 0.4085) / (ID² in inches)
    const area = Math.PI * Math.pow(pipeID / 2, 2); // in²
    return (gpm * 0.4085) / area;
}

// Get velocity limit based on pipe type and water temperature
function getVelocityLimit(pipeType, waterTemp) {
    const limits = {
        'copper': {
            'cold': 8,
            'hot': 5
        },
        'copper_k': {
            'cold': 8,
            'hot': 5
        },
        'copper_m': {
            'cold': 8,
            'hot': 5
        },
        'pex': {
            'cold': 10,
            'hot': 8
        },
        'cpvc': {
            'cold': 8,
            'hot': 5
        },
        'galvanized': {
            'cold': 5,
            'hot': 5
        }
    };

    return limits[pipeType][waterTemp];
}

// Calculate pressure drop using Hazen-Williams equation (simplified)
function calculatePressureDrop(gpm, pipeID, length, pipeType) {
    // C factor (roughness coefficient)
    const cFactors = {
        'copper': 140,
        'pex': 150,
        'cpvc': 150,
        'galvanized': 100
    };

    const C = cFactors[pipeType];

    // Hazen-Williams: hf = (4.52 × L × Q^1.85) / (C^1.85 × D^4.87)
    // where L is in feet, Q in GPM, D in inches, result in ft of head
    // Convert to psi: psi = ft × 0.433

    if (pipeID <= 0 || gpm <= 0) return 0;

    const headLoss = (4.52 * length * Math.pow(gpm, 1.85)) / (Math.pow(C, 1.85) * Math.pow(pipeID, 4.87));
    const psiLoss = headLoss * 0.433;

    return psiLoss;
}

// Recommend pipe size based on flow and velocity limits
function recommendPipeSize(gpm, pipeType, waterTemp) {
    const sizes = ['3/8', '1/2', '3/4', '1', '1-1/4', '1-1/2', '2'];
    const maxVelocity = getVelocityLimit(pipeType, waterTemp);

    for (let size of sizes) {
        const id = getPipeID(pipeType, size);
        const velocity = calculateVelocity(gpm, id);

        // Check if velocity is acceptable (between 2 and max)
        if (velocity >= 2 && velocity <= maxVelocity) {
            return { size: size, id: id, velocity: velocity };
        }
    }

    // If we get here, flow is too high - return largest size
    const size = '2';
    const id = getPipeID(pipeType, size);
    const velocity = calculateVelocity(gpm, id);
    return { size: size, id: id, velocity: velocity };
}

// Main calculation function
function calculatePipeSizing() {
    const calcMethod = document.getElementById('calcMethod').value;
    const pipeType = document.getElementById('pipeType').value;
    const pipeLength = parseFloat(document.getElementById('pipeLength').value) || 100;

    let coldWSFU = 0;
    let hotWSFU = 0;
    let coldGPM = 0;
    let hotGPM = 0;

    if (calcMethod === 'fixtureUnits') {
        // Calculate fixture units from table
        const coldInputs = document.querySelectorAll('.cold-qty');
        const hotInputs = document.querySelectorAll('.hot-qty');

        coldInputs.forEach(input => {
            const qty = parseFloat(input.value) || 0;
            const wsfu = parseFloat(input.dataset.wsfu);
            coldWSFU += qty * wsfu;
        });

        hotInputs.forEach(input => {
            const qty = parseFloat(input.value) || 0;
            const wsfu = parseFloat(input.dataset.wsfu);
            hotWSFU += qty * wsfu;
        });

        // Add additional WSFU values
        const additionalColdWSFU = parseFloat(document.getElementById('additionalColdWSFU').value) || 0;
        const additionalHotWSFU = parseFloat(document.getElementById('additionalHotWSFU').value) || 0;

        coldWSFU += additionalColdWSFU;
        hotWSFU += additionalHotWSFU;

        // Convert to GPM
        coldGPM = fixtureUnitsToGPM(coldWSFU);
        hotGPM = fixtureUnitsToGPM(hotWSFU);

    } else {
        // Direct GPM entry
        coldGPM = parseFloat(document.getElementById('coldGPM').value) || 0;
        hotGPM = parseFloat(document.getElementById('hotGPM').value) || 0;
        coldWSFU = 0; // Not applicable for direct GPM
        hotWSFU = 0;
    }

    // Validate inputs
    if (coldGPM === 0 && hotGPM === 0) {
        alert('Please enter fixture quantities or GPM values');
        return;
    }

    // Recommend pipe sizes (pass 'cold' or 'hot' for water temperature)
    const coldRecommendation = recommendPipeSize(coldGPM, pipeType, 'cold');
    const hotRecommendation = recommendPipeSize(hotGPM, pipeType, 'hot');

    // Calculate pressure drops
    const coldPressureDrop = calculatePressureDrop(coldGPM, coldRecommendation.id, pipeLength, pipeType);
    const hotPressureDrop = calculatePressureDrop(hotGPM, hotRecommendation.id, pipeLength, pipeType);

    // Display results
    document.getElementById('coldWSFU').textContent = calcMethod === 'fixtureUnits' ? coldWSFU.toFixed(1) + ' WSFU' : 'N/A';
    document.getElementById('coldGPMResult').textContent = coldGPM.toFixed(1) + ' GPM';
    document.getElementById('coldPipeSize').textContent = coldRecommendation.size + '"';
    document.getElementById('coldVelocity').textContent = coldRecommendation.velocity.toFixed(1) + ' ft/s';
    document.getElementById('coldPressureDrop').textContent = coldPressureDrop.toFixed(1) + ' psi';

    document.getElementById('hotWSFU').textContent = calcMethod === 'fixtureUnits' ? hotWSFU.toFixed(1) + ' WSFU' : 'N/A';
    document.getElementById('hotGPMResult').textContent = hotGPM.toFixed(1) + ' GPM';
    document.getElementById('hotPipeSize').textContent = hotRecommendation.size + '"';
    document.getElementById('hotVelocity').textContent = hotRecommendation.velocity.toFixed(1) + ' ft/s';
    document.getElementById('hotPressureDrop').textContent = hotPressureDrop.toFixed(1) + ' psi';

    // Show results section
    document.getElementById('pipeSizingResults').style.display = 'block';

    // Scroll to results
    document.getElementById('pipeSizingResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

