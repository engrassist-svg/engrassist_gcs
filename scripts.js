// ====================================
// TEMPLATE LOADING SYSTEM - OPTIMIZED
// ====================================


// Load templates efficiently with Promise-based approach
document.addEventListener('DOMContentLoaded', initializeTemplates);
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
            // Fallback: try root-relative path if the original path was relative
            const fileName = templateFile.split('/').pop();
            if (templateFile !== '/' + fileName) {
                return fetch('/' + fileName)
                    .then(response => {
                        if (!response.ok) throw new Error('Fallback failed');
                        return response.text();
                    })
                    .then(html => {
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.innerHTML = html;
                        }
                        return true;
                    })
                    .catch(() => false);
            }
            return false;
        });
}

// Initialize templates and page
function initializeTemplates() {
    // Determine the correct path prefix based on current page location
    const path = window.location.pathname;
    const depth = Math.max(0, path.split('/').filter(Boolean).length - 1);
    const pathPrefix = '../'.repeat(depth);

    // Load both templates in parallel for speed
    // Use relative paths computed from depth for maximum compatibility with static hosts
    const headerPath = pathPrefix + 'header.html';
    const footerPath = pathPrefix + 'footer.html';
    Promise.all([
        loadTemplate('header-placeholder', headerPath),
        loadTemplate('footer-placeholder', footerPath)
    ]).then(() => {
        // Fix relative links in header/footer for subdirectory pages
        if (pathPrefix) {
            document.querySelectorAll('#header-placeholder a, #footer-placeholder a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/') && !href.startsWith('../')) {
                    link.setAttribute('href', pathPrefix + href);
                }
            });
            // Fix image sources in header/footer
            document.querySelectorAll('#header-placeholder img, #footer-placeholder img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')) {
                    img.setAttribute('src', pathPrefix + src);
                }
            });
        }

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

// ====================================
// BREADCRUMB NAVIGATION
// ====================================

function initializeBreadcrumbs() {
    const breadcrumbNav = document.getElementById('breadcrumbNav');
    if (!breadcrumbNav) return;

    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';

    // Don't show breadcrumbs on home page
    if (currentPage === 'index.html' || currentPage === '' || path === '/') {
        breadcrumbNav.classList.add('hidden');
        return;
    }

    // Determine path prefix for nested pages
    const depth = Math.max(0, path.split('/').filter(Boolean).length - 1);
    const pathPrefix = '../'.repeat(depth);

    // Build breadcrumb trail
    const breadcrumbs = generateBreadcrumbs(currentPage, path);

    // Create breadcrumb HTML
    const breadcrumbHTML = `
        <ol>
            ${breadcrumbs.map((crumb, index) => {
                if (index === breadcrumbs.length - 1) {
                    // Last item (current page) - no link
                    return `<li><span class="breadcrumb-current">${crumb.label}</span></li>`;
                } else {
                    // Parent items - with link and separator
                    return `
                        <li>
                            <a href="${crumb.url}">${crumb.label}</a>
                            <span class="breadcrumb-separator">›</span>
                        </li>
                    `;
                }
            }).join('')}
        </ol>
    `;

    breadcrumbNav.innerHTML = breadcrumbHTML;
}

function generateBreadcrumbs(currentPage, fullPath) {
    const breadcrumbs = [];
    const depth = Math.max(0, fullPath.split('/').filter(Boolean).length - 1);
    const pathPrefix = '../'.repeat(depth);

    // Always start with Home
    breadcrumbs.push({
        label: 'Home',
        url: pathPrefix + 'index.html'
    });

    // Page name mappings for better display
    const pageMap = {
        // Main category pages
        'mechanical_page.html': 'Mechanical',
        'electrical_page.html': 'Electrical',
        'plumbing_page.html': 'Plumbing',

        // Mechanical tools
        'psychrometric.html': 'Psychrometric Chart',
        'load_calculation.html': 'HVAC Load Calculator',
        'ductulator.html': 'Duct Sizing Calculator',
        'fan_selection.html': 'Fan Selection Tool',
        'air_balance.html': 'Air Balancing Calculator',
        'pipe_sizing.html': 'Pipe Sizing Calculator',
        'pump_sizing.html': 'Pump Selection Tool',
        'coil_selection.html': 'Coil Selection Calculator',
        'boiler_sizing.html': 'Boiler Sizing Calculator',
        'chiller_sizing.html': 'Chiller Sizing Calculator',

        // Electrical tools (currently under construction)
        'voltage_drop_calculator.html': 'Voltage Drop Calculator',
        'wire_sizing_calculator.html': 'Wire Sizing Calculator',
        'conduit_fill_calculator.html': 'Conduit Fill Calculator',
        'electrical_load_calculator.html': 'Electrical Load Calculator',
        'ohms_law_calculator.html': 'Ohms Law Calculator',
        'power_factor_calculator.html': 'Power Factor Calculator',
        'three_phase_calculator.html': 'Three Phase Calculator',
        'circuit_breaker_sizing.html': 'Circuit Breaker Sizing',
        'transformer_calculator.html': 'Transformer Calculator',
        'motor_calculator.html': 'Motor Calculator',

        // Plumbing tools
        'plumbing_pipe_sizing.html': 'Pipe Sizing Calculator',
        'pressure_loss.html': 'Pressure Loss Calculator',
        'fixture_units.html': 'Fixture Unit Calculator',
        'water_heater_sizing.html': 'Water Heater Sizing',
        'backflow_prevention.html': 'Backflow Prevention Guide',
        'drain_sizing.html': 'Drain Pipe Sizing',
        'vent_sizing.html': 'Vent Sizing Calculator',
        'drainage_fixture_units.html': 'Drainage Fixture Units',
        'trap_sizing.html': 'Trap Sizing Guide',
        'building_drain.html': 'Building Drain Calculator',
        'roof_drain_sizing.html': 'Roof Drain Sizing',
        'storm_pipe_sizing.html': 'Storm Pipe Sizing',
        'rainfall_intensity.html': 'Rainfall Intensity Data',
        'retention_detention.html': 'Retention/Detention',
        'gas_pipe_sizing.html': 'Gas Pipe Sizing',
        'gas_pressure_drop.html': 'Gas Pressure Drop',

        // Utility pages
        'about.html': 'About',
        'contact.html': 'Contact',
        'privacy.html': 'Privacy Policy',
        'terms.html': 'Terms of Service',
        'workflow_hub.html': 'Workflow Hub',

        // Articles
        'rooftop-units.html': 'Rooftop Units',
        'cooling-load-calculation.html': 'Cooling Load Calculation',
        'duct-design.html': 'Duct Design',
        'hvac-zoning.html': 'HVAC Zoning',
        'air-balancing.html': 'Air Balancing',
        'refrigeration-cycle.html': 'Refrigeration Cycle',
        'chilled-water-systems.html': 'Chilled Water Systems',
        'vrf-systems.html': 'VRF Systems',
        'heat-pumps.html': 'Heat Pumps',

        // Equipment pages
        'vav-terminals.html': 'VAV Terminal Units',
        'vav_boxes.html': 'VAV Boxes'
    };

    // Determine parent category for tools
    const mechanicalTools = [
        'psychrometric.html',
        'load_calculation.html',
        'ductulator.html',
        'fan_selection.html',
        'air_balance.html',
        'pipe_sizing.html',
        'pump_sizing.html',
        'coil_selection.html',
        'boiler_sizing.html',
        'chiller_sizing.html'
    ];

    const electricalTools = [
        // Electrical tools are currently under construction
        // Will be populated when tools are available
    ];

    const plumbingTools = [
        'plumbing_pipe_sizing.html',
        'pressure_loss.html',
        'fixture_units.html',
        'water_heater_sizing.html',
        'backflow_prevention.html',
        'drain_sizing.html',
        'vent_sizing.html',
        'drainage_fixture_units.html',
        'trap_sizing.html',
        'building_drain.html',
        'roof_drain_sizing.html',
        'storm_pipe_sizing.html',
        'rainfall_intensity.html',
        'retention_detention.html',
        'gas_pipe_sizing.html',
        'gas_pressure_drop.html',
        'plumbing_codes.html',
        'fixture_schedules.html',
        'material_specifications.html',
        'water_quality_standards.html',
        'plumbing_system_design.html',
        'water_efficiency_guide.html',
        'plumbing_troubleshooting.html',
        'special_plumbing_systems.html',
        'plumbing_fundamentals.html',
        'plumbing_calculations.html',
        'plumbing_case_studies.html',
        'plumbing_code_requirements.html'
    ];

    // Check if in articles directory
    if (fullPath.includes('/articles/')) {
        breadcrumbs.push({
            label: 'Articles',
            url: pathPrefix + 'index.html#articles'
        });
    }
    // Check if in equipment/mechanical directory
    else if (fullPath.includes('/equipment/mechanical/')) {
        breadcrumbs.push({
            label: 'Mechanical',
            url: pathPrefix + 'mechanical_page.html'
        });
    }
    // Check if in downloads/mechanical directory
    else if (fullPath.includes('/downloads/mechanical/')) {
        breadcrumbs.push({
            label: 'Mechanical',
            url: pathPrefix + 'mechanical_page.html'
        });
    }
    // Add category breadcrumb for tools
    else if (mechanicalTools.includes(currentPage)) {
        breadcrumbs.push({
            label: 'Mechanical',
            url: 'mechanical_page.html'
        });
    }
    else if (electricalTools.includes(currentPage)) {
        breadcrumbs.push({
            label: 'Electrical',
            url: 'electrical_page.html'
        });
    }
    else if (plumbingTools.includes(currentPage)) {
        breadcrumbs.push({
            label: 'Plumbing',
            url: 'plumbing_page.html'
        });
    }

    // Add current page
    const currentLabel = pageMap[currentPage] || formatPageName(currentPage);
    breadcrumbs.push({
        label: currentLabel,
        url: currentPage
    });

    return breadcrumbs;
}

