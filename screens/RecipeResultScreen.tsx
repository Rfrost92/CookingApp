import React from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {fetchRecipeScenario1, fetchRecipeScenario2} from "../services/openaiService";

export default function RecipeResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
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
            navigation.setParams({ recipe: newRecipe }); // Update the recipe on this screen
        } catch (error) {
            Alert.alert("Error", "Failed to fetch a new recipe. Please try again.");
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
                <Text style={styles.recipeText}>{recipe}</Text>
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
    buttonContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
