import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {firebaseApiKey} from "./secrets";

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "cooking-app-3ff5f.firebaseapp.com",
    projectId: "cooking-app-3ff5f",
    storageBucket: "cooking-app-3ff5f.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
