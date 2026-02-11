// ========================================
// AIR BALANCE CALCULATOR FUNCTIONS
// Standalone module - include this file on any page with the air balance calculator
// ========================================

// Initialize air balance calculator when page loads
function initializeAirBalance() {
    // Only run on air balance page
    if (!document.getElementById('air-terminals-table')) return;
    
    // Add 3 starter rows - one of each type
    addTerminalRowWithType('supply');
    addTerminalRowWithType('return');
    addTerminalRowWithType('exhaust');
}

// Store air terminals data
let airTerminals = [];
let nextTerminalId = 1;

// Toggle advanced settings visibility
function toggleAdvanced() {
    const advancedSection = document.getElementById('advanced-section');
    const psychrometricResults = document.getElementById('psychrometric-results');
    const toggleText = document.getElementById('advanced-toggle-text');
    
    if (advancedSection.style.display === 'none') {
        advancedSection.style.display = 'block';
        psychrometricResults.style.display = 'block';
        toggleText.textContent = '▼ Hide Advanced Psychrometric Calculations';
    } else {
        advancedSection.style.display = 'none';
        psychrometricResults.style.display = 'none';
        toggleText.textContent = '▶ Show Advanced Psychrometric Calculations';
    }
    
    calculateAirflow();
}

// Add a new air terminal row
function addTerminalRow() {
    const tbody = document.getElementById('terminals-tbody');
    if (!tbody) return;
    
    const row = tbody.insertRow();
    const terminalData = {
        id: nextTerminalId++,
        name: '',
        type: 'supply',
        cfm: 0
    };
    airTerminals.push(terminalData);
    
    row.innerHTML = `
        <td data-label="Terminal ID:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="text"
                   placeholder="e.g., AHU-1"
                   value="${terminalData.name}"
                   onchange="updateTerminalName(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td data-label="Type:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <select onchange="updateTerminalType(${terminalData.id}, this.value)"
                    style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
                <option value="supply" selected>Supply</option>
                <option value="return">Return</option>
                <option value="exhaust">Exhaust</option>
            </select>
        </td>
        <td data-label="CFM:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="number"
                   placeholder="0"
                   value="${terminalData.cfm}"
                   onchange="updateTerminalCFM(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td data-label="Actions:" style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">
            <button onclick="moveRowUp(${terminalData.id})"
                    style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Move Up">
                ▲
            </button>
            <button onclick="moveRowDown(${terminalData.id})"
                    style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Move Down">
                ▼
            </button>
            <button onclick="deleteRow(${terminalData.id})"
                    style="background: #e74c3c; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Delete">
                ✕
            </button>
        </td>
    `;
    
    calculateAirflow();
}

// Add a new air terminal row with specific type
function addTerminalRowWithType(terminalType) {
    const tbody = document.getElementById('terminals-tbody');
    if (!tbody) return;
    
    const row = tbody.insertRow();
    const terminalData = {
        id: nextTerminalId++,
        name: '',
        type: terminalType,
        cfm: 0
    };
    airTerminals.push(terminalData);
    
    row.innerHTML = `
        <td data-label="Terminal ID:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="text"
                   placeholder="e.g., AHU-1"
                   value="${terminalData.name}"
                   onchange="updateTerminalName(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td data-label="Type:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <select onchange="updateTerminalType(${terminalData.id}, this.value)"
                    style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
                <option value="supply" ${terminalType === 'supply' ? 'selected' : ''}>Supply</option>
                <option value="return" ${terminalType === 'return' ? 'selected' : ''}>Return</option>
                <option value="exhaust" ${terminalType === 'exhaust' ? 'selected' : ''}>Exhaust</option>
            </select>
        </td>
        <td data-label="CFM:" style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="number"
                   placeholder="0"
                   value="${terminalData.cfm}"
                   onchange="updateTerminalCFM(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td data-label="Actions:" style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">
            <button onclick="moveRowUp(${terminalData.id})"
                    style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Move Up">
                ▲
            </button>
            <button onclick="moveRowDown(${terminalData.id})"
                    style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Move Down">
                ▼
            </button>
            <button onclick="deleteRow(${terminalData.id})"
                    style="background: #e74c3c; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                    title="Delete">
                ✕
            </button>
        </td>
    `;
    
    calculateAirflow();
}

