// testUserAndRequestHelpers.ts
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

const getDeviceId = async () => {
    let deviceId = await AsyncStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = uuidv4();
        await AsyncStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
};

export const incrementRequest = async (userId: string) => {
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const weekStart = getStartOfWeek(today).toISOString().split("T")[0];
    const monthStr = `${today.getFullYear()}-${today.getMonth() + 1}`; // 🧠 define before using

    const updateData: any = {
        lastUpdated: serverTimestamp(),
    };

    // ✅ Total requests ever
    updateData.totalRequests = (userData.totalRequests ?? 0) + 1;

    // ✅ Requests this month
    const currentMonth = userData.currentMonth ?? "";
    if (currentMonth !== monthStr) {
        updateData.requestsThisMonth = 1;
        updateData.currentMonth = monthStr;
    } else {
        updateData.requestsThisMonth = (userData.requestsThisMonth ?? 0) + 1;
    }

    // 🛡️ Skip limits for premium users
    if (userData.subscriptionType === "premium") {
        console.log("🚀 Premium user — skipping request limits");
        await updateDoc(userDoc, updateData); // update stats even for premium
        return;
    }

    // --- DAILY tracking
    const requestsToday = userData.requestsToday ?? 0;
    const lastRequestDate = userData.lastRequestDate ?? "";

    if (lastRequestDate !== todayStr) {
        updateData.requestsToday = 1;
        updateData.lastRequestDate = todayStr;
    } else {
        updateData.requestsToday = requestsToday + 1;
    }

    // --- WEEKLY limit enforcement
    const requestsThisWeek = userData.requestsThisWeek ?? 0;
    const lastWeekStartDate = userData.lastWeekStartDate ?? "";

    if (lastWeekStartDate !== weekStart) {
        updateData.requestsThisWeek = 1;
        updateData.lastWeekStartDate = weekStart;
    } else if (requestsThisWeek < 2) {
        updateData.requestsThisWeek = requestsThisWeek + 1;
    } else {
        throw new Error("Weekly request limit reached");
    }

    console.log("⬆️ Updating user request stats:", updateData);
    await updateDoc(userDoc, updateData);
};


export const incrementNonSignedInRequests = async () => {
    const today = new Date();
    const weekStart = getStartOfWeek(today).toISOString().split("T")[0];
    const deviceId = await getDeviceId();
    const requestKey = `nonSignedInRequests-${deviceId}-${weekStart}`;

    let requestCount = parseInt(await AsyncStorage.getItem(requestKey) || "0", 10);

    if (requestCount >= 2) {
        throw new Error("Weekly request limit reached for non-signed-in users.");
    }

    requestCount += 1;
    await AsyncStorage.setItem(requestKey, requestCount.toString());
};

const getStartOfWeek = (date: Date): Date => {
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(date.setDate(diff));
};

//For testing
export const resetNonSignedInCounter = async () => {
    const deviceId = await AsyncStorage.getItem("deviceId");
    const weekStart = getStartOfWeek(new Date()).toISOString().split("T")[0];

    if (deviceId) {
        const requestKey = `nonSignedInRequests-${deviceId}-${weekStart}`;
        await AsyncStorage.removeItem(requestKey);
        console.log("✅ Non-signed-in weekly counter reset successfully.");
    } else {
        console.log("ℹ️ Device ID not found, nothing to reset.");
    }

    await clearAllAsyncStorage();
};

const clearAllAsyncStorage = async () => {
    await AsyncStorage.clear();
    console.log("All AsyncStorage data cleared.");
};

export const resetRequestsForTestUser = async (userId: string) => {
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.testUser) {
            await updateDoc(userDoc, {
                requestsToday: 0,
                requestsThisWeek: 0,
                lastRequestDate: null,
                lastWeekStartDate: null,
                lastUpdated: serverTimestamp(),
            });
            console.log("✅ Requests reset successfully for test user.");
            return true;
        } else {
            throw new Error("🚫 This operation is not permitted for non-test users.");
        }
    } else {
        throw new Error("🚫 User does not exist.");
    }
};

export const isUserTest = async (userId: string) => {
    const userDoc = await doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        return !!userData.testUser;
    } else {
        throw new Error("User does not exist.");
    }
};

export const toggleTestUserSubscription = async (userId: string): Promise<"guest" | "premium"> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("🚫 User does not exist.");
    }

    const userData = userSnap.data();
    if (!userData.testUser) {
        throw new Error("🚫 User is not marked as a test user.");
    }

    const currentType = userData.subscriptionType || "guest";
    const newType = currentType === "premium" ? "guest" : "premium";

    await updateDoc(userRef, { subscriptionType: newType });

    console.log(`✅ SubscriptionType changed to ${newType} for test user.`);
    return newType;
};

export const fetchTestUserStatusAndRequests = async (userId: string): Promise<{ isTestUser: boolean, requestsThisWeek: number }> => {
    const userDocSnap = await getDoc(doc(db, "users", userId));
    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        return {
            isTestUser: !!userData.testUser,
            requestsThisWeek: userData.requestsThisWeek || 0,
        };
    } else {
        throw new Error("User does not exist.");
    }
};

export const getRequestsThisWeek = async (userId: string): Promise<number> => {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (!userSnap.exists()) return 0;
    const data = userSnap.data();
    return data.requestsThisWeek || 0;
};

