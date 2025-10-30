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
    
    // Add psychrometric initialization here
    setTimeout(initializePsychrometricChart, 500);
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
// HEADER SEARH FUNCTIONALITY
// ====================================
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        const searchMap = {
            'duct': 'ductulator.html',
            'psychrometric': 'psychrometric.html',
            'psychro': 'psychrometric.html',
            'chart': 'psychrometric.html',
            'boiler': 'boiler_calculator.html',
            'chiller': 'chiller_calculator.html',
            'coil': 'coil_selection.html',
            'fan': 'fan_selection.html',
            'air balance': 'air_balance.html',
            'conversion': 'conversions.html',
            'unit': 'conversions.html'
        };

        for (let key in searchMap) {
            if (query.includes(key)) {
                window.location.href = searchMap[key];
                return;
            }
        }

        alert('No results found. Try "duct", "psychrometric", "boiler", "chiller", "coil", "fan", or "conversion"');
    }
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
// CHILLER CALCULATOR FUNCTIONS
// ========================================

let chillerSystemData = {};

function toggleChillerGlycolMix() {
    const fluidType = document.getElementById('chiller-fluidType');
    const glycolInput = document.getElementById('chiller-glycolMixInput');
    if (fluidType && glycolInput) {
        if (fluidType.value === 'propylene' || fluidType.value === 'ethylene') {
            glycolInput.style.display = 'block';
        } else {
            glycolInput.style.display = 'none';
        }
    }
}

function updateChillerEfficiencyLabel() {
    const efficiencyType = document.getElementById('chiller-efficiencyType');
    const efficiencyLabel = document.getElementById('chiller-efficiencyLabel');
    const efficiencyHint = document.getElementById('chiller-efficiencyHint');
    const efficiencyValue = document.getElementById('chiller-efficiencyValue');

    if (efficiencyType && efficiencyLabel && efficiencyHint) {
        if (efficiencyType.value === 'eer') {
            efficiencyLabel.textContent = 'EER Value:';
            efficiencyHint.textContent = 'Typical air-cooled: 10-12 EER, water-cooled: 14-20 EER';
            efficiencyValue.placeholder = '12-20 for EER';
            if (!efficiencyValue.value || efficiencyValue.value < 5) {
                efficiencyValue.value = '14';
            }
        } else {
            efficiencyLabel.textContent = 'kW/Ton Value:';
            efficiencyHint.textContent = 'Typical air-cooled: 0.8-1.2 kW/ton, water-cooled: 0.5-0.7 kW/ton';
            efficiencyValue.placeholder = '0.5-1.2 for kW/ton';
            if (!efficiencyValue.value || efficiencyValue.value > 5) {
                efficiencyValue.value = '0.7';
            }
        }
    }
}

function calculateChillerSystem() {
    const sqft = parseFloat(document.getElementById('chiller-sqft').value);
    const safetyFactorPercent = parseFloat(document.getElementById('chiller-safetyFactor').value);
    const btuPerSqFt = parseFloat(document.getElementById('chiller-btuPerSqFt').value);

    if (!btuPerSqFt || btuPerSqFt <= 0) {
        alert('Please enter a valid BTU/sq ft value');
        return;
    }

    if (!sqft || sqft <= 0) {
        alert('Please enter a valid square footage');
        return;
    }

    const fluidType = document.getElementById('chiller-fluidType').value;
    const enterTemp = parseFloat(document.getElementById('chiller-enterTemp').value);
    const leaveTemp = parseFloat(document.getElementById('chiller-leaveTemp').value);
    const glycolPercent = parseFloat(document.getElementById('chiller-glycolPercent').value) || 0;

    if (!enterTemp || !leaveTemp) {
        alert('Please enter valid entering and leaving temperatures');
        return;
    }

    const deltaT = Math.abs(enterTemp - leaveTemp);
    if (deltaT === 0) {
        alert('Temperature difference cannot be zero');
        return;
    }

    const baseCoolingLoad = sqft * btuPerSqFt;
    const safetyFactor = 1 + (safetyFactorPercent / 100);
    const requiredBTU = baseCoolingLoad * safetyFactor;
    const requiredTons = requiredBTU / 12000; // 12,000 BTU/hr = 1 ton

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

    chillerSystemData = {
        requiredBTU: requiredBTU,
        requiredTons: requiredTons,
        baseCoolingLoad: baseCoolingLoad,
        deltaT: deltaT,
        specificHeat: specificHeat,
        density: density,
        specificGravity: specificGravity
    };

    document.getElementById('chiller-coolingLoad').textContent = formatNumber(baseCoolingLoad) + ' BTU/hr';
    document.getElementById('chiller-requiredBTU').textContent = formatNumber(requiredBTU) + ' BTU/hr';
    document.getElementById('chiller-requiredTons').textContent = requiredTons.toFixed(1) + ' Tons';
    document.getElementById('chiller-deltaT').textContent = deltaT.toFixed(1) + '°F';
    document.getElementById('chiller-specificHeat').textContent = specificHeat.toFixed(3) + ' BTU/lb·°F';
    document.getElementById('chiller-density').textContent = density.toFixed(2) + ' lb/gal';
    document.getElementById('chiller-systemFlow').textContent = systemFlowGPM.toFixed(1) + ' GPM';

    document.getElementById('chiller-systemResults').style.display = 'block';
}

