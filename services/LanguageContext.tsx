// LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LanguageContextProps = {
    language: string;
    setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<string>("en"); // Default to English

    useEffect(() => {
        // Load the language from AsyncStorage when the app starts
        const loadLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem("appLanguage");
                if (storedLanguage) {
                    setLanguageState(storedLanguage);
                }
            } catch (error) {
                console.error("Error loading language from AsyncStorage:", error);
            }
        };

        loadLanguage();
    }, []);

    const setLanguage = async (lang: string) => {
        try {
            await AsyncStorage.setItem("appLanguage", lang);
            setLanguageState(lang);
        } catch (error) {
            console.error("Error saving language to AsyncStorage:", error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
