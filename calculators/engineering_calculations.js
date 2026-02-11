// ===================================
// Engineering Calculations Interactive Functions
// Standalone module - include this file on any page with engineering calculators
// ===================================

/**
 * Calculate sensible heat transfer
 */
function calculateSensibleHeat() {
    const cfm = parseFloat(document.getElementById('sensible-cfm').value);
    const dt = parseFloat(document.getElementById('sensible-dt').value);
    const resultDiv = document.getElementById('sensible-result');

    // Validation
    if (isNaN(cfm) || isNaN(dt) || cfm <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for both fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = 1.08 × CFM × ΔT
    const btuh = 1.08 * cfm * dt;
    const tons = btuh / 12000;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Sensible Heat: ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        Capacity: ${tons.toFixed(2)} tons
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate latent heat transfer
 */
function calculateLatentHeat() {
    const cfm = parseFloat(document.getElementById('latent-cfm').value);
    const dw = parseFloat(document.getElementById('latent-dw').value);
    const resultDiv = document.getElementById('latent-result');

    // Validation
    if (isNaN(cfm) || isNaN(dw) || cfm <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for both fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = 0.68 × CFM × Δω
    const btuh = 0.68 * cfm * dw;
    const tons = btuh / 12000;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Latent Heat: ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        Capacity: ${tons.toFixed(2)} tons
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate CFM from duct dimensions and velocity
 */
function calculateCFM() {
    const width = parseFloat(document.getElementById('cfm-width').value);
    const height = parseFloat(document.getElementById('cfm-height').value);
    const velocity = parseFloat(document.getElementById('cfm-velocity').value);
    const resultDiv = document.getElementById('cfm-result');

    // Validation
    if (isNaN(width) || isNaN(height) || isNaN(velocity) || width <= 0 || height <= 0 || velocity <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for all fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = A × V
    // Convert dimensions from inches to feet
    const widthFt = width / 12;
    const heightFt = height / 12;
    const area = widthFt * heightFt;
    const cfm = area * velocity;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Cross-sectional Area: ${area.toFixed(3)} ft²<br>
        Airflow (CFM): ${cfm.toLocaleString('en-US', {maximumFractionDigits: 0})} CFM
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate pump hydraulic power
 */
function calculatePumpPower() {
    const gpm = parseFloat(document.getElementById('pump-gpm').value);
    const head = parseFloat(document.getElementById('pump-head').value);
    const eff = parseFloat(document.getElementById('pump-eff').value);
    const resultDiv = document.getElementById('pump-result');

    // Validation
    if (isNaN(gpm) || isNaN(head) || isNaN(eff) || gpm <= 0 || head <= 0 || eff <= 0 || eff > 100) {
        resultDiv.innerHTML = '⚠️ Please enter valid values. Efficiency must be between 0-100%.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: HP = (GPM × Head × SG) / (3960 × η)
    // SG = 1.0 for water
    const effDecimal = eff / 100;
    const hp = (gpm * head * 1.0) / (3960 * effDecimal);
    const kw = hp * 0.746;

    // Suggest next standard motor size
    const standardSizes = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
    let suggestedHP = standardSizes.find(size => size >= hp) || hp;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Required Hydraulic Power: ${hp.toFixed(2)} HP<br>
        Electrical Power: ${kw.toFixed(2)} kW<br>
        <em>Suggested Motor Size: ${suggestedHP} HP</em>
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Convert temperature between different units
 */
function convertTemperature() {
    const value = parseFloat(document.getElementById('temp-value').value);
    const fromUnit = document.getElementById('temp-from').value;
    const resultDiv = document.getElementById('temp-result');

    // Validation
    if (isNaN(value)) {
        resultDiv.innerHTML = '⚠️ Please enter a valid temperature value.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    let celsius, fahrenheit, kelvin, rankine;

    // Convert to Celsius first
    switch(fromUnit) {
        case 'F':
            fahrenheit = value;
            celsius = (value - 32) * 5/9;
            break;
        case 'C':
            celsius = value;
            fahrenheit = (value * 9/5) + 32;
            break;
        case 'K':
            kelvin = value;
            celsius = value - 273.15;
            fahrenheit = (celsius * 9/5) + 32;
            break;
        case 'R':
            rankine = value;
            fahrenheit = value - 459.67;
            celsius = (fahrenheit - 32) * 5/9;
            break;
    }

    // Calculate all units
    if (kelvin === undefined) kelvin = celsius + 273.15;
    if (rankine === undefined) rankine = fahrenheit + 459.67;

    resultDiv.innerHTML = `
        <strong>Conversions:</strong><br>
        ${fahrenheit.toFixed(2)}°F (Fahrenheit)<br>
        ${celsius.toFixed(2)}°C (Celsius)<br>
        ${kelvin.toFixed(2)} K (Kelvin)<br>
        ${rankine.toFixed(2)}°R (Rankine)
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Convert cooling capacity between tons, BTU/hr, and kW
 */
function convertCapacity() {
    const value = parseFloat(document.getElementById('capacity-value').value);
    const unit = document.getElementById('capacity-unit').value;
    const resultDiv = document.getElementById('capacity-result');

    // Validation
    if (isNaN(value) || value <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter a valid positive value.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    let tons, btuh, kw;

    // Convert to BTU/hr first
    switch(unit) {
        case 'tons':
            tons = value;
            btuh = value * 12000;
            kw = btuh / 3412;
            break;
        case 'btu':
            btuh = value;
            tons = value / 12000;
            kw = value / 3412;
            break;
        case 'kw':
            kw = value;
            btuh = value * 3412;
            tons = btuh / 12000;
            break;
    }

    resultDiv.innerHTML = `
        <strong>Conversions:</strong><br>
        ${tons.toFixed(2)} tons (Refrigeration)<br>
        ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        ${kw.toFixed(2)} kW (Cooling)
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

// Add event listeners for Enter key on calculator inputs
document.addEventListener('DOMContentLoaded', function() {
    // Sensible heat calculator
    const sensibleInputs = ['sensible-cfm', 'sensible-dt'];
    sensibleInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateSensibleHeat();
            });
        }
    });

    // Latent heat calculator
    const latentInputs = ['latent-cfm', 'latent-dw'];
    latentInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateLatentHeat();
            });
        }
    });

    // CFM calculator
    const cfmInputs = ['cfm-width', 'cfm-height', 'cfm-velocity'];
    cfmInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateCFM();
            });
        }
    });

    // Pump power calculator
    const pumpInputs = ['pump-gpm', 'pump-head', 'pump-eff'];
    pumpInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculatePumpPower();
            });
        }
    });

    // Temperature converter
    const tempInputs = ['temp-value'];
    tempInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convertTemperature();
            });
        }
    });

    // Capacity converter
    const capacityInputs = ['capacity-value'];
    capacityInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convertCapacity();
            });
        }
    });
});






















