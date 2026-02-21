// ============================================
// PSYCHROMETRIC CHART CALCULATOR
// Based on ASHRAE Fundamentals
// Standalone module - include this file on any page with the psychrometric chart
// ============================================

// ====== 1. GLOBAL STATE ======
let psychCurrentElevation = 'sealevel';
let psychCurrentPressure = 14.696; // psia
let psychInputMode = 'click';
let psychConnectMode = false;
let psychPoints = []; // Array of point objects
let psychSelectedVariables = [];
let psychMaxPoints = 12;
let psychShowComfortZone = false;
let psychHoverEnabled = true;
let psychLastHoverPoint = null;

// Elevation/pressure lookup
const psychPressures = {
    sealevel: 14.696,
    '1000ft': 14.175,
    '2500ft': 13.417,
    '5000ft': 12.228,
    '7500ft': 11.118
};

const psychElevationLabels = {
    sealevel: 'Sea Level (29.921 inHg)',
    '1000ft': '1,000 ft (28.856 inHg)',
    '2500ft': '2,500 ft (27.315 inHg)',
    '5000ft': '5,000 ft (24.896 inHg)',
    '7500ft': '7,500 ft (22.653 inHg)'
};

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
    marginTop: 120,
    marginBottom: 80,
    tMin: 30,
    tMax: 120,
    wMin: 0,
    wMax: 0.030
};

// ASHRAE 55 comfort zone boundaries (simplified for standard office conditions)
const psychComfortZone = {
    summer: [
        { db: 74.5, rh: 80 },
        { db: 80.5, rh: 55 },
        { db: 82, rh: 20 },
        { db: 75.5, rh: 20 },
        { db: 74.5, rh: 80 }
    ],
    winter: [
        { db: 67, rh: 80 },
        { db: 74.5, rh: 60 },
        { db: 76, rh: 20 },
        { db: 68.5, rh: 20 },
        { db: 67, rh: 80 }
    ]
};

// ====== 2. PSYCHROMETRIC CALCULATIONS (ASHRAE) ======

function psychSaturationPressure(T) {
    const C1 = -1.0440397E+04;
    const C2 = -1.1294650E+01;
    const C3 = -2.7022355E-02;
    const C4 = 1.2890360E-05;
    const C5 = -2.4780681E-09;
    const C6 = 6.5459673E+00;

    const T_R = T + 459.67;
    const lnPws = C1/T_R + C2 + C3*T_R + C4*T_R*T_R + C5*T_R*T_R*T_R + C6*Math.log(T_R);
    const Pws = Math.exp(lnPws);

    return Math.min(Pws, psychCurrentPressure * 0.999);
}

function psychHumidityRatioFromWB(T_db, T_wb, P) {
    const Pws_wb = psychSaturationPressure(T_wb);
    const Ws_wb = 0.621945 * Pws_wb / (P - Pws_wb);

    const W = ((1093 - 0.556 * T_wb) * Ws_wb - 0.240 * (T_db - T_wb)) /
              (1093 + 0.444 * T_db - T_wb);

    return Math.max(0, W);
}

function psychCalculateProperties(T_db, W, P) {
    const properties = {};
    properties.dryBulb = T_db;
    properties.humidityRatio = W;

    properties.vaporPressure = (P * W) / (0.621945 + W);

    const Pw = properties.vaporPressure;
    if (Pw > 1e-6) {
        const C14 = 6.54;
        const C15 = 14.526;
        const C16 = 0.7389;
        const C17 = 0.09486;
        const C18 = 0.4569;

        const alpha = Math.log(Pw);
        properties.dewPoint = C14 + C15*alpha + C16*alpha*alpha +
                             C17*Math.pow(alpha, 3) + C18*Math.pow(Pw, 0.1984);

        properties.dewPoint = Math.max(-100, Math.min(T_db, properties.dewPoint));
    } else {
        properties.dewPoint = -100;
    }

    const Pws = psychSaturationPressure(T_db);
    properties.relativeHumidity = Math.min(100, Math.max(0, (Pw / Pws) * 100));

    properties.enthalpy = 0.240 * T_db + W * (1061 + 0.444 * T_db);

    const T_R = T_db + 459.67;
    properties.specificVolume = 0.370486 * T_R * (1 + 1.607858 * W) / P;

    properties.wetBulb = psychApproximateWetBulb(T_db, W, P);

    return properties;
}

function psychApproximateWetBulb(T_db, W_target, P) {
    let T_wb_low = -50;
    let T_wb_high = T_db;
    let T_wb_mid = T_db;

    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
        T_wb_mid = (T_wb_low + T_wb_high) / 2;
        const W_calc = psychHumidityRatioFromWB(T_db, T_wb_mid, P);
        const error = W_calc - W_target;

        if (Math.abs(error) < 0.001 * W_target || Math.abs(T_wb_high - T_wb_low) < 0.01) {
            break;
        }

        if (error > 0) {
            T_wb_high = T_wb_mid;
        } else {
            T_wb_low = T_wb_mid;
        }
    }

    return T_wb_mid;
}

function psychCalculateFromTwoVariables(var1Type, var1Value, var2Type, var2Value, P) {
    let T_db, W;

    if (var1Type === 'db') {
        T_db = var1Value;
        W = psychGetWFromSecondVariable(T_db, var2Type, var2Value, P);
    } else if (var2Type === 'db') {
        T_db = var2Value;
        W = psychGetWFromSecondVariable(T_db, var1Type, var1Value, P);
    } else {
        const result = psychSolveForDbAndW(var1Type, var1Value, var2Type, var2Value, P);
        T_db = result.T_db;
        W = result.W;
    }

    return psychCalculateProperties(T_db, W, P);
}

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
            return (varValue - 0.240 * T_db) / (1061 + 0.444 * T_db);
        default:
            return 0;
    }
}

