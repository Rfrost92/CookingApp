// AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
