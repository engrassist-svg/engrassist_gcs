// ============================================
// PSYCHROMETRIC CHART CALCULATOR
// Based on ASHRAE Fundamentals
// Standalone module - include this file on any page with the psychrometric chart
// ============================================

// Global state for psychrometric chart
let psychCurrentElevation = 'sealevel';
let psychCurrentPressure = 14.696; // psia
let psychInputMode = 'click';
let psychConnectMode = false;
let psychPoints = []; // Array of point objects
let psychSelectedVariables = [];
let psychMaxPoints = 12;

// Color palette for points
const psychPointColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#c0392b', '#2980b9', '#27ae60', '#d35400'
];

// Chart dimensions and scales
const psychChartConfig = {
    width: 1000,
    height: 750,
    marginLeft: 80,
    marginRight: 50,
    marginTop: 120,  // Increased for title and enthalpy scale
    marginBottom: 80,
    tMin: 30,
    tMax: 120,
    wMin: 0,
    wMax: 0.030  // lb water / lb dry air
};

// ============================================
// PSYCHROMETRIC CALCULATIONS (ASHRAE)
// ============================================

/**
 * Calculate saturation vapor pressure using ASHRAE formula
 * @param {number} T - Temperature in Fahrenheit
 * @returns {number} Saturation pressure in psia
 */
function psychSaturationPressure(T) {
    // ASHRAE Fundamentals empirical formula
    // Input: T in °F, Output: psia
    const C1 = -1.0440397E+04;
    const C2 = -1.1294650E+01;
    const C3 = -2.7022355E-02;
    const C4 = 1.2890360E-05;
    const C5 = -2.4780681E-09;
    const C6 = 6.5459673E+00;
    
    const T_R = T + 459.67; // Convert to Rankine
    const lnPws = C1/T_R + C2 + C3*T_R + C4*T_R*T_R + C5*T_R*T_R*T_R + C6*Math.log(T_R);
    const Pws = Math.exp(lnPws);
    
    // Clamp to slightly below ambient pressure to avoid division issues
    return Math.min(Pws, psychCurrentPressure * 0.999);
}

/**
 * Calculate humidity ratio from dry bulb, wet bulb, and pressure
 */
function psychHumidityRatioFromWB(T_db, T_wb, P) {
    // All temperatures in °F, pressure in psia
    const Pws_wb = psychSaturationPressure(T_wb);
    const Ws_wb = 0.621945 * Pws_wb / (P - Pws_wb);
    
    // ASHRAE psychrometric equation
    const W = ((1093 - 0.556 * T_wb) * Ws_wb - 0.240 * (T_db - T_wb)) / 
              (1093 + 0.444 * T_db - T_wb);
    
    return Math.max(0, W);
}

/**
 * Calculate all psychrometric properties from dry bulb and humidity ratio
 * @param {number} T_db - Dry bulb temperature (°F)
 * @param {number} W - Humidity ratio (lb water/lb dry air)
 * @param {number} P - Barometric pressure (psia)
 * @returns {object} All psychrometric properties
 */
function psychCalculateProperties(T_db, W, P) {
    const properties = {};
    properties.dryBulb = T_db;
    properties.humidityRatio = W;
    
    // Vapor pressure (psia)
    properties.vaporPressure = (P * W) / (0.621945 + W);
    
    // Dew point temperature (°F)
    const Pw = properties.vaporPressure;
    if (Pw > 1e-6) {
        // ASHRAE inverse saturation pressure formula
        const C14 = 6.54;
        const C15 = 14.526;
        const C16 = 0.7389;
        const C17 = 0.09486;
        const C18 = 0.4569;
        
        const alpha = Math.log(Pw);
        properties.dewPoint = C14 + C15*alpha + C16*alpha*alpha + 
                             C17*Math.pow(alpha, 3) + C18*Math.pow(Pw, 0.1984);
        
        // Clamp to reasonable range
        properties.dewPoint = Math.max(-100, Math.min(T_db, properties.dewPoint));
    } else {
        // Very dry air - use asymptotic approximation
        properties.dewPoint = -100;
    }
    
    // Relative humidity (%)
    const Pws = psychSaturationPressure(T_db);
    properties.relativeHumidity = Math.min(100, Math.max(0, (Pw / Pws) * 100));
    
    // Enthalpy (BTU/lb dry air)
    properties.enthalpy = 0.240 * T_db + W * (1061 + 0.444 * T_db);
    
    // Specific volume (ft³/lb dry air)
    const T_R = T_db + 459.67; // Rankine
    properties.specificVolume = 0.370486 * T_R * (1 + 1.607858 * W) / P;
    
    // Wet bulb temperature (°F) - iterative calculation
    properties.wetBulb = psychApproximateWetBulb(T_db, W, P);
    
    return properties;
}

/**
 * Approximate wet bulb temperature using bisection method
 * More robust than Newton's method with arbitrary step size
 */
function psychApproximateWetBulb(T_db, W_target, P) {
    // Use bisection for robust convergence
    let T_wb_low = -50;
    let T_wb_high = T_db;
    let T_wb_mid = T_db;
    
    const tolerance = 0.001; // °F
    const maxIterations = 50;
    
    for (let i = 0; i < maxIterations; i++) {
        T_wb_mid = (T_wb_low + T_wb_high) / 2;
        const W_calc = psychHumidityRatioFromWB(T_db, T_wb_mid, P);
        const error = W_calc - W_target;
        
        if (Math.abs(error) < tolerance * W_target || Math.abs(T_wb_high - T_wb_low) < 0.01) {
            break;
        }
        
        // Adjust bounds based on error
        if (error > 0) {
            // Calculated W is too high, wet bulb is too high
            T_wb_high = T_wb_mid;
        } else {
            // Calculated W is too low, wet bulb is too low
            T_wb_low = T_wb_mid;
        }
    }
    
    return T_wb_mid;
}