function psychSolveForDbAndW(var1Type, var1Value, var2Type, var2Value, P) {
    let T_low = psychChartConfig.tMin;
    let T_high = psychChartConfig.tMax;
    let T_mid = 70;

    for (let i = 0; i < 50; i++) {
        T_mid = (T_low + T_high) / 2;
        const W1 = psychGetWFromSecondVariable(T_mid, var1Type, var1Value, P);
        const W2 = psychGetWFromSecondVariable(T_mid, var2Type, var2Value, P);

        const error = W1 - W2;
        if (Math.abs(error) < 0.00001) {
            return { T_db: T_mid, W: W1 };
        }

        if (error > 0) {
            T_high = T_mid;
        } else {
            T_low = T_mid;
        }

        if (Math.abs(T_high - T_low) < 0.01) break;
    }

    const W = psychGetWFromSecondVariable(T_mid, var1Type, var1Value, P);
    return { T_db: T_mid, W };
}

// ====== 3. PROCESS ANALYSIS ======

function psychCalculateProcess(point1, point2) {
    const process = {};
    process.deltaDryBulb = point2.dryBulb - point1.dryBulb;
    process.deltaWetBulb = point2.wetBulb - point1.wetBulb;
    process.deltaHumidityRatio = point2.humidityRatio - point1.humidityRatio;
    process.deltaEnthalpy = point2.enthalpy - point1.enthalpy;
    process.deltaRH = point2.relativeHumidity - point1.relativeHumidity;

    // Sensible heat factor (SHF)
    const sensibleHeat = 0.240 * (point2.dryBulb - point1.dryBulb);
    const totalHeat = point2.enthalpy - point1.enthalpy;
    if (Math.abs(totalHeat) > 0.001) {
        process.SHR = sensibleHeat / totalHeat;
    } else {
        process.SHR = null;
    }

    // Airflow calculations (per 1000 CFM at standard air density 0.075 lb/ft³)
    // Q_sensible = 1.08 × CFM × ΔT (BTU/hr)
    // Q_latent = 0.68 × CFM × Δw × 7000 (BTU/hr, w in gr/lb)
    // Q_total = 4.5 × CFM × Δh (BTU/hr)
    process.sensibleBTUperCFM = 1.08 * Math.abs(point2.dryBulb - point1.dryBulb);
    process.latentBTUperCFM = 0.68 * Math.abs(point2.humidityRatio - point1.humidityRatio) * 7000;
    process.totalBTUperCFM = 4.5 * Math.abs(point2.enthalpy - point1.enthalpy);

    // Tons per 1000 CFM
    process.tonsPerKCFM = process.totalBTUperCFM / 12;

    // Determine process type
    if (Math.abs(process.deltaHumidityRatio) < 0.0001) {
        process.type = 'Sensible ' + (process.deltaDryBulb > 0 ? 'Heating' : 'Cooling');
    } else if (Math.abs(process.deltaDryBulb) < 0.5) {
        process.type = process.deltaHumidityRatio > 0 ? 'Humidification' : 'Dehumidification';
    } else if (process.deltaDryBulb > 0 && process.deltaHumidityRatio > 0) {
        process.type = 'Heating & Humidification';
    } else if (process.deltaDryBulb < 0 && process.deltaHumidityRatio < 0) {
        process.type = 'Cooling & Dehumidification';
    } else if (process.deltaDryBulb > 0 && process.deltaHumidityRatio < 0) {
        process.type = 'Heating & Dehumidification';
    } else {
        process.type = 'Evaporative Cooling';
    }

    return process;
}

// ====== 4. CHART DRAWING ======

function psychDrawChart() {
    const svg = document.getElementById('psychChart');
    if (!svg) return;
    svg.innerHTML = '';

    // Background gradient
    const defs = psychCreateSVGElement('defs', {});
    const gradient = psychCreateSVGElement('linearGradient', {
        id: 'chartBg', x1: '0%', y1: '0%', x2: '100%', y2: '100%'
    });
    const stop1 = psychCreateSVGElement('stop', { offset: '0%', style: 'stop-color:#f8fbfd;stop-opacity:1' });
    const stop2 = psychCreateSVGElement('stop', { offset: '100%', style: 'stop-color:#e8f4f8;stop-opacity:1' });
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);

    // Comfort zone gradient
    const comfortGrad = psychCreateSVGElement('linearGradient', {
        id: 'comfortZoneFill', x1: '0%', y1: '0%', x2: '100%', y2: '100%'
    });
    const cs1 = psychCreateSVGElement('stop', { offset: '0%', style: 'stop-color:#27ae60;stop-opacity:0.12' });
    const cs2 = psychCreateSVGElement('stop', { offset: '100%', style: 'stop-color:#2ecc71;stop-opacity:0.08' });
    comfortGrad.appendChild(cs1);
    comfortGrad.appendChild(cs2);
    defs.appendChild(comfortGrad);

    svg.appendChild(defs);

    const bg = psychCreateSVGElement('rect', {
        width: psychChartConfig.width, height: psychChartConfig.height, fill: 'url(#chartBg)'
    });
    svg.appendChild(bg);

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

    if (psychShowComfortZone) {
        psychDrawComfortZone(svg);
    }

    psychDrawSaturationCurve(svg);
    psychDrawAxes(svg);
    psychDrawEnthalpyScale(svg);
    psychDrawConnections(svg);
    psychDrawPoints(svg);

    // Hover crosshair group (rendered last so it's on top)
    const hoverGroup = psychCreateSVGElement('g', { id: 'psychHoverGroup', style: 'display:none' });
    svg.appendChild(hoverGroup);
}

