// helpers/recipeHelpers.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadString } from "firebase/storage";
import { db } from "../firebaseConfig";
import { doc, collection, addDoc, getDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import base64js from "base64-js";

// Save a recipe
export const saveRecipe = async (userId, title, content, imageBase64) => {
    const storage = getStorage();
    const filePath = `recipes/${userId}/${Date.now()}.json`;
    const imagePath = `recipes/${userId}/${Date.now()}.png`;
    const storageRef = ref(storage, filePath);
    const imageRef = ref(storage, imagePath);

    try {
        const recipesRef = collection(db, "savedRecipes");
        const querySnapshot = await getDocs(query(recipesRef, where("userId", "==", userId), where("title", "==", title)));
        if (!querySnapshot.empty) {
            console.warn("Recipe with the same title already exists.");
            return { message: "Recipe with the same title already exists." };  // ✅ Prevent duplicate save
        }
        const contentBlob = new Blob([JSON.stringify({ content })], { type: "application/json" });
        await uploadBytes(storageRef, contentBlob);
        let imageURL = null;

        // Convert Base64 to File & Upload
        if (imageBase64) {
            console.log("Received Base64 Image:", imageBase64.substring(0, 50));
            // Ensure Base64 is valid
            if (!imageBase64.startsWith("data:image/png;base64,")) {
                console.error("Invalid base64 format for image");
                throw new Error("Invalid base64 format for image");
            }

            // Save Base64 to a Local File
            const fileUri = `${FileSystem.cacheDirectory}recipe-${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(fileUri, imageBase64.split(",")[1], {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log("Image saved to file:", fileUri);

            // Upload File to Firebase Storage**
            const response = await fetch(fileUri);
            const blob = await response.blob();
            await uploadBytes(imageRef, blob);

            // **Get Image Download URL**
            imageURL = await getDownloadURL(imageRef);
            console.log("Image uploaded successfully!", imageURL);
        }

        // Get JSON Download URL**
        const downloadURL = await getDownloadURL(storageRef);

        // Save Recipe Metadata in Firestore**
        const recipeData = {
            userId,
            title,
            filePath,
            imageURL,
            downloadURL,
            savedAt: new Date(),
        };
        const docRef = await addDoc(recipesRef, recipeData);

        console.log("Recipe saved successfully:", docRef.id);
        return { id: docRef.id, message: "Recipe saved successfully." };
    } catch (error) {
        console.error("Error saving recipe:", error);
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

export const sanitizeAndParseRecipe = (rawRecipe: string | object) => {
    try {
        // If the recipe is already an object, return it directly
        if (typeof rawRecipe === "object" && rawRecipe !== null) {
            return rawRecipe;
        }

        // Otherwise, sanitize and parse it as a string
        if (typeof rawRecipe === "string") {
            const sanitized = rawRecipe.replace(/```json\n/, "").replace(/```/, "");
            return JSON.parse(sanitized);
        }

        throw new Error("Invalid recipe format: not a string or object");
    } catch (error) {
        return { error: "Error parsing recipe JSON:" + error + "" }
    }
};

