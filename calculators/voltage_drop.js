// ============================================================================
// ELECTRICAL TOOLS - Voltage Drop Calculator
// Standalone module - include this file on any page with the voltage drop calculator
// ============================================================================

// Conductor resistance data (ohms per 1000 ft at 75°C)
const conductorResistance = {
    copper: {
        '14': 3.14, '12': 1.98, '10': 1.24, '8': 0.778, '6': 0.491,
        '4': 0.308, '3': 0.245, '2': 0.194, '1': 0.154,
        '1/0': 0.122, '2/0': 0.0967, '3/0': 0.0766, '4/0': 0.0608,
        '250': 0.0515, '300': 0.0429, '350': 0.0367, '400': 0.0321,
        '500': 0.0258, '600': 0.0214, '750': 0.0171, '1000': 0.0129
    },
    aluminum: {
        '12': 3.25, '10': 2.04, '8': 1.28, '6': 0.808,
        '4': 0.508, '3': 0.403, '2': 0.319, '1': 0.253,
        '1/0': 0.201, '2/0': 0.159, '3/0': 0.126, '4/0': 0.100,
        '250': 0.0847, '300': 0.0707, '350': 0.0605, '400': 0.0529,
        '500': 0.0424, '600': 0.0353
    }
};

function calculateVoltageDrop1ph() {
    // Get inputs
    const voltageSelect = document.getElementById('voltage1ph').value;
    const customVoltage = parseFloat(document.getElementById('customVoltage1ph').value);
    const voltage = voltageSelect === 'custom' ? customVoltage : parseFloat(voltageSelect);
    const current = parseFloat(document.getElementById('current1ph').value);
    const wireSize = document.getElementById('wireSize1ph').value;
    const material = document.getElementById('conductorMaterial1ph').value;
    const length = parseFloat(document.getElementById('oneWayLength1ph').value);
    const powerFactor = parseFloat(document.getElementById('powerFactor1ph').value);
    const temp = parseFloat(document.getElementById('temperature1ph').value);

    // Validate inputs
    if (!voltage || !current || !wireSize || !length) {
        return;
    }

    // Get resistance
    const resistance = conductorResistance[material][wireSize];
    if (!resistance) {
        showNotification('Invalid wire size selection');
        return;
    }

    // Temperature correction (simplified)
    const tempFactor = 1 + 0.00323 * (temp - 75) / 1000;
    const adjustedR = resistance * tempFactor;

    // Calculate voltage drop for single-phase
    // VD = 2 * K * I * L * R for simplified calculation
    const K = 1; // Constant for calculation in consistent units
    const reactance = 0.05; // Simplified reactance in ohms per 1000 ft
    const sinTheta = Math.sqrt(1 - powerFactor * powerFactor);

    // Effective impedance
    const impedance = adjustedR * powerFactor + reactance * sinTheta;

    const voltageDrop = 2 * K * current * (length / 1000) * impedance;
    const voltageDropPercent = (voltageDrop / voltage) * 100;
    const voltageAtLoad = voltage - voltageDrop;

    // Display results
    document.getElementById('results1ph').style.display = 'block';
    document.getElementById('voltageDrop1ph').textContent = voltageDrop.toFixed(2) + ' V';
    document.getElementById('voltageDropPercent1ph').textContent = voltageDropPercent.toFixed(2) + '%';
    document.getElementById('voltageAtLoad1ph').textContent = voltageAtLoad.toFixed(1) + ' V';

    // NEC compliance check
    let compliance = '';
    if (voltageDropPercent <= 3) {
        compliance = '✓ Within NEC recommendation (≤3%)';
    } else if (voltageDropPercent <= 5) {
        compliance = '⚠ Exceeds branch circuit recommendation (3%), but within combined limit (5%)';
    } else {
        compliance = '✗ Exceeds NEC recommendation (>5%)';
    }
    document.getElementById('necCompliance1ph').textContent = compliance;
}

