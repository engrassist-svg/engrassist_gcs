# EngrAssist Authentication & Security Guide

Complete guide to the authentication system with password management, user profiles, and OAuth integration.

## Table of Contents
- [Features](#features)
- [Security Standards](#security-standards)
- [User Features](#user-features)
- [Google OAuth Setup](#google-oauth-setup)
- [Email Integration](#email-integration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)

---

## Features

### ✅ Implemented Features

#### Authentication
- ✅ Email/Password Registration
- ✅ Email/Password Sign-In
- ✅ Google OAuth Sign-In (requires configuration)
- ✅ JWT-based session management
- ✅ Persistent login (localStorage)

#### Password Management
- ✅ Password Reset via Email
- ✅ Password Change for logged-in users
- ✅ Secure password hashing (PBKDF2)
- ✅ Password strength requirements (8+ characters)
- ✅ Password reset tokens with expiry (1 hour)

#### User Profile
- ✅ View user profile
- ✅ Update display name
- ✅ Profile photos (via OAuth)
- ✅ Account creation/update timestamps

#### Security
- ✅ PBKDF2 password hashing (100,000 iterations)
- ✅ Rate limiting on authentication endpoints
- ✅ Secure password reset tokens
- ✅ JWT token expiration (30 days)
- ✅ Backwards compatibility with legacy SHA-256 hashes

---

## Security Standards

### Password Hashing
- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt**: 16-byte random salt per password
- **Format**: `salt:hash` (hex encoded)
- **Backwards Compatible**: Supports legacy SHA-256 hashes

### Password Requirements
- Minimum 8 characters
- Recommended: Mix of letters, numbers, and symbols
- Enforced on both frontend and backend

### Rate Limiting
```javascript
Authentication endpoints: 5 requests per minute
API endpoints: 60 requests per minute
```

### JWT Tokens
- Algorithm: HMAC SHA-256
- Expiration: 30 days
- Stored in: localStorage
- Format: Standard JWT (header.payload.signature)

### Password Reset
- Token format: Double UUID (`uuid-uuid`)
- Expiration: 1 hour
- Single use: Marked as used after successful reset
- All other tokens invalidated after successful reset

---

## User Features

### 1. Sign Up (Email/Password)
**Location**: Any page → Sign In → Sign Up
**Requirements**:
- Valid email address
- Password (8+ characters)
- Optional display name

**Process**:
1. User enters email, password, and name
2. Backend validates and creates account
3. Password hashed with PBKDF2
4. JWT token generated
5. User automatically signed in

### 2. Sign In (Email/Password)
**Location**: Any page → Sign In
**Process**:
1. User enters email and password
2. Backend verifies credentials
3. JWT token generated
4. User session established

### 3. Google Sign-In
**Location**: Any page → Sign In (when configured)
**Requirements**: Google OAuth Client ID configured
**Process**:
1. User clicks "Sign in with Google"
2. Google One Tap dialog appears
3. User authenticates with Google
4. Backend creates/retrieves user account
5. JWT token generated
6. User session established

### 4. Forgot Password
**Location**: Sign In → Forgot Password?
**Process**:
1. User enters email address
2. Backend generates secure reset token
3. Email sent with reset link (or shown in console for dev)
4. User clicks link in email
5. User enters new password
6. Password updated, token marked as used

**Email Template** (to be implemented):
```
Subject: Reset Your EngrAssist Password

Hi [Name],

We received a request to reset your password. Click the link below to create a new password:

[Reset Link]

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

Thanks,
The EngrAssist Team
```

### 5. Change Password
**Location**: Account Settings → Security & Password
**Requirements**: User must be logged in with email/password (not OAuth)
**Process**:
1. User enters current password
2. User enters new password (twice)
3. Backend verifies current password
4. New password hashed and saved
5. All reset tokens invalidated

### 6. Update Profile
**Location**: Account Settings → Profile Information
**Available Fields**:
- Display name
- Email (view only, cannot be changed)
- Profile photo (OAuth users only)

**Process**:
1. User updates display name
2. Changes saved to database
3. UI updates immediately
4. Session storage updated

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity Services"

### Step 2: Configure OAuth Consent Screen
1. Navigate to "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: EngrAssist
   - User support email: your@email.com
   - Developer contact: your@email.com
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Save and continue

### Step 3: Create OAuth Credentials
1. Navigate to "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   ```
   https://engrassist.com
   http://localhost:3000
   ```
5. Add authorized redirect URIs:
   ```
   https://engrassist.com
   http://localhost:3000
   ```
6. Click "Create"
7. **Copy your Client ID**

### Step 4: Update Configuration
Edit `/scripts.js` line 342:
```javascript
// Before:
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// After:
const GOOGLE_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
```

### Step 5: Add Google Sign-In Script
Already included in all pages:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 6: Test
1. Open your website
2. Click "Sign In"
3. Google One Tap should appear
4. Sign in with Google account
5. Verify user is created in database

### Security Verification (Production)
**Current**: Client-side token verification
**Recommended**: Server-side verification

Add to `/cloudflare-worker/worker.js`:
```javascript
// In handleGoogleAuth function, add:
const response = await fetch(
  `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
);
const tokenInfo = await response.json();

// Verify token
if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
  return jsonResponse({ error: 'Invalid token' }, 401);
}
```

---

## Email Integration

### Current Status
- ✅ Backend endpoints ready
- ✅ Token generation working
- ⚠️ Email sending not configured (dev mode returns token in response)

### Recommended Email Services (Free Tiers)

#### Option 1: SendGrid (Free: 100 emails/day)
```javascript
// Add to worker.js
async function sendPasswordResetEmail(email, resetLink, userName) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        subject: 'Reset Your EngrAssist Password'
      }],
      from: { email: 'noreply@engrassist.com', name: 'EngrAssist' },
      content: [{
        type: 'text/html',
        value: `
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `
      }]
    })
  });
}
```

#### Option 2: Mailgun (Free: 5,000 emails/month)
```javascript
async function sendPasswordResetEmail(email, resetLink, userName) {
  const formData = new FormData();
  formData.append('from', 'EngrAssist <noreply@engrassist.com>');
  formData.append('to', email);
  formData.append('subject', 'Reset Your EngrAssist Password');
  formData.append('html', `...`);

  const response = await fetch(
    `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`api:${env.MAILGUN_API_KEY}`)
      },
      body: formData
    }
  );
}
```

#### Option 3: Resend (Free: 100 emails/day)
```javascript
async function sendPasswordResetEmail(email, resetLink, userName) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'EngrAssist <noreply@engrassist.com>',
      to: email,
      subject: 'Reset Your EngrAssist Password',
      html: `...`
    })
  });
}
```

### Integration Steps
1. Choose email service and sign up
2. Get API key
3. Add to Cloudflare Workers environment:
   ```bash
   wrangler secret put SENDGRID_API_KEY
   ```
4. Update `handleForgotPassword` function to call email service
5. Remove dev mode code (resetToken/resetLink from response)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,              -- UUID
    email TEXT UNIQUE NOT NULL,       -- User email
    name TEXT,                        -- Display name
    password_hash TEXT,               -- PBKDF2 hash (or NULL for OAuth)
    photo_url TEXT,                   -- Profile photo URL
    auth_provider TEXT DEFAULT 'email', -- 'email' or 'google'
    created_at INTEGER NOT NULL,      -- Unix timestamp
    updated_at INTEGER                -- Unix timestamp
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id TEXT PRIMARY KEY,              -- UUID
    user_id TEXT NOT NULL,            -- FK to users.id
    token TEXT UNIQUE NOT NULL,       -- Reset token (uuid-uuid)
    expires_at INTEGER NOT NULL,      -- Unix timestamp
    used INTEGER DEFAULT 0,           -- 0 = not used, 1 = used
    created_at INTEGER NOT NULL,      -- Unix timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,              -- UUID
    user_id TEXT NOT NULL,            -- FK to users.id
    data TEXT NOT NULL,               -- JSON project data
    created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)),
    updated_at INTEGER NOT NULL,      -- Unix timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt.token.here"
}
```

