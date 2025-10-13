// ====================================
// TEMPLATE LOADING SYSTEM - OPTIMIZED
// ====================================

// Load templates efficiently with Promise-based approach
function loadTemplate(elementId, templateFile) {
    return fetch(templateFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${templateFile}: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            }
            return true;
        })
        .catch(error => {
            console.error('Template loading error:', error);
            // Fallback: show page anyway to prevent blank screen
            return false;
        });
}

// Initialize templates and page
function initializeTemplates() {
    // Load both templates in parallel for speed
    Promise.all([
        loadTemplate('header-placeholder', 'header.html'),
        loadTemplate('footer-placeholder', 'footer.html')
    ]).then(() => {
        // Templates loaded - show page with fade-in
        document.body.classList.add('templates-loaded');
        
        // Hide loading spinner if present
        const loader = document.querySelector('.page-loading');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 300);
            }, 100);
        }
        
        // Highlight current page in navigation
        highlightCurrentPage();
        
        // Initialize all other functionality
        initializeAllFeatures();
    });
}

// Highlight the current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize all page features
function initializeAllFeatures() {
    initializeSmoothScroll();
    initializeStatsAnimation();
    initializeMobileMenuClose();
    initializeContactForm();
    initializeFormValidation();
    initializeConsoleMessages();
    initializeCalculator();
    initializePageCounter();
    initializeDuctulator();
    initializeDesktopMode();
}

// ====================================
// EMAILJS CONFIGURATION
// ====================================
const EMAILJS_PUBLIC_KEY = 'ins0bXDTBg7rdNofU';
const EMAILJS_SERVICE_ID = 'service_engrassist';
const EMAILJS_TEMPLATE_ID = 'template_EngrAssist';

// Initialize EmailJS when available
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

// ====================================
// UTILITY FUNCTIONS
// ====================================

function toggleDesktopSite() {
    const viewportMeta = document.getElementById('viewport-meta');
    const toggleButton = document.getElementById('desktopToggle');
    const isDesktop = localStorage.getItem('desktopMode') === 'true';
    
    if (isDesktop) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        localStorage.setItem('desktopMode', 'false');
        toggleButton.innerHTML = '💻 Desktop View';
        toggleButton.title = 'Switch to desktop version';
    } else {
        viewportMeta.setAttribute('content', 'width=1200');
        localStorage.setItem('desktopMode', 'true');
        toggleButton.innerHTML = '📱 Mobile View';
        toggleButton.title = 'Switch to mobile version';
    }
}

function initializeDesktopMode() {
    const viewportMeta = document.getElementById('viewport-meta');
    const toggleButton = document.getElementById('desktopToggle');
    if (!viewportMeta || !toggleButton) return;
    
    const isDesktop = localStorage.getItem('desktopMode') === 'true';
    
    if (isDesktop) {
        viewportMeta.setAttribute('content', 'width=1200');
        toggleButton.innerHTML = '📱 Mobile View';
        toggleButton.title = 'Switch to mobile version';
    } else {
        toggleButton.innerHTML = '💻 Desktop View';
        toggleButton.title = 'Switch to desktop version';
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('show');
    }
}

// ====================================
// MOBILE SUBMENU TOGGLE
// ====================================

function toggleMobileSubmenu(event) {
    event.preventDefault(); // Prevent the link from navigating
    
    // Find the submenu that's right after the clicked link
    const clickedLink = event.target;
    const submenu = clickedLink.nextElementSibling;
    
    if (submenu && submenu.classList.contains('mobile-submenu')) {
        submenu.classList.toggle('show');
    }
}

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function animateNumber(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const increment = Math.ceil(target / 50);
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current + suffix;
    }, duration / 50);
}

function initializeStatsAnimation() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const finalValue = stat.textContent;
                    if (finalValue !== '∞') {
                        const finalNumber = parseInt(finalValue);
                        animateNumber(stat, finalNumber, finalValue.includes('+') ? '+' : '');
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function initializeMobileMenuClose() {
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (mobileMenu && menuBtn && !mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
            mobileMenu.classList.remove('show');
        }
    });
    
    // Close menu when clicking links (but NOT the submenu toggle)
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Don't close menu if clicking the submenu toggle
            if (link.classList.contains('mobile-submenu-toggle')) {
                return; // Exit early - don't close the menu
            }
            
            // Otherwise, close the menu
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.remove('show');
            }
        });
    });
}

// ====================================
// CONTACT FORM WITH EMAILJS
// ====================================
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (successMessage) successMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        this.classList.add('loading');

        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                if (successMessage) {
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                contactForm.classList.remove('loading');
                
            }, function(error) {
                console.error('FAILED...', error);
                
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                contactForm.classList.remove('loading');
            });
    });
}