// Helper function to format page names
function formatPageName(filename) {
    return filename
        .replace('.html', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Initialize all page features
function initializeAllFeatures() {
    initializeSmoothScroll();
    initializeStatsAnimation();
    initializeMobileMenuClose();
    initializeContactForm();
    initializeFormValidation();
    // Calculator modules handle their own initialization via calculators/*.js
    initializePageCounter();
    initializeDesktopMode();
    initializeAuth();
    initializeBreadcrumbs();
    initializeSearch();
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
// For production: 'https://engrassist-api.engrassist.workers.dev'
const CLOUDFLARE_API_URL = 'https://engrassist-api.engrassist.workers.dev';

// Google OAuth Client ID (optional - for Google Sign-In)
// Get this from: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = '800753226213-16o47j37nt6k037io9c5a1ktq5e4dqo2.apps.googleusercontent.com';

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
    const mobileSettingsLink = document.getElementById('mobileSettingsLink');
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
        if (mobileSettingsLink) mobileSettingsLink.style.display = 'block';
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
        if (mobileSettingsLink) mobileSettingsLink.style.display = 'none';
        if (mobileDivider) mobileDivider.style.display = 'none';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    if (typeof google === 'undefined') {
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
                    <!-- Google Sign-In Button -->
                    <button class="google-signin-btn" onclick="signInWithGoogle(); return false;">
                        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <div class="divider-with-text">
                        <span>or continue with email</span>
                    </div>

                    <div class="form-group">
                        <label for="signInEmail">Email:</label>
                        <input type="email" id="signInEmail" class="form-control" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="signInPassword">Password:</label>
                        <input type="password" id="signInPassword" class="form-control" placeholder="Password">
                    </div>
                    <p style="text-align: center; margin: 10px 0;">
                        <a href="#" onclick="showForgotPasswordModal(); return false;">Forgot password?</a>
                    </p>
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
                    <!-- Google Sign-In Button -->
                    <button class="google-signin-btn" onclick="signInWithGoogle(); return false;">
                        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                    </button>

                    <div class="divider-with-text">
                        <span>or continue with email</span>
                    </div>

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
                        <input type="password" id="signUpPassword" class="form-control" placeholder="Password (8+ characters)" minlength="8">
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

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'warning');
        return;
    }

    const success = await signUpWithEmail(email, password, name);
    if (success) {
        closeSignUpModal();
    }
}

// Show forgot password modal
function showForgotPasswordModal() {
    closeEmailSignInModal();

    let modal = document.getElementById('forgotPasswordModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forgotPasswordModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Reset Password</h2>
                    <button class="modal-close" onclick="closeForgotPasswordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: #666; margin-bottom: 20px;">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div class="form-group">
                        <label for="forgotPasswordEmail">Email:</label>
                        <input type="email" id="forgotPasswordEmail" class="form-control" placeholder="your@email.com">
                    </div>
                    <div id="forgotPasswordMessage" style="margin-top: 10px;"></div>
                    <p style="text-align: center; margin: 10px 0;">
                        <a href="#" onclick="showEmailSignInModal(); return false;">Back to sign in</a>
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeForgotPasswordModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="submitForgotPassword()">Send Reset Link</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) modal.style.display = 'none';
}

async function submitForgotPassword() {
    const email = document.getElementById('forgotPasswordEmail').value;
    const messageDiv = document.getElementById('forgotPasswordMessage');

    if (!email) {
        messageDiv.innerHTML = '<p style="color: #e53e3e;">Please enter your email address</p>';
        return;
    }

    try {
        const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<p style="color: #38a169;">Check your email for password reset instructions!</p>';


            // Clear form
            document.getElementById('forgotPasswordEmail').value = '';
        } else {
            throw new Error(data.error || 'Failed to send reset email');
        }
    } catch (error) {
        console.error('Error requesting password reset:', error);
        messageDiv.innerHTML = `<p style="color: #e53e3e;">${error.message}</p>`;
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
// HEADER SEARCH FUNCTIONALITY - IMPROVED
// ====================================

// Comprehensive search index with page metadata
const searchIndex = [
    // Mechanical Tools
    {
        url: 'ductulator.html',
        title: 'Ductulator - HVAC Duct Sizing Calculator',
        description: 'Professional HVAC duct sizing calculator with friction loss calculations. Supports round, rectangular, and oval ducts. Based on ASHRAE standards.',
        keywords: 'ductulator duct sizing hvac calculator friction loss duct design ashrae equal friction method air velocity cfm round rectangular oval',
        category: 'Mechanical'
    },
    {
        url: 'psychrometric.html',
        title: 'Psychrometric Chart - Air Properties Analysis',
        description: 'Interactive psychrometric chart for HVAC air property analysis. Calculate humidity ratio, enthalpy, wet bulb, dew point, and specific volume.',
        keywords: 'psychrometric chart hvac air properties humidity enthalpy wet bulb dew point ashrae psychrometrics temperature relative humidity',
        category: 'Mechanical'
    },
    {
        url: 'boiler_sizing.html',
        title: 'Boiler Sizing Calculator',
        description: 'Comprehensive commercial boiler sizing calculator. Heating load calculation, BTU requirements, and system design guidance.',
        keywords: 'boiler sizing calculator heating load commercial boiler hvac btu calculation heating system design hot water steam',
        category: 'Mechanical'
    },
    {
        url: 'chiller_sizing.html',
        title: 'Chiller Sizing Calculator',
        description: 'Commercial chiller sizing tool. Calculate cooling load, tonnage requirements, and chiller selection parameters.',
        keywords: 'chiller sizing calculator cooling load tonnage commercial chiller hvac refrigeration air cooled water cooled centrifugal screw',
        category: 'Mechanical'
    },
    {
        url: 'coil_selection.html',
        title: 'Coil Selection Tool',
        description: 'HVAC coil selection and sizing tool. Calculate heating and cooling coil performance, rows, fins, and capacity.',
        keywords: 'coil selection hvac heating coil cooling coil air handler ahu capacity fins rows heat exchanger',
        category: 'Mechanical'
    },
    {
        url: 'fan_selection.html',
        title: 'Fan Selection Calculator',
        description: 'Fan selection and sizing tool. Calculate CFM, static pressure, fan curves, and motor requirements.',
        keywords: 'fan selection calculator cfm static pressure fan curves motor horsepower centrifugal axial exhaust supply ventilation',
        category: 'Mechanical'
    },
    {
        url: 'air_balance.html',
        title: 'Air Balance Calculator',
        description: 'HVAC air balance calculation tool. Calculate supply, return, exhaust air quantities and room pressurization.',
        keywords: 'air balance hvac supply air return air exhaust pressurization cfm ventilation outdoor air',
        category: 'Mechanical'
    },
    {
        url: 'vav_boxes.html',
        title: 'VAV Boxes: Complete Guide & Calculator',
        description: 'Everything about VAV terminal units: interactive sizing calculator, types, controls, troubleshooting, specifications, best practices, and downloadable templates.',
        keywords: 'vav box variable air volume terminal unit sizing calculator reheat fan powered pressure independent pressure dependent troubleshooting specifications types controls best practices manufacturers titus price nailor krueger',
        category: 'Mechanical'
    },
    {
        url: 'pump_sizing.html',
        title: 'Pump Sizing Calculator',
        description: 'HVAC pump sizing and selection tool. Calculate flow rate, head pressure, and pump curves.',
        keywords: 'pump sizing calculator gpm head pressure flow rate centrifugal pump hvac hydronic chilled water hot water',
        category: 'Mechanical'
    },
    {
        url: 'load_calculation.html',
        title: 'Load Calculation',
        description: 'HVAC heating and cooling load calculation. Building heat gain and heat loss analysis.',
        keywords: 'load calculation hvac heating cooling heat gain heat loss building envelope thermal',
        category: 'Mechanical'
    },
    {
        url: 'pressure_loss.html',
        title: 'Pressure Loss Calculator',
        description: 'Duct and pipe pressure loss calculations. Friction loss, fitting losses, and system pressure drop.',
        keywords: 'pressure loss calculator friction duct pipe fittings static pressure drop hvac',
        category: 'Mechanical'
    },
    {
        url: 'interpolator.html',
        title: 'Interpolator Tool',
        description: 'Linear and multi-point interpolation calculator for engineering data tables.',
        keywords: 'interpolator calculator linear interpolation engineering data tables hvac',
        category: 'Mechanical'
    },
    {
        url: 'conversions.html',
        title: 'Unit Conversions',
        description: 'Engineering unit conversion calculator. Convert between metric and imperial units for HVAC, plumbing, and electrical.',
        keywords: 'unit conversions calculator metric imperial hvac temperature pressure flow cfm gpm btu watts',
        category: 'Tools'
    },
    // Electrical Tools
    {
        url: 'electrical_page.html',
        title: 'Electrical Engineering Tools',
        description: 'Electrical engineering calculators and resources. Circuit sizing, voltage drop, load calculations.',
        keywords: 'electrical engineering tools calculators circuit voltage load power',
        category: 'Electrical'
    },
    {
        url: 'circuit_sizing.html',
        title: 'Circuit Sizing Calculator',
        description: 'Electrical circuit sizing tool. Calculate wire size, breaker size, and conduit requirements.',
        keywords: 'circuit sizing calculator wire size breaker ampacity conduit nec electrical',
        category: 'Electrical'
    },
    {
        url: 'voltage_drop.html',
        title: 'Voltage Drop Calculator',
        description: 'Electrical voltage drop calculation tool. Calculate voltage drop for wire runs and verify NEC compliance.',
        keywords: 'voltage drop calculator electrical wire nec compliance conductor size distance',
        category: 'Electrical'
    },
    {
        url: 'electrical_load_calc.html',
        title: 'Electrical Load Calculator',
        description: 'Building electrical load calculation. Calculate connected loads, demand factors, and service requirements.',
        keywords: 'electrical load calculator demand factor service panel building nec',
        category: 'Electrical'
    },
    // Plumbing Tools
    {
        url: 'plumbing_page.html',
        title: 'Plumbing Engineering Tools',
        description: 'Plumbing engineering calculators and resources. Pipe sizing, fixture units, drainage calculations.',
        keywords: 'plumbing engineering tools calculators pipe sizing fixture units drainage',
        category: 'Plumbing'
    },
    {
        url: 'pipe_sizing.html',
        title: 'Pipe Sizing Calculator',
        description: 'Water supply pipe sizing tool. Calculate pipe diameter based on flow rate and pressure.',
        keywords: 'pipe sizing calculator water supply flow rate pressure velocity gpm plumbing',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_pipe_sizing.html',
        title: 'Plumbing Pipe Sizing',
        description: 'Comprehensive plumbing pipe sizing guide. Water supply and drainage pipe selection.',
        keywords: 'plumbing pipe sizing water supply drainage copper pex pvc',
        category: 'Plumbing'
    },
    {
        url: 'fixture_units.html',
        title: 'Fixture Units Calculator',
        description: 'Plumbing fixture unit calculator. Calculate water supply and drainage fixture units.',
        keywords: 'fixture units calculator plumbing wsfu dfu water supply drainage',
        category: 'Plumbing'
    },
    {
        url: 'drainage_fixture_units.html',
        title: 'Drainage Fixture Units',
        description: 'Drainage fixture unit (DFU) calculator and reference tables.',
        keywords: 'drainage fixture units dfu plumbing sanitary waste sizing',
        category: 'Plumbing'
    },
    {
        url: 'drain_sizing.html',
        title: 'Drain Sizing Calculator',
        description: 'Sanitary drain pipe sizing calculator. Size drain pipes based on fixture units.',
        keywords: 'drain sizing calculator sanitary pipe plumbing dfu waste',
        category: 'Plumbing'
    },
    {
        url: 'building_drain.html',
        title: 'Building Drain Sizing',
        description: 'Building drain and sewer sizing calculator. Calculate main drain size requirements.',
        keywords: 'building drain sewer sizing plumbing main sanitary',
        category: 'Plumbing'
    },
    {
        url: 'vent_sizing.html',
        title: 'Vent Sizing Calculator',
        description: 'Plumbing vent pipe sizing tool. Calculate vent sizes for drainage systems.',
        keywords: 'vent sizing calculator plumbing pipe drainage stack vent branch vent',
        category: 'Plumbing'
    },
    {
        url: 'trap_sizing.html',
        title: 'Trap Sizing Guide',
        description: 'Plumbing trap sizing and selection guide. P-trap and fixture trap requirements.',
        keywords: 'trap sizing plumbing p-trap fixture trap drainage',
        category: 'Plumbing'
    },
    {
        url: 'water_heater_sizing.html',
        title: 'Water Heater Sizing',
        description: 'Water heater sizing calculator. Calculate storage tank and recovery requirements.',
        keywords: 'water heater sizing calculator storage tank recovery gph btu plumbing domestic hot water',
        category: 'Plumbing'
    },
    {
        url: 'gas_pipe_sizing.html',
        title: 'Gas Pipe Sizing',
        description: 'Natural gas and propane pipe sizing calculator. Calculate pipe size based on BTU load.',
        keywords: 'gas pipe sizing calculator natural gas propane btu load pressure drop',
        category: 'Plumbing'
    },
    {
        url: 'gas_pressure_drop.html',
        title: 'Gas Pressure Drop Calculator',
        description: 'Gas piping pressure drop calculation tool.',
        keywords: 'gas pressure drop calculator piping natural gas propane',
        category: 'Plumbing'
    },
    {
        url: 'backflow_prevention.html',
        title: 'Backflow Prevention Guide',
        description: 'Backflow prevention device selection and requirements guide.',
        keywords: 'backflow prevention plumbing rpz dcva pvb cross connection',
        category: 'Plumbing'
    },
    {
        url: 'storm_pipe_sizing.html',
        title: 'Storm Pipe Sizing',
        description: 'Storm drainage pipe sizing calculator. Size storm drains based on rainfall intensity.',
        keywords: 'storm pipe sizing drainage rainfall intensity roof drain plumbing',
        category: 'Plumbing'
    },
    {
        url: 'roof_drain_sizing.html',
        title: 'Roof Drain Sizing',
        description: 'Roof drain sizing calculator. Calculate drain size based on roof area and rainfall.',
        keywords: 'roof drain sizing calculator rainfall area storm drainage plumbing',
        category: 'Plumbing'
    },
    {
        url: 'rainfall_intensity.html',
        title: 'Rainfall Intensity Data',
        description: 'Rainfall intensity data and maps for storm drainage design.',
        keywords: 'rainfall intensity data maps storm drainage design plumbing',
        category: 'Plumbing'
    },
    {
        url: 'retention_detention.html',
        title: 'Retention & Detention',
        description: 'Stormwater retention and detention design guidance.',
        keywords: 'retention detention stormwater drainage design plumbing',
        category: 'Plumbing'
    },
    {
        url: 'fixture_schedules.html',
        title: 'Fixture Schedules',
        description: 'Plumbing fixture schedule templates and examples.',
        keywords: 'fixture schedules plumbing templates specifications',
        category: 'Plumbing'
    },
    // Reference Pages
    {
        url: 'mechanical_page.html',
        title: 'Mechanical Engineering Tools',
        description: 'HVAC and mechanical engineering calculators, tools, and resources.',
        keywords: 'mechanical engineering hvac tools calculators heating cooling ventilation',
        category: 'Mechanical'
    },
    {
        url: 'hvac_fundamentals.html',
        title: 'HVAC Fundamentals',
        description: 'HVAC fundamentals guide. Learn heating, ventilation, and air conditioning basics.',
        keywords: 'hvac fundamentals basics heating ventilation air conditioning guide',
        category: 'Mechanical'
    },
    {
        url: 'hvac_design_guide.html',
        title: 'HVAC Design Guide',
        description: 'Comprehensive HVAC system design guide and best practices.',
        keywords: 'hvac design guide system best practices mechanical',
        category: 'Mechanical'
    },
    {
        url: 'ashrae_standards.html',
        title: 'ASHRAE Standards Reference',
        description: 'ASHRAE standards quick reference guide for HVAC design.',
        keywords: 'ashrae standards hvac design 62.1 90.1 ventilation energy',
        category: 'Mechanical'
    },
    {
        url: 'plumbing_fundamentals.html',
        title: 'Plumbing Fundamentals',
        description: 'Plumbing system fundamentals and basic concepts guide.',
        keywords: 'plumbing fundamentals basics water supply drainage sanitary',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_codes.html',
        title: 'Plumbing Codes Reference',
        description: 'Plumbing code reference guide. IPC, UPC, and local code requirements.',
        keywords: 'plumbing codes ipc upc requirements reference guide',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_code_requirements.html',
        title: 'Plumbing Code Requirements',
        description: 'Detailed plumbing code requirements and compliance guide.',
        keywords: 'plumbing code requirements compliance ipc upc',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_system_design.html',
        title: 'Plumbing System Design',
        description: 'Plumbing system design guide and best practices.',
        keywords: 'plumbing system design guide best practices water supply drainage',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_calculations.html',
        title: 'Plumbing Calculations',
        description: 'Common plumbing calculation methods and formulas.',
        keywords: 'plumbing calculations formulas methods sizing',
        category: 'Plumbing'
    },
    {
        url: 'special_plumbing_systems.html',
        title: 'Special Plumbing Systems',
        description: 'Special plumbing systems guide. Medical gas, lab waste, and specialty systems.',
        keywords: 'special plumbing systems medical gas lab waste specialty',
        category: 'Plumbing'
    },
    {
        url: 'water_quality_standards.html',
        title: 'Water Quality Standards',
        description: 'Water quality standards and testing requirements guide.',
        keywords: 'water quality standards testing requirements potable',
        category: 'Plumbing'
    },
    {
        url: 'water_efficiency_guide.html',
        title: 'Water Efficiency Guide',
        description: 'Water efficiency and conservation design guide.',
        keywords: 'water efficiency conservation guide leed green plumbing',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_troubleshooting.html',
        title: 'Plumbing Troubleshooting',
        description: 'Plumbing troubleshooting guide and common problem solutions.',
        keywords: 'plumbing troubleshooting problems solutions repair',
        category: 'Plumbing'
    },
    {
        url: 'plumbing_case_studies.html',
        title: 'Plumbing Case Studies',
        description: 'Real-world plumbing design case studies and examples.',
        keywords: 'plumbing case studies examples design projects',
        category: 'Plumbing'
    },
    // Other Pages
    {
        url: 'articles.html',
        title: 'Engineering Articles',
        description: 'Technical articles on HVAC equipment, systems, and engineering topics.',
        keywords: 'engineering articles hvac technical equipment systems',
        category: 'Resources'
    },
    {
        url: 'workflow_hub.html',
        title: 'Engineering Workflow Hub',
        description: 'Project workflow management for engineering projects. Track tasks and milestones.',
        keywords: 'workflow hub project management engineering tasks milestones',
        category: 'Tools'
    },
    {
        url: 'engineering_calculations.html',
        title: 'Engineering Calculations',
        description: 'Common engineering calculations and formulas reference.',
        keywords: 'engineering calculations formulas reference hvac electrical plumbing',
        category: 'Resources'
    },
    {
        url: 'equipment_specifications.html',
        title: 'Equipment Specifications',
        description: 'Engineering equipment specification templates and guides.',
        keywords: 'equipment specifications templates guides hvac mechanical',
        category: 'Resources'
    },
    {
        url: 'material_specifications.html',
        title: 'Material Specifications',
        description: 'Construction material specification guides and standards.',
        keywords: 'material specifications standards construction guides',
        category: 'Resources'
    },
    {
        url: 'code_requirements.html',
        title: 'Code Requirements',
        description: 'Building code requirements reference for MEP systems.',
        keywords: 'code requirements building mechanical electrical plumbing mep',
        category: 'Resources'
    },
    {
        url: 'energy_efficiency.html',
        title: 'Energy Efficiency Guide',
        description: 'Energy efficiency design guide for building systems.',
        keywords: 'energy efficiency guide building systems leed green',
        category: 'Resources'
    },
    {
        url: 'troubleshooting_guide.html',
        title: 'Troubleshooting Guide',
        description: 'General troubleshooting guide for building systems.',
        keywords: 'troubleshooting guide building systems hvac problems',
        category: 'Resources'
    },
    // Articles
    {
        url: 'articles/air-handling-units.html',
        title: 'Air Handling Units Guide',
        description: 'Comprehensive guide to air handling units (AHUs). Components, types, and selection.',
        keywords: 'air handling units ahu hvac components selection guide',
        category: 'Articles'
    },
    {
        url: 'articles/cooling-towers.html',
        title: 'Cooling Towers Guide',
        description: 'Guide to cooling tower types, operation, and maintenance.',
        keywords: 'cooling towers hvac operation maintenance types selection',
        category: 'Articles'
    },
    {
        url: 'articles/commercial-boilers.html',
        title: 'Commercial Boilers Guide',
        description: 'Guide to commercial boiler types, sizing, and operation.',
        keywords: 'commercial boilers guide sizing operation heating hot water steam',
        category: 'Articles'
    },
    {
        url: 'articles/variable-frequency-drives.html',
        title: 'Variable Frequency Drives',
        description: 'Guide to VFDs for HVAC motors. Energy savings and applications.',
        keywords: 'variable frequency drives vfd hvac motors energy savings',
        category: 'Articles'
    },
    {
        url: 'articles/hvac-pumps.html',
        title: 'HVAC Pumps Guide',
        description: 'Guide to HVAC pumps. Types, sizing, and selection.',
        keywords: 'hvac pumps guide types sizing selection centrifugal',
        category: 'Articles'
    },
    {
        url: 'articles/rooftop-units.html',
        title: 'Rooftop Units Guide',
        description: 'Guide to rooftop units (RTUs). Types, components, and applications.',
        keywords: 'rooftop units rtu hvac packaged units guide',
        category: 'Articles'
    },
    {
        url: 'articles/vrf-systems.html',
        title: 'VRF Systems Guide',
        description: 'Guide to Variable Refrigerant Flow (VRF) systems.',
        keywords: 'vrf systems variable refrigerant flow hvac heat pump',
        category: 'Articles'
    },
    {
        url: 'vav_boxes.html',
        title: 'VAV Boxes: Complete Guide',
        description: 'Complete guide to Variable Air Volume (VAV) boxes: types, controls, sizing, troubleshooting, and specifications.',
        keywords: 'vav boxes variable air volume terminals hvac guide types controls sizing',
        category: 'Articles'
    },
    {
        url: 'articles/water-cooled-chillers.html',
        title: 'Water Cooled Chillers Guide',
        description: 'Guide to water cooled chillers. Types, operation, and selection.',
        keywords: 'water cooled chillers guide types operation selection hvac',
        category: 'Articles'
    },
    // Main Pages
    {
        url: 'index.html',
        title: 'EngrAssist - Engineering Tools',
        description: 'Free engineering calculators and tools for HVAC, plumbing, and electrical professionals.',
        keywords: 'engrassist engineering tools calculators hvac plumbing electrical free',
        category: 'Main'
    },
    {
        url: 'about.html',
        title: 'About EngrAssist',
        description: 'About EngrAssist engineering tools and our mission.',
        keywords: 'about engrassist engineering tools mission',
        category: 'Main'
    },
    {
        url: 'contact.html',
        title: 'Contact Us',
        description: 'Contact EngrAssist for questions, feedback, or support.',
        keywords: 'contact engrassist support feedback questions',
        category: 'Main'
    }
];

// Search function that counts term frequency and ranks results
function performSearch(query) {
    if (!query || query.length < 2) return [];

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    const results = [];

    searchIndex.forEach(page => {
        const searchableText = `${page.title} ${page.description} ${page.keywords}`.toLowerCase();
        let totalScore = 0;
        let matchedTerms = 0;

        searchTerms.forEach(term => {
            // Count occurrences of the term
            const regex = new RegExp(term, 'gi');
            const titleMatches = (page.title.toLowerCase().match(regex) || []).length;
            const descMatches = (page.description.toLowerCase().match(regex) || []).length;
            const keywordMatches = (page.keywords.toLowerCase().match(regex) || []).length;

            // Weight: title matches are worth more than description, which are worth more than keywords
            const termScore = (titleMatches * 10) + (descMatches * 5) + (keywordMatches * 2);

            if (termScore > 0) {
                totalScore += termScore;
                matchedTerms++;
            }
        });

        // Only include if at least one term matched
        if (matchedTerms > 0) {
            // Bonus for matching all search terms
            if (matchedTerms === searchTerms.length) {
                totalScore *= 1.5;
            }

            results.push({
                ...page,
                score: totalScore,
                matchedTerms: matchedTerms
            });
        }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results;
}

// Create and show search results dropdown
function showSearchResults(results, inputElement) {
    // Remove existing dropdown
    hideSearchResults();

    if (results.length === 0) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'search-results-dropdown';
    dropdown.id = 'searchResultsDropdown';

    // Limit to top 10 results
    const topResults = results.slice(0, 10);

    const searchPath = window.location.pathname;
    const searchDepth = Math.max(0, searchPath.split('/').filter(Boolean).length - 1);
    const searchPrefix = '../'.repeat(searchDepth);

    topResults.forEach((result, index) => {
        const item = document.createElement('a');
        item.href = searchPrefix + result.url;
        item.className = 'search-result-item';
        if (index === 0) item.classList.add('selected');

        item.innerHTML = `
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-description">${result.description}</div>
            <div class="search-result-meta">
                <span class="search-result-category">${result.category}</span>
                <span class="search-result-score">${result.matchedTerms} term${result.matchedTerms > 1 ? 's' : ''} matched</span>
            </div>
        `;

        dropdown.appendChild(item);
    });

    // Show result count
    if (results.length > 10) {
        const moreInfo = document.createElement('div');
        moreInfo.className = 'search-results-more';
        moreInfo.textContent = `Showing top 10 of ${results.length} results`;
        dropdown.appendChild(moreInfo);
    }

    // Position dropdown relative to input
    const container = inputElement.closest('.search-container, .mobile-search-container');
    if (container) {
        container.style.position = 'relative';
        container.appendChild(dropdown);
    }
}

// Hide search results dropdown
function hideSearchResults() {
    const existing = document.getElementById('searchResultsDropdown');
    if (existing) {
        existing.remove();
    }
}

// Handle keyboard navigation in search results
function handleSearchKeydown(event) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;

    const items = dropdown.querySelectorAll('.search-result-item');
    const selected = dropdown.querySelector('.search-result-item.selected');
    let selectedIndex = Array.from(items).indexOf(selected);

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (selectedIndex < items.length - 1) {
            items[selectedIndex]?.classList.remove('selected');
            items[selectedIndex + 1]?.classList.add('selected');
            items[selectedIndex + 1]?.scrollIntoView({ block: 'nearest' });
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (selectedIndex > 0) {
            items[selectedIndex]?.classList.remove('selected');
            items[selectedIndex - 1]?.classList.add('selected');
            items[selectedIndex - 1]?.scrollIntoView({ block: 'nearest' });
        }
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selected) {
            window.location.href = selected.href;
        }
    } else if (event.key === 'Escape') {
        hideSearchResults();
        event.target.blur();
    }
}

// Main search handler - improved version
function handleSearch(event) {
    const query = event.target.value.trim();

    // Handle keyboard navigation
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        handleSearchKeydown(event);
        return;
    }

    // Perform search on input
    if (query.length >= 2) {
        const results = performSearch(query);
        showSearchResults(results, event.target);
    } else {
        hideSearchResults();
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('#siteSearch, #mobileSearch');

    searchInputs.forEach(input => {
        // Show results as user types
        input.addEventListener('input', handleSearch);
        input.addEventListener('keydown', handleSearch);

        // Hide results when clicking outside
        input.addEventListener('blur', (e) => {
            // Delay to allow clicking on results
            setTimeout(() => {
                if (!document.activeElement?.closest('.search-results-dropdown')) {
                    hideSearchResults();
                }
            }, 200);
        });

        // Show results on focus if there's a query
        input.addEventListener('focus', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                const results = performSearch(query);
                showSearchResults(results, e.target);
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

// Conversion Calculator - moved to calculators/conversions.js
// Boiler Calculator - moved to calculators/boiler_sizing.js
// Chiller Calculator - moved to calculators/chiller_sizing.js
// Ductulator Calculator - moved to calculators/ductulator.js
// Air Balance Calculator - moved to calculators/air_balance.js
// Psychrometric Chart Calculator - moved to calculators/psychrometric.js

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

// Fan Selection Tool - moved to calculators/fan_selection.js

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

// Coil Selection Calculator - moved to calculators/coil_selection.js

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

// Energy Efficiency Calculators - moved to calculators/energy_efficiency.js

// Plumbing Pipe Sizing Calculator - moved to calculators/plumbing_pipe_sizing.js

// ====================================
// INITIALIZE EVERYTHING ON PAGE LOAD
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    // Load templates first, then initialize everything
    initializeTemplates();

    // Initialize cookie consent
    initializeCookieConsent();
});

// Engineering Calculations Interactive Functions - moved to calculators/engineering_calculations.js

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
// ACCORDION & SECTION NAV (Consolidated Pages)
// ========================================

function initializeAccordions() {
    var headers = document.querySelectorAll('.accordion-header');
    if (!headers.length) return;

    headers.forEach(function(header) {
        header.addEventListener('click', function() {
            var content = this.nextElementSibling;
            var isOpen = this.classList.contains('active');

            if (isOpen) {
                this.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                this.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // Expand/Collapse all buttons
    var expandAll = document.getElementById('expand-all');
    var collapseAll = document.getElementById('collapse-all');
    if (expandAll) {
        expandAll.addEventListener('click', function() {
            headers.forEach(function(h) {
                h.classList.add('active');
                h.nextElementSibling.style.maxHeight = h.nextElementSibling.scrollHeight + 'px';
            });
        });
    }
    if (collapseAll) {
        collapseAll.addEventListener('click', function() {
            headers.forEach(function(h) {
                h.classList.remove('active');
                h.nextElementSibling.style.maxHeight = null;
            });
        });
    }

    // Hash-based deep linking: open accordion from URL hash
    if (window.location.hash) {
        var target = document.querySelector(window.location.hash);
        if (target) {
            var parentAccordion = target.closest('.accordion-content');
            if (parentAccordion) {
                var parentHeader = parentAccordion.previousElementSibling;
                if (parentHeader && parentHeader.classList.contains('accordion-header')) {
                    parentHeader.classList.add('active');
                    parentAccordion.style.maxHeight = parentAccordion.scrollHeight + 'px';
                }
            }
            setTimeout(function() {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }
}

function initializeSectionNav() {
    var nav = document.querySelector('.section-nav');
    if (!nav) return;

    var navLinks = nav.querySelectorAll('a');
    var sections = [];

    navLinks.forEach(function(link) {
        var sectionId = link.getAttribute('href');
        if (sectionId && sectionId.startsWith('#')) {
            var section = document.getElementById(sectionId.substring(1));
            if (section) sections.push({ id: sectionId.substring(1), el: section, link: link });
        }

        link.addEventListener('click', function(e) {
            e.preventDefault();
            var id = this.getAttribute('href').substring(1);
            var targetSection = document.getElementById(id);
            if (targetSection) {
                var offset = nav.offsetHeight + 16;
                var targetPos = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
        });
    });

    // Highlight active section on scroll
    if (sections.length) {
        window.addEventListener('scroll', function() {
            var scrollPos = window.pageYOffset + nav.offsetHeight + 40;
            var current = '';
            sections.forEach(function(s) {
                if (scrollPos >= s.el.offsetTop) {
                    current = s.id;
                }
            });
            navLinks.forEach(function(l) {
                l.classList.remove('active');
                if (l.getAttribute('href') === '#' + current) {
                    l.classList.add('active');
                }
            });
        });
    }
}

// VAV Box Sizing Calculator - moved to calculators/vav_sizing.js
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

// Equipment & Systems Configuration
const equipmentConfig = {
    hvac: {
        title: 'HVAC Equipment',
        systems: {
            boilers: {
                label: 'Boilers',
                submenu: {
                    fuelType: {
                        label: 'Fuel Type',
                        type: 'checkbox',
                        options: ['Gas', 'Electric', 'Oil']
                    },
                    condensingType: {
                        label: 'Condensing Type',
                        type: 'checkbox',
                        options: ['Condensing', 'Non-Condensing']
                    }
                }
            },
            chillers: {
                label: 'Chillers',
                submenu: {
                    chillerType: {
                        label: 'Chiller Type',
                        type: 'checkbox',
                        options: ['Water-Cooled', 'Air-Cooled', 'Evaporative']
                    },
                    refrigerant: {
                        label: 'Refrigerant Type',
                        type: 'checkbox',
                        options: ['Centrifugal', 'Screw', 'Scroll']
                    }
                }
            },
            centralizedAHU: {
                label: 'Centralized Air Handling Units',
                submenu: {
                    ahuType: {
                        label: 'AHU Type',
                        type: 'checkbox',
                        options: ['Standard AHU', 'Make-Up Air Unit', 'Dedicated Outdoor Air System']
                    },
                    airflow: {
                        label: 'Airflow Control',
                        type: 'checkbox',
                        options: ['Constant Volume', 'Variable Air Volume']
                    },
                    coolingCoil: {
                        label: 'Cooling Coil Type',
                        type: 'checkbox',
                        options: ['Chilled Water Cooling Coil', 'DX Cooling Coil']
                    },
                    heatingCoil: {
                        label: 'Heating Coil Type',
                        type: 'checkbox',
                        options: ['Hot Water Heating Coil', 'Electric Resistance Heating Coil', 'Gas Fired Heat Exchanger']
                    }
                }
            },
            terminalZone: {
                label: 'Terminal & Zone Equipment',
                submenu: {
                    unitType: {
                        label: 'Unit Type',
                        type: 'checkbox',
                        options: ['Fan Coil Unit', 'Blower Coil Unit', 'Unit Ventilator', 'VAV Box', 'Induction Unit']
                    },
                    airflow: {
                        label: 'Airflow Control',
                        type: 'checkbox',
                        options: ['Constant Volume', 'Variable Air Volume']
                    },
                    coolingCoil: {
                        label: 'Cooling Coil Type',
                        type: 'checkbox',
                        options: ['Chilled Water Cooling Coil', 'DX Cooling Coil']
                    },
                    heatingCoil: {
                        label: 'Heating Coil Type',
                        type: 'checkbox',
                        options: ['Hot Water Heating Coil', 'Electric Resistance Heating Coil', 'Gas Fired Heat Exchanger']
                    }
                }
            },
            unitaryPackaged: {
                label: 'Unitary & Packaged Systems',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Packaged Rooftop Unit', 'Split System', 'Packaged Terminal Air Conditioner', 'Vertical Stacked Units']
                    },
                    airflow: {
                        label: 'Airflow Control',
                        type: 'checkbox',
                        options: ['Constant Volume', 'Variable Air Volume']
                    },
                    coolingCoil: {
                        label: 'Cooling Coil Type',
                        type: 'checkbox',
                        options: ['Chilled Water Cooling Coil', 'DX Cooling Coil']
                    },
                    heatingCoil: {
                        label: 'Heating Coil Type',
                        type: 'checkbox',
                        options: ['Hot Water Heating Coil', 'Electric Resistance Heating Coil', 'Gas Fired Heat Exchanger']
                    }
                }
            },
            specializedIndustrial: {
                label: 'Specialized & Industrial Equipment',
                submenu: {
                    equipmentType: {
                        label: 'Equipment Type',
                        type: 'checkbox',
                        options: ['Computer Room Air Conditioner', 'Computer Room Air Handler', 'Air Turnover Unit', 'Energy Recovery Ventilator', 'Heat Recovery Ventilator']
                    },
                    airflow: {
                        label: 'Airflow Control',
                        type: 'checkbox',
                        options: ['Constant Volume', 'Variable Air Volume']
                    },
                    coolingCoil: {
                        label: 'Cooling Coil Type',
                        type: 'checkbox',
                        options: ['Chilled Water Cooling Coil', 'DX Cooling Coil']
                    },
                    heatingCoil: {
                        label: 'Heating Coil Type',
                        type: 'checkbox',
                        options: ['Hot Water Heating Coil', 'Electric Resistance Heating Coil', 'Gas Fired Heat Exchanger']
                    }
                }
            },
            specializedAirMovement: {
                label: 'Specialized Air Movement',
                submenu: {
                    equipmentType: {
                        label: 'Equipment Type',
                        type: 'checkbox',
                        options: ['Air Curtain', 'Fan Filter Unit']
                    }
                }
            },
            fans: {
                label: 'Fans',
                submenu: {
                    fanType: {
                        label: 'Fan Type',
                        type: 'checkbox',
                        options: ['Exhaust Fan', 'Supply Fan', 'Return Fan', 'Relief Fan', 'Smoke Exhaust Fan']
                    },
                    fanConfiguration: {
                        label: 'Fan Configuration',
                        type: 'checkbox',
                        options: ['Centrifugal', 'Axial', 'Inline', 'Roof-Mounted']
                    }
                }
            },
            hydronicPumps: {
                label: 'Hydronic Pumps',
                submenu: {
                    pumpType: {
                        label: 'Pump Type',
                        type: 'checkbox',
                        options: ['Chilled Water Pump', 'Hot Water Pump', 'Condenser Water Pump', 'Domestic Water Pump']
                    },
                    pumpConfiguration: {
                        label: 'Pump Configuration',
                        type: 'checkbox',
                        options: ['End Suction', 'Inline', 'Split Case', 'Variable Speed']
                    }
                }
            },
            hydronicTanks: {
                label: 'Hydronic Tanks',
                submenu: {
                    tankType: {
                        label: 'Tank Type',
                        type: 'checkbox',
                        options: ['Expansion Tank', 'Buffer Tank', 'Thermal Storage Tank']
                    }
                }
            },
            hydronicFilters: {
                label: 'Hydronic Filters & Accessories',
                submenu: {
                    componentType: {
                        label: 'Component Type',
                        type: 'checkbox',
                        options: ['Strainers', 'Air Separators', 'Dirt Separators', 'Pressure Reducing Valves', 'Balancing Valves', 'Control Valves']
                    }
                }
            },
            coolingTowers: {
                label: 'Cooling Towers',
                submenu: {
                    towerType: {
                        label: 'Tower Type',
                        type: 'checkbox',
                        options: ['Open Circuit', 'Closed Circuit', 'Evaporative Condenser']
                    }
                }
            }
        }
    },
    electrical: {
        title: 'Electrical Equipment',
        systems: {
            powerDistribution: {
                label: 'Power Distribution',
                submenu: {
                    equipmentType: {
                        label: 'Equipment Type',
                        type: 'checkbox',
                        options: ['Main Service Switchboard', 'Distribution Panels', 'Branch Panels', 'Transformers']
                    },
                    voltage: {
                        label: 'Voltage Levels',
                        type: 'checkbox',
                        options: ['120/208V', '277/480V', 'Medium Voltage']
                    }
                }
            },
            emergencyPower: {
                label: 'Emergency Power',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Generator', 'UPS System', 'Battery Backup', 'Automatic Transfer Switch']
                    }
                }
            },
            lighting: {
                label: 'Lighting Systems',
                submenu: {
                    lightingType: {
                        label: 'Lighting Type',
                        type: 'checkbox',
                        options: ['LED', 'Fluorescent', 'HID', 'Emergency Lighting', 'Exit Lighting']
                    },
                    controls: {
                        label: 'Lighting Controls',
                        type: 'checkbox',
                        options: ['Occupancy Sensors', 'Daylight Harvesting', 'Dimming Controls', 'Centralized Control System']
                    }
                }
            },
            fireAlarm: {
                label: 'Fire Alarm System',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Addressable', 'Conventional', 'Voice Evacuation']
                    }
                }
            },
            telecommunications: {
                label: 'Telecommunications',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Structured Cabling', 'Data Center', 'Wireless Access Points', 'Security System', 'Audio/Visual']
                    }
                }
            },
            renewableEnergy: {
                label: 'Renewable Energy',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Solar PV', 'Wind', 'Energy Storage']
                    }
                }
            }
        }
    },
    plumbing: {
        title: 'Plumbing Equipment',
        systems: {
            waterHeaters: {
                label: 'Water Heaters',
                submenu: {
                    heaterType: {
                        label: 'Heater Type',
                        type: 'checkbox',
                        options: ['Tank Type', 'Tankless', 'Heat Pump Water Heater', 'Solar Water Heater']
                    },
                    fuelType: {
                        label: 'Fuel Type',
                        type: 'checkbox',
                        options: ['Gas', 'Electric', 'Steam']
                    }
                }
            },
            plumbingFixtures: {
                label: 'Plumbing Fixtures',
                submenu: {
                    fixtureType: {
                        label: 'Fixture Type',
                        type: 'checkbox',
                        options: ['Water Closets', 'Urinals', 'Lavatories', 'Sinks', 'Drinking Fountains', 'Showers', 'Service Sinks', 'Emergency Fixtures']
                    },
                    efficiency: {
                        label: 'Efficiency Features',
                        type: 'checkbox',
                        options: ['Low-Flow', 'Dual-Flush', 'Sensor-Operated', 'Touchless']
                    }
                }
            },
            drainageSystem: {
                label: 'Drainage & Waste Systems',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Gravity Drainage', 'Sewage Ejector Pumps', 'Grease Interceptor', 'Oil/Water Separator']
                    }
                }
            },
            specialtyPlumbing: {
                label: 'Specialty Plumbing',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Medical Gas', 'Laboratory Gas', 'Compressed Air', 'Vacuum System', 'Pure Water System', 'Acid Waste']
                    }
                }
            },
            waterTreatment: {
                label: 'Water Treatment',
                submenu: {
                    treatmentType: {
                        label: 'Treatment Type',
                        type: 'checkbox',
                        options: ['Water Softener', 'Filtration System', 'Backflow Preventer', 'Pressure Booster', 'Tempering Valves']
                    }
                }
            },
            stormwater: {
                label: 'Stormwater Management',
                submenu: {
                    systemType: {
                        label: 'System Type',
                        type: 'checkbox',
                        options: ['Roof Drains', 'Sump Pumps', 'Storm Drainage', 'Rainwater Harvesting']
                    }
                }
            }
        }
    }
};

