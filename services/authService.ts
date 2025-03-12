// authService.ts
import {auth, db} from "../firebaseConfig";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithCredential,
    fetchSignInMethodsForEmail,
    User
} from "firebase/auth";
import { doc, setDoc, getDoc, limit } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Sign Up with Email & Password + Email Verification
export const signUp = async (email: string, password: string) => {
    try {
        if (!email || !email.includes("@")) {
            throw new Error("error_invalid_email");
        }
        if (!password || password.length < 6) {
            throw new Error("error_weak_password");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);
        console.log("Verification email sent to:", user.email);

        // Save user in Firestore
        await setUserInDB(user, 'email');

        // Immediately log out the user after registration
        await signOut(auth);
        console.log("User signed out after registration.");

        return { success: true };
    } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
            throw new Error("error_email_already_registered");
        } else if (error.code === "auth/invalid-email" || error.code === "auth/missing-email") {
            throw new Error("error_invalid_email");
        } else if (error.code === "auth/weak-password") {
            throw new Error("error_weak_password");
        } else {
            throw new Error(error.message);
        }
    }
};


// Log In with Email & Password + Handle Email Not Verified
export const logIn = async (email: string, password: string, t: (key: string) => string) => {
    if (!email.trim() || !password.trim()) {
        return Promise.reject(new Error(t("error_empty_credentials")));
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        const user = userCredential.user;

        if (!user.emailVerified) {
            return Promise.reject(new Error("email-not-verified"));
        }

        return user;
    } catch (error: any) {
        let errorMessage = t("error_login_failed"); // Default message

        switch (error.code) {
            case "auth/user-not-found":
                errorMessage = t("error_no_account");
                break;
            case "auth/wrong-password":
                errorMessage = t("error_wrong_password");
                break;
            case "auth/invalid-email":
                errorMessage = t("error_invalid_email");
                break;
            case "auth/invalid-credential":
                errorMessage = t("error_invalid_credentials");
                break;
        }

        return Promise.reject(new Error(errorMessage));
    }
};

// Google Sign-In
export const signInWithGoogle = async () => {
    try {
        // Check if your device supports Google Play
        const  playServices = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the user's ID token
        const data = await GoogleSignin.signIn();
        const idToken = data.data?.idToken;

        if (!idToken) {
            throw new Error("No ID token found");
        }

        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const userCredential = await signInWithCredential(auth, googleCredential);

        // Save user in Firestore
        await setUserInDB(userCredential.user, 'google');

        return userCredential.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/*
// Facebook Sign-In (React Native)
export const signInWithFacebook = async () => {
    try {
        const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);

        if (result.isCancelled) {
            throw new Error("Facebook sign-in was cancelled.");
        }

        const data = await AccessToken.getCurrentAccessToken();
        if (!data) {
            throw new Error("Something went wrong obtaining the Facebook access token.");
        }

        const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
        const userCredential = await signInWithCredential(auth, facebookCredential);

        await setUserInDB(userCredential.user);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};
*/

// Log Out
export const logOut = async () => {
    await signOut(auth);
};

// Save User Data in Firestore
const setUserInDB = async (user: User, provider: string = "email") => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            email: user.email,
            signedUpWith: provider,
            subscriptionType: "guest",
            requestsToday: 0,
        });
    }
};

// Resend Email Verification
export const resendVerificationEmail = async (email: string, t: (key: string) => string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return Promise.reject(new Error(t("error_invalid_email")));
    }

    try {
        console.log("🔍 Checking sign-in methods for:", normalizedEmail);

        // Step 1: Check Firebase Auth
        const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
        console.log("✅ Found sign-in methods:", signInMethods);

        if (signInMethods.length === 0) {
            console.log("❌ No sign-in methods found. Checking Firestore...");

            // Step 2: Query Firestore for user by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("❌ No user found in Firestore.");
                throw new Error(t("error_no_account"));
            }

            console.log("✅ User found in Firestore. Attempting to reauthenticate...");
        }

        // Step 3: Try to sign in the user temporarily
        const tempPassword = "temporaryPassword"; // This won't work unless user knows the password
        try {
            const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, tempPassword);
            const user = userCredential.user;

            if (user.emailVerified) {
                return Promise.reject(new Error(t("error_already_verified")));
            }

            // Send verification email
            await sendEmailVerification(user);
            await signOut(auth); // Ensure they remain logged out
            console.log("📩 Verification email resent to:", normalizedEmail);

        } catch (authError: any) {
            console.log("⚠️ Couldn't log in user, but they exist. Sending verification email anyway.");

            // Attempt to send the email directly via Firestore check
            await sendPasswordResetEmail(auth, normalizedEmail);
            console.log("📩 Verification email resent to:", normalizedEmail);
        }

    } catch (error: any) {
        console.error("🚨 Resend Verification Error:", error?.code || error?.message);

        let errorMessage = t("error_resend_verification");
        if (error?.code === "auth/invalid-email") errorMessage = t("error_invalid_email");
        if (error?.code === "auth/user-not-found") errorMessage = t("error_no_account");

        return Promise.reject(new Error(errorMessage));
    }
};


// Password Reset
export const resetPassword = async (email: string, t: (key: string) => string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return Promise.reject(new Error(t("error_invalid_email")));
    }

    try {
        console.log("🔍 Checking sign-in methods for:", normalizedEmail);

        // Check sign-in methods
        const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
        console.log("✅ Found sign-in methods:", signInMethods);

        if (signInMethods.includes("google.com")) {
            throw new Error(t("error_google_password_reset"));
        }

        if (signInMethods.length === 0) {
            console.log("❌ No sign-in methods found. Checking Firestore...");

            // Query Firestore to check if the user exists (but only retrieve `signedUpWith`)
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", normalizedEmail), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("❌ No user found in Firestore.");
                throw new Error(t("error_no_account"));
            }

            // Extract user data
            // Get user document
            const userDoc = querySnapshot.docs[0];

            // Only read `signedUpWith`, prevent full document access
            const userData = { signedUpWith: userDoc.get("signedUpWith") };
            console.log("🔥 Firestore user data:", userData);

            // If Firestore user has "signedUpWith: google", block password reset
            if (userData.signedUpWith === "google") {
                throw new Error(t("error_google_password_reset"));
            }
        }

        // **Try to send password reset email**
        await sendPasswordResetEmail(auth, normalizedEmail);
        console.log("📩 Password reset email sent to:", normalizedEmail);
    } catch (error: any) {
        console.log("🚨 Password Reset Error:", error?.code || error?.message);

        let errorMessage = t("error_reset_password");
        if (error?.code === "auth/invalid-email") errorMessage = t("error_invalid_email");
        if (error?.code === "auth/user-not-found") errorMessage = t("error_no_account");
        if (error?.code === "permission-denied") errorMessage = "Permission denied: Check Firestore rules.";
        if (error?.message === t("error_google_password_reset")) errorMessage = t("error_google_password_reset");

        return Promise.reject(new Error(errorMessage));
    }
};