/**
 * Calculate properties from two known variables
 */
function psychCalculateFromTwoVariables(var1Type, var1Value, var2Type, var2Value, P) {
    let T_db, W;
    
    // Determine dry bulb and humidity ratio
    if (var1Type === 'db') {
        T_db = var1Value;
        W = psychGetWFromSecondVariable(T_db, var2Type, var2Value, P);
    } else if (var2Type === 'db') {
        T_db = var2Value;
        W = psychGetWFromSecondVariable(T_db, var1Type, var1Value, P);
    } else {
        // Neither is dry bulb - need to solve iteratively
        const result = psychSolveForDbAndW(var1Type, var1Value, var2Type, var2Value, P);
        T_db = result.T_db;
        W = result.W;
    }
    
    return psychCalculateProperties(T_db, W, P);
}

/**
 * Get humidity ratio from known dry bulb and another variable
 */
function psychGetWFromSecondVariable(T_db, varType, varValue, P) {
    switch(varType) {
        case 'wb':
            return psychHumidityRatioFromWB(T_db, varValue, P);
        
        case 'rh':
            const Pws = psychSaturationPressure(T_db);
            const Pw = (varValue / 100) * Pws;
            return 0.621945 * Pw / (P - Pw);
        
        case 'dp':
            const Pw_dp = psychSaturationPressure(varValue);
            return 0.621945 * Pw_dp / (P - Pw_dp);
        
        case 'w':
            return varValue;
        
        case 'h':
            // Solve for W from enthalpy: h = 0.240*T + W*(1061 + 0.444*T)
            return (varValue - 0.240 * T_db) / (1061 + 0.444 * T_db);
        
        default:
            return 0;
    }
}

/**
 * Solve for dry bulb and humidity ratio when neither is given
 * Uses bisection for robust convergence
 */
function psychSolveForDbAndW(var1Type, var1Value, var2Type, var2Value, P) {
    // Bisection method for T_db
    let T_low = psychChartConfig.tMin;
    let T_high = psychChartConfig.tMax;
    let T_mid = 70; // Initial guess
    
    for (let i = 0; i < 50; i++) {
        T_mid = (T_low + T_high) / 2;
        const W1 = psychGetWFromSecondVariable(T_mid, var1Type, var1Value, P);
        const W2 = psychGetWFromSecondVariable(T_mid, var2Type, var2Value, P);
        
        const error = W1 - W2;
        if (Math.abs(error) < 0.00001) {
            return { T_db: T_mid, W: W1 };
        }
        
        // Adjust bounds
        if (error > 0) {
            T_high = T_mid;
        } else {
            T_low = T_mid;
        }
        
        // Check convergence on temperature
        if (Math.abs(T_high - T_low) < 0.01) break;
    }
    
    // Return best estimate
    const W = psychGetWFromSecondVariable(T_mid, var1Type, var1Value, P);
    return { T_db: T_mid, W };
}

// ============================================
// CHART DRAWING FUNCTIONS
// ============================================

function psychDrawChart() {
    const svg = document.getElementById('psychChart');
    if (!svg) return;
    svg.innerHTML = '';

    // Professional gradient background
    const defs = psychCreateSVGElement('defs', {});
    const gradient = psychCreateSVGElement('linearGradient', {
        id: 'chartBg',
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%'
    });
    const stop1 = psychCreateSVGElement('stop', {
        offset: '0%',
        style: 'stop-color:#f8fbfd;stop-opacity:1'
    });
    const stop2 = psychCreateSVGElement('stop', {
        offset: '100%',
        style: 'stop-color:#e8f4f8;stop-opacity:1'
    });
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const bg = psychCreateSVGElement('rect', {
        width: psychChartConfig.width,
        height: psychChartConfig.height,
        fill: 'url(#chartBg)'
    });
    svg.appendChild(bg);

    // Chart area background
    const chartBg = psychCreateSVGElement('rect', {
        x: psychChartConfig.marginLeft,
        y: psychChartConfig.marginTop,
        width: psychChartConfig.width - psychChartConfig.marginLeft - psychChartConfig.marginRight,
        height: psychChartConfig.height - psychChartConfig.marginTop - psychChartConfig.marginBottom,
        fill: '#ffffff',
        stroke: '#2c3e50',
        'stroke-width': 2,
        rx: 2
    });
    svg.appendChild(chartBg);

    psychDrawTemperatureGrid(svg);
    psychDrawHumidityGrid(svg);
    psychDrawDewPointLines(svg);
    psychDrawSpecificVolumeLines(svg);
    psychDrawEnthalpyLines(svg);
    psychDrawWetBulbLines(svg);
    psychDrawRelativeHumidityLines(svg);
    psychDrawSaturationCurve(svg);
    psychDrawAxes(svg);
    psychDrawEnthalpyScale(svg);
    psychDrawConnections(svg);
    psychDrawPoints(svg);
}

