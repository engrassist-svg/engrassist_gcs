/**
 * ============================================================================
 * EngrAssist HVAC Load Calculation Tool
 * ============================================================================
 *
 * Copyright (c) 2024-2025 EngrAssist
 * All Rights Reserved
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This source code is the proprietary and confidential information of
 * EngrAssist. Unauthorized copying, modification, distribution, or use
 * of this software, via any medium, is strictly prohibited without the
 * express written permission of EngrAssist.
 *
 * The algorithms, methods, and calculations contained herein are trade
 * secrets and proprietary intellectual property. Reverse engineering,
 * decompilation, or disassembly of the compiled code is prohibited.
 *
 * This software is licensed, not sold. Use is subject to license terms.
 *
 * For licensing inquiries, contact: info@engrassist.com
 *
 * ============================================================================
 */

// ====================================
// HVAC LOAD CALCULATION
// Based on Carrier and ACCA Manual J Methods
// ====================================

// Disclaimer Modal Management
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has previously accepted disclaimer
    const disclaimerAccepted = sessionStorage.getItem('hvacDisclaimerAccepted');

    if (disclaimerAccepted === 'true') {
        // Show main content
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('disclaimerModal').style.display = 'none';
    } else {
        // Show disclaimer modal
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('disclaimerModal').style.display = 'block';
    }

    // Enable accept button when checkbox is checked
    const checkbox = document.getElementById('disclaimerAgreed');
    const acceptButton = document.getElementById('acceptButton');

    if (checkbox && acceptButton) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                acceptButton.disabled = false;
                acceptButton.style.backgroundColor = '#27ae60';
                acceptButton.style.cursor = 'pointer';
            } else {
                acceptButton.disabled = true;
                acceptButton.style.backgroundColor = '#ccc';
                acceptButton.style.cursor = 'not-allowed';
            }
        });
    }

    // Auto-calculate room dimensions on input
    // Add event listeners for dimension inputs
    const lengthInput = document.getElementById('roomLength');
    const widthInput = document.getElementById('roomWidth');
    const heightInput = document.getElementById('ceilingHeight');

    if (lengthInput && widthInput && heightInput) {
        lengthInput.addEventListener('input', updateCalculatedDimensions);
        widthInput.addEventListener('input', updateCalculatedDimensions);
        heightInput.addEventListener('input', updateCalculatedDimensions);
    }

    // Set default date
    const dateInput = document.getElementById('calculationDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Wire up the calculate button
    const calculateButton = document.querySelector('button.btn[onclick*="calculateLoads"]');
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateLoads();
        });
    }
});

