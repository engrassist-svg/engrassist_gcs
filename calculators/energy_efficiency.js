// ====================================
// ENERGY EFFICIENCY CALCULATORS
// Standalone module - include this file on any page with energy efficiency calculators
// ====================================

/**
 * Calculate VFD (Variable Frequency Drive) energy savings
 * Uses fan laws: Power varies with cube of speed ratio
 */
function calculateVFDSavings() {
    // Get input values
    const designCFM = parseFloat(document.getElementById('vfdDesignCFM').value);
    const operatingCFM = parseFloat(document.getElementById('vfdOperatingCFM').value);
    const motorHP = parseFloat(document.getElementById('vfdMotorHP').value);
    const hours = parseFloat(document.getElementById('vfdHours').value);
    const elecCost = parseFloat(document.getElementById('vfdElecCost').value);

    // Validate inputs
    if (isNaN(designCFM) || isNaN(operatingCFM) || isNaN(motorHP) || isNaN(hours) || isNaN(elecCost) ||
        designCFM <= 0 || operatingCFM <= 0 || motorHP <= 0 || hours <= 0 || elecCost < 0) {
        document.getElementById('vfdResults').innerHTML =
            '<div class="error-message">Please enter valid positive numbers for all fields.</div>';
        return;
    }

    if (operatingCFM > designCFM) {
        document.getElementById('vfdResults').innerHTML =
            '<div class="error-message">Operating airflow cannot exceed design airflow.</div>';
        return;
    }

    // Calculate speed ratio
    const speedRatio = operatingCFM / designCFM;

    // Fan laws: Power ratio = (Speed ratio)^3
    const powerRatio = Math.pow(speedRatio, 3);

    // Calculate energy consumption
    const kWperHP = 0.746; // Conversion factor
    const motorEfficiency = 0.90; // Typical motor efficiency
    const vfdEfficiency = 0.96; // Typical VFD efficiency

    // Without VFD - constant speed with damper control (assumes 70% of full power at reduced flow)
    const constantSpeedPowerRatio = 0.70; // Typical with damper control
    const constantSpeedPowerKW = (motorHP * kWperHP / motorEfficiency) * constantSpeedPowerRatio;
    const constantSpeedEnergyKWh = constantSpeedPowerKW * hours;
    const constantSpeedCost = constantSpeedEnergyKWh * elecCost;

    // With VFD - variable speed
    const vfdPowerKW = (motorHP * kWperHP / (motorEfficiency * vfdEfficiency)) * powerRatio;
    const vfdEnergyKWh = vfdPowerKW * hours;
    const vfdCost = vfdEnergyKWh * elecCost;

    // Calculate savings
    const energySavingsKWh = constantSpeedEnergyKWh - vfdEnergyKWh;
    const costSavings = constantSpeedCost - vfdCost;
    const percentSavings = (energySavingsKWh / constantSpeedEnergyKWh) * 100;

    // Display results
    document.getElementById('vfdResults').innerHTML = `
        <div class="results-section">
            <h4>Results:</h4>
            <div class="result-row">
                <span class="result-label">Speed Ratio:</span>
                <span class="result-value">${(speedRatio * 100).toFixed(1)}%</span>
            </div>
            <div class="result-row">
                <span class="result-label">Power Ratio with VFD:</span>
                <span class="result-value">${(powerRatio * 100).toFixed(1)}%</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Annual Energy Savings:</span>
                <span class="result-value">${energySavingsKWh.toLocaleString()} kWh</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Annual Cost Savings:</span>
                <span class="result-value">$${costSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="result-row">
                <span class="result-label">Percent Savings:</span>
                <span class="result-value">${percentSavings.toFixed(1)}%</span>
            </div>
            <div class="result-details">
                <p><strong>Without VFD:</strong> ${constantSpeedEnergyKWh.toLocaleString()} kWh/yr ($${constantSpeedCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</p>
                <p><strong>With VFD:</strong> ${vfdEnergyKWh.toLocaleString()} kWh/yr ($${vfdCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</p>
            </div>
        </div>
    `;
}

/**
 * Calculate heat recovery ventilator (HRV/ERV) energy savings
 */
