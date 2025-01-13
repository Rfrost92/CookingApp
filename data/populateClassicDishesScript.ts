//populateClassicDishesScript.ts
import { db } from "../firebaseConfig";
import classicDishes from "./classicDishes1.json";
import { collection, doc, setDoc } from "firebase/firestore";

const populateClassicDishes = async () => {
    try {
        console.log("Starting Firestore dishes population...");
        for (const classicDish of classicDishes) {
            const docRef = doc(collection(db, "classicDishes"), classicDish.id); // Use 'id' as the document ID
            await setDoc(docRef, classicDish);
        }
        console.log("Classic dishes successfully added to Firestore!");
    } catch (error) {
        console.error("Error populating categories:", error);
    }
};

populateClassicDishes();
