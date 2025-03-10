//validator.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {inappropriateWordsExact, inappropriateWordsStrict} from "../data/inappropriateWords";

export const containsInappropriateWords = (text) => {
    if (!text || typeof text !== "string") {
        console.warn("Invalid text input for inappropriate words check.");
        return false;
    }

    return containsTotallyInappropriateWords(text) || containsContextSensitiveWords(text);
};

export const containsTotallyInappropriateWords = (text) => {
    return inappropriateWordsStrict.some((word) => text.toLowerCase().includes(word));
};

export const containsContextSensitiveWords = (text) => {
    // Ensure text is properly sanitized and split
    const words = text.toLowerCase().match(/\b\w+\b/g) || []; // Extract words properly
    return words.some((word) => inappropriateWordsExact.includes(word));
};

export const logInappropriateInput = async (userId, input) => {
    console.log("Logging inappropriate request:", input);
    try {
        const newEntry = await addDoc(collection(db, "flaggedRequests"), {
            userId: userId || "anonymous",
            input,
            timestamp: new Date(),
        });
        return true;
    } catch (error) {
        console.warn("Error logging inappropriate input:", error);
        return false;
    }
};

export const logParseErrors = async (userId, error, response, inputs) => {
    console.log("Logging parsing error:", error);
    try {
        const newEntry = await addDoc(collection(db, "logsParseErrors"), {
            userId: userId || "anonymous",
            error,
            response,
            inputs,
            timestamp: new Date(),
        });
        return true;
    } catch (err) {
        console.warn("Error logging parsing error:", err);
        return false;
    }
};

export const logGptErrorResponse = async (userId, error, response, inputs) => {
    console.log("Logging parsing error:", error);
    try {
        const newEntry = await addDoc(collection(db, "logsGptErrorResponse"), {
            userId: userId || "anonymous",
            error,
            response,
            inputs,
            timestamp: new Date(),
        });
        return true;
    } catch (err) {
        console.warn("Error logging parsing error:", err);
        return false;
    }
};
