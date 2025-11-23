# Cloudflare Workers Integration for EngrAssist

This directory contains all the code needed to run EngrAssist with **FREE** Cloudflare Workers + D1 backend.

## 📁 Files in this Directory

- **`worker.js`** - Cloudflare Worker API (backend)
- **`schema.sql`** - D1 database schema
- **`wrangler.toml`** - Worker configuration
- **`package.json`** - NPM dependencies
- **`cloudflare-auth.js`** - Frontend authentication code (to replace Firebase)
- **`README.md`** - This file

## 🚀 Quick Start

Follow these steps to get your FREE backend running:

### 1. Setup Cloudflare Worker

See `CLOUDFLARE_SETUP.md` in the parent directory for complete setup instructions.

**Quick version:**
```bash
cd cloudflare-worker
npm install
wrangler login
wrangler d1 create engrassist-db
# Copy database_id and update wrangler.toml
wrangler d1 execute engrassist-db --file=schema.sql
wrangler secret put JWT_SECRET
wrangler deploy
```

### 2. Integrate with Frontend

You have two options:

#### Option A: Replace Firebase Code (Recommended)

1. **Remove Firebase from `workflow_hub.html`:**

Find and DELETE these lines:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

2. **Add Google Sign-In SDK (optional, for Google OAuth):**

Add this BEFORE the closing `</body>` tag:
```html
<!-- Google Sign-In SDK -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

3. **Copy cloudflare-auth.js content into scripts.js:**

Open `cloudflare-auth.js` and copy all the authentication functions.

In `scripts.js`, find the Firebase authentication section (starts around line 106) and **REPLACE** all Firebase code with the Cloudflare code from `cloudflare-auth.js`.

4. **Update the API URL:**

In the copied code, update `CLOUDFLARE_API_URL`:
```javascript
const CLOUDFLARE_API_URL = 'https://your-worker-url.workers.dev';
```

5. **Add Google Client ID (if using Google Sign-In):**

Get your Google OAuth Client ID from Google Cloud Console, then update:
```javascript
const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
```

#### Option B: Create Separate File (Cleaner)

1. Copy `cloudflare-auth.js` to your main directory

2. In `workflow_hub.html`, add before `scripts.js`:
```html
<script src="cloudflare-auth.js"></script>
<script src="scripts.js"></script>
```

3. In `scripts.js`, remove/comment out all Firebase-related code

### 3. Test Locally

```bash
# In cloudflare-worker directory
wrangler dev

# In another terminal, start your web server
cd ..
python3 -m http.server 8080
```

Open: http://localhost:8080/workflow_hub.html

### 4. Deploy

```bash
cd cloudflare-worker
wrangler deploy
```

Your API will be live at: `https://engrassist-api.your-subdomain.workers.dev`

Update `CLOUDFLARE_API_URL` in your frontend code to use the deployed URL.

## 🔐 Authentication Options

The system supports multiple sign-in methods:

### 1. Email/Password (Built-in)
- Click "Sign In" button
- Enter email and password
- Or create new account

### 2. Google Sign-In (Requires setup)
1. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add Client ID to frontend code
3. Add Google Sign-In SDK script
4. Users can sign in with Google account

## 📊 API Endpoints

Your deployed worker provides these endpoints:

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/google` - Google OAuth sign-in

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create/update project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 💰 Cost

**100% FREE** for typical usage:
- 100,000 API requests/day
- 5GB database storage
- 5M database reads/day
- 100K database writes/day

Perfect for thousands of users!

## 🧪 Testing

### Test Authentication:
```bash
# Sign up
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:8787/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Projects:
```bash
# Save the token from signin response
TOKEN="your-jwt-token-here"

# Create project
curl -X POST http://localhost:8787/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"projectName":"Test Project","projectType":"commercial"}'

# Get all projects
curl http://localhost:8787/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### "Unauthorized" error
- Check if token is expired (30 day expiry)
- Make sure Authorization header is set correctly

### "Database not found"
- Update `database_id` in `wrangler.toml`
- Run `wrangler d1 list` to verify database exists

### CORS errors
- CORS is enabled by default
- Check if your domain matches authorized domains

### Worker not updating
- Run `wrangler deploy --force`
- Clear browser cache

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🎉 You're All Set!

Your EngrAssist now has:
✅ FREE authentication
✅ FREE cloud storage
✅ Multi-device sync
✅ Google Sign-In support
✅ Professional backend
✅ Scalable to thousands of users

**All for $0/month!**