function psychDrawTemperatureGrid(svg) {
    const chartBottom = psychChartConfig.height - psychChartConfig.marginBottom;
    const chartTop = psychChartConfig.marginTop;

    for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 5) {
        const x = psychTempToX(t);
        const isMajor = t % 10 === 0;

        const line = psychCreateSVGElement('line', {
            x1: x, y1: chartTop, x2: x, y2: chartBottom,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);

        const tickLength = isMajor ? 10 : 5;
        const tick = psychCreateSVGElement('line', {
            x1: x, y1: chartBottom, x2: x, y2: chartBottom + tickLength,
            stroke: '#2c3e50', 'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(tick);

        const topTick = psychCreateSVGElement('line', {
            x1: x, y1: chartTop, x2: x, y2: chartTop - tickLength,
            stroke: '#2c3e50', 'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(topTick);

        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: x, y: chartBottom + 25,
                'text-anchor': 'middle', 'font-size': '12px', 'font-weight': '600', fill: '#2c3e50'
            });
            label.textContent = t;
            svg.appendChild(label);
        } else {
            const minorLabel = psychCreateSVGElement('text', {
                x: x, y: chartBottom + 18,
                'text-anchor': 'middle', 'font-size': '9px', 'font-weight': '400', fill: '#7f8c8d'
            });
            minorLabel.textContent = t;
            svg.appendChild(minorLabel);
        }
    }
}

function psychDrawHumidityGrid(svg) {
    const chartLeft = psychChartConfig.marginLeft;
    const chartRight = psychChartConfig.width - psychChartConfig.marginRight;

    for (let w = 0; w <= psychChartConfig.wMax; w += 0.002) {
        const y = psychHumidityToY(w);
        const isMajor = (w * 1000) % 4 === 0;

        const line = psychCreateSVGElement('line', {
            x1: chartLeft, y1: y, x2: chartRight, y2: y,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);

        const tickLength = isMajor ? 10 : 5;
        const tick = psychCreateSVGElement('line', {
            x1: chartLeft - tickLength, y1: y, x2: chartLeft, y2: y,
            stroke: '#2c3e50', 'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(tick);

        const rightTick = psychCreateSVGElement('line', {
            x1: chartRight, y1: y, x2: chartRight + tickLength, y2: y,
            stroke: '#2c3e50', 'stroke-width': isMajor ? 2 : 1
        });
        svg.appendChild(rightTick);

        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: chartLeft - 15, y: y + 4,
                'text-anchor': 'end', 'font-size': '11px', 'font-weight': '600', fill: '#2c3e50'
            });
            label.textContent = (w * 1000).toFixed(0);
            svg.appendChild(label);
        } else {
            const minorLabel = psychCreateSVGElement('text', {
                x: chartLeft - 15, y: y + 3,
                'text-anchor': 'end', 'font-size': '8px', 'font-weight': '400', fill: '#95a5a6'
            });
            minorLabel.textContent = (w * 1000).toFixed(0);
            svg.appendChild(minorLabel);
        }
    }
}

function psychDrawDewPointLines(svg) {
    const chartRight = psychChartConfig.width - psychChartConfig.marginRight;

    for (let dp = 35; dp <= 85; dp += 10) {
        const Pws_dp = psychSaturationPressure(dp);
        const W_dp = 0.621945 * Pws_dp / (psychCurrentPressure - Pws_dp);

        if (W_dp >= psychChartConfig.wMin && W_dp <= psychChartConfig.wMax) {
            const y = psychHumidityToY(W_dp);
            const label = psychCreateSVGElement('text', {
                x: chartRight + 38, y: y + 3,
                class: 'chart-line-label', fill: '#e67e22',
                'font-size': '9px', 'font-weight': '600', 'text-anchor': 'middle'
            });
            label.textContent = dp + '\u00B0F DP';
            svg.appendChild(label);
        }
    }

    const dpAxisLabel = psychCreateSVGElement('text', {
        x: chartRight + 38, y: psychChartConfig.marginTop - 10,
        'text-anchor': 'middle', 'font-size': '9px', 'font-weight': '700', fill: '#e67e22'
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
                pathData += x + ',' + y;
                isFirst = false;
            } else {
                pathData += ' L' + x + ',' + y;
            }
            if (pointCount === 60) { labelX = x; labelY = y; }
            pointCount++;
        }
    }
    const path = psychCreateSVGElement('path', {
        d: pathData, class: 'chart-saturation-line',
        stroke: '#c0392b', 'stroke-width': 2.5, fill: 'none'
    });
    svg.appendChild(path);

    if (labelX && labelY) {
        const label = psychCreateSVGElement('text', {
            x: labelX - 10, y: labelY - 8,
            class: 'chart-line-label', fill: '#c0392b', 'font-size': '12px', 'font-weight': '700'
        });
        label.textContent = '100% RH';
        svg.appendChild(label);
    }
}

function psychDrawRelativeHumidityLines(svg) {
    const rhValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    rhValues.forEach(function(rh) {
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
                    pathData += x + ',' + y;
                    isFirst = false;
                } else {
                    pathData += ' L' + x + ',' + y;
                }
                if (pointCount === 45) { midX = x; midY = y; }
                lastX = x;
                lastY = y;
                pointCount++;
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData, class: 'chart-rh-line',
            stroke: rh === 50 ? '#2471a3' : '#3498db',
            'stroke-width': rh === 50 ? 1.8 : 1.2
        });
        svg.appendChild(path);

        if (lastX && lastY) {
            const label = psychCreateSVGElement('text', {
                x: lastX + 5, y: lastY + 1,
                class: 'chart-line-label', fill: '#2471a3', 'font-size': '11px', 'font-weight': '700'
            });
            label.textContent = rh + '% RH';
            svg.appendChild(label);
        }

        if (midX && midY && (rh === 30 || rh === 50 || rh === 70)) {
            const midLabel = psychCreateSVGElement('text', {
                x: midX, y: midY - 5,
                class: 'chart-line-label', fill: '#2471a3', 'font-size': '10px', 'font-weight': '600', opacity: 0.8
            });
            midLabel.textContent = rh + '%';
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
                    pathData += x + ',' + y;
                    isFirst = false;
                } else {
                    pathData += ' L' + x + ',' + y;
                }
                if (pointCount === 5) { labelX = x; labelY = y; }
                pointCount++;
            }
        }
        const isMajor = t_wb % 10 === 0;
        const path = psychCreateSVGElement('path', {
            d: pathData, class: 'chart-wb-line',
            stroke: '#8e44ad', 'stroke-width': isMajor ? 1.3 : 0.8,
            opacity: isMajor ? 0.7 : 0.5
        });
        svg.appendChild(path);

        if (labelX && labelY && isMajor) {
            const label = psychCreateSVGElement('text', {
                x: labelX - 18, y: labelY - 5,
                class: 'chart-line-label', fill: '#8e44ad', 'font-size': '10px', 'font-weight': '700'
            });
            label.textContent = t_wb + '\u00B0F WB';
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
                    pathData += x + ',' + y;
                    firstX = x; firstY = y;
                    isFirst = false;
                } else {
                    pathData += ' L' + x + ',' + y;
                }
                if (pointCount === 40) { midX = x; midY = y; }
                pointCount++;
            }
        }
        const isMajor = h % 10 === 0;
        const path = psychCreateSVGElement('path', {
            d: pathData, class: 'chart-enthalpy-line',
            stroke: '#d35400', 'stroke-width': isMajor ? 1.2 : 0.9,
            'stroke-dasharray': isMajor ? '5,3' : '3,2',
            opacity: isMajor ? 0.8 : 0.6
        });
        svg.appendChild(path);

        if (firstX && firstY && isMajor) {
            const label = psychCreateSVGElement('text', {
                x: firstX - 28, y: firstY - 5,
                class: 'chart-line-label', fill: '#d35400', 'font-size': '10px', 'font-weight': '700',
                transform: 'rotate(-30, ' + (firstX - 28) + ', ' + (firstY - 5) + ')'
            });
            label.textContent = h + ' BTU/lb';
            svg.appendChild(label);
        }

        if (midX && midY && isMajor) {
            const midLabel = psychCreateSVGElement('text', {
                x: midX + 5, y: midY - 3,
                class: 'chart-line-label', fill: '#d35400', 'font-size': '9px', 'font-weight': '600', opacity: 0.7,
                transform: 'rotate(-30, ' + (midX + 5) + ', ' + (midY - 3) + ')'
            });
            midLabel.textContent = '' + h;
            svg.appendChild(midLabel);
        }
    }
}

