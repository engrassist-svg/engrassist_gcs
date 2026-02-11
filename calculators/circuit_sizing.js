// ============================================================================
// ELECTRICAL TOOLS - Circuit Sizing Calculator
// Standalone module - include this file on any page with the circuit sizing calculator
// ============================================================================

// Conductor ampacity data (75°C rating)
const conductorAmpacity = {
    copper: {
        '14': 20, '12': 25, '10': 35, '8': 50, '6': 65,
        '4': 85, '3': 100, '2': 115, '1': 130,
        '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230,
        '250': 255, '300': 285, '350': 310, '400': 335,
        '500': 380, '600': 420, '750': 475, '1000': 545
    },
    aluminum: {
        '12': 20, '10': 30, '8': 40, '6': 50,
        '4': 65, '3': 75, '2': 90, '1': 100,
        '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180,
        '250': 205, '300': 230, '350': 250, '400': 270,
        '500': 310, '600': 340, '750': 385, '1000': 445
    }
};

const standardBreakerSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
    110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800,
    1000, 1200, 1600, 2000, 2500, 3000, 4000];

const tempCorrectionFactors = {
    60: { 60: 1.08, 70: 1.04, 80: 1.00, 90: 0.96, 100: 0.91, 110: 0.87, 120: 0.82 },
    75: { 60: 1.04, 70: 1.02, 80: 1.00, 90: 0.97, 100: 0.94, 110: 0.91, 120: 0.87 },
    90: { 60: 1.04, 70: 1.02, 80: 1.00, 90: 0.97, 100: 0.95, 110: 0.92, 120: 0.89 }
};

const adjustmentFactors = {
    3: 1.00, 4: 0.80, 5: 0.80, 6: 0.80,
    7: 0.70, 8: 0.70, 9: 0.70,
    10: 0.50, 15: 0.50, 20: 0.50
};

function updateCircuitSizing() {
    // Auto-calculate when inputs change
}