function psychDrawTemperatureGrid(svg) {
    const chartBottom = psychChartConfig.height - psychChartConfig.marginBottom;
    const chartTop = psychChartConfig.marginTop;

    // Draw grid lines and tick marks
    for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 5) {
        const x = psychTempToX(t);
        const isMajor = t % 10 === 0;

        // Grid line
        const line = psychCreateSVGElement('line', {
            x1: x, y1: chartTop,
            x2: x, y2: chartBottom,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);

        // Bottom tick mark
        const tickLength = isMajor ? 10 : 5;
        const tick = psychCreateSVGElement('line', {
            x1: x, y1: chartBottom,
            x2: x, y2: chartBottom + tickLength,
            stroke: '#2c3e50',
            'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(tick);

        // Top tick mark
        const topTick = psychCreateSVGElement('line', {
            x1: x, y1: chartTop,
            x2: x, y2: chartTop - tickLength,
            stroke: '#2c3e50',
            'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(topTick);

        // Label for major tick marks
        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: x,
                y: chartBottom + 25,
                'text-anchor': 'middle',
                'font-size': '12px',
                'font-weight': '600',
                fill: '#2c3e50'
            });
            label.textContent = t;
            svg.appendChild(label);
        } else {
            // Minor labels (smaller font)
            const minorLabel = psychCreateSVGElement('text', {
                x: x,
                y: chartBottom + 18,
                'text-anchor': 'middle',
                'font-size': '9px',
                'font-weight': '400',
                fill: '#7f8c8d'
            });
            minorLabel.textContent = t;
            svg.appendChild(minorLabel);
        }
    }
}

function psychDrawHumidityGrid(svg) {
    const chartLeft = psychChartConfig.marginLeft;
    const chartRight = psychChartConfig.width - psychChartConfig.marginRight;

    // Draw grid lines for humidity ratio (lb/lb)
    for (let w = 0; w <= psychChartConfig.wMax; w += 0.002) {
        const y = psychHumidityToY(w);
        const isMajor = (w * 1000) % 4 === 0;

        // Grid line
        const line = psychCreateSVGElement('line', {
            x1: chartLeft, y1: y,
            x2: chartRight, y2: y,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);

        // Left tick mark
        const tickLength = isMajor ? 10 : 5;
        const tick = psychCreateSVGElement('line', {
            x1: chartLeft - tickLength, y1: y,
            x2: chartLeft, y2: y,
            stroke: '#2c3e50',
            'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(tick);

        // Right tick mark
        const rightTick = psychCreateSVGElement('line', {
            x1: chartRight, y1: y,
            x2: chartRight + tickLength, y2: y,
            stroke: '#2c3e50',
            'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(rightTick);

        // Label for major tick marks
        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: chartLeft - 15,
                y: y + 4,
                'text-anchor': 'end',
                'font-size': '11px',
                'font-weight': '600',
                fill: '#2c3e50'
            });
            // Display as lb/lb × 1000 for readability
            label.textContent = (w * 1000).toFixed(0);
            svg.appendChild(label);
        } else {
            // Minor labels (smaller font)
            const minorLabel = psychCreateSVGElement('text', {
                x: chartLeft - 15,
                y: y + 3,
                'text-anchor': 'end',
                'font-size': '8px',
                'font-weight': '400',
                fill: '#95a5a6'
            });
            minorLabel.textContent = (w * 1000).toFixed(0);
            svg.appendChild(minorLabel);
        }
    }
}

function psychDrawDewPointLines(svg) {
    // Dew point temperature lines are horizontal lines (constant humidity ratio)
    // They are labeled on the right side of the chart
    const chartRight = psychChartConfig.width - psychChartConfig.marginRight;

    for (let dp = 35; dp <= 85; dp += 10) {
        // For a given dew point, find the humidity ratio at saturation
        const Pws_dp = psychSaturationPressure(dp);
        const W_dp = 0.621945 * Pws_dp / (psychCurrentPressure - Pws_dp);

        if (W_dp >= psychChartConfig.wMin && W_dp <= psychChartConfig.wMax) {
            const y = psychHumidityToY(W_dp);

            // Note: Dew point lines are the same as humidity ratio grid lines
            // We just add labels on the right side to indicate dew point temperatures
            const label = psychCreateSVGElement('text', {
                x: chartRight + 38,
                y: y + 3,
                class: 'chart-line-label',
                fill: '#e67e22',
                'font-size': '9px',
                'font-weight': '600',
                'text-anchor': 'middle'
            });
            label.textContent = `${dp}°F DP`;
            svg.appendChild(label);
        }
    }

    // Add dew point axis label on the right side
    const dpAxisLabel = psychCreateSVGElement('text', {
        x: chartRight + 38,
        y: psychChartConfig.marginTop - 10,
        'text-anchor': 'middle',
        'font-size': '9px',
        'font-weight': '700',
        fill: '#e67e22'
    });
    dpAxisLabel.textContent = 'DEW POINT';
    svg.appendChild(dpAxisLabel);
}

function psychDrawSaturationCurve(svg) {
    let pathData = 'M';
    let isFirst = true;
    let labelX, labelY;
    let pointCount = 0;

    for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 0.5) {
        const Pws = psychSaturationPressure(t);
        const W_sat = 0.621945 * Pws / (psychCurrentPressure - Pws);
        if (W_sat <= psychChartConfig.wMax && W_sat >= psychChartConfig.wMin) {
            const x = psychTempToX(t);
            const y = psychHumidityToY(W_sat);
            if (isFirst) {
                pathData += `${x},${y}`;
                isFirst = false;
            } else {
                pathData += ` L${x},${y}`;
            }
            // Store a middle point for label placement
            if (pointCount === 60) {
                labelX = x;
                labelY = y;
            }
            pointCount++;
        }
    }
    const path = psychCreateSVGElement('path', {
        d: pathData,
        class: 'chart-saturation-line',
        stroke: '#c0392b',
        'stroke-width': 2.5,
        fill: 'none'
    });
    svg.appendChild(path);

    // Add "100% RH (SATURATION LINE)" label on the saturation line
    if (labelX && labelY) {
        const label = psychCreateSVGElement('text', {
            x: labelX - 10,
            y: labelY - 8,
            class: 'chart-line-label',
            fill: '#c0392b',
            'font-size': '12px',
            'font-weight': '700'
        });
        label.textContent = '100% RH';
        svg.appendChild(label);
    }
}

function psychDrawRelativeHumidityLines(svg) {
    const rhValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    rhValues.forEach(rh => {
        let pathData = 'M';
        let isFirst = true;
        let lastX, lastY;
        let midX, midY;
        let pointCount = 0;

        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 1) {
            const Pws = psychSaturationPressure(t);
            const Pw = (rh / 100) * Pws;
            const W = 0.621945 * Pw / (psychCurrentPressure - Pw);
            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin) {
                const x = psychTempToX(t);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += `${x},${y}`;
                    isFirst = false;
                } else {
                    pathData += ` L${x},${y}`;
                }
                // Store middle point for label
                if (pointCount === 45) {
                    midX = x;
                    midY = y;
                }
                lastX = x;
                lastY = y;
                pointCount++;
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-rh-line',
            stroke: rh === 50 ? '#2471a3' : '#3498db',
            'stroke-width': rh === 50 ? 1.8 : 1.2
        });
        svg.appendChild(path);

        // Add label at the end of the line
        if (lastX && lastY) {
            const label = psychCreateSVGElement('text', {
                x: lastX + 5,
                y: lastY + 1,
                class: 'chart-line-label',
                fill: '#2471a3',
                'font-size': '11px',
                'font-weight': '700'
            });
            label.textContent = `${rh}% RH`;
            svg.appendChild(label);
        }

        // Add additional label in the middle for major RH lines
        if (midX && midY && (rh === 30 || rh === 50 || rh === 70)) {
            const midLabel = psychCreateSVGElement('text', {
                x: midX,
                y: midY - 5,
                class: 'chart-line-label',
                fill: '#2471a3',
                'font-size': '10px',
                'font-weight': '600',
                opacity: 0.8
            });
            midLabel.textContent = `${rh}%`;
            svg.appendChild(midLabel);
        }
    });
}

