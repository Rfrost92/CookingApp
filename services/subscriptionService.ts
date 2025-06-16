//subscriptionService.ts

import {doc, updateDoc} from "firebase/firestore";
import {db} from "../firebaseConfig";
import * as RNIap from "react-native-iap";
import axios from "axios";

export const itemSkus = ["com.rFrostSmartChef.plus.monthly"];

const fetchSubscriptions = async () => {
    try {
        console.log('here')
        const products = await RNIap.getSubscriptions({ skus: itemSkus });
        console.log('here', products);
        console.log("Available subscriptions:", products);
        return products;
    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
    }
};

//When the user taps "Subscribe", call:
const purchaseSubscription = async (sku) => {
    try {
        const purchase = await RNIap.requestSubscription(sku);
        console.log("✅ Subscription successful:", purchase);
    } catch (error) {
        console.error("❌ Subscription failed:", error);
    }
};

export const restorePurchases = async (setSubscriptionType, user) => {
    try {
        console.log("🔄 Initializing IAP connection for restore...");
        await RNIap.initConnection();

        const purchases = await RNIap.getAvailablePurchases();
        console.log("🧾 Available purchases:", purchases);

        const hasPremium = purchases.some(purchase =>
            itemSkus.includes(purchase.productId)
        );

        if (hasPremium && user) {
            console.log("🎉 Premium purchase found. Updating Firestore and state...");
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { subscriptionType: "premium" });
            setSubscriptionType("premium");
            return true; // ✅ Restored
        } else {
            console.log("⚠️ No premium purchases found.");
            setSubscriptionType("guest");
            return false; // ❌ Nothing to restore
        }
    } catch (error) {
        console.error("❌ Restore purchases failed:", JSON.stringify(error, null, 2));
        throw new Error("restore_failed_internal");
    }
};

export const deleteRevenueCatSubscriber = async (uid: string) => {
    console.error(`Account Deletion: 🚨 User ${uid} deleted their account — check RevenueCat!`);
    return;
    try {
        const res = await axios.delete(`https://api.revenuecat.com/v1/subscribers/${uid}`, {
            headers: {
                Authorization: `Bearer ${process.env.REVENUECAT_SECRET_API_KEY}`,
            },
        });
        console.log("✅ RevenueCat user deleted:", res.status);
    } catch (error: any) {
        console.error("❌ Error deleting RevenueCat subscriber:", error?.response?.data || error.message);
        throw error;
    }
};

