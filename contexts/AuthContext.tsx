// AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth State Changed:", currentUser);
            setUser(currentUser);
            setIsLoggedIn(!!currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
