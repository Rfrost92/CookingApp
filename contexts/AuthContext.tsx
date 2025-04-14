// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as RNIap from "react-native-iap";

// Define shape for context
export const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    subscriptionType: "guest",
    isPremium: false,
    setSubscriptionType: (type: string) => {},
    refreshSubscriptionType: async () => {},
});

const itemSkus = ["com.rFrostSmartChef.premium.monthly"];

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

            // Check with IAP if the user still has a valid subscription
            const purchases = await RNIap.getAvailablePurchases();
            const hasPremium = purchases.some(purchase =>
                itemSkus.includes(purchase.productId)
            );

            if (hasPremium) {
                newType = "premium";
            }

            // If subscriptionType in Firestore doesn't match, update it
            if (userData.subscriptionType !== newType) {
                if (userData.testUser && userData.testUser === true) {
                    console.log('Test user keeps subscription')
                    return
                }
                await updateDoc(userRef, { subscriptionType: newType });
            }

            setSubscriptionType(newType);
            console.log("✅ SubscriptionType validated & set:", newType);
        } catch (error) {
            console.error("❌ Failed to validate subscriptionType:", error);
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
