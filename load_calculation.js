// ====================================
// HVAC LOAD CALCULATION
// Based on Carrier and ACCA Manual J Methods
// ====================================

// Auto-calculate room dimensions on input
document.addEventListener('DOMContentLoaded', function() {
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
});

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
const peopleHeatGain = {
    seated: { sensible: 250, latent: 200 },
    standing: { sensible: 300, latent: 250 },
    moderate: { sensible: 350, latent: 300 },
    heavy: { sensible: 450, latent: 550 }
};

// Main calculation function
function calculateLoads() {
    // Validate inputs
    if (!validateInputs()) {
        return;
    }

    // Get all input values
    const inputs = getInputValues();

    // Calculate cooling loads
    const coolingLoads = calculateCoolingLoads(inputs);

    // Calculate heating loads
    const heatingLoads = calculateHeatingLoads(inputs);

    // Display results
    displayResults(coolingLoads, heatingLoads);

    // Show results section
    document.getElementById('loadResults').style.display = 'block';

    // Scroll to results
    document.getElementById('loadResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

    // Latent: Estimate based on humidity difference
    // Assume outdoor = 0.0120 lb H2O/lb air, indoor = 0.0093 (50% RH @ 75°F)
    // Q = 0.68 × CFM × ΔW (in grains/lb)
    const outdoorW = 0.0120 * 7000; // Convert to grains
    const indoorW = 0.0093 * 7000;
    const deltaW = outdoorW - indoorW;
    loads.infiltrationLatent = 0.68 * infiltrationCFM * deltaW;

    // 9. VENTILATION
    // Sensible
    loads.ventilationSensible = 1.08 * inputs.ventilationCFM * deltaT;

    // Latent
    loads.ventilationLatent = 0.68 * inputs.ventilationCFM * deltaW;

    // TOTALS
    loads.totalSensible = loads.windows + loads.walls + loads.roof + loads.floor +
                         loads.peopleSensible + loads.lighting + loads.equipment +
                         loads.infiltrationSensible + loads.ventilationSensible;

    loads.totalLatent = loads.peopleLatent + loads.infiltrationLatent + loads.ventilationLatent;

    loads.totalLoad = loads.totalSensible + loads.totalLatent;

    // Apply safety factor
    loads.totalLoad = loads.totalLoad * (1 + inputs.coolingSafetyFactor / 100);

    // Calculate equipment size
    loads.tons = loads.totalLoad / 12000; // 12,000 BTU/hr per ton

    // Calculate required airflow (typical 400 CFM/ton for cooling)
    loads.cfm = loads.tons * 400;

    // Calculate Sensible Heat Ratio
    loads.shr = loads.totalSensible / (loads.totalSensible + loads.totalLatent);

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
        // Use perimeter method for slab on grade
        const perimeter = 2 * (inputs.roomLength + inputs.roomWidth);
        loads.floor = perimeter * 0.5 * deltaT; // Simplified perimeter heat loss
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

    // Apply safety factor
    loads.totalLoad = loads.totalLoad * (1 + inputs.heatingSafetyFactor / 100);

    // Calculate equipment size
    loads.tons = loads.totalLoad / 12000;

    // Calculate required airflow (typical 350 CFM/ton for heating)
    loads.cfm = loads.tons * 350;

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
    document.getElementById('coolingCFM').textContent = Math.round(cooling.cfm) + ' CFM';
    document.getElementById('shr').textContent = cooling.shr.toFixed(2);

    // Heating results
    document.getElementById('heatingWindows').textContent = formatBTU(heating.windows);
    document.getElementById('heatingWalls').textContent = formatBTU(heating.walls);
    document.getElementById('heatingRoof').textContent = formatBTU(heating.roof);
    document.getElementById('heatingFloor').textContent = formatBTU(heating.floor);
    document.getElementById('heatingInfiltration').textContent = formatBTU(heating.infiltration);
    document.getElementById('heatingVentilation').textContent = formatBTU(heating.ventilation);

    document.getElementById('totalHeatingLoad').textContent = formatBTU(heating.totalLoad);
    document.getElementById('heatingCFM').textContent = Math.round(heating.cfm) + ' CFM';
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
