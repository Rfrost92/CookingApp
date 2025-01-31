// incrementRequests.ts
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
            const deviceId = await getDeviceId();
            const requestKey = `nonSignedInRequests-${deviceId}-${today}`;
            await AsyncStorage.setItem(requestKey, '2');
            throw new Error("Daily request limit reached");
        }
    }
};

export const incrementNonSignedInRequests = async () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date
    const deviceId = await getDeviceId();
    const requestKey = `nonSignedInRequests-${deviceId}-${today}`;

    let requestCount = parseInt(<string>await AsyncStorage.getItem(requestKey), 10) || 0;

    if (requestCount >= 2) {
        throw new Error("Daily request limit reached for non-signed-in users.");
    }

    requestCount += 1;
    await AsyncStorage.setItem(requestKey, requestCount.toString());
};

//For testing
export const resetNonSignedInCounter = async () => {
    const deviceId = await AsyncStorage.getItem("deviceId");
    const today = new Date().toISOString().split("T")[0];

    if (deviceId) {
        const requestKey = `nonSignedInRequests-${deviceId}-${today}`;
        await AsyncStorage.removeItem(requestKey);
        console.log("Non-signed-in counter reset successfully.");
    } else {
        console.log("Device ID not found, nothing to reset.");
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
                lastUpdated: serverTimestamp(),
            });
            console.log("Requests reset successfully for test user.");
        } else {
            throw new Error("This operation is not permitted for non-test users.");
        }
    } else {
        throw new Error("User does not exist.");
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
