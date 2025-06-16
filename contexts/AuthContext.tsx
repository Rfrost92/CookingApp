// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Purchases from "react-native-purchases";

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
            if (!userDoc.exists()) return;

            const userData = userDoc.data();
            let newType = "guest";

            const { entitlements } = await Purchases.getCustomerInfo();
            const isActive = entitlements.active["smartchef Plus"];

            if (isActive) {
                const now = Date.now();
                const expiresAt = isActive.expirationDate ? new Date(isActive.expirationDate).getTime() : null;

                const isExpired = expiresAt !== null && expiresAt < now;
                const isSandbox = isActive.isSandbox;

                console.log("📜 Entitlement info:", {
                    isSandbox,
                    willRenew: isActive.willRenew,
                    expirationDate: isActive.expirationDate,
                    expired: isExpired,
                });

                if (!(isSandbox && isExpired)) {
                    newType = "premium";
                } else {
                    console.log("🧪 Sandbox subscription manually marked as expired");
                }
            }

            if (userData.subscriptionType !== newType) {
                if (userData.testUser === true) return;
                await updateDoc(userRef, { subscriptionType: newType });
            }

            setSubscriptionType(newType);
            console.log("✅ SubscriptionType set via RevenueCat:", newType);
        } catch (error) {
            console.error("❌ Failed to validate subscriptionType via RevenueCat:", error);
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