function psychDrawWetBulbLines(svg) {
    for (let t_wb = 35; t_wb <= 110; t_wb += 5) {
        let pathData = 'M';
        let isFirst = true;
        let labelX, labelY;
        let pointCount = 0;
        for (let t_db = t_wb; t_db <= psychChartConfig.tMax; t_db += 1) {
            const W = psychHumidityRatioFromWB(t_db, t_wb, psychCurrentPressure);
            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin) {
                const x = psychTempToX(t_db);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += `${x},${y}`;
                    isFirst = false;
                } else {
                    pathData += ` L${x},${y}`;
                }
                // Store a point near the saturation line for label placement
                if (pointCount === 5) {
                    labelX = x;
                    labelY = y;
                }
                pointCount++;
            }
        }
        const isMajor = t_wb % 10 === 0;
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-wb-line',
            stroke: '#8e44ad',
            'stroke-width': isMajor ? 1.3 : 0.8,
            opacity: isMajor ? 0.7 : 0.5
        });
        svg.appendChild(path);

        // Add label near the saturation curve for major lines only
        if (labelX && labelY && isMajor) {
            const label = psychCreateSVGElement('text', {
                x: labelX - 18,
                y: labelY - 5,
                class: 'chart-line-label',
                fill: '#8e44ad',
                'font-size': '10px',
                'font-weight': '700'
            });
            label.textContent = `${t_wb}°F WB`;
            svg.appendChild(label);
        }
    }
}

function psychDrawEnthalpyLines(svg) {
    for (let h = 15; h <= 60; h += 5) {
        let pathData = 'M';
        let isFirst = true;
        let firstX, firstY;
        let midX, midY;
        let pointCount = 0;

        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 1) {
            const W = (h - 0.240 * t) / (1061 + 0.444 * t);
            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin && W >= 0) {
                const x = psychTempToX(t);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += `${x},${y}`;
                    firstX = x;
                    firstY = y;
                    isFirst = false;
                } else {
                    pathData += ` L${x},${y}`;
                }
                // Store middle point for additional label
                if (pointCount === 40) {
                    midX = x;
                    midY = y;
                }
                pointCount++;
            }
        }
        const isMajor = h % 10 === 0;
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-enthalpy-line',
            stroke: '#d35400',
            'stroke-width': isMajor ? 1.2 : 0.9,
            'stroke-dasharray': isMajor ? '5,3' : '3,2',
            opacity: isMajor ? 0.8 : 0.6
        });
        svg.appendChild(path);

        // Add label at the top-left of the line for major lines
        if (firstX && firstY && isMajor) {
            const label = psychCreateSVGElement('text', {
                x: firstX - 28,
                y: firstY - 5,
                class: 'chart-line-label',
                fill: '#d35400',
                'font-size': '10px',
                'font-weight': '700',
                transform: `rotate(-30, ${firstX - 28}, ${firstY - 5})`
            });
            label.textContent = `${h} BTU/lb`;
            svg.appendChild(label);
        }

        // Add label in the middle for major enthalpy lines
        if (midX && midY && isMajor) {
            const midLabel = psychCreateSVGElement('text', {
                x: midX + 5,
                y: midY - 3,
                class: 'chart-line-label',
                fill: '#d35400',
                'font-size': '9px',
                'font-weight': '600',
                opacity: 0.7,
                transform: `rotate(-30, ${midX + 5}, ${midY - 3})`
            });
            midLabel.textContent = `${h}`;
            svg.appendChild(midLabel);
        }
    }
}

