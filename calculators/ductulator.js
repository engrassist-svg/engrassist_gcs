// ========================================
// DUCTULATOR CALCULATOR FUNCTIONS
// Standalone module - include this file on any page with the ductulator
// ========================================

let currentUnitSystem = 'imperial';
let lastTouchedVariable = null;

function initializeDuctulator() {
    const calcTypeSelect = document.getElementById('calculation-type');
    if (!calcTypeSelect) return;

    updateInputFields();
    setupAdvancedConditionsListeners();
}

function setupAdvancedConditionsListeners() {
    const tempInput = document.getElementById('temp');
    const humidityInput = document.getElementById('humidity');
    const elevationInput = document.getElementById('elevation');
    const densityInput = document.getElementById('density');

    if (!tempInput || !humidityInput || !elevationInput || !densityInput) return;

    tempInput.addEventListener('input', () => {
        lastTouchedVariable = 'temp';
        updateAirProperties();
    });

    humidityInput.addEventListener('input', () => {
        lastTouchedVariable = 'humidity';
        updateAirProperties();
    });

    elevationInput.addEventListener('input', () => {
        lastTouchedVariable = 'elevation';
        updateAirProperties();
    });

    densityInput.addEventListener('input', () => {
        lastTouchedVariable = 'density';
        updateAirProperties();
    });
}

function updateAirProperties() {
    const tempInput = document.getElementById('temp');
    const humidityInput = document.getElementById('humidity');
    const elevationInput = document.getElementById('elevation');
    const densityInput = document.getElementById('density');

    if (!tempInput || !humidityInput || !elevationInput || !densityInput) return;

    const temp = parseFloat(tempInput.value) || 70;
    const humidity = parseFloat(humidityInput.value) || 0;
    const elevation = parseFloat(elevationInput.value) || 0;
    const density = parseFloat(densityInput.value) || 0.075;

    // If density was last touched, calculate elevation from density
    if (lastTouchedVariable === 'density') {
        // P = ρRT, where P is pressure, ρ is density, R is gas constant, T is temperature
        // At sea level: P0 = 0.075 * R * 529.67 (70°F in Rankine)
        // At elevation: P = P0 * exp(-elevation / 27000)
        // ρ = ρ0 * (T0/T) * exp(-elevation / 27000)
        const tempRankine = temp + 459.67;
        const standardDensity = 0.075 * (529.67 / tempRankine);
        const calculatedElevation = -27000 * Math.log(density / standardDensity);
        elevationInput.value = Math.round(calculatedElevation);
    } else {
        // Calculate density from temperature, humidity, and elevation
        const tempRankine = temp + 459.67;

        // Barometric pressure calculation based on elevation
        // P = P0 * exp(-elevation / 27000) where P0 = 29.92 in Hg at sea level
        const pressureInHg = 29.92 * Math.exp(-elevation / 27000);

        // Saturation vapor pressure (Tetens equation)
        const es = 0.6108 * Math.exp((17.27 * (temp - 32) * 5/9) / ((temp - 32) * 5/9 + 237.3));
        const vaporPressure = (humidity / 100) * es * 0.2953; // Convert to in Hg

        // Dry air density calculation
        // ρ = (P_d / (R_d * T)) + (P_v / (R_v * T))
        // Simplified: ρ = (P - 0.378 * P_v) / (R * T)
        const R = 53.352; // Gas constant for dry air in ft·lbf/(lbm·°R)
        const dryPressure = pressureInHg - 0.378 * vaporPressure;
        const calculatedDensity = (dryPressure * 70.73) / (R * tempRankine); // 70.73 converts in Hg to lbf/ft²

        densityInput.value = calculatedDensity.toFixed(4);
    }
}

function toggleAdvancedConditions() {
    const stdNo = document.getElementById('std-no');
    const stdYes = document.getElementById('std-yes');
    const advancedSection = document.getElementById('advanced-conditions');

    if (stdNo && stdNo.checked) {
        // Show advanced conditions
        advancedSection.style.display = 'block';
    } else {
        // Hide advanced conditions
        advancedSection.style.display = 'none';
        // Reset to standard density when switching back to standard conditions
        if (stdYes && stdYes.checked) {
            const densityInput = document.getElementById('density');
            if (densityInput) {
                densityInput.value = '0.075';
            }
        }
    }
}

function getEffectiveDensity() {
    const stdYes = document.getElementById('std-yes');
    const densityInput = document.getElementById('density');

    // If standard conditions are selected, always use 0.075
    if (stdYes && stdYes.checked) {
        return 0.075;
    }

    // Otherwise use the value from advanced conditions
    return parseFloat(densityInput?.value) || 0.075;
}

function updateInputFields() {
    const calcType = document.getElementById('calculation-type');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    if (!calcType || !dynamicInputs) return;
    
    const calcValue = calcType.value;
    let html = '';
    
    switch(calcValue) {
        case 'size-friction':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="airflow">Airflow (CFM)</label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-group">
                        <label for="friction-rate">Friction Loss Rate (in.wg/100 ft)</label>
                        <input type="number" id="friction-rate" min="0" step="0.001" value="0.08" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="height-restriction">Height Restriction - Optional (in)</label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
            
        case 'friction-loss':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="airflow">Airflow (CFM)</label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-group">
                        <label for="width">Width (in)</label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="height">Height (in)</label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                </div>
            `;
            break;
            
        case 'airflow-rate':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="width">Width (in)</label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="height">Height (in)</label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="friction-rate">Friction Loss Rate (in.wg/100 ft)</label>
                        <input type="number" id="friction-rate" min="0" step="0.001" value="0.08" required>
                    </div>
                </div>
            `;
            break;
            
        case 'size-velocity-friction':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="airflow">Airflow (CFM)</label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-group">
                        <label for="velocity">Velocity (fpm)</label>
                        <input type="number" id="velocity" min="0" step="1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="friction-rate">Friction Loss Rate (in.wg/100 ft)</label>
                        <input type="number" id="friction-rate" min="0" step="0.001" value="0.08" required>
                    </div>
                    <div class="form-group">
                        <label for="height-restriction">Height Restriction - Optional (in)</label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
            
        case 'size-velocity':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="airflow">Airflow (CFM)</label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-group">
                        <label for="velocity">Velocity (fpm)</label>
                        <input type="number" id="velocity" min="0" step="1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="height-restriction">Height Restriction - Optional (in)</label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
            
        case 'convert-shape':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="width">Width (in)</label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="height">Height (in)</label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="airflow">Airflow - Optional (CFM)</label>
                        <input type="number" id="airflow" min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="height-restriction">Height Restriction - Optional (in)</label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
    }

    dynamicInputs.innerHTML = html;

    // Update shape-specific fields (labels and visibility)
    updateShapeFields();

    // Clear results when calculation type changes
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="info-box">
                <h4>Ready to Calculate</h4>
                <p>Enter your duct parameters and click "Calculate Results" to see the HVAC calculations.</p>
            </div>
        `;
    }
}

function updateShapeFields() {
    const shape = document.getElementById('original-shape');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');

    if (!shape) return;

    if (shape.value === 'round') {
        if (widthInput && widthInput.previousElementSibling) {
            widthInput.previousElementSibling.textContent = 'Diameter (in)';
        }
        if (heightInput) {
            heightInput.style.display = 'none';
            if (heightInput.parentElement) {
                heightInput.parentElement.style.display = 'none';
            }
        }
    } else if (shape.value === 'oval') {
        if (widthInput && widthInput.previousElementSibling) {
            widthInput.previousElementSibling.textContent = 'Major Axis (in)';
        }
        if (heightInput && heightInput.previousElementSibling) {
            heightInput.previousElementSibling.textContent = 'Minor Axis (in)';
        }
        if (heightInput) {
            heightInput.style.display = 'block';
            if (heightInput.parentElement) {
                heightInput.parentElement.style.display = 'block';
            }
        }
    } else {
        // Rectangular
        if (widthInput && widthInput.previousElementSibling) {
            widthInput.previousElementSibling.textContent = 'Width (in)';
        }
        if (heightInput && heightInput.previousElementSibling) {
            heightInput.previousElementSibling.textContent = 'Height (in)';
        }
        if (heightInput) {
            heightInput.style.display = 'block';
            if (heightInput.parentElement) {
                heightInput.parentElement.style.display = 'block';
            }
        }
    }
}

function updateUnitSystem() {
    const metricRadio = document.getElementById('metric');
    if (metricRadio && metricRadio.checked) {
        currentUnitSystem = 'metric';
    } else {
        currentUnitSystem = 'imperial';
    }
}

function calculateResults() {
    const calcType = document.getElementById('calculation-type');
    const resultsContainer = document.getElementById('results-container');
    
    if (!calcType || !resultsContainer) return;
    
    try {
        validateInputs(calcType.value);
        
        let results = {};
        
        switch(calcType.value) {
            case 'friction-loss':
                results = calculateFrictionLoss();
                break;
            case 'airflow-rate':
                results = calculateAirflowRate();
                break;
            case 'size-velocity-friction':
                results = calculateSizeVelocityFriction();
                break;
            case 'size-velocity':
                results = calculateSizeVelocity();
                break;
            case 'size-friction':
                results = calculateSizeFriction();
                break;
            case 'convert-shape':
                results = convertDuctShape();
                break;
        }
        
        displayResults(results);
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-box">
                <strong>Calculation Error:</strong> ${error.message}
            </div>
        `;
    }
}