let workflowState = {
    projectType: null,
    projectName: '',
    projectNumber: '',
    projectCity: '',
    projectState: '',
    projectDiscipline: '', // Legacy support - kept for backward compatibility
    projectDisciplines: ['mechanical', 'electrical', 'plumbing'], // Always show all three disciplines
    activeDiscipline: 'mechanical', // Currently active discipline tab
    deliveryMethod: '',
    startDate: '',
    dueDate: '',
    notes: '',
    currentPhase: 0,
    completedPhases: [],
    tasks: {},
    disciplineTasks: {
        mechanical: {},
        electrical: {},
        plumbing: {}
    },
    equipment: {
        hvac: {},
        electrical: {},
        plumbing: {}
    }
};

// Initialize Equipment Selection Panels
function initializeEquipmentSelection() {
    const equipmentPanelsContainer = document.getElementById('equipmentPanels');
    if (!equipmentPanelsContainer) return;

    // Create panels for each discipline
    Object.keys(equipmentConfig).forEach(category => {
        const config = equipmentConfig[category];
        const panel = document.createElement('div');
        panel.className = 'equipment-panel';
        panel.dataset.equipmentCategory = category;

        if (category === 'hvac') {
            panel.classList.add('active');
        }

        // Create systems within this panel
        Object.keys(config.systems).forEach(systemKey => {
            const system = config.systems[systemKey];
            const systemDiv = document.createElement('div');
            systemDiv.className = 'equipment-system';

            // System header with toggle
            const headerDiv = document.createElement('div');
            headerDiv.className = 'equipment-system-header';

            const toggleLabel = document.createElement('label');
            toggleLabel.className = 'equipment-system-toggle';

            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.dataset.category = category;
            toggleInput.dataset.system = systemKey;
            toggleInput.addEventListener('change', function() {
                const submenu = systemDiv.querySelector('.equipment-submenu');
                if (this.checked) {
                    submenu.classList.add('active');
                    if (!workflowState.equipment[category]) {
                        workflowState.equipment[category] = {};
                    }
                    workflowState.equipment[category][systemKey] = { enabled: true, options: {} };
                } else {
                    submenu.classList.remove('active');
                    if (workflowState.equipment[category]) {
                        delete workflowState.equipment[category][systemKey];
                    }
                }
                saveProjectToStorage();
            });

            const toggleSpan = document.createElement('span');
            toggleSpan.className = 'equipment-system-slider';

            toggleLabel.appendChild(toggleInput);
            toggleLabel.appendChild(toggleSpan);

            const labelSpan = document.createElement('span');
            labelSpan.className = 'equipment-system-label';
            labelSpan.textContent = system.label;

            headerDiv.appendChild(toggleLabel);
            headerDiv.appendChild(labelSpan);
            systemDiv.appendChild(headerDiv);

            // Create submenu
            const submenuDiv = document.createElement('div');
            submenuDiv.className = 'equipment-submenu';

            if (system.submenu) {
                Object.keys(system.submenu).forEach(submenuKey => {
                    const submenuItem = system.submenu[submenuKey];
                    const submenuGroupDiv = document.createElement('div');
                    submenuGroupDiv.className = 'equipment-submenu-group';

                    const submenuTitle = document.createElement('div');
                    submenuTitle.className = 'equipment-submenu-title';
                    submenuTitle.textContent = submenuItem.label;
                    submenuGroupDiv.appendChild(submenuTitle);

                    const checkboxGroupDiv = document.createElement('div');
                    checkboxGroupDiv.className = 'equipment-checkbox-group';

                    submenuItem.options.forEach(option => {
                        const checkboxLabel = document.createElement('label');
                        checkboxLabel.className = 'equipment-checkbox-label';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.dataset.category = category;
                        checkbox.dataset.system = systemKey;
                        checkbox.dataset.submenuKey = submenuKey;
                        checkbox.dataset.option = option;

                        checkbox.addEventListener('change', function() {
                            if (!workflowState.equipment[category]) {
                                workflowState.equipment[category] = {};
                            }
                            if (!workflowState.equipment[category][systemKey]) {
                                workflowState.equipment[category][systemKey] = { enabled: true, options: {} };
                            }
                            if (!workflowState.equipment[category][systemKey].options[submenuKey]) {
                                workflowState.equipment[category][systemKey].options[submenuKey] = [];
                            }

                            if (this.checked) {
                                if (!workflowState.equipment[category][systemKey].options[submenuKey].includes(option)) {
                                    workflowState.equipment[category][systemKey].options[submenuKey].push(option);
                                }
                            } else {
                                const index = workflowState.equipment[category][systemKey].options[submenuKey].indexOf(option);
                                if (index > -1) {
                                    workflowState.equipment[category][systemKey].options[submenuKey].splice(index, 1);
                                }
                            }

                            saveProjectToStorage();
                        });

                        const checkboxText = document.createElement('span');
                        checkboxText.className = 'equipment-checkbox-text';
                        checkboxText.textContent = option;

                        checkboxLabel.appendChild(checkbox);
                        checkboxLabel.appendChild(checkboxText);
                        checkboxGroupDiv.appendChild(checkboxLabel);
                    });

                    submenuGroupDiv.appendChild(checkboxGroupDiv);
                    submenuDiv.appendChild(submenuGroupDiv);
                });
            }

            systemDiv.appendChild(submenuDiv);
            panel.appendChild(systemDiv);
        });

        equipmentPanelsContainer.appendChild(panel);
    });

    // Equipment tab switching
    const equipmentTabs = document.querySelectorAll('.equipment-tab');
    equipmentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.equipmentCategory;

            // Update active tab
            equipmentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active panel
            const panels = document.querySelectorAll('.equipment-panel');
            panels.forEach(p => p.classList.remove('active'));
            const targetPanel = document.querySelector(`.equipment-panel[data-equipment-category="${category}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Initialize Discipline Tabs
function initializeDisciplineTabs() {
    // Get all discipline tabs across all phases
    const disciplineTabs = document.querySelectorAll('.discipline-tab');

    disciplineTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const discipline = this.dataset.discipline;
            const phasePanel = this.closest('.phase-panel');

            if (!phasePanel) return;

            // Update active tab within this phase
            const phaseTabs = phasePanel.querySelectorAll('.discipline-tab');
            phaseTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active discipline panel within this phase
            const disciplinePanels = phasePanel.querySelectorAll('.discipline-panel');
            disciplinePanels.forEach(p => p.classList.remove('active'));
            const targetPanel = phasePanel.querySelector(`.discipline-panel[data-discipline="${discipline}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Update global active discipline
            workflowState.activeDiscipline = discipline;
            saveProjectToStorage();

            // Update progress bar to show active discipline
            updateProgressBarDiscipline(discipline);
            updateStatusBar(); // Recalculate progress for new discipline
        });
    });
}

