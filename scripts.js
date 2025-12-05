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
    // Determine the correct path prefix based on current page location
    const path = window.location.pathname;
    const pathPrefix = path.includes('/articles/') ? '../' : '';

    // Load both templates in parallel for speed
    Promise.all([
        loadTemplate('header-placeholder', pathPrefix + 'header.html'),
        loadTemplate('footer-placeholder', pathPrefix + 'footer.html')
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
    initializeAuth();

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
// CLOUDFLARE WORKERS AUTHENTICATION
// ====================================

// Cloudflare Worker API URL
// UPDATE THIS after deploying your worker
// For local testing: 'http://localhost:8787'
// For production: 'https://engrassist-api.your-subdomain.workers.dev'
const CLOUDFLARE_API_URL = 'http://localhost:8787';

// Google OAuth Client ID (optional - for Google Sign-In)
// Get this from: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Global variables
let currentUser = null;
let authToken = null;

// Initialize authentication on page load
function initializeAuth() {
    // Check for saved token
    authToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');

    if (authToken && savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForAuthState(currentUser);

        // Load project if on workflow hub page
        if (window.location.pathname.includes('workflow_hub')) {
            loadProjectFromStorage();
        }
    } else {
        updateUIForAuthState(null);
    }

    // Initialize Google Sign-In if available
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn
        });
    }
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const signInBtn = document.getElementById('signInBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userPhoto = document.getElementById('userPhoto');

    // Mobile elements
    const mobileUserProfile = document.getElementById('mobileUserProfile');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileUserPhoto = document.getElementById('mobileUserPhoto');
    const mobileSignInLink = document.getElementById('mobileSignInLink');
    const mobileSignOutLink = document.getElementById('mobileSignOutLink');
    const mobileWorkflowLink = document.getElementById('mobileWorkflowLink');
    const mobileProjectsLink = document.getElementById('mobileProjectsLink');
    const mobileDivider = document.getElementById('mobileDivider');

    if (user) {
        // Generate avatar SVG if no photo
        const avatarSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%23667eea"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">' + (user.name ? user.name[0].toUpperCase() : 'U') + '</text></svg>';

        // User is signed in - Desktop
        if (signInBtn) signInBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (userName) userName.textContent = user.name || user.email.split('@')[0];
        if (userPhoto) userPhoto.src = user.photoURL || avatarSvg;

        // User is signed in - Mobile
        if (mobileUserProfile) mobileUserProfile.style.display = 'flex';
        if (mobileUserName) mobileUserName.textContent = user.name || user.email.split('@')[0];
        if (mobileUserEmail) mobileUserEmail.textContent = user.email;
        if (mobileUserPhoto) mobileUserPhoto.src = user.photoURL || avatarSvg.replace('32', '48').replace('16', '24').replace('22', '32').replace('16"', '20"');
        if (mobileSignInLink) mobileSignInLink.style.display = 'none';
        if (mobileSignOutLink) mobileSignOutLink.style.display = 'block';
        if (mobileWorkflowLink) mobileWorkflowLink.style.display = 'block';
        if (mobileProjectsLink) mobileProjectsLink.style.display = 'block';
        if (mobileDivider) mobileDivider.style.display = 'block';
    } else {
        // User is signed out - Desktop
        if (signInBtn) signInBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';

        // User is signed out - Mobile
        if (mobileUserProfile) mobileUserProfile.style.display = 'none';
        if (mobileSignInLink) mobileSignInLink.style.display = 'block';
        if (mobileSignOutLink) mobileSignOutLink.style.display = 'none';
        if (mobileWorkflowLink) mobileWorkflowLink.style.display = 'none';
        if (mobileProjectsLink) mobileProjectsLink.style.display = 'none';
        if (mobileDivider) mobileDivider.style.display = 'none';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    if (typeof google === 'undefined') {
        console.log('Google Sign-In not available, showing email sign-in');
        showEmailSignInModal();
        return;
    }

    google.accounts.id.prompt(); // Show One Tap dialog
}

// Handle Google Sign-In callback
async function handleGoogleSignIn(response) {
    try {
        // Decode JWT to get user info
        const payload = parseJwt(response.credential);

        const result = await fetch(`${CLOUDFLARE_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idToken: response.credential,
                email: payload.email,
                name: payload.name,
                photoURL: payload.picture
            })
        });

        const data = await result.json();

        if (data.success) {
            currentUser = data.user;
            authToken = data.token;

            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            updateUIForAuthState(currentUser);
            showNotification('Signed in successfully!', 'success');

            if (window.location.pathname.includes('workflow_hub')) {
                loadProjectFromStorage();
            }
        } else {
            throw new Error(data.error || 'Sign in failed');
        }
    } catch (error) {
        console.error('Google sign in error:', error);
        showNotification('Sign in failed: ' + error.message, 'error');
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            authToken = data.token;

            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            updateUIForAuthState(currentUser);
            showNotification('Signed in successfully!', 'success');

            if (window.location.pathname.includes('workflow_hub')) {
                loadProjectFromStorage();
            }

            return true;
        } else {
            throw new Error(data.error || 'Sign in failed');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        showNotification('Sign in failed: ' + error.message, 'error');
        return false;
    }
}

// Sign up with email and password
async function signUpWithEmail(email, password, name) {
    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            authToken = data.token;

            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            updateUIForAuthState(currentUser);
            showNotification('Account created successfully!', 'success');

            return true;
        } else {
            throw new Error(data.error || 'Sign up failed');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showNotification('Sign up failed: ' + error.message, 'error');
        return false;
    }
}

// Sign out
async function signOut() {
    currentUser = null;
    authToken = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');

    updateUIForAuthState(null);
    showNotification('Signed out successfully', 'success');

    // Close menus
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) mobileMenu.classList.remove('show');
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) userDropdown.classList.remove('show');
}

// Toggle user dropdown menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userProfile = document.getElementById('userProfile');
    const dropdown = document.getElementById('userDropdown');

    if (dropdown && userProfile && !userProfile.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Parse JWT token (client-side only - for display purposes)
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// ====================================
// EMAIL/PASSWORD SIGN-IN MODALS
// ====================================

// Show email/password sign-in modal
function showEmailSignInModal() {
    let modal = document.getElementById('emailSignInModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'emailSignInModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Sign In</h2>
                    <button class="modal-close" onclick="closeEmailSignInModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="signInEmail">Email:</label>
                        <input type="email" id="signInEmail" class="form-control" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="signInPassword">Password:</label>
                        <input type="password" id="signInPassword" class="form-control" placeholder="Password">
                    </div>
                    <p style="text-align: center; margin: 10px 0;">
                        Don't have an account? <a href="#" onclick="showSignUpModal(); return false;">Sign up</a>
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeEmailSignInModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="submitSignIn()">Sign In</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

function closeEmailSignInModal() {
    const modal = document.getElementById('emailSignInModal');
    if (modal) modal.style.display = 'none';
}

async function submitSignIn() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    if (!email || !password) {
        showNotification('Please enter email and password', 'warning');
        return;
    }

    const success = await signInWithEmail(email, password);
    if (success) {
        closeEmailSignInModal();
    }
}

// Show sign-up modal
function showSignUpModal() {
    closeEmailSignInModal();

    let modal = document.getElementById('signUpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'signUpModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Create Account</h2>
                    <button class="modal-close" onclick="closeSignUpModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="signUpName">Name:</label>
                        <input type="text" id="signUpName" class="form-control" placeholder="Your Name">
                    </div>
                    <div class="form-group">
                        <label for="signUpEmail">Email:</label>
                        <input type="email" id="signUpEmail" class="form-control" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="signUpPassword">Password:</label>
                        <input type="password" id="signUpPassword" class="form-control" placeholder="Password (6+ characters)">
                    </div>
                    <p style="text-align: center; margin: 10px 0;">
                        Already have an account? <a href="#" onclick="showEmailSignInModal(); return false;">Sign in</a>
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeSignUpModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="submitSignUp()">Create Account</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

function closeSignUpModal() {
    const modal = document.getElementById('signUpModal');
    if (modal) modal.style.display = 'none';
}

async function submitSignUp() {
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    if (!email || !password) {
        showNotification('Please enter email and password', 'warning');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'warning');
        return;
    }

    const success = await signUpWithEmail(email, password, name);
    if (success) {
        closeSignUpModal();
    }
}

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
            'boiler': 'boiler_sizing.html',
            'chiller': 'chiller_sizing.html',
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
    const sqftPerTon = parseFloat(document.getElementById('chiller-sqftPerTon').value);

    if (!sqftPerTon || sqftPerTon <= 0) {
        alert('Please enter a valid square feet per ton value');
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

    const baseTons = sqft / sqftPerTon;
    const baseCoolingLoad = baseTons * 12000; // Convert tons to BTU/hr
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

    // Clear results when calculation type changes
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

    // Calculate rectangular dimensions using ASHRAE equivalent diameter formula
    // De = 1.3 × [(a × b)^0.625] / [(a + b)^0.25]
    // Where a = width, b = height
    // For aspect ratio R where a = R × b:
    // De = 1.3 × [(R × b²)^0.625] / [((R + 1) × b)^0.25]
    // Solving for b: b = De × (R + 1)^0.25 / (1.3 × R^0.625)

    // 1:1 ratio (square)
    const ratio_1_1 = 1;
    const rect_1_1_height = roundDiameter * Math.pow(ratio_1_1 + 1, 0.25) / (1.3 * Math.pow(ratio_1_1, 0.625));
    const rect_1_1_width = ratio_1_1 * rect_1_1_height;
    const rect_1_1_area = (rect_1_1_width * rect_1_1_height) / 144; // Convert to sq ft

    // 2:1 ratio
    const ratio_2_1 = 2;
    const rect_2_1_height = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.3 * Math.pow(ratio_2_1, 0.625));
    const rect_2_1_width = ratio_2_1 * rect_2_1_height;
    const rect_2_1_area = (rect_2_1_width * rect_2_1_height) / 144; // Convert to sq ft

    // 3:1 ratio
    const ratio_3_1 = 3;
    const rect_3_1_height = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.3 * Math.pow(ratio_3_1, 0.625));
    const rect_3_1_width = ratio_3_1 * rect_3_1_height;
    const rect_3_1_area = (rect_3_1_width * rect_3_1_height) / 144; // Convert to sq ft

    // Calculate velocities based on actual areas
    const rect_1_1_velocity = (airflow / rect_1_1_area).toFixed(0);
    const rect_2_1_velocity = (airflow / rect_2_1_area).toFixed(0);
    const rect_3_1_velocity = (airflow / rect_3_1_area).toFixed(0);

    // Calculate flat oval dimensions using ASHRAE/SMACNA equivalent diameter formula
    // De = 1.55 × [(a × b)^0.625] / [(a + b)^0.25]
    // Where a = major axis, b = minor axis
    // Solving for dimensions that give equivalent diameter = roundDiameter

    // For 2:1 aspect ratio (a = 2b)
    // De = 1.55 × [(2b²)^0.625] / [(3b)^0.25]
    // Solving for b: b = De × (3)^0.25 / (1.55 × 2^0.625)
    const oval_2_1_minor = roundDiameter * Math.pow(ratio_2_1 + 1, 0.25) / (1.55 * Math.pow(ratio_2_1, 0.625));
    const oval_2_1_major = ratio_2_1 * oval_2_1_minor;

    // For 3:1 aspect ratio (a = 3b)
    // De = 1.55 × [(3b²)^0.625] / [(4b)^0.25]
    // Solving for b: b = De × (4)^0.25 / (1.55 × 3^0.625)
    const oval_3_1_minor = roundDiameter * Math.pow(ratio_3_1 + 1, 0.25) / (1.55 * Math.pow(ratio_3_1, 0.625));
    const oval_3_1_major = ratio_3_1 * oval_3_1_minor;

    return {
        rect_1_1_width: rect_1_1_width.toFixed(1),
        rect_1_1_height: rect_1_1_height.toFixed(1),
        rect_1_1_velocity: rect_1_1_velocity,
        rect_2_1_width: rect_2_1_width.toFixed(1),
        rect_2_1_height: rect_2_1_height.toFixed(1),
        rect_2_1_velocity: rect_2_1_velocity,
        rect_3_1_width: rect_3_1_width.toFixed(1),
        rect_3_1_height: rect_3_1_height.toFixed(1),
        rect_3_1_velocity: rect_3_1_velocity,
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
            'stroke-width': isMajor ? 1.1 : 0.7,
            opacity: isMajor ? 0.6 : 0.4
        });
        svg.appendChild(path);

        // Add label near the saturation curve for major lines only
        if (labelX && labelY && isMajor) {
            const label = psychCreateSVGElement('text', {
                x: labelX - 15,
                y: labelY - 5,
                class: 'chart-line-label',
                fill: '#8e44ad',
                'font-size': '10px',
                'font-weight': '600'
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
        y: psychChartConfig.height - 10,
        class: 'chart-axis-label',
        'text-anchor': 'middle',
        'font-size': '14px',
        'font-weight': '600',
        fill: '#2c3e50'
    });
    xLabel.textContent = 'DRY BULB TEMPERATURE (°F)';
    svg.appendChild(xLabel);

    // Y-axis label - CORRECTED to show actual units
    const yLabel = psychCreateSVGElement('text', {
        x: 20,
        y: psychChartConfig.height / 2,
        'text-anchor': 'middle',
        'font-size': '13px',
        'font-weight': '600',
        fill: '#2c3e50',
        transform: `rotate(-90, 20, ${psychChartConfig.height / 2})`
    });
    yLabel.textContent = 'HUMIDITY RATIO (lb water / lb dry air × 1000)';
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
// ENERGY EFFICIENCY CALCULATORS
// ====================================

/**
 * Calculate VFD (Variable Frequency Drive) energy savings
 * Uses fan laws: Power varies with cube of speed ratio
 */
function calculateVFDSavings() {
    // Get input values
    const designCFM = parseFloat(document.getElementById('vfdDesignCFM').value);
    const operatingCFM = parseFloat(document.getElementById('vfdOperatingCFM').value);
    const motorHP = parseFloat(document.getElementById('vfdMotorHP').value);
    const hours = parseFloat(document.getElementById('vfdHours').value);
    const elecCost = parseFloat(document.getElementById('vfdElecCost').value);

    // Validate inputs
    if (isNaN(designCFM) || isNaN(operatingCFM) || isNaN(motorHP) || isNaN(hours) || isNaN(elecCost) ||
        designCFM <= 0 || operatingCFM <= 0 || motorHP <= 0 || hours <= 0 || elecCost < 0) {
        document.getElementById('vfdResults').innerHTML =
            '<div class="error-message">Please enter valid positive numbers for all fields.</div>';
        return;
    }

    if (operatingCFM > designCFM) {
        document.getElementById('vfdResults').innerHTML =
            '<div class="error-message">Operating airflow cannot exceed design airflow.</div>';
        return;
    }

    // Calculate speed ratio
    const speedRatio = operatingCFM / designCFM;

    // Fan laws: Power ratio = (Speed ratio)^3
    const powerRatio = Math.pow(speedRatio, 3);

    // Calculate energy consumption
    const kWperHP = 0.746; // Conversion factor
    const motorEfficiency = 0.90; // Typical motor efficiency
    const vfdEfficiency = 0.96; // Typical VFD efficiency

    // Without VFD - constant speed with damper control (assumes 70% of full power at reduced flow)
    const constantSpeedPowerRatio = 0.70; // Typical with damper control
    const constantSpeedPowerKW = (motorHP * kWperHP / motorEfficiency) * constantSpeedPowerRatio;
    const constantSpeedEnergyKWh = constantSpeedPowerKW * hours;
    const constantSpeedCost = constantSpeedEnergyKWh * elecCost;

    // With VFD - variable speed
    const vfdPowerKW = (motorHP * kWperHP / (motorEfficiency * vfdEfficiency)) * powerRatio;
    const vfdEnergyKWh = vfdPowerKW * hours;
    const vfdCost = vfdEnergyKWh * elecCost;

    // Calculate savings
    const energySavingsKWh = constantSpeedEnergyKWh - vfdEnergyKWh;
    const costSavings = constantSpeedCost - vfdCost;
    const percentSavings = (energySavingsKWh / constantSpeedEnergyKWh) * 100;

    // Display results
    document.getElementById('vfdResults').innerHTML = `
        <div class="results-section">
            <h4>Results:</h4>
            <div class="result-row">
                <span class="result-label">Speed Ratio:</span>
                <span class="result-value">${(speedRatio * 100).toFixed(1)}%</span>
            </div>
            <div class="result-row">
                <span class="result-label">Power Ratio with VFD:</span>
                <span class="result-value">${(powerRatio * 100).toFixed(1)}%</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Annual Energy Savings:</span>
                <span class="result-value">${energySavingsKWh.toLocaleString()} kWh</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Annual Cost Savings:</span>
                <span class="result-value">$${costSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="result-row">
                <span class="result-label">Percent Savings:</span>
                <span class="result-value">${percentSavings.toFixed(1)}%</span>
            </div>
            <div class="result-details">
                <p><strong>Without VFD:</strong> ${constantSpeedEnergyKWh.toLocaleString()} kWh/yr ($${constantSpeedCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</p>
                <p><strong>With VFD:</strong> ${vfdEnergyKWh.toLocaleString()} kWh/yr ($${vfdCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</p>
            </div>
        </div>
    `;
}

/**
 * Calculate heat recovery ventilator (HRV/ERV) energy savings
 */
function calculateHRVSavings() {
    // Get input values
    const cfm = parseFloat(document.getElementById('hrvCFM').value);
    const effectiveness = parseFloat(document.getElementById('hrvEffectiveness').value) / 100;
    const hdd = parseFloat(document.getElementById('hrvHDD').value);
    const cdd = parseFloat(document.getElementById('hrvCDD').value);
    const heatingCost = parseFloat(document.getElementById('hrvHeatingCost').value);
    const coolingCost = parseFloat(document.getElementById('hrvCoolingCost').value);

    // Validate inputs
    if (isNaN(cfm) || isNaN(effectiveness) || isNaN(hdd) || isNaN(cdd) || isNaN(heatingCost) || isNaN(coolingCost) ||
        cfm <= 0 || effectiveness <= 0 || effectiveness > 1 || hdd < 0 || cdd < 0 || heatingCost < 0 || coolingCost < 0) {
        document.getElementById('hrvResults').innerHTML =
            '<div class="error-message">Please enter valid numbers. Effectiveness must be between 0-100%.</div>';
        return;
    }

    // Constants
    const airDensity = 0.075; // lb/ft³
    const specificHeat = 0.24; // Btu/lb·°F
    const hoursPerDay = 24;

    // Calculate heating savings
    // Q = CFM × density × specific heat × ΔT × hours
    // Simplified: CFM × 1.08 × ΔT for sensible heat
    const heatingLoadBtuH = cfm * 1.08 * 1; // Btu/h per degree F difference
    const heatingSeasonHours = hdd * hoursPerDay; // Degree-hours
    const heatingEnergyWithoutHRV_Btu = heatingLoadBtuH * heatingSeasonHours;
    const heatingEnergyWithoutHRV_MMBtu = heatingEnergyWithoutHRV_Btu / 1000000;

    const heatingSavings_MMBtu = heatingEnergyWithoutHRV_MMBtu * effectiveness;
    const heatingSavingsCost = heatingSavings_MMBtu * heatingCost;

    // Calculate cooling savings
    const coolingLoadBtuH = cfm * 1.08 * 1; // Btu/h per degree F difference
    const coolingSeasonHours = cdd * hoursPerDay;
    const coolingEnergyWithoutHRV_Btu = coolingLoadBtuH * coolingSeasonHours;
    const coolingEnergyWithoutHRV_kWh = coolingEnergyWithoutHRV_Btu / 3412; // Convert to kWh

    // Assume COP of 3.0 for cooling
    const coolingCOP = 3.0;
    const coolingElectricity_kWh = coolingEnergyWithoutHRV_kWh / coolingCOP;

    const coolingSavings_kWh = coolingElectricity_kWh * effectiveness;
    const coolingSavingsCost = coolingSavings_kWh * coolingCost;

    // Total savings
    const totalSavingsCost = heatingSavingsCost + coolingSavingsCost;

    // Display results
    document.getElementById('hrvResults').innerHTML = `
        <div class="results-section">
            <h4>Results:</h4>
            <div class="result-row">
                <span class="result-label">Heat Recovery Effectiveness:</span>
                <span class="result-value">${(effectiveness * 100).toFixed(0)}%</span>
            </div>
            <div class="result-row">
                <span class="result-label">Heating Energy Recovered:</span>
                <span class="result-value">${heatingSavings_MMBtu.toFixed(1)} MMBtu/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Heating Cost Savings:</span>
                <span class="result-value">$${heatingSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Cooling Energy Recovered:</span>
                <span class="result-value">${coolingSavings_kWh.toLocaleString()} kWh/yr</span>
            </div>
            <div class="result-row">
                <span class="result-label">Cooling Cost Savings:</span>
                <span class="result-value">$${coolingSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-row highlight">
                <span class="result-label">Total Annual Savings:</span>
                <span class="result-value">$${totalSavingsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-details">
                <p><strong>Note:</strong> Savings estimates assume continuous ventilation operation and typical system efficiencies. Actual savings may vary based on specific operating conditions, climate, and equipment performance.</p>
                <p>Cooling calculations assume COP = ${coolingCOP.toFixed(1)}. Adjust for your specific cooling system efficiency.</p>
            </div>
        </div>
    `;
}

// ========================================
// PLUMBING PIPE SIZING CALCULATOR
// ========================================

// Tab switching function for plumbing pipe sizing page
function switchTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Scroll to top of tabs for better UX
    window.scrollTo({
        top: document.querySelector('.tab-navigation').offsetTop - 100,
        behavior: 'smooth'
    });
}

// Toggle calculation method (fixture units vs direct GPM) - DEPRECATED
// Use switchCalculationMode instead for button-based selectors
function toggleCalcMethod() {
    const method = document.getElementById('calcMethod').value;
    const fixtureTable = document.querySelector('.pipe-table-wrapper');
    const directGPM = document.getElementById('directGPMInput');

    if (method === 'fixtureUnits') {
        fixtureTable.style.display = 'block';
        directGPM.style.display = 'none';
    } else {
        fixtureTable.style.display = 'none';
        directGPM.style.display = 'flex';
    }
}

// Switch calculation mode using button selector (for plumbing calculators)
// mode: 'dfu' or 'fixtureUnits' for fixture unit mode, 'gpm' for GPM mode
// event: the click event from the button
function switchCalculationMode(mode, event) {
    // Update button states
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(button => {
        button.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Show/hide input sections based on mode
    // For drain sizing page (uses 'dfu' and 'gpm')
    const dfuInputs = document.getElementById('dfu-inputs');
    const gpmInputsSection = document.getElementById('gpm-inputs');

    // For plumbing pipe sizing page (uses 'fixtureUnits' and 'gpm')
    const fixtureTable = document.querySelector('.pipe-table-wrapper');
    const directGPMInput = document.getElementById('directGPMInput');

    if (mode === 'dfu' || mode === 'fixtureUnits') {
        // Show fixture unit inputs
        if (dfuInputs) {
            dfuInputs.classList.add('active');
        }
        if (gpmInputsSection) {
            gpmInputsSection.classList.remove('active');
        }
        if (fixtureTable) {
            fixtureTable.style.display = 'block';
        }
        if (directGPMInput) {
            directGPMInput.style.display = 'none';
        }
    } else if (mode === 'gpm') {
        // Show GPM inputs
        if (dfuInputs) {
            dfuInputs.classList.remove('active');
        }
        if (gpmInputsSection) {
            gpmInputsSection.classList.add('active');
        }
        if (fixtureTable) {
            fixtureTable.style.display = 'none';
        }
        if (directGPMInput) {
            directGPMInput.style.display = 'flex';
        }
    }

    // Hide results when switching modes (if present)
    const drainResults = document.getElementById('drainResults');
    const pipeSizingResults = document.getElementById('pipeSizingResults');
    if (drainResults) {
        drainResults.classList.remove('visible');
    }
    if (pipeSizingResults) {
        pipeSizingResults.style.display = 'none';
    }
}

// Convert fixture units to GPM using simplified Hunter's Curve
function fixtureUnitsToGPM(wsfu) {
    if (wsfu <= 0) return 0;

    // Simplified Hunter's Curve approximation
    // Based on IPC/UPC conversion tables
    if (wsfu <= 1) return 3.0;
    if (wsfu <= 2) return 4.0;
    if (wsfu <= 3) return 5.0;
    if (wsfu <= 4) return 6.0;
    if (wsfu <= 5) return 6.5;
    if (wsfu <= 6) return 7.0;
    if (wsfu <= 8) return 8.0;
    if (wsfu <= 10) return 9.0;
    if (wsfu <= 12) return 10.5;
    if (wsfu <= 15) return 12.0;
    if (wsfu <= 20) return 15.0;
    if (wsfu <= 25) return 18.0;
    if (wsfu <= 30) return 21.0;
    if (wsfu <= 40) return 25.0;
    if (wsfu <= 50) return 30.0;
    if (wsfu <= 60) return 35.0;
    if (wsfu <= 70) return 39.0;
    if (wsfu <= 80) return 43.0;
    if (wsfu <= 90) return 46.0;
    if (wsfu <= 100) return 50.0;
    if (wsfu <= 120) return 56.0;
    if (wsfu <= 140) return 62.0;
    if (wsfu <= 160) return 67.0;
    if (wsfu <= 180) return 72.0;
    if (wsfu <= 200) return 77.0;

    // For larger values, use approximation: GPM ≈ sqrt(WSFU) * 5
    return Math.sqrt(wsfu) * 5;
}

// Get pipe inner diameter based on material and nominal size
function getPipeID(pipeType, nominalSize) {
    const pipeDimensions = {
        'copper': {
            '3/8': 0.430,
            '1/2': 0.545,
            '3/4': 0.785,
            '1': 1.025,
            '1-1/4': 1.265,
            '1-1/2': 1.505,
            '2': 1.985
        },
        'copper_k': {
            '3/8': 0.402,
            '1/2': 0.527,
            '3/4': 0.745,
            '1': 0.995,
            '1-1/4': 1.245,
            '1-1/2': 1.481,
            '2': 1.959
        },
        'copper_m': {
            '3/8': 0.450,
            '1/2': 0.569,
            '3/4': 0.811,
            '1': 1.055,
            '1-1/4': 1.291,
            '1-1/2': 1.527,
            '2': 2.009
        },
        'pex': {
            '3/8': 0.350,
            '1/2': 0.475,
            '3/4': 0.671,
            '1': 0.875,
            '1-1/4': 1.110,
            '1-1/2': 1.360,
            '2': 1.822
        },
        'cpvc': {
            '3/8': 0.430,
            '1/2': 0.545,
            '3/4': 0.785,
            '1': 1.025,
            '1-1/4': 1.265,
            '1-1/2': 1.505,
            '2': 1.985
        },
        'galvanized': {
            '3/8': 0.493,
            '1/2': 0.622,
            '3/4': 0.824,
            '1': 1.049,
            '1-1/4': 1.380,
            '1-1/2': 1.610,
            '2': 2.067
        }
    };

    return pipeDimensions[pipeType][nominalSize] || 0;
}

// Calculate velocity in ft/s
function calculateVelocity(gpm, pipeID) {
    // Velocity (ft/s) = (GPM × 0.4085) / (ID² in inches)
    const area = Math.PI * Math.pow(pipeID / 2, 2); // in²
    return (gpm * 0.4085) / area;
}

// Get velocity limit based on pipe type and water temperature
function getVelocityLimit(pipeType, waterTemp) {
    const limits = {
        'copper': {
            'cold': 8,
            'hot': 5
        },
        'copper_k': {
            'cold': 8,
            'hot': 5
        },
        'copper_m': {
            'cold': 8,
            'hot': 5
        },
        'pex': {
            'cold': 10,
            'hot': 8
        },
        'cpvc': {
            'cold': 8,
            'hot': 5
        },
        'galvanized': {
            'cold': 5,
            'hot': 5
        }
    };

    return limits[pipeType][waterTemp];
}

// Calculate pressure drop using Hazen-Williams equation (simplified)
function calculatePressureDrop(gpm, pipeID, length, pipeType) {
    // C factor (roughness coefficient)
    const cFactors = {
        'copper': 140,
        'pex': 150,
        'cpvc': 150,
        'galvanized': 100
    };

    const C = cFactors[pipeType];

    // Hazen-Williams: hf = (4.52 × L × Q^1.85) / (C^1.85 × D^4.87)
    // where L is in feet, Q in GPM, D in inches, result in ft of head
    // Convert to psi: psi = ft × 0.433

    if (pipeID <= 0 || gpm <= 0) return 0;

    const headLoss = (4.52 * length * Math.pow(gpm, 1.85)) / (Math.pow(C, 1.85) * Math.pow(pipeID, 4.87));
    const psiLoss = headLoss * 0.433;

    return psiLoss;
}

// Recommend pipe size based on flow and velocity limits
function recommendPipeSize(gpm, pipeType, waterTemp) {
    const sizes = ['3/8', '1/2', '3/4', '1', '1-1/4', '1-1/2', '2'];
    const maxVelocity = getVelocityLimit(pipeType, waterTemp);

    for (let size of sizes) {
        const id = getPipeID(pipeType, size);
        const velocity = calculateVelocity(gpm, id);

        // Check if velocity is acceptable (between 2 and max)
        if (velocity >= 2 && velocity <= maxVelocity) {
            return { size: size, id: id, velocity: velocity };
        }
    }

    // If we get here, flow is too high - return largest size
    const size = '2';
    const id = getPipeID(pipeType, size);
    const velocity = calculateVelocity(gpm, id);
    return { size: size, id: id, velocity: velocity };
}

// Main calculation function
function calculatePipeSizing() {
    const calcMethod = document.getElementById('calcMethod').value;
    const pipeType = document.getElementById('pipeType').value;
    const pipeLength = parseFloat(document.getElementById('pipeLength').value) || 100;

    let coldWSFU = 0;
    let hotWSFU = 0;
    let coldGPM = 0;
    let hotGPM = 0;

    if (calcMethod === 'fixtureUnits') {
        // Calculate fixture units from table
        const coldInputs = document.querySelectorAll('.cold-qty');
        const hotInputs = document.querySelectorAll('.hot-qty');

        coldInputs.forEach(input => {
            const qty = parseFloat(input.value) || 0;
            const wsfu = parseFloat(input.dataset.wsfu);
            coldWSFU += qty * wsfu;
        });

        hotInputs.forEach(input => {
            const qty = parseFloat(input.value) || 0;
            const wsfu = parseFloat(input.dataset.wsfu);
            hotWSFU += qty * wsfu;
        });

        // Add additional WSFU values
        const additionalColdWSFU = parseFloat(document.getElementById('additionalColdWSFU').value) || 0;
        const additionalHotWSFU = parseFloat(document.getElementById('additionalHotWSFU').value) || 0;

        coldWSFU += additionalColdWSFU;
        hotWSFU += additionalHotWSFU;

        // Convert to GPM
        coldGPM = fixtureUnitsToGPM(coldWSFU);
        hotGPM = fixtureUnitsToGPM(hotWSFU);

    } else {
        // Direct GPM entry
        coldGPM = parseFloat(document.getElementById('coldGPM').value) || 0;
        hotGPM = parseFloat(document.getElementById('hotGPM').value) || 0;
        coldWSFU = 0; // Not applicable for direct GPM
        hotWSFU = 0;
    }

    // Validate inputs
    if (coldGPM === 0 && hotGPM === 0) {
        alert('Please enter fixture quantities or GPM values');
        return;
    }

    // Recommend pipe sizes (pass 'cold' or 'hot' for water temperature)
    const coldRecommendation = recommendPipeSize(coldGPM, pipeType, 'cold');
    const hotRecommendation = recommendPipeSize(hotGPM, pipeType, 'hot');

    // Calculate pressure drops
    const coldPressureDrop = calculatePressureDrop(coldGPM, coldRecommendation.id, pipeLength, pipeType);
    const hotPressureDrop = calculatePressureDrop(hotGPM, hotRecommendation.id, pipeLength, pipeType);

    // Display results
    document.getElementById('coldWSFU').textContent = calcMethod === 'fixtureUnits' ? coldWSFU.toFixed(1) + ' WSFU' : 'N/A';
    document.getElementById('coldGPMResult').textContent = coldGPM.toFixed(1) + ' GPM';
    document.getElementById('coldPipeSize').textContent = coldRecommendation.size + '"';
    document.getElementById('coldVelocity').textContent = coldRecommendation.velocity.toFixed(1) + ' ft/s';
    document.getElementById('coldPressureDrop').textContent = coldPressureDrop.toFixed(1) + ' psi';

    document.getElementById('hotWSFU').textContent = calcMethod === 'fixtureUnits' ? hotWSFU.toFixed(1) + ' WSFU' : 'N/A';
    document.getElementById('hotGPMResult').textContent = hotGPM.toFixed(1) + ' GPM';
    document.getElementById('hotPipeSize').textContent = hotRecommendation.size + '"';
    document.getElementById('hotVelocity').textContent = hotRecommendation.velocity.toFixed(1) + ' ft/s';
    document.getElementById('hotPressureDrop').textContent = hotPressureDrop.toFixed(1) + ' psi';

    // Show results section
    document.getElementById('pipeSizingResults').style.display = 'block';

    // Scroll to results
    document.getElementById('pipeSizingResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// ===================================
// Engineering Calculations Interactive Functions
// ===================================

/**
 * Calculate sensible heat transfer
 */
function calculateSensibleHeat() {
    const cfm = parseFloat(document.getElementById('sensible-cfm').value);
    const dt = parseFloat(document.getElementById('sensible-dt').value);
    const resultDiv = document.getElementById('sensible-result');

    // Validation
    if (isNaN(cfm) || isNaN(dt) || cfm <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for both fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = 1.08 × CFM × ΔT
    const btuh = 1.08 * cfm * dt;
    const tons = btuh / 12000;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Sensible Heat: ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        Capacity: ${tons.toFixed(2)} tons
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate latent heat transfer
 */
function calculateLatentHeat() {
    const cfm = parseFloat(document.getElementById('latent-cfm').value);
    const dw = parseFloat(document.getElementById('latent-dw').value);
    const resultDiv = document.getElementById('latent-result');

    // Validation
    if (isNaN(cfm) || isNaN(dw) || cfm <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for both fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = 0.68 × CFM × Δω
    const btuh = 0.68 * cfm * dw;
    const tons = btuh / 12000;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Latent Heat: ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        Capacity: ${tons.toFixed(2)} tons
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate CFM from duct dimensions and velocity
 */
function calculateCFM() {
    const width = parseFloat(document.getElementById('cfm-width').value);
    const height = parseFloat(document.getElementById('cfm-height').value);
    const velocity = parseFloat(document.getElementById('cfm-velocity').value);
    const resultDiv = document.getElementById('cfm-result');

    // Validation
    if (isNaN(width) || isNaN(height) || isNaN(velocity) || width <= 0 || height <= 0 || velocity <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter valid positive values for all fields.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: Q = A × V
    // Convert dimensions from inches to feet
    const widthFt = width / 12;
    const heightFt = height / 12;
    const area = widthFt * heightFt;
    const cfm = area * velocity;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Cross-sectional Area: ${area.toFixed(3)} ft²<br>
        Airflow (CFM): ${cfm.toLocaleString('en-US', {maximumFractionDigits: 0})} CFM
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Calculate pump hydraulic power
 */
function calculatePumpPower() {
    const gpm = parseFloat(document.getElementById('pump-gpm').value);
    const head = parseFloat(document.getElementById('pump-head').value);
    const eff = parseFloat(document.getElementById('pump-eff').value);
    const resultDiv = document.getElementById('pump-result');

    // Validation
    if (isNaN(gpm) || isNaN(head) || isNaN(eff) || gpm <= 0 || head <= 0 || eff <= 0 || eff > 100) {
        resultDiv.innerHTML = '⚠️ Please enter valid values. Efficiency must be between 0-100%.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    // Calculate: HP = (GPM × Head × SG) / (3960 × η)
    // SG = 1.0 for water
    const effDecimal = eff / 100;
    const hp = (gpm * head * 1.0) / (3960 * effDecimal);
    const kw = hp * 0.746;

    // Suggest next standard motor size
    const standardSizes = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
    let suggestedHP = standardSizes.find(size => size >= hp) || hp;

    resultDiv.innerHTML = `
        <strong>Results:</strong><br>
        Required Hydraulic Power: ${hp.toFixed(2)} HP<br>
        Electrical Power: ${kw.toFixed(2)} kW<br>
        <em>Suggested Motor Size: ${suggestedHP} HP</em>
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Convert temperature between different units
 */
function convertTemperature() {
    const value = parseFloat(document.getElementById('temp-value').value);
    const fromUnit = document.getElementById('temp-from').value;
    const resultDiv = document.getElementById('temp-result');

    // Validation
    if (isNaN(value)) {
        resultDiv.innerHTML = '⚠️ Please enter a valid temperature value.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    let celsius, fahrenheit, kelvin, rankine;

    // Convert to Celsius first
    switch(fromUnit) {
        case 'F':
            fahrenheit = value;
            celsius = (value - 32) * 5/9;
            break;
        case 'C':
            celsius = value;
            fahrenheit = (value * 9/5) + 32;
            break;
        case 'K':
            kelvin = value;
            celsius = value - 273.15;
            fahrenheit = (celsius * 9/5) + 32;
            break;
        case 'R':
            rankine = value;
            fahrenheit = value - 459.67;
            celsius = (fahrenheit - 32) * 5/9;
            break;
    }

    // Calculate all units
    if (kelvin === undefined) kelvin = celsius + 273.15;
    if (rankine === undefined) rankine = fahrenheit + 459.67;

    resultDiv.innerHTML = `
        <strong>Conversions:</strong><br>
        ${fahrenheit.toFixed(2)}°F (Fahrenheit)<br>
        ${celsius.toFixed(2)}°C (Celsius)<br>
        ${kelvin.toFixed(2)} K (Kelvin)<br>
        ${rankine.toFixed(2)}°R (Rankine)
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

/**
 * Convert cooling capacity between tons, BTU/hr, and kW
 */
function convertCapacity() {
    const value = parseFloat(document.getElementById('capacity-value').value);
    const unit = document.getElementById('capacity-unit').value;
    const resultDiv = document.getElementById('capacity-result');

    // Validation
    if (isNaN(value) || value <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter a valid positive value.';
        resultDiv.classList.add('show');
        resultDiv.style.background = 'linear-gradient(135deg, #fed7d7, #fc8181)';
        resultDiv.style.borderLeftColor = '#c53030';
        return;
    }

    let tons, btuh, kw;

    // Convert to BTU/hr first
    switch(unit) {
        case 'tons':
            tons = value;
            btuh = value * 12000;
            kw = btuh / 3412;
            break;
        case 'btu':
            btuh = value;
            tons = value / 12000;
            kw = value / 3412;
            break;
        case 'kw':
            kw = value;
            btuh = value * 3412;
            tons = btuh / 12000;
            break;
    }

    resultDiv.innerHTML = `
        <strong>Conversions:</strong><br>
        ${tons.toFixed(2)} tons (Refrigeration)<br>
        ${btuh.toLocaleString('en-US', {maximumFractionDigits: 0})} BTU/hr<br>
        ${kw.toFixed(2)} kW (Cooling)
    `;
    resultDiv.style.background = 'linear-gradient(135deg, #c6f6d5, #9ae6b4)';
    resultDiv.style.borderLeftColor = '#48bb78';
    resultDiv.classList.add('show');
}

// Add event listeners for Enter key on calculator inputs
document.addEventListener('DOMContentLoaded', function() {
    // Sensible heat calculator
    const sensibleInputs = ['sensible-cfm', 'sensible-dt'];
    sensibleInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateSensibleHeat();
            });
        }
    });

    // Latent heat calculator
    const latentInputs = ['latent-cfm', 'latent-dw'];
    latentInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateLatentHeat();
            });
        }
    });

    // CFM calculator
    const cfmInputs = ['cfm-width', 'cfm-height', 'cfm-velocity'];
    cfmInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculateCFM();
            });
        }
    });

    // Pump power calculator
    const pumpInputs = ['pump-gpm', 'pump-head', 'pump-eff'];
    pumpInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') calculatePumpPower();
            });
        }
    });

    // Temperature converter
    const tempInputs = ['temp-value'];
    tempInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convertTemperature();
            });
        }
    });

    // Capacity converter
    const capacityInputs = ['capacity-value'];
    capacityInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') convertCapacity();
            });
        }
    });
});






















// ====================================
// ARTICLE SEARCH FUNCTIONALITY
// ====================================
function initializeArticleSearch() {
    const articleSearchInput = document.getElementById('article-search');
    if (!articleSearchInput) return;

    articleSearchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const articleCards = document.querySelectorAll('.article-card');
        const categorySections = document.querySelectorAll('.category-section');
        let visibleCount = 0;

        articleCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.article-description').textContent.toLowerCase();
            const tags = card.getAttribute('data-tags').toLowerCase();
            const category = card.querySelector('.article-category').textContent.toLowerCase();

            if (title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                tags.includes(searchTerm) ||
                category.includes(searchTerm)) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide category sections based on visible cards
        categorySections.forEach(section => {
            const visibleCardsInSection = section.querySelectorAll('.article-card[style="display: flex;"]').length;
            section.style.display = visibleCardsInSection > 0 ? 'block' : 'none';
        });

        // Show/hide no results message
        const noResultsElement = document.getElementById('no-results');
        if (noResultsElement) {
            noResultsElement.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    });
}

// ====================================
// GOOGLE ANALYTICS INITIALIZATION
// ====================================
function initializeGoogleAnalytics() {
    // Google Analytics is loaded via external script tag in HTML
    // This function is a placeholder for any additional GA configuration
    // The actual tracking code should be in the <head> section:
    // <script async src="https://www.googletagmanager.com/gtag/js?id=G-9HVPYW6169"></script>
    // <script>
    //   window.dataLayer = window.dataLayer || [];
    //   function gtag(){dataLayer.push(arguments);}
    //   gtag('js', new Date());
    //   gtag('config', 'G-9HVPYW6169');
    // </script>
}

// ====================================
// UPDATE INITIALIZATION TO INCLUDE NEW FEATURES
// ====================================
// Modify the existing initializeAllFeatures function to include article search
const originalInitializeAllFeatures = initializeAllFeatures;
initializeAllFeatures = function() {
    if (typeof originalInitializeAllFeatures === 'function') {
        originalInitializeAllFeatures();
    }
    initializeArticleSearch();
    initializeGoogleAnalytics();
    initializeWorkflowHub();
};

// ========================================
// VAV BOX SIZING CALCULATOR FUNCTIONS
// ========================================

function updateVAVBoxOptions() {
    const boxType = document.getElementById('vav-boxType');
    const reheatOptions = document.getElementById('vav-reheatOptions');
    const fanPoweredOptions = document.getElementById('vav-fanPoweredOptions');
    const reheatTypeSelect = document.getElementById('vav-reheatType');

    if (!boxType) return;

    const boxTypeValue = boxType.value;

    // Show/hide reheat options
    if (boxTypeValue === 'single-duct-reheat' || boxTypeValue === 'fan-powered-parallel' || boxTypeValue === 'fan-powered-series') {
        if (reheatOptions) reheatOptions.style.display = 'block';
    } else {
        if (reheatOptions) reheatOptions.style.display = 'none';
        if (reheatTypeSelect) {
            reheatTypeSelect.value = 'none';
            updateVAVReheatInputs();
        }
    }

    // Show/hide fan powered options
    if (boxTypeValue === 'fan-powered-parallel' || boxTypeValue === 'fan-powered-series') {
        if (fanPoweredOptions) fanPoweredOptions.style.display = 'block';
    } else {
        if (fanPoweredOptions) fanPoweredOptions.style.display = 'none';
    }
}

function updateVAVReheatInputs() {
    const reheatType = document.getElementById('vav-reheatType');
    const capacityGroup = document.getElementById('vav-reheatCapacityGroup');
    const capacityLabel = document.getElementById('vav-reheatCapacityLabel');

    if (!reheatType) return;

    const reheatTypeValue = reheatType.value;

    if (reheatTypeValue === 'none') {
        if (capacityGroup) capacityGroup.style.display = 'none';
    } else {
        if (capacityGroup) capacityGroup.style.display = 'block';
        if (capacityLabel) {
            if (reheatTypeValue === 'electric') {
                capacityLabel.textContent = 'Electric Reheat Capacity (kW):';
            } else {
                capacityLabel.textContent = 'Reheat Capacity (MBH):';
            }
        }
    }
}

function calculateVAVBox() {
    // Get inputs
    const roomArea = parseFloat(document.getElementById('vav-roomArea').value) || 0;
    const cfmPerSqFt = parseFloat(document.getElementById('vav-cfmPerSqFt').value) || 1.0;
    let maxCFM = parseFloat(document.getElementById('vav-maxCFM').value);
    const minCFMInput = parseFloat(document.getElementById('vav-minCFM').value);
    const boxType = document.getElementById('vav-boxType').value;
    const controlType = document.getElementById('vav-controlType').value;
    const inletPressure = parseFloat(document.getElementById('vav-inletPressure').value) || 1.0;
    const ncRating = parseInt(document.getElementById('vav-ncRating').value) || 35;
    const reheatType = document.getElementById('vav-reheatType').value;
    const reheatCapacity = parseFloat(document.getElementById('vav-reheatCapacity').value) || 0;
    const fanStaticPressure = parseFloat(document.getElementById('vav-fanStaticPressure').value) || 0.5;
    const fanMotorType = document.getElementById('vav-fanMotorType').value;

    // Calculate max CFM if not provided
    if (!maxCFM && roomArea > 0) {
        maxCFM = roomArea * cfmPerSqFt;
        document.getElementById('vav-maxCFM').value = Math.round(maxCFM);
    }

    if (!maxCFM || maxCFM <= 0) {
        alert('Please enter room area and CFM/sq ft, or enter maximum CFM directly.');
        return;
    }

    // Calculate minimum CFM
    let minCFM = minCFMInput;
    if (!minCFM || minCFM <= 0) {
        // Default to 40% of max if not specified
        minCFM = maxCFM * 0.4;
    }

    // Calculate turndown ratio
    const turndownRatio = maxCFM / minCFM;

    // Estimate inlet velocity (assuming appropriate diameter inlet)
    let inletDiameter = 8; // inches, starting guess
    if (maxCFM > 1000) inletDiameter = 12;
    if (maxCFM > 2000) inletDiameter = 16;
    if (maxCFM > 3500) inletDiameter = 20;
    if (maxCFM < 400) inletDiameter = 6;

    const inletArea = Math.PI * Math.pow(inletDiameter / 2, 2) / 144; // sq ft
    const inletVelocity = maxCFM / inletArea;

    // Estimate pressure drop (simplified)
    let pressureDrop = 0.15; // base pressure drop
    if (boxType.includes('fan-powered')) {
        pressureDrop = 0.25;
    }
    if (boxType === 'dual-duct') {
        pressureDrop = 0.30;
    }
    if (controlType === 'pressure-independent') {
        pressureDrop += 0.05; // PI controls add slight pressure drop
    }

    // Adjust for actual inlet pressure
    if (inletPressure < 0.75) {
        pressureDrop *= 0.8; // Lower drop at low pressure
    }

    // Determine recommended box size
    const standardSizes = [100, 150, 200, 300, 400, 500, 600, 800, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000];
    let recommendedSize = standardSizes.find(size => size >= maxCFM) || standardSizes[standardSizes.length - 1];

    // Calculate reheat if applicable
    let reheatOutput = '';
    if (reheatType !== 'none' && reheatCapacity > 0) {
        if (reheatType === 'electric') {
            const btuPerHour = reheatCapacity * 3413;
            const tempRise = btuPerHour / (1.08 * minCFM);
            reheatOutput = reheatCapacity.toFixed(1) + ' kW (' + (btuPerHour/1000).toFixed(1) + ' MBH, ' + tempRise.toFixed(1) + '°F rise at min CFM)';
        } else {
            const tempRise = (reheatCapacity * 1000) / (1.08 * minCFM);
            reheatOutput = reheatCapacity.toFixed(1) + ' MBH (' + tempRise.toFixed(1) + '°F rise at min CFM)';
        }
    }

    // Calculate fan power for fan-powered boxes
    let fanPower = '';
    if (boxType.includes('fan-powered')) {
        const wattsPerCFM = fanMotorType === 'ecm' ? 0.4 : 0.8;
        const watts = maxCFM * wattsPerCFM;
        const annualKWh = (watts / 1000) * 8760; // Assuming continuous operation for series
        if (boxType === 'fan-powered-parallel') {
            // Parallel runs ~50% of the time on average
            fanPower = watts.toFixed(0) + 'W (est. ' + (annualKWh * 0.5 / 1000).toFixed(0) + ' MWh/yr at 50% runtime)';
        } else {
            fanPower = watts.toFixed(0) + 'W (est. ' + (annualKWh / 1000).toFixed(1) + ' MWh/yr continuous)';
        }
    }

    // Display results
    document.getElementById('vav-resultMaxCFM').textContent = Math.round(maxCFM) + ' CFM';
    document.getElementById('vav-resultMinCFM').textContent = Math.round(minCFM) + ' CFM';
    document.getElementById('vav-turndownRatio').textContent = turndownRatio.toFixed(2) + ':1';
    document.getElementById('vav-inletVelocity').textContent = Math.round(inletVelocity) + ' FPM (' + inletDiameter + '" inlet assumed)';
    document.getElementById('vav-pressureDrop').textContent = pressureDrop.toFixed(2) + ' in. w.c.';
    document.getElementById('vav-sizeRecommendation').textContent = recommendedSize + ' CFM nominal size';

    // Show/hide optional result fields
    const reheatResult = document.getElementById('vav-reheatResult');
    const fanPowerResult = document.getElementById('vav-fanPowerResult');

    if (reheatOutput) {
        document.getElementById('vav-reheatRequired').textContent = reheatOutput;
        if (reheatResult) reheatResult.style.display = 'flex';
    } else {
        if (reheatResult) reheatResult.style.display = 'none';
    }

    if (fanPower) {
        document.getElementById('vav-fanPower').textContent = fanPower;
        if (fanPowerResult) fanPowerResult.style.display = 'flex';
    } else {
        if (fanPowerResult) fanPowerResult.style.display = 'none';
    }

    // Show results section
    const resultsSection = document.getElementById('vav-results');
    if (resultsSection) {
        resultsSection.style.display = 'block';

        // Scroll to results
        resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}
// ====================================
// WORKFLOW HUB FUNCTIONALITY
// ====================================

// Building Code Database by State - Based on ICC Code Adoption Chart (January 2024)
const stateCodesDatabase = {
    'AL': {
        name: 'Alabama',
        codes: {
            IBC: '2021', IRC: '2015', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2015', 'IECC-C': '2015',
            IPMC: null, IEBC: '2021', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'AK': {
        name: 'Alaska',
        codes: {
            IBC: '2021', IRC: 'Local', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: null, IgCC: null, 'IECC-R': '2021', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: '2021', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'AZ': {
        name: 'Arizona',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: '2018', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: 'Local', 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local', ICC700: 'Local'
        }
    },
    'AR': {
        name: 'Arkansas',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: null, 'IECC-R': '2009', 'IECC-C': '2009',
            IPMC: null, IEBC: null, ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'CA': {
        name: 'California',
        codes: {
            IBC: '2021 (CBC)', IRC: '2021 (CRC)', IFC: '2021 (CFC)', IMC: null,
            IPC: null, IPSDC: null, IFGC: null, IgCC: null,
            'IECC-R': 'Title 24 Part 6', 'IECC-C': 'Title 24 Part 6',
            IPMC: 'Local', IEBC: '2021', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'CO': {
        name: 'Colorado',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: 'Local', IMC: 'Local', IPC: '2021',
            IPSDC: 'Local', IFGC: '2021', IgCC: 'Local', 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local', ICC700: 'Local'
        }
    },
    'CT': {
        name: 'Connecticut',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: null, IEBC: null, ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'DE': {
        name: 'Delaware',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: '2021', IMC: '2021', IPC: 'Local',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2018', 'IECC-C': 'ASHRAE 90.1-2016',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'DC': {
        name: 'District of Columbia',
        codes: {
            IBC: '2015', IRC: '2015', IFC: '2015', IMC: '2015', IPC: '2015',
            IPSDC: null, IFGC: '2015', IgCC: '2012', 'IECC-R': '2015', 'IECC-C': '2015',
            IPMC: '2015', IEBC: '2015', ISPSC: '2015', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'FL': {
        name: 'Florida',
        codes: {
            IBC: '2021 (FBC)', IRC: '2021 (FBC-R)', IFC: '2021', IMC: '2021', IPC: 'Local',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: 'Local', IEBC: '2021', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'GA': {
        name: 'Georgia',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: null, 'IECC-R': '2015', 'IECC-C': '2015',
            IPMC: '2018', IEBC: '2018', ISPSC: '2018', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'HI': {
        name: 'Hawaii',
        codes: {
            IBC: '2018', IRC: '2018', IFC: 'Local*', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: null, IgCC: null, 'IECC-R': '2018', 'IECC-C': '2021',
            IPMC: null, IEBC: '2018', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'ID': {
        name: 'Idaho',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: 'Local', IFGC: '2018', IgCC: null, 'IECC-R': '2018', 'IECC-C': 'Local',
            IPMC: '2018', IEBC: '2015*', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'IL': {
        name: 'Illinois',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: 'Local', 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local', ICC700: 'Local'
        }
    },
    'IN': {
        name: 'Indiana',
        codes: {
            IBC: '2012', IRC: '2018', IFC: '2012', IMC: '2012', IPC: '2006',
            IPSDC: null, IFGC: '2012', IgCC: null, 'IECC-R': '2018', 'IECC-C': 'ASHRAE 90.1-2007 min',
            IPMC: null, IEBC: null, ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'IA': {
        name: 'Iowa',
        codes: {
            IBC: '2015', IRC: '2015', IFC: '2015', IMC: '2021', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: null, 'IECC-R': '2012', 'IECC-C': '2012',
            IPMC: 'Local', IEBC: '2015', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: 'Local'
        }
    },
    'KS': {
        name: 'Kansas',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: 'Local', 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'KY': {
        name: 'Kentucky',
        codes: {
            IBC: '2015', IRC: '2015', IFC: '2012', IMC: '2015', IPC: '2009',
            IPSDC: null, IFGC: '2012', IgCC: null, 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: null, IEBC: '2015', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'LA': {
        name: 'Louisiana',
        codes: {
            IBC: '2021', IRC: '2021', IFC: 'Local', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: 'Local', IEBC: '2021', ISPSC: '2021', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'ME': {
        name: 'Maine',
        codes: {
            IBC: '2015', IRC: '2015', IFC: '2015', IMC: '2015 (2021)', IPC: '2015 (2021)',
            IPSDC: 'Local', IFGC: '2015', IgCC: null, 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: null, IEBC: null, ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'MD': {
        name: 'Maryland',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: 'Local',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: 'Local', IEBC: '2021', ISPSC: '2021', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'MA': {
        name: 'Massachusetts',
        codes: {
            IBC: '2015', IRC: '2015', IFC: 'Local', IMC: '2015', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2015 (2021)', 'IECC-C': '2015 (2021)',
            IPMC: 'Local', IEBC: '2015', ISPSC: '2015', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'MI': {
        name: 'Michigan',
        codes: {
            IBC: '2015', IRC: '2015', IFC: 'Local', IMC: '2015', IPC: '2015',
            IPSDC: 'Local', IFGC: '2015', IgCC: null, 'IECC-R': '2015', 'IECC-C': 'Local',
            IPMC: '2015', IEBC: '2015', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: '2012'
        }
    },
    'MN': {
        name: 'Minnesota',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: 'Local', IFGC: '2018', IgCC: 'Local', 'IECC-R': '2012', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: '2018', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'MS': {
        name: 'Mississippi',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: 'Local', IFGC: '2018', IgCC: null, 'IECC-R': '2018 & ASHRAE 90.1-2010', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: '2018', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'MO': {
        name: 'Missouri',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: 'Local', 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local'
        }
    },
    'MT': {
        name: 'Montana',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: '2021', 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: '2021', IEBC: '2021', ISPSC: '2021', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NE': {
        name: 'Nebraska',
        codes: {
            IBC: '2018', IRC: '2018', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: null, 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: 'Local', IEBC: '2018', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NV': {
        name: 'Nevada',
        codes: {
            IBC: 'Local', IRC: 'Local', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: 'Local', IWUIC: null, IZC: null
        }
    },
    'NH': {
        name: 'New Hampshire',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: 'Local',
            IPSDC: null, IFGC: '2018', IgCC: null, 'IECC-R': '2018', 'IECC-C': 'Local',
            IPMC: '2018', IEBC: '2018', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NJ': {
        name: 'New Jersey',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2015 (IBC)', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': 'ASHRAE 90.1-2019',
            IPMC: 'Local', IEBC: '2021', ISPSC: '2021', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NM': {
        name: 'New Mexico',
        codes: {
            IBC: '2015', IRC: '2015', IFC: '2015', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: null, 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: 'Local', IEBC: '2015', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NY': {
        name: 'New York',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: null, 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: '2018', IEBC: '2018', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'NC': {
        name: 'North Carolina',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: null, IEBC: '2021', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'ND': {
        name: 'North Dakota',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'OH': {
        name: 'Ohio',
        codes: {
            IBC: '2015', IRC: '2018', IFC: '2015', IMC: '2015', IPC: '2015',
            IPSDC: null, IFGC: '2015', IgCC: null, 'IECC-R': '2018', 'IECC-C': '2012',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'OK': {
        name: 'Oklahoma',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: 'Local', IFGC: '2018', IgCC: null, 'IECC-R': '2009', 'IECC-C': '2006',
            IPMC: 'Local', IEBC: '2018', ISPSC: 'Local', ICCPC: null, IWUIC: 'Local', IZC: null
        }
    },
    'OR': {
        name: 'Oregon',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2021', 'IECC-C': 'ASHRAE 90.1-2010',
            IPMC: 'Local', IEBC: 'Local*', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'PA': {
        name: 'Pennsylvania',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: null, 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: 'Local', IEBC: '2018', ISPSC: '2018', ICCPC: '2018', IWUIC: '2018', IZC: null
        }
    },
    'RI': {
        name: 'Rhode Island',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: '2012', 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: '2018', IEBC: '2018', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'SC': {
        name: 'South Carolina',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: null, 'IECC-R': '2009', 'IECC-C': '2009',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'SD': {
        name: 'South Dakota',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2015', IMC: '2015', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: null, 'IECC-R': '2021', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: 'Local', ISPSC: 'Local', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'TN': {
        name: 'Tennessee',
        codes: {
            IBC: '2012', IRC: '2018', IFC: '2012', IMC: '2012', IPC: '2012',
            IPSDC: null, IFGC: '2012', IgCC: 'Local', 'IECC-R': '2009', 'IECC-C': '2012',
            IPMC: '2012', IEBC: '2012', ISPSC: 'Local', ICCPC: null, IWUIC: 'Local', IZC: null
        }
    },
    'TX': {
        name: 'Texas',
        codes: {
            IBC: '2012', IRC: '2012', IFC: 'Local', IMC: 'Local', IPC: 'Local',
            IPSDC: 'Local', IFGC: 'Local', IgCC: 'Local', 'IECC-R': '2015', 'IECC-C': '2015',
            IPMC: 'Local', IEBC: 'Local', ISPSC: '2018', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local'
        }
    },
    'UT': {
        name: 'Utah',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: '2015', 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: '2021', IEBC: 'Local', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'VT': {
        name: 'Vermont',
        codes: {
            IBC: '2015', IRC: 'Local', IFC: '2021', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2015', IgCC: null, 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: null, IEBC: 'Local', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'VA': {
        name: 'Virginia',
        codes: {
            IBC: '2021', IRC: '2021', IFC: '2021', IMC: '2021', IPC: '2021',
            IPSDC: null, IFGC: '2021', IgCC: 'Local', 'IECC-R': '2021', 'IECC-C': '2021',
            IPMC: '2021', IEBC: '2021', ISPSC: '2021', ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'WA': {
        name: 'Washington',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: 'Local',
            IPSDC: null, IFGC: '2018', IgCC: 'Local', 'IECC-R': '2018', 'IECC-C': '2018',
            IPMC: 'Local', IEBC: '2018', ISPSC: '2018', ICCPC: 'Local', IWUIC: '2018', IZC: null
        }
    },
    'WV': {
        name: 'West Virginia',
        codes: {
            IBC: '2018', IRC: '2018', IFC: '2018', IMC: '2018', IPC: '2018',
            IPSDC: null, IFGC: '2018', IgCC: '2015', 'IECC-R': 'ASHRAE 90.1-2013', 'IECC-C': '2018',
            IPMC: '2018', IEBC: '2018', ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'WI': {
        name: 'Wisconsin',
        codes: {
            IBC: '2015', IRC: 'Local', IFC: '2015', IMC: '2015', IPC: '2009',
            IPSDC: null, IFGC: '2015', IgCC: null, 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: null, IEBC: null, ISPSC: null, ICCPC: null, IWUIC: null, IZC: null
        }
    },
    'WY': {
        name: 'Wyoming',
        codes: {
            IBC: '2021', IRC: 'Local', IFC: '2021', IMC: '2021', IPC: 'Local',
            IPSDC: 'Local', IFGC: '2021', IgCC: 'Local', 'IECC-R': 'Local', 'IECC-C': 'Local',
            IPMC: 'Local', IEBC: '2021', ISPSC: 'Local', ICCPC: 'Local', IWUIC: 'Local', IZC: 'Local'
        }
    }
};

// Code name mappings for display
const codeNames = {
    IBC: 'International Building Code',
    IRC: 'International Residential Code',
    IFC: 'International Fire Code',
    IMC: 'International Mechanical Code',
    IPC: 'International Plumbing Code',
    IPSDC: 'International Private Sewage Disposal Code',
    IFGC: 'International Fuel Gas Code',
    IgCC: 'International Green Construction Code',
    'IECC-R': 'Int. Energy Conservation Code - Residential',
    'IECC-C': 'Int. Energy Conservation Code - Commercial',
    IPMC: 'International Property Maintenance Code',
    IEBC: 'International Existing Building Code',
    ISPSC: 'International Swimming Pool and Spa Code',
    ICCPC: 'ICC Performance Code',
    IWUIC: 'Int. Wildland-Urban Interface Code',
    IZC: 'International Zoning Code',
    ICC700: 'National Green Building Standard'
};

// Project Type Code Requirements
const projectTypeCodeRequirements = {
    'residential': {
        name: 'Residential',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode'],
        ashraeStandards: [
            { number: '62.2', name: 'Ventilation for Low-Rise Residential' },
            { number: '90.2', name: 'Energy-Efficient Design of Low-Rise Residential Buildings' }
        ],
        specialNotes: 'IRC may apply for single-family homes. Check local jurisdiction.'
    },
    'commercial': {
        name: 'Commercial',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings Except Low-Rise Residential' },
            { number: '15', name: 'Safety Standard for Refrigeration Systems' }
        ],
        specialNotes: 'Accessibility requirements per ICC A117.1 and ADA standards.'
    },
    'industrial': {
        name: 'Industrial',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings' },
            { number: '15', name: 'Safety Standard for Refrigeration Systems' }
        ],
        specialNotes: 'May require additional industrial codes and OSHA compliance.'
    },
    'healthcare': {
        name: 'Healthcare',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode', 'greenCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings' },
            { number: '170', name: 'Ventilation of Health Care Facilities' }
        ],
        specialNotes: 'FGI Guidelines for Design and Construction of Hospitals required.'
    },
    'education': {
        name: 'Educational',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings' }
        ],
        specialNotes: 'Additional accessibility and safety requirements for educational facilities.'
    },
    'hospitality': {
        name: 'Hospitality',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings' }
        ],
        specialNotes: 'Enhanced life safety requirements for assembly and lodging occupancies.'
    },
    'laboratory': {
        name: 'Laboratory',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '62.1', name: 'Ventilation for Acceptable Indoor Air Quality' },
            { number: '90.1', name: 'Energy Standard for Buildings' },
            { number: '15', name: 'Safety Standard for Refrigeration Systems' }
        ],
        specialNotes: 'NFPA 45 and specialized ventilation requirements apply.'
    },
    'data-center': {
        name: 'Data Center',
        requiredCodes: ['buildingCode', 'energyCode', 'mechanicalCode', 'plumbingCode', 'electricalCode', 'fireCode'],
        ashraeStandards: [
            { number: '90.1', name: 'Energy Standard for Buildings' },
            { number: '90.4', name: 'Energy Standard for Data Centers' }
        ],
        specialNotes: 'ASHRAE TC 9.9 guidelines and enhanced electrical/fire protection.'
    }
};

// Delivery Method Data
const deliveryMethodData = {
    'design-bid-build': {
        name: 'Design-Bid-Build (DBB)',
        phases: {
            'Programming': 10,
            'Schematic Design (SD)': 15,
            'Design Development (DD)': 20,
            'Construction Documents (CD)': 40,
            'Construction Administration (CA)': 15
        },
        characteristics: [
            'Traditional linear approach - design completes before construction begins',
            'Owner contracts separately with designer and contractor',
            'Clear separation of design and construction responsibilities',
            'Competitive bidding process after design completion',
            'Well-established process with defined roles',
            'Longer overall project duration due to sequential phases'
        ]
    },
    'design-build': {
        name: 'Design-Build (DB)',
        phases: {
            'Programming': 10,
            'Schematic Design (SD)': 20,
            'Design Development (DD)': 25,
            'Construction Documents (CD)': 30,
            'Construction Administration (CA)': 15
        },
        characteristics: [
            'Single point of responsibility for design and construction',
            'Overlapping design and construction phases',
            'Owner contracts with one entity (design-builder)',
            'Faster project delivery through concurrent activities',
            'Early contractor input on constructability',
            'Reduced owner administrative burden'
        ]
    },
    'cm-at-risk': {
        name: 'Construction Manager at Risk (CMAR)',
        phases: {
            'Programming': 10,
            'Schematic Design (SD)': 15,
            'Design Development (DD)': 25,
            'Construction Documents (CD)': 35,
            'Construction Administration (CA)': 15
        },
        characteristics: [
            'Owner contracts with both designer and CM separately',
            'CM provides input during design phase',
            'Guaranteed Maximum Price (GMP) established',
            'CM assumes risk for cost overruns',
            'Early cost and schedule input',
            'Balance of owner control and contractor expertise'
        ]
    },
    'integrated-project': {
        name: 'Integrated Project Delivery (IPD)',
        phases: {
            'Programming': 15,
            'Schematic Design (SD)': 20,
            'Design Development (DD)': 25,
            'Construction Documents (CD)': 25,
            'Construction Administration (CA)': 15
        },
        characteristics: [
            'All key parties involved from project inception',
            'Shared risk and reward structure',
            'Collaborative decision-making process',
            'Early involvement of all disciplines',
            'Emphasis on value optimization',
            'Requires high level of trust and communication'
        ]
    }
};

let workflowState = {
    projectType: null,
    projectName: '',
    projectNumber: '',
    projectCity: '',
    projectState: '',
    projectDiscipline: '',
    deliveryMethod: '',
    startDate: '',
    dueDate: '',
    notes: '',
    currentPhase: 0,
    completedPhases: [],
    tasks: {}
};

function initializeWorkflowHub() {
    // Only initialize if we're on the workflow hub page
    if (!document.querySelector('.workflow-setup')) {
        return;
    }

    // Load saved project if exists
    loadProjectFromStorage();

    // Project Type Selection
    const projectTypeBtns = document.querySelectorAll('.project-type-btn');
    projectTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            projectTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            workflowState.projectType = this.dataset.type;
            saveProjectToStorage();
            updateApplicableCodes();
        });
    });

    // Form inputs
    const projectName = document.getElementById('projectName');
    const projectNumber = document.getElementById('projectNumber');
    const projectCity = document.getElementById('projectCity');
    const projectState = document.getElementById('projectState');
    const projectDiscipline = document.getElementById('projectDiscipline');
    const deliveryMethod = document.getElementById('deliveryMethod');
    const projectStartDate = document.getElementById('projectStartDate');
    const projectDueDate = document.getElementById('projectDueDate');
    const projectNotes = document.getElementById('projectNotes');

    if (projectName) {
        projectName.addEventListener('change', function() {
            workflowState.projectName = this.value;
            saveProjectToStorage();
        });
    }

    if (projectNumber) {
        projectNumber.addEventListener('change', function() {
            workflowState.projectNumber = this.value;
            saveProjectToStorage();
        });
    }

    if (projectCity) {
        projectCity.addEventListener('change', function() {
            workflowState.projectCity = this.value;
            saveProjectToStorage();
            updateProjectDisplay();
            updateMunicipalCodes();
        });
    }

    if (projectState) {
        projectState.addEventListener('change', function() {
            workflowState.projectState = this.value;
            saveProjectToStorage();
            updateProjectDisplay();
            updateApplicableCodes();
            updateMunicipalCodes();
        });
    }

    if (projectDiscipline) {
        projectDiscipline.addEventListener('change', function() {
            workflowState.projectDiscipline = this.value;
            saveProjectToStorage();
            updateProjectDisplay();
            filterTasksByDiscipline();
        });
    }

    if (deliveryMethod) {
        deliveryMethod.addEventListener('change', function() {
            workflowState.deliveryMethod = this.value;
            updateDeliveryMethodInfo(this.value);
            updateProgressTickmarks();
            filterTasksByDiscipline();
            saveProjectToStorage();
        });
    }

    if (projectStartDate) {
        projectStartDate.addEventListener('change', function() {
            workflowState.startDate = this.value;
            updateStatusBar();
            saveProjectToStorage();
        });
    }

    if (projectDueDate) {
        projectDueDate.addEventListener('change', function() {
            workflowState.dueDate = this.value;
            updateStatusBar();
            saveProjectToStorage();
        });
    }

    if (projectNotes) {
        projectNotes.addEventListener('change', function() {
            workflowState.notes = this.value;
            saveProjectToStorage();
        });
    }

    // Phase Navigation
    const prevPhaseBtn = document.getElementById('prevPhaseBtn');
    const nextPhaseBtn = document.getElementById('nextPhaseBtn');

    if (prevPhaseBtn) {
        prevPhaseBtn.addEventListener('click', function() {
            if (workflowState.currentPhase > 0) {
                workflowState.currentPhase--;
                updateWorkflowDisplay();
                saveProjectToStorage();
            }
        });
    }

    if (nextPhaseBtn) {
        nextPhaseBtn.addEventListener('click', function() {
            if (workflowState.currentPhase < 5) {
                workflowState.currentPhase++;
                updateWorkflowDisplay();
                saveProjectToStorage();
            }
        });
    }

    // Progress Step Clicks
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            workflowState.currentPhase = index;
            updateWorkflowDisplay();
            saveProjectToStorage();
        });
    });

    // Task Checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = this.dataset.task;
            workflowState.tasks[taskId] = this.checked;
            saveProjectToStorage();
            updatePhaseCompletion();
            updateStatusBar();
        });
    });

    // Project Action Buttons
    const loadProjectActionBtn = document.getElementById('loadProjectActionBtn');
    const saveProjectActionBtn = document.getElementById('saveProjectActionBtn');
    const shareProjectActionBtn = document.getElementById('shareProjectActionBtn');

    if (loadProjectActionBtn) {
        loadProjectActionBtn.addEventListener('click', function() {
            loadProjectFromStorage();
            showNotification('Project loaded successfully!');
            updateStatusBar();
            if (workflowState.deliveryMethod) {
                updateDeliveryMethodInfo(workflowState.deliveryMethod);
                updateProgressTickmarks();
            }
        });
    }

    if (saveProjectActionBtn) {
        saveProjectActionBtn.addEventListener('click', function() {
            saveProjectToStorage();
            showNotification('Project saved successfully!');
        });
    }

    if (shareProjectActionBtn) {
        shareProjectActionBtn.addEventListener('click', function() {
            shareProject();
        });
    }

    // Edit Project Button
    const editProjectBtn = document.getElementById('editProjectBtn');
    if (editProjectBtn) {
        editProjectBtn.addEventListener('click', function() {
            // Go back to project setup phase (phase 0)
            workflowState.currentPhase = 0;
            updateWorkflowDisplay();
            saveProjectToStorage();

            // Scroll to workflow section
            const workflowSection = document.getElementById('workflowSection');
            if (workflowSection) {
                workflowSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Export Report Button
    const exportReportBtn = document.getElementById('exportReportBtn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportProjectReport);
    }

    // Reset Workflow Button
    const resetWorkflowBtn = document.getElementById('resetWorkflowBtn');
    if (resetWorkflowBtn) {
        resetWorkflowBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to start a new project? This will clear all current progress.')) {
                resetWorkflow();
            }
        });
    }

    // Load shared project from URL if present
    loadSharedProject();

    // Initialize status bar
    updateStatusBar();

    // Initialize delivery method info if already selected
    if (workflowState.deliveryMethod) {
        updateDeliveryMethodInfo(workflowState.deliveryMethod);
        updateProgressTickmarks();
    }

    // Initialize workflow display (workflow is visible by default)
    updateProjectDisplay();
    updateWorkflowDisplay();
}

function updateProjectDisplay() {
    const displayProjectName = document.getElementById('displayProjectName');
    const displayProjectType = document.getElementById('displayProjectType');
    const displayProjectLocation = document.getElementById('displayProjectLocation');

    if (displayProjectName) {
        displayProjectName.textContent = workflowState.projectName || '—';
    }

    if (displayProjectType) {
        const typeMap = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'industrial': 'Industrial',
            'healthcare': 'Healthcare',
            'education': 'Educational',
            'hospitality': 'Hospitality',
            'laboratory': 'Laboratory',
            'data-center': 'Data Center'
        };
        displayProjectType.textContent = typeMap[workflowState.projectType] || '—';
    }

    if (displayProjectLocation) {
        let location = workflowState.projectState || '—';
        displayProjectLocation.textContent = location;
    }
}

function updateWorkflowDisplay() {
    const phases = ['project-setup', 'programming', 'schematic', 'design-dev', 'construction-docs', 'construction-admin'];

    // Update progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');

    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < workflowState.currentPhase) {
            step.classList.add('completed');
        } else if (index === workflowState.currentPhase) {
            step.classList.add('active');
        }
    });

    progressLines.forEach((line, index) => {
        line.classList.remove('completed');
        if (index < workflowState.currentPhase) {
            line.classList.add('completed');
        }
    });

    // Update phase panels
    const phasePanels = document.querySelectorAll('.phase-panel');
    phasePanels.forEach((panel, index) => {
        panel.classList.remove('active');
        if (index === workflowState.currentPhase) {
            panel.classList.add('active');
        }
    });

    // Update navigation buttons
    const prevPhaseBtn = document.getElementById('prevPhaseBtn');
    const nextPhaseBtn = document.getElementById('nextPhaseBtn');

    if (prevPhaseBtn) {
        prevPhaseBtn.disabled = workflowState.currentPhase === 0;
    }

    if (nextPhaseBtn) {
        nextPhaseBtn.disabled = workflowState.currentPhase === 5;
    }

    // Load task states
    loadTaskStates();
}

function loadTaskStates() {
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => {
        const taskId = checkbox.dataset.task;
        if (workflowState.tasks[taskId]) {
            checkbox.checked = true;
        }
    });
}

function updatePhaseCompletion() {
    const phases = ['project-setup', 'programming', 'schematic', 'design-dev', 'construction-docs', 'construction-admin'];
    const phasePrefixes = ['setup', 'prog', 'schem', 'dd', 'cd', 'ca'];

    phasePrefixes.forEach((prefix, phaseIndex) => {
        const phaseTasks = document.querySelectorAll(`[data-task^="${prefix}-"]`);
        let allComplete = true;

        phaseTasks.forEach(task => {
            if (!task.checked) {
                allComplete = false;
            }
        });

        if (allComplete && phaseTasks.length > 0) {
            if (!workflowState.completedPhases.includes(phaseIndex)) {
                workflowState.completedPhases.push(phaseIndex);
                saveProjectToStorage();
            }
        } else {
            const index = workflowState.completedPhases.indexOf(phaseIndex);
            if (index > -1) {
                workflowState.completedPhases.splice(index, 1);
                saveProjectToStorage();
            }
        }
    });
}

// Save project to storage (Cloudflare if logged in, localStorage otherwise)
async function saveProjectToStorage() {
    if (currentUser && authToken) {
        // Save to Cloudflare Workers
        await saveProjectToCloud();
    } else {
        // Fall back to localStorage
        try {
            localStorage.setItem('workflowProject', JSON.stringify(workflowState));
            console.log('Project saved to localStorage');
            showNotification('Project saved locally', 'info');
        } catch (e) {
            console.error('Error saving project to localStorage:', e);
            showNotification('Error saving project', 'error');
        }
    }
}

// Load project from storage (Cloudflare if logged in, localStorage otherwise)
async function loadProjectFromStorage() {
    if (currentUser && authToken) {
        // Load from Cloudflare Workers
        await loadCurrentProjectFromCloud();
    } else {
        // Fall back to localStorage
        try {
            const saved = localStorage.getItem('workflowProject');
            if (saved) {
                const loadedState = JSON.parse(saved);
                restoreProjectState(loadedState);
                console.log('Project loaded from localStorage');
            }
        } catch (e) {
            console.error('Error loading project from localStorage:', e);
        }
    }
}

// Restore project state to UI
function restoreProjectState(loadedState) {
    workflowState = { ...workflowState, ...loadedState };

    // Restore form values
    const projectName = document.getElementById('projectName');
    const projectNumber = document.getElementById('projectNumber');
    const projectCity = document.getElementById('projectCity');
    const projectState = document.getElementById('projectState');
    const projectDiscipline = document.getElementById('projectDiscipline');
    const deliveryMethod = document.getElementById('deliveryMethod');
    const projectStartDate = document.getElementById('projectStartDate');
    const projectDueDate = document.getElementById('projectDueDate');
    const projectNotes = document.getElementById('projectNotes');

    if (projectName) projectName.value = workflowState.projectName || '';
    if (projectNumber) projectNumber.value = workflowState.projectNumber || '';
    if (projectCity) projectCity.value = workflowState.projectCity || '';
    if (projectState) projectState.value = workflowState.projectState || '';
    if (projectDiscipline) projectDiscipline.value = workflowState.projectDiscipline || '';
    if (deliveryMethod) deliveryMethod.value = workflowState.deliveryMethod || '';
    if (projectStartDate) projectStartDate.value = workflowState.startDate || '';
    if (projectDueDate) projectDueDate.value = workflowState.dueDate || '';
    if (projectNotes) projectNotes.value = workflowState.notes || '';

    // Restore project type selection
    if (workflowState.projectType) {
        const projectTypeBtns = document.querySelectorAll('.project-type-btn');
        projectTypeBtns.forEach(btn => {
            if (btn.dataset.type === workflowState.projectType) {
                btn.classList.add('active');
            }
        });
    }

    // Update progress display
    updateProgressDisplay();
}

// ====================================
// CLOUDFLARE WORKERS PROJECT STORAGE
// ====================================

// Save current project to Cloudflare
async function saveProjectToCloud() {
    if (!currentUser || !authToken) {
        showNotification('Please sign in to save to cloud', 'warning');
        return;
    }

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(workflowState)
        });

        const data = await response.json();

        if (data.success) {
            workflowState.projectId = data.projectId;
            console.log('Project saved to cloud:', data.projectId);
            showNotification('Project saved to cloud ✓', 'success');
        } else {
            throw new Error(data.error || 'Failed to save project');
        }
    } catch (error) {
        console.error('Error saving to cloud:', error);
        showNotification('Error saving project: ' + error.message, 'error');
    }
}

// Load current/last project from Cloudflare
async function loadCurrentProjectFromCloud() {
    if (!currentUser || !authToken) return;

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.projects && data.projects.length > 0) {
            // Load the most recent project
            const projectData = JSON.parse(data.projects[0].data);
            restoreProjectState(projectData);
            console.log('Project loaded from cloud');
        }
    } catch (error) {
        console.error('Error loading from cloud:', error);
    }
}

// Load all user projects from Cloudflare
async function loadAllUserProjects() {
    if (!currentUser || !authToken) {
        showNotification('Please sign in to view saved projects', 'warning');
        return [];
    }

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.projects) {
            return data.projects.map(p => ({
                ...JSON.parse(p.data),
                id: p.id,
                updatedAt: p.updated_at
            }));
        }

        return [];
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Load specific project by ID
async function loadProjectById(projectId) {
    if (!currentUser || !authToken) return;

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.project) {
            restoreProjectState(data.project);
            console.log('Project loaded:', projectId);
            showNotification('Project loaded ✓', 'success');
        } else {
            showNotification('Project not found', 'error');
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showNotification('Error loading project: ' + error.message, 'error');
    }
}

// Delete project from Cloudflare
async function deleteProjectById(projectId) {
    if (!currentUser || !authToken) return;

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return false;
    }

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('Project deleted:', projectId);
            showNotification('Project deleted', 'success');
            return true;
        } else {
            throw new Error(data.error || 'Failed to delete project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Error deleting project: ' + error.message, 'error');
        return false;
    }
}

// Generate unique project ID
function generateProjectId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = 'notification ' + type + ' show';

    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ====================================
// MY PROJECTS MODAL FUNCTIONS
// ====================================

// Show My Projects modal
async function showMyProjects() {
    if (!currentUser || !db) {
        alert('Please sign in to view saved projects');
        return;
    }

    const modal = document.getElementById('myProjectsModal');
    const projectsList = document.getElementById('projectsList');

    if (!modal || !projectsList) return;

    // Show modal
    modal.style.display = 'block';

    // Show loading state
    projectsList.innerHTML = `
        <div class="loading-projects">
            <div class="loading-spinner"></div>
            <p>Loading your projects...</p>
        </div>
    `;

    // Load projects
    const projects = await loadAllUserProjects();

    // Display projects
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="no-projects">
                <p>📂 No saved projects yet</p>
                <p class="no-projects-subtitle">Start by creating a project in the Workflow Hub</p>
            </div>
        `;
    } else {
        projectsList.innerHTML = projects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-card-header">
                    <div class="project-icon">${getProjectTypeIcon(project.projectType)}</div>
                    <div class="project-info">
                        <h3 class="project-title">${project.projectName || 'Untitled Project'}</h3>
                        <p class="project-meta">
                            ${project.projectType ? project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1) : 'Unknown Type'}
                            ${project.projectCity || project.projectState ? ' • ' + (project.projectCity || '') + (project.projectState ? ', ' + project.projectState : '') : ''}
                        </p>
                        <p class="project-date">Last updated: ${formatDate(project.updatedAt)}</p>
                    </div>
                </div>
                <div class="project-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="loadAndCloseModal('${project.id}')">
                        <span>📂</span> Load
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAndRefresh('${project.id}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Close My Projects modal
function closeMyProjectsModal() {
    const modal = document.getElementById('myProjectsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load project and close modal
async function loadAndCloseModal(projectId) {
    await loadProjectById(projectId);
    closeMyProjectsModal();
}

// Delete project and refresh list
async function deleteAndRefresh(projectId) {
    const deleted = await deleteProjectById(projectId);
    if (deleted) {
        // Refresh the modal
        showMyProjects();
    }
}

// Get project type icon
function getProjectTypeIcon(type) {
    const icons = {
        'residential': '🏠',
        'commercial': '🏢',
        'industrial': '🏭',
        'healthcare': '🏥',
        'education': '🏫',
        'hospitality': '🏨',
        'laboratory': '🔬',
        'data-center': '💾'
    };
    return icons[type] || '📋';
}

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';

    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString();
    } else if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
        return 'Just now';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('myProjectsModal');
    if (event.target === modal) {
        closeMyProjectsModal();
    }
}

function resetWorkflow() {
    workflowState = {
        projectType: null,
        projectName: '',
        projectNumber: '',
        projectCity: '',
        projectState: '',
        projectDiscipline: '',
        deliveryMethod: '',
        startDate: '',
        dueDate: '',
        notes: '',
        currentPhase: 0,
        completedPhases: [],
        tasks: {}
    };

    localStorage.removeItem('workflowProject');

    // Reset form
    const projectName = document.getElementById('projectName');
    const projectNumber = document.getElementById('projectNumber');
    const projectCity = document.getElementById('projectCity');
    const projectState = document.getElementById('projectState');
    const projectDiscipline = document.getElementById('projectDiscipline');
    const deliveryMethod = document.getElementById('deliveryMethod');
    const projectStartDate = document.getElementById('projectStartDate');
    const projectDueDate = document.getElementById('projectDueDate');
    const projectNotes = document.getElementById('projectNotes');

    if (projectName) projectName.value = '';
    if (projectNumber) projectNumber.value = '';
    if (projectCity) projectCity.value = '';
    if (projectState) projectState.value = '';
    if (projectDiscipline) projectDiscipline.value = '';
    if (deliveryMethod) deliveryMethod.value = '';
    if (projectStartDate) projectStartDate.value = '';
    if (projectDueDate) projectDueDate.value = '';
    if (projectNotes) projectNotes.value = '';

    // Reset project type buttons
    const projectTypeBtns = document.querySelectorAll('.project-type-btn');
    projectTypeBtns.forEach(btn => btn.classList.remove('active'));

    // Hide workflow section
    const workflowSection = document.getElementById('workflowSection');
    if (workflowSection) {
        workflowSection.style.display = 'none';
    }

    // Reset all checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => checkbox.checked = false);

    // Reset status bar
    updateStatusBar();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showNotification('Project reset successfully. Start a new project!');
}

function exportProjectReport() {
    const phases = [
        { name: 'Programming', prefix: 'prog', count: 5 },
        { name: 'Schematic Design', prefix: 'schem', count: 6 },
        { name: 'Design Development', prefix: 'dd', count: 7 },
        { name: 'Construction Documents', prefix: 'cd', count: 7 },
        { name: 'Construction Administration', prefix: 'ca', count: 8 }
    ];

    let reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Project Workflow Report - ${workflowState.projectName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #2c3e50;
        }
        h1 {
            color: #1e3c72;
            border-bottom: 3px solid #f39c12;
            padding-bottom: 10px;
        }
        h2 {
            color: #3498db;
            margin-top: 30px;
        }
        .project-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .project-info p {
            margin: 5px 0;
        }
        .phase-section {
            margin: 30px 0;
            padding: 20px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
        }
        .task-list {
            list-style: none;
            padding: 0;
        }
        .task-list li {
            padding: 5px 0;
        }
        .completed {
            color: #27ae60;
        }
        .incomplete {
            color: #e74c3c;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #229954);
            text-align: center;
            color: white;
            line-height: 30px;
            font-weight: bold;
        }
        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <h1>🏗️ Engineering Workflow Report</h1>

    <div class="project-info">
        <h2>Project Information</h2>
        <p><strong>Project Name:</strong> ${workflowState.projectName || 'N/A'}</p>
        <p><strong>Project Type:</strong> ${workflowState.projectType || 'N/A'}</p>
        <p><strong>Location:</strong> ${workflowState.projectState || 'N/A'}</p>
        <p><strong>Building Area:</strong> ${workflowState.projectSize ? workflowState.projectSize + ' sq ft' : 'N/A'}</p>
        <p><strong>Number of Floors:</strong> ${workflowState.projectFloors || 'N/A'}</p>
        <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
`;

    let totalTasks = 0;
    let completedTasks = 0;

    phases.forEach((phase, index) => {
        let phaseHTML = `
    <div class="phase-section">
        <h2>Phase ${index + 1}: ${phase.name}</h2>
        <ul class="task-list">
`;

        for (let i = 1; i <= phase.count; i++) {
            const taskId = `${phase.prefix}-${i}`;
            const isComplete = workflowState.tasks[taskId] || false;
            totalTasks++;
            if (isComplete) completedTasks++;

            const checkbox = document.querySelector(`[data-task="${taskId}"]`);
            const taskText = checkbox ? checkbox.parentElement.querySelector('span').textContent : `Task ${i}`;

            phaseHTML += `
            <li class="${isComplete ? 'completed' : 'incomplete'}">
                ${isComplete ? '✓' : '○'} ${taskText}
            </li>
`;
        }

        phaseHTML += `
        </ul>
    </div>
`;
        reportHTML += phaseHTML;
    });

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    reportHTML = reportHTML.replace('</div>', `
        <p><strong>Overall Progress:</strong></p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${completionPercentage}%">${completionPercentage}%</div>
        </div>
    </div>
`);

    reportHTML += `
    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print Report</button>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999;">
        <p><small>Generated by EngrAssist Workflow Hub</small></p>
    </div>
</body>
</html>
`;

    // Open in new window
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
}

// Update delivery method information display
function updateDeliveryMethodInfo(methodKey) {
    const phasePercentagesDiv = document.getElementById('phasePercentages');
    const deliveryCharacteristicsDiv = document.getElementById('deliveryCharacteristics');

    if (!methodKey || !deliveryMethodData[methodKey]) {
        if (phasePercentagesDiv) {
            phasePercentagesDiv.innerHTML = '<p class="info-placeholder">Select a delivery method to view phase breakdown</p>';
        }
        if (deliveryCharacteristicsDiv) {
            deliveryCharacteristicsDiv.innerHTML = '<p class="info-placeholder">Select a delivery method to view characteristics</p>';
        }
        return;
    }

    const methodData = deliveryMethodData[methodKey];

    // Update phase percentages
    if (phasePercentagesDiv) {
        let phasesHTML = '<ul>';
        for (const [phase, percentage] of Object.entries(methodData.phases)) {
            phasesHTML += `<li><strong>${phase}:</strong> <span>${percentage}%</span></li>`;
        }
        phasesHTML += '</ul>';
        phasePercentagesDiv.innerHTML = phasesHTML;
    }

    // Update characteristics
    if (deliveryCharacteristicsDiv) {
        let characteristicsHTML = '<ul>';
        methodData.characteristics.forEach(char => {
            characteristicsHTML += `<li>${char}</li>`;
        });
        characteristicsHTML += '</ul>';
        deliveryCharacteristicsDiv.innerHTML = characteristicsHTML;
    }
}

// Update progress tickmarks based on delivery method
function updateProgressTickmarks() {
    const tickmarksDiv = document.getElementById('progressTickmarks');
    if (!tickmarksDiv) return;

    tickmarksDiv.innerHTML = '';

    if (!workflowState.deliveryMethod || !deliveryMethodData[workflowState.deliveryMethod]) {
        return;
    }

    const methodData = deliveryMethodData[workflowState.deliveryMethod];
    const phases = Object.entries(methodData.phases);
    let cumulativePercent = 0;

    phases.forEach(([phaseName, percentage], index) => {
        if (index > 0) { // Skip first tickmark at 0%
            const tickmark = document.createElement('div');
            tickmark.className = 'tickmark';
            tickmark.style.left = cumulativePercent + '%';

            const label = document.createElement('div');
            label.className = 'tickmark-label';
            label.textContent = phaseName.replace(/\s*\(.*?\)\s*/g, ''); // Remove abbreviations in parentheses
            label.style.left = cumulativePercent + '%';

            tickmarksDiv.appendChild(tickmark);
            tickmarksDiv.appendChild(label);
        }
        cumulativePercent += percentage;
    });
}

// Update applicable codes display
function updateApplicableCodes() {
    const container = document.getElementById('applicableCodesContainer');
    if (!container) return;

    const state = workflowState.projectState;

    // If no state selected, show placeholder
    if (!state) {
        container.innerHTML = '<p class="info-placeholder">Select state to view applicable codes</p>';
        return;
    }

    // Get the state codes from ICC database
    const stateData = stateCodesDatabase[state];

    if (!stateData) {
        container.innerHTML = '<p class="info-placeholder">State code data not available</p>';
        return;
    }

    // Build the codes display
    let htmlContent = '<div class="applicable-codes-list">';
    htmlContent += `<div class="code-category"><h5>📋 Adopted Codes for ${stateData.name}:</h5>`;
    htmlContent += '<p style="font-size: 0.85rem; color: #666; margin-bottom: 10px;">Source: ICC Code Adoption Chart (January 2024)</p>';
    htmlContent += '<ul class="code-list">';

    // Iterate through all codes and display adopted ones
    const codes = stateData.codes;
    let hasAdoptedCodes = false;

    Object.keys(codes).forEach(codeKey => {
        const edition = codes[codeKey];

        // Only show codes that are adopted (not null)
        if (edition !== null) {
            hasAdoptedCodes = true;
            const codeName = codeNames[codeKey] || codeKey;

            // Format the display
            let displayText = '';
            if (edition === 'Local') {
                displayText = `<li class="code-item">
                    <strong>${codeName}</strong> - <span style="color: #0066cc;">Local Adoption</span>
                    <span class="code-base">(Varies by jurisdiction)</span>
                </li>`;
            } else {
                displayText = `<li class="code-item">
                    <strong>${codeName}</strong> - ${edition}
                </li>`;
            }

            htmlContent += displayText;
        }
    });

    if (!hasAdoptedCodes) {
        htmlContent += '<li class="code-item">No state-level code adoptions found. Check local jurisdictions.</li>';
    }

    htmlContent += '</ul></div>';

    // Add project type specific ASHRAE standards if project type is selected
    const projectType = workflowState.projectType;
    if (projectType) {
        const projectTypeReq = projectTypeCodeRequirements[projectType];

        if (projectTypeReq && projectTypeReq.ashraeStandards && projectTypeReq.ashraeStandards.length > 0) {
            htmlContent += '<div class="code-category"><h5>❄️ Recommended ASHRAE Standards:</h5><ul class="code-list">';
            projectTypeReq.ashraeStandards.forEach(standard => {
                htmlContent += `<li class="code-item">
                    <strong>ASHRAE ${standard.number}</strong> - ${standard.name}
                </li>`;
            });
            htmlContent += '</ul></div>';
        }

        // Add special notes
        if (projectTypeReq && projectTypeReq.specialNotes) {
            htmlContent += `<div class="code-notes">
                <strong>⚠️ Note:</strong> ${projectTypeReq.specialNotes}
            </div>`;
        }
    }

    htmlContent += '</div>';
    container.innerHTML = htmlContent;
}

// Update municipal codes display based on city and state
function updateMunicipalCodes() {
    const container = document.getElementById('municipalCodesContainer');
    if (!container) return;

    const city = workflowState.projectCity;
    const state = workflowState.projectState;

    // If no city selected, show placeholder
    if (!city || !state) {
        container.innerHTML = '<p class="info-placeholder">Enter city and state to view local codes</p>';
        return;
    }

    // Municipal codes database (expandable)
    const municipalCodesDatabase = {
        'CA': {
            'Los Angeles': {
                buildingCode: 'Los Angeles Building Code (LABC)',
                url: 'https://www.ladbs.org/codes-and-standards',
                additional: ['Los Angeles Plumbing Code', 'Los Angeles Electrical Code']
            },
            'San Francisco': {
                buildingCode: 'San Francisco Building Code',
                url: 'https://www.sf.gov/building-codes',
                additional: ['San Francisco Plumbing Code', 'San Francisco Electrical Code']
            }
        },
        'NY': {
            'New York': {
                buildingCode: 'New York City Building Code',
                url: 'https://www.nyc.gov/site/buildings/codes/building-code.page',
                additional: ['NYC Plumbing Code', 'NYC Electrical Code', 'NYC Energy Conservation Code']
            }
        },
        'IL': {
            'Chicago': {
                buildingCode: 'Chicago Building Code',
                url: 'https://www.chicago.gov/city/en/depts/bldgs/supp_info/chicago_building_code.html',
                additional: ['Chicago Plumbing Code', 'Chicago Electrical Code']
            }
        },
        'TX': {
            'Austin': {
                buildingCode: 'City of Austin Building Code',
                url: 'https://www.austintexas.gov/department/building-codes',
                additional: []
            },
            'Houston': {
                buildingCode: 'City of Houston Building Code',
                url: 'https://www.houstontx.gov/codes/',
                additional: []
            }
        },
        'WA': {
            'Seattle': {
                buildingCode: 'Seattle Building Code',
                url: 'https://www.seattle.gov/sdci/codes/building-code',
                additional: ['Seattle Residential Code', 'Seattle Energy Code']
            }
        }
    };

    const cityData = municipalCodesDatabase[state]?.[city];

    if (cityData) {
        let htmlContent = '<div class="municipal-codes-list">';
        htmlContent += `<div class="municipal-code-item">
            <strong>${cityData.buildingCode}</strong><br>
            <a href="${cityData.url}" target="_blank" class="municipal-code-link">View Online ↗</a>
        </div>`;

        if (cityData.additional && cityData.additional.length > 0) {
            cityData.additional.forEach(code => {
                htmlContent += `<div class="municipal-code-item">
                    <strong>${code}</strong>
                </div>`;
            });
        }
        htmlContent += '</div>';
        container.innerHTML = htmlContent;
    } else {
        container.innerHTML = `
            <div class="info-placeholder">
                <p><strong>${city}, ${state}</strong></p>
                <p>Municipal codes for this location are not in our database.</p>
                <p>Check with your local building department or visit:</p>
                <a href="https://up.codes/" target="_blank" class="municipal-code-link">UpCodes.com ↗</a>
            </div>
        `;
    }
}

// Filter tasks based on discipline and delivery method
function filterTasksByDiscipline() {
    const discipline = workflowState.projectDiscipline;
    const deliveryMethod = workflowState.deliveryMethod;

    // If no discipline selected, show all tasks
    if (!discipline) {
        document.querySelectorAll('.task-item').forEach(item => {
            item.style.display = '';
        });
        return;
    }

    // Define discipline-specific keywords for filtering
    const disciplineKeywords = {
        'mechanical': ['hvac', 'mechanical', 'boiler', 'chiller', 'air', 'heating', 'cooling', 'ventilation', 'duct', 'coil', 'fan', 'pump', 'psychrometric', 'refrigeration', 'vav', 'ahu'],
        'electrical': ['electrical', 'power', 'lighting', 'panel', 'circuit', 'voltage', 'transformer', 'generator', 'load', 'nec', 'conduit', 'wire', 'switchgear'],
        'plumbing': ['plumbing', 'pipe', 'water', 'drain', 'sewage', 'fixture', 'riser', 'domestic', 'sanitary', 'storm', 'gas', 'ipc', 'upc']
    };

    // Define delivery-method-specific task relevance
    const deliveryMethodTasks = {
        'design-build': {
            // In design-build, emphasize tasks that involve contractor coordination
            emphasize: ['coordination', 'contractor', 'constructability', 'value engineering', 'schedule'],
            deemphasize: ['bidding', 'competitive']
        },
        'cm-at-risk': {
            emphasize: ['gmp', 'cost', 'construction manager', 'coordination'],
            deemphasize: ['bidding']
        }
    };

    const keywords = disciplineKeywords[discipline] || [];

    document.querySelectorAll('.task-item').forEach(item => {
        const taskText = item.textContent.toLowerCase();

        // Check if task is relevant to discipline
        const isRelevant = keywords.some(keyword => taskText.includes(keyword)) ||
                          taskText.includes('all disciplines') ||
                          taskText.includes('coordinate') ||
                          taskText.includes('code') ||
                          taskText.includes('design criteria') ||
                          taskText.includes('project scope') ||
                          taskText.includes('budget') ||
                          taskText.includes('schedule');

        // Always show general project management tasks
        const isGeneralTask = taskText.includes('project') ||
                             taskText.includes('scope') ||
                             taskText.includes('budget') ||
                             taskText.includes('schedule') ||
                             taskText.includes('submittal') ||
                             taskText.includes('rfi') ||
                             taskText.includes('site visit') ||
                             taskText.includes('commissioning') ||
                             taskText.includes('closeout');

        if (isRelevant || isGeneralTask) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Apply delivery method specific visibility (optional enhancement)
    if (deliveryMethod && deliveryMethodTasks[deliveryMethod]) {
        const methodData = deliveryMethodTasks[deliveryMethod];

        document.querySelectorAll('.task-item').forEach(item => {
            const taskText = item.textContent.toLowerCase();

            // Hide tasks that are not relevant to this delivery method
            if (methodData.deemphasize) {
                methodData.deemphasize.forEach(term => {
                    if (taskText.includes(term)) {
                        item.style.opacity = '0.5';
                        item.style.fontStyle = 'italic';
                    }
                });
            }
        });
    }
}

// Update status bar with actual and expected progress
function updateStatusBar() {
    // Calculate actual progress based on completed tasks
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    let totalTasks = taskCheckboxes.length;
    let completedTasks = 0;

    taskCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            completedTasks++;
        }
    });

    const actualProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate expected progress based on dates
    let expectedProgress = 0;
    let statusText = 'Not Started';
    let statusClass = 'on-track';

    if (workflowState.startDate && workflowState.dueDate) {
        const startDate = new Date(workflowState.startDate);
        const dueDate = new Date(workflowState.dueDate);
        const today = new Date();

        const totalDuration = dueDate - startDate;
        const elapsedDuration = today - startDate;

        if (today < startDate) {
            expectedProgress = 0;
            statusText = 'Not Started';
        } else if (today > dueDate) {
            expectedProgress = 100;
            statusText = actualProgress >= 100 ? 'Completed' : 'Overdue';
            statusClass = actualProgress >= 100 ? 'ahead' : 'behind';
        } else {
            expectedProgress = Math.round((elapsedDuration / totalDuration) * 100);
            expectedProgress = Math.max(0, Math.min(100, expectedProgress));

            // Determine status
            const difference = actualProgress - expectedProgress;
            if (difference >= 5) {
                statusText = 'Ahead';
                statusClass = 'ahead';
            } else if (difference <= -5) {
                statusText = 'Behind';
                statusClass = 'behind';
            } else {
                statusText = 'On Track';
                statusClass = 'on-track';
            }
        }
    }

    // Update UI elements
    const actualProgressEl = document.getElementById('actualProgress');
    const expectedProgressEl = document.getElementById('expectedProgress');
    const projectStatusEl = document.getElementById('projectStatus');
    const actualProgressBar = document.getElementById('actualProgressBar');
    const expectedProgressBar = document.getElementById('expectedProgressBar');

    if (actualProgressEl) actualProgressEl.textContent = actualProgress + '%';
    if (expectedProgressEl) expectedProgressEl.textContent = expectedProgress + '%';

    if (projectStatusEl) {
        projectStatusEl.textContent = statusText;
        projectStatusEl.className = 'stat-value stat-status ' + statusClass;
    }

    if (actualProgressBar) {
        actualProgressBar.style.width = actualProgress + '%';
    }

    if (expectedProgressBar) {
        expectedProgressBar.style.width = expectedProgress + '%';
    }
}

// Share project functionality
function shareProject() {
    const projectData = {
        ...workflowState,
        sharedDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(projectData);
    const base64Data = btoa(jsonString);

    // Create shareable URL (you can modify this to use your actual domain)
    const shareUrl = window.location.origin + window.location.pathname + '?project=' + base64Data;

    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'EngrAssist Project: ' + (workflowState.projectName || 'Untitled Project'),
            text: 'Check out this engineering workflow project',
            url: shareUrl
        }).then(() => {
            showNotification('Project shared successfully!');
        }).catch(err => {
            // Fallback to copying to clipboard
            copyToClipboard(shareUrl);
        });
    } else {
        // Fallback to copying to clipboard
        copyToClipboard(shareUrl);
    }
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showNotification('Project link copied to clipboard!');
    } catch (err) {
        alert('Unable to copy link. Please copy manually:\n\n' + text);
    }

    document.body.removeChild(textarea);
}

// Load shared project from URL on page load
function loadSharedProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');

    if (projectParam) {
        try {
            const jsonString = atob(projectParam);
            const projectData = JSON.parse(jsonString);

            workflowState = { ...workflowState, ...projectData };
            saveProjectToStorage();
            loadProjectFromStorage();

            showNotification('Shared project loaded successfully!');

            if (workflowState.deliveryMethod) {
                updateDeliveryMethodInfo(workflowState.deliveryMethod);
                updateProgressTickmarks();
            }

            updateStatusBar();
        } catch (e) {
            console.error('Error loading shared project:', e);
            showNotification('Error loading shared project. The link may be invalid.');
        }
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