function psychDrawEnthalpyScale(svg) {
    // Draw enthalpy scale along the top of the chart
    const scaleY = psychChartConfig.marginTop - 30;

    // Draw scale background line
    const scaleLine = psychCreateSVGElement('line', {
        x1: psychChartConfig.marginLeft,
        y1: scaleY,
        x2: psychChartConfig.width - psychChartConfig.marginRight,
        y2: scaleY,
        stroke: '#d35400',
        'stroke-width': 2,
        opacity: 0.3
    });
    svg.appendChild(scaleLine);

    const scaleLabel = psychCreateSVGElement('text', {
        x: psychChartConfig.marginLeft - 20,
        y: scaleY - 10,
        'text-anchor': 'start',
        'font-size': '11px',
        'font-weight': '700',
        fill: '#d35400'
    });
    scaleLabel.textContent = 'ENTHALPY (BTU/lb dry air)';
    svg.appendChild(scaleLabel);

    // Draw scale line and tick marks for enthalpy values
    for (let h = 15; h <= 60; h += 5) {
        // Find where this enthalpy line intersects the top of the chart
        // For a given enthalpy h, solve for T where W is at the top of visible range
        const W = psychChartConfig.wMax;
        const T = (h - W * (1061 + 0.444 * psychChartConfig.tMin)) / (0.240 + 0.444 * W);

        // Find the intersection with the top boundary
        let intersectX = null;
        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 0.5) {
            const w = (h - 0.240 * t) / (1061 + 0.444 * t);
            if (w >= psychChartConfig.wMax - 0.001 && w <= psychChartConfig.wMax + 0.001) {
                intersectX = psychTempToX(t);
                break;
            }
        }

        if (intersectX) {
            const isMajor = h % 10 === 0;
            const tickLength = isMajor ? 8 : 4;

            // Draw tick mark
            const tick = psychCreateSVGElement('line', {
                x1: intersectX,
                y1: scaleY,
                x2: intersectX,
                y2: scaleY + tickLength,
                stroke: '#d35400',
                'stroke-width': isMajor ? 2 : 1
            });
            svg.appendChild(tick);

            // Draw label for major ticks
            if (isMajor) {
                const label = psychCreateSVGElement('text', {
                    x: intersectX,
                    y: scaleY - 3,
                    'text-anchor': 'middle',
                    'font-size': '10px',
                    'font-weight': '600',
                    fill: '#d35400'
                });
                label.textContent = h;
                svg.appendChild(label);
            }
        }
    }
}

function psychDrawSpecificVolumeLines(svg) {
    // Specific volume lines (ft³/lb dry air)
    const volumeValues = [12.5, 13.0, 13.5, 14.0, 14.5, 15.0];
    volumeValues.forEach(v => {
        let pathData = 'M';
        let isFirst = true;
        let labelX, labelY;
        let pointCount = 0;

        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 1) {
            // v = 0.370486 * T_R * (1 + 1.607858 * W) / P
            // Solve for W: W = (v * P / (0.370486 * T_R) - 1) / 1.607858
            const T_R = t + 459.67;
            const W = (v * psychCurrentPressure / (0.370486 * T_R) - 1) / 1.607858;

            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin && W >= 0) {
                const x = psychTempToX(t);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += `${x},${y}`;
                    isFirst = false;
                } else {
                    pathData += ` L${x},${y}`;
                }
                // Store middle point for label
                if (pointCount === 40) {
                    labelX = x;
                    labelY = y;
                }
                pointCount++;
            }
        }

        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-volume-line',
            stroke: '#16a085',
            'stroke-width': 1.0,
            'stroke-dasharray': '5,3',
            fill: 'none',
            opacity: 0.6
        });
        svg.appendChild(path);

        // Add label
        if (labelX && labelY) {
            const label = psychCreateSVGElement('text', {
                x: labelX + 5,
                y: labelY + 3,
                class: 'chart-line-label',
                fill: '#16a085',
                'font-size': '9px',
                'font-weight': '700',
                transform: `rotate(15, ${labelX + 5}, ${labelY + 3})`
            });
            label.textContent = `${v} ft³/lb`;
            svg.appendChild(label);
        }
    });
}

