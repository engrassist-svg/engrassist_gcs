// ========================================
// CONVERSION CALCULATOR FUNCTIONALITY
// Standalone module - include this file on any page with the conversion calculator
// ========================================

const conversionData = {
    distance: {
        name: "Distance/Length",
        units: {
            "mm": { name: "Millimeters", toBase: 0.001 },
            "cm": { name: "Centimeters", toBase: 0.01 },
            "m": { name: "Meters", toBase: 1 },
            "km": { name: "Kilometers", toBase: 1000 },
            "in": { name: "Inches", toBase: 0.0254 },
            "ft": { name: "Feet", toBase: 0.3048 },
            "yd": { name: "Yards", toBase: 0.9144 },
            "mi": { name: "Miles", toBase: 1609.344 }
        }
    },
    area: {
        name: "Area",
        units: {
            "mm2": { name: "Square Millimeters", toBase: 0.000001 },
            "cm2": { name: "Square Centimeters", toBase: 0.0001 },
            "m2": { name: "Square Meters", toBase: 1 },
            "km2": { name: "Square Kilometers", toBase: 1000000 },
            "in2": { name: "Square Inches", toBase: 0.00064516 },
            "ft2": { name: "Square Feet", toBase: 0.092903 },
            "yd2": { name: "Square Yards", toBase: 0.836127 },
            "acre": { name: "Acres", toBase: 4046.86 }
        }
    },
    volume: {
        name: "Volume",
        units: {
            "mm3": { name: "Cubic Millimeters", toBase: 0.000000001 },
            "cm3": { name: "Cubic Centimeters", toBase: 0.000001 },
            "m3": { name: "Cubic Meters", toBase: 1 },
            "L": { name: "Liters", toBase: 0.001 },
            "in3": { name: "Cubic Inches", toBase: 0.000016387 },
            "ft3": { name: "Cubic Feet", toBase: 0.028317 },
            "gal": { name: "Gallons (US)", toBase: 0.003785 },
            "qt": { name: "Quarts", toBase: 0.000946 }
        }
    },
    mass: {
        name: "Mass",
        units: {
            "mg": { name: "Milligrams", toBase: 0.000001 },
            "g": { name: "Grams", toBase: 0.001 },
            "kg": { name: "Kilograms", toBase: 1 },
            "ton": { name: "Metric Tons", toBase: 1000 },
            "oz": { name: "Ounces", toBase: 0.02835 },
            "lb": { name: "Pounds", toBase: 0.4536 },
            "ton_us": { name: "US Tons", toBase: 907.185 }
        }
    },
    force: {
        name: "Force",
        units: {
            "N": { name: "Newtons", toBase: 1 },
            "kN": { name: "Kilonewtons", toBase: 1000 },
            "lbf": { name: "Pounds Force", toBase: 4.448 },
            "kip": { name: "Kips", toBase: 4448 },
            "dyne": { name: "Dynes", toBase: 0.00001 }
        }
    },
    pressure: {
        name: "Pressure",
        units: {
            "Pa": { name: "Pascals", toBase: 1 },
            "kPa": { name: "Kilopascals", toBase: 1000 },
            "MPa": { name: "Megapascals", toBase: 1000000 },
            "psi": { name: "PSI", toBase: 6895 },
            "bar": { name: "Bar", toBase: 100000 },
            "atm": { name: "Atmospheres", toBase: 101325 },
            "mmHg": { name: "mmHg", toBase: 133.322 },
            "inHg": { name: "inHg", toBase: 3386.39 }
        }
    },
    temperature: {
        name: "Temperature",
        special: true
    },
    power: {
        name: "Power",
        units: {
            "W": { name: "Watts", toBase: 1 },
            "kW": { name: "Kilowatts", toBase: 1000 },
            "MW": { name: "Megawatts", toBase: 1000000 },
            "hp": { name: "Horsepower", toBase: 745.7 },
            "Btu/hr": { name: "BTU/hr", toBase: 0.2931 },
            "ft-lbf/s": { name: "ft-lbf/sec", toBase: 1.356 }
        }
    },
    energy: {
        name: "Energy",
        units: {
            "J": { name: "Joules", toBase: 1 },
            "kJ": { name: "Kilojoules", toBase: 1000 },
            "MJ": { name: "Megajoules", toBase: 1000000 },
            "Btu": { name: "BTU", toBase: 1055 },
            "kWh": { name: "Kilowatt-hours", toBase: 3600000 },
            "cal": { name: "Calories", toBase: 4.184 },
            "ft-lbf": { name: "ft-lbf", toBase: 1.356 }
        }
    },
    flow: {
        name: "Flow Rate",
        units: {
            "m3/s": { name: "m³/s", toBase: 1 },
            "L/s": { name: "L/s", toBase: 0.001 },
            "L/min": { name: "L/min", toBase: 0.0000167 },
            "ft3/s": { name: "ft³/s", toBase: 0.02832 },
            "ft3/min": { name: "CFM", toBase: 0.000472 },
            "gal/min": { name: "GPM", toBase: 0.0000631 },
            "gal/hr": { name: "GPH", toBase: 0.00000105 }
        }
    },
    speed: {
        name: "Speed/Velocity",
        units: {
            "m/s": { name: "m/s", toBase: 1 },
            "km/h": { name: "km/h", toBase: 0.2778 },
            "ft/s": { name: "ft/s", toBase: 0.3048 },
            "ft/min": { name: "ft/min", toBase: 0.00508 },
            "mph": { name: "mph", toBase: 0.4470 },
            "knot": { name: "Knots", toBase: 0.5144 }
        }
    },
    time: {
        name: "Time",
        units: {
            "s": { name: "Seconds", toBase: 1 },
            "min": { name: "Minutes", toBase: 60 },
            "hr": { name: "Hours", toBase: 3600 },
            "day": { name: "Days", toBase: 86400 },
            "week": { name: "Weeks", toBase: 604800 },
            "year": { name: "Years", toBase: 31536000 }
        }
    }
};