**Errors**:
- `400`: Password must be at least 8 characters
- `409`: User already exists

---

#### POST `/api/auth/signin`
Sign in existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt.token.here"
}
```

**Errors**:
- `401`: Invalid credentials

---

#### POST `/api/auth/google`
Google OAuth authentication

**Request**:
```json
{
  "idToken": "google.jwt.token",
  "email": "user@gmail.com",
  "name": "John Doe",
  "photoURL": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "John Doe",
    "photoURL": "https://..."
  },
  "token": "jwt.token.here"
}
```

---

#### POST `/api/auth/forgot-password`
Request password reset

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent.",
  "resetToken": "uuid-uuid",  // DEV ONLY
  "resetLink": "http://..."   // DEV ONLY
}
```

**Rate Limit**: 5 requests per minute per email

---

#### POST `/api/auth/reset-password`
Reset password with token

**Request**:
```json
{
  "token": "uuid-uuid",
  "newPassword": "newsecurepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Errors**:
- `400`: Token and new password required
- `400`: Password must be at least 8 characters
- `400`: Invalid or expired reset token

---

#### POST `/api/auth/change-password`
Change password (requires authentication)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newsecurepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors**:
- `401`: Unauthorized (no token)
- `401`: Current password is incorrect
- `400`: New password must be at least 8 characters
- `400`: Cannot change password for OAuth accounts

---

### User Profile Endpoints

#### GET `/api/user/profile`
Get user profile (requires authentication)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "photoURL": "https://...",
    "authProvider": "email",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
}
```