// Update progress bar to show active discipline name
function updateProgressBarDiscipline(discipline) {
    const statusTitle = document.querySelector('.status-bar-title span:last-child');
    if (statusTitle) {
        const disciplineNames = {
            mechanical: 'Mechanical',
            electrical: 'Electrical',
            plumbing: 'Plumbing'
        };
        const disciplineName = disciplineNames[discipline] || 'Project';
        statusTitle.textContent = `${disciplineName} Project Progress`;
    }
}

function initializeWorkflowHub() {
    // Only initialize if we're on the workflow hub page
    if (!document.querySelector('.workflow-setup')) {
        return;
    }

    // Initialize equipment selection
    initializeEquipmentSelection();

    // Initialize discipline tabs
    initializeDisciplineTabs();

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

    // Legacy discipline selector (kept for backward compatibility)
    if (projectDiscipline) {
        projectDiscipline.addEventListener('change', function() {
            workflowState.projectDiscipline = this.value;
            saveProjectToStorage();
            updateProjectDisplay();
            filterTasksByDiscipline();
        });
    }

    // New multi-discipline selector
    const disciplineCheckboxes = document.querySelectorAll('.discipline-checkbox input[type="checkbox"]');
    disciplineCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const discipline = this.value;
            if (this.checked) {
                if (!workflowState.projectDisciplines.includes(discipline)) {
                    workflowState.projectDisciplines.push(discipline);
                }
            } else {
                workflowState.projectDisciplines = workflowState.projectDisciplines.filter(d => d !== discipline);
            }

            // Update active discipline if needed
            if (workflowState.projectDisciplines.length > 0 && !workflowState.projectDisciplines.includes(workflowState.activeDiscipline)) {
                workflowState.activeDiscipline = workflowState.projectDisciplines[0];
            }

            saveProjectToStorage();
            updateProjectDisplay();
            updateDisciplineTabs();
        });
    });

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
            const discipline = this.dataset.discipline;

            // Store in legacy tasks object for backward compatibility
            workflowState.tasks[taskId] = this.checked;

            // Also store in discipline-specific tasks if discipline is specified
            if (discipline && workflowState.disciplineTasks[discipline]) {
                workflowState.disciplineTasks[discipline][taskId] = this.checked;
            }

            saveProjectToStorage();
            updatePhaseCompletion();
            updateStatusBar();
            updateDisciplineProgress();
        });
    });

    // Discipline Tab Clicks
    initializeDisciplineTabs();

    // Project Action Buttons
    const loadProjectActionBtn = document.getElementById('loadProjectActionBtn');
    const saveProjectActionBtn = document.getElementById('saveProjectActionBtn');
    const shareProjectActionBtn = document.getElementById('shareProjectActionBtn');

    if (loadProjectActionBtn) {
        loadProjectActionBtn.addEventListener('click', function() {
            openLoadProjectModal();
        });
    }

    if (saveProjectActionBtn) {
        saveProjectActionBtn.addEventListener('click', function() {
            openSaveProjectModal();
        });
    }

    if (shareProjectActionBtn) {
        shareProjectActionBtn.addEventListener('click', function() {
            openShareProjectModal();
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

    // Reset Workflow Button (New Project)
    const resetWorkflowBtn = document.getElementById('resetWorkflowBtn');
    if (resetWorkflowBtn) {
        resetWorkflowBtn.addEventListener('click', newProject);
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
    updateDisciplineTabs();
    updateDisciplineProgress();

    // Add event delegation for task checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            // Save task state
            const taskId = e.target.dataset.task;
            const discipline = e.target.dataset.discipline || '';

            if (!workflowState.disciplineTasks[discipline]) {
                workflowState.disciplineTasks[discipline] = {};
            }

            workflowState.disciplineTasks[discipline][taskId] = e.target.checked;

            // Update progress bar
            updateStatusBar();
            saveProjectToStorage();
        }
    });
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

    // Update discipline tabs visibility and active state
    updateDisciplineTabs();
}