function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('span');
    
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.classList.remove('active');
            const otherIcon = item.previousElementSibling.querySelector('span');
            if (otherIcon) otherIcon.textContent = '+';
        }
    });
    
    answer.classList.toggle('active');
    if (icon) {
        icon.textContent = answer.classList.contains('active') ? '-' : '+';
    }
}

function fillQuoteForm() {
    const subjectField = document.getElementById('subject');
    const messageField = document.getElementById('message');
    
    if (subjectField && messageField) {
        subjectField.value = 'Business Inquiry';
        messageField.value = 'I\'m interested in a custom HVAC design tool. Please contact me with more information about your custom development services.';
        messageField.focus();
    }
}

function initializeFormValidation() {
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#27ae60';
            }
        });
    });

    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = '#e74c3c';
            } else if (this.value) {
                this.style.borderColor = '#27ae60';
            }
        });
    }
}

function initializeConsoleMessages() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('about')) {
        console.log("%c🔧 EngrAssist About Page - Built with Professional Standards", "color: #f39c12; font-size: 16px; font-weight: bold;");
        console.log("%cFun fact: Commercial HVAC systems can move over 100,000 CFM of air!", "color: #3498db; font-size: 12px;");
    } else if (currentPage.includes('privacy')) {
        console.log("%c🔒 EngrAssist Privacy Policy - Your Privacy is Protected", "color: #27ae60; font-size: 16px; font-weight: bold;");
    } else if (currentPage.includes('terms')) {
        console.log("%c⚖️ EngrAssist Terms of Service - Legal Protection Active", "color: #dc3545; font-size: 16px; font-weight: bold;");
        console.log("%cAll tools for educational purposes only. Professional verification required.", "color: #856404; font-size: 12px;");
    }
}

function initializePageCounter() {
    const counterElement = document.getElementById('pageCounter');
    if (!counterElement) return;
    
    let visitorCount = localStorage.getItem('engrAssistVisitors');
    
    if (!visitorCount) {
        visitorCount = 1;
    } else {
        visitorCount = parseInt(visitorCount) + 1;
    }
    
    localStorage.setItem('engrAssistVisitors', visitorCount);
    animateCounter(counterElement, visitorCount);
}

function animateCounter(element, target) {
    const duration = 1000;
    const start = Math.max(0, target - 50);
    const increment = Math.ceil((target - start) / 30);
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current.toLocaleString();
    }, duration / 30);
}

// ========================================
// CONVERSION CALCULATOR FUNCTIONALITY
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

// ========================================
// BOILER CALCULATOR FUNCTIONS
// ========================================

let boilerSystemData = {};

function toggleGlycolMix() {
    const fluidType = document.getElementById('fluidType');
    const glycolInput = document.getElementById('glycolMixInput');
    if (fluidType && glycolInput) {
        if (fluidType.value === 'propylene' || fluidType.value === 'ethylene') {
            glycolInput.style.display = 'block';
        } else {
            glycolInput.style.display = 'none';
        }
    }
}