function validateInputs(calcType) {
    const isMetric = currentUnitSystem === 'metric';
    
    const airflowInput = document.getElementById('airflow');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const velocityInput = document.getElementById('velocity');
    
    if (airflowInput && airflowInput.value) {
        const airflow = parseFloat(airflowInput.value);
        const minAirflow = isMetric ? 10 : 20;

        if (airflow < minAirflow) {
            throw new Error(`Airflow must be at least ${minAirflow} ${isMetric ? 'L/s' : 'CFM'}`);
        }
    }
    
    if (velocityInput && velocityInput.value) {
        const velocity = parseFloat(velocityInput.value);
        const minVel = isMetric ? 2 : 400;
        const maxVel = isMetric ? 15 : 3000;
        
        if (velocity < minVel || velocity > maxVel) {
            throw new Error(`Velocity should be between ${minVel} and ${maxVel} ${isMetric ? 'm/s' : 'fpm'}`);
        }
    }
    
    if (widthInput && heightInput && widthInput.value && heightInput.value) {
        const width = parseFloat(widthInput.value);
        const height = parseFloat(heightInput.value);
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        
        if (aspectRatio > 4) {
            throw new Error(`Aspect ratio (${aspectRatio.toFixed(1)}:1) exceeds recommended maximum of 4:1`);
        }
    }
}

function calculateFrictionLoss() {
    const airflow = parseFloat(document.getElementById('airflow').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const roughness = parseFloat(document.getElementById('duct-roughness').value);
    const shape = document.getElementById('original-shape').value;
    const density = getEffectiveDensity();

    if (!airflow || !width || (shape !== 'round' && !height)) {
        throw new Error('Please fill in all required fields');
    }

    let hydraulicDiameter, area, velocity, reynoldsNumber, frictionFactor, frictionLoss;

    if (shape === 'round') {
        const diameter = width;
        area = Math.PI * Math.pow(diameter / 12, 2) / 4;
        hydraulicDiameter = diameter / 12;
        velocity = airflow / area;
    } else if (shape === 'oval') {
        // Oval/flat oval duct: width = major axis, height = minor axis
        const majorAxis = width;
        const minorAxis = height;
        // Area of ellipse = π × a × b (where a and b are semi-axes)
        area = Math.PI * (majorAxis / 2 / 12) * (minorAxis / 2 / 12); // ft²
        // Perimeter approximation for ellipse (Ramanujan's formula)
        const a = majorAxis / 2;
        const b = minorAxis / 2;
        const h = Math.pow((a - b), 2) / Math.pow((a + b), 2);
        const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h))) / 12; // ft
        hydraulicDiameter = 4 * area / perimeter;
        velocity = airflow / area;
    } else {
        // Rectangular
        area = (width * height) / 144;
        const perimeter = 2 * (width + height) / 12;
        hydraulicDiameter = 4 * area / perimeter;
        velocity = airflow / area;
    }

    const dynamicViscosity = 1.22e-5; // lb/(ft·s) for air at 70°F
    const velocityFPS = velocity / 60;
    reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;

    const relativeRoughness = roughness / hydraulicDiameter;
    frictionFactor = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);

    const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
    const frictionLossInWG = frictionFactor * (100 / hydraulicDiameter) * velocityPressure;
    frictionLoss = frictionLossInWG; // Keep in inches per 100 ft

    return {
        hydraulicDiameter: (hydraulicDiameter * 12).toFixed(2),
        area: area.toFixed(3),
        velocity: velocity.toFixed(0),
        reynoldsNumber: reynoldsNumber.toFixed(0),
        frictionFactor: frictionFactor.toFixed(4),
        frictionLoss: frictionLoss.toFixed(5),
        velocityPressure: velocityPressure.toFixed(4)
    };
}

function calculateAirflowRate() {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const frictionRate = parseFloat(document.getElementById('friction-rate').value);
    const roughness = parseFloat(document.getElementById('duct-roughness').value);
    const shape = document.getElementById('original-shape').value;
    const density = getEffectiveDensity();

    if (!width || (shape !== 'round' && !height) || !frictionRate) {
        throw new Error('Please fill in all required fields');
    }

    // frictionRate is in in.wg per 100 ft
    const targetFriction = frictionRate;

    // Calculate area and hydraulic diameter based on shape
    let area, hydraulicDiameter;

    if (shape === 'round') {
        const diameter = width;
        area = Math.PI * Math.pow(diameter / 12, 2) / 4; // ft²
        hydraulicDiameter = diameter / 12; // ft
    } else if (shape === 'oval') {
        // Oval/flat oval duct: width = major axis, height = minor axis
        const majorAxis = width;
        const minorAxis = height;
        // Area of ellipse = π × a × b (where a and b are semi-axes)
        area = Math.PI * (majorAxis / 2 / 12) * (minorAxis / 2 / 12); // ft²
        // Perimeter approximation for ellipse (Ramanujan's formula)
        const a = majorAxis / 2;
        const b = minorAxis / 2;
        const h = Math.pow((a - b), 2) / Math.pow((a + b), 2);
        const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h))) / 12; // ft
        hydraulicDiameter = 4 * area / perimeter; // ft
    } else {
        // Rectangular
        area = (width * height) / 144; // ft²
        const perimeter = 2 * (width + height) / 12; // ft
        hydraulicDiameter = 4 * area / perimeter; // ft
    }

    const dynamicViscosity = 1.22e-5; // lb/(ft·s) for air at 70°F

    // Helper function to calculate friction for a given airflow
    function getFrictionForAirflow(cfm) {
        const velocity = cfm / area; // fpm
        const velocityFPS = velocity / 60; // fps
        const reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;

        const relativeRoughness = roughness / hydraulicDiameter;
        let frictionFactor;

        if (reynoldsNumber > 2300) {
            const term1 = relativeRoughness / 3.7;
            const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
            frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        } else {
            frictionFactor = 64 / reynoldsNumber;
        }

        const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
        const frictionLoss = frictionFactor * (100 / hydraulicDiameter) * velocityPressure;

        return frictionLoss;
    }

    // Binary search to find airflow that produces target friction rate
    let minCFM = 20;
    let maxCFM = 1000000;
    let airflow;

    for (let i = 0; i < 100; i++) {
        airflow = (minCFM + maxCFM) / 2;
        const calculatedFriction = getFrictionForAirflow(airflow);

        const error = Math.abs(calculatedFriction - targetFriction);

        if (error < 0.00001) {
            break;
        }

        if (calculatedFriction < targetFriction) {
            // Friction too low, need more airflow
            minCFM = airflow;
        } else {
            // Friction too high, need less airflow
            maxCFM = airflow;
        }
    }

    // Calculate final properties
    const velocity = airflow / area;
    const velocityFPS = velocity / 60;
    const reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;

    const relativeRoughness = roughness / hydraulicDiameter;
    let frictionFactor;
    if (reynoldsNumber > 2300) {
        const term1 = relativeRoughness / 3.7;
        const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
        frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
    } else {
        frictionFactor = 64 / reynoldsNumber;
    }

    const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);

    return {
        airflow: airflow.toFixed(0),
        hydraulicDiameter: (hydraulicDiameter * 12).toFixed(2),
        area: area.toFixed(3),
        velocity: velocity.toFixed(0),
        reynoldsNumber: reynoldsNumber.toFixed(0),
        frictionFactor: frictionFactor.toFixed(4),
        frictionRate: frictionRate.toFixed(5),
        velocityPressure: velocityPressure.toFixed(4)
    };
}