function calculateChillerSelectedSystem() {
    if (!chillerSystemData.requiredBTU) {
        alert('Please calculate System Requirements first');
        return;
    }

    const chillerQuantity = parseInt(document.getElementById('chiller-quantity').value);
    const chillerCapacityTons = parseFloat(document.getElementById('chiller-capacity').value);
    const efficiencyType = document.getElementById('chiller-efficiencyType').value;
    const efficiencyValue = parseFloat(document.getElementById('chiller-efficiencyValue').value);

    if (!chillerQuantity || chillerQuantity <= 0) {
        alert('Please enter a valid number of chillers');
        return;
    }

    if (!chillerCapacityTons || chillerCapacityTons <= 0) {
        alert('Please enter a valid chiller capacity');
        return;
    }

    if (!efficiencyValue || efficiencyValue <= 0) {
        alert('Please enter a valid efficiency value');
        return;
    }

    const capacityPerChillerBTU = chillerCapacityTons * 12000;
    const totalCapacityBTU = capacityPerChillerBTU * chillerQuantity;
    const totalCapacityTons = chillerCapacityTons * chillerQuantity;
    const actualSafetyPercent = ((totalCapacityBTU - chillerSystemData.baseCoolingLoad) / chillerSystemData.baseCoolingLoad) * 100;

    // Calculate power consumption
    let powerPerChillerKW;
    if (efficiencyType === 'eer') {
        // EER = BTU/hr / Watts, so Watts = BTU/hr / EER
        // Convert to kW: kW = (BTU/hr / EER) / 1000
        powerPerChillerKW = (capacityPerChillerBTU / efficiencyValue) / 1000;
    } else {
        // kW/ton metric
        powerPerChillerKW = chillerCapacityTons * efficiencyValue;
    }

    const totalPowerKW = powerPerChillerKW * chillerQuantity;

    // Calculate flow rates
    const flowPerChiller = capacityPerChillerBTU / (500 * chillerSystemData.deltaT * chillerSystemData.specificGravity * chillerSystemData.specificHeat);
    const totalFlow = flowPerChiller * chillerQuantity;

    document.getElementById('chiller-capacityPerChiller').textContent = chillerCapacityTons.toFixed(1) + ' Tons (' + formatNumber(capacityPerChillerBTU) + ' BTU/hr)';
    document.getElementById('chiller-totalCapacity').textContent = totalCapacityTons.toFixed(1) + ' Tons (' + formatNumber(totalCapacityBTU) + ' BTU/hr)';
    document.getElementById('chiller-actualSafety').textContent = actualSafetyPercent.toFixed(1) + '%';
    document.getElementById('chiller-powerPerChiller').textContent = powerPerChillerKW.toFixed(1) + ' kW';
    document.getElementById('chiller-totalPower').textContent = totalPowerKW.toFixed(1) + ' kW';
    document.getElementById('chiller-flowPerChiller').textContent = flowPerChiller.toFixed(1) + ' GPM';
    document.getElementById('chiller-totalFlow').textContent = totalFlow.toFixed(1) + ' GPM';

    document.getElementById('chiller-selectedResults').style.display = 'block';
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
    const stdNo = document.getElementById('std-no');
    const advancedSection = document.getElementById('advanced-conditions');
    
    if (stdNo && stdNo.checked) {
        // Show advanced conditions
        advancedSection.style.display = 'block';
    } else {
        // Hide advanced conditions
        advancedSection.style.display = 'none';
    }
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
                    <div class="form-group">
                        <label for="height-restriction">Height Restriction - Optional (in)</label>
                        <input type="number" id="height-restriction" min="0" step="0.1">
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
    
    const dynamicViscosity = 1.22e-5; // lb/(ft·s) for air at 70°F
    const velocityFPS = velocity / 60;
    reynoldsNumber = (density * velocityFPS * hydraulicDiameter) / dynamicViscosity;
    
    const relativeRoughness = roughness / hydraulicDiameter;
    frictionFactor = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);
    
    const velocityPressure = (density / 0.075) * Math.pow(velocity / 4005, 2);
    const frictionLossInWG = frictionFactor * (100 / hydraulicDiameter) * velocityPressure;
    frictionLoss = frictionLossInWG / 12; // Convert in. wg to feet
    
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
    const heightRestriction = parseFloat(document.getElementById('height-restriction')?.value);
    const roughness = parseFloat(document.getElementById('duct-roughness').value);
    const shape = document.getElementById('original-shape').value;
    const density = parseFloat(document.getElementById('density').value);
    
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
        
        return {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: ((width * height) / 144).toFixed(3),
            velocity: (airflow / ((width * height) / 144)).toFixed(0),
            aspectRatio: (width / height).toFixed(2),
            shape: 'Rectangular',
            frictionRate: frictionRate.toFixed(3)
        };
    }
}

