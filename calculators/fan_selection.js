// ====================================
// FAN SELECTION TOOL
// Standalone module - include this file on any page with the fan selection calculator
// ====================================

function calculateFanSelection() {
    // Get input values
    const airflow = parseFloat(document.getElementById('airflow').value);
    const staticPressure = parseFloat(document.getElementById('staticPressure').value);
    const applicationType = document.getElementById('applicationType').value;
    const installationType = document.getElementById('installationType').value;
    const airstream = document.getElementById('airstream').value;
    const soundLevel = document.getElementById('soundLevel').value;
    const efficiencyPriority = document.getElementById('efficiencyPriority').value;

    // Validate inputs
    if (isNaN(airflow) || airflow <= 0) {
        alert('Please enter a valid airflow value (CFM)');
        return;
    }

    if (isNaN(staticPressure) || staticPressure < 0) {
        alert('Please enter a valid static pressure value');
        return;
    }

    if (!applicationType) {
        alert('Please select an application type');
        return;
    }

    if (!installationType) {
        alert('Please select an installation type');
        return;
    }

    // Determine recommended fan types based on static pressure
    const fanRecommendations = [];

    // Centrifugal Fans - High static pressure capability
    if (staticPressure >= 0.5 && staticPressure <= 10) {
        let wheelType = 'Backward Inclined';
        let efficiency = '70-80%';

        if (efficiencyPriority === 'premium') {
            wheelType = 'Airfoil';
            efficiency = '75-85%';
        } else if (airstream === 'dusty' || airstream === 'grease') {
            wheelType = 'Radial/Industrial';
            efficiency = '50-60%';
        }

        fanRecommendations.push({
            type: 'Centrifugal Fan',
            status: 'recommended',
            wheelType: wheelType,
            staticRange: '0.5" - 10" wg',
            efficiency: efficiency,
            suitability: 'Excellent',
            notes: `${wheelType} wheel recommended for this application. Suitable for ${applicationType} systems.`
        });
    } else if (staticPressure < 0.5) {
        fanRecommendations.push({
            type: 'Centrifugal Fan',
            status: 'alternative',
            wheelType: 'Forward Curved',
            staticRange: '0.1" - 2" wg',
            efficiency: '55-65%',
            suitability: 'Good',
            notes: 'Forward curved wheels work at lower pressures but with reduced efficiency.'
        });
    }

    // Inline Centrifugal Fans
    if (staticPressure >= 0.25 && staticPressure <= 3.5 && installationType === 'inline') {
        fanRecommendations.push({
            type: 'Inline Centrifugal Fan',
            status: staticPressure <= 2.5 ? 'recommended' : 'alternative',
            wheelType: 'Backward Inclined',
            staticRange: '0.25" - 3.5" wg',
            efficiency: '65-75%',
            suitability: staticPressure <= 2.5 ? 'Excellent' : 'Good',
            notes: 'Compact inline design. Ideal for duct mounting. Popular for exhaust applications.'
        });
    }

    // Axial Fans - Low static pressure, high volume
    if (staticPressure <= 1.0) {
        fanRecommendations.push({
            type: 'Axial Fan',
            status: staticPressure <= 0.5 ? 'recommended' : 'alternative',
            wheelType: staticPressure <= 0.25 ? 'Propeller' : 'Tube-Axial',
            staticRange: '0" - 1" wg',
            efficiency: '45-60%',
            suitability: staticPressure <= 0.5 ? 'Excellent' : 'Fair',
            notes: 'Best for low pressure applications. High airflow capacity. Simple and economical.'
        });
    }

    // Mixed Flow Fans
    if (staticPressure >= 0.5 && staticPressure <= 2.5 && installationType === 'inline') {
        fanRecommendations.push({
            type: 'Mixed Flow Fan',
            status: 'alternative',
            wheelType: 'Mixed Flow Impeller',
            staticRange: '0.5" - 2.5" wg',
            efficiency: '60-70%',
            suitability: 'Good',
            notes: 'Combines centrifugal and axial characteristics. Compact design for inline mounting.'
        });
    }

    // If static pressure is too high
    if (staticPressure > 10) {
        fanRecommendations.push({
            type: 'High Pressure Centrifugal',
            status: 'recommended',
            wheelType: 'Radial Blade',
            staticRange: '5" - 20" wg',
            efficiency: '50-65%',
            suitability: 'Required',
            notes: 'High static pressure requires industrial-grade centrifugal fan with radial blade design.'
        });
    }

    // Sort recommendations: recommended first, then alternatives
    fanRecommendations.sort((a, b) => {
        if (a.status === 'recommended' && b.status !== 'recommended') return -1;
        if (a.status !== 'recommended' && b.status === 'recommended') return 1;
        return 0;
    });

    // Display results
    displayFanRecommendations(fanRecommendations, airflow, staticPressure);
    displayFanSpecifications(airflow, staticPressure, applicationType, soundLevel, efficiencyPriority);
    displayFanNotes(applicationType, installationType, airstream, soundLevel);

    // Show results section
    document.getElementById('fanResults').style.display = 'block';

    // Smooth scroll to results
    document.getElementById('fanResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayFanRecommendations(recommendations, cfm, sp) {
    const container = document.getElementById('fanRecommendations');
    container.innerHTML = '';

    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = `fan-recommendation-card ${rec.status}`;

        card.innerHTML = `
            <div class="fan-recommendation-header">
                <h4>${rec.type}</h4>
                <span class="fan-badge ${rec.status}">${rec.status === 'recommended' ? '✓ Recommended' : 'Alternative'}</span>
            </div>
            <div class="fan-recommendation-details">
                <div class="fan-detail-item">
                    <strong>Wheel Type</strong>
                    <span>${rec.wheelType}</span>
                </div>
                <div class="fan-detail-item">
                    <strong>Static Pressure Range</strong>
                    <span>${rec.staticRange}</span>
                </div>
                <div class="fan-detail-item">
                    <strong>Efficiency</strong>
                    <span>${rec.efficiency}</span>
                </div>
                <div class="fan-detail-item">
                    <strong>Suitability</strong>
                    <span>${rec.suitability}</span>
                </div>
            </div>
            <p style="margin-top: 1rem; color: #7f8c8d; line-height: 1.6;">${rec.notes}</p>
        `;

        container.appendChild(card);
    });
}

