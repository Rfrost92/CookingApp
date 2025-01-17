// RecipeResultScreen.tsx
import React, {useContext} from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {fetchRecipeScenario1, fetchRecipeScenario2} from "../services/openaiService";
import {AuthContext} from "../contexts/AuthContext";

export default function RecipeResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isLoggedIn } = useContext(AuthContext);
    const { recipe, requestData, scenario } = route.params; // Ensure requestData is passed here

    const handleTryAgain = async () => {
        if (!requestData) {
            Alert.alert("Error", "Request data is missing. Please start a new recipe request.");
            return;
        }

        try {
            let newRecipe;
            if (scenario === 1) {
                newRecipe = await fetchRecipeScenario1(requestData);
            } else if (scenario === 2) {
                newRecipe = await fetchRecipeScenario2(requestData);
            }

            // Check if the response contains an error
            if (newRecipe?.error) {
                Alert.alert(
                    "Daily Limit Reached",
                    newRecipe.error === "Error: Daily request limit reached for non-signed-in users."
                        ? "Please sign up for a free account to continue creating recipes."
                        : "You have reached your daily limit. Upgrade your subscription for more requests.",
                    [{ text: "OK" }]
                );
                return;
            }

            navigation.setParams({ recipe: newRecipe }); // Update the recipe on this screen
        } catch (error) {
            console.error("Error in Try Again:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
    };

    const handleSaveToBook = () => {
        Alert.alert("Saved", "This recipe has been saved to your book of recipes.");
    };

    const handleNewRecipe = () => {
        navigation.navigate("Home");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Recipe</Text>
            <ScrollView>
                {typeof recipe === "string" ? (
                    <Text style={styles.recipeText}>{recipe}</Text>
                ) : (
                    <Text style={styles.errorText}>
                        Unable to display the recipe. Please try again.
                    </Text>
                )}
            </ScrollView>
            <View style={styles.buttonContainer}>
                {requestData && <Button title="Try Again" onPress={handleTryAgain} />}
                <Button title="Save to Book of Recipes" onPress={handleSaveToBook} />
                <Button title="New Recipe" onPress={handleNewRecipe} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    recipeText: {
        fontSize: 16,
        lineHeight: 24,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