function psychDrawEnthalpyScale(svg) {
    const scaleY = psychChartConfig.marginTop - 30;

    const scaleLine = psychCreateSVGElement('line', {
        x1: psychChartConfig.marginLeft, y1: scaleY,
        x2: psychChartConfig.width - psychChartConfig.marginRight, y2: scaleY,
        stroke: '#d35400', 'stroke-width': 2, opacity: 0.3
    });
    svg.appendChild(scaleLine);

    const scaleLabel = psychCreateSVGElement('text', {
        x: psychChartConfig.marginLeft - 20, y: scaleY - 10,
        'text-anchor': 'start', 'font-size': '11px', 'font-weight': '700', fill: '#d35400'
    });
    scaleLabel.textContent = 'ENTHALPY (BTU/lb dry air)';
    svg.appendChild(scaleLabel);

    for (let h = 15; h <= 60; h += 5) {
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

            const tick = psychCreateSVGElement('line', {
                x1: intersectX, y1: scaleY, x2: intersectX, y2: scaleY + tickLength,
                stroke: '#d35400', 'stroke-width': isMajor ? 2 : 1
            });
            svg.appendChild(tick);

            if (isMajor) {
                const label = psychCreateSVGElement('text', {
                    x: intersectX, y: scaleY - 3,
                    'text-anchor': 'middle', 'font-size': '10px', 'font-weight': '600', fill: '#d35400'
                });
                label.textContent = h;
                svg.appendChild(label);
            }
        }
    }
}

function psychDrawSpecificVolumeLines(svg) {
    var volumeValues = [12.5, 13.0, 13.5, 14.0, 14.5, 15.0];
    volumeValues.forEach(function(v) {
        let pathData = 'M';
        let isFirst = true;
        let labelX, labelY;
        let pointCount = 0;

        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 1) {
            const T_R = t + 459.67;
            const W = (v * psychCurrentPressure / (0.370486 * T_R) - 1) / 1.607858;

            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin && W >= 0) {
                const x = psychTempToX(t);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += x + ',' + y;
                    isFirst = false;
                } else {
                    pathData += ' L' + x + ',' + y;
                }
                if (pointCount === 40) { labelX = x; labelY = y; }
                pointCount++;
            }
        }

        const path = psychCreateSVGElement('path', {
            d: pathData, class: 'chart-volume-line',
            stroke: '#16a085', 'stroke-width': 1.0,
            'stroke-dasharray': '5,3', fill: 'none', opacity: 0.6
        });
        svg.appendChild(path);

        if (labelX && labelY) {
            const label = psychCreateSVGElement('text', {
                x: labelX + 5, y: labelY + 3,
                class: 'chart-line-label', fill: '#16a085', 'font-size': '9px', 'font-weight': '700',
                transform: 'rotate(15, ' + (labelX + 5) + ', ' + (labelY + 3) + ')'
            });
            label.textContent = v + ' ft\u00B3/lb';
            svg.appendChild(label);
        }
    });
}

function psychDrawComfortZone(svg) {
    // Draw ASHRAE 55 comfort zones
    function drawZone(zone, label, color) {
        let pathData = 'M';
        let isFirst = true;
        zone.forEach(function(pt) {
            const Pws = psychSaturationPressure(pt.db);
            const Pw = (pt.rh / 100) * Pws;
            const W = 0.621945 * Pw / (psychCurrentPressure - Pw);
            const x = psychTempToX(pt.db);
            const y = psychHumidityToY(W);
            if (isFirst) {
                pathData += x + ',' + y;
                isFirst = false;
            } else {
                pathData += ' L' + x + ',' + y;
            }
        });
        pathData += ' Z';

        const fill = psychCreateSVGElement('path', {
            d: pathData, fill: 'url(#comfortZoneFill)', stroke: color,
            'stroke-width': 2, 'stroke-dasharray': '6,3', opacity: 0.9
        });
        svg.appendChild(fill);

        // Label
        const centerDb = zone.reduce(function(s, p) { return s + p.db; }, 0) / zone.length;
        const centerRh = zone.reduce(function(s, p) { return s + p.rh; }, 0) / zone.length;
        const Pws_c = psychSaturationPressure(centerDb);
        const Pw_c = (centerRh / 100) * Pws_c;
        const W_c = 0.621945 * Pw_c / (psychCurrentPressure - Pw_c);
        const lx = psychTempToX(centerDb);
        const ly = psychHumidityToY(W_c);

        const text = psychCreateSVGElement('text', {
            x: lx, y: ly,
            'text-anchor': 'middle', 'font-size': '10px', 'font-weight': '700',
            fill: color, class: 'chart-line-label'
        });
        text.textContent = label;
        svg.appendChild(text);
    }

    drawZone(psychComfortZone.winter, 'Winter Comfort', '#2980b9');
    drawZone(psychComfortZone.summer, 'Summer Comfort', '#e67e22');
}