function psychDrawAxes(svg) {
    // Chart Title
    const chartTitle = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2,
        y: 25,
        'text-anchor': 'middle',
        'font-size': '18px',
        'font-weight': '700',
        fill: '#2c3e50'
    });
    chartTitle.textContent = 'PSYCHROMETRIC CHART';
    svg.appendChild(chartTitle);

    // Chart number and elevation info
    const elevationText = psychCurrentPressure === psychPressures.sealevel
        ? 'NORMAL TEMPERATURE - SEA LEVEL (29.921 inHg)'
        : '5000 FT ELEVATION (24.896 inHg)';
    const chartSubtitle = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2,
        y: 45,
        'text-anchor': 'middle',
        'font-size': '13px',
        'font-weight': '600',
        fill: '#34495e'
    });
    chartSubtitle.textContent = elevationText;
    svg.appendChild(chartSubtitle);

    // Barometric pressure display
    const pressureText = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2,
        y: 62,
        'text-anchor': 'middle',
        'font-size': '11px',
        'font-weight': '500',
        fill: '#7f8c8d'
    });
    pressureText.textContent = `Barometric Pressure: ${psychCurrentPressure.toFixed(3)} psia`;
    svg.appendChild(pressureText);

    // X-axis label
    const xLabel = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2,
        y: psychChartConfig.height - 25,
        class: 'chart-axis-label',
        'text-anchor': 'middle',
        'font-size': '15px',
        'font-weight': '700',
        fill: '#2c3e50'
    });
    xLabel.textContent = 'DRY BULB TEMPERATURE (°F)';
    svg.appendChild(xLabel);

    // Y-axis label - CORRECTED to show actual units
    const yLabel = psychCreateSVGElement('text', {
        x: 30,
        y: psychChartConfig.height / 2,
        'text-anchor': 'middle',
        'font-size': '14px',
        'font-weight': '700',
        fill: '#2c3e50',
        transform: `rotate(-90, 30, ${psychChartConfig.height / 2})`
    });
    yLabel.textContent = 'HUMIDITY RATIO (lb water / lb dry air × 1000)';
    svg.appendChild(yLabel);

    // Add chart legend in top-right corner
    const legendX = psychChartConfig.width - psychChartConfig.marginRight - 180;
    const legendY = psychChartConfig.marginTop + 10;

    const legendItems = [
        { color: '#c0392b', text: 'Saturation (100% RH)', dash: false, width: 2.5 },
        { color: '#2471a3', text: 'Relative Humidity (%)', dash: false, width: 1.2 },
        { color: '#8e44ad', text: 'Wet Bulb Temp (°F)', dash: false, width: 1.3 },
        { color: '#d35400', text: 'Enthalpy (BTU/lb)', dash: true, width: 1.2 },
        { color: '#16a085', text: 'Specific Volume (ft³/lb)', dash: true, width: 1.0 },
        { color: '#e67e22', text: 'Dew Point (°F)', dash: false, width: 0.8 }
    ];

    // Legend background
    const legendBg = psychCreateSVGElement('rect', {
        x: legendX - 10,
        y: legendY - 5,
        width: 190,
        height: legendItems.length * 22 + 15,
        fill: 'white',
        stroke: '#bdc3c7',
        'stroke-width': 1.5,
        rx: 5,
        opacity: 0.96
    });
    svg.appendChild(legendBg);

    // Legend title
    const legendTitle = psychCreateSVGElement('text', {
        x: legendX + 85,
        y: legendY + 10,
        class: 'chart-label',
        'text-anchor': 'middle',
        'font-weight': '700',
        'font-size': '12px',
        fill: '#2c3e50'
    });
    legendTitle.textContent = 'CHART LINES';
    svg.appendChild(legendTitle);

    // Legend items
    legendItems.forEach((item, i) => {
        const y = legendY + 28 + i * 22;

        // Line sample
        const line = psychCreateSVGElement('line', {
            x1: legendX,
            y1: y,
            x2: legendX + 25,
            y2: y,
            stroke: item.color,
            'stroke-width': item.width,
            'stroke-dasharray': item.dash ? '4,3' : 'none'
        });
        svg.appendChild(line);

        // Text label
        const text = psychCreateSVGElement('text', {
            x: legendX + 30,
            y: y + 4,
            class: 'chart-label',
            'font-size': '10px',
            'font-weight': '600',
            fill: item.color
        });
        text.textContent = item.text;
        svg.appendChild(text);
    });
}

// ============================================
// POINT MANAGEMENT
// ============================================

function psychHandleChartClick(evt) {
    if (psychInputMode !== 'click') return;
    if (psychPoints.length >= psychMaxPoints) {
        alert(`Maximum of ${psychMaxPoints} points reached`);
        return;
    }
    
    const svg = document.getElementById('psychChart');
    const rect = svg.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    
    const T_db = psychXToTemp(x);
    const W = psychYToHumidity(y);
    
    if (T_db < psychChartConfig.tMin || T_db > psychChartConfig.tMax || 
        W < psychChartConfig.wMin || W > psychChartConfig.wMax) {
        return;
    }
    
    const props = psychCalculateProperties(T_db, W, psychCurrentPressure);
    
    // FIXED: Use spread operator correctly
    const point = {
        id: Date.now(),
        label: String.fromCharCode(65 + psychPoints.length),
        color: psychPointColors[psychPoints.length % psychPointColors.length],
        ...props  // Spread operator to copy all properties
    };
    
    psychPoints.push(point);
    psychUpdateDisplay();
}

