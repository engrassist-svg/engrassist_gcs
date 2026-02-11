// ====================================
// COIL SELECTION CALCULATOR
// Standalone module - include this file on any page with the coil selection calculator
// ====================================

function toggleCoilGlycolMix() {
    const fluidType = document.getElementById('coil-fluidType').value;
    const glycolInput = document.getElementById('coil-glycolMixInput');

    if (fluidType === 'water') {
        glycolInput.style.display = 'none';
    } else {
        glycolInput.style.display = 'block';
    }
}

function getFluidProperties(fluidType, glycolPercent) {
    let specificHeat, density;

    if (fluidType === 'water') {
        specificHeat = 1.0; // BTU/lb·°F
        density = 8.34; // lb/gal
    } else if (fluidType === 'propylene') {
        // Propylene glycol approximations
        specificHeat = 1.0 - (0.003 * glycolPercent);
        density = 8.34 + (0.01 * glycolPercent);
    } else { // ethylene
        // Ethylene glycol approximations
        specificHeat = 1.0 - (0.0035 * glycolPercent);
        density = 8.34 + (0.012 * glycolPercent);
    }

    const specificGravity = density / 8.34;

    return {
        specificHeat: specificHeat,
        density: density,
        specificGravity: specificGravity
    };
}

function calculateCoil() {
    // Get input values
    const airflow = parseFloat(document.getElementById('coil-airflow').value) || null;
    const eat = parseFloat(document.getElementById('coil-enteringAirTemp').value) || null;
    const lat = parseFloat(document.getElementById('coil-leavingAirTemp').value) || null;
    const gpm = parseFloat(document.getElementById('coil-fluidFlow').value) || null;
    const eft = parseFloat(document.getElementById('coil-enteringFluidTemp').value) || null;
    const lft = parseFloat(document.getElementById('coil-leavingFluidTemp').value) || null;
    const capacityMBH = parseFloat(document.getElementById('coil-capacity').value) || null;

    const fluidType = document.getElementById('coil-fluidType').value;
    const glycolPercent = parseFloat(document.getElementById('coil-glycolPercent').value) || 0;

    // Get fluid properties
    const fluidProps = getFluidProperties(fluidType, glycolPercent);

    // Count known values
    const knownCount = [airflow, eat, lat, gpm, eft, lft, capacityMBH].filter(v => v !== null).length;

    if (knownCount < 5) {
        alert('Please enter at least 5 parameters to solve for the unknowns.');
        return;
    }

    // Convert capacity to BTU/hr if provided
    const capacityBTU = capacityMBH !== null ? capacityMBH * 1000 : null;

    // Calculate based on what we know
    let calculatedCapacity = capacityBTU;
    let calculatedAirflow = airflow;
    let calculatedEAT = eat;
    let calculatedLAT = lat;
    let calculatedGPM = gpm;
    let calculatedEFT = eft;
    let calculatedLFT = lft;

    // Air side calculation: Q = 1.08 * CFM * ΔT
    const AIR_CONSTANT = 1.08;

    // Fluid side calculation: Q = 500 * GPM * ΔT * SG * Cp
    const FLUID_CONSTANT = 500;

    // Try to calculate capacity from air side
    if (calculatedCapacity === null && calculatedAirflow !== null && calculatedEAT !== null && calculatedLAT !== null) {
        const airDelta = Math.abs(calculatedEAT - calculatedLAT);
        calculatedCapacity = AIR_CONSTANT * calculatedAirflow * airDelta;
    }

    // Try to calculate capacity from fluid side
    if (calculatedCapacity === null && calculatedGPM !== null && calculatedEFT !== null && calculatedLFT !== null) {
        const fluidDelta = Math.abs(calculatedEFT - calculatedLFT);
        calculatedCapacity = FLUID_CONSTANT * calculatedGPM * fluidDelta * fluidProps.specificGravity * fluidProps.specificHeat;
    }

    if (calculatedCapacity === null) {
        alert('Unable to determine capacity. Please provide capacity or sufficient temperature/flow data.');
        return;
    }

    // Now use capacity to solve for other unknowns

    // Calculate air side unknowns
    if (calculatedAirflow === null && calculatedEAT !== null && calculatedLAT !== null) {
        const airDelta = Math.abs(calculatedEAT - calculatedLAT);
        if (airDelta === 0) {
            alert('Air temperature difference cannot be zero.');
            return;
        }
        calculatedAirflow = calculatedCapacity / (AIR_CONSTANT * airDelta);
    }

    if (calculatedEAT === null && calculatedAirflow !== null && calculatedLAT !== null) {
        const airDelta = calculatedCapacity / (AIR_CONSTANT * calculatedAirflow);
        // Assume heating if LAT > ambient, cooling otherwise - need more context
        // For now, we'll alert that we need more information
        alert('Cannot uniquely determine entering air temperature without additional context. Please provide this value.');
        return;
    }

    if (calculatedLAT === null && calculatedAirflow !== null && calculatedEAT !== null) {
        if (calculatedAirflow === 0) {
            alert('Airflow cannot be zero.');
            return;
        }
        const airDelta = calculatedCapacity / (AIR_CONSTANT * calculatedAirflow);
        // Determine if heating or cooling based on other parameters
        if (calculatedEFT !== null && calculatedEFT > calculatedEAT) {
            // Heating
            calculatedLAT = calculatedEAT + airDelta;
        } else if (calculatedEFT !== null && calculatedEFT < calculatedEAT) {
            // Cooling
            calculatedLAT = calculatedEAT - airDelta;
        } else {
            alert('Cannot determine if heating or cooling. Please provide more information.');
            return;
        }
    }

    // Calculate fluid side unknowns
    if (calculatedGPM === null && calculatedEFT !== null && calculatedLFT !== null) {
        const fluidDelta = Math.abs(calculatedEFT - calculatedLFT);
        if (fluidDelta === 0) {
            alert('Fluid temperature difference cannot be zero.');
            return;
        }
        calculatedGPM = calculatedCapacity / (FLUID_CONSTANT * fluidDelta * fluidProps.specificGravity * fluidProps.specificHeat);
    }

    if (calculatedEFT === null && calculatedGPM !== null && calculatedLFT !== null) {
        if (calculatedGPM === 0) {
            alert('Fluid flow cannot be zero.');
            return;
        }
        const fluidDelta = calculatedCapacity / (FLUID_CONSTANT * calculatedGPM * fluidProps.specificGravity * fluidProps.specificHeat);
        // Determine if heating or cooling
        if (calculatedEAT !== null && calculatedLAT !== null) {
            if (calculatedLAT > calculatedEAT) {
                // Heating - fluid enters hot
                calculatedEFT = calculatedLFT + fluidDelta;
            } else {
                // Cooling - fluid enters cold
                calculatedEFT = calculatedLFT - fluidDelta;
            }
        } else {
            alert('Cannot determine entering fluid temperature without air temperatures. Please provide more information.');
            return;
        }
    }

    if (calculatedLFT === null && calculatedGPM !== null && calculatedEFT !== null) {
        if (calculatedGPM === 0) {
            alert('Fluid flow cannot be zero.');
            return;
        }
        const fluidDelta = calculatedCapacity / (FLUID_CONSTANT * calculatedGPM * fluidProps.specificGravity * fluidProps.specificHeat);
        // Determine if heating or cooling
        if (calculatedEAT !== null && calculatedLAT !== null) {
            if (calculatedLAT > calculatedEAT) {
                // Heating - fluid leaves cooler
                calculatedLFT = calculatedEFT - fluidDelta;
            } else {
                // Cooling - fluid leaves warmer
                calculatedLFT = calculatedEFT + fluidDelta;
            }
        } else {
            alert('Cannot determine leaving fluid temperature without air temperatures. Please provide more information.');
            return;
        }
    }

    // Final validation - make sure we have all values
    if (calculatedAirflow === null || calculatedEAT === null || calculatedLAT === null ||
        calculatedGPM === null || calculatedEFT === null || calculatedLFT === null) {
        alert('Unable to solve for all parameters with the given inputs. Please provide more information.');
        return;
    }

    // Calculate deltas
    const airDelta = Math.abs(calculatedEAT - calculatedLAT);
    const fluidDelta = Math.abs(calculatedEFT - calculatedLFT);

    // Verify calculations match (within tolerance)
    const airSideCapacity = AIR_CONSTANT * calculatedAirflow * airDelta;
    const fluidSideCapacity = FLUID_CONSTANT * calculatedGPM * fluidDelta * fluidProps.specificGravity * fluidProps.specificHeat;
    const tolerance = 0.05; // 5% tolerance

    if (Math.abs(airSideCapacity - fluidSideCapacity) / airSideCapacity > tolerance) {
        console.warn('Air side and fluid side capacities do not match within tolerance.');
        console.warn('Air side:', airSideCapacity.toFixed(0), 'BTU/hr');
        console.warn('Fluid side:', fluidSideCapacity.toFixed(0), 'BTU/hr');
    }

    // Use average capacity for display
    const avgCapacity = (airSideCapacity + fluidSideCapacity) / 2;

    // Display results
    displayCoilResults(
        avgCapacity,
        calculatedAirflow,
        calculatedEAT,
        calculatedLAT,
        airDelta,
        calculatedGPM,
        calculatedEFT,
        calculatedLFT,
        fluidDelta,
        fluidProps,
        fluidType,
        glycolPercent
    );
}