function psychDrawAxes(svg) {
    const chartTitle = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2, y: 25,
        'text-anchor': 'middle', 'font-size': '18px', 'font-weight': '700', fill: '#2c3e50'
    });
    chartTitle.textContent = 'ASHRAE PSYCHROMETRIC CHART';
    svg.appendChild(chartTitle);

    const elevLabel = psychElevationLabels[psychCurrentElevation] || psychCurrentElevation;
    const elevationText = 'NORMAL TEMPERATURE \u2014 ' + elevLabel.toUpperCase();
    const chartSubtitle = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2, y: 45,
        'text-anchor': 'middle', 'font-size': '13px', 'font-weight': '600', fill: '#34495e'
    });
    chartSubtitle.textContent = elevationText;
    svg.appendChild(chartSubtitle);

    const pressureText = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2, y: 62,
        'text-anchor': 'middle', 'font-size': '11px', 'font-weight': '500', fill: '#7f8c8d'
    });
    pressureText.textContent = 'Barometric Pressure: ' + psychCurrentPressure.toFixed(3) + ' psia';
    svg.appendChild(pressureText);

    const xLabel = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2, y: psychChartConfig.height - 25,
        class: 'chart-axis-label', 'text-anchor': 'middle', 'font-size': '15px', 'font-weight': '700', fill: '#2c3e50'
    });
    xLabel.textContent = 'DRY BULB TEMPERATURE (\u00B0F)';
    svg.appendChild(xLabel);

    const yLabel = psychCreateSVGElement('text', {
        x: 30, y: psychChartConfig.height / 2,
        'text-anchor': 'middle', 'font-size': '14px', 'font-weight': '700', fill: '#2c3e50',
        transform: 'rotate(-90, 30, ' + (psychChartConfig.height / 2) + ')'
    });
    yLabel.textContent = 'HUMIDITY RATIO (lb water / lb dry air \u00D7 1000)';
    svg.appendChild(yLabel);

    // Legend
    const legendX = psychChartConfig.width - psychChartConfig.marginRight - 180;
    const legendY = psychChartConfig.marginTop + 10;

    const legendItems = [
        { color: '#c0392b', text: 'Saturation (100% RH)', dash: false, width: 2.5 },
        { color: '#2471a3', text: 'Relative Humidity (%)', dash: false, width: 1.2 },
        { color: '#8e44ad', text: 'Wet Bulb Temp (\u00B0F)', dash: false, width: 1.3 },
        { color: '#d35400', text: 'Enthalpy (BTU/lb)', dash: true, width: 1.2 },
        { color: '#16a085', text: 'Specific Volume (ft\u00B3/lb)', dash: true, width: 1.0 },
        { color: '#e67e22', text: 'Dew Point (\u00B0F)', dash: false, width: 0.8 }
    ];

    const legendBg = psychCreateSVGElement('rect', {
        x: legendX - 10, y: legendY - 5,
        width: 190, height: legendItems.length * 22 + 15,
        fill: 'white', stroke: '#bdc3c7', 'stroke-width': 1.5, rx: 5, opacity: 0.96
    });
    svg.appendChild(legendBg);

    const legendTitle = psychCreateSVGElement('text', {
        x: legendX + 85, y: legendY + 10,
        class: 'chart-label', 'text-anchor': 'middle', 'font-weight': '700', 'font-size': '12px', fill: '#2c3e50'
    });
    legendTitle.textContent = 'CHART LINES';
    svg.appendChild(legendTitle);

    legendItems.forEach(function(item, i) {
        const y = legendY + 28 + i * 22;
        const line = psychCreateSVGElement('line', {
            x1: legendX, y1: y, x2: legendX + 25, y2: y,
            stroke: item.color, 'stroke-width': item.width,
            'stroke-dasharray': item.dash ? '4,3' : 'none'
        });
        svg.appendChild(line);

        const text = psychCreateSVGElement('text', {
            x: legendX + 30, y: y + 4,
            class: 'chart-label', 'font-size': '10px', 'font-weight': '600', fill: item.color
        });
        text.textContent = item.text;
        svg.appendChild(text);
    });
}

// ====== 5. POINT MANAGEMENT ======

function psychHandleChartClick(evt) {
    if (psychInputMode !== 'click') return;
    if (psychPoints.length >= psychMaxPoints) {
        alert('Maximum of ' + psychMaxPoints + ' points reached');
        return;
    }

    const svg = document.getElementById('psychChart');
    const pt = psychGetSVGPoint(svg, evt);
    const T_db = psychXToTemp(pt.x);
    const W = psychYToHumidity(pt.y);

    if (T_db < psychChartConfig.tMin || T_db > psychChartConfig.tMax ||
        W < psychChartConfig.wMin || W > psychChartConfig.wMax) {
        return;
    }

    // Clamp to saturation line
    const Pws = psychSaturationPressure(T_db);
    const W_sat = 0.621945 * Pws / (psychCurrentPressure - Pws);
    const W_clamped = Math.min(W, W_sat);

    const props = psychCalculateProperties(T_db, W_clamped, psychCurrentPressure);

    const point = {
        id: Date.now(),
        label: String.fromCharCode(65 + psychPoints.length),
        color: psychPointColors[psychPoints.length % psychPointColors.length],
        dryBulb: props.dryBulb,
        humidityRatio: props.humidityRatio,
        vaporPressure: props.vaporPressure,
        dewPoint: props.dewPoint,
        relativeHumidity: props.relativeHumidity,
        enthalpy: props.enthalpy,
        specificVolume: props.specificVolume,
        wetBulb: props.wetBulb
    };

    psychPoints.push(point);
    psychUpdateDisplay();
}