function addManualPoint() {
    if (psychSelectedVariables.length !== 2) {
        alert('Please select exactly two variables');
        return;
    }
    if (psychPoints.length >= psychMaxPoints) {
        alert(`Maximum of ${psychMaxPoints} points reached`);
        return;
    }
    
    const var1Value = parseFloat(document.getElementById('manualVar1').value);
    const var2Value = parseFloat(document.getElementById('manualVar2').value);
    const label = document.getElementById('pointLabel').value || String.fromCharCode(65 + psychPoints.length);
    
    if (isNaN(var1Value) || isNaN(var2Value)) {
        alert('Please enter valid numbers for both variables');
        return;
    }
    
    try {
        const props = psychCalculateFromTwoVariables(
            psychSelectedVariables[0], var1Value,
            psychSelectedVariables[1], var2Value,
            psychCurrentPressure
        );
        
        // FIXED: Use spread operator correctly
        const point = {
            id: Date.now(),
            label: label.substring(0, 3),
            color: psychPointColors[psychPoints.length % psychPointColors.length],
            ...props  // Spread operator to copy all properties
        };
        
        psychPoints.push(point);
        document.getElementById('manualVar1').value = '';
        document.getElementById('manualVar2').value = '';
        document.getElementById('pointLabel').value = '';
        psychUpdateDisplay();
    } catch (error) {
        alert('Error calculating properties: ' + error.message);
    }
}

function deletePoint(id) {
    psychPoints = psychPoints.filter(p => p.id !== id);
    psychUpdateDisplay();
}