function calculateBoilerSystem() {
    const sqft = parseFloat(document.getElementById('sqft').value);
    const safetyFactorPercent = parseFloat(document.getElementById('safetyFactor').value);
    const btuPerSqFt = parseFloat(document.getElementById('btuPerSqFt').value);

    if (!btuPerSqFt || btuPerSqFt <= 0) {
        alert('Please enter a valid BTU/sq ft value');
        return;
    }

    if (!sqft || sqft <= 0) {
        alert('Please enter a valid square footage');
        return;
    }

    const fluidType = document.getElementById('fluidType').value;
    const enterTemp = parseFloat(document.getElementById('enterTemp').value);
    const leaveTemp = parseFloat(document.getElementById('leaveTemp').value);
    const glycolPercent = parseFloat(document.getElementById('glycolPercent').value) || 0;

    if (!enterTemp || !leaveTemp) {
        alert('Please enter valid entering and leaving temperatures');
        return;
    }

    const deltaT = Math.abs(leaveTemp - enterTemp);
    if (deltaT === 0) {
        alert('Temperature difference cannot be zero');
        return;
    }

    const baseHeatLoss = sqft * btuPerSqFt;
    const safetyFactor = 1 + (safetyFactorPercent / 100);
    const requiredBTU = baseHeatLoss * safetyFactor;

    let specificHeat, density;
    
    if (fluidType === 'water') {
        specificHeat = 1.0;
        density = 8.34;
    } else if (fluidType === 'propylene') {
        specificHeat = 1.0 - (0.003 * glycolPercent);
        density = 8.34 + (0.01 * glycolPercent);
    } else {
        specificHeat = 1.0 - (0.0035 * glycolPercent);
        density = 8.34 + (0.012 * glycolPercent);
    }

    const specificGravity = density / 8.34;
    const systemFlowGPM = requiredBTU / (500 * deltaT * specificGravity * specificHeat);

    boilerSystemData = {
        requiredBTU: requiredBTU,
        baseHeatLoss: baseHeatLoss,
        deltaT: deltaT,
        specificHeat: specificHeat,
        density: density,
        specificGravity: specificGravity
    };
    
    boilerSystemData = {
        requiredBTU: requiredBTU,
        baseHeatLoss: baseHeatLoss,
        deltaT: deltaT,
        specificHeat: specificHeat,
        density: density,
        specificGravity: specificGravity,
        systemFlowGPM: systemFlowGPM  // Add this line
    };
    document.getElementById('heatLoss').textContent = formatNumber(baseHeatLoss) + ' BTU/hr';
    document.getElementById('requiredBTU').textContent = formatNumber(requiredBTU) + ' BTU/hr';
    document.getElementById('deltaT').textContent = deltaT.toFixed(1) + ' °F';
    document.getElementById('specificHeat').textContent = specificHeat.toFixed(3) + ' BTU/(lb·°F)';
    document.getElementById('density').textContent = density.toFixed(2) + ' lb/gal';
    document.getElementById('systemFlow').textContent = systemFlowGPM.toFixed(1) + ' GPM';
}

function calculateBoilerSelectedSystem() {
    if (!boilerSystemData.requiredBTU) {
        alert('Please calculate System Requirements first');
        return;
    }

    const boilerQuantity = parseInt(document.getElementById('boilerQuantity').value);
    const boilerInputBTU = parseFloat(document.getElementById('boilerInputBTU').value);
    const boilerEfficiency = parseFloat(document.getElementById('boilerEfficiency').value) / 100;

    if (!boilerQuantity || boilerQuantity <= 0) {
        alert('Please enter a valid number of boilers');
        return;
    }

    if (!boilerInputBTU || boilerInputBTU <= 0) {
        alert('Please enter a valid boiler input BTU');
        return;
    }

    if (!boilerEfficiency || boilerEfficiency <= 0) {
        alert('Please enter a valid boiler efficiency');
        return;
    }

    const outputBTUPerBoiler = boilerInputBTU * boilerEfficiency;
    const totalOutputBTU = outputBTUPerBoiler * boilerQuantity;
    const actualSafetyPercent = ((totalOutputBTU - boilerSystemData.baseHeatLoss) / boilerSystemData.baseHeatLoss) * 100;
    const flowPerBoiler = outputBTUPerBoiler / (500 * boilerSystemData.deltaT * boilerSystemData.specificGravity * boilerSystemData.specificHeat);
    const totalFlow = flowPerBoiler * boilerQuantity;

    document.getElementById('outputBTUPerBoiler').textContent = formatNumber(outputBTUPerBoiler) + ' BTU/hr';
    document.getElementById('totalOutputBTU').textContent = formatNumber(totalOutputBTU) + ' BTU/hr';
    document.getElementById('actualSafety').textContent = actualSafetyPercent.toFixed(1) + '%';
    document.getElementById('flowPerBoiler').textContent = flowPerBoiler.toFixed(1) + ' GPM';
    document.getElementById('totalFlow').textContent = totalFlow.toFixed(1) + ' GPM';
}

function formatNumber(num) {
    return Math.round(num).toLocaleString();
}

// ========================================
// DUCTULATOR CALCULATOR FUNCTIONS
// ========================================

let currentUnitSystem = 'imperial';

function initializeDuctulator() {
    const calcTypeSelect = document.getElementById('calculation-type');
    if (!calcTypeSelect) return;
    
    updateInputFields();
}

function toggleAdvancedConditions() {
    const advancedDiv = document.getElementById('advanced-conditions');
    const isStandardConditions = document.getElementById('std-yes').checked;
    if (advancedDiv) {
        advancedDiv.style.display = isStandardConditions ? 'none' : 'block';
    }
    
    if (isStandardConditions) {
        const tempInput = document.getElementById('temp');
        const humidityInput = document.getElementById('humidity');
        const elevationInput = document.getElementById('elevation');
        const densityInput = document.getElementById('density');
        
        if (tempInput) tempInput.value = 70;
        if (humidityInput) humidityInput.value = 0;
        if (elevationInput) elevationInput.value = 0;
        if (densityInput) densityInput.value = 0.075;
    }
}