function psychGetSVGPoint(svg, evt) {
    const CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function addManualPoint() {
    if (psychSelectedVariables.length !== 2) {
        alert('Please select exactly two variables');
        return;
    }
    if (psychPoints.length >= psychMaxPoints) {
        alert('Maximum of ' + psychMaxPoints + ' points reached');
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

        const point = {
            id: Date.now(),
            label: label.substring(0, 3),
            color: psychPointColors[psychPoints.length % psychPointColors.length],
            dryBulb: props.dryBulb,
            humidityRatio: props.humidityRatio,
            vaporPressure: props.vaporPressure,
            dewPoint: props.dewPoint,
            relativeHumidity: props.relativeHumidity,
            enthalpy: props.enthalpy,
            specificVolume: props.specificVolume,
            wetBulb: props.wetBulb
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
    psychPoints = psychPoints.filter(function(p) { return p.id !== id; });
    psychUpdateDisplay();
}

function clearAllPoints() {
    if (psychPoints.length === 0) return;
    if (confirm('Clear all points?')) {
        psychPoints = [];
        psychUpdateDisplay();
    }
}

// ====== 6. UI FUNCTIONS ======

function switchElevation() {
    const val = document.getElementById('elevationSelect').value;
    if (val === 'custom') {
        var customPanel = document.getElementById('customPressurePanel');
        if (customPanel) customPanel.style.display = 'flex';
        return;
    }
    var customPanel = document.getElementById('customPressurePanel');
    if (customPanel) customPanel.style.display = 'none';

    psychCurrentElevation = val;
    psychCurrentPressure = psychPressures[val] || 14.696;
    psychRecalculateAllPoints();
    psychUpdateDisplay();
}

function applyCustomPressure() {
    var input = document.getElementById('customPressureInput');
    if (!input) return;
    var val = parseFloat(input.value);
    if (isNaN(val) || val < 8 || val > 16) {
        alert('Please enter a valid pressure between 8 and 16 psia');
        return;
    }
    psychCurrentElevation = 'custom';
    psychCurrentPressure = val;
    psychRecalculateAllPoints();
    psychUpdateDisplay();
}

function psychRecalculateAllPoints() {
    psychPoints.forEach(function(point) {
        var newProps = psychCalculateProperties(point.dryBulb, point.humidityRatio, psychCurrentPressure);
        point.vaporPressure = newProps.vaporPressure;
        point.dewPoint = newProps.dewPoint;
        point.relativeHumidity = newProps.relativeHumidity;
        point.enthalpy = newProps.enthalpy;
        point.specificVolume = newProps.specificVolume;
        point.wetBulb = newProps.wetBulb;
    });
}

function switchInputMode() {
    psychInputMode = document.getElementById('inputMode').value;
    var manualPanel = document.getElementById('manualInputPanel');
    if (manualPanel) {
        manualPanel.style.display = psychInputMode === 'manual' ? 'block' : 'none';
    }
}

function toggleConnectMode() {
    psychConnectMode = !psychConnectMode;
    var modeText = document.getElementById('connectModeText');
    var btn = document.getElementById('connectModeBtn');
    if (modeText) {
        modeText.textContent = psychConnectMode ? 'Process Lines: ON' : 'Process Lines: OFF';
    }
    if (btn) {
        btn.classList.toggle('btn-psych-active', psychConnectMode);
    }
    psychUpdateDisplay();
}

function toggleComfortZone() {
    psychShowComfortZone = !psychShowComfortZone;
    var btn = document.getElementById('comfortZoneBtn');
    var text = document.getElementById('comfortZoneText');
    if (text) {
        text.textContent = psychShowComfortZone ? 'Comfort Zone: ON' : 'Comfort Zone: OFF';
    }
    if (btn) {
        btn.classList.toggle('btn-psych-active', psychShowComfortZone);
    }
    psychUpdateDisplay();
}

function selectVariable(checkbox) {
    var checkboxes = document.querySelectorAll('.variable-checkboxes input[type="checkbox"]');
    if (checkbox.checked) {
        if (psychSelectedVariables.length >= 2) {
            checkbox.checked = false;
            alert('You can only select 2 variables');
            return;
        }
        psychSelectedVariables.push(checkbox.value);
    } else {
        psychSelectedVariables = psychSelectedVariables.filter(function(v) { return v !== checkbox.value; });
    }
    psychUpdateManualInputFields();
}

function psychUpdateManualInputFields() {
    var var1Input = document.getElementById('manualVar1');
    var var2Input = document.getElementById('manualVar2');
    var var1Label = document.getElementById('var1Label');
    var var2Label = document.getElementById('var2Label');

    if (!var1Input || !var2Input) return;

    var labels = {
        db: 'Dry Bulb (\u00B0F)', wb: 'Wet Bulb (\u00B0F)', rh: 'Relative Humidity (%)',
        dp: 'Dew Point (\u00B0F)', w: 'Humidity Ratio (lb/lb)', h: 'Enthalpy (BTU/lb)'
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
    psychUpdateProcessAnalysis();
}

// ====== 7. DRAWING POINTS & CONNECTIONS ======

function psychDrawPoints(svg) {
    psychPoints.forEach(function(point) {
        var x = psychTempToX(point.dryBulb);
        var y = psychHumidityToY(point.humidityRatio);
        var group = psychCreateSVGElement('g', { class: 'chart-point' });

        // Outer glow
        var glow = psychCreateSVGElement('circle', {
            cx: x, cy: y, r: 12, fill: point.color, opacity: 0.2
        });
        group.appendChild(glow);

        var circle = psychCreateSVGElement('circle', {
            cx: x, cy: y, r: 8, fill: point.color, class: 'chart-point-circle'
        });
        var text = psychCreateSVGElement('text', {
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
    for (var i = 0; i < psychPoints.length - 1; i++) {
        var p1 = psychPoints[i];
        var p2 = psychPoints[i + 1];
        var x1 = psychTempToX(p1.dryBulb);
        var y1 = psychHumidityToY(p1.humidityRatio);
        var x2 = psychTempToX(p2.dryBulb);
        var y2 = psychHumidityToY(p2.humidityRatio);

        var line = psychCreateSVGElement('line', {
            x1: x1, y1: y1, x2: x2, y2: y2,
            stroke: p1.color, class: 'chart-connection-line'
        });
        svg.appendChild(line);

        // Direction arrow at midpoint
        var mx = (x1 + x2) / 2;
        var my = (y1 + y2) / 2;
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var arrow = psychCreateSVGElement('polygon', {
            points: '0,-5 10,0 0,5',
            fill: p1.color, opacity: 0.8,
            transform: 'translate(' + mx + ',' + my + ') rotate(' + angle + ')'
        });
        svg.appendChild(arrow);
    }
}

// ====== 8. RESULTS & PROCESS TABLES ======

function psychUpdateResultsTable() {
    var container = document.getElementById('resultsTable');
    if (!container) return;

    if (psychPoints.length === 0) {
        container.innerHTML = '<p class="info-text">Click on the chart or use manual entry to add points. Up to 12 points can be added.</p>';
        return;
    }

    var html = '<div class="results-table-scroll"><table><thead><tr>';
    html += '<th>Point</th><th>DB (\u00B0F)</th><th>WB (\u00B0F)</th><th>DP (\u00B0F)</th>';
    html += '<th>RH (%)</th><th>W (gr/lb)</th><th>h (BTU/lb)</th>';
    html += '<th>v (ft\u00B3/lb)</th><th>Pv (psia)</th><th>Action</th>';
    html += '</tr></thead><tbody>';

    psychPoints.forEach(function(point) {
        html += '<tr>';
        html += '<td><span class="point-color-indicator" style="background: ' + point.color + '"></span> ' + point.label + '</td>';
        html += '<td>' + point.dryBulb.toFixed(1) + '</td>';
        html += '<td>' + point.wetBulb.toFixed(1) + '</td>';
        html += '<td>' + point.dewPoint.toFixed(1) + '</td>';
        html += '<td>' + point.relativeHumidity.toFixed(1) + '</td>';
        html += '<td>' + (point.humidityRatio * 7000).toFixed(1) + '</td>';
        html += '<td>' + point.enthalpy.toFixed(2) + '</td>';
        html += '<td>' + point.specificVolume.toFixed(3) + '</td>';
        html += '<td>' + point.vaporPressure.toFixed(4) + '</td>';
        html += '<td><button class="point-delete-btn-inline" onclick="deletePoint(' + point.id + ')" title="Delete point">\u2715</button></td>';
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function psychUpdateProcessAnalysis() {
    var container = document.getElementById('processAnalysis');
    if (!container) return;

    if (!psychConnectMode || psychPoints.length < 2) {
        container.innerHTML = '<p class="info-text">Enable Process Lines and add at least 2 points to see process analysis.</p>';
        return;
    }

    var html = '<div class="results-table-scroll"><table><thead><tr>';
    html += '<th>Process</th><th>Type</th><th>\u0394DB (\u00B0F)</th><th>\u0394W (gr/lb)</th>';
    html += '<th>\u0394h (BTU/lb)</th><th>SHR</th>';
    html += '<th>Sensible<br>(BTU/hr/CFM)</th><th>Latent<br>(BTU/hr/CFM)</th>';
    html += '<th>Total<br>(BTU/hr/CFM)</th><th>Tons/1000 CFM</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < psychPoints.length - 1; i++) {
        var p1 = psychPoints[i];
        var p2 = psychPoints[i + 1];
        var proc = psychCalculateProcess(p1, p2);

        html += '<tr>';
        html += '<td><span class="point-color-indicator" style="background: ' + p1.color + '"></span> ' + p1.label + ' \u2192 ' + p2.label + '</td>';
        html += '<td><span class="process-type-badge">' + proc.type + '</span></td>';
        html += '<td>' + proc.deltaDryBulb.toFixed(1) + '</td>';
        html += '<td>' + (proc.deltaHumidityRatio * 7000).toFixed(1) + '</td>';
        html += '<td>' + proc.deltaEnthalpy.toFixed(2) + '</td>';
        html += '<td>' + (proc.SHR !== null ? proc.SHR.toFixed(3) : 'N/A') + '</td>';
        html += '<td>' + proc.sensibleBTUperCFM.toFixed(1) + '</td>';
        html += '<td>' + proc.latentBTUperCFM.toFixed(1) + '</td>';
        html += '<td>' + proc.totalBTUperCFM.toFixed(1) + '</td>';
        html += '<td>' + proc.tonsPerKCFM.toFixed(2) + '</td>';
        html += '</tr>';
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function psychUpdatePointsList() {
    var container = document.getElementById('pointsList');
    var countElem = document.getElementById('pointCount');
    if (!container) return;
    if (countElem) countElem.textContent = psychPoints.length;

    if (psychPoints.length === 0) {
        container.innerHTML = '<p class="info-text">No points added yet</p>';
        return;
    }

    var html = '';
    psychPoints.forEach(function(point) {
        html += '<div class="point-card" style="border-left-color: ' + point.color + '">';
        html += '<div class="point-card-info">';
        html += '<div class="point-card-color" style="background: ' + point.color + '"></div>';
        html += '<div class="point-card-details">';
        html += '<span class="point-card-label">' + point.label + '</span>';
        html += '<span class="point-card-summary">' + point.dryBulb.toFixed(1) + '\u00B0F DB / ' + point.relativeHumidity.toFixed(0) + '% RH</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="point-card-actions">';
        html += '<button class="point-action-btn point-delete-btn" onclick="deletePoint(' + point.id + ')" title="Delete">\uD83D\uDDD1\uFE0F</button>';
        html += '</div></div>';
    });
    container.innerHTML = html;
}

// ====== 9. HOVER TOOLTIP ======

function psychHandleChartHover(evt) {
    if (!psychHoverEnabled) return;
    var svg = document.getElementById('psychChart');
    if (!svg) return;

    var pt = psychGetSVGPoint(svg, evt);
    var T_db = psychXToTemp(pt.x);
    var W = psychYToHumidity(pt.y);

    var chartLeft = psychChartConfig.marginLeft;
    var chartRight = psychChartConfig.width - psychChartConfig.marginRight;
    var chartTop = psychChartConfig.marginTop;
    var chartBottom = psychChartConfig.height - psychChartConfig.marginBottom;

    // Only show tooltip within chart area
    if (pt.x < chartLeft || pt.x > chartRight || pt.y < chartTop || pt.y > chartBottom) {
        psychHideHoverTooltip();
        return;
    }

    if (T_db < psychChartConfig.tMin || T_db > psychChartConfig.tMax ||
        W < psychChartConfig.wMin || W > psychChartConfig.wMax) {
        psychHideHoverTooltip();
        return;
    }

    // Clamp to saturation
    var Pws = psychSaturationPressure(T_db);
    var W_sat = 0.621945 * Pws / (psychCurrentPressure - Pws);
    var W_clamped = Math.min(W, W_sat);

    var props = psychCalculateProperties(T_db, W_clamped, psychCurrentPressure);
    psychShowHoverTooltip(pt.x, pt.y, props);
}

function psychShowHoverTooltip(svgX, svgY, props) {
    var tooltip = document.getElementById('psychHoverTooltip');
    if (!tooltip) return;

    var svg = document.getElementById('psychChart');
    if (!svg) return;

    // Update tooltip content
    document.getElementById('hoverDB').textContent = props.dryBulb.toFixed(1) + '\u00B0F';
    document.getElementById('hoverWB').textContent = props.wetBulb.toFixed(1) + '\u00B0F';
    document.getElementById('hoverDP').textContent = props.dewPoint.toFixed(1) + '\u00B0F';
    document.getElementById('hoverRH').textContent = props.relativeHumidity.toFixed(1) + '%';
    document.getElementById('hoverW').textContent = (props.humidityRatio * 7000).toFixed(1) + ' gr/lb';
    document.getElementById('hoverH').textContent = props.enthalpy.toFixed(1) + ' BTU/lb';

    // Position tooltip relative to cursor
    var rect = svg.getBoundingClientRect();
    var scaleX = rect.width / psychChartConfig.width;
    var scaleY = rect.height / psychChartConfig.height;

    var tooltipX = rect.left + svgX * scaleX + window.scrollX;
    var tooltipY = rect.top + svgY * scaleY + window.scrollY;

    // Offset to avoid covering cursor
    tooltip.style.left = (tooltipX + 20) + 'px';
    tooltip.style.top = (tooltipY - 80) + 'px';
    tooltip.style.display = 'block';

    // Keep within viewport
    var tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = (tooltipX - tooltipRect.width - 20) + 'px';
    }
    if (tooltipRect.top < 0) {
        tooltip.style.top = (tooltipY + 20) + 'px';
    }
}

function psychHideHoverTooltip() {
    var tooltip = document.getElementById('psychHoverTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// ====== 10. EXPORT FUNCTIONS ======

function exportData() {
    if (psychPoints.length === 0) {
        alert('No points to export');
        return;
    }

    var csv = 'Point,DB(F),WB(F),DP(F),RH(%),W(gr/lb),h(BTU/lb),v(ft3/lb),Pv(psia)\n';
    psychPoints.forEach(function(point) {
        csv += point.label + ',' + point.dryBulb.toFixed(2) + ',' + point.wetBulb.toFixed(2) + ',';
        csv += point.dewPoint.toFixed(2) + ',' + point.relativeHumidity.toFixed(2) + ',';
        csv += (point.humidityRatio * 7000).toFixed(2) + ',' + point.enthalpy.toFixed(3) + ',';
        csv += point.specificVolume.toFixed(4) + ',' + point.vaporPressure.toFixed(5) + '\n';
    });

    // Add process data if available
    if (psychConnectMode && psychPoints.length >= 2) {
        csv += '\nProcess Analysis\n';
        csv += 'Process,Type,Delta_DB(F),Delta_W(gr/lb),Delta_h(BTU/lb),SHR,Sensible(BTU/hr/CFM),Latent(BTU/hr/CFM),Total(BTU/hr/CFM),Tons/1000CFM\n';
        for (var i = 0; i < psychPoints.length - 1; i++) {
            var p1 = psychPoints[i];
            var p2 = psychPoints[i + 1];
            var proc = psychCalculateProcess(p1, p2);
            csv += p1.label + ' to ' + p2.label + ',' + proc.type + ',';
            csv += proc.deltaDryBulb.toFixed(2) + ',' + (proc.deltaHumidityRatio * 7000).toFixed(2) + ',';
            csv += proc.deltaEnthalpy.toFixed(3) + ',' + (proc.SHR !== null ? proc.SHR.toFixed(3) : 'N/A') + ',';
            csv += proc.sensibleBTUperCFM.toFixed(2) + ',' + proc.latentBTUperCFM.toFixed(2) + ',';
            csv += proc.totalBTUperCFM.toFixed(2) + ',' + proc.tonsPerKCFM.toFixed(3) + '\n';
        }
    }

    var blob = new Blob([csv], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'psychrometric_data_' + Date.now() + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveChartAsPNG() {
    var svg = document.getElementById('psychChart');
    if (!svg) return;

    var svgData = new XMLSerializer().serializeToString(svg);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();

    canvas.width = 2000;
    canvas.height = 1500;

    img.onload = function() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        var link = document.createElement('a');
        link.download = 'psychrometric_chart_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// ====== 11. COORDINATE CONVERSION ======

function psychTempToX(t) {
    var chartWidth = psychChartConfig.width - psychChartConfig.marginLeft - psychChartConfig.marginRight;
    return psychChartConfig.marginLeft +
           ((t - psychChartConfig.tMin) / (psychChartConfig.tMax - psychChartConfig.tMin)) * chartWidth;
}

function psychXToTemp(x) {
    var chartWidth = psychChartConfig.width - psychChartConfig.marginLeft - psychChartConfig.marginRight;
    return psychChartConfig.tMin +
           ((x - psychChartConfig.marginLeft) / chartWidth) * (psychChartConfig.tMax - psychChartConfig.tMin);
}

function psychHumidityToY(w) {
    var chartHeight = psychChartConfig.height - psychChartConfig.marginTop - psychChartConfig.marginBottom;
    return psychChartConfig.height - psychChartConfig.marginBottom -
           ((w - psychChartConfig.wMin) / (psychChartConfig.wMax - psychChartConfig.wMin)) * chartHeight;
}

function psychYToHumidity(y) {
    var chartHeight = psychChartConfig.height - psychChartConfig.marginTop - psychChartConfig.marginBottom;
    return psychChartConfig.wMin +
           ((psychChartConfig.height - psychChartConfig.marginBottom - y) / chartHeight) *
           (psychChartConfig.wMax - psychChartConfig.wMin);
}

function psychCreateSVGElement(type, attributes) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

// ====== 12. INITIALIZATION ======

function initializePsychrometricChart() {
    var svg = document.getElementById('psychChart');
    if (!svg) return;

    psychDrawChart();
    svg.addEventListener('click', psychHandleChartClick);
    svg.addEventListener('mousemove', psychHandleChartHover);
    svg.addEventListener('mouseleave', psychHideHoverTooltip);
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializePsychrometricChart, 500);
});