function initializeCalculator() {
    const categorySelect = document.getElementById('categorySelect');
    const inputUnit = document.getElementById('inputUnit');
    const outputUnit = document.getElementById('outputUnit');
    const inputValue = document.getElementById('inputValue');
    const outputValue = document.getElementById('outputValue');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swapBtn');
    
    if (!categorySelect || !inputUnit || !outputUnit || !inputValue || !outputValue) {
        return;
    }
    
    updateUnits();
    categorySelect.addEventListener('change', updateUnits);
    convertBtn.addEventListener('click', convert);
    swapBtn.addEventListener('click', swapUnits);
    inputValue.addEventListener('input', convert);
    inputUnit.addEventListener('change', convert);
    outputUnit.addEventListener('change', convert);
}

function updateUnits() {
    const categorySelect = document.getElementById('categorySelect');
    const inputUnit = document.getElementById('inputUnit');
    const outputUnit = document.getElementById('outputUnit');
    const inputValue = document.getElementById('inputValue');
    const outputValue = document.getElementById('outputValue');
    
    const category = categorySelect.value;
    const data = conversionData[category];
    
    inputUnit.innerHTML = '';
    outputUnit.innerHTML = '';
    
    if (category === 'temperature') {
        const tempUnits = [
            { value: 'C', name: 'Celsius (°C)' },
            { value: 'F', name: 'Fahrenheit (°F)' },
            { value: 'K', name: 'Kelvin (K)' },
            { value: 'R', name: 'Rankine (°R)' }
        ];
        
        tempUnits.forEach(unit => {
            inputUnit.appendChild(new Option(unit.name, unit.value));
            outputUnit.appendChild(new Option(unit.name, unit.value));
        });
        
        inputUnit.value = 'F';
        outputUnit.value = 'C';
    } else {
        const units = Object.keys(data.units);
        units.forEach(unitKey => {
            const unit = data.units[unitKey];
            inputUnit.appendChild(new Option(unit.name, unitKey));
            outputUnit.appendChild(new Option(unit.name, unitKey));
        });
        
        if (units.length > 1) {
            inputUnit.value = units[0];
            outputUnit.value = units[1];
        }
    }
    
    inputValue.value = '';
    outputValue.value = '';
}

function convert() {
    const categorySelect = document.getElementById('categorySelect');
    const inputUnit = document.getElementById('inputUnit');
    const outputUnit = document.getElementById('outputUnit');
    const inputValue = document.getElementById('inputValue');
    const outputValue = document.getElementById('outputValue');
    
    const inputVal = parseFloat(inputValue.value);
    if (isNaN(inputVal)) {
        outputValue.value = '';
        return;
    }

    const category = categorySelect.value;
    const fromUnit = inputUnit.value;
    const toUnit = outputUnit.value;

    let result;

    if (category === 'temperature') {
        result = convertTemperature(inputVal, fromUnit, toUnit);
    } else {
        const data = conversionData[category];
        const fromFactor = data.units[fromUnit].toBase;
        const toFactor = data.units[toUnit].toBase;
        result = (inputVal * fromFactor) / toFactor;
    }

    if (Math.abs(result) >= 1000000 || (Math.abs(result) < 0.001 && result !== 0)) {
        outputValue.value = result.toExponential(6);
    } else {
        outputValue.value = parseFloat(result.toFixed(10)).toString();
    }
}

function convertTemperature(value, from, to) {
    if (from === to) return value;

    let celsius;
    switch (from) {
        case 'C': celsius = value; break;
        case 'F': celsius = (value - 32) * 5/9; break;
        case 'K': celsius = value - 273.15; break;
        case 'R': celsius = (value - 491.67) * 5/9; break;
    }

    switch (to) {
        case 'C': return celsius;
        case 'F': return celsius * 9/5 + 32;
        case 'K': return celsius + 273.15;
        case 'R': return celsius * 9/5 + 491.67;
    }
}

function swapUnits() {
    const inputUnit = document.getElementById('inputUnit');
    const outputUnit = document.getElementById('outputUnit');
    const inputValue = document.getElementById('inputValue');
    const outputValue = document.getElementById('outputValue');
    
    const tempUnit = inputUnit.value;
    inputUnit.value = outputUnit.value;
    outputUnit.value = tempUnit;
    inputValue.value = outputValue.value;
    
    convert();
}

// Self-initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});
