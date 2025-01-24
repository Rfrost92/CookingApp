// helpers/databaseHelpers.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "../firebaseConfig";
import { doc, collection, addDoc, getDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";

// Save a recipe
export const saveRecipe = async (userId: string, title: string, content: string) => {
    const storage = getStorage(); // Initialize Firebase Storage
    const filePath = `recipes/${userId}/${Date.now()}.json`; // Generate a unique file path
    const storageRef = ref(storage, filePath);

    try {
        // Convert content to JSON and upload it as a file to Firebase Storage
        const contentBlob = new Blob([JSON.stringify({ content })], { type: "application/json" });
        console.log("contentBlob", contentBlob);
        try {
            await uploadBytes(storageRef, contentBlob);
            console.log("File uploaded successfully");
        } catch (uploadError) {
            console.error("Upload error:", uploadError.code, uploadError.message);
            throw uploadError;
        }

        // Get the download URL for the file

        const downloadURL = await getDownloadURL(storageRef);

        // Save metadata in Firestore
        const recipesRef = collection(db, "savedRecipes");
        const recipeData = {
            userId,
            title,
            filePath, // Path to the file in Storage
            downloadURL, // URL to access the file
            savedAt: new Date(),
        };
        const docRef = await addDoc(recipesRef, recipeData);

        console.log("Recipe saved with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error saving recipe:", error.code, error.message);
        throw new Error("Failed to save recipe. Please try again.");
    }
};

// Fetch a single recipe by ID
export const fetchRecipeById = async (recipeId: string) => {
    try {
        const recipeRef = doc(db, "savedRecipes", recipeId);
        const recipeSnap = await getDoc(recipeRef);

        if (!recipeSnap.exists()) {
            throw new Error("Recipe not found");
        }

        const recipeData = recipeSnap.data();
        const storage = getStorage();
        const storageRef = ref(storage, recipeData.filePath);

        // Fetch the recipe content from Firebase Storage
        const downloadURL = await getDownloadURL(storageRef);
        const response = await fetch(downloadURL);
        const recipeContent = await response.json();

        return {
            id: recipeSnap.id,
            ...recipeData,
            content: recipeContent.content, // Combine metadata with fetched content
        };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        throw new Error("Failed to load recipe.");
    }
};

// Delete a recipe by ID
export const deleteRecipeById = async (recipeId: string) => {
    try {
        const recipeRef = doc(db, "savedRecipes", recipeId);
        const recipeSnap = await getDoc(recipeRef);

        if (!recipeSnap.exists()) {
            throw new Error("Recipe not found");
        }

        const { filePath } = recipeSnap.data();
        const storage = getStorage();
        const storageRef = ref(storage, filePath);

        // Delete the file from Firebase Storage
        await deleteObject(storageRef);

        // Delete the metadata from Firestore
        await deleteDoc(recipeRef);

        console.log("Recipe deleted successfully");
    } catch (error) {
        console.error("Error deleting recipe:", error);
        throw new Error("Failed to delete recipe.");
    }
};

// Fetch all recipes for a user
export const fetchUserRecipes = async (userId: string) => {
    try {
        const recipesRef = collection(db, "savedRecipes");
        const q = query(recipesRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        // Fetch metadata from Firestore and retrieve content from Firebase Storage
        const recipes = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const storage = getStorage();
                const storageRef = ref(storage, data.filePath);

                try {
                    // Fetch the recipe content from Firebase Storage
                    const downloadURL = await getDownloadURL(storageRef);
                    const response = await fetch(downloadURL);
                    const recipeContent = await response.json();

                    return {
                        id: doc.id, // Firestore document ID
                        ...data, // Metadata from Firestore
                        content: recipeContent.content, // Content fetched from Firebase Storage
                    };
                } catch (error) {
                    console.error("Error fetching recipe content:", error);
                    return {
                        id: doc.id,
                        ...data,
                        content: null, // Fallback to metadata only if content retrieval fails
                    };
                }
            })
        );

        return recipes;
    } catch (error) {
        console.error("Error fetching recipes for user:", error);
        throw new Error("Failed to fetch recipes. Please try again.");
    }
};
