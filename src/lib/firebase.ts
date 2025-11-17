import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error('Firebase configuration missing:', {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: !!firebaseConfig.projectId
    });
    throw new Error('Missing Firebase configuration. Please check your .env.local file.');
}

console.log('Firebase configuration loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized successfully');

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log('Firebase Auth initialized');

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log('Firebase Firestore initialized');

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);
console.log('Firebase Storage initialized');

export default app;