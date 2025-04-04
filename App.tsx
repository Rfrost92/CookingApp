import React, { useEffect, useState } from "react";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./services/LanguageContext";
import { NavigationContainer } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as RNIap from "react-native-iap";
import * as Sentry from "@sentry/react-native";
import { captureConsoleIntegration } from "@sentry/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

global.Buffer = Buffer;

const itemSkus = { skus: ["com.rFrostSmartChef.premium.monthly"] };

Sentry.init({
    dsn: "https://fdcc23544f251ec13abbd4af5bec0e72@o4509089542569984.ingest.de.sentry.io/4509089612562512",
    integrations: [captureConsoleIntegration({ levels: ["warn", "error"] })],
});

export default Sentry.wrap(function App() {
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
    const [initialRouteName, setInitialRouteName] = useState<string | null>(null);

    useEffect(() => {
        const initIAP = async () => {
            try {
                const result = await RNIap.initConnection();
                console.log("✅ IAP Initialized:", result);

                const isAvailable = await RNIap.getSubscriptions(itemSkus);
                console.log("🔍 Available Subscriptions:", isAvailable);

                const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
                    console.log("✅ Purchase Update:", purchase);
                    if (purchase.transactionId) {
                        await RNIap.finishTransaction({ purchase });
                    }
                });

                return () => {
                    purchaseUpdateSubscription.remove();
                    RNIap.endConnection();
                };
            } catch (error) {
                console.error("❌ IAP Initialization Error:", error);
            }
        };

        initIAP();

        const checkOnboarding = async () => {
            const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
            setInitialRouteName(hasSeen === "true" ? "Home" : "Onboarding");
        };

        checkOnboarding();

        return () => {
            RNIap.endConnection();
        };
    }, []);

    if (initialRouteName === null) return null;

    return (
        <NavigationContainer>
            <AuthProvider>
                <LanguageProvider>
                    <RootNavigator initialRouteName={initialRouteName} />
                </LanguageProvider>
            </AuthProvider>
        </NavigationContainer>
    );
});