// Accept disclaimer and show main content
function acceptDisclaimer() {
    sessionStorage.setItem('hvacDisclaimerAccepted', 'true');
    document.getElementById('disclaimerModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

function updateCalculatedDimensions() {
    const length = parseFloat(document.getElementById('roomLength').value) || 0;
    const width = parseFloat(document.getElementById('roomWidth').value) || 0;
    const height = parseFloat(document.getElementById('ceilingHeight').value) || 0;

    // Calculate volume
    const volume = length * width * height;
    document.getElementById('roomVolume').value = volume.toFixed(1);

    // Calculate ceiling area
    const ceilingArea = length * width;
    document.getElementById('ceilingArea').value = ceilingArea.toFixed(1);

    // Calculate floor area
    document.getElementById('floorArea').value = ceilingArea.toFixed(1);
}

// U-Value Database (BTU/hr·ft²·°F)
const uValues = {
    // Windows
    windows: {
        single: 1.10,
        double: 0.50,
        doubleLowE: 0.30,
        triple: 0.20
    },

    // Walls
    walls: {
        frame_uninsulated: 0.25,
        frame_r11: 0.10,
        frame_r13: 0.08,
        frame_r19: 0.06,
        frame_r21: 0.055,
        masonry_uninsulated: 0.40,
        masonry_r11: 0.12
    },

    // Ceiling/Roof
    ceiling: {
        none: 0.50,
        r11: 0.09,
        r19: 0.053,
        r30: 0.033,
        r38: 0.026,
        r49: 0.020
    },

    // Floor
    floor: {
        none: 0.40,
        r11: 0.09,
        r19: 0.053,
        r30: 0.033
    }
};

// Solar Heat Gain Factor (SHGF) - BTU/hr·ft² for peak conditions
// Values for 40°N latitude, summer design day
const solarHeatGain = {
    north: 40,
    east: 200,
    south: 120,
    west: 220
};

// Shading Coefficient (relative to single pane clear glass)
const shadingCoefficients = {
    // Glass type
    glass: {
        single: 1.00,
        double: 0.88,
        doubleLowE: 0.71,
        triple: 0.67
    },

    // External shading multiplier
    external: {
        none: 1.0,
        partial: 0.65,
        full: 0.25
    }
};

// Color factors for walls and roofs (multiplier for solar gain)
const colorFactors = {
    light: 0.65,
    medium: 0.83,
    dark: 1.0
};

// People heat gain (BTU/hr per person)
// Values per ASHRAE Handbook Fundamentals, Chapter 18, Table 1
const peopleHeatGain = {
    seated: { sensible: 250, latent: 200 },     // Seated, very light work (450 total)
    standing: { sensible: 250, latent: 250 },   // Standing, light work/slow walking (500 total)
    moderate: { sensible: 295, latent: 355 },   // Moderate activity/work (650 total)
    heavy: { sensible: 450, latent: 550 }       // Heavy work/exercise (1000 total)
};

// ====================================
// PSYCHROMETRIC HELPER FUNCTIONS
// ====================================

/**
 * Calculate saturation pressure (psia) from temperature (°F)
 * Using Antoine equation approximation
 */
function saturationPressure(tempF) {
    const tempC = (tempF - 32) / 1.8;
    // Antoine equation for water (valid 0-100°C)
    const logP = 8.07131 - (1730.63 / (tempC + 233.426));
    const pressureMMHg = Math.pow(10, logP);
    const pressurePSIA = pressureMMHg / 51.715; // Convert mmHg to psia
    return pressurePSIA;
}

/**
 * Calculate humidity ratio (lb water/lb dry air) from dry bulb temp and relative humidity
 * @param {number} dryBulbF - Dry bulb temperature (°F)
 * @param {number} relativeHumidity - Relative humidity (0-100%)
 * @returns {number} Humidity ratio (lb water/lb dry air)
 */
function humidityRatioFromRH(dryBulbF, relativeHumidity) {
    const atmosphericPressure = 14.696; // psia at sea level
    const psat = saturationPressure(dryBulbF);
    const RH = relativeHumidity / 100; // Convert to decimal
    const partialPressure = RH * psat;

    // W = 0.622 × (Pw / (P - Pw))
    const W = 0.622 * (partialPressure / (atmosphericPressure - partialPressure));
    return W;
}

/**
 * Estimate humidity ratio from dry bulb and wet bulb temperatures
 * Uses simplified psychrometric relationship
 * @param {number} dryBulbF - Dry bulb temperature (°F)
 * @param {number} wetBulbF - Wet bulb temperature (°F)
 * @returns {number} Humidity ratio (lb water/lb dry air)
 */
function humidityRatioFromWB(dryBulbF, wetBulbF) {
    const atmosphericPressure = 14.696; // psia at sea level

    // Get saturation pressure at wet bulb
    const psatWB = saturationPressure(wetBulbF);

    // Get saturation humidity ratio at wet bulb
    const WsatWB = 0.622 * (psatWB / (atmosphericPressure - psatWB));

    // Psychrometric constant approximation: W = Wsat(WB) - (1093 - 0.556*WB) * (DB - WB) / (hfg * 1000)
    // Simplified for typical HVAC conditions:
    // W ≈ Wsat(WB) - 0.00024 * (DB - WB)
    const W = WsatWB - 0.00024 * (dryBulbF - wetBulbF);

    // Ensure non-negative
    return Math.max(0, W);
}

// Main calculation function
function calculateLoads() {
    try {
        console.log('calculateLoads function called');

        // Validate inputs
        if (!validateInputs()) {
            console.log('Validation failed');
            return;
        }

        console.log('Validation passed, getting input values');
        // Get all input values
        const inputs = getInputValues();

        console.log('Calculating cooling loads');
        // Calculate cooling loads
        const coolingLoads = calculateCoolingLoads(inputs);

        console.log('Calculating heating loads');
        // Calculate heating loads
        const heatingLoads = calculateHeatingLoads(inputs);

        console.log('Displaying results');
        // Display results
        displayResults(coolingLoads, heatingLoads);

        // Show results section
        const loadResults = document.getElementById('loadResults');
        if (loadResults) {
            loadResults.style.display = 'block';
            console.log('Results section displayed');

            // Scroll to results
            loadResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error('loadResults element not found!');
        }
    } catch (error) {
        console.error('Error in calculateLoads:', error);
        alert('An error occurred during calculation: ' + error.message);
    }
}

// Make function globally accessible for onclick attribute
window.calculateLoads = calculateLoads;

function validateInputs() {
    const length = parseFloat(document.getElementById('roomLength').value);
    const width = parseFloat(document.getElementById('roomWidth').value);
    const height = parseFloat(document.getElementById('ceilingHeight').value);

    if (!length || length <= 0 || !width || width <= 0 || !height || height <= 0) {
        alert('Please enter valid room dimensions (length, width, and height)');
        return false;
    }

    return true;
}

function getInputValues() {
    return {
        // Design conditions
        outdoorSummerDB: parseFloat(document.getElementById('outdoorSummerDB').value),
        outdoorSummerWB: parseFloat(document.getElementById('outdoorSummerWB').value),
        indoorSummerDB: parseFloat(document.getElementById('indoorSummerDB').value),
        indoorSummerRH: parseFloat(document.getElementById('indoorSummerRH').value),
        outdoorWinterDB: parseFloat(document.getElementById('outdoorWinterDB').value),
        indoorWinterDB: parseFloat(document.getElementById('indoorWinterDB').value),

        // Room dimensions
        roomLength: parseFloat(document.getElementById('roomLength').value),
        roomWidth: parseFloat(document.getElementById('roomWidth').value),
        ceilingHeight: parseFloat(document.getElementById('ceilingHeight').value),
        roomVolume: parseFloat(document.getElementById('roomVolume').value),

        // Windows
        windowAreaNorth: parseFloat(document.getElementById('windowAreaNorth').value) || 0,
        windowAreaSouth: parseFloat(document.getElementById('windowAreaSouth').value) || 0,
        windowAreaEast: parseFloat(document.getElementById('windowAreaEast').value) || 0,
        windowAreaWest: parseFloat(document.getElementById('windowAreaWest').value) || 0,
        glassType: document.getElementById('glassType').value,
        shading: document.getElementById('shading').value,

        // Walls
        wallAreaNorth: parseFloat(document.getElementById('wallAreaNorth').value) || 0,
        wallAreaSouth: parseFloat(document.getElementById('wallAreaSouth').value) || 0,
        wallAreaEast: parseFloat(document.getElementById('wallAreaEast').value) || 0,
        wallAreaWest: parseFloat(document.getElementById('wallAreaWest').value) || 0,
        wallConstruction: document.getElementById('wallConstruction').value,
        wallColor: document.getElementById('wallColor').value,

        // Roof/Ceiling
        ceilingArea: parseFloat(document.getElementById('ceilingArea').value),
        roofType: document.getElementById('roofType').value,
        ceilingInsulation: document.getElementById('ceilingInsulation').value,
        roofColor: document.getElementById('roofColor').value,

        // Floor
        floorArea: parseFloat(document.getElementById('floorArea').value),
        floorType: document.getElementById('floorType').value,
        floorInsulation: document.getElementById('floorInsulation').value,

        // Internal loads
        numPeople: parseFloat(document.getElementById('numPeople').value) || 0,
        activityLevel: document.getElementById('activityLevel').value,
        lightingLoad: parseFloat(document.getElementById('lightingLoad').value) || 0,
        equipmentLoad: parseFloat(document.getElementById('equipmentLoad').value) || 0,

        // Infiltration & Ventilation
        airChangesPerHour: parseFloat(document.getElementById('airChangesPerHour').value) || 0,
        ventilationCFM: parseFloat(document.getElementById('ventilationCFM').value) || 0,

        // Safety factors
        coolingSafetyFactor: parseFloat(document.getElementById('coolingSafetyFactor').value) || 0,
        heatingSafetyFactor: parseFloat(document.getElementById('heatingSafetyFactor').value) || 0
    };
}

function calculateCoolingLoads(inputs) {
    const loads = {};

    // Temperature difference
    const deltaT = inputs.outdoorSummerDB - inputs.indoorSummerDB;

    // 1. WINDOWS - Solar + Transmission
    const windowU = uValues.windows[inputs.glassType];
    const glassSC = shadingCoefficients.glass[inputs.glassType];
    const shadingSC = shadingCoefficients.external[inputs.shading];
    const totalSC = glassSC * shadingSC;

    // Solar gain for each orientation
    const solarNorth = inputs.windowAreaNorth * solarHeatGain.north * totalSC;
    const solarSouth = inputs.windowAreaSouth * solarHeatGain.south * totalSC;
    const solarEast = inputs.windowAreaEast * solarHeatGain.east * totalSC;
    const solarWest = inputs.windowAreaWest * solarHeatGain.west * totalSC;

    // Transmission through windows
    const totalWindowArea = inputs.windowAreaNorth + inputs.windowAreaSouth +
                            inputs.windowAreaEast + inputs.windowAreaWest;
    const windowTransmission = windowU * totalWindowArea * deltaT;

    loads.windows = solarNorth + solarSouth + solarEast + solarWest + windowTransmission;

    // 2. WALLS - Transmission + Solar Effect
    const wallU = uValues.walls[inputs.wallConstruction];
    const wallColorFactor = colorFactors[inputs.wallColor];
    const totalWallArea = inputs.wallAreaNorth + inputs.wallAreaSouth +
                          inputs.wallAreaEast + inputs.wallAreaWest;

    // Base transmission
    const wallTransmission = wallU * totalWallArea * deltaT;

    // Solar effect on walls (add equivalent temperature increase based on color)
    const solarTempIncrease = wallColorFactor * 15; // Dark walls can be 15°F hotter
    const wallSolar = wallU * totalWallArea * solarTempIncrease;

    loads.walls = wallTransmission + wallSolar;

    // 3. ROOF/CEILING
    const ceilingU = uValues.ceiling[inputs.ceilingInsulation];
    let roofDeltaT = deltaT;

    // Adjust for roof type
    if (inputs.roofType === 'ceiling_unconditioned') {
        // Attic temperature can be much higher than outdoor
        const roofColorFactor = colorFactors[inputs.roofColor];
        const atticTempIncrease = roofColorFactor * 30; // Can be 30°F+ hotter in attic
        roofDeltaT = (inputs.outdoorSummerDB + atticTempIncrease) - inputs.indoorSummerDB;
    } else if (inputs.roofType === 'roof_direct') {
        // Direct roof exposure - even more severe
        const roofColorFactor = colorFactors[inputs.roofColor];
        const roofTempIncrease = roofColorFactor * 40;
        roofDeltaT = (inputs.outdoorSummerDB + roofTempIncrease) - inputs.indoorSummerDB;
    } else {
        // Ceiling below conditioned space - minimal load
        roofDeltaT = 2; // Assume small temperature difference
    }

    loads.roof = ceilingU * inputs.ceilingArea * roofDeltaT;

    // 4. FLOOR
    const floorU = uValues.floor[inputs.floorInsulation];
    let floorDeltaT = 0;

    // Adjust for floor type
    if (inputs.floorType === 'slab') {
        floorDeltaT = 5; // Slab typically cooler in summer
        loads.floor = -floorU * inputs.floorArea * floorDeltaT; // Negative (heat sink)
    } else if (inputs.floorType === 'basement') {
        floorDeltaT = 10; // Basement cooler
        loads.floor = -floorU * inputs.floorArea * floorDeltaT; // Negative
    } else if (inputs.floorType === 'crawlspace') {
        floorDeltaT = deltaT * 0.5; // Partially conditioned
        loads.floor = floorU * inputs.floorArea * floorDeltaT;
    } else {
        // Over conditioned space
        loads.floor = 0;
    }

    // Make sure floor doesn't add negative load to total
    if (loads.floor < 0) loads.floor = 0;

    // 5. PEOPLE
    const peopleGain = peopleHeatGain[inputs.activityLevel];
    loads.peopleSensible = inputs.numPeople * peopleGain.sensible;
    loads.peopleLatent = inputs.numPeople * peopleGain.latent;

    // 6. LIGHTING
    // Convert watts to BTU/hr: 1 Watt = 3.412 BTU/hr
    loads.lighting = inputs.lightingLoad * 3.412;

    // 7. EQUIPMENT
    loads.equipment = inputs.equipmentLoad * 3.412;

    // 8. INFILTRATION
    // CFM from ACH
    const infiltrationCFM = (inputs.roomVolume * inputs.airChangesPerHour) / 60;

    // Sensible: Q = 1.08 × CFM × ΔT
    loads.infiltrationSensible = 1.08 * infiltrationCFM * deltaT;

    // Latent: Calculate based on actual humidity difference from user inputs
    // Q = 0.68 × CFM × ΔW (in grains/lb)
    // Calculate outdoor humidity ratio from wet bulb temperature
    const outdoorW = humidityRatioFromWB(inputs.outdoorSummerDB, inputs.outdoorSummerWB);
    // Calculate indoor humidity ratio from RH
    const indoorW = humidityRatioFromRH(inputs.indoorSummerDB, inputs.indoorSummerRH);
    // Convert to grains (1 lb = 7000 grains)
    const deltaW = (outdoorW - indoorW) * 7000;
    loads.infiltrationLatent = 0.68 * infiltrationCFM * deltaW;

    // 9. VENTILATION
    // Sensible
    loads.ventilationSensible = 1.08 * inputs.ventilationCFM * deltaT;

    // Latent (use same humidity difference as infiltration)
    loads.ventilationLatent = 0.68 * inputs.ventilationCFM * deltaW;

    // TOTALS
    loads.totalSensible = loads.windows + loads.walls + loads.roof + loads.floor +
                         loads.peopleSensible + loads.lighting + loads.equipment +
                         loads.infiltrationSensible + loads.ventilationSensible;

    loads.totalLatent = loads.peopleLatent + loads.infiltrationLatent + loads.ventilationLatent;

    loads.totalLoad = loads.totalSensible + loads.totalLatent;

    // NOTE: Safety factors NOT applied per ACCA Manual J guidance
    // Manual J already includes inherent 10-15% safety factors through:
    // - Conservative 99%/1% design temperatures
    // - Conservative heat transfer coefficients
    // - Worst-case exposure assumptions
    // Additional safety factors lead to oversizing problems

    // Calculate Sensible Heat Ratio first
    loads.shr = loads.totalSensible / (loads.totalSensible + loads.totalLatent);

    // Calculate equipment size
    loads.tons = loads.totalLoad / 12000; // 12,000 BTU/hr per ton

    // Calculate required airflow - VARIABLE based on SHR per ACCA Manual S
    // Humid climates (SHR < 0.80): 350-375 CFM/ton for better dehumidification
    // Moderate climates (SHR 0.80-0.85): 400 CFM/ton
    // Dry climates (SHR > 0.85): 425-450 CFM/ton
    let cfmPerTon;
    if (loads.shr < 0.80) {
        cfmPerTon = 365; // Average of 350-375 range
    } else if (loads.shr >= 0.80 && loads.shr <= 0.85) {
        cfmPerTon = 400;
    } else {
        cfmPerTon = 437; // Average of 425-450 range
    }
    loads.cfm = loads.tons * cfmPerTon;
    loads.cfmPerTon = cfmPerTon; // Store for display

    return loads;
}

function calculateHeatingLoads(inputs) {
    const loads = {};

    // Temperature difference
    const deltaT = inputs.indoorWinterDB - inputs.outdoorWinterDB;

    // 1. WINDOWS - Transmission only (no solar in winter sizing)
    const windowU = uValues.windows[inputs.glassType];
    const totalWindowArea = inputs.windowAreaNorth + inputs.windowAreaSouth +
                            inputs.windowAreaEast + inputs.windowAreaWest;
    loads.windows = windowU * totalWindowArea * deltaT;

    // 2. WALLS - Transmission
    const wallU = uValues.walls[inputs.wallConstruction];
    const totalWallArea = inputs.wallAreaNorth + inputs.wallAreaSouth +
                          inputs.wallAreaEast + inputs.wallAreaWest;
    loads.walls = wallU * totalWallArea * deltaT;

    // 3. ROOF/CEILING
    const ceilingU = uValues.ceiling[inputs.ceilingInsulation];
    let roofDeltaT = deltaT;

    // Adjust for roof type
    if (inputs.roofType === 'ceiling_unconditioned') {
        // Attic temperature between indoor and outdoor
        const atticTemp = inputs.outdoorWinterDB + (deltaT * 0.3); // Attic warmer than outside
        roofDeltaT = inputs.indoorWinterDB - atticTemp;
    } else if (inputs.roofType === 'ceiling_conditioned') {
        roofDeltaT = 0; // No load
    }

    loads.roof = ceilingU * inputs.ceilingArea * roofDeltaT;

    // 4. FLOOR
    const floorU = uValues.floor[inputs.floorInsulation];
    let floorDeltaT = 0;

    // Adjust for floor type
    if (inputs.floorType === 'slab') {
        // Use perimeter method for slab on grade (ASHRAE method)
        // F-factor = heat loss per linear foot of perimeter per °F
        // Typical values: 0.5-0.75 BTU/hr·ft·°F for uninsulated
        //                 0.2-0.3 BTU/hr·ft·°F for R-10 perimeter insulation
        const perimeter = 2 * (inputs.roomLength + inputs.roomWidth);
        const slabFfactor = 0.5; // Conservative value for typical uninsulated slab
        loads.floor = perimeter * slabFfactor * deltaT;
    } else if (inputs.floorType === 'basement') {
        floorDeltaT = deltaT * 0.3; // Basement warmer than outside
        loads.floor = floorU * inputs.floorArea * floorDeltaT;
    } else if (inputs.floorType === 'crawlspace') {
        floorDeltaT = deltaT * 0.6; // Crawlspace between indoor and outdoor
        loads.floor = floorU * inputs.floorArea * floorDeltaT;
    } else {
        loads.floor = 0; // Over conditioned space
    }

    // 5. INFILTRATION
    const infiltrationCFM = (inputs.roomVolume * inputs.airChangesPerHour) / 60;
    loads.infiltration = 1.08 * infiltrationCFM * deltaT;

    // 6. VENTILATION
    loads.ventilation = 1.08 * inputs.ventilationCFM * deltaT;

    // TOTAL
    loads.totalLoad = loads.windows + loads.walls + loads.roof + loads.floor +
                     loads.infiltration + loads.ventilation;

    // NOTE: Safety factors NOT applied per ACCA Manual J guidance
    // See cooling calculation for explanation

    // Calculate equipment size
    loads.tons = loads.totalLoad / 12000;

    // Calculate required airflow for heating
    // Note: Heat pumps require 450-500 CFM/ton for optimal efficiency
    // Furnaces may use 350 CFM/ton, but modern systems often use cooling airflow year-round
    // Using 400 CFM/ton as compromise for mixed systems
    loads.cfm = loads.tons * 400;
    loads.cfmPerTon = 400; // Store for display

    // Alternative for heat pump only systems
    loads.cfmHeatPump = loads.tons * 475; // Heat pump optimal airflow

    return loads;
}

function displayResults(cooling, heating) {
    // Cooling results
    document.getElementById('coolingWindows').textContent = formatBTU(cooling.windows);
    document.getElementById('coolingWalls').textContent = formatBTU(cooling.walls);
    document.getElementById('coolingRoof').textContent = formatBTU(cooling.roof);
    document.getElementById('coolingFloor').textContent = formatBTU(cooling.floor);
    document.getElementById('coolingPeopleSensible').textContent = formatBTU(cooling.peopleSensible);
    document.getElementById('coolingPeopleLatent').textContent = formatBTU(cooling.peopleLatent);
    document.getElementById('coolingLighting').textContent = formatBTU(cooling.lighting);
    document.getElementById('coolingEquipment').textContent = formatBTU(cooling.equipment);
    document.getElementById('coolingInfiltrationSensible').textContent = formatBTU(cooling.infiltrationSensible);
    document.getElementById('coolingInfiltrationLatent').textContent = formatBTU(cooling.infiltrationLatent);
    document.getElementById('coolingVentilationSensible').textContent = formatBTU(cooling.ventilationSensible);
    document.getElementById('coolingVentilationLatent').textContent = formatBTU(cooling.ventilationLatent);

    document.getElementById('totalSensibleCooling').textContent = formatBTU(cooling.totalSensible);
    document.getElementById('totalLatentCooling').textContent = formatBTU(cooling.totalLatent);
    document.getElementById('totalCoolingLoad').textContent = formatBTU(cooling.totalLoad);
    document.getElementById('coolingTons').textContent = cooling.tons.toFixed(2) + ' tons';
    document.getElementById('shr').textContent = cooling.shr.toFixed(2);
    document.getElementById('coolingCFM').textContent = Math.round(cooling.cfm) + ' CFM @ ' + cooling.cfmPerTon + ' CFM/ton';

    // SHR Recommendation
    let shrText = '';
    if (cooling.shr < 0.80) {
        shrText = '<strong>High Latent Load Environment (SHR = ' + cooling.shr.toFixed(2) + ')</strong><br>' +
                 'This building has significant moisture/humidity loads. Recommendations:<br>' +
                 '• Target 350-375 CFM/ton airflow for better dehumidification<br>' +
                 '• Verify equipment can achieve this SHR at design conditions using manufacturer data<br>' +
                 '• Consider enhanced dehumidification options';
    } else if (cooling.shr >= 0.80 && cooling.shr <= 0.85) {
        shrText = '<strong>Moderate Climate (SHR = ' + cooling.shr.toFixed(2) + ')</strong><br>' +
                 'Balanced sensible and latent loads. Standard 400 CFM/ton airflow is appropriate.<br>' +
                 '• Verify equipment performance at design conditions<br>' +
                 '• Standard comfort cooling equipment should work well';
    } else {
        shrText = '<strong>Low Latent Load / Dry Climate (SHR = ' + cooling.shr.toFixed(2) + ')</strong><br>' +
                 'This building is dominated by sensible (temperature) loads. Recommendations:<br>' +
                 '• Can use 425-450 CFM/ton airflow to maximize cooling capacity<br>' +
                 '• Standard equipment should provide excellent performance<br>' +
                 '• Humidity control is less critical';
    }
    document.querySelector('#shrRecommendation p').innerHTML = shrText;

    // Load Component Breakdown
    const components = [
        { name: 'Windows (Solar + Transmission)', value: cooling.windows, color: '#e74c3c' },
        { name: 'Walls', value: cooling.walls, color: '#e67e22' },
        { name: 'Roof/Ceiling', value: cooling.roof, color: '#f39c12' },
        { name: 'Floor', value: cooling.floor, color: '#f1c40f' },
        { name: 'People', value: cooling.peopleSensible + cooling.peopleLatent, color: '#3498db' },
        { name: 'Lighting', value: cooling.lighting, color: '#9b59b6' },
        { name: 'Equipment', value: cooling.equipment, color: '#8e44ad' },
        { name: 'Infiltration', value: cooling.infiltrationSensible + cooling.infiltrationLatent, color: '#1abc9c' },
        { name: 'Ventilation', value: cooling.ventilationSensible + cooling.ventilationLatent, color: '#16a085' }
    ];

    // Sort by value descending
    components.sort((a, b) => b.value - a.value);

    let breakdownHTML = '';
    components.forEach(comp => {
        const percentage = (comp.value / cooling.totalLoad * 100).toFixed(1);
        if (comp.value > 0) {
            breakdownHTML += '<div style="margin-bottom: 0.8rem;">';
            breakdownHTML += '<div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">';
            breakdownHTML += '<span style="font-weight: 500; color: #2c3e50;">' + comp.name + '</span>';
            breakdownHTML += '<span style="color: #7f8c8d;">' + formatBTU(comp.value) + ' (' + percentage + '%)</span>';
            breakdownHTML += '</div>';
            breakdownHTML += '<div style="background-color: #ecf0f1; height: 24px; border-radius: 4px; overflow: hidden;">';
            breakdownHTML += '<div style="background-color: ' + comp.color + '; height: 100%; width: ' + percentage + '%; display: flex; align-items: center; padding-left: 8px; color: white; font-size: 0.85rem; font-weight: bold;">';
            if (parseFloat(percentage) > 10) {
                breakdownHTML += percentage + '%';
            }
            breakdownHTML += '</div>';
            breakdownHTML += '</div>';
            breakdownHTML += '</div>';
        }
    });

    document.getElementById('loadBreakdown').innerHTML = breakdownHTML;

    // Heating results
    document.getElementById('heatingWindows').textContent = formatBTU(heating.windows);
    document.getElementById('heatingWalls').textContent = formatBTU(heating.walls);
    document.getElementById('heatingRoof').textContent = formatBTU(heating.roof);
    document.getElementById('heatingFloor').textContent = formatBTU(heating.floor);
    document.getElementById('heatingInfiltration').textContent = formatBTU(heating.infiltration);
    document.getElementById('heatingVentilation').textContent = formatBTU(heating.ventilation);

    document.getElementById('totalHeatingLoad').textContent = formatBTU(heating.totalLoad);
    document.getElementById('heatingCFM').textContent = Math.round(heating.cfm) + ' CFM @ ' + heating.cfmPerTon + ' CFM/ton';

    // Equipment Selection Guidance per ACCA Manual S
    const coolingBTUperSF = cooling.totalLoad / (parseFloat(document.getElementById('floorArea').value) || 1);
    const heatingBTUperSF = heating.totalLoad / (parseFloat(document.getElementById('floorArea').value) || 1);

    // Calculate recommended equipment sizes
    const minCoolingTons = (cooling.totalLoad * 0.95) / 12000;
    const maxCoolingTons = (cooling.totalLoad * 1.15) / 12000;
    const minHeatingTons = (heating.totalLoad * 1.00) / 12000;
    const maxHeatingTons = (heating.totalLoad * 1.40) / 12000;

    // Find nearest standard equipment sizes
    const standardSizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
    const recommendedCoolingSizes = standardSizes.filter(size => size >= minCoolingTons && size <= maxCoolingTons);
    const recommendedHeatingSizes = standardSizes.filter(size => size >= minHeatingTons && size <= maxHeatingTons);

    let guidanceHTML = '<p style="margin: 0.5rem 0; color: #e65100;"><strong>Calculated Loads:</strong></p>';
    guidanceHTML += '<ul style="margin: 0.5rem 0 0.5rem 1.5rem; color: #e65100;">';
    guidanceHTML += '<li>Cooling: ' + formatBTU(cooling.totalLoad) + ' (' + cooling.tons.toFixed(2) + ' tons, ' + coolingBTUperSF.toFixed(1) + ' BTU/hr·ft²)</li>';
    guidanceHTML += '<li>Heating: ' + formatBTU(heating.totalLoad) + ' (' + heating.tons.toFixed(2) + ' tons, ' + heatingBTUperSF.toFixed(1) + ' BTU/hr·ft²)</li>';
    guidanceHTML += '</ul>';

    guidanceHTML += '<p style="margin: 0.5rem 0; color: #e65100;"><strong>ACCA Manual S Sizing Range:</strong></p>';
    guidanceHTML += '<ul style="margin: 0.5rem 0 0.5rem 1.5rem; color: #e65100;">';
    guidanceHTML += '<li>Cooling: 95-115% of calculated load = ' + minCoolingTons.toFixed(2) + ' to ' + maxCoolingTons.toFixed(2) + ' tons</li>';
    guidanceHTML += '<li>Heating: 100-140% of calculated load = ' + minHeatingTons.toFixed(2) + ' to ' + maxHeatingTons.toFixed(2) + ' tons</li>';
    guidanceHTML += '</ul>';

    if (recommendedCoolingSizes.length > 0) {
        guidanceHTML += '<p style="margin: 0.5rem 0; color: #e65100;"><strong>Recommended Standard Equipment Sizes:</strong> ' +
                       recommendedCoolingSizes.join(', ') + ' tons</p>';
    }

    guidanceHTML += '<p style="margin: 0.5rem 0 0 0; color: #e65100; font-size: 0.9rem;"><em>' +
                   'Note: "Rounding to available sizes" provides adequate safety margin. Do not deliberately oversize beyond Manual S range.' +
                   '</em></p>';

    document.getElementById('equipmentGuidanceText').innerHTML = guidanceHTML;
}

function formatBTU(value) {
    if (value < 0) value = 0; // Don't show negative values

    if (value >= 1000) {
        return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' BTU/hr';
    } else {
        return value.toFixed(0) + ' BTU/hr';
    }
}

// Export functionality (for future enhancement)
function exportCalculation() {
    // Could export to PDF or print
    window.print();
}
