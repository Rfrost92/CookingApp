// App.tsx
import React, { useEffect } from "react";
import RootNavigator from "./navigation/RootNavigator";
import {AuthProvider} from "./contexts/AuthContext";
import {LanguageProvider} from "./services/LanguageContext";
import {Buffer} from "buffer";
import * as RNIap from "react-native-iap";
import * as Sentry from '@sentry/react-native';
import { captureConsoleIntegration } from "@sentry/core";

global.Buffer = Buffer;

const itemSkus = {skus: ["com.rFrostSmartChef.premium.monthly"]};

// Initialize In-App Purchases
const initIAP = async () => {
    try {
        const result = await RNIap.initConnection();
        console.log("✅ IAP Initialized:", result);

        const isAvailable = await RNIap.getSubscriptions(itemSkus); // ✅ Fix: use an object
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
Sentry.init({
    dsn: 'https://fdcc23544f251ec13abbd4af5bec0e72@o4509089542569984.ingest.de.sentry.io/4509089612562512',
    integrations: [
        captureConsoleIntegration({ levels: ["warn", "error"] }),
    ],
    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
    useEffect(() => {
        initIAP(); // Initialize IAP on App launch

        return () => {
            RNIap.endConnection(); // Cleanup IAP when App unmounts
        };
    }, []);
    return (
        <AuthProvider>
            <LanguageProvider>
                <RootNavigator/>
            </LanguageProvider>
        </AuthProvider>
    );
});