// Helper function to calculate equivalent rectangular and oval sizes
function calculateRectEquivalents(roundDiameter, airflow) {
    const roundArea = Math.PI * Math.pow(roundDiameter / 12, 2) / 4;
    
    // 1:1 ratio (square) - equal area
    const side_1_1 = Math.sqrt(roundArea) * 12;
    
    // 2:1 ratio - equal area
    const height_2_1 = Math.sqrt(roundArea / 2) * 12;
    const width_2_1 = height_2_1 * 2;
    
    // 3:1 ratio - equal area
    const height_3_1 = Math.sqrt(roundArea / 3) * 12;
    const width_3_1 = height_3_1 * 3;
    
    // Calculate velocities (same for all since same area)
    const velocity = (airflow / roundArea).toFixed(0);
    
    // Calculate flat oval dimensions using ASHRAE/SMACNA equivalent diameter formula
    // De = 1.55 × [(a × b)^0.625] / [(a + b)^0.25]
    // Where a = major axis, b = minor axis
    // Solving for dimensions that give equivalent diameter = roundDiameter

    // For 2:1 aspect ratio (a = 2b)
    // De = 1.55 × [(2b²)^0.625] / [(3b)^0.25]
    // Solving for b: b = De × (3)^0.25 / (1.55 × 2^0.625)
    const ratio_2_1 = 2;
    const oval_2_1_minor = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.55 * Math.pow(ratio_2_1, 0.625));
    const oval_2_1_major = ratio_2_1 * oval_2_1_minor;

    // For 3:1 aspect ratio (a = 3b)
    // De = 1.55 × [(3b²)^0.625] / [(4b)^0.25]
    // Solving for b: b = De × (4)^0.25 / (1.55 × 3^0.625)
    const ratio_3_1 = 3;
    const oval_3_1_minor = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.55 * Math.pow(ratio_3_1, 0.625));
    const oval_3_1_major = ratio_3_1 * oval_3_1_minor;
    
    return {
        rect_1_1_width: side_1_1.toFixed(1),
        rect_1_1_height: side_1_1.toFixed(1),
        rect_1_1_velocity: velocity,
        rect_2_1_width: width_2_1.toFixed(1),
        rect_2_1_height: height_2_1.toFixed(1),
        rect_2_1_velocity: velocity,
        rect_3_1_width: width_3_1.toFixed(1),
        rect_3_1_height: height_3_1.toFixed(1),
        rect_3_1_velocity: velocity,
        oval_2_1_major: oval_2_1_major.toFixed(1),
        oval_2_1_minor: oval_2_1_minor.toFixed(1),
        oval_3_1_major: oval_3_1_major.toFixed(1),
        oval_3_1_minor: oval_3_1_minor.toFixed(1)
    };
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
    
    // Main results section
    html += '<h4 style="color: #2c3e50; margin-bottom: 1rem;">Primary Results</h4>';
    
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
    const primaryKeys = ['area', 'velocity', 'frictionRate', 'frictionLoss', 'aspectRatio', 'reynoldsNumber', 'frictionFactor', 'velocityPressure'];
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
                <span class="result-value">${results.oval_2_1_major}" × ${results.oval_2_1_minor}"</span>
            </div>
        `;
        
        // 3:1 Oval
        html += `
            <div class="result-item" style="background: #f3e5f5; border-left: 4px solid #9c27b0;">
                <span class="result-label">Flat Oval (3:1)</span>
                <span class="result-value">${results.oval_3_1_major}" × ${results.oval_3_1_minor}"</span>
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
        stroke: '#bdc3c7',
        'stroke-width': 1
    });
    svg.appendChild(chartBg);

    psychDrawTemperatureGrid(svg);
    psychDrawHumidityGrid(svg);
    psychDrawSpecificVolumeLines(svg);
    psychDrawEnthalpyLines(svg);
    psychDrawWetBulbLines(svg);
    psychDrawRelativeHumidityLines(svg);
    psychDrawSaturationCurve(svg);
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

    // Add "100% RH" label on the saturation line
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
                lastX = x;
                lastY = y;
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-rh-line',
            stroke: rh === 50 ? '#2980b9' : '#3498db',
            'stroke-width': rh === 50 ? 1.5 : 1
        });
        svg.appendChild(path);

        // Add label at the end of the line
        if (lastX && lastY) {
            const label = psychCreateSVGElement('text', {
                x: lastX + 5,
                y: lastY,
                class: 'chart-line-label',
                fill: '#2980b9',
                'font-size': '11px',
                'font-weight': '600'
            });
            label.textContent = `${rh}%`;
            svg.appendChild(label);
        }
    });
}

