'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: any;

try {
  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  ) {
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase configuration is incomplete. Ensure all environment variables are set. Firebase services will be unavailable.");
    // Don't initialize Firebase if config is incomplete
  }
} catch (e: any) {
  console.error("Firebase initialization error", e.message);
}

let auth: Auth | null = null;

if (app) {
  try {
    auth = getAuth(app);
  } catch (e: any) {
    console.error("Error getting Firebase Auth instance:", e.message);
  }
} else {
  console.warn("Firebase Auth not initialized due to missing Firebase configuration.");
}

export { auth };
