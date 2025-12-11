/**
 * Cloudflare Workers Authentication Module for EngrAssist
 * Replace Firebase authentication code with this
 */

// ====================================
// CLOUDFLARE CONFIGURATION
// ====================================

// UPDATE THIS with your deployed Worker URL
// For local testing: 'http://localhost:8787'
// For production: 'https://engrassist-api.engrassist.workers.dev'
const CLOUDFLARE_API_URL = 'https://engrassist-api.engrassist.workers.dev';

// Google OAuth Client ID (optional - for Google Sign-In)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Global variables
let currentUser = null;
let authToken = null;

// ====================================
// INITIALIZATION
// ====================================

/**
 * Initialize authentication on page load
 */
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
    initializeGoogleSignIn();
}

/**
 * Initialize Google Sign-In button
 */
function initializeGoogleSignIn() {
    if (typeof google === 'undefined') {
        console.log('Google Sign-In SDK not loaded');
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn
    });
}

// ====================================
// AUTHENTICATION FUNCTIONS
// ====================================

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
    if (typeof google === 'undefined') {
        console.error('Google Sign-In not loaded');
        // Fallback to email/password modal
        showEmailSignInModal();
        return;
    }

    google.accounts.id.prompt(); // Show One Tap dialog
}

/**
 * Handle Google Sign-In callback
 */
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

            // Save to localStorage
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            updateUIForAuthState(currentUser);
            showNotification('Signed in successfully!', 'success');

            // Load projects
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

/**
 * Sign in with email and password
 */
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

/**
 * Sign up with email and password
 */
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

/**
 * Sign out
 */
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

// ====================================
// UI UPDATE FUNCTIONS
// ====================================

/**
 * Update UI based on authentication state
 */
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
        // User is signed in - Desktop
        if (signInBtn) signInBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (userName) userName.textContent = user.name || user.email.split('@')[0];
        if (userPhoto) userPhoto.src = user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%23667eea"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">' + (user.name ? user.name[0].toUpperCase() : 'U') + '</text></svg>';

        // User is signed in - Mobile
        if (mobileUserProfile) mobileUserProfile.style.display = 'flex';
        if (mobileUserName) mobileUserName.textContent = user.name || user.email.split('@')[0];
        if (mobileUserEmail) mobileUserEmail.textContent = user.email;
        if (mobileUserPhoto) mobileUserPhoto.src = user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" fill="%23667eea"/><text x="24" y="32" text-anchor="middle" fill="white" font-size="20" font-family="Arial">' + (user.name ? user.name[0].toUpperCase() : 'U') + '</text></svg>';
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

/**
 * Toggle user dropdown menu
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userProfile = document.getElementById('userProfile');
    const dropdown = document.getElementById('userDropdown');

    if (dropdown && userProfile && !userProfile.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// ====================================
// PROJECT STORAGE FUNCTIONS
// ====================================

/**
 * Save project to storage (Cloudflare if logged in, localStorage otherwise)
 */
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

/**
 * Save project to Cloudflare Workers
 */
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

/**
 * Load project from storage
 */
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

/**
 * Load current/last project from cloud
 */
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

/**
 * Load all user projects
 */
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

/**
 * Load specific project by ID
 */
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

/**
 * Delete project by ID
 */
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

// ====================================
// EMAIL/PASSWORD SIGN-IN MODAL
// ====================================

/**
 * Show email/password sign-in modal
 */
function showEmailSignInModal() {
    // Create modal if it doesn't exist
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

/**
 * Show sign-up modal
 */
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

/**
 * Parse JWT token (client-side only - for display purposes)
 */
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

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeAuth);
}
