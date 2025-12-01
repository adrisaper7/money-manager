import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - works in both development and production
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXd5u9p1c8WFOLIo02iUuvNXhSA-xi0Bs",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "moneymanager-daddf.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "moneymanager-daddf",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "moneymanager-daddf.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "139565921928",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:139565921928:web:5414cbb7e33a96a4d2113d",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PX2RFP4WGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('✅ Firebase auth local persistence enabled (session restored from Firebase on reload)');
    })
    .catch((error) => {
        console.error('❌ Error setting auth persistence:', error);
    });

export const db = getFirestore(app);