// Initialize discipline tab functionality
function initializeDisciplineTabs() {
    const disciplineTabs = document.querySelectorAll('.discipline-tab');

    disciplineTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const discipline = this.dataset.discipline;

            // Only allow clicking on tabs for selected disciplines
            if (!workflowState.projectDisciplines.includes(discipline)) {
                return;
            }

            workflowState.activeDiscipline = discipline;
            saveProjectToStorage();
            updateDisciplineTabs();
            updateDisciplineProgress();
        });
    });
}

// Update discipline tabs visibility and active state
function updateDisciplineTabs() {
    const phasePanels = document.querySelectorAll('.phase-panel');

    phasePanels.forEach(phasePanel => {
        const tabs = phasePanel.querySelectorAll('.discipline-tab');
        const panels = phasePanel.querySelectorAll('.discipline-panel');

        // Update tab visibility and active state
        tabs.forEach(tab => {
            const discipline = tab.dataset.discipline;

            if (workflowState.projectDisciplines.includes(discipline)) {
                tab.classList.remove('hidden');

                if (discipline === workflowState.activeDiscipline) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            } else {
                tab.classList.add('hidden');
                tab.classList.remove('active');
            }
        });

        // Update panel visibility
        panels.forEach(panel => {
            const discipline = panel.dataset.discipline;

            if (discipline === workflowState.activeDiscipline && workflowState.projectDisciplines.includes(discipline)) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    });
}

// Update progress bar based on active discipline
function updateDisciplineProgress() {
    const activeDiscipline = workflowState.activeDiscipline;

    if (!activeDiscipline || !workflowState.projectDisciplines.includes(activeDiscipline)) {
        return;
    }

    // Get all tasks for the active discipline
    const disciplineTasks = workflowState.disciplineTasks[activeDiscipline] || {};

    // Count completed tasks for this discipline
    let totalTasks = 0;
    let completedTasks = 0;

    const taskCheckboxes = document.querySelectorAll(`.task-checkbox[data-discipline="${activeDiscipline}"]`);
    taskCheckboxes.forEach(checkbox => {
        totalTasks++;
        if (checkbox.checked) {
            completedTasks++;
        }
    });

    // Update the progress display (you can customize this)
    const actualProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update the actual progress bar
    const actualProgressBar = document.getElementById('actualProgressBar');
    const actualProgressText = document.getElementById('actualProgress');

    if (actualProgressBar) {
        actualProgressBar.style.width = actualProgress + '%';
    }

    if (actualProgressText) {
        actualProgressText.textContent = actualProgress + '%';
    }
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
    // Calculate actual progress based on completed tasks weighted by phase percentages
    const activeDiscipline = workflowState.activeDiscipline || 'mechanical';

    // Phase data mapping to HTML data-phase attributes
    const phaseMapping = {
        'programming': 'programming',
        'schematic-design': 'schematic',
        'design-development': 'design-dev',
        'construction-documents': 'construction-docs',
        'construction-administration': 'construction-admin'
    };

    let weightedProgress = 0;

    // If delivery method is selected, calculate weighted progress
    if (workflowState.deliveryMethod && deliveryMethodData[workflowState.deliveryMethod]) {
        const methodData = deliveryMethodData[workflowState.deliveryMethod];

        Object.entries(methodData.phases).forEach(([phaseName, phasePercentage]) => {
            const phaseAttr = phaseMapping[phaseName];
            if (!phaseAttr) return;

            // Get tasks for this phase and discipline
            const phasePanel = document.querySelector(`.phase-panel[data-phase="${phaseAttr}"]`);
            if (!phasePanel) return;

            const disciplinePanel = phasePanel.querySelector(`.discipline-panel[data-discipline="${activeDiscipline}"]`);
            if (!disciplinePanel) return;

            const taskCheckboxes = disciplinePanel.querySelectorAll('.task-checkbox');
            const totalPhaseTasks = taskCheckboxes.length;
            let completedPhaseTasks = 0;

            taskCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    completedPhaseTasks++;
                }
            });

            // Calculate this phase's contribution to overall progress
            const phaseCompletionRatio = totalPhaseTasks > 0 ? completedPhaseTasks / totalPhaseTasks : 0;
            weightedProgress += phaseCompletionRatio * phasePercentage;
        });
    } else {
        // Fallback: simple calculation if no delivery method selected
        const taskCheckboxes = document.querySelectorAll(`.discipline-panel[data-discipline="${activeDiscipline}"] .task-checkbox`);
        let totalTasks = taskCheckboxes.length;
        let completedTasks = 0;

        taskCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                completedTasks++;
            }
        });

        weightedProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    }

    const actualProgress = Math.round(weightedProgress);

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


