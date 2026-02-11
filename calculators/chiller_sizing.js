// ========================================
// CHILLER CALCULATOR FUNCTIONS
// Standalone module - include this file on any page with the chiller calculator
// ========================================

// Shared utility - format number with commas
if (typeof formatNumber === 'undefined') {
    var formatNumber = function(num) {
        return Math.round(num).toLocaleString();
    };
}

let chillerSystemData = {};

function toggleChillerGlycolMix() {
    const fluidType = document.getElementById('chiller-fluidType');
    const glycolInput = document.getElementById('chiller-glycolMixInput');
    if (fluidType && glycolInput) {
        if (fluidType.value === 'propylene' || fluidType.value === 'ethylene') {
            glycolInput.style.display = 'block';
        } else {
            glycolInput.style.display = 'none';
        }
    }
}

function updateChillerEfficiencyLabel() {
    const efficiencyType = document.getElementById('chiller-efficiencyType');
    const efficiencyLabel = document.getElementById('chiller-efficiencyLabel');
    const efficiencyHint = document.getElementById('chiller-efficiencyHint');
    const efficiencyValue = document.getElementById('chiller-efficiencyValue');

    if (efficiencyType && efficiencyLabel && efficiencyHint) {
        if (efficiencyType.value === 'eer') {
            efficiencyLabel.textContent = 'EER Value:';
            efficiencyHint.textContent = 'Typical air-cooled: 10-12 EER, water-cooled: 14-20 EER';
            efficiencyValue.placeholder = '12-20 for EER';
            if (!efficiencyValue.value || efficiencyValue.value < 5) {
                efficiencyValue.value = '14';
            }
        } else {
            efficiencyLabel.textContent = 'kW/Ton Value:';
            efficiencyHint.textContent = 'Typical air-cooled: 0.8-1.2 kW/ton, water-cooled: 0.5-0.7 kW/ton';
            efficiencyValue.placeholder = '0.5-1.2 for kW/ton';
            if (!efficiencyValue.value || efficiencyValue.value > 5) {
                efficiencyValue.value = '0.7';
            }
        }
    }
}

function calculateChillerSystem() {
    const sqft = parseFloat(document.getElementById('chiller-sqft').value);
    const safetyFactorPercent = parseFloat(document.getElementById('chiller-safetyFactor').value);
    const sqftPerTon = parseFloat(document.getElementById('chiller-sqftPerTon').value);

    if (!sqftPerTon || sqftPerTon <= 0) {
        alert('Please enter a valid square feet per ton value');
        return;
    }

    if (!sqft || sqft <= 0) {
        alert('Please enter a valid square footage');
        return;
    }

    const fluidType = document.getElementById('chiller-fluidType').value;
    const enterTemp = parseFloat(document.getElementById('chiller-enterTemp').value);
    const leaveTemp = parseFloat(document.getElementById('chiller-leaveTemp').value);
    const glycolPercent = parseFloat(document.getElementById('chiller-glycolPercent').value) || 0;

    if (!enterTemp || !leaveTemp) {
        alert('Please enter valid entering and leaving temperatures');
        return;
    }

    const deltaT = Math.abs(enterTemp - leaveTemp);
    if (deltaT === 0) {
        alert('Temperature difference cannot be zero');
        return;
    }

    const baseTons = sqft / sqftPerTon;
    const baseCoolingLoad = baseTons * 12000; // Convert tons to BTU/hr
    const safetyFactor = 1 + (safetyFactorPercent / 100);
    const requiredBTU = baseCoolingLoad * safetyFactor;
    const requiredTons = requiredBTU / 12000; // 12,000 BTU/hr = 1 ton

    let specificHeat, density;

    if (fluidType === 'water') {
        specificHeat = 1.0;
        density = 8.34;
    } else if (fluidType === 'propylene') {
        specificHeat = 1.0 - (0.003 * glycolPercent);
        density = 8.34 + (0.01 * glycolPercent);
    } else {
        specificHeat = 1.0 - (0.0035 * glycolPercent);
        density = 8.34 + (0.012 * glycolPercent);
    }

    const specificGravity = density / 8.34;
    const systemFlowGPM = requiredBTU / (500 * deltaT * specificGravity * specificHeat);

    chillerSystemData = {
        requiredBTU: requiredBTU,
        requiredTons: requiredTons,
        baseCoolingLoad: baseCoolingLoad,
        deltaT: deltaT,
        specificHeat: specificHeat,
        density: density,
        specificGravity: specificGravity
    };

    document.getElementById('chiller-coolingLoad').textContent = formatNumber(baseCoolingLoad) + ' BTU/hr';
    document.getElementById('chiller-requiredBTU').textContent = formatNumber(requiredBTU) + ' BTU/hr';
    document.getElementById('chiller-requiredTons').textContent = requiredTons.toFixed(1) + ' Tons';
    document.getElementById('chiller-deltaT').textContent = deltaT.toFixed(1) + '°F';
    document.getElementById('chiller-specificHeat').textContent = specificHeat.toFixed(3) + ' BTU/lb·°F';
    document.getElementById('chiller-density').textContent = density.toFixed(2) + ' lb/gal';
    document.getElementById('chiller-systemFlow').textContent = systemFlowGPM.toFixed(1) + ' GPM';

    document.getElementById('chiller-systemResults').style.display = 'block';
}

