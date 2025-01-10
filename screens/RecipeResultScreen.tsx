//RecipeResultScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function RecipeResultScreen({ route }) {
    const { recipe } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Recipe</Text>
            <ScrollView>
                <Text style={styles.recipeText}>{recipe}</Text>
            </ScrollView>
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
});
