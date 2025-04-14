// firebaseConfig.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence  } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: process.env.firebaseApiKey,
    authDomain: "cooking-app-3ff5f.firebaseapp.com",
    projectId: "cooking-app-3ff5f",
    storageBucket: "cooking-app-3ff5f.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

// Initialize Firebase app
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Initialize Firebase Auth with React Native persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
GoogleSignin.configure({
    webClientId: process.env.googleWebClientId,
});
// Initialize Firestore
export const db: Firestore = getFirestore(app);