function calculateCircuitSizing() {
    // Get inputs
    const loadType = document.getElementById('loadType').value;
    const phaseType = document.getElementById('phaseType').value;
    const voltage = parseFloat(document.getElementById('voltage').value);
    const loadRating = parseFloat(document.getElementById('loadRating').value);
    const loadUnit = document.getElementById('loadUnit').value;
    const material = document.getElementById('conductorMaterial').value;
    const insulationType = parseInt(document.getElementById('insulationType').value);
    const ambientTemp = parseFloat(document.getElementById('ambientTemp').value);
    const numConductors = parseInt(document.getElementById('numConductors').value);
    const circuitLength = parseFloat(document.getElementById('circuitLength').value);

    if (!loadRating || !voltage) {
        showNotification('Please enter load rating and voltage');
        return;
    }

    // Convert load to amps
    let actualCurrent = 0;
    if (loadUnit === 'amps') {
        actualCurrent = loadRating;
    } else if (loadUnit === 'kw') {
        if (phaseType === '1ph') {
            actualCurrent = (loadRating * 1000) / voltage;
        } else {
            actualCurrent = (loadRating * 1000) / (Math.sqrt(3) * voltage);
        }
    } else if (loadUnit === 'hp') {
        // Approximate: 1 HP ≈ 746W, assume 85% efficiency and 0.85 PF
        const watts = loadRating * 746 / 0.85;
        if (phaseType === '1ph') {
            actualCurrent = watts / (voltage * 0.85);
        } else {
            actualCurrent = watts / (Math.sqrt(3) * voltage * 0.85);
        }
    } else if (loadUnit === 'kva') {
        if (phaseType === '1ph') {
            actualCurrent = (loadRating * 1000) / voltage;
        } else {
            actualCurrent = (loadRating * 1000) / (Math.sqrt(3) * voltage);
        }
    }

    // Apply continuous load factor
    let continuousFactor = 1.0;
    if (loadType === 'continuous') {
        continuousFactor = 1.25;
    } else if (loadType === 'motor' || loadType === 'motorAC') {
        continuousFactor = 1.25;
    }

    const designCurrent = actualCurrent * continuousFactor;

    // Temperature correction
    const tempRange = Math.floor(ambientTemp / 10) * 10;
    const tempFactor = tempCorrectionFactors[insulationType][tempRange] || 1.0;

    // Adjustment factor for number of conductors
    let adjustFactor = 1.0;
    for (let key in adjustmentFactors) {
        if (numConductors <= parseInt(key)) {
            adjustFactor = adjustmentFactors[key];
            break;
        }
    }

    // Required ampacity before derating
    const requiredAmpacity = designCurrent / (tempFactor * adjustFactor);

    // Find minimum conductor size
    let selectedSize = null;
    let selectedAmpacity = 0;
    const ampacityTable = conductorAmpacity[material];

    for (let size in ampacityTable) {
        if (ampacityTable[size] >= requiredAmpacity) {
            selectedSize = size;
            selectedAmpacity = ampacityTable[size];
            break;
        }
    }

    if (!selectedSize) {
        showNotification('Load exceeds maximum conductor size');
        return;
    }

    // Select breaker size
    const minBreakerSize = Math.ceil(designCurrent);
    let breakerSize = null;
    for (let size of standardBreakerSizes) {
        if (size >= minBreakerSize && size >= selectedAmpacity) {
            breakerSize = size;
            break;
        }
    }

    // Estimate voltage drop
    const resistance = conductorResistance[material][selectedSize] || 1.0;
    let voltageDrop = 0;
    if (phaseType === '1ph') {
        voltageDrop = 2 * actualCurrent * (circuitLength / 1000) * resistance;
    } else {
        voltageDrop = Math.sqrt(3) * actualCurrent * (circuitLength / 1000) * resistance;
    }
    const voltageDropPercent = (voltageDrop / voltage) * 100;

    // Display results
    document.getElementById('circuitResults').style.display = 'block';
    document.getElementById('actualCurrent').textContent = actualCurrent.toFixed(1) + ' A';
    document.getElementById('continuousFactor').textContent = continuousFactor === 1.25 ? '125%' : '100%';
    document.getElementById('designCurrent').textContent = designCurrent.toFixed(1) + ' A';
    document.getElementById('tempCorrectionFactor').textContent = tempFactor.toFixed(2);
    document.getElementById('adjustmentFactor').textContent = adjustFactor.toFixed(2);
    document.getElementById('requiredAmpacity').textContent = requiredAmpacity.toFixed(0) + ' A';
    document.getElementById('conductorSize').textContent = selectedSize + ' AWG ' + material;
    document.getElementById('conductorAmpacity').textContent = (selectedAmpacity * tempFactor * adjustFactor).toFixed(0) + ' A';
    document.getElementById('minBreakerSize').textContent = minBreakerSize + ' A';
    document.getElementById('breakerSize').textContent = breakerSize + ' A';

    // Conduit sizing (simplified)
    const numWires = phaseType === '1ph' ? 2 : 3;
    const totalConductors = numWires + (document.getElementById('groundWire').value === 'yes' ? 1 : 0);
    document.getElementById('totalConductors').textContent = totalConductors;

    // Simplified conduit sizing
    let conduitSize = '3/4"';
    if (selectedAmpacity > 100) conduitSize = '1"';
    if (selectedAmpacity > 200) conduitSize = '1-1/4"';
    if (selectedAmpacity > 400) conduitSize = '2"';
    document.getElementById('conduitSize').textContent = conduitSize + ' ' + document.getElementById('conduitType').value.toUpperCase();

    // Ground wire sizing (simplified - based on breaker size)
    let groundSize = '14';
    if (breakerSize > 15) groundSize = '12';
    if (breakerSize > 20) groundSize = '10';
    if (breakerSize > 60) groundSize = '8';
    if (breakerSize > 100) groundSize = '6';
    if (breakerSize > 200) groundSize = '4';
    document.getElementById('groundSize').textContent = groundSize + ' AWG ' + material;

    // Voltage drop check
    document.getElementById('voltageDrop').textContent = voltageDrop.toFixed(2) + ' V';
    document.getElementById('voltageDropPercent').textContent = voltageDropPercent.toFixed(2) + '%';

    let vdCompliance = '';
    if (voltageDropPercent <= 3) {
        vdCompliance = '✓ Within NEC recommendation';
    } else {
        vdCompliance = '⚠ Consider upsizing conductor';
    }
    document.getElementById('vdCompliance').textContent = vdCompliance;

    // Summary
    const summary = `For a ${actualCurrent.toFixed(0)}A ${loadType} ${phaseType} load at ${voltage}V, use ${selectedSize} AWG ${material} conductors in ${conduitSize} ${document.getElementById('conduitType').value.toUpperCase()} conduit, protected by a ${breakerSize}A breaker, with ${groundSize} AWG equipment ground.`;
    document.getElementById('circuitSummary').textContent = summary;
}