function psychDrawWetBulbLines(svg) {
    for (let t_wb = 40; t_wb <= 100; t_wb += 10) {
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
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-wb-line'
        });
        svg.appendChild(path);

        // Add label near the saturation curve
        if (labelX && labelY) {
            const label = psychCreateSVGElement('text', {
                x: labelX - 15,
                y: labelY - 5,
                class: 'chart-line-label',
                fill: '#8e44ad',
                'font-size': '10px',
                'font-weight': '500'
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
            }
        }
        const path = psychCreateSVGElement('path', {
            d: pathData,
            class: 'chart-enthalpy-line'
        });
        svg.appendChild(path);

        // Add label at the top-left of the line
        if (firstX && firstY && h % 10 === 0) {
            const label = psychCreateSVGElement('text', {
                x: firstX - 25,
                y: firstY - 5,
                class: 'chart-line-label',
                fill: '#d35400',
                'font-size': '10px',
                'font-weight': '500',
                transform: `rotate(-30, ${firstX - 25}, ${firstY - 5})`
            });
            label.textContent = `${h} BTU/lb`;
            svg.appendChild(label);
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
            'stroke-width': 0.8,
            'stroke-dasharray': '4,2',
            fill: 'none',
            opacity: 0.5
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
                'font-weight': '500',
                transform: `rotate(15, ${labelX + 5}, ${labelY + 3})`
            });
            label.textContent = `${v} ft³/lb`;
            svg.appendChild(label);
        }
    });
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

    // Add chart legend in top-right corner
    const legendX = psychChartConfig.width - psychChartConfig.marginRight - 150;
    const legendY = psychChartConfig.marginTop + 10;

    const legendItems = [
        { color: '#c0392b', text: '100% RH (Saturation)', dash: false, width: 2.5 },
        { color: '#3498db', text: 'Relative Humidity', dash: true, width: 1 },
        { color: '#8e44ad', text: 'Wet Bulb Temp', dash: false, width: 1 },
        { color: '#d35400', text: 'Enthalpy', dash: false, width: 1 },
        { color: '#16a085', text: 'Specific Volume', dash: true, width: 0.8 }
    ];

    // Legend background
    const legendBg = psychCreateSVGElement('rect', {
        x: legendX - 10,
        y: legendY - 5,
        width: 160,
        height: legendItems.length * 20 + 10,
        fill: 'white',
        stroke: '#bdc3c7',
        'stroke-width': 1,
        rx: 5,
        opacity: 0.95
    });
    svg.appendChild(legendBg);

    // Legend title
    const legendTitle = psychCreateSVGElement('text', {
        x: legendX + 70,
        y: legendY + 10,
        class: 'chart-label',
        'text-anchor': 'middle',
        'font-weight': '700',
        'font-size': '11px',
        fill: '#2c3e50'
    });
    legendTitle.textContent = 'Chart Legend';
    svg.appendChild(legendTitle);

    // Legend items
    legendItems.forEach((item, i) => {
        const y = legendY + 25 + i * 20;

        // Line sample
        const line = psychCreateSVGElement('line', {
            x1: legendX,
            y1: y,
            x2: legendX + 20,
            y2: y,
            stroke: item.color,
            'stroke-width': item.width,
            'stroke-dasharray': item.dash ? '3,2' : 'none'
        });
        svg.appendChild(line);

        // Text label
        const text = psychCreateSVGElement('text', {
            x: legendX + 25,
            y: y + 4,
            class: 'chart-label',
            'font-size': '10px',
            fill: '#2c3e50'
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

// ============================================
// UPDATES 20251013
// ============================================
// Add to main initialization
function validateNumberInput(input, min, max, label) {
    const value = parseFloat(input.value);
    const warningDiv = input.nextElementSibling?.classList.contains('input-warning') 
        ? input.nextElementSibling 
        : null;
    
    if (value < min || value > max) {
        input.style.borderColor = '#e74c3c';
        if (!warningDiv) {
            const warning = document.createElement('div');
            warning.className = 'input-warning';
            warning.style.color = '#e74c3c';
            warning.style.fontSize = '0.85rem';
            warning.style.marginTop = '0.25rem';
            warning.textContent = `${label} should be between ${min} and ${max}`;
            input.parentElement.appendChild(warning);
        }
    } else {
        input.style.borderColor = '#27ae60';
        if (warningDiv) warningDiv.remove();
    }
}

// Example usage for airflow inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.id === 'airflow') {
            validateNumberInput(this, 50, 50000, 'Airflow');
        }
    });
});