function clearAllPoints() {
    if (psychPoints.length === 0) return;
    if (confirm('Clear all points?')) {
        psychPoints = [];
        psychUpdateDisplay();
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function switchElevation() {
    psychCurrentElevation = document.getElementById('elevationSelect').value;
    psychCurrentPressure = psychCurrentElevation === 'sealevel' ? 14.696 : 12.228;
    psychPoints.forEach(point => {
        const newProps = psychCalculateProperties(point.dryBulb, point.humidityRatio, psychCurrentPressure);
        Object.assign(point, newProps);
    });
    psychUpdateDisplay();
}

function switchInputMode() {
    psychInputMode = document.getElementById('inputMode').value;
    const manualPanel = document.getElementById('manualInputPanel');
    if (manualPanel) {
        manualPanel.style.display = psychInputMode === 'manual' ? 'block' : 'none';
    }
}

function toggleConnectMode() {
    psychConnectMode = !psychConnectMode;
    const modeText = document.getElementById('connectModeText');
    if (modeText) {
        modeText.textContent = psychConnectMode ? 'Connect Mode: ON' : 'Connect Mode: OFF';
    }
    psychUpdateDisplay();
}

function selectVariable(checkbox) {
    const checkboxes = document.querySelectorAll('.variable-checkboxes input[type="checkbox"]');
    if (checkbox.checked) {
        if (psychSelectedVariables.length >= 2) {
            checkbox.checked = false;
            alert('You can only select 2 variables');
            return;
        }
        psychSelectedVariables.push(checkbox.value);
    } else {
        psychSelectedVariables = psychSelectedVariables.filter(v => v !== checkbox.value);
    }
    psychUpdateManualInputFields();
}

function psychUpdateManualInputFields() {
    const var1Input = document.getElementById('manualVar1');
    const var2Input = document.getElementById('manualVar2');
    const var1Label = document.getElementById('var1Label');
    const var2Label = document.getElementById('var2Label');
    
    if (!var1Input || !var2Input) return;
    
    const labels = {
        db: 'Dry Bulb (°F)', wb: 'Wet Bulb (°F)', rh: 'Relative Humidity (%)',
        dp: 'Dew Point (°F)', w: 'Humidity Ratio (lb/lb)', h: 'Enthalpy (BTU/lb)'
    };
    
    if (psychSelectedVariables.length >= 1) {
        var1Input.disabled = false;
        var1Label.textContent = labels[psychSelectedVariables[0]];
    } else {
        var1Input.disabled = true;
        var1Input.value = '';
        var1Label.textContent = '-';
    }
    
    if (psychSelectedVariables.length >= 2) {
        var2Input.disabled = false;
        var2Label.textContent = labels[psychSelectedVariables[1]];
    } else {
        var2Input.disabled = true;
        var2Input.value = '';
        var2Label.textContent = '-';
    }
}

function psychUpdateDisplay() {
    psychDrawChart();
    psychUpdateResultsTable();
    psychUpdatePointsList();
}

function psychDrawPoints(svg) {
    psychPoints.forEach(point => {
        const x = psychTempToX(point.dryBulb);
        const y = psychHumidityToY(point.humidityRatio);
        const group = psychCreateSVGElement('g', { class: 'chart-point' });
        const circle = psychCreateSVGElement('circle', {
            cx: x, cy: y, r: 8, fill: point.color, class: 'chart-point-circle'
        });
        const text = psychCreateSVGElement('text', {
            x: x, y: y, class: 'chart-point-label'
        });
        text.textContent = point.label;
        group.appendChild(circle);
        group.appendChild(text);
        svg.appendChild(group);
    });
}

function psychDrawConnections(svg) {
    if (!psychConnectMode || psychPoints.length < 2) return;
    for (let i = 0; i < psychPoints.length - 1; i++) {
        const p1 = psychPoints[i];
        const p2 = psychPoints[i + 1];
        const x1 = psychTempToX(p1.dryBulb);
        const y1 = psychHumidityToY(p1.humidityRatio);
        const x2 = psychTempToX(p2.dryBulb);
        const y2 = psychHumidityToY(p2.humidityRatio);
        const line = psychCreateSVGElement('line', {
            x1: x1, y1: y1, x2: x2, y2: y2, stroke: p1.color, class: 'chart-connection-line'
        });
        svg.appendChild(line);
    }
}

function psychUpdateResultsTable() {
    const container = document.getElementById('resultsTable');
    if (!container) return;
    
    if (psychPoints.length === 0) {
        container.innerHTML = '<p class="info-text">Click on the chart or use manual entry to add points. Up to 12 points can be added.</p>';
        return;
    }
    
    let html = '<table><thead><tr>';
    html += '<th>Point</th><th>DB (°F)</th><th>WB (°F)</th><th>DP (°F)</th>';
    html += '<th>RH (%)</th><th>W (lb/lb)</th><th>h (BTU/lb)</th>';
    html += '<th>v (ft³/lb)</th><th>Pv (psia)</th>';
    html += '</tr></thead><tbody>';
    
    psychPoints.forEach(point => {
        html += '<tr>';
        html += `<td><span class="point-color-indicator" style="background: ${point.color}"></span> ${point.label}</td>`;
        html += `<td>${point.dryBulb.toFixed(1)}</td>`;
        html += `<td>${point.wetBulb.toFixed(1)}</td>`;
        html += `<td>${point.dewPoint.toFixed(1)}</td>`;
        html += `<td>${point.relativeHumidity.toFixed(1)}</td>`;
        html += `<td>${point.humidityRatio.toFixed(5)}</td>`;
        html += `<td>${point.enthalpy.toFixed(2)}</td>`;
        html += `<td>${point.specificVolume.toFixed(3)}</td>`;
        html += `<td>${point.vaporPressure.toFixed(4)}</td>`;
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function psychUpdatePointsList() {
    const container = document.getElementById('pointsList');
    const countElem = document.getElementById('pointCount');
    if (!container) return;
    if (countElem) countElem.textContent = psychPoints.length;
    
    if (psychPoints.length === 0) {
        container.innerHTML = '<p class="info-text">No points added yet</p>';
        return;
    }
    
    let html = '';
    psychPoints.forEach(point => {
        html += `<div class="point-card" style="border-left-color: ${point.color}">`;
        html += `<div class="point-card-info">`;
        html += `<div class="point-card-color" style="background: ${point.color}"></div>`;
        html += `<span class="point-card-label">${point.label}</span>`;
        html += `</div>`;
        html += `<div class="point-card-actions">`;
        html += `<button class="point-action-btn point-delete-btn" onclick="deletePoint(${point.id})" title="Delete">🗑️</button>`;
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

function exportData() {
    if (psychPoints.length === 0) {
        alert('No points to export');
        return;
    }
    
    // CSV with consistent units (lb/lb for humidity ratio, psia for pressure)
    let csv = 'Point,DB(F),WB(F),DP(F),RH(%),W(lb/lb),h(BTU/lb),v(ft3/lb),Pv(psia)\n';
    psychPoints.forEach(point => {
        csv += `${point.label},${point.dryBulb.toFixed(2)},${point.wetBulb.toFixed(2)},`;
        csv += `${point.dewPoint.toFixed(2)},${point.relativeHumidity.toFixed(2)},`;
        csv += `${point.humidityRatio.toFixed(6)},${point.enthalpy.toFixed(3)},`;
        csv += `${point.specificVolume.toFixed(4)},${point.vaporPressure.toFixed(5)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psychrometric_data_${Date.now()}.csv`;
    a.click();
}

// ============================================
// COORDINATE CONVERSION
// ============================================

function psychTempToX(t) {
    const chartWidth = psychChartConfig.width - psychChartConfig.marginLeft - psychChartConfig.marginRight;
    return psychChartConfig.marginLeft + 
           ((t - psychChartConfig.tMin) / (psychChartConfig.tMax - psychChartConfig.tMin)) * chartWidth;
}

function psychXToTemp(x) {
    const chartWidth = psychChartConfig.width - psychChartConfig.marginLeft - psychChartConfig.marginRight;
    return psychChartConfig.tMin + 
           ((x - psychChartConfig.marginLeft) / chartWidth) * (psychChartConfig.tMax - psychChartConfig.tMin);
}

function psychHumidityToY(w) {
    const chartHeight = psychChartConfig.height - psychChartConfig.marginTop - psychChartConfig.marginBottom;
    return psychChartConfig.height - psychChartConfig.marginBottom - 
           ((w - psychChartConfig.wMin) / (psychChartConfig.wMax - psychChartConfig.wMin)) * chartHeight;
}

function psychYToHumidity(y) {
    const chartHeight = psychChartConfig.height - psychChartConfig.marginTop - psychChartConfig.marginBottom;
    return psychChartConfig.wMin + 
           ((psychChartConfig.height - psychChartConfig.marginBottom - y) / chartHeight) * 
           (psychChartConfig.wMax - psychChartConfig.wMin);
}

function psychCreateSVGElement(type, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

// ============================================
// INITIALIZATION PSYCHROMETRICS
// ============================================

// Initialize psychrometric chart after templates load
function initializePsychrometricChart() {
    const svg = document.getElementById('psychChart');
    if (svg) {
        psychDrawChart();
        svg.addEventListener('click', psychHandleChartClick);
    }
}

// Self-initialization (with delay to ensure DOM is fully rendered)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializePsychrometricChart, 500);
});