// Voltage Drop Calculator - moved to calculators/voltage_drop.js
// Circuit Sizing Calculator - moved to calculators/circuit_sizing.js
// Electrical Load Calculation - moved to calculators/electrical_load_calc.js

// ====================================
// SAVE/LOAD/SHARE PROJECT MODALS
// ====================================

// Open Save Project Modal
function openSaveProjectModal() {
    const modal = document.getElementById('saveProjectModal');
    const input = document.getElementById('projectNameInput');
    const message = document.getElementById('saveProjectMessage');

    // Pre-fill with current project name if exists
    if (workflowState.projectName) {
        input.value = workflowState.projectName;
    }

    // Clear any previous message
    message.className = 'modal-message';
    message.textContent = '';

    modal.style.display = 'flex';
}

// Close Save Project Modal
function closeSaveProjectModal() {
    const modal = document.getElementById('saveProjectModal');
    modal.style.display = 'none';
}

// Save Project with Name
async function saveProjectWithName() {
    const input = document.getElementById('projectNameInput');
    const message = document.getElementById('saveProjectMessage');
    const projectName = input.value.trim();

    if (!projectName) {
        message.className = 'modal-message error';
        message.textContent = 'Please enter a project name';
        return;
    }

    // Update workflow state with project name
    workflowState.projectName = projectName;
    workflowState.lastSaved = new Date().toISOString();

    // Check if user is logged in
    if (!currentUser && !authToken) {
        // Show localStorage warning if not logged in
        showLocalStorageWarning();
    }

    // Save to storage
    if (currentUser && authToken) {
        // Save to cloud
        try {
            await saveProjectToCloud();
            message.className = 'modal-message success';
            message.textContent = 'Project saved to cloud successfully!';

            setTimeout(() => {
                closeSaveProjectModal();
            }, 1500);
        } catch (error) {
            message.className = 'modal-message error';
            message.textContent = 'Error saving to cloud: ' + error.message;
        }
    } else {
        // Save to localStorage
        try {
            localStorage.setItem('workflowProject', JSON.stringify(workflowState));
            localStorage.setItem('workflowProject_' + Date.now(), JSON.stringify({
                name: projectName,
                data: workflowState,
                savedAt: new Date().toISOString()
            }));

            message.className = 'modal-message success';
            message.textContent = 'Project saved locally!';

            setTimeout(() => {
                closeSaveProjectModal();
            }, 1500);
        } catch (e) {
            message.className = 'modal-message error';
            message.textContent = 'Error saving project: ' + e.message;
        }
    }
}