// Calculate total airflow for each type and pressurization
function calculateAirflow() {
    // Sum up all air terminals by type
    let supplyCFM = 0;
    let returnCFM = 0;
    let exhaustCFM = 0;
    
    airTerminals.forEach(terminal => {
        if (terminal.type === 'supply') {
            supplyCFM += terminal.cfm;
        } else if (terminal.type === 'return') {
            returnCFM += terminal.cfm;
        } else if (terminal.type === 'exhaust') {
            exhaustCFM += terminal.cfm;
        }
    });
    
    // Get target pressurization settings
    const pressType = document.getElementById('pressurization-type').value;
    const targetPercent = parseFloat(document.getElementById('target-percent').value) || 0;
    
    // Calculate REQUIRED outside air based on exhaust and target pressurization
    let requiredOA = 0;
    
    if (exhaustCFM > 0) {
        if (pressType === 'positive') {
            // Positive: OA must be MORE than exhaust
            requiredOA = exhaustCFM * (1 + targetPercent / 100);
        } else if (pressType === 'negative') {
            // Negative: OA must be LESS than exhaust
            requiredOA = exhaustCFM * (1 - targetPercent / 100);
        } else {
            // Neutral: OA must EQUAL exhaust
            requiredOA = exhaustCFM;
        }
    } else {
        requiredOA = 0;
    }
    
    requiredOA = Math.max(0, requiredOA);
    
    // Update all airflow displays
    document.getElementById('supply-cfm').value = supplyCFM.toFixed(0);
    document.getElementById('return-cfm').value = returnCFM.toFixed(0);
    document.getElementById('exhaust-cfm').value = exhaustCFM.toFixed(0);
    document.getElementById('outside-air-cfm').value = requiredOA.toFixed(0);
    
    // Calculate actual pressurization based on required OA vs Exhaust
    let actualPercent = 0;
    let actualType = 'Neutral';
    
    if (exhaustCFM > 0) {
        actualPercent = ((requiredOA - exhaustCFM) / exhaustCFM) * 100;
        
        if (actualPercent > 0.5) {
            actualType = 'Positive';
        } else if (actualPercent < -0.5) {
            actualType = 'Negative';
            actualPercent = Math.abs(actualPercent);
        } else {
            actualType = 'Neutral';
            actualPercent = 0;
        }
    }
    
    document.getElementById('actual-pressurization').textContent = 
        `${actualPercent.toFixed(1)}% ${actualType}`;
    
    // Calculate Outside Air Percentage (based on supply)
    let oaPercentage = 0;
    if (supplyCFM > 0) {
        oaPercentage = (requiredOA / supplyCFM) * 100;
    }
    document.getElementById('oa-percentage').textContent = oaPercentage.toFixed(1) + '%';

    // Check System Balance: Supply should equal Return + Outside Air
    const balanceElement = document.getElementById('system-balance');
    const balanceBox = document.getElementById('balance-indicator-box');
    if (balanceElement && balanceBox) {
        const calculatedSupply = returnCFM + requiredOA;
        const balanceTolerance = 1; // Allow 1 CFM tolerance for rounding

        if (Math.abs(supplyCFM - calculatedSupply) <= balanceTolerance) {
            balanceElement.textContent = '✓ BALANCED';
            balanceElement.style.color = '#27ae60';
            balanceBox.style.background = '#d4edda';
        } else {
            balanceElement.textContent = '✗ UNBALANCED';
            balanceElement.style.color = '#e74c3c';
            balanceBox.style.background = '#f8d7da';
        }
    }

    // Update Balance Adjustment Section
    updateBalanceAdjustment(supplyCFM, returnCFM, exhaustCFM, requiredOA, pressType, targetPercent);

    // Update explanation text
    updateExplanationText(pressType, targetPercent, requiredOA, exhaustCFM, oaPercentage, supplyCFM, returnCFM);
    
    // Check if advanced mode is enabled
    const advancedSection = document.getElementById('advanced-section');
    if (advancedSection && advancedSection.style.display !== 'none') {
        calculatePsychrometrics(supplyCFM, requiredOA, returnCFM, oaPercentage);
    }
}

// Update the explanation text based on current state
function updateExplanationText(pressType, targetPercent, requiredOA, exhaustCFM, oaPercentage, supplyCFM, returnCFM) {
    const explanationElement = document.getElementById('oa-explanation');
    
    if (exhaustCFM === 0 && supplyCFM === 0) {
        explanationElement.innerHTML = 'Add air terminals below to calculate airflow and pressurization.';
        return;
    }
    
    if (exhaustCFM === 0) {
        explanationElement.innerHTML = 'Add exhaust air terminals to calculate building pressurization requirements.';
        return;
    }
    
    let message = '';
    
    // Explain the required OA calculation
    if (pressType === 'positive') {
        message = `For <strong>${targetPercent}% positive pressurization</strong>, required outside air is <strong>${requiredOA.toFixed(0)} CFM</strong> `;
        message += `(Exhaust ${exhaustCFM} CFM × ${(1 + targetPercent/100).toFixed(2)}). `;
    } else if (pressType === 'negative') {
        message = `For <strong>${targetPercent}% negative pressurization</strong>, required outside air is <strong>${requiredOA.toFixed(0)} CFM</strong> `;
        message += `(Exhaust ${exhaustCFM} CFM × ${(1 - targetPercent/100).toFixed(2)}). `;
    } else {
        message = `For <strong>neutral pressurization</strong>, required outside air is <strong>${requiredOA.toFixed(0)} CFM</strong> `;
        message += `(equal to exhaust ${exhaustCFM} CFM). `;
    }
    
    if (supplyCFM > 0) {
        message += `This represents <strong>${oaPercentage.toFixed(1)}%</strong> of supply air. `;
        
        // Check system balance: Supply should = Return + OA
        const actualOAFromBalance = supplyCFM - returnCFM;
        const oaBalance = requiredOA - actualOAFromBalance;
        
        if (Math.abs(oaBalance) > 10) {
            if (oaBalance > 0) {
                // Need more OA - need to increase supply or reduce return
                message += `<br><br><strong>⚠️ System Balance:</strong> Current terminals provide ${actualOAFromBalance.toFixed(0)} CFM outside air (Supply ${supplyCFM} - Return ${returnCFM}). `;
                message += `Need to increase supply by ${oaBalance.toFixed(0)} CFM or decrease return by ${oaBalance.toFixed(0)} CFM to meet pressurization target.`;
            } else {
                // Have too much OA - need to decrease supply or increase return
                message += `<br><br><strong>⚠️ System Balance:</strong> Current terminals provide ${actualOAFromBalance.toFixed(0)} CFM outside air (Supply ${supplyCFM} - Return ${returnCFM}). `;
                message += `Need to decrease supply by ${Math.abs(oaBalance).toFixed(0)} CFM or increase return by ${Math.abs(oaBalance).toFixed(0)} CFM to meet pressurization target.`;
            }
        } else {
            message += `<br><br><strong>✓ System Balance:</strong> Supply (${supplyCFM} CFM) = Return (${returnCFM} CFM) + Outside Air (${requiredOA.toFixed(0)} CFM). System is balanced!`;
        }
    }
    
    explanationElement.innerHTML = message;
}

