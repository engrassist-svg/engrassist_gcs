# Google OAuth Setup Guide for EngrAssist

Quick guide to enable "Sign in with Google" on EngrAssist.

## Why Google OAuth?

- **Free**: No cost for authentication
- **Convenient**: Users don't need to create another password
- **Secure**: Handled by Google's infrastructure
- **Profile Photos**: Automatic user avatars
- **Trusted**: Users already trust Google

## Prerequisites

- Google Account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- 10 minutes

## Step-by-Step Setup

### Step 1: Create Google Cloud Project (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top left)
3. Click "New Project"
4. Enter project name: `EngrAssist`
5. Click "Create"
6. Wait for project creation notification

### Step 2: Enable Google Identity Services (1 minute)

1. In your new project, search for "Google+ API" in the search bar
2. Click "Enable" (or it might already be enabled)
3. If not found, you can skip this - it's often enabled by default

### Step 3: Configure OAuth Consent Screen (3 minutes)

1. In the left sidebar, navigate to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Click "Create"

Fill in the required information:
- **App name**: `EngrAssist`
- **User support email**: Select your email
- **App logo**: (optional) Upload EngrAssist logo
- **App domain**: (skip for now)
- **Authorized domains**: `engrassist.com`
- **Developer contact information**: Your email

4. Click "Save and Continue"

Add scopes:
5. Click "Add or Remove Scopes"
6. Select these scopes:
   - `email`
   - `profile`
   - `openid`
7. Click "Update"
8. Click "Save and Continue"

Test users (for development):
9. Click "Add Users"
10. Add your email address
11. Click "Save and Continue"
12. Review summary and click "Back to Dashboard"

### Step 4: Create OAuth Credentials (2 minutes)

1. Navigate to: **APIs & Services** → **Credentials**
2. Click "**Create Credentials**" → "**OAuth client ID**"
3. Choose application type: "**Web application**"
4. Enter name: `EngrAssist Web`

Add **Authorized JavaScript origins**:
5. Click "Add URI" and add:
   ```
   https://engrassist.com
   ```
6. For local testing, also add:
   ```
   http://localhost:3000
   ```

Add **Authorized redirect URIs**:
7. Click "Add URI" and add:
   ```
   https://engrassist.com
   ```
8. For local testing, also add:
   ```
   http://localhost:3000
   ```

9. Click "**Create**"

### Step 5: Copy Your Client ID (30 seconds)

You'll see a popup with your credentials:

```
Client ID: 1234567890-abc123xyz456.apps.googleusercontent.com
Client Secret: (you don't need this)
```

**IMPORTANT**: Copy the entire Client ID (it ends with `.apps.googleusercontent.com`)

Click "OK" to close the popup.

### Step 6: Update EngrAssist Code (1 minute)

1. Open your codebase
2. Edit the file: `scripts.js`
3. Find line ~342:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
   ```
4. Replace with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = '1234567890-abc123xyz456.apps.googleusercontent.com';
   ```
5. Save the file

### Step 7: Deploy and Test (1 minute)

1. Deploy your website (or refresh if already deployed)
2. Open your site in a browser
3. Click "**Sign In**"
4. You should see the Google One Tap dialog appear!
5. Sign in with your Google account
6. Verify you're logged in

## Verification Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Client ID copied
- [ ] `scripts.js` updated with real Client ID
- [ ] Website deployed
- [ ] Google Sign-In button appears
- [ ] Successfully signed in with Google
- [ ] User profile displays correctly
- [ ] User can sign out and sign in again

## Troubleshooting

### Google One Tap doesn't appear

**Problem**: Sign In button clicked but no Google dialog

**Solutions**:
1. Check browser console for errors
2. Verify Client ID is correct (no typos)
3. Verify Client ID ends with `.apps.googleusercontent.com`
4. Check that your domain is in "Authorized JavaScript origins"
5. Try in incognito/private mode
6. Clear browser cache
7. Make sure Google script is loaded: Check for `<script src="https://accounts.google.com/gsi/client">`

### "Invalid client ID" error

**Problem**: Google shows "Invalid client ID"