---

#### PUT `/api/user/profile`
Update user profile (requires authentication)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request**:
```json
{
  "name": "Jane Doe",
  "photoURL": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "photoURL": "https://..."
  }
}
```

---

## Frontend Pages

### 1. Account Settings (`/user-settings.html`)
**Features**:
- View and edit profile information
- Change password (email users only)
- View authentication method
- Profile photo display

**Access**: Requires login

---

### 2. Password Reset (`/reset-password.html`)
**Features**:
- Enter new password
- Confirm password
- Password requirements display
- Auto-redirect after success

**Access**: Public (requires valid token in URL)

**URL Format**: `/reset-password.html?token=uuid-uuid`

---

### 3. Sign In Modal
**Features**:
- Email/password login
- "Forgot password?" link
- Link to sign up
- Google Sign-In button (when configured)

**Access**: Public (click "Sign In" on any page)

---

### 4. Sign Up Modal
**Features**:
- Email/password registration
- Name field
- Password requirements (8+ characters)
- Link to sign in

**Access**: Public (from sign-in modal)

---

### 5. Forgot Password Modal
**Features**:
- Email input
- Success/error messages
- Link back to sign in
- Dev mode shows reset link

**Access**: Public (from sign-in modal)

---

## Testing

### Manual Testing Checklist

#### Email/Password Authentication
- [ ] Sign up with new email
- [ ] Sign up with existing email (should fail)
- [ ] Sign up with password < 8 chars (should fail)
- [ ] Sign in with correct credentials
- [ ] Sign in with incorrect password (should fail)
- [ ] Sign out
- [ ] Refresh page after sign in (should stay signed in)

#### Password Reset
- [ ] Request password reset with valid email
- [ ] Request password reset with invalid email (should show same message)
- [ ] Click reset link from email/console
- [ ] Enter new password < 8 chars (should fail)
- [ ] Enter mismatched passwords (should fail)
- [ ] Successfully reset password
- [ ] Try to use same reset token again (should fail)
- [ ] Sign in with new password
- [ ] Try to use expired token (after 1 hour, should fail)

#### Password Change
- [ ] Navigate to account settings
- [ ] Enter wrong current password (should fail)
- [ ] Enter new password < 8 chars (should fail)
- [ ] Enter mismatched new passwords (should fail)
- [ ] Successfully change password
- [ ] Sign out and sign in with new password

#### User Profile
- [ ] View profile information
- [ ] Update display name
- [ ] Verify name updates in header
- [ ] Refresh page (name should persist)
- [ ] Verify email cannot be changed

#### Google OAuth (when configured)
- [ ] Click "Sign in with Google"
- [ ] Complete Google authentication
- [ ] Verify user created in database
- [ ] Verify profile photo displays
- [ ] Sign out
- [ ] Sign in with Google again (should use existing account)
- [ ] Verify password section hidden in settings

