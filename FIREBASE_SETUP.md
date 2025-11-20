# Firebase Setup Instructions for EngrAssist

This document provides step-by-step instructions for setting up Firebase authentication and Firestore database for the EngrAssist workflow hub.

## Prerequisites

- Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `engrassist` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `EngrAssist Web App`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later
6. Click "Continue to console"

## Step 3: Enable Authentication

1. In the Firebase Console, navigate to **Build** > **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Enable **Google** as a sign-in provider:
   - Click on "Google"
   - Toggle the "Enable" switch
   - Enter a support email (your email)
   - Click "Save"

### Optional: Add Additional Auth Providers

You can also enable these providers:

- **Email/Password**: For traditional email/password login
- **Microsoft**: Good for enterprise users
- **GitHub**: Good for technical users

## Step 4: Set Up Firestore Database

1. Navigate to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** or **Test mode**:
   - **Test mode**: Good for development (30 days open access)
   - **Production mode**: Recommended for live site
4. Select a Cloud Firestore location (choose closest to your users)
5. Click "Enable"

## Step 5: Configure Firestore Security Rules

After creating the database, set up security rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects collection - users can only access their own projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

### Security Rules Explanation:
- Users must be authenticated to access projects
- Users can only read/write projects where `userId` matches their auth UID
- This ensures users can only see and modify their own projects

## Step 6: Create Firestore Indexes (Optional but Recommended)

1. Navigate to **Firestore Database** > **Indexes** tab
2. Click "Create index"
3. Create an index for efficient queries:
   - **Collection ID**: `projects`
   - **Fields**:
     - Field: `userId`, Order: Ascending
     - Field: `updatedAt`, Order: Descending
   - **Query scope**: Collection
4. Click "Create"

## Step 7: Update Firebase Configuration in Your Code

1. Open `scripts.js` in your code editor
2. Find the Firebase configuration section (around line 112):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace the placeholder values with your actual Firebase configuration from Step 2
4. Save the file

### Example Configuration:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB1234567890abcdefghijklmnopqrstuv",
    authDomain: "engrassist-12345.firebaseapp.com",
    projectId: "engrassist-12345",
    storageBucket: "engrassist-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 8: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domain(s):
   - `localhost` (for local development)
   - Your production domain (e.g., `engrassist.com`)
   - GitHub Pages domain if using (e.g., `username.github.io`)

## Step 9: Test the Implementation

1. Open `workflow_hub.html` in your browser
2. You should see a "Sign In" button in the top right corner
3. Click "Sign In" and authenticate with Google
4. After signing in, you should see your profile photo and name
5. Create a project and click "Save Project"
6. Check Firestore Database in Firebase Console to see your saved project
7. Click "My Projects" to view all saved projects

## Features Implemented

### Authentication
- **Google Sign-In**: One-click authentication with Google
- **User Profile**: Shows user photo and name in header
- **Session Persistence**: User stays logged in across page reloads
- **Responsive**: Works on desktop and mobile

### Cloud Storage
- **Auto-save**: Projects automatically save to cloud when logged in
- **Fallback**: Uses localStorage when not logged in
- **My Projects Modal**: View, load, and delete all saved projects
- **Real-time Sync**: Projects sync across devices

### Security
- **User-specific data**: Each user can only access their own projects
- **Secure authentication**: Google OAuth 2.0
- **Protected data**: Firestore security rules prevent unauthorized access

## Cost Estimates

Firebase offers a generous free tier:

### Free Tier (Spark Plan)
- **Authentication**: Unlimited users
- **Firestore Reads**: 50,000/day
- **Firestore Writes**: 20,000/day
- **Firestore Storage**: 1 GB
- **Data Transfer**: 10 GB/month

### Estimated Usage for Small-Medium Site
- **~100 active users**: FREE
- **~1,000 active users**: ~$0-5/month
- **~10,000 active users**: ~$25-50/month

Most small to medium sites will stay within the free tier.

## Troubleshooting

### "Authentication not initialized" Error
- Make sure you've updated the Firebase configuration in `scripts.js`
- Check browser console for specific errors
- Verify Firebase SDK scripts are loading correctly

### Sign-in popup blocked
- Allow popups for your domain in browser settings
- Or use redirect method instead of popup

### Projects not saving
- Check Firestore security rules are correctly configured
- Verify user is signed in (check `currentUser` in console)
- Check browser console for errors

### Domain not authorized
- Add your domain to Authorized domains in Firebase Console
- Include both `http://` and `https://` versions if needed

## Alternative Authentication Methods

If you want to add more sign-in options, edit `scripts.js` and add:

### Email/Password Sign-In
```javascript
async function signInWithEmail(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Microsoft Sign-In
```javascript
async function signInWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Support

For issues or questions:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag questions with `firebase` and `firestore`

## Next Steps

### Optional Enhancements
1. **Project Sharing**: Allow users to share projects with teammates
2. **Export to PDF**: Generate PDF reports of projects
3. **Offline Support**: Enhanced offline capabilities with service workers
4. **Version History**: Track changes to projects over time
5. **Team Collaboration**: Multi-user project editing

---

**Setup Complete!** Your EngrAssist workflow hub now has secure user authentication and cloud-based project storage.