// Update terminal name
function updateTerminalName(id, value) {
    const terminal = airTerminals.find(t => t.id === id);
    if (terminal) {
        terminal.name = value;
    }
}

// Update terminal type
function updateTerminalType(id, value) {
    const terminal = airTerminals.find(t => t.id === id);
    if (terminal) {
        terminal.type = value;
        calculateAirflow();
    }
}

// Update terminal CFM
function updateTerminalCFM(id, value) {
    const terminal = airTerminals.find(t => t.id === id);
    if (terminal) {
        terminal.cfm = parseFloat(value) || 0;
        calculateAirflow();
    }
}

// Delete a row
function deleteRow(id) {
    const index = airTerminals.findIndex(t => t.id === id);
    if (index > -1) {
        airTerminals.splice(index, 1);
        rebuildTable();
        calculateAirflow();
    }
}

// Move row up
function moveRowUp(id) {
    const index = airTerminals.findIndex(t => t.id === id);
    if (index > 0) {
        [airTerminals[index - 1], airTerminals[index]] = [airTerminals[index], airTerminals[index - 1]];
        rebuildTable();
    }
}

// Move row down
function moveRowDown(id) {
    const index = airTerminals.findIndex(t => t.id === id);
    if (index < airTerminals.length - 1) {
        [airTerminals[index], airTerminals[index + 1]] = [airTerminals[index + 1], airTerminals[index]];
        rebuildTable();
    }
}