// Update the balance adjustment section to show exhaust requirements
function updateBalanceAdjustment(supplyCFM, returnCFM, exhaustCFM, requiredOA, pressType, targetPercent) {
    const balanceSection = document.getElementById('balance-adjustment-section');
    if (!balanceSection) return;

    // Calculate actual outside air from current terminals
    const actualOA = supplyCFM - returnCFM;

    // Only show if we have exhaust air
    if (exhaustCFM === 0 || supplyCFM === 0) {
        balanceSection.style.display = 'none';
        return;
    }

    balanceSection.style.display = 'block';

    // Calculate the multiplier for target pressurization
    let multiplier = 1.0;
    if (pressType === 'positive') {
        multiplier = 1 + (targetPercent / 100);
    } else if (pressType === 'negative') {
        multiplier = 1 - (targetPercent / 100);
    }

    // Calculate what exhaust should be to achieve balance with current OA
    // OA = Exhaust × Multiplier, so Exhaust = OA / Multiplier
    const exhaustNeeded = actualOA / multiplier;
    const exhaustAdjustment = exhaustNeeded - exhaustCFM;

    // Update all the fields
    document.getElementById('balance-current-oa').textContent = actualOA.toFixed(0) + ' CFM';
    document.getElementById('balance-current-exhaust').textContent = exhaustCFM.toFixed(0) + ' CFM';
    document.getElementById('balance-multiplier').textContent = multiplier.toFixed(3);
    document.getElementById('balance-exhaust-needed').textContent = exhaustNeeded.toFixed(0) + ' CFM';

    const adjustmentElement = document.getElementById('balance-exhaust-adjustment');
    if (exhaustAdjustment > 0) {
        adjustmentElement.textContent = '+' + exhaustAdjustment.toFixed(0) + ' CFM (increase)';
        adjustmentElement.style.color = '#e74c3c';
    } else if (exhaustAdjustment < 0) {
        adjustmentElement.textContent = exhaustAdjustment.toFixed(0) + ' CFM (decrease)';
        adjustmentElement.style.color = '#3498db';
    } else {
        adjustmentElement.textContent = '0 CFM (balanced)';
        adjustmentElement.style.color = '#27ae60';
    }

    // Update recommendation text
    const recommendationElement = document.getElementById('balance-recommendation');
    let recommendation = '';

    if (Math.abs(exhaustAdjustment) <= 1) {
        recommendation = '✓ System is balanced! Current exhaust airflow achieves target pressurization.';
    } else if (exhaustAdjustment > 0) {
        recommendation = `To achieve ${targetPercent}% ${pressType} pressurization with current outside air (${actualOA.toFixed(0)} CFM), `;
        recommendation += `<strong>increase exhaust by ${exhaustAdjustment.toFixed(0)} CFM</strong> to ${exhaustNeeded.toFixed(0)} CFM total.`;
    } else {
        recommendation = `To achieve ${targetPercent}% ${pressType} pressurization with current outside air (${actualOA.toFixed(0)} CFM), `;
        recommendation += `<strong>decrease exhaust by ${Math.abs(exhaustAdjustment).toFixed(0)} CFM</strong> to ${exhaustNeeded.toFixed(0)} CFM total.`;
    }

    recommendationElement.innerHTML = recommendation;
}

function calculateSizeVelocityFriction() {
    const airflow = parseFloat(document.getElementById('airflow').value);
    const velocity = parseFloat(document.getElementById('velocity').value);
    const targetFrictionRate = parseFloat(document.getElementById('friction-rate').value);
    const heightRestriction = parseFloat(document.getElementById('height-restriction')?.value);
    const roughness = parseFloat(document.getElementById('duct-roughness').value);
    const shape = document.getElementById('original-shape').value;
    const density = getEffectiveDensity();

    if (!airflow || !velocity || !targetFrictionRate) {
        throw new Error('Please fill in all required fields');
    }

    const requiredArea = airflow / velocity; // ft²
    const dynamicViscosity = 1.22e-5; // lb/(ft·s)

    let width, height, diameter, hydraulicDiameter, area;

    if (shape === 'round') {
        diameter = Math.sqrt(4 * requiredArea / Math.PI) * 12; // inches
        area = requiredArea;
        hydraulicDiameter = diameter / 12; // ft
    } else {
        if (heightRestriction) {
            height = heightRestriction;
            width = (requiredArea * 144) / height;
        } else {
            const side = Math.sqrt(requiredArea * 144);
            width = side;
            height = side;
        }
        area = (width * height) / 144; // ft²
        const perimeter = 2 * (width + height) / 12; // ft
        hydraulicDiameter = 4 * area / perimeter; // ft
    }

    // Calculate actual friction rate for these dimensions
    const velocityFPS = velocity / 60;
    const reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;

    const relativeRoughness = roughness / hydraulicDiameter;
    let frictionFactor;
    if (reynoldsNumber > 2300) {
        const term1 = relativeRoughness / 3.7;
        const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
        frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
    } else {
        frictionFactor = 64 / reynoldsNumber;
    }

    const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
    const actualFrictionRate = frictionFactor * (100 / hydraulicDiameter) * velocityPressure;

    // Check if actual friction rate differs significantly from target
    const frictionDifference = Math.abs(actualFrictionRate - targetFrictionRate);
    const frictionPercentDiff = (frictionDifference / targetFrictionRate) * 100;

    if (shape === 'round') {
        return {
            diameter: diameter.toFixed(1),
            area: area.toFixed(3),
            velocity: velocity,
            targetFrictionRate: targetFrictionRate.toFixed(4),
            actualFrictionRate: actualFrictionRate.toFixed(4),
            frictionDifference: frictionPercentDiff.toFixed(1),
            shape: 'Round'
        };
    } else {
        return {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: area.toFixed(3),
            velocity: velocity,
            aspectRatio: (width / height).toFixed(2),
            targetFrictionRate: targetFrictionRate.toFixed(4),
            actualFrictionRate: actualFrictionRate.toFixed(4),
            frictionDifference: frictionPercentDiff.toFixed(1),
            shape: 'Rectangular'
        };
    }
}

function calculateSizeVelocity() {
    const airflow = parseFloat(document.getElementById('airflow').value);
    const velocity = parseFloat(document.getElementById('velocity').value);
    const heightRestriction = parseFloat(document.getElementById('height-restriction')?.value);
    const shape = document.getElementById('original-shape').value;
    
    if (!airflow || !velocity) {
        throw new Error('Please fill in all required fields');
    }
    
    const requiredArea = airflow / velocity;
    
    let width, height, diameter;
    
    if (shape === 'round') {
        diameter = Math.sqrt(4 * requiredArea / Math.PI) * 12;
        return {
            diameter: diameter.toFixed(1),
            area: requiredArea.toFixed(3),
            velocity: velocity,
            shape: 'Round'
        };
    } else {
        if (heightRestriction) {
            height = heightRestriction;
            width = (requiredArea * 144) / height;
        } else {
            const side = Math.sqrt(requiredArea * 144);
            width = side;
            height = side;
        }
        
        return {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: requiredArea.toFixed(3),
            velocity: velocity,
            aspectRatio: (width / height).toFixed(2),
            shape: 'Rectangular'
        };
    }
}

