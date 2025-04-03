// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// Define shape for context
export const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    subscriptionType: "guest",
    isPremium: false,
    setSubscriptionType: (type: string) => {},
    refreshSubscriptionType: async () => {},
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
                    await fetchAndSetSubscription(currentUser.uid);
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
                setSubscriptionType("guest");
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchAndSetSubscription = async (uid: string) => {
        try {
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const type = userDoc.data().subscriptionType || "guest";
                setSubscriptionType(type);
                console.log("✅ SubscriptionType set:", type);
            }
        } catch (error) {
            console.error("❌ Failed to fetch subscriptionType:", error);
        }
    };

    const refreshSubscriptionType = async () => {
        if (!user?.uid) return;
        await fetchAndSetSubscription(user.uid);
    };

    const isPremium = subscriptionType === "premium";

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                subscriptionType,
                isPremium,
                setSubscriptionType,
                refreshSubscriptionType,
            }}
        >
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
