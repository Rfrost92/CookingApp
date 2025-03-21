// AuthContext.tsx
import React, {createContext, useState, useEffect, useContext} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [subscriptionType, setSubscriptionType] = useState("guest");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Check if the user has verified their email
                if (!currentUser.emailVerified) {
                    console.log("User email not verified. Logging out.");
                    await signOut(auth);
                    setUser(null);
                    setIsLoggedIn(false);
                } else {
                    setUser(currentUser);
                    setIsLoggedIn(true);
                    const userRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        setSubscriptionType(userDoc.data().subscriptionType || "guest");
                    }
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
                setSubscriptionType("guest");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, subscriptionType, setSubscriptionType }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
