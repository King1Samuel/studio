
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

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Provide a more helpful error message for the common setup issue.
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please follow the setup instructions in src/lib/firebase-admin.ts.");
    }
  }
}

export const adminAuth = admin.auth();