**Solutions**:
1. Double-check Client ID in `scripts.js`
2. Ensure you copied the full Client ID including `.apps.googleusercontent.com`
3. Verify the OAuth client wasn't deleted from Google Console
4. Check that your website domain matches authorized origins

### "Redirect URI mismatch" error

**Problem**: Error about redirect URI

**Solutions**:
1. Add your website URL to "Authorized redirect URIs" in Google Console
2. Make sure URL matches exactly (http vs https)
3. Remove trailing slashes if present
4. Wait a few minutes after changing settings (Google caching)

### Google sign-in works but creates duplicate users

**Problem**: Each Google sign-in creates a new account

**Solutions**:
1. Check backend database for duplicate emails
2. Verify backend properly checks for existing users by email
3. Check that `auth_provider` field is set correctly

### Local testing doesn't work

**Problem**: Google OAuth doesn't work on `localhost`

**Solutions**:
1. Make sure `http://localhost:3000` is in authorized origins
2. Use the exact port number (e.g., 3000, 8080, etc.)
3. Try `http://127.0.0.1:3000` instead
4. Ensure OAuth client type is "Web application" not "Desktop"

## Production Checklist

Before going live with Google OAuth:

- [ ] Remove test user restrictions (make app public)
- [ ] Add production domain to authorized origins
- [ ] Remove localhost from authorized origins (security)
- [ ] Test from production domain
- [ ] Verify SSL certificate is valid (HTTPS)
- [ ] Update privacy policy with Google sign-in disclosure
- [ ] Add "Terms of Service" link
- [ ] Consider adding Google branding (optional)

## Security Best Practices

### Current Setup (Development)
- ✅ Client-side token validation
- ✅ User data stored securely
- ⚠️ Client ID visible in source code (this is normal)

### Recommended for Production
Add server-side token verification to `/cloudflare-worker/worker.js`:

```javascript
// In handleGoogleAuth function
async function handleGoogleAuth(request, env) {
  const { idToken, email, name, photoURL } = await request.json();

  // Verify token with Google
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );
  const tokenInfo = await response.json();

  // Verify the token is valid
  if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
    return jsonResponse({ error: 'Invalid token' }, 401);
  }

  if (tokenInfo.email !== email) {
    return jsonResponse({ error: 'Email mismatch' }, 401);
  }

  // Continue with existing code...
}
```

Then add Client ID to Cloudflare Worker:
```bash
wrangler secret put GOOGLE_CLIENT_ID
# Paste your Client ID when prompted
```

## Cost

**Google OAuth is 100% FREE** for authentication use cases like this!

Google only charges for:
- Google Cloud Platform services (compute, storage, etc.)
- High-volume API calls to other Google services

Standard OAuth for sign-in is free with no limits.

## Privacy & Compliance

### What data does Google OAuth collect?

When users sign in with Google, your app receives:
- Email address
- Name
- Profile photo URL
- Google user ID

You do NOT receive:
- Password
- Access to Gmail
- Access to Google Drive
- Any other Google services

### User consent

Users see this when signing in:
```
EngrAssist wants to:
- See your email address
- See your personal info
```

They can always revoke access at: https://myaccount.google.com/permissions

### Your privacy obligations

Update your Privacy Policy to include:
- "We offer Google Sign-In as a login option"
- "When you use Google Sign-In, we receive your name, email, and profile photo"
- "We do not access any other Google services"
- "You can revoke access anytime in your Google Account settings"

## Support

### Google Cloud Console
- [Console](https://console.cloud.google.com/)
- [Documentation](https://developers.google.com/identity/gsi/web)
- [Support](https://support.google.com/)

### EngrAssist
- Check `AUTHENTICATION_GUIDE.md` for full auth documentation
- Review `scripts.js` for implementation details
- Check browser console for JavaScript errors

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google One Tap](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Best Practices for OAuth](https://developers.google.com/identity/protocols/oauth2/web-server#security-considerations)

---

**Setup Time**: ~10 minutes
**Cost**: Free
**Difficulty**: Easy
**Status**: Ready to implement

Happy authenticating! 🎉