// Open Load Project Modal (My Projects)
async function openLoadProjectModal() {
    const modal = document.getElementById('myProjectsModal');
    const projectsList = document.getElementById('projectsList');

    modal.style.display = 'flex';

    // Show loading state
    projectsList.innerHTML = `
        <div class="loading-projects">
            <div class="loading-spinner"></div>
            <p>Loading your projects...</p>
        </div>
    `;

    // Load projects
    if (currentUser && authToken) {
        // Load from cloud
        const projects = await loadAllUserProjects();
        displayProjectsList(projects);
    } else {
        // Load from localStorage
        const localProjects = loadLocalProjects();
        displayProjectsList(localProjects);
    }
}

// Load projects from localStorage
function loadLocalProjects() {
    const projects = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
        if (key.startsWith('workflowProject_')) {
            try {
                const project = JSON.parse(localStorage.getItem(key));
                projects.push({
                    id: key,
                    name: project.name || 'Unnamed Project',
                    savedAt: project.savedAt,
                    data: project.data
                });
            } catch (e) {
                console.error('Error loading project:', e);
            }
        }
    }

    // Sort by saved date, newest first
    projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    return projects;
}

// Display projects list
function displayProjectsList(projects) {
    const projectsList = document.getElementById('projectsList');

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="no-projects">
                <p>📁</p>
                <p>No saved projects found</p>
                <p class="no-projects-subtitle">Create your first project to get started!</p>
            </div>
        `;
        return;
    }

    let html = '';
    for (const project of projects) {
        const savedDate = new Date(project.savedAt || project.createdAt);
        const formattedDate = savedDate.toLocaleDateString() + ' ' + savedDate.toLocaleTimeString();

        html += `
            <div class="project-card">
                <div class="project-card-header">
                    <div class="project-icon">📋</div>
                    <div class="project-info">
                        <h3 class="project-title">${project.name || 'Unnamed Project'}</h3>
                        <p class="project-meta">${project.data?.projectCity || 'No location'} • ${project.data?.deliveryMethod || 'No delivery method'}</p>
                        <p class="project-date">Saved: ${formattedDate}</p>
                    </div>
                </div>
                <div class="project-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="loadProject('${project.id}')">Load</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteProject('${project.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    projectsList.innerHTML = html;
}

