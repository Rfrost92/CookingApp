//subscriptionService.ts

import {doc, updateDoc} from "firebase/firestore";
import {db} from "../firebaseConfig";

const itemSkus = ["com.rFrostSmartChef.premium.monthly"];

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
        const purchases = await RNIap.getAvailablePurchases();
        const hasPremium = purchases.some(purchase =>
            itemSkus.includes(purchase.productId)
        );

        if (hasPremium && user) {
            // Update Firestore to ensure subscription state
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { subscriptionType: "premium" });

            setSubscriptionType("premium"); // Update global state
        } else {
            setSubscriptionType("guest");
        }
    } catch (error) {
        console.error("❌ Restore purchases failed:", error);
    }
};