function saveCalculation(type, inputs, results) {
    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    history.unshift({
        type: type,
        timestamp: new Date().toLocaleString(),
        inputs: inputs,
        results: results
    });
    // Keep only last 10 calculations
    if (history.length > 10) history.pop();
    localStorage.setItem('calcHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const historyDiv = document.getElementById('historyList');
    if (!historyDiv) return;
    
    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    if (history.length === 0) {
        historyDiv.innerHTML = '<p class="info-text">No calculations yet</p>';
        return;
    }
    
    historyDiv.innerHTML = history.map((calc, index) => `
        <div class="history-item" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;" onclick="loadCalculation(${index})">
            <div style="font-weight: 600; color: #2c3e50;">${calc.type}</div>
            <div style="font-size: 0.85rem; color: #7f8c8d;">${calc.timestamp}</div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        localStorage.removeItem('calcHistory');
        displayHistory();
    }
}

// ====================================
// FAN SELECTION TOOL
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

const CACHE_NAME = 'engrassist-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/header.html',
  '/footer.html',
  '/mechanical_page.html',
  '/ductulator.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

// ====================================
// COIL SELECTION CALCULATOR
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

// ====================================
// COOKIE CONSENT BANNER
// ====================================

function initializeCookieConsent() {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (!cookieConsent) {
        // Show the cookie banner after a short delay
        setTimeout(() => {
            showCookieBanner();
        }, 1000);
    }
}

function showCookieBanner() {
    // Check if banner already exists
    if (document.getElementById('cookie-consent-banner')) return;

    // Create cookie consent banner
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                <h4>🍪 Cookie Notice</h4>
                <p>We use cookies and similar technologies to enhance your experience and show relevant advertisements through Google AdSense. By continuing to use this site, you consent to our use of cookies.</p>
                <p class="cookie-links">
                    <a href="privacy.html" target="_blank">Privacy Policy</a> |
                    <a href="terms.html" target="_blank">Terms of Service</a>
                </p>
            </div>
            <div class="cookie-consent-buttons">
                <button id="cookie-accept" class="cookie-btn cookie-btn-accept">Accept All</button>
                <button id="cookie-reject" class="cookie-btn cookie-btn-reject">Essential Only</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('cookie-accept').addEventListener('click', () => {
        acceptCookies();
    });

    document.getElementById('cookie-reject').addEventListener('click', () => {
        rejectCookies();
    });

    // Show banner with animation
    setTimeout(() => {
        banner.classList.add('show');
    }, 100);
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    hideCookieBanner();
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'essential');
    hideCookieBanner();
    // Note: For essential-only mode, you would need to disable AdSense
    // This is a simplified implementation
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// ====================================
// INITIALIZE EVERYTHING ON PAGE LOAD
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    // Load templates first, then initialize everything
    initializeTemplates();

    // Initialize cookie consent
    initializeCookieConsent();
});




