function calculateSizeFriction() {
    const airflow = parseFloat(document.getElementById('airflow').value);
    const frictionRate = parseFloat(document.getElementById('friction-rate').value);
    const heightRestriction = parseFloat(document.getElementById('height-restriction')?.value);
    const roughness = parseFloat(document.getElementById('duct-roughness').value);
    const shape = document.getElementById('original-shape').value;
    const density = getEffectiveDensity();
    
    if (!airflow || !frictionRate) {
        throw new Error('Please fill in all required fields');
    }
    
    // frictionRate is ALREADY in in.wg per 100 ft (standard HVAC units)
    const frictionRateInWG = frictionRate;
    
    // Helper function using ASHRAE friction chart formula
    function getFrictionForDiameter(d_inches) {
        const diameter_ft = d_inches / 12;
        const area = Math.PI * Math.pow(diameter_ft, 2) / 4; // ft²
        const velocity = airflow / area; // fpm
        const velocity_fps = velocity / 60; // fps
        
        // Reynolds number
        const dynamicViscosity = 1.22e-5; // lb/(ft·s) for air at 70°F
        const reynoldsNumber = (density * velocity_fps * diameter_ft) / dynamicViscosity;
        
        // Friction factor - Swamee-Jain approximation
        const relativeRoughness = roughness / diameter_ft;
        let frictionFactor;
        
        if (reynoldsNumber > 2300) {
            const term1 = relativeRoughness / 3.7;
            const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
            frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        } else {
            frictionFactor = 64 / reynoldsNumber;
        }
        
        // ASHRAE formula: ΔP = f * (L/D_feet) * (V/4005)²
        // where V is in fpm, D is in feet, L is in feet
        const velocityPressure = Math.pow(velocity / 4005, 2); // in.wg
        const frictionLoss_inwg = frictionFactor * (100 / diameter_ft) * velocityPressure;
        
        return frictionLoss_inwg;
    }
    
    // Helper function for rectangular ducts
    function getFrictionForRect(w_inches, h_inches) {
        const area = (w_inches * h_inches) / 144; // ft²
        const velocity = airflow / area; // fpm
        const perimeter = 2 * (w_inches + h_inches) / 12; // ft
        const hydraulicDiameter_ft = 4 * area / perimeter; // ft
        const velocity_fps = velocity / 60; // fps
        
        const dynamicViscosity = 1.22e-5; // lb/(ft·s) for air at 70°F
        const reynoldsNumber = (density * velocity_fps * hydraulicDiameter_ft) / dynamicViscosity;
        
        const relativeRoughness = roughness / hydraulicDiameter_ft;
        let frictionFactor;
        
        if (reynoldsNumber > 2300) {
            const term1 = relativeRoughness / 3.7;
            const term2 = 5.74 / Math.pow(reynoldsNumber, 0.9);
            frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        } else {
            frictionFactor = 64 / reynoldsNumber;
        }
        
        const velocityPressure = Math.pow(velocity / 4005, 2);
        const frictionLoss_inwg = frictionFactor * (100 / hydraulicDiameter_ft) * velocityPressure;

        return frictionLoss_inwg;
    }
    
    let diameter, width, height;
    
    if (shape === 'round') {
        // Binary search for correct round duct diameter
        let minD = 3;
        let maxD = 120;
        
        for (let i = 0; i < 100; i++) {
            diameter = (minD + maxD) / 2;
            const calculatedFriction = getFrictionForDiameter(diameter);
            
            const error = Math.abs(calculatedFriction - frictionRateInWG);
            
            if (error < 0.00001) {
                break;
            }
            
            if (calculatedFriction > frictionRateInWG) {
                // Friction too high, need larger diameter
                minD = diameter;
            } else {
                // Friction too low, need smaller diameter
                maxD = diameter;
            }
        }
        
        // Calculate final properties
        const area = Math.PI * Math.pow(diameter / 12, 2) / 4;
        const velocity = airflow / area;
        
        // Calculate equivalent rectangular sizes
        const rectEquivs = calculateRectEquivalents(diameter, airflow);
        
        return {
            diameter: diameter.toFixed(1),
            area: area.toFixed(3),
            velocity: velocity.toFixed(0),
            shape: 'Round',
            frictionRate: frictionRate.toFixed(3),
            ...rectEquivs
        };
        
    } else {
        // Rectangular duct
        if (heightRestriction) {
            height = heightRestriction;
            let minW = 4;
            let maxW = 120;
            
            for (let i = 0; i < 100; i++) {
                width = (minW + maxW) / 2;
                const calculatedFriction = getFrictionForRect(width, height);
                
                if (Math.abs(calculatedFriction - frictionRateInWG) < 0.00001) {
                    break;
                }
                
                if (calculatedFriction > frictionRateInWG) {
                    minW = width;
                } else {
                    maxW = width;
                }
            }
        } else {
            // Square duct
            let minS = 4;
            let maxS = 120;
            
            for (let i = 0; i < 100; i++) {
                width = (minS + maxS) / 2;
                height = width;
                const calculatedFriction = getFrictionForRect(width, height);
                
                if (Math.abs(calculatedFriction - frictionRateInWG) < 0.00001) {
                    break;
                }
                
                if (calculatedFriction > frictionRateInWG) {
                    minS = width;
                } else {
                    maxS = width;
                }
            }
        }

        // Calculate equivalent round and oval sizes for rectangular duct
        const roundOvalEquivs = calculateRoundOvalFromRect(width, height, airflow);

        return {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: ((width * height) / 144).toFixed(3),
            velocity: (airflow / ((width * height) / 144)).toFixed(0),
            aspectRatio: (width / height).toFixed(2),
            shape: 'Rectangular',
            frictionRate: frictionRate.toFixed(3),
            ...roundOvalEquivs
        };
    }
}

// Helper function to calculate round and oval equivalents from rectangular duct
function calculateRoundOvalFromRect(width, height, airflow) {
    // Calculate equivalent round diameter using ASHRAE formula
    // De = 1.3 × [(a × b)^0.625] / [(a + b)^0.25]
    const roundDiameter = 1.3 * Math.pow(width * height, 0.625) / Math.pow(width + height, 0.25);
    const roundArea = Math.PI * Math.pow(roundDiameter / 12, 2) / 4;
    const roundVelocity = (airflow / roundArea).toFixed(0);

    // Calculate equivalent oval sizes using ASHRAE/SMACNA formula
    // De = 1.55 × [(a × b)^0.625] / [(a + b)^0.25]
    const ratio_2_1 = 2;
    const ratio_3_1 = 3;

    const oval_2_1_minor = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.55 * Math.pow(ratio_2_1, 0.625));
    const oval_2_1_major = ratio_2_1 * oval_2_1_minor;
    const oval_2_1_area = Math.PI * (oval_2_1_major / 2 / 12) * (oval_2_1_minor / 2 / 12);
    const oval_2_1_velocity = (airflow / oval_2_1_area).toFixed(0);

    const oval_3_1_minor = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.55 * Math.pow(ratio_3_1, 0.625));
    const oval_3_1_major = ratio_3_1 * oval_3_1_minor;
    const oval_3_1_area = Math.PI * (oval_3_1_major / 2 / 12) * (oval_3_1_minor / 2 / 12);
    const oval_3_1_velocity = (airflow / oval_3_1_area).toFixed(0);

    return {
        roundDiameter: roundDiameter.toFixed(1),
        roundVelocity: roundVelocity,
        oval_2_1_major: oval_2_1_major.toFixed(1),
        oval_2_1_minor: oval_2_1_minor.toFixed(1),
        oval_2_1_velocity: oval_2_1_velocity,
        oval_3_1_major: oval_3_1_major.toFixed(1),
        oval_3_1_minor: oval_3_1_minor.toFixed(1),
        oval_3_1_velocity: oval_3_1_velocity
    };
}

