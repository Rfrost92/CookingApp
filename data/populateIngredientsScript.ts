// scripts/populateIngredientsScript.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import ingredients from "./ingredients3.json";
import * as serviceAccount from "./serviceAccountKey.json"; // Import the downloaded key

initializeApp({
    credential: cert(serviceAccount as any),
});

const db = getFirestore();

const populateIngredients = async () => {
    try {
        console.log("Starting Firestore population...");
        for (const ingredient of ingredients) {
            const docId = ingredient.name.en.toLowerCase().replace(/\s+/g, "_");
            await db.collection("ingredients").doc(docId).set(ingredient);
        }
        console.log("Ingredients have been successfully added to Firestore!");
    } catch (error) {
        console.error("Error populating Firestore:", error);
    }
};

populateIngredients();
