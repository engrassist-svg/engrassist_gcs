// ========================================
// VAV BOX SIZING CALCULATOR FUNCTIONS
// Standalone module - include this file on any page with the VAV box sizing calculator
// ========================================

function updateVAVBoxOptions() {
    const boxType = document.getElementById('vav-boxType');
    const reheatOptions = document.getElementById('vav-reheatOptions');
    const fanPoweredOptions = document.getElementById('vav-fanPoweredOptions');
    const reheatTypeSelect = document.getElementById('vav-reheatType');

    if (!boxType) return;

    const boxTypeValue = boxType.value;

    // Show/hide reheat options
    if (boxTypeValue === 'single-duct-reheat' || boxTypeValue === 'fan-powered-parallel' || boxTypeValue === 'fan-powered-series') {
        if (reheatOptions) reheatOptions.style.display = 'block';
    } else {
        if (reheatOptions) reheatOptions.style.display = 'none';
        if (reheatTypeSelect) {
            reheatTypeSelect.value = 'none';
            updateVAVReheatInputs();
        }
    }

    // Show/hide fan powered options
    if (boxTypeValue === 'fan-powered-parallel' || boxTypeValue === 'fan-powered-series') {
        if (fanPoweredOptions) fanPoweredOptions.style.display = 'block';
    } else {
        if (fanPoweredOptions) fanPoweredOptions.style.display = 'none';
    }
}

function updateVAVReheatInputs() {
    const reheatType = document.getElementById('vav-reheatType');
    const capacityGroup = document.getElementById('vav-reheatCapacityGroup');
    const capacityLabel = document.getElementById('vav-reheatCapacityLabel');

    if (!reheatType) return;

    const reheatTypeValue = reheatType.value;

    if (reheatTypeValue === 'none') {
        if (capacityGroup) capacityGroup.style.display = 'none';
    } else {
        if (capacityGroup) capacityGroup.style.display = 'block';
        if (capacityLabel) {
            if (reheatTypeValue === 'electric') {
                capacityLabel.textContent = 'Electric Reheat Capacity (kW):';
            } else {
                capacityLabel.textContent = 'Reheat Capacity (MBH):';
            }
        }
    }
}

