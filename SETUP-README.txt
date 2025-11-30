====================================================
ENGRASSIST CLOUDFLARE AUTHENTICATION SETUP
====================================================

📦 WHAT'S IN THIS ZIP FILE:
------------------------------------------------
✓ cloudflare-worker/ - Backend API files
✓ workflow_hub.html - Your main page
✓ scripts.js - Frontend code with Cloudflare auth
✓ styles.css - Styling
✓ header.html - Header with login UI


📋 QUICK START GUIDE (Windows):
------------------------------------------------

STEP 1: Install Node.js
   1. Go to: https://nodejs.org/
   2. Download the LTS version (the green button)
   3. Run the installer (just click Next through everything)
   4. Restart your computer

STEP 2: Install Wrangler
   1. Press Windows Key + R
   2. Type: cmd
   3. Press Enter (black window opens)
   4. Type: npm install -g wrangler
   5. Press Enter and wait for it to finish

STEP 3: Get Your Cloudflare API Token
   1. Go to: https://dash.cloudflare.com/profile/api-tokens
   2. Click "Create Token"
   3. Click "Use template" next to "Edit Cloudflare Workers"
   4. Click "Continue to summary"
   5. Click "Create Token"
   6. Copy the token (SAVE IT - you only see it once!)
   7. Save it in a text file called cloudflare-token.txt

STEP 4: Run the Setup Script
   1. Open the "cloudflare-worker" folder
   2. Double-click "setup-cloudflare.bat"
   3. When it asks for your token, paste it
   4. Press Enter
   5. Wait for "Setup Complete!"

STEP 5: Test Your Setup
   1. Open Command Prompt in the cloudflare-worker folder
   2. Type: wrangler dev
   3. Your API will start at: http://localhost:8787

STEP 6: Deploy to Production
   1. Type: wrangler deploy
   2. You'll get a URL like: https://engrassist-api.yourname.workers.dev


🔧 UPDATING YOUR WEBSITE FILES:
------------------------------------------------

After deployment, you need to update scripts.js:

1. Open scripts.js in Notepad
2. Find the line: const CLOUDFLARE_API_URL = 'http://localhost:8787';
3. Change it to your deployed URL: https://engrassist-api.yourname.workers.dev
4. Save the file
5. Upload workflow_hub.html, scripts.js, styles.css, and header.html to your website


❓ TROUBLESHOOTING:
------------------------------------------------

"wrangler: command not found"
   → Make sure you installed Node.js and restarted your computer
   → Run: npm install -g wrangler

"Authentication failed"
   → Check that you copied the entire API token
   → Get a new token from Cloudflare

"Database creation failed"
   → Make sure you're in the cloudflare-worker folder
   → Try running the setup script again


📧 NEED MORE HELP?
------------------------------------------------

If you get stuck, take a screenshot of the error and ask Claude for help!


====================================================
CREATED BY CLAUDE - YOUR AI CODING ASSISTANT
====================================================