// Helper function to calculate equivalent rectangular and oval sizes
function calculateRectEquivalents(roundDiameter, airflow) {
    const roundArea = Math.PI * Math.pow(roundDiameter / 12, 2) / 4;

    // Calculate rectangular dimensions using ASHRAE equivalent diameter formula
    // De = 1.3 × [(a × b)^0.625] / [(a + b)^0.25]
    // Where a = width, b = height
    // For aspect ratio R where a = R × b:
    // De = 1.3 × [(R × b²)^0.625] / [((R + 1) × b)^0.25]
    // Solving for b: b = De × (R + 1)^0.25 / (1.3 × R^0.625)

    // 1:1 ratio (square)
    const ratio_1_1 = 1;
    const rect_1_1_height = roundDiameter * Math.pow(ratio_1_1 + 1, 0.25) / (1.3 * Math.pow(ratio_1_1, 0.625));
    const rect_1_1_width = ratio_1_1 * rect_1_1_height;
    const rect_1_1_area = (rect_1_1_width * rect_1_1_height) / 144; // Convert to sq ft

    // 2:1 ratio
    const ratio_2_1 = 2;
    const rect_2_1_height = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.3 * Math.pow(ratio_2_1, 0.625));
    const rect_2_1_width = ratio_2_1 * rect_2_1_height;
    const rect_2_1_area = (rect_2_1_width * rect_2_1_height) / 144; // Convert to sq ft

    // 3:1 ratio
    const ratio_3_1 = 3;
    const rect_3_1_height = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.3 * Math.pow(ratio_3_1, 0.625));
    const rect_3_1_width = ratio_3_1 * rect_3_1_height;
    const rect_3_1_area = (rect_3_1_width * rect_3_1_height) / 144; // Convert to sq ft

    // Calculate velocities based on actual areas
    const rect_1_1_velocity = (airflow / rect_1_1_area).toFixed(0);
    const rect_2_1_velocity = (airflow / rect_2_1_area).toFixed(0);
    const rect_3_1_velocity = (airflow / rect_3_1_area).toFixed(0);

    // Calculate flat oval dimensions using ASHRAE/SMACNA equivalent diameter formula
    // De = 1.55 × [(a × b)^0.625] / [(a + b)^0.25]
    // Where a = major axis, b = minor axis
    // Solving for dimensions that give equivalent diameter = roundDiameter

    // For 2:1 aspect ratio (a = 2b)
    // De = 1.55 × [(2b²)^0.625] / [(3b)^0.25]
    // Solving for b: b = De × (3)^0.25 / (1.55 × 2^0.625)
    const oval_2_1_minor = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.55 * Math.pow(ratio_2_1, 0.625));
    const oval_2_1_major = ratio_2_1 * oval_2_1_minor;

    // For 3:1 aspect ratio (a = 3b)
    // De = 1.55 × [(3b²)^0.625] / [(4b)^0.25]
    // Solving for b: b = De × (4)^0.25 / (1.55 × 3^0.625)
    const oval_3_1_minor = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.55 * Math.pow(ratio_3_1, 0.625));
    const oval_3_1_major = ratio_3_1 * oval_3_1_minor;

    // Calculate oval areas (approximation using ellipse formula)
    const oval_2_1_area = Math.PI * (oval_2_1_major / 2 / 12) * (oval_2_1_minor / 2 / 12);
    const oval_3_1_area = Math.PI * (oval_3_1_major / 2 / 12) * (oval_3_1_minor / 2 / 12);

    // Calculate velocities for oval ducts
    const oval_2_1_velocity = (airflow / oval_2_1_area).toFixed(0);
    const oval_3_1_velocity = (airflow / oval_3_1_area).toFixed(0);

    return {
        rect_1_1_width: rect_1_1_width.toFixed(1),
        rect_1_1_height: rect_1_1_height.toFixed(1),
        rect_1_1_velocity: rect_1_1_velocity,
        rect_2_1_width: rect_2_1_width.toFixed(1),
        rect_2_1_height: rect_2_1_height.toFixed(1),
        rect_2_1_velocity: rect_2_1_velocity,
        rect_3_1_width: rect_3_1_width.toFixed(1),
        rect_3_1_height: rect_3_1_height.toFixed(1),
        rect_3_1_velocity: rect_3_1_velocity,
        oval_2_1_major: oval_2_1_major.toFixed(1),
        oval_2_1_minor: oval_2_1_minor.toFixed(1),
        oval_2_1_velocity: oval_2_1_velocity,
        oval_3_1_major: oval_3_1_major.toFixed(1),
        oval_3_1_minor: oval_3_1_minor.toFixed(1),
        oval_3_1_velocity: oval_3_1_velocity
    };
}

