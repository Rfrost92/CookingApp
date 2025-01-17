// helpers/databaseHelpers.ts
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc } from "firebase/firestore";

// Save a recipe
export const saveRecipe = async (userId: string, title: string, content: string) => {
    const recipesRef = collection(db, "savedRecipes");
    const q = query(recipesRef, where("userId", "==", userId), where("content", "==", content));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("This recipe is already saved.");
    }

    const recipeData = {
        userId,
        title,
        content,
        savedAt: new Date(),
    };
    const docRef = await addDoc(recipesRef, recipeData);
    console.log("Recipe saved with ID:", docRef.id);
    return docRef.id;
};

// Delete a recipe by ID
export const deleteRecipeById = async (recipeId: string) => {
    const recipeRef = doc(db, "savedRecipes", recipeId);
    await deleteDoc(recipeRef);
};

// Fetch all recipes for a user
export const fetchUserRecipes = async (userId: string) => {
    const recipesRef = collection(db, "savedRecipes");
    const q = query(recipesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Fetch a single recipe by ID
export const fetchRecipeById = async (recipeId: string) => {
    const recipeRef = doc(db, "savedRecipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);
    if (recipeSnap.exists()) {
        return { id: recipeSnap.id, ...recipeSnap.data() };
    } else {
        throw new Error("Recipe not found");
    }
};