// Load a specific project
async function loadProject(projectId) {
    if (currentUser && authToken) {
        // Load from cloud
        await loadProjectById(projectId);
    } else {
        // Load from localStorage
        try {
            const projectData = localStorage.getItem(projectId);
            if (projectData) {
                const project = JSON.parse(projectData);
                restoreProjectState(project.data);
                closeMyProjectsModal();
                showNotification('Project loaded successfully!', 'success');
                updateStatusBar();
                updateWorkflowDisplay();
            }
        } catch (e) {
            showNotification('Error loading project', 'error');
        }
    }
}

// Delete a project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    if (currentUser && authToken) {
        // Delete from cloud
        try {
            const response = await fetch(`${CLOUDFLARE_API_URL}/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Project deleted ✓', 'success');
                openLoadProjectModal(); // Refresh the list
            } else {
                throw new Error(data.error || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('Error deleting project: ' + error.message, 'error');
        }
    } else {
        // Delete from localStorage
        localStorage.removeItem(projectId);
        openLoadProjectModal(); // Refresh the list
        showNotification('Project deleted ✓', 'info');
    }
}

// Close My Projects Modal
function closeMyProjectsModal() {
    const modal = document.getElementById('myProjectsModal');
    modal.style.display = 'none';
}

// Open Share Project Modal
function openShareProjectModal() {
    if (!currentUser && !authToken) {
        showNotification('Please log in to share projects', 'warning');
        return;
    }

    const modal = document.getElementById('shareProjectModal');
    const message = document.getElementById('shareProjectMessage');

    // Clear any previous message
    message.className = 'modal-message';
    message.textContent = '';

    modal.style.display = 'flex';
}

// Close Share Project Modal
function closeShareProjectModal() {
    const modal = document.getElementById('shareProjectModal');
    modal.style.display = 'none';
}

// Send project to user
async function sendProjectToUser() {
    const emailInput = document.getElementById('shareEmailInput');
    const message = document.getElementById('shareProjectMessage');
    const email = emailInput.value.trim();

    if (!email) {
        message.className = 'modal-message error';
        message.textContent = 'Please enter a recipient email';
        return;
    }

    if (!currentUser || !authToken) {
        message.className = 'modal-message error';
        message.textContent = 'Please log in to share projects';
        return;
    }

    // Implement share functionality
    message.className = 'modal-message info';
    message.textContent = 'Sending project... (Cloud sharing not yet implemented)';

    // TODO: Implement API call to share project
    setTimeout(() => {
        message.className = 'modal-message success';
        message.textContent = 'Project sent successfully!';
    }, 1500);
}

// Add collaborator
async function addCollaborator() {
    const emailInput = document.getElementById('collaboratorEmailInput');
    const message = document.getElementById('shareProjectMessage');
    const email = emailInput.value.trim();

    if (!email) {
        message.className = 'modal-message error';
        message.textContent = 'Please enter a collaborator email';
        return;
    }

    if (!currentUser || !authToken) {
        message.className = 'modal-message error';
        message.textContent = 'Please log in to enable collaboration';
        return;
    }

    // Implement collaboration functionality
    message.className = 'modal-message info';
    message.textContent = 'Adding collaborator... (Cloud collaboration not yet implemented)';

    // TODO: Implement API call to add collaborator
    setTimeout(() => {
        message.className = 'modal-message success';
        message.textContent = 'Collaborator added successfully!';
    }, 1500);
}

// Show localStorage warning
function showLocalStorageWarning() {
    const modal = document.getElementById('localStorageWarningModal');
    modal.style.display = 'flex';

    // Store that user has seen the warning
    localStorage.setItem('hasSeenStorageWarning', 'true');
}

// Close localStorage warning
function closeLocalStorageWarning() {
    const modal = document.getElementById('localStorageWarningModal');
    modal.style.display = 'none';
}

// New Project (Reset)
function newProject() {
    if (confirm('Are you sure you want to start a new project? This will clear all current progress.')) {
        // Reset workflow state
        workflowState = {
            projectName: '',
            projectNumber: '',
            projectCity: '',
            projectState: '',
            projectType: '',
            projectDiscipline: '',
            deliveryMethod: '',
            startDate: '',
            dueDate: '',
            notes: '',
            currentPhase: 0,
            tasks: {},
            projectDisciplines: ['mechanical', 'electrical', 'plumbing'],
            activeDiscipline: 'mechanical',
            equipment: {
                hvac: {},
                electrical: {},
                plumbing: {}
            }
        };

        // Clear form inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="date"], textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Reset active buttons
        const activeButtons = document.querySelectorAll('.active');
        activeButtons.forEach(btn => btn.classList.remove('active'));

        // Update displays
        updateStatusBar();
        updateWorkflowDisplay();
        updateProjectDisplay();

        // Save the reset state
        saveProjectToStorage();

        showNotification('New project started', 'success');
    }
}