function calculateHRVSavings() {
    // Get input values
    const cfm = parseFloat(document.getElementById('hrvCFM').value);
    const effectiveness = parseFloat(document.getElementById('hrvEffectiveness').value) / 100;
    const hdd = parseFloat(document.getElementById('hrvHDD').value);
    const cdd = parseFloat(document.getElementById('hrvCDD').value);
    const heatingCost = parseFloat(document.getElementById('hrvHeatingCost').value);
    const coolingCost = parseFloat(document.getElementById('hrvCoolingCost').value);

    // Validate inputs
    if (isNaN(cfm) || isNaN(effectiveness) || isNaN(hdd) || isNaN(cdd) || isNaN(heatingCost) || isNaN(coolingCost) ||
        cfm <= 0 || effectiveness <= 0 || effectiveness > 1 || hdd < 0 || cdd < 0 || heatingCost < 0 || coolingCost < 0) {
        document.getElementById('hrvResults').innerHTML =
            '<div class="error-message">Please enter valid numbers. Effectiveness must be between 0-100%.</div>';
        return;
    }

    // Constants
    const airDensity = 0.075; // lb/ft³
    const specificHeat = 0.24; // Btu/lb·°F
    const hoursPerDay = 24;

    // Calculate heating savings
    // Q = CFM × density × specific heat × ΔT × hours
    // Simplified: CFM × 1.08 × ΔT for sensible heat
    const heatingLoadBtuH = cfm * 1.08 * 1; // Btu/h per degree F difference
    const heatingSeasonHours = hdd * hoursPerDay; // Degree-hours
    const heatingEnergyWithoutHRV_Btu = heatingLoadBtuH * heatingSeasonHours;
    const heatingEnergyWithoutHRV_MMBtu = heatingEnergyWithoutHRV_Btu / 1000000;

    const heatingSavings_MMBtu = heatingEnergyWithoutHRV_MMBtu * effectiveness;
    const heatingSavingsCost = heatingSavings_MMBtu * heatingCost;

    // Calculate cooling savings
    const coolingLoadBtuH = cfm * 1.08 * 1; // Btu/h per degree F difference
    const coolingSeasonHours = cdd * hoursPerDay;
    const coolingEnergyWithoutHRV_Btu = coolingLoadBtuH * coolingSeasonHours;
    const coolingEnergyWithoutHRV_kWh = coolingEnergyWithoutHRV_Btu / 3412; // Convert to kWh

    // Assume COP of 3.0 for cooling
    const coolingCOP = 3.0;
    const coolingElectricity_kWh = coolingEnergyWithoutHRV_kWh / coolingCOP;

    const coolingSavings_kWh = coolingElectricity_kWh * effectiveness;
    const coolingSavingsCost = coolingSavings_kWh * coolingCost;

    // Total savings
    const totalSavingsCost = heatingSavingsCost + coolingSavingsCost;

    // Display results
    document.getElementById('hrvResults').innerHTML = `
        <div class="results-section">
            <h4>Results:</h4>
            <div class="result-row">
                <span class="result-label">Heat Recovery Effectiveness:</span>
                <span class="result-value">${(effectiveness * 100).toFixed(0)}%</span>
            </div>
            <div class="result-row">
                <span class="result-label">Heating Energy Recovered:</span>
                <span class="result-value">${heatingSavings_MMBtu.toFixed(1)} MMBtu/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Heating Cost Savings:</span>
                <span class="result-value">$${heatingSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Cooling Energy Recovered:</span>
                <span class="result-value">${coolingSavings_kWh.toLocaleString()} kWh/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Cooling Cost Savings:</span>
                <span class="result-value">$${coolingSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Total Annual Savings:</span>
                <span class="result-value">$${totalSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-details">
                <p><strong>Note:</strong> Savings estimates assume continuous ventilation operation and typical system efficiencies. Actual savings may vary based on specific operating conditions, climate, and equipment performance.</p>
                <p>Cooling calculations assume COP = ${coolingCOP.toFixed(1)}. Adjust for your specific cooling system efficiency.</p>
            </div>
        </div>
    `;
}