function displayCoilResults(capacity, airflow, eat, lat, airDelta, gpm, eft, lft, fluidDelta, fluidProps, fluidType, glycolPercent) {
    // Show results section
    document.getElementById('coil-results').style.display = 'block';

    // Display capacity
    document.getElementById('result-capacity').textContent = (capacity / 1000).toFixed(2) + ' MBH (' + capacity.toFixed(0) + ' BTU/hr)';

    // Display air side
    document.getElementById('result-airflow').textContent = airflow.toFixed(1) + ' CFM';
    document.getElementById('result-eat').textContent = eat.toFixed(1) + ' °F';
    document.getElementById('result-lat').textContent = lat.toFixed(1) + ' °F';
    document.getElementById('result-air-delta').textContent = airDelta.toFixed(1) + ' °F';

    // Display fluid side
    document.getElementById('result-fluidflow').textContent = gpm.toFixed(2) + ' GPM';
    document.getElementById('result-eft').textContent = eft.toFixed(1) + ' °F';
    document.getElementById('result-lft').textContent = lft.toFixed(1) + ' °F';
    document.getElementById('result-fluid-delta').textContent = fluidDelta.toFixed(1) + ' °F';

    // Display fluid properties
    let fluidTypeText = fluidType === 'water' ? 'Water' :
                       fluidType === 'propylene' ? glycolPercent + '% Propylene Glycol' :
                       glycolPercent + '% Ethylene Glycol';

    document.getElementById('result-fluid-props').textContent =
        fluidTypeText + ' (Cp=' + fluidProps.specificHeat.toFixed(3) + ', SG=' + fluidProps.specificGravity.toFixed(3) + ')';

    // Scroll to results
    document.getElementById('coil-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

