
import admin from 'firebase-admin';

// This file is for server-side Firebase operations.

// IMPORTANT: To make this work, you must:
// 1. Go to your Firebase Project Settings -> Service Accounts.
// 2. Click "Generate new private key".
// 3. A JSON file will be downloaded.
// 4. Copy the contents of that JSON file.
// 5. Create a new environment variable in your .env file called `FIREBASE_SERVICE_ACCOUNT_KEY`
//    and paste the entire JSON content as its value.
//    Example: FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'

let adminAuth: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please follow the setup instructions in src/lib/firebase-admin.ts.");
    }
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminAuth = admin.auth();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // To prevent the app from crashing when the admin SDK is not configured,
    // we'll use a dummy object for adminAuth. Any attempts to use it will fail,
    // but the app itself won't crash on startup.
    adminAuth = {} as admin.auth.Auth;
  }
} else {
    adminAuth = admin.auth();
}


export { adminAuth };