// Rebuild entire table from airTerminals data
function rebuildTable() {
    const tbody = document.getElementById('terminals-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    airTerminals.forEach(terminal => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <input type="text" 
                       placeholder="e.g., AHU-1" 
                       value="${terminal.name}"
                       onchange="updateTerminalName(${terminal.id}, this.value)"
                       style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <select onchange="updateTerminalType(${terminal.id}, this.value)"
                        style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
                    <option value="supply" ${terminal.type === 'supply' ? 'selected' : ''}>Supply</option>
                    <option value="return" ${terminal.type === 'return' ? 'selected' : ''}>Return</option>
                    <option value="exhaust" ${terminal.type === 'exhaust' ? 'selected' : ''}>Exhaust</option>
                </select>
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <input type="number" 
                       placeholder="0" 
                       value="${terminal.cfm}"
                       onchange="updateTerminalCFM(${terminal.id}, this.value)"
                       style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
            </td>
            <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">
                <button onclick="moveRowUp(${terminal.id})" 
                        style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                        title="Move Up">
                    ▲
                </button>
                <button onclick="moveRowDown(${terminal.id})" 
                        style="background: #3498db; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                        title="Move Down">
                    ▼
                </button>
                <button onclick="deleteRow(${terminal.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 0.5rem 0.75rem; margin: 0 0.25rem; border-radius: 5px; cursor: pointer;"
                        title="Delete">
                    ✕
                </button>
            </td>
        `;
    });
}

// Calculate enthalpy from dry-bulb and wet-bulb temperatures (Btu/lb)
function calculateEnthalpy(dryBulb, wetBulb) {
    // Simplified psychrometric calculation
    const pws = Math.exp(77.3450 + 0.0057 * wetBulb - 7235 / (wetBulb + 459.67)) / Math.pow(wetBulb + 459.67, 8.2);
    const ws = 0.62198 * pws / (14.696 - pws);
    const enthalpy = 0.240 * dryBulb + ws * (1061 + 0.444 * dryBulb);
    return enthalpy;
}

// Calculate psychrometric properties and loads
function calculatePsychrometrics(supplyCFM, outsideAirCFM, returnCFM, oaPercentage) {
    if (supplyCFM === 0) return;
    
    // Get summer conditions
    const summerOAdb = parseFloat(document.getElementById('summer-oa-db').value) || 0;
    const summerOAwb = parseFloat(document.getElementById('summer-oa-wb').value) || 0;
    const summerRAdb = parseFloat(document.getElementById('summer-ra-db').value) || 0;
    const summerRAwb = parseFloat(document.getElementById('summer-ra-wb').value) || 0;
    const summerSAdb = parseFloat(document.getElementById('summer-sa-db').value) || 0;
    const summerSAwb = parseFloat(document.getElementById('summer-sa-wb').value) || 0;
    
    // Get winter conditions
    const winterOAdb = parseFloat(document.getElementById('winter-oa-db').value) || 0;
    const winterOAwb = parseFloat(document.getElementById('winter-oa-wb').value) || 0;
    const winterRAdb = parseFloat(document.getElementById('winter-ra-db').value) || 0;
    const winterRAwb = parseFloat(document.getElementById('winter-ra-wb').value) || 0;
    const winterSAdb = parseFloat(document.getElementById('winter-sa-db').value) || 0;
    const winterSAwb = parseFloat(document.getElementById('winter-sa-wb').value) || 0;
    
    // Calculate OA and RA fractions
    const oaFraction = oaPercentage / 100;
    const raFraction = 1 - oaFraction;
    
    // SUMMER CALCULATIONS
    // Mixed air temperature (dry-bulb)
    const summerMixedAirDB = (oaFraction * summerOAdb) + (raFraction * summerRAdb);
    document.getElementById('summer-mixed-air-temp').textContent = summerMixedAirDB.toFixed(1) + ' °F';
    
    // Calculate enthalpies
    const summerMixedAirEnthalpy = (oaFraction * calculateEnthalpy(summerOAdb, summerOAwb)) + 
                                    (raFraction * calculateEnthalpy(summerRAdb, summerRAwb));
    const summerSupplyAirEnthalpy = calculateEnthalpy(summerSAdb, summerSAwb);
    
    // Total cooling load (uses enthalpy difference)
    // Q_total = CFM × 4.5 × Δh (BTU/hr), convert to MBH
    const summerTotalCooling = (supplyCFM * 4.5 * (summerMixedAirEnthalpy - summerSupplyAirEnthalpy)) / 1000;
    document.getElementById('summer-total-cooling').textContent = summerTotalCooling.toFixed(1) + ' MBH';
    
    // Sensible cooling load (uses temperature difference)
    // Q_sensible = CFM × 1.08 × ΔT (BTU/hr), convert to MBH
    const summerSensibleCooling = (supplyCFM * 1.08 * (summerMixedAirDB - summerSAdb)) / 1000;
    document.getElementById('summer-sensible-cooling').textContent = summerSensibleCooling.toFixed(1) + ' MBH';
    
    // Sensible Heat Ratio
    const summerSHR = summerTotalCooling > 0 ? (summerSensibleCooling / summerTotalCooling) : 0;
    document.getElementById('summer-shr').textContent = summerSHR.toFixed(3);
    
    // WINTER CALCULATIONS
    // Mixed air temperature (dry-bulb)
    const winterMixedAirDB = (oaFraction * winterOAdb) + (raFraction * winterRAdb);
    document.getElementById('winter-mixed-air-temp').textContent = winterMixedAirDB.toFixed(1) + ' °F';
    
    // Total heating load (uses temperature difference)
    // Q_heating = CFM × 1.08 × ΔT (BTU/hr), convert to MBH
    const winterTotalHeating = (supplyCFM * 1.08 * (winterSAdb - winterMixedAirDB)) / 1000;
    document.getElementById('winter-total-heating').textContent = winterTotalHeating.toFixed(1) + ' MBH';
}


// Add to initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeAirBalance();
});

