// RecipeDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from "react-native";
import { fetchRecipeById, sanitizeAndParseRecipe } from "../helpers/recipeHelpers";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function RecipeDetailScreen({ route }: any) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<any>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const fetchedRecipe = await fetchRecipeById(recipeId);
                const parsedRecipe = sanitizeAndParseRecipe(fetchedRecipe.content);
                setRecipe(parsedRecipe);
                setImageURL(fetchedRecipe.imageURL || null);
            } catch (error) {
                console.error("Error fetching recipe:", error);
                Alert.alert(t("error"), t("failed_to_load_recipe"));
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [recipeId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4caf50" />
                <Text>{t("loading")}</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{t("recipe_not_found")}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {imageURL && (
                <Image
                    source={{ uri: imageURL }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                />
            )}
            <Text style={styles.title}>{recipe.Title}</Text>
            <Text style={styles.prewords}>{recipe.Prewords}</Text>
            <Text style={styles.description}>{recipe.Description}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t("ingredients")}</Text>
                <Text style={styles.sectionContent}>{recipe.Ingredients.replace(/\\n/g, "\n")}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t("steps")}</Text>
                <Text style={styles.sectionContent}>{recipe.Steps.replace(/\\n/g, "\n")}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t("calories")}</Text>
                <Text style={styles.sectionContent}>{recipe.Calories}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    recipeImage: {
        width: "100%",
        height: 250,
        borderRadius: 10,
        marginBottom: 15,
    },
    prewords: { fontSize: 16, fontStyle: "italic", marginBottom: 15 },
    description: { fontSize: 16, marginBottom: 15 },
    section: { marginBottom: 20 },
    sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    sectionContent: { fontSize: 16, lineHeight: 24 },
});