#### Rate Limiting
- [ ] Request password reset 6 times in 1 minute
- [ ] 6th request should return 429 error
- [ ] Wait 1 minute, should work again

#### Mobile Responsiveness
- [ ] All features work on mobile
- [ ] Settings link appears in mobile menu
- [ ] Modals display correctly on mobile
- [ ] Forms are usable on mobile

---

## Environment Variables

Add these to your Cloudflare Worker:

```bash
# Required
wrangler secret put JWT_SECRET
# Enter a long random string (32+ characters)

# Optional (for email)
wrangler secret put SENDGRID_API_KEY
# or
wrangler secret put MAILGUN_API_KEY
wrangler secret put MAILGUN_DOMAIN
# or
wrangler secret put RESEND_API_KEY

# Optional (for production)
wrangler secret put GOOGLE_CLIENT_ID
```

Also update `wrangler.toml`:
```toml
[vars]
APP_URL = "https://engrassist.com"
```

---

## Migration from Old System

### Existing Users (SHA-256 passwords)
- ✅ Automatic migration on login
- Old passwords verified with SHA-256
- Password automatically re-hashed with PBKDF2 on next login
- No user action required

### Manual Migration Script
If needed, force migrate all users:

```javascript
// Run in Cloudflare Workers Console
async function migratePasswords() {
  const users = await env.DB.prepare(
    'SELECT * FROM users WHERE password_hash NOT LIKE "%:%"'
  ).all();

  console.log(`Found ${users.results.length} users to migrate`);

  // Cannot re-hash without original passwords
  // Users will migrate automatically on next login
  // OR send password reset emails to all users
}
```

---

## Support & Troubleshooting

### Common Issues

**"Invalid token signature"**
- JWT_SECRET changed or not set
- Solution: Set consistent JWT_SECRET in Cloudflare

**"Token expired"**
- User hasn't signed in for 30+ days
- Solution: Sign in again

**"Invalid or expired reset token"**
- Token older than 1 hour
- Token already used
- Solution: Request new password reset

**Google Sign-In not appearing**
- GOOGLE_CLIENT_ID not configured
- Solution: Follow Google OAuth setup steps

**Rate limit errors**
- Too many requests from same email/IP
- Solution: Wait 1 minute, try again

---

## Future Enhancements

### Planned Features
- [ ] Email verification on signup
- [ ] Two-factor authentication (2FA)
- [ ] Session management (view/revoke devices)
- [ ] Account deletion
- [ ] Export user data (GDPR compliance)
- [ ] Login activity log
- [ ] Password expiration policies
- [ ] Social auth (Facebook, GitHub, Apple)
- [ ] Magic link login (passwordless)

### Security Improvements
- [ ] Implement CAPTCHA on auth endpoints
- [ ] IP-based rate limiting
- [ ] Cloudflare KV for distributed rate limiting
- [ ] Security headers (CSP, HSTS)
- [ ] Account lockout after failed attempts
- [ ] Suspicious activity detection
- [ ] Breach password detection (Have I Been Pwned API)

---

## Compliance

### GDPR
- ✅ User data stored securely
- ✅ Password hashing with PBKDF2
- ⚠️ Need: Data export feature
- ⚠️ Need: Account deletion feature
- ⚠️ Need: Privacy policy

### Security Best Practices
- ✅ HTTPS only
- ✅ Secure password hashing
- ✅ Rate limiting
- ✅ JWT expiration
- ✅ Single-use reset tokens
- ✅ Password strength requirements
- ✅ No plaintext passwords
- ⚠️ Need: Email verification
- ⚠️ Need: 2FA option

---

## Credits

**Authentication System**: EngrAssist Team
**Cloudflare Workers**: Serverless backend
**D1 Database**: SQLite on Cloudflare
**PBKDF2 Implementation**: Web Crypto API
**JWT Implementation**: Custom HMAC SHA-256

---

## License

This authentication system is part of EngrAssist and follows the project's main license.

---

**Last Updated**: 2025-12-11
**Version**: 1.0.0
**Status**: Production Ready (pending email integration)
