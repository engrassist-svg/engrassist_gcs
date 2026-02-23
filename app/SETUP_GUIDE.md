# EngrAssist Mobile App — Setup & Deployment Guide

## What This Is

This is a **React Native (Expo)** mobile app for EngrAssist.com.
One codebase produces both an iOS and Android app.
You do NOT need a Mac — Expo's cloud build service handles iOS compilation.

---

## Project Structure

```
engrassist-app/
├── app/                        ← Screens & navigation (Expo Router)
│   ├── _layout.tsx             ← Root navigation setup
│   ├── (tabs)/                 ← Bottom tab screens
│   │   ├── _layout.tsx         ← Tab bar configuration
│   │   ├── index.tsx           ← Home screen
│   │   └── tools.tsx           ← Tools listing screen
│   └── tools/                  ← Individual tool screens
│       └── duct-sizing.tsx     ← Duct sizing calculator
├── constants/
│   ├── Colors.ts               ← Brand colors & theme
│   └── Tools.ts                ← Master tool list & data
├── utils/
│   └── calculations.ts         ← ASHRAE engineering formulas
├── assets/images/              ← App icons & splash screen
├── app.json                    ← Expo configuration
├── eas.json                    ← Cloud build configuration
├── package.json                ← Dependencies
└── tsconfig.json               ← TypeScript config
```

---

## Step-by-Step Setup (Windows/Linux)

### Step 1: Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS** version (green button)
3. Run the installer, accept all defaults
4. Verify it installed by opening a terminal/command prompt and typing:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### Step 2: Install Bun (faster package manager)

Open your terminal and run:
```bash
# Windows (PowerShell):
powershell -c "irm bun.sh/install.ps1 | iex"

# Linux/Mac:
curl -fsSL https://bun.sh/install | bash
```

Verify:
```bash
bun --version
```

### Step 3: Install Expo CLI and EAS CLI

```bash
npm install -g expo-cli @expo/eas-cli
```

### Step 4: Create an Expo Account

1. Go to https://expo.dev
2. Click "Sign Up" and create a free account
3. In your terminal, log in:
   ```bash
   eas login
   ```
   Enter the email and password you just created.

### Step 5: Set Up the Project

1. Copy the `engrassist-app` folder to your computer
2. Open a terminal in that folder
3. Install dependencies:
   ```bash
   bun install
   ```
   (If bun has issues, use `npm install` instead)

### Step 6: Test on Your Phone

1. Install the **Expo Go** app on your phone:
   - iPhone: Search "Expo Go" in the App Store
   - Android: Search "Expo Go" in Google Play Store

2. Start the development server:
   ```bash
   bun start
   ```
   (or `npx expo start`)

3. A QR code will appear in your terminal
   - **Android**: Open Expo Go app → scan the QR code
   - **iPhone**: Open your Camera app → scan the QR code → tap the Expo banner

4. The app should load on your phone! Make changes to the code and they'll
   appear instantly (hot reload).

### Step 7: Test in Web Browser (optional, quick preview)

```bash
bun run start-web
```

Opens a browser preview at http://localhost:8081

---

## Building for App Stores

### Prerequisites

- **Apple Developer Account** ($99/year): https://developer.apple.com/programs/
  Required to publish on the App Store.
  
- **Google Play Developer Account** ($25 one-time): https://play.google.com/console/
  Required to publish on Google Play.

- **Expo Account** (free for limited builds): https://expo.dev

### Build for iOS (No Mac Required!)

```bash
# First time only — configure the project:
eas build:configure

# Create a production build:
eas build --platform ios --profile production
```

EAS will:
1. Upload your code to Expo's cloud servers
2. Compile it on Apple's infrastructure
3. Generate an `.ipa` file you can submit to the App Store

### Build for Android

```bash
eas build --platform android --profile production
```

This generates an `.aab` (Android App Bundle) file for Google Play.

### Submit to App Stores

```bash
# iOS — submits to App Store Connect:
eas submit --platform ios

# Android — submits to Google Play Console:
eas submit --platform android
```

---

## Adding New Tools

To add a new calculator (e.g., Wire Sizing):

### 1. Update the tool status in `constants/Tools.ts`:

Change the tool's status from `'coming_soon'` to `'available'` and add a route:

```typescript
{
  id: 'wire-sizing',
  name: 'Wire Sizing (NEC)',
  status: 'available',         // ← Changed from 'coming_soon'
  route: '/tools/wire-sizing', // ← Added route
  // ... rest stays the same
},
```

### 2. Create the screen file:

Create `app/tools/wire-sizing.tsx` (follow the duct-sizing.tsx pattern)

### 3. Add calculation functions:

Add the engineering formulas to `utils/calculations.ts`

That's it — Expo Router automatically picks up the new file as a route.

---

## App Store Preparation Checklist

Before submitting, you'll need:

### Both Stores:
- [ ] App icon (1024×1024 PNG, no transparency)
- [ ] Screenshots for each device size
- [ ] App description (short + long)
- [ ] Privacy policy URL (host on engrassist.com/privacy.html)
- [ ] Keywords / categories

### Apple App Store:
- [ ] Apple Developer account enrolled
- [ ] App Store Connect listing created
- [ ] Review guidelines compliance check
- [ ] Age rating questionnaire completed

### Google Play Store:
- [ ] Google Play Console account set up
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled out
- [ ] Feature graphic (1024×500)

---

## Key Configuration Files to Update

### `app.json` — Update these before building:
- `expo.ios.bundleIdentifier`: `com.engrassist.tools` ✓
- `expo.android.package`: `com.engrassist.tools` ✓
- `expo.extra.eas.projectId`: Get this from `eas init`

### `eas.json` — Update before submitting:
- `submit.production.ios.appleId`: Your Apple ID email
- `submit.production.ios.ascAppId`: From App Store Connect
- `submit.production.ios.appleTeamId`: From developer.apple.com
- `submit.production.android.serviceAccountKeyPath`: Google service account JSON

---

## Helpful Commands Reference

| Command | What it does |
|---------|-------------|
| `bun start` | Start dev server (scan QR with phone) |
| `bun run start-web` | Preview in web browser |
| `eas build --platform ios` | Build iOS app in the cloud |
| `eas build --platform android` | Build Android app in the cloud |
| `eas submit --platform ios` | Submit to App Store |
| `eas submit --platform android` | Submit to Google Play |
| `eas build:list` | Check status of builds |
| `eas update` | Push over-the-air update (no rebuild!) |

---

## Over-the-Air Updates

One of Expo's best features: after your app is in the stores, you can push
code updates **without rebuilding or resubmitting**:

```bash
eas update --branch production --message "Added wire sizing calculator"
```

Users get the update next time they open the app. This means you can add
new tools and fix bugs instantly without waiting for App Store review.
