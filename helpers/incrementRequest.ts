// incrementRequests.ts
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const incrementRequest = async (userId: string) => {
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        const today = new Date().toISOString().split("T")[0];
        if (userData.lastRequestDate !== today) {
            // Reset requests if a new day
            await updateDoc(userDoc, {
                requestsToday: 1,
                lastRequestDate: today,
                lastUpdated: serverTimestamp(),
            });
        } else if (userData.requestsToday < 2) {
            // Increment if under limit
            await updateDoc(userDoc, {
                requestsToday: userData.requestsToday + 1,
                lastUpdated: serverTimestamp(),
            });
        } else {
            throw new Error("Daily request limit reached");
        }
    }
};
