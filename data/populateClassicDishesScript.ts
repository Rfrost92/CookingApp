import admin from "firebase-admin";
import classicDishes from "./classicDishes2.json";
import path from "path";

// Initialize Admin SDK
const serviceAccount = require(path.resolve("./data/serviceAccountKey.json"));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

const populateClassicDishes = async () => {
    try {
        console.log("Starting Firestore dishes population...");

        for (const classicDish of classicDishes) {
            const docRef = db.collection("classicDishes").doc(classicDish.id);
            const existingDoc = await docRef.get();

            if (existingDoc.exists) {
                console.log(`❌ Overwriting existing dish: ${classicDish.id}`);
            }

            await docRef.set(classicDish);
            console.log(`✅ Added dish: ${classicDish.id}`);
        }

        console.log("Classic dishes population complete!");
    } catch (error) {
        console.error("Error populating classic dishes:", error);
    }
};

populateClassicDishes();
