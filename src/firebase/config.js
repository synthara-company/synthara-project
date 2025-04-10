// src/firebase/config.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Log Firebase configuration for debugging (without sensitive data)
console.log('Firebase config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Configure Storage
const storage = firebase.storage();

// Get auth
const auth = firebase.auth();

// Export Firebase services
export { db, storage, auth };

// Helper function to check Firebase connection
export const checkFirebaseConnection = async () => {
  try {
    // Try to access Firestore as a simple connectivity test
    const timestamp = Date.now().toString();
    console.log(`Testing Firebase connection at ${timestamp}...`);
    return {
      success: true,
      timestamp
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
