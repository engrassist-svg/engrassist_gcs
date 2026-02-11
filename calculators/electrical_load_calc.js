// ============================================================================
// ELECTRICAL TOOLS - Load Calculation
// Standalone module - include this file on any page with the electrical load calculator
// ============================================================================

function updateElecLoadCommercial() {
    // Auto-update when inputs change
}

function calculateElecLoadCommercial() {
    const buildingType = parseFloat(document.getElementById('buildingType').value);
    const totalArea = parseFloat(document.getElementById('totalArea').value);
    const hvacLoad = parseFloat(document.getElementById('hvacLoadComm').value) || 0;
    const motorLoad = parseFloat(document.getElementById('motorLoadComm').value) || 0;
    const otherLoad = parseFloat(document.getElementById('otherLoadComm').value) || 0;
    const voltage = document.getElementById('voltageComm').value;

    if (!totalArea) {
        showNotification('Please enter floor area');
        return;
    }

    // Calculate general lighting load
    const lightingVA = totalArea * buildingType;
    const lightingKW = lightingVA / 1000;

    // Total connected load
    const totalConnectedKW = lightingKW + hvacLoad + motorLoad + otherLoad;

    // Apply demand factors (simplified - would vary by building type)
    let demandFactor = 1.0;
    if (lightingKW > 50) {
        // First 50 kW at 100%, remainder at 75%
        const demandKW = 50 + (lightingKW - 50) * 0.75 + hvacLoad + motorLoad + otherLoad;
        demandFactor = demandKW / totalConnectedKW;
    }

    const demandLoadKW = totalConnectedKW * demandFactor;

    // Calculate current based on voltage
    let systemVoltage = 208;
    let demandCurrent = 0;
    if (voltage === '208') {
        systemVoltage = 208;
        demandCurrent = (demandLoadKW * 1000) / (Math.sqrt(3) * 208);
    } else if (voltage === '240') {
        systemVoltage = 240;
        demandCurrent = (demandLoadKW * 1000) / 240;
    } else if (voltage === '480') {
        systemVoltage = 480;
        demandCurrent = (demandLoadKW * 1000) / (Math.sqrt(3) * 480);
    }

    // Find service size
    const minService = Math.ceil(demandCurrent / 100) * 100;
    const serviceSizes = [100, 200, 400, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000];
    let recommendedService = serviceSizes[0];
    for (let size of serviceSizes) {
        if (size >= demandCurrent) {
            recommendedService = size;
            break;
        }
    }

    // Display results
    document.getElementById('commercialElecResults').style.display = 'block';
    document.getElementById('lightingLoadComm').textContent = lightingKW.toFixed(1) + ' kW';
    document.getElementById('totalConnComm').textContent = totalConnectedKW.toFixed(1) + ' kW';
    document.getElementById('demandLoadComm').textContent = demandLoadKW.toFixed(1) + ' kW';
    document.getElementById('demandCurrentComm').textContent = demandCurrent.toFixed(0) + ' A';
    document.getElementById('minServiceComm').textContent = minService + ' A';
    document.getElementById('recServiceComm').textContent = recommendedService + ' A';
}

function updateElecLoadResidential() {
    // Auto-update when inputs change
}

function calculateElecLoadResidential() {
    const dwellingArea = parseFloat(document.getElementById('dwellingArea').value);
    const smallAppl = parseInt(document.getElementById('smallAppl').value);
    const laundry = parseInt(document.getElementById('laundry').value);
    const range = parseFloat(document.getElementById('range').value) || 0;
    const dryer = parseFloat(document.getElementById('dryer').value) || 0;
    const waterHeater = parseFloat(document.getElementById('waterHeater').value) || 0;
    const dishwasher = parseFloat(document.getElementById('dishwasher').value) || 0;
    const acLoad = parseFloat(document.getElementById('acLoad').value) || 0;
    const acUnit = document.getElementById('acUnit').value;
    const heatLoad = parseFloat(document.getElementById('heatLoad').value) || 0;

    if (!dwellingArea) {
        showNotification('Please enter dwelling area');
        return;
    }

    // Calculate general loads (NEC 220.82)
    const generalLighting = dwellingArea * 3 / 1000; // 3 VA/sq ft in kW
    const smallApplKW = smallAppl * 1.5; // 1500 VA per circuit
    const laundryKW = laundry * 1.5;

    const generalTotal = generalLighting + smallApplKW + laundryKW + range + dryer + waterHeater + dishwasher;

    // Apply demand factor: first 10 kVA at 100%, remainder at 40%
    let generalDemand = 0;
    if (generalTotal <= 10) {
        generalDemand = generalTotal;
    } else {
        generalDemand = 10 + (generalTotal - 10) * 0.4;
    }

    // HVAC - convert tons to kW if needed
    let acKW = acLoad;
    if (acUnit === 'tons') {
        acKW = acLoad * 3.5; // Approximate: 1 ton ≈ 3.5 kW
    }

    // Use larger of heating or cooling
    const hvacLoad = Math.max(acKW, heatLoad);

    // Total demand
    const totalDemand = generalDemand + hvacLoad;
    const demandCurrent = (totalDemand * 1000) / 240;

    // Service sizing
    let recommendedService = 100;
    if (demandCurrent > 100) recommendedService = 125;
    if (demandCurrent > 125) recommendedService = 150;
    if (demandCurrent > 150) recommendedService = 200;
    if (demandCurrent > 200) recommendedService = 320;
    if (demandCurrent > 320) recommendedService = 400;

    // Display results
    document.getElementById('residentialElecResults').style.display = 'block';
    document.getElementById('generalDemandRes').textContent = generalDemand.toFixed(1) + ' kW';
    document.getElementById('totalDemandRes').textContent = totalDemand.toFixed(1) + ' kW';
    document.getElementById('demandCurrentRes').textContent = demandCurrent.toFixed(0) + ' A';
    document.getElementById('minServiceRes').textContent = Math.ceil(demandCurrent) + ' A';
    document.getElementById('recServiceRes').textContent = recommendedService + ' A';
}