function calculateVoltageDrop3ph() {
    const voltageSelect = document.getElementById('voltage3ph').value;
    const customVoltage = parseFloat(document.getElementById('customVoltage3ph').value);
    const voltage = voltageSelect === 'custom' ? customVoltage : parseFloat(voltageSelect);
    const current = parseFloat(document.getElementById('current3ph').value);
    const wireSize = document.getElementById('wireSize3ph').value;
    const material = document.getElementById('conductorMaterial3ph').value;
    const length = parseFloat(document.getElementById('oneWayLength3ph').value);
    const powerFactor = parseFloat(document.getElementById('powerFactor3ph').value);
    const temp = parseFloat(document.getElementById('temperature3ph').value);

    if (!voltage || !current || !wireSize || !length) {
        return;
    }

    const resistance = conductorResistance[material][wireSize];
    if (!resistance) {
        showNotification('Invalid wire size selection');
        return;
    }

    const tempFactor = 1 + 0.00323 * (temp - 75) / 1000;
    const adjustedR = resistance * tempFactor;

    const reactance = 0.05;
    const sinTheta = Math.sqrt(1 - powerFactor * powerFactor);
    const impedance = adjustedR * powerFactor + reactance * sinTheta;

    // Three-phase voltage drop: VD = √3 * I * L * Z / 1000
    const voltageDrop = Math.sqrt(3) * current * (length / 1000) * impedance;
    const voltageDropPercent = (voltageDrop / voltage) * 100;
    const voltageAtLoad = voltage - voltageDrop;

    document.getElementById('results3ph').style.display = 'block';
    document.getElementById('voltageDrop3ph').textContent = voltageDrop.toFixed(2) + ' V';
    document.getElementById('voltageDropPercent3ph').textContent = voltageDropPercent.toFixed(2) + '%';
    document.getElementById('voltageAtLoad3ph').textContent = voltageAtLoad.toFixed(1) + ' V';

    let compliance = '';
    if (voltageDropPercent <= 3) {
        compliance = '✓ Within NEC recommendation (≤3%)';
    } else if (voltageDropPercent <= 5) {
        compliance = '⚠ Exceeds branch circuit recommendation (3%), but within combined limit (5%)';
    } else {
        compliance = '✗ Exceeds NEC recommendation (>5%)';
    }
    document.getElementById('necCompliance3ph').textContent = compliance;
}

function calculateVoltageDropDC() {
    const voltageSelect = document.getElementById('voltageDC').value;
    const customVoltage = parseFloat(document.getElementById('customVoltageDC').value);
    const voltage = voltageSelect === 'custom' ? customVoltage : parseFloat(voltageSelect);
    const current = parseFloat(document.getElementById('currentDC').value);
    const wireSize = document.getElementById('wireSizeDC').value;
    const material = document.getElementById('conductorMaterialDC').value;
    const length = parseFloat(document.getElementById('oneWayLengthDC').value);
    const temp = parseFloat(document.getElementById('temperatureDC').value);

    if (!voltage || !current || !wireSize || !length) {
        return;
    }

    const resistance = conductorResistance[material][wireSize];
    if (!resistance) {
        showNotification('Invalid wire size selection');
        return;
    }

    const tempFactor = 1 + 0.00323 * (temp - 75) / 1000;
    const adjustedR = resistance * tempFactor;

    // DC voltage drop: VD = 2 * I * L * R / 1000
    const voltageDrop = 2 * current * (length / 1000) * adjustedR;
    const voltageDropPercent = (voltageDrop / voltage) * 100;
    const voltageAtLoad = voltage - voltageDrop;

    document.getElementById('resultsDC').style.display = 'block';
    document.getElementById('voltageDropDC').textContent = voltageDrop.toFixed(2) + ' V';
    document.getElementById('voltageDropPercentDC').textContent = voltageDropPercent.toFixed(2) + '%';
    document.getElementById('voltageAtLoadDC').textContent = voltageAtLoad.toFixed(2) + ' V';

    let recommendation = '';
    if (voltageDropPercent <= 2) {
        recommendation = '✓ Excellent - Low voltage drop';
    } else if (voltageDropPercent <= 3) {
        recommendation = '✓ Good - Within typical recommendations';
    } else if (voltageDropPercent <= 5) {
        recommendation = '⚠ Consider upsizing conductor';
    } else {
        recommendation = '✗ Excessive drop - Upsize conductor';
    }
    document.getElementById('recommendationDC').textContent = recommendation;
}

// Enable/disable custom voltage inputs
document.addEventListener('DOMContentLoaded', function() {
    const voltage1ph = document.getElementById('voltage1ph');
    const customVoltage1ph = document.getElementById('customVoltage1ph');
    const voltage3ph = document.getElementById('voltage3ph');
    const customVoltage3ph = document.getElementById('customVoltage3ph');
    const voltageDC = document.getElementById('voltageDC');
    const customVoltageDC = document.getElementById('customVoltageDC');

    if (voltage1ph) {
        voltage1ph.addEventListener('change', function() {
            customVoltage1ph.disabled = this.value !== 'custom';
            if (this.value === 'custom') customVoltage1ph.focus();
        });
    }

    if (voltage3ph) {
        voltage3ph.addEventListener('change', function() {
            customVoltage3ph.disabled = this.value !== 'custom';
            if (this.value === 'custom') customVoltage3ph.focus();
        });
    }

    if (voltageDC) {
        voltageDC.addEventListener('change', function() {
            customVoltageDC.disabled = this.value !== 'custom';
            if (this.value === 'custom') customVoltageDC.focus();
        });
    }
});
