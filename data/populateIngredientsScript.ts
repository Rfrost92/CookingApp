//populateIngredientsScript.ts
import { db } from "../firebaseConfig";
import ingredients from "./ingredients1.json"; // Path to your JSON file
import { collection, doc, setDoc } from "firebase/firestore";

const populateIngredients = async () => {
    try {
        console.log("Starting Firestore population...");
        for (const ingredient of ingredients) {
            // Use the English name (lowercased and sanitized) as the document ID
            const docId = ingredient.name.en.toLowerCase().replace(/\s+/g, "_");
            await setDoc(doc(collection(db, "ingredients"), docId), ingredient);
        }
        console.log("Ingredients have been successfully added to Firestore!");
    } catch (error) {
        console.error("Error populating Firestore:", error);
    }
};

populateIngredients();
