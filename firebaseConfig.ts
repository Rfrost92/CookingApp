import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, setPersistence  } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {firebaseApiKey} from "./data/secrets";

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "cooking-app-3ff5f.firebaseapp.com",
    projectId: "cooking-app-3ff5f",
    storageBucket: "cooking-app-3ff5f.appspot.com",
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

// Initialize Firestore
export const db: Firestore = getFirestore(app);