function displayFanSpecifications(cfm, sp, application, sound, efficiency) {
    const container = document.getElementById('fanSpecifications');

    // Calculate estimated motor HP (rough approximation)
    const airPower = (cfm * sp) / 6356; // Air horsepower
    const fanEfficiency = efficiency === 'premium' ? 0.80 : (efficiency === 'high' ? 0.70 : 0.65);
    const motorHP = (airPower / fanEfficiency) * 1.15; // Add 15% safety factor

    // Estimate outlet velocity (assumes reasonable duct sizing)
    const ductArea = cfm / 2000; // Assuming 2000 FPM average velocity
    const ductDiameter = Math.sqrt((ductArea * 4) / Math.PI);
    const outletVelocity = 2000; // FPM

    // Calculate velocity pressure
    const velocityPressure = Math.pow(outletVelocity / 4005, 2);

    // Estimated sound level
    let soundLevelDb = 'N/A';
    if (sound === 'verylow') {
        soundLevelDb = '45-55 dBA';
    } else if (sound === 'low') {
        soundLevelDb = '55-65 dBA';
    } else if (sound === 'standard') {
        soundLevelDb = '65-75 dBA';
    } else {
        soundLevelDb = '75-85 dBA';
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
            <div class="result-item">
                <span class="result-label">Required CFM</span>
                <span class="result-value">${cfm.toFixed(0)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Static Pressure</span>
                <span class="result-value">${sp.toFixed(2)}" wg</span>
            </div>
            <div class="result-item">
                <span class="result-label">Estimated Motor HP</span>
                <span class="result-value">${motorHP.toFixed(2)} HP</span>
            </div>
            <div class="result-item">
                <span class="result-label">Est. Outlet Velocity</span>
                <span class="result-value">${outletVelocity} FPM</span>
            </div>
            <div class="result-item">
                <span class="result-label">Velocity Pressure</span>
                <span class="result-value">${velocityPressure.toFixed(3)}" wg</span>
            </div>
            <div class="result-item">
                <span class="result-label">Est. Sound Level</span>
                <span class="result-value">${soundLevelDb}</span>
            </div>
        </div>
    `;
}

function displayFanNotes(application, installation, airstream, sound) {
    const container = document.getElementById('fanNotes');

    let notes = '<ul style="margin-left: 1.5rem; color: #34495e; line-height: 1.8;">';

    // Application-specific notes
    if (application === 'supply') {
        notes += '<li>Supply air fans should be selected for quiet operation and good efficiency.</li>';
        notes += '<li>Consider sound attenuation if fan is located near occupied spaces.</li>';
    } else if (application === 'exhaust' || application === 'kitchen') {
        notes += '<li>Exhaust fans should be corrosion-resistant if handling moisture or contaminants.</li>';
        notes += '<li>Spark-resistant construction may be required for certain applications.</li>';
    } else if (application === 'smoke') {
        notes += '<li>Smoke exhaust fans must meet fire safety codes (UL 705 rating).</li>';
        notes += '<li>High temperature rating typically required (250°F for 2 hours or 350°F for 1 hour).</li>';
    }

    // Installation notes
    if (installation === 'rooftop') {
        notes += '<li>Rooftop installation requires weatherproof construction and curb mounting.</li>';
        notes += '<li>Consider wind loading and seismic requirements per local codes.</li>';
    } else if (installation === 'inline') {
        notes += '<li>Inline fans require adequate duct support and vibration isolation.</li>';
        notes += '<li>Provide access panels for maintenance.</li>';
    }

    // Airstream condition notes
    if (airstream === 'corrosive') {
        notes += '<li>Use corrosion-resistant materials such as coated steel, stainless steel, or FRP.</li>';
    } else if (airstream === 'hot') {
        notes += '<li>High temperature applications require special bearings and motor cooling.</li>';
    } else if (airstream === 'grease') {
        notes += '<li>Grease-laden air requires UL 762 listed fans with easily cleanable wheels.</li>';
    } else if (airstream === 'dusty') {
        notes += '<li>Dusty applications benefit from radial blade wheels that resist buildup.</li>';
    }

    // Sound notes
    if (sound === 'verylow' || sound === 'low') {
        notes += '<li>Low noise applications may require sound attenuators, flexible connections, and/or housed fans.</li>';
        notes += '<li>Select fans operating in the middle third of their performance curve for quieter operation.</li>';
    }

    // General notes
    notes += '<li>Always verify selections using manufacturer performance curves and selection software.</li>';
    notes += '<li>Add 10-15% safety factor to account for future filter loading and system changes.</li>';
    notes += '<li>Consider VFD control for energy savings and modulating capacity.</li>';
    notes += '<li>Ensure adequate maintenance access for belt changes, bearing lubrication, and cleaning.</li>';

    notes += '</ul>';

    container.innerHTML = notes;
}

function resetFanSelection() {
    // Clear all inputs
    document.getElementById('airflow').value = '';
    document.getElementById('staticPressure').value = '';
    document.getElementById('applicationType').selectedIndex = 0;
    document.getElementById('installationType').selectedIndex = 0;
    document.getElementById('airstream').selectedIndex = 0;
    document.getElementById('soundLevel').selectedIndex = 0;
    document.getElementById('efficiencyPriority').selectedIndex = 0;

    // Hide results
    document.getElementById('fanResults').style.display = 'none';

    // Scroll to top of calculator
    document.querySelector('.fan-selection-calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