function updateInputFields() {
    const calcType = document.getElementById('calculation-type');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    if (!calcType || !dynamicInputs) return;
    
    const calcValue = calcType.value;
    let html = '';
    
    switch(calcValue) {
        case 'friction-loss':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="airflow">Airflow <span class="unit-display">(CFM)</span></label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="width">Width <span class="unit-display">(in)</span></label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                    <div class="form-col">
                        <label for="height">Height <span class="unit-display">(in)</span></label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                </div>
            `;
            break;
        case 'airflow-rate':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="width">Width <span class="unit-display">(in)</span></label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                    <div class="form-col">
                        <label for="height">Height <span class="unit-display">(in)</span></label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                    <div class="form-col">
                        <label for="friction-rate">Friction Loss Rate <span class="unit-display">(ft/100 ft)</span></label>
                        <input type="number" id="friction-rate" min="0" step="0.0001" value="0.00833" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <label for="height-restriction">Height Restriction - Optional <span class="unit-display">(in)</span></label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
        case 'size-velocity':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="airflow">Airflow <span class="unit-display">(CFM)</span></label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="velocity">Velocity <span class="unit-display">(fpm)</span></label>
                        <input type="number" id="velocity" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="height-restriction">Height Restriction - Optional <span class="unit-display">(in)</span></label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
        case 'size-friction':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="airflow">Airflow <span class="unit-display">(CFM)</span></label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="friction-rate">Friction Loss Rate <span class="unit-display">(ft/100 ft)</span></label>
                        <input type="number" id="friction-rate" min="0" step="0.0001" value="0.00833" required>
                    </div>
                    <div class="form-col">
                        <label for="height-restriction">Height Restriction - Optional <span class="unit-display">(in)</span></label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
        case 'convert-shape':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="width">Width <span class="unit-display">(in)</span></label>
                        <input type="number" id="width" min="0" step="0.1" required>
                    </div>
                    <div class="form-col">
                        <label for="height">Height <span class="unit-display">(in)</span></label>
                        <input type="number" id="height" min="0" step="0.1" required>
                    </div>
                    <div class="form-col">
                        <label for="airflow">Airflow - Optional <span class="unit-display">(CFM)</span></label>
                        <input type="number" id="airflow" min="0" step="1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <label for="height-restriction">Height Restriction - Optional <span class="unit-display">(in)</span></label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
                    </div>
                </div>
            `;
            break;
        case 'size-velocity-friction':
            html = `
                <div class="form-row">
                    <div class="form-col">
                        <label for="airflow">Airflow <span class="unit-display">(CFM)</span></label>
                        <input type="number" id="airflow" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="velocity">Velocity <span class="unit-display">(fpm)</span></label>
                        <input type="number" id="velocity" min="0" step="1" required>
                    </div>
                    <div class="form-col">
                        <label for="friction-rate">Friction Loss Rate <span class="unit-display">(ft/100 ft)</span></label>
                        <input type="number" id="friction-rate" min="0" step="0.0001" value="0.00833" required>
                    </div>
                </div>
            `;
            break;
    }
    
    dynamicInputs.innerHTML = html;
}

