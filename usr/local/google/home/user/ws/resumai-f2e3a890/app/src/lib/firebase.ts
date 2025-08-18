
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBFaHJD1K0YkRLOhNvZhlK9h8pc42oFWz8",
  authDomain: "resumai-mcxdt.firebaseapp.com",
  projectId: "resumai-mcxdt",
  storageBucket: "resumai-mcxdt.firebasestorage.app",
  messagingSenderId: "656371917358",
  appId: "1:656371917358:web:90905454065e42837875bf",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
