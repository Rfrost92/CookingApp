// RecipeDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { fetchRecipeById } from "../helpers/databaseHelpers";

export default function RecipeDetailScreen({ route }: any) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<any>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const fetchedRecipe = await fetchRecipeById(recipeId);
                setRecipe(fetchedRecipe);
            } catch (error) {
                console.error("Error fetching recipe:", error);
                Alert.alert("Error", "Failed to load recipe.");
            }
        };

        fetchRecipe();
    }, [recipeId]);

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.content}>{recipe.content}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    content: { fontSize: 16, lineHeight: 24 },
});