function calculateVAVBox() {
    // Get inputs
    const roomArea = parseFloat(document.getElementById('vav-roomArea').value) || 0;
    const cfmPerSqFt = parseFloat(document.getElementById('vav-cfmPerSqFt').value) || 1.0;
    let maxCFM = parseFloat(document.getElementById('vav-maxCFM').value);
    const minCFMInput = parseFloat(document.getElementById('vav-minCFM').value);
    const boxType = document.getElementById('vav-boxType').value;
    const controlType = document.getElementById('vav-controlType').value;
    const inletPressure = parseFloat(document.getElementById('vav-inletPressure').value) || 1.0;
    const ncRating = parseInt(document.getElementById('vav-ncRating').value) || 35;
    const reheatType = document.getElementById('vav-reheatType').value;
    const reheatCapacity = parseFloat(document.getElementById('vav-reheatCapacity').value) || 0;
    const fanStaticPressure = parseFloat(document.getElementById('vav-fanStaticPressure').value) || 0.5;
    const fanMotorType = document.getElementById('vav-fanMotorType').value;

    // Calculate max CFM if not provided
    if (!maxCFM && roomArea > 0) {
        maxCFM = roomArea * cfmPerSqFt;
        document.getElementById('vav-maxCFM').value = Math.round(maxCFM);
    }

    if (!maxCFM || maxCFM <= 0) {
        alert('Please enter room area and CFM/sq ft, or enter maximum CFM directly.');
        return;
    }

    // Calculate minimum CFM
    let minCFM = minCFMInput;
    if (!minCFM || minCFM <= 0) {
        // Default to 40% of max if not specified
        minCFM = maxCFM * 0.4;
    }

    // Calculate turndown ratio
    const turndownRatio = maxCFM / minCFM;

    // Estimate inlet velocity (assuming appropriate diameter inlet)
    let inletDiameter = 8; // inches, starting guess
    if (maxCFM > 1000) inletDiameter = 12;
    if (maxCFM > 2000) inletDiameter = 16;
    if (maxCFM > 3500) inletDiameter = 20;
    if (maxCFM < 400) inletDiameter = 6;

    const inletArea = Math.PI * Math.pow(inletDiameter / 2, 2) / 144; // sq ft
    const inletVelocity = maxCFM / inletArea;

    // Estimate pressure drop (simplified)
    let pressureDrop = 0.15; // base pressure drop
    if (boxType.includes('fan-powered')) {
        pressureDrop = 0.25;
    }
    if (boxType === 'dual-duct') {
        pressureDrop = 0.30;
    }
    if (controlType === 'pressure-independent') {
        pressureDrop += 0.05; // PI controls add slight pressure drop
    }

    // Adjust for actual inlet pressure
    if (inletPressure < 0.75) {
        pressureDrop *= 0.8; // Lower drop at low pressure
    }

    // Determine recommended box size
    const standardSizes = [100, 150, 200, 300, 400, 500, 600, 800, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000];
    let recommendedSize = standardSizes.find(size => size >= maxCFM) || standardSizes[standardSizes.length - 1];

    // Calculate reheat if applicable
    let reheatOutput = '';
    if (reheatType !== 'none' && reheatCapacity > 0) {
        if (reheatType === 'electric') {
            const btuPerHour = reheatCapacity * 3413;
            const tempRise = btuPerHour / (1.08 * minCFM);
            reheatOutput = reheatCapacity.toFixed(1) + ' kW (' + (btuPerHour/1000).toFixed(1) + ' MBH, ' + tempRise.toFixed(1) + '°F rise at min CFM)';
        } else {
            const tempRise = (reheatCapacity * 1000) / (1.08 * minCFM);
            reheatOutput = reheatCapacity.toFixed(1) + ' MBH (' + tempRise.toFixed(1) + '°F rise at min CFM)';
        }
    }

    // Calculate fan power for fan-powered boxes
    let fanPower = '';
    if (boxType.includes('fan-powered')) {
        const wattsPerCFM = fanMotorType === 'ecm' ? 0.4 : 0.8;
        const watts = maxCFM * wattsPerCFM;
        const annualKWh = (watts / 1000) * 8760; // Assuming continuous operation for series
        if (boxType === 'fan-powered-parallel') {
            // Parallel runs ~50% of the time on average
            fanPower = watts.toFixed(0) + 'W (est. ' + (annualKWh * 0.5 / 1000).toFixed(0) + ' MWh/yr at 50% runtime)';
        } else {
            fanPower = watts.toFixed(0) + 'W (est. ' + (annualKWh / 1000).toFixed(1) + ' MWh/yr continuous)';
        }
    }

    // Display results
    document.getElementById('vav-resultMaxCFM').textContent = Math.round(maxCFM) + ' CFM';
    document.getElementById('vav-resultMinCFM').textContent = Math.round(minCFM) + ' CFM';
    document.getElementById('vav-turndownRatio').textContent = turndownRatio.toFixed(2) + ':1';
    document.getElementById('vav-inletVelocity').textContent = Math.round(inletVelocity) + ' FPM (' + inletDiameter + '" inlet assumed)';
    document.getElementById('vav-pressureDrop').textContent = pressureDrop.toFixed(2) + ' in. w.c.';
    document.getElementById('vav-sizeRecommendation').textContent = recommendedSize + ' CFM nominal size';

    // Show/hide optional result fields
    const reheatResult = document.getElementById('vav-reheatResult');
    const fanPowerResult = document.getElementById('vav-fanPowerResult');

    if (reheatOutput) {
        document.getElementById('vav-reheatRequired').textContent = reheatOutput;
        if (reheatResult) reheatResult.style.display = 'flex';
    } else {
        if (reheatResult) reheatResult.style.display = 'none';
    }

    if (fanPower) {
        document.getElementById('vav-fanPower').textContent = fanPower;
        if (fanPowerResult) fanPowerResult.style.display = 'flex';
    } else {
        if (fanPowerResult) fanPowerResult.style.display = 'none';
    }

    // Show results section
    const resultsSection = document.getElementById('vav-results');
    if (resultsSection) {
        resultsSection.style.display = 'block';

        // Scroll to results
        resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}