function updateShapeFields() {
    const shape = document.getElementById('original-shape');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    
    if (!shape) return;
    
    if (shape.value === 'round') {
        if (widthInput && widthInput.previousElementSibling) {
            widthInput.previousElementSibling.innerHTML = 'Diameter <span class="unit-display">(in)</span>';
        }
        if (heightInput) {
            heightInput.style.display = 'none';
            if (heightInput.parentElement) {
                heightInput.parentElement.style.display = 'none';
            }
        }
    } else {
        if (widthInput && widthInput.previousElementSibling) {
            widthInput.previousElementSibling.innerHTML = 'Width <span class="unit-display">(in)</span>';
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
        const maxAirflow = isMetric ? 5000 : 10000;
        
        if (airflow < minAirflow || airflow > maxAirflow) {
            throw new Error(`Airflow should be between ${minAirflow} and ${maxAirflow} ${isMetric ? 'L/s' : 'CFM'}`);
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
    const density = parseFloat(document.getElementById('density').value);
    
    if (!airflow || !width || (shape !== 'round' && !height)) {
        throw new Error('Please fill in all required fields');
    }
    
    let hydraulicDiameter, area, velocity, reynoldsNumber, frictionFactor, frictionLoss;
    
    if (shape === 'round') {
        const diameter = width;
        area = Math.PI * Math.pow(diameter / 12, 2) / 4;
        hydraulicDiameter = diameter / 12;
        velocity = airflow / area;
    } else {
        area = (width * height) / 144;
        const perimeter = 2 * (width + height) / 12;
        hydraulicDiameter = 4 * area / perimeter;
        velocity = airflow / area;
    }
    
    const dynamicViscosity = 0.00073;
    const velocityFPS = velocity / 60;
    reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;
    
    const relativeRoughness = roughness / hydraulicDiameter;
    frictionFactor = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);
    
    const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
    const frictionLossInWG = frictionFactor * (100 / (hydraulicDiameter * 12)) * velocityPressure;
    const frictionLoss = frictionLossInWG / 12; // Convert in. wg to feet
    
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
    const density = parseFloat(document.getElementById('density').value);
    
    if (!width || (shape !== 'round' && !height) || !frictionRate) {
        throw new Error('Please fill in all required fields');
    }
    
    let hydraulicDiameter, area;
    
    if (shape === 'round') {
        const diameter = width;
        area = Math.PI * Math.pow(diameter / 12, 2) / 4;
        hydraulicDiameter = diameter / 12;
    } else {
        area = (width * height) / 144;
        const perimeter = 2 * (width + height) / 12;
        hydraulicDiameter = 4 * area / perimeter;
    }
    
    let airflow = 1000;
    let iterations = 0;
    const maxIterations = 50;
    
    while (iterations < maxIterations) {
        const velocity = airflow / area;
        const velocityFPS = velocity / 60;
        const reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / 0.00073;
        const relativeRoughness = roughness / hydraulicDiameter;
        const frictionFactor = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);
        const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
        const calculatedFrictionInWG = frictionFactor * (100 / (hydraulicDiameter * 12)) * velocityPressure;
        const calculatedFriction = calculatedFrictionInWG / 12; // Convert to feet
        
        const error = calculatedFriction - frictionRate;
        if (Math.abs(error) < 0.001) break;
        
        airflow = airflow - error * 1000;
        iterations++;
    }
    
    const velocity = airflow / area;
    
    return {
        airflow: airflow.toFixed(0),
        velocity: velocity.toFixed(0),
        hydraulicDiameter: (hydraulicDiameter * 12).toFixed(2),
        area: area.toFixed(3),
        iterations: iterations
    };
}

function calculateSizeVelocityFriction() {
    return calculateSizeVelocity();
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
    
    if (!airflow || !frictionRate) {
        throw new Error('Please fill in all required fields');
    }
    
    const typicalVelocity = currentUnitSystem === 'metric' ? 4 : 800;
    
    const tempVelocityInput = document.createElement('input');
    tempVelocityInput.id = 'velocity';
    tempVelocityInput.value = typicalVelocity;
    document.body.appendChild(tempVelocityInput);
    
    try {
        const results = calculateSizeVelocity();
        results.designVelocity = typicalVelocity;
        document.body.removeChild(tempVelocityInput);
        return results;
    } catch (error) {
        document.body.removeChild(tempVelocityInput);
        throw error;
    }
}

function convertDuctShape() {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const originalShape = document.getElementById('original-shape').value;
    
    if (!width || (originalShape !== 'round' && !height)) {
        throw new Error('Please fill in all required fields');
    }
    
    let originalArea, equivalentDiameter, equivalentWidth, equivalentHeight;
    
    if (originalShape === 'round') {
        const diameter = width;
        if (currentUnitSystem === 'metric') {
            originalArea = Math.PI * Math.pow(diameter / 1000, 2) / 4;
            const side = Math.sqrt(originalArea) * 1000;
            equivalentWidth = side;
            equivalentHeight = side;
        } else {
            originalArea = Math.PI * Math.pow(diameter, 2) / 4;
            const side = Math.sqrt(originalArea);
            equivalentWidth = side;
            equivalentHeight = side;
        }
        
        return {
            originalDiameter: diameter.toFixed(1),
            originalArea: originalArea.toFixed(4),
            equivalentWidth: equivalentWidth.toFixed(1),
            equivalentHeight: equivalentHeight.toFixed(1),
            equivalentArea: originalArea.toFixed(4),
            conversion: 'Round to Rectangular'
        };
    } else {
        if (currentUnitSystem === 'metric') {
            originalArea = (width * height) / 1000000;
            equivalentDiameter = Math.sqrt(4 * originalArea / Math.PI) * 1000;
        } else {
            originalArea = width * height;
            equivalentDiameter = Math.sqrt(4 * originalArea / Math.PI);
        }
        
        return {
            originalWidth: width.toFixed(1),
            originalHeight: height.toFixed(1),
            originalArea: originalArea.toFixed(4),
            equivalentDiameter: equivalentDiameter.toFixed(1),
            equivalentArea: originalArea.toFixed(4),
            conversion: 'Rectangular to Round'
        };
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    let html = '<div class="results-container">';
    
    for (const [key, value] of Object.entries(results)) {
        const label = formatLabel(key);
        html += `
            <div class="result-item">
                <span class="result-label">${label}</span>
                <span class="result-value">${value}</span>
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
        frictionLoss: isMetric ? 'Friction Loss (Pa/m)' : 'Friction Loss (ft/100 ft)',
        velocityPressure: isMetric ? 'Velocity Pressure (Pa)' : 'Velocity Pressure (in wg)',
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
        originalArea: isMetric ? 'Original Area (m²)' : 'Original Area (ft²)',
        equivalentDiameter: isMetric ? 'Equivalent Diameter (mm)' : 'Equivalent Diameter (in)',
        equivalentWidth: isMetric ? 'Equivalent Width (mm)' : 'Equivalent Width (in)',
        equivalentHeight: isMetric ? 'Equivalent Height (mm)' : 'Equivalent Height (in)',
        equivalentArea: isMetric ? 'Equivalent Area (m²)' : 'Equivalent Area (ft²)',
        designVelocity: isMetric ? 'Design Velocity (m/s)' : 'Design Velocity (fpm)'
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

// ========================================
// AIR BALANCE CALCULATOR FUNCTIONS
// ========================================

// Initialize air balance calculator when page loads
function initializeAirBalance() {
    // Only run on air balance page
    if (!document.getElementById('air-terminals-table')) return;
    
    // Add 3 starter rows
    addTerminalRow();
    addTerminalRow();
    addTerminalRow();
}

// Store air terminals data
let airTerminals = [];
let nextTerminalId = 1;

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
        <td style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="text" 
                   placeholder="e.g., AHU-1" 
                   value="${terminalData.name}"
                   onchange="updateTerminalName(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td style="padding: 0.75rem; border: 1px solid #ddd;">
            <select onchange="updateTerminalType(${terminalData.id}, this.value)"
                    style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
                <option value="supply" selected>Supply</option>
                <option value="return">Return</option>
                <option value="exhaust">Exhaust</option>
            </select>
        </td>
        <td style="padding: 0.75rem; border: 1px solid #ddd;">
            <input type="number" 
                   placeholder="0" 
                   value="${terminalData.cfm}"
                   onchange="updateTerminalCFM(${terminalData.id}, this.value)"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 5px;">
        </td>
        <td style="padding: 0.75rem; border: 1px solid #ddd; text-align: center;">
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
        // Swap with previous item
        [airTerminals[index - 1], airTerminals[index]] = [airTerminals[index], airTerminals[index - 1]];
        rebuildTable();
    }
}

// Move row down
function moveRowDown(id) {
    const index = airTerminals.findIndex(t => t.id === id);
    if (index < airTerminals.length - 1) {
        // Swap with next item
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

// Calculate total airflow for each type and pressurization
function calculateAirflow() {
    // Sum up all air terminals by type
    let returnCFM = 0;
    let exhaustCFM = 0;
    
    airTerminals.forEach(terminal => {
        if (terminal.type === 'return') {
            returnCFM += terminal.cfm;
        } else if (terminal.type === 'exhaust') {
            exhaustCFM += terminal.cfm;
        }
    });
    
    // Get user-entered outside air
    const outsideAirCFM = parseFloat(document.getElementById('outside-air-cfm').value) || 0;
    
    // CALCULATE SUPPLY = RETURN + OUTSIDE AIR
    const supplyCFM = returnCFM + outsideAirCFM;
    
    // Update all airflow displays
    document.getElementById('supply-cfm').value = supplyCFM.toFixed(0);
    document.getElementById('return-cfm').value = returnCFM.toFixed(0);
    document.getElementById('exhaust-cfm').value = exhaustCFM.toFixed(0);
    
    // Get target pressurization settings
    const pressType = document.getElementById('pressurization-type').value;
    const targetPercent = parseFloat(document.getElementById('target-percent').value) || 0;
    
    // Calculate suggested outside air to meet target pressurization
    // Building pressurization is based on OA vs EA
    let suggestedOA = 0;
    
    if (exhaustCFM > 0) {
        if (pressType === 'positive') {
            // Positive: OA should be MORE than EA
            // OA = EA × (1 + targetPercent/100)
            suggestedOA = exhaustCFM * (1 + targetPercent / 100);
        } else if (pressType === 'negative') {
            // Negative: OA should be LESS than EA
            // OA = EA × (1 - targetPercent/100)
            suggestedOA = exhaustCFM * (1 - targetPercent / 100);
        } else {
            // Neutral: OA = EA
            suggestedOA = exhaustCFM;
        }
    } else {
        // No exhaust, can't calculate pressurization
        suggestedOA = 0;
    }
    
    // Don't allow negative suggested OA
    suggestedOA = Math.max(0, suggestedOA);
    
    // Display suggested OA
    document.getElementById('suggested-oa').textContent = suggestedOA.toFixed(0) + ' CFM';
    
    // Calculate actual pressurization based on user's outside air input
    // Actual Pressurization % = ((OA - EA) / EA) × 100
    let actualPercent = 0;
    let actualType = 'Neutral';
    
    if (exhaustCFM > 0) {
        actualPercent = ((outsideAirCFM - exhaustCFM) / exhaustCFM) * 100;
        
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
    
    // Determine status
    let status = 'Within Target';
    let statusColor = '#27ae60';
    
    const tolerance = 1.0; // 1% tolerance
    
    if (exhaustCFM === 0) {
        status = 'No Exhaust Air';
        statusColor = '#7f8c8d';
    } else if (pressType === 'positive' && actualType === 'Positive') {
        if (Math.abs(actualPercent - targetPercent) <= tolerance) {
            status = '✓ Within Target';
            statusColor = '#27ae60';
        } else if (actualPercent < targetPercent) {
            status = '⚠ Below Target';
            statusColor = '#f39c12';
        } else {
            status = '⚠ Above Target';
            statusColor = '#f39c12';
        }
    } else if (pressType === 'negative' && actualType === 'Negative') {
        if (Math.abs(actualPercent - targetPercent) <= tolerance) {
            status = '✓ Within Target';
            statusColor = '#27ae60';
        } else if (actualPercent < targetPercent) {
            status = '⚠ Below Target';
            statusColor = '#f39c12';
        } else {
            status = '⚠ Above Target';
            statusColor = '#f39c12';
        }
    } else if (pressType === 'neutral' && actualType === 'Neutral') {
        status = '✓ Within Target';
        statusColor = '#27ae60';
    } else {
        status = '✗ Wrong Type';
        statusColor = '#e74c3c';
    }
    
    const statusElement = document.getElementById('pressurization-status');
    statusElement.textContent = status;
    statusElement.style.color = statusColor;
    
    // Update explanation text
    updateExplanationText(pressType, targetPercent, actualType, actualPercent, suggestedOA, outsideAirCFM, exhaustCFM);
}

// Update the explanation text based on current state
function updateExplanationText(pressType, targetPercent, actualType, actualPercent, suggestedOA, currentOA, exhaustCFM) {
    const explanationElement = document.getElementById('oa-explanation');
    
    if (exhaustCFM === 0) {
        explanationElement.innerHTML = 'Add exhaust air terminals to calculate building pressurization.';
        return;
    }
    
    let message = '';
    
    if (pressType === 'positive') {
        message = `For <strong>${targetPercent}% positive pressurization</strong>, outside air should be <strong>${targetPercent}% MORE</strong> than exhaust. `;
        message += `Suggested OA = ${exhaustCFM} CFM × ${(1 + targetPercent/100).toFixed(2)} = <strong>${suggestedOA.toFixed(0)} CFM</strong>`;
    } else if (pressType === 'negative') {
        message = `For <strong>${targetPercent}% negative pressurization</strong>, outside air should be <strong>${targetPercent}% LESS</strong> than exhaust. `;
        message += `Suggested OA = ${exhaustCFM} CFM × ${(1 - targetPercent/100).toFixed(2)} = <strong>${suggestedOA.toFixed(0)} CFM</strong>`;
    } else {
        message = `For <strong>neutral pressurization</strong>, outside air should <strong>EQUAL</strong> exhaust. `;
        message += `Suggested OA = ${exhaustCFM} CFM (same as exhaust)`;
    }
    
    explanationElement.innerHTML = message;
}

// Add to initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeAirBalance();
});

// ============================================
// PSYCHROMETRIC CHART CALCULATOR
// Based on ASHRAE Fundamentals
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
    height: 700,
    marginLeft: 80,
    marginRight: 50,
    marginTop: 50,
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
    
    const bg = psychCreateSVGElement('rect', {
        width: psychChartConfig.width,
        height: psychChartConfig.height,
        fill: '#ffffff'
    });
    svg.appendChild(bg);
    
    psychDrawTemperatureGrid(svg);
    psychDrawHumidityGrid(svg);
    psychDrawSaturationCurve(svg);
    psychDrawRelativeHumidityLines(svg);
    psychDrawWetBulbLines(svg);
    psychDrawEnthalpyLines(svg);
    psychDrawAxes(svg);
    psychDrawConnections(svg);
    psychDrawPoints(svg);
}

function psychDrawTemperatureGrid(svg) {
    for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 5) {
        const x = psychTempToX(t);
        const isMajor = t % 10 === 0;
        const line = psychCreateSVGElement('line', {
            x1: x, y1: psychChartConfig.marginTop,
            x2: x, y2: psychChartConfig.height - psychChartConfig.marginBottom,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);
        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: x,
                y: psychChartConfig.height - psychChartConfig.marginBottom + 20,
                class: 'chart-label',
                'text-anchor': 'middle'
            });
            label.textContent = t;
            svg.appendChild(label);
        }
    }
}

function psychDrawHumidityGrid(svg) {
    // Draw grid lines for humidity ratio (lb/lb)
    for (let w = 0; w <= psychChartConfig.wMax; w += 0.002) {
        const y = psychHumidityToY(w);
        const isMajor = (w * 1000) % 4 === 0;
        const line = psychCreateSVGElement('line', {
            x1: psychChartConfig.marginLeft, y1: y,
            x2: psychChartConfig.width - psychChartConfig.marginRight, y2: y,
            class: isMajor ? 'chart-grid-line-major' : 'chart-grid-line'
        });
        svg.appendChild(line);
        if (isMajor) {
            const label = psychCreateSVGElement('text', {
                x: psychChartConfig.marginLeft - 10,
                y: y + 4,
                class: 'chart-label',
                'text-anchor': 'end'
            });
            // Display as lb/lb × 1000 for readability
            label.textContent = (w * 1000).toFixed(0);
            svg.appendChild(label);
        }
    }
}

function psychDrawSaturationCurve(svg) {
    let pathData = 'M';
    let isFirst = true;
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
        }
    }
    const path = psychCreateSVGElement('path', {
        d: pathData,
        class: 'chart-saturation-line'
    });
    svg.appendChild(path);
}

function psychDrawRelativeHumidityLines(svg) {
    const rhValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    rhValues.forEach(rh => {
        let pathData = 'M';
        let isFirst = true;
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
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-rh-line'
        });
        svg.appendChild(path);
    });
}

function psychDrawWetBulbLines(svg) {
    for (let t_wb = 40; t_wb <= 100; t_wb += 10) {
        let pathData = 'M';
        let isFirst = true;
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
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-wb-line'
        });
        svg.appendChild(path);
    }
}

function psychDrawEnthalpyLines(svg) {
    for (let h = 15; h <= 60; h += 5) {
        let pathData = 'M';
        let isFirst = true;
        for (let t = psychChartConfig.tMin; t <= psychChartConfig.tMax; t += 1) {
            const W = (h - 0.240 * t) / (1061 + 0.444 * t);
            if (W <= psychChartConfig.wMax && W >= psychChartConfig.wMin && W >= 0) {
                const x = psychTempToX(t);
                const y = psychHumidityToY(W);
                if (isFirst) {
                    pathData += `${x},${y}`;
                    isFirst = false;
                } else {
                    pathData += ` L${x},${y}`;
                }
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-enthalpy-line'
        });
        svg.appendChild(path);
    }
}

function psychDrawAxes(svg) {
    // X-axis label
    const xLabel = psychCreateSVGElement('text', {
        x: psychChartConfig.width / 2,
        y: psychChartConfig.height - 10,
        class: 'chart-axis-label',
        'text-anchor': 'middle'
    });
    xLabel.textContent = 'Dry Bulb Temperature (°F)';
    svg.appendChild(xLabel);
    
    // Y-axis label - CORRECTED to show actual units
    const yLabel = psychCreateSVGElement('text', {
        x: 20,
        y: psychChartConfig.height / 2,
        class: 'chart-axis-label',
        'text-anchor': 'middle',
        transform: `rotate(-90, 20, ${psychChartConfig.height / 2})`
    });
    yLabel.textContent = 'Humidity Ratio (lb water / lb dry air × 1000)';
    svg.appendChild(yLabel);
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
// INITIALIZATION
// ============================================

// Initialize psychrometric chart after templates load
function initializePsychrometricChart() {
    const svg = document.getElementById('psychChart');
    if (svg) {
        psychDrawChart();
        svg.addEventListener('click', psychHandleChartClick);
    }
}

// Add to main initialization
const originalInitializeAllFeatures = initializeAllFeatures;
initializeAllFeatures = function() {
    originalInitializeAllFeatures();
    setTimeout(initializePsychrometricChart, 500);
};

// ====================================
// INITIALIZE EVERYTHING ON PAGE LOAD
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    // Load templates first, then initialize everything
    initializeTemplates();
});












