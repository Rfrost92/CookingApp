// authService.ts
import {auth, db} from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";

export const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        subscriptionType: "guest", // Default subscription
        requestsToday: 0, // Reset daily requests
    });

    return user;
};

export const logIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(error.message);
    }
};
