import { db } from "../firebaseConfig";
import categories from "./categories1.json";
import { collection, doc, setDoc } from "firebase/firestore";

const populateCategories = async () => {
    try {
        console.log("Starting Firestore category population...");
        for (const category of categories) {
            const docRef = doc(collection(db, "categories"), category.id); // Use 'id' as the document ID
            await setDoc(docRef, category);
        }
        console.log("Categories successfully added to Firestore!");
    } catch (error) {
        console.error("Error populating categories:", error);
    }
};

populateCategories();