function calculateChillerSelectedSystem() {
    if (!chillerSystemData.requiredBTU) {
        alert('Please calculate System Requirements first');
        return;
    }

    const chillerQuantity = parseInt(document.getElementById('chiller-quantity').value);
    const chillerCapacityTons = parseFloat(document.getElementById('chiller-capacity').value);
    const efficiencyType = document.getElementById('chiller-efficiencyType').value;
    const efficiencyValue = parseFloat(document.getElementById('chiller-efficiencyValue').value);

    if (!chillerQuantity || chillerQuantity <= 0) {
        alert('Please enter a valid number of chillers');
        return;
    }

    if (!chillerCapacityTons || chillerCapacityTons <= 0) {
        alert('Please enter a valid chiller capacity');
        return;
    }

    if (!efficiencyValue || efficiencyValue <= 0) {
        alert('Please enter a valid efficiency value');
        return;
    }

    const capacityPerChillerBTU = chillerCapacityTons * 12000;
    const totalCapacityBTU = capacityPerChillerBTU * chillerQuantity;
    const totalCapacityTons = chillerCapacityTons * chillerQuantity;
    const actualSafetyPercent = ((totalCapacityBTU - chillerSystemData.baseCoolingLoad) / chillerSystemData.baseCoolingLoad) * 100;

    // Calculate power consumption
    let powerPerChillerKW;
    if (efficiencyType === 'eer') {
        // EER = BTU/hr / Watts, so Watts = BTU/hr / EER
        // Convert to kW: kW = (BTU/hr / EER) / 1000
        powerPerChillerKW = (capacityPerChillerBTU / efficiencyValue) / 1000;
    } else {
        // kW/ton metric
        powerPerChillerKW = chillerCapacityTons * efficiencyValue;
    }

    const totalPowerKW = powerPerChillerKW * chillerQuantity;

    // Calculate flow rates
    const flowPerChiller = capacityPerChillerBTU / (500 * chillerSystemData.deltaT * chillerSystemData.specificGravity * chillerSystemData.specificHeat);
    const totalFlow = flowPerChiller * chillerQuantity;

    document.getElementById('chiller-capacityPerChiller').textContent = chillerCapacityTons.toFixed(1) + ' Tons (' + formatNumber(capacityPerChillerBTU) + ' BTU/hr)';
    document.getElementById('chiller-totalCapacity').textContent = totalCapacityTons.toFixed(1) + ' Tons (' + formatNumber(totalCapacityBTU) + ' BTU/hr)';
    document.getElementById('chiller-actualSafety').textContent = actualSafetyPercent.toFixed(1) + '%';
    document.getElementById('chiller-powerPerChiller').textContent = powerPerChillerKW.toFixed(1) + ' kW';
    document.getElementById('chiller-totalPower').textContent = totalPowerKW.toFixed(1) + ' kW';
    document.getElementById('chiller-flowPerChiller').textContent = flowPerChiller.toFixed(1) + ' GPM';
    document.getElementById('chiller-totalFlow').textContent = totalFlow.toFixed(1) + ' GPM';

    document.getElementById('chiller-selectedResults').style.display = 'block';
}

