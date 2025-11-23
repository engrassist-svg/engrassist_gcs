# Cloudflare Workers + D1 Setup Guide

Complete guide to setting up FREE authentication and cloud storage for EngrAssist using Cloudflare Workers and D1 database.

## Why Cloudflare?

✅ **100% FREE** - No credit card required
✅ **Generous limits** - 100,000 requests/day, 5GB storage
✅ **Fast** - Edge computing for low latency
✅ **Scalable** - Automatically scales worldwide
✅ **Simple** - No complex backend setup

---

## Prerequisites

- Cloudflare account (free): https://dash.cloudflare.com/sign-up
- Node.js installed (v16 or later): https://nodejs.org/

---

## Step 1: Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing Workers.

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

---

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

---

## Step 3: Create D1 Database

Navigate to the cloudflare-worker directory:
```bash
cd cloudflare-worker
```

Create a new D1 database:
```bash
wrangler d1 create engrassist-db
```

**IMPORTANT:** Copy the output! It will show:
```
✅ Successfully created DB 'engrassist-db'

[[d1_databases]]
binding = "DB"
database_name = "engrassist-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and update it in `wrangler.toml`

---

## Step 4: Update wrangler.toml

Open `wrangler.toml` and replace `YOUR_DATABASE_ID` with the database ID from Step 3:

```toml
[[d1_databases]]
binding = "DB"
database_name = "engrassist-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Replace this!
```

---

## Step 5: Initialize Database Schema

Run the SQL schema to create tables:

```bash
wrangler d1 execute engrassist-db --file=schema.sql
```

You should see:
```
✅ Executed schema.sql successfully
```

Verify tables were created:
```bash
wrangler d1 execute engrassist-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see: `users` and `projects` tables.

---

## Step 6: Set JWT Secret

Create a secure random secret for JWT tokens:

```bash
wrangler secret put JWT_SECRET
```

When prompted, enter a secure random string (e.g., use a password generator for a 32+ character string).

Example:
```
Enter a secret value: your-super-secret-random-string-here-make-it-long
```

---

## Step 7: Test Worker Locally

Start the development server:

```bash
npm install  # First time only
wrangler dev
```

The worker will start on `http://localhost:8787`

**Test the API:**

1. Open another terminal and test signup:
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword","name":"Test User"}'
```

You should get a response with a token!

2. Test signin:
```bash
curl -X POST http://localhost:8787/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

---

## Step 8: Deploy Worker

When ready to deploy to production:

```bash
wrangler deploy
```

You'll get a URL like: `https://engrassist-api.your-subdomain.workers.dev`

**Copy this URL** - you'll need it for the frontend!

---

## Step 9: Update Frontend Configuration

1. Open `scripts.js` in your main project
2. Find the `CLOUDFLARE_API_URL` constant
3. Update it with your Worker URL:

```javascript
const CLOUDFLARE_API_URL = 'https://engrassist-api.your-subdomain.workers.dev';
```

For local development, use:
```javascript
const CLOUDFLARE_API_URL = 'http://localhost:8787';
```

---

## Step 10: Enable Google OAuth (Optional)

For Google Sign-In, you need to set up OAuth credentials:

### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:8080` (for testing)
   - `https://yourdomain.com` (your production domain)
7. Add authorized redirect URIs:
   - `http://localhost:8080`
   - `https://yourdomain.com`
8. Click **Create**
9. **Copy the Client ID** (you'll need this in frontend)

### B. Update Frontend

In `scripts.js`, add your Google Client ID:

```javascript
const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
```

---

## API Endpoints

Your Worker provides these endpoints:

### Authentication

- **POST /api/auth/signup**
  - Body: `{ email, password, name }`
  - Returns: `{ success, user, token }`

- **POST /api/auth/signin**
  - Body: `{ email, password }`
  - Returns: `{ success, user, token }`

- **POST /api/auth/google**
  - Body: `{ idToken, email, name, photoURL }`
  - Returns: `{ success, user, token }`

### Projects

- **GET /api/projects**
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ projects: [...] }`

- **POST /api/projects**
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ ...projectData }`
  - Returns: `{ success, projectId }`

- **GET /api/projects/:id**
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ project: {...} }`

- **PUT /api/projects/:id**
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ ...projectData }`
  - Returns: `{ success }`

- **DELETE /api/projects/:id**
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success }`

---

## Free Tier Limits

Cloudflare Workers Free Tier:
- ✅ **100,000 requests per day**
- ✅ **10ms CPU time per request**
- ✅ **Unlimited scripts**

Cloudflare D1 Free Tier:
- ✅ **5 GB storage**
- ✅ **5 million rows read per day**
- ✅ **100,000 rows written per day**

This is MORE than enough for thousands of users!

---

## Monitoring

### View logs:
```bash
wrangler tail
```

### Check database:
```bash
wrangler d1 execute engrassist-db --command="SELECT COUNT(*) FROM users"
```

### List all users:
```bash
wrangler d1 execute engrassist-db --command="SELECT email, name, created_at FROM users"
```

### List all projects:
```bash
wrangler d1 execute engrassist-db --command="SELECT id, user_id, updated_at FROM projects"
```

---

## Troubleshooting

### Error: "Database not found"
- Make sure you updated `database_id` in `wrangler.toml`
- Verify database exists: `wrangler d1 list`

### Error: "Unauthorized"
- Check if JWT_SECRET is set: `wrangler secret list`
- Make sure you're sending the `Authorization` header with `Bearer <token>`

### Error: "CORS"
- CORS is enabled by default in the worker
- If still having issues, check if request includes credentials

### Worker not updating
- Try: `wrangler deploy --force`
- Clear browser cache

---

## Security Best Practices

1. **Use HTTPS** - Always use HTTPS in production
2. **Rotate JWT Secret** - Change it periodically
3. **Validate Input** - Worker validates all inputs
4. **Rate Limiting** - Consider adding rate limiting for production
5. **Environment Secrets** - Never commit secrets to Git

---

## Next Steps

After deployment:

1. **Custom Domain** (Optional)
   - Add a custom domain in Cloudflare Dashboard
   - Update routes in `wrangler.toml`

2. **Add Features**
   - Email verification
   - Password reset
   - Project sharing
   - Rate limiting

3. **Monitoring**
   - Set up Cloudflare Analytics
   - Monitor error rates
   - Track usage

---

## Cost Estimate

With Cloudflare Workers + D1:
- **0-10,000 users**: **$0/month** (FREE)
- **10,000-100,000 users**: **$0/month** (still FREE!)
- Beyond that: Only pay for extra requests (~$0.50 per million requests)

**Much cheaper than Firebase or any other service!**

---

## Support

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- D1 Database Docs: https://developers.cloudflare.com/d1/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Community Discord: https://discord.gg/cloudflaredev

---

**You're all set!** Your EngrAssist workflow hub now has a professional, scalable, and FREE backend! 🎉