function convertDuctShape() {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const airflow = parseFloat(document.getElementById('airflow')?.value) || null;
    const originalShape = document.getElementById('original-shape').value;

    if (!width || (originalShape !== 'round' && !height)) {
        throw new Error('Please fill in all required fields');
    }

    let originalAreaSqFt, originalAreaSqIn;

    if (originalShape === 'round') {
        // Round duct: width is the diameter in inches
        const diameter = width;
        originalAreaSqIn = Math.PI * Math.pow(diameter, 2) / 4;
        originalAreaSqFt = originalAreaSqIn / 144;

        // Calculate velocity if airflow provided
        const velocity = airflow ? (airflow / originalAreaSqFt).toFixed(0) : null;

        // Calculate equivalent rectangular (square) dimensions
        // For equal area: side² = π × (d/2)²
        const squareSide = Math.sqrt(originalAreaSqIn);

        // Calculate equivalent rectangular with ASHRAE equivalent diameter formula
        // For 2:1 aspect ratio
        const rect_2_1_height = diameter * Math.pow(3, 0.25) / (1.3 * Math.pow(2, 0.625));
        const rect_2_1_width = 2 * rect_2_1_height;

        // Calculate equivalent oval using ASHRAE formula
        // For 2:1 aspect ratio oval
        const oval_2_1_minor = diameter * Math.pow(3, 0.25) / (1.55 * Math.pow(2, 0.625));
        const oval_2_1_major = 2 * oval_2_1_minor;

        return {
            originalDiameter: diameter.toFixed(1),
            originalAreaSqIn: originalAreaSqIn.toFixed(2),
            originalAreaSqFt: originalAreaSqFt.toFixed(4),
            velocity: velocity,
            equivalentSquareSide: squareSide.toFixed(1),
            equivalentRect_2_1: `${rect_2_1_width.toFixed(1)}" × ${rect_2_1_height.toFixed(1)}"`,
            equivalentOval_2_1: `${oval_2_1_major.toFixed(1)}" × ${oval_2_1_minor.toFixed(1)}"`,
            conversion: 'Round to Equivalent Shapes'
        };

    } else if (originalShape === 'oval') {
        // Oval duct: width is major axis, height is minor axis in inches
        const majorAxis = width;
        const minorAxis = height;
        originalAreaSqIn = Math.PI * (majorAxis / 2) * (minorAxis / 2);
        originalAreaSqFt = originalAreaSqIn / 144;

        // Calculate velocity if airflow provided
        const velocity = airflow ? (airflow / originalAreaSqFt).toFixed(0) : null;

        // Calculate equivalent round diameter using ASHRAE formula
        // De = 1.55 × [(a × b)^0.625] / [(a + b)^0.25]
        const equivalentDiameter = 1.55 * Math.pow(majorAxis * minorAxis, 0.625) / Math.pow(majorAxis + minorAxis, 0.25);

        // Calculate equivalent rectangular using ASHRAE formula
        // De = 1.3 × [(a × b)^0.625] / [(a + b)^0.25]
        // Solving for rectangular with same equivalent diameter
        const rect_side = equivalentDiameter * Math.pow(2, 0.25) / (1.3 * Math.pow(1, 0.625));

        return {
            originalMajorAxis: majorAxis.toFixed(1),
            originalMinorAxis: minorAxis.toFixed(1),
            originalAreaSqIn: originalAreaSqIn.toFixed(2),
            originalAreaSqFt: originalAreaSqFt.toFixed(4),
            velocity: velocity,
            equivalentDiameter: equivalentDiameter.toFixed(1),
            equivalentSquareSide: rect_side.toFixed(1),
            conversion: 'Oval to Equivalent Shapes'
        };

    } else {
        // Rectangular duct: width and height in inches
        originalAreaSqIn = width * height;
        originalAreaSqFt = originalAreaSqIn / 144;

        // Calculate velocity if airflow provided
        const velocity = airflow ? (airflow / originalAreaSqFt).toFixed(0) : null;

        // Calculate equivalent round diameter using ASHRAE formula
        // De = 1.3 × [(a × b)^0.625] / [(a + b)^0.25]
        const equivalentDiameter = 1.3 * Math.pow(width * height, 0.625) / Math.pow(width + height, 0.25);

        // Calculate equivalent oval using ASHRAE formula
        // For same aspect ratio as original rectangular
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        const oval_minor = equivalentDiameter * Math.pow(aspectRatio + 1, 0.25) / (1.55 * Math.pow(aspectRatio, 0.625));
        const oval_major = aspectRatio * oval_minor;

        return {
            originalWidth: width.toFixed(1),
            originalHeight: height.toFixed(1),
            originalAreaSqIn: originalAreaSqIn.toFixed(2),
            originalAreaSqFt: originalAreaSqFt.toFixed(4),
            velocity: velocity,
            aspectRatio: (width / height).toFixed(2),
            equivalentDiameter: equivalentDiameter.toFixed(1),
            equivalentOval: `${oval_major.toFixed(1)}" × ${oval_minor.toFixed(1)}"`,
            conversion: 'Rectangular to Equivalent Shapes'
        };
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;

    let html = '<div class="results-container">';

    // Check if this is a conversion result
    if (results.conversion) {
        html += `<h4 style="color: #2c3e50; margin-bottom: 1rem;">${results.conversion}</h4>`;

        // Display original dimensions
        if (results.originalDiameter) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalDiameter')}</span>
                    <span class="result-value">${results.originalDiameter}"</span>
                </div>
            `;
        }
        if (results.originalWidth) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalWidth')}</span>
                    <span class="result-value">${results.originalWidth}"</span>
                </div>
            `;
        }
        if (results.originalHeight) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalHeight')}</span>
                    <span class="result-value">${results.originalHeight}"</span>
                </div>
            `;
        }
        if (results.originalMajorAxis) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalMajorAxis')}</span>
                    <span class="result-value">${results.originalMajorAxis}"</span>
                </div>
            `;
        }
        if (results.originalMinorAxis) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalMinorAxis')}</span>
                    <span class="result-value">${results.originalMinorAxis}"</span>
                </div>
            `;
        }
        if (results.originalAreaSqIn) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalAreaSqIn')}</span>
                    <span class="result-value">${results.originalAreaSqIn}</span>
                </div>
            `;
        }
        if (results.originalAreaSqFt) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('originalAreaSqFt')}</span>
                    <span class="result-value">${results.originalAreaSqFt}</span>
                </div>
            `;
        }
        if (results.aspectRatio) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('aspectRatio')}</span>
                    <span class="result-value">${results.aspectRatio}</span>
                </div>
            `;
        }
        if (results.velocity) {
            html += `
                <div class="result-item">
                    <span class="result-label">${formatLabel('velocity')}</span>
                    <span class="result-value">${results.velocity} fpm</span>
                </div>
            `;
        }

        // Display equivalent shapes
        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Equivalent Shapes</h4>';

        if (results.equivalentDiameter) {
            html += `
                <div class="result-item" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                    <span class="result-label">${formatLabel('equivalentDiameter')}</span>
                    <span class="result-value">${results.equivalentDiameter}"</span>
                </div>
            `;
        }
        if (results.equivalentSquareSide) {
            html += `
                <div class="result-item" style="background: #fff3cd; border-left: 4px solid #f39c12;">
                    <span class="result-label">${formatLabel('equivalentSquareSide')}</span>
                    <span class="result-value">${results.equivalentSquareSide}" × ${results.equivalentSquareSide}"</span>
                </div>
            `;
        }
        if (results.equivalentRect_2_1) {
            html += `
                <div class="result-item" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                    <span class="result-label">${formatLabel('equivalentRect_2_1')}</span>
                    <span class="result-value">${results.equivalentRect_2_1}</span>
                </div>
            `;
        }
        if (results.equivalentOval_2_1) {
            html += `
                <div class="result-item" style="background: #f3e5f5; border-left: 4px solid #9c27b0;">
                    <span class="result-label">${formatLabel('equivalentOval_2_1')}</span>
                    <span class="result-value">${results.equivalentOval_2_1}</span>
                </div>
            `;
        }
        if (results.equivalentOval) {
            html += `
                <div class="result-item" style="background: #f3e5f5; border-left: 4px solid #9c27b0;">
                    <span class="result-label">${formatLabel('equivalentOval')}</span>
                    <span class="result-value">${results.equivalentOval}</span>
                </div>
            `;
        }

        html += '</div>';
        resultsContainer.innerHTML = html;
        return;
    }

    // Main results section
    html += '<h4 style="color: #2c3e50; margin-bottom: 1rem;">Primary Results</h4>';

    // Display airflow first if present (for airflow-rate calculation)
    if (results.airflow !== undefined) {
        html += `
            <div class="result-item" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <span class="result-label">${formatLabel('airflow')}</span>
                <span class="result-value">${results.airflow}</span>
            </div>
        `;
    }

    // Display primary duct size
    if (results.shape === 'Round' && results.diameter) {
        html += `
            <div class="result-item">
                <span class="result-label">Round Duct Diameter</span>
                <span class="result-value">${results.diameter}"</span>
            </div>
        `;
    } else if (results.width && results.height) {
        html += `
            <div class="result-item">
                <span class="result-label">Width</span>
                <span class="result-value">${results.width}"</span>
            </div>
            <div class="result-item">
                <span class="result-label">Height</span>
                <span class="result-value">${results.height}"</span>
            </div>
        `;
    }

    // Display other primary results
    const primaryKeys = ['area', 'velocity', 'frictionRate', 'frictionLoss', 'aspectRatio', 'reynoldsNumber', 'frictionFactor', 'velocityPressure', 'hydraulicDiameter'];
    for (const key of primaryKeys) {
        if (results[key] !== undefined) {
            const label = formatLabel(key);
            html += `
                <div class="result-item">
                    <span class="result-label">${label}</span>
                    <span class="result-value">${results[key]}</span>
                </div>
            `;
        }
    }

    // Display friction rate comparison if present (for size-velocity-friction calculation)
    if (results.targetFrictionRate !== undefined && results.actualFrictionRate !== undefined) {
        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Friction Rate Analysis</h4>';

        html += `
            <div class="result-item">
                <span class="result-label">${formatLabel('targetFrictionRate')}</span>
                <span class="result-value">${results.targetFrictionRate}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${formatLabel('actualFrictionRate')}</span>
                <span class="result-value">${results.actualFrictionRate}</span>
            </div>
        `;

        const diff = parseFloat(results.frictionDifference);
        const diffStyle = diff > 10 ? 'background: #fadbd8; border-left: 4px solid #e74c3c;' :
                         diff > 5 ? 'background: #fff3cd; border-left: 4px solid #f39c12;' :
                         'background: #e8f5e9; border-left: 4px solid #27ae60;';
        html += `
            <div class="result-item" style="${diffStyle}">
                <span class="result-label">${formatLabel('frictionDifference')}</span>
                <span class="result-value">${results.frictionDifference}%</span>
            </div>
        `;

        if (diff > 10) {
            html += `
                <div class="warning-box" style="margin-top: 1rem;">
                    <strong>Note:</strong> The actual friction rate differs significantly from the target.
                    With the given airflow and velocity, this duct size cannot achieve the target friction rate.
                    Consider adjusting the velocity or accepting a different friction rate.
                </div>
            `;
        }
    }

    // If round duct, show equivalent rectangular and oval sizes
    if (results.shape === 'Round' && results.rect_1_1_width) {
        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Equivalent Rectangular Ducts</h4>';

        // 1:1 Ratio (Square)
        html += `
            <div class="result-item" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <span class="result-label">1:1 Ratio (Square)</span>
                <span class="result-value">${results.rect_1_1_width}" × ${results.rect_1_1_height}" @ ${results.rect_1_1_velocity} fpm</span>
            </div>
        `;

        // 2:1 Ratio
        html += `
            <div class="result-item" style="background: #fff3cd; border-left: 4px solid #f39c12;">
                <span class="result-label">2:1 Ratio</span>
                <span class="result-value">${results.rect_2_1_width}" × ${results.rect_2_1_height}" @ ${results.rect_2_1_velocity} fpm</span>
            </div>
        `;

        // 3:1 Ratio
        html += `
            <div class="result-item" style="background: #fadbd8; border-left: 4px solid #e74c3c;">
                <span class="result-label">3:1 Ratio</span>
                <span class="result-value">${results.rect_3_1_width}" × ${results.rect_3_1_height}" @ ${results.rect_3_1_velocity} fpm</span>
            </div>
        `;

        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Equivalent Flat Oval Ducts</h4>';

        // 2:1 Oval
        html += `
            <div class="result-item" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                <span class="result-label">Flat Oval (2:1)</span>
                <span class="result-value">${results.oval_2_1_major}" × ${results.oval_2_1_minor}" @ ${results.oval_2_1_velocity} fpm</span>
            </div>
        `;

        // 3:1 Oval
        html += `
            <div class="result-item" style="background: #f3e5f5; border-left: 4px solid #9c27b0;">
                <span class="result-label">Flat Oval (3:1)</span>
                <span class="result-value">${results.oval_3_1_major}" × ${results.oval_3_1_minor}" @ ${results.oval_3_1_velocity} fpm</span>
            </div>
        `;
    }

    // If rectangular duct, show equivalent round and oval sizes
    if (results.shape === 'Rectangular' && results.roundDiameter) {
        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Equivalent Round Duct</h4>';

        html += `
            <div class="result-item" style="background: #e8f5e9; border-left: 4px solid #27ae60;">
                <span class="result-label">Round Duct</span>
                <span class="result-value">${results.roundDiameter}" @ ${results.roundVelocity} fpm</span>
            </div>
        `;

        html += '<h4 style="color: #2c3e50; margin-top: 2rem; margin-bottom: 1rem;">Equivalent Flat Oval Ducts</h4>';

        // 2:1 Oval
        html += `
            <div class="result-item" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                <span class="result-label">Flat Oval (2:1)</span>
                <span class="result-value">${results.oval_2_1_major}" × ${results.oval_2_1_minor}" @ ${results.oval_2_1_velocity} fpm</span>
            </div>
        `;

        // 3:1 Oval
        html += `
            <div class="result-item" style="background: #f3e5f5; border-left: 4px solid #9c27b0;">
                <span class="result-label">Flat Oval (3:1)</span>
                <span class="result-value">${results.oval_3_1_major}" × ${results.oval_3_1_minor}" @ ${results.oval_3_1_velocity} fpm</span>
            </div>
        `;
    }

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function formatLabel(key) {
    const isMetric = currentUnitSystem === 'metric';
    const labels = {
        hydraulicDiameter: isMetric ? 'Hydraulic Diameter (mm)' : 'Hydraulic Diameter (in)',
        area: isMetric ? 'Cross-sectional Area (m²)' : 'Cross-sectional Area (ft²)',
        velocity: isMetric ? 'Velocity (m/s)' : 'Velocity (fpm)',
        reynoldsNumber: 'Reynolds Number',
        frictionFactor: 'Friction Factor',
        frictionRate: isMetric ? 'Friction Rate (Pa/m)' : 'Friction Rate (in.wg / 100 ft)',
        frictionLoss: isMetric ? 'Friction Loss (Pa/m)' : 'Friction Loss (in.wg / 100 ft)',
        velocityPressure: isMetric ? 'Velocity Pressure (Pa)' : 'Velocity Pressure (in.wg)',
        airflow: isMetric ? 'Airflow (L/s)' : 'Airflow (CFM)',
        diameter: isMetric ? 'Diameter (mm)' : 'Diameter (in)',
        width: isMetric ? 'Width (mm)' : 'Width (in)',
        height: isMetric ? 'Height (mm)' : 'Height (in)',
        aspectRatio: 'Aspect Ratio',
        shape: 'Duct Shape',
        iterations: 'Iterations',
        conversion: 'Conversion Type',
        originalDiameter: isMetric ? 'Original Diameter (mm)' : 'Original Diameter (in)',
        originalWidth: isMetric ? 'Original Width (mm)' : 'Original Width (in)',
        originalHeight: isMetric ? 'Original Height (mm)' : 'Original Height (in)',
        originalMajorAxis: isMetric ? 'Original Major Axis (mm)' : 'Original Major Axis (in)',
        originalMinorAxis: isMetric ? 'Original Minor Axis (mm)' : 'Original Minor Axis (in)',
        originalArea: isMetric ? 'Original Area (m²)' : 'Original Area (ft²)',
        originalAreaSqIn: 'Original Area (sq in)',
        originalAreaSqFt: 'Original Area (sq ft)',
        equivalentDiameter: isMetric ? 'Equivalent Diameter (mm)' : 'Equivalent Round Diameter (in)',
        equivalentWidth: isMetric ? 'Equivalent Width (mm)' : 'Equivalent Width (in)',
        equivalentHeight: isMetric ? 'Equivalent Height (mm)' : 'Equivalent Height (in)',
        equivalentArea: isMetric ? 'Equivalent Area (m²)' : 'Equivalent Area (ft²)',
        equivalentSquareSide: 'Equivalent Square Side (in)',
        equivalentRect_2_1: 'Equivalent Rectangular (2:1)',
        equivalentOval_2_1: 'Equivalent Oval (2:1)',
        equivalentOval: 'Equivalent Oval',
        designVelocity: isMetric ? 'Design Velocity (m/s)' : 'Design Velocity (fpm)',
        targetFrictionRate: isMetric ? 'Target Friction Rate (Pa/m)' : 'Target Friction Rate (in.wg / 100 ft)',
        actualFrictionRate: isMetric ? 'Actual Friction Rate (Pa/m)' : 'Actual Friction Rate (in.wg / 100 ft)',
        frictionDifference: 'Friction Rate Difference (%)'
    };
    return labels[key] || key;
}

function clearInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        if (!input.readOnly) {
            input.value = '';
        }
    });
    
    const calcTypeSelect = document.getElementById('calculation-type');
    const stdYesRadio = document.getElementById('std-yes');
    const imperialRadio = document.getElementById('imperial');
    const ductMaterialSelect = document.getElementById('duct-material');
    const originalShapeSelect = document.getElementById('original-shape');
    const feetRadio = document.getElementById('feet');
    
    if (calcTypeSelect) calcTypeSelect.value = 'friction-loss';
    if (stdYesRadio) stdYesRadio.checked = true;
    if (imperialRadio) imperialRadio.checked = true;
    currentUnitSystem = 'imperial';
    if (ductMaterialSelect) ductMaterialSelect.selectedIndex = 5;
    if (originalShapeSelect) originalShapeSelect.value = 'rectangular';
    if (feetRadio) feetRadio.checked = true;
    
    updateInputFields();
    toggleAdvancedConditions();
    
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="info-box">
                <h4>Ready to Calculate</h4>
                <p>Enter your duct parameters and click "Calculate Results" to see the HVAC calculations.</p>
            </div>
        `;
    }
}

// Self-initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeDuctulator();
});
