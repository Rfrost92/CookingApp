// RecipeResultScreen.tsx
import React, {useContext, useState} from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchRecipeScenario1, fetchRecipeScenario2 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import { sanitizeAndParseRecipe, saveRecipe } from "../helpers/recipeHelpers";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import RecipeImage from "../services/RecipeImage";

export default function RecipeResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isLoggedIn } = useContext(AuthContext);
    const { recipe, requestData, scenario, image } = route.params;
    const { language } = useLanguage();
    const t = (key) => translations[language][key] || key;

    const [base64Image, setBase64Image] = useState(null); // Store Base64 image

    const handleTryAgain = async () => {
        if (!requestData) {
            Alert.alert(t("error"), t("missing_request_data"));
            return;
        }

        try {
            let newRecipeResponse;
            if (scenario === 1) {
                newRecipeResponse = await fetchRecipeScenario1(requestData);
            } else if (scenario === 2) {
                newRecipeResponse = await fetchRecipeScenario2(requestData);
            }

            if (newRecipeResponse?.error) {
                Alert.alert(
                    t("daily_limit_reached"),
                    newRecipeResponse.error === "Error: Daily request limit reached."
                        ? t("signup_to_continue")
                        : t("upgrade_subscription"),
                    [{ text: "OK" }]
                );
                return;
            }

            // Parse the new recipe correctly
            const parsedRecipe = sanitizeAndParseRecipe(newRecipeResponse.recipe);
            if (!parsedRecipe || !parsedRecipe.Title) {
                Alert.alert(t("error"), t("recipe_parsing_failed"));
                return;
            }

            // Update navigation parameters with the new parsed recipe & image
            navigation.setParams({
                recipe: newRecipeResponse.recipe,
                image: newRecipeResponse.image
            });

        } catch (error) {
            console.error("Error in Try Again:", error);
            Alert.alert(t("error"), t("unexpected_error"));
        }
    };

    const handleSaveToBook = async () => {
        if (!isLoggedIn) {
            Alert.alert(t("sign_in_required"), t("log_in_to_save"));
            return;
        }

        try {
            const parsedRecipe = sanitizeAndParseRecipe(recipe);
            if (!parsedRecipe) {
                Alert.alert(t("error"), t("invalid_recipe_format"));
                return;
            }

            const saveResult = await saveRecipe(user?.uid, parsedRecipe.Title, parsedRecipe, base64Image);
            if (saveResult.message === "Recipe with the same title already exists.") {
                Alert.alert(t("error"), t("recipe_already_exists"));
            } else {
                Alert.alert(t("success"), t("recipe_saved"));
            }
        } catch (error) {
            Alert.alert(t("error"), error.message || t("failed_to_save"));
        }
    };

    const handleNewRecipe = () => {
        navigation.navigate("Home");
    };

    const renderRecipe = () => {
        const parsedRecipe = sanitizeAndParseRecipe(recipe);

        if (parsedRecipe) {
            return (
                <View>
                    <Text style={styles.sectionTitle}>{parsedRecipe.Prewords}</Text>
                    <Text style={styles.recipeTitle}>{parsedRecipe.Title}</Text>
                    <Text style={styles.description}>{parsedRecipe.Description}</Text>

                    {/* Use RecipeImage component */}
                    {image && <RecipeImage imageUrl={image} onImageFetched={setBase64Image} />}

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t("ingredients")}</Text>
                        <Text style={styles.sectionContent}>
                            {parsedRecipe?.Ingredients?.replace(/\\n/g, "\n")}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t("steps")}</Text>
                        <Text style={styles.sectionContent}>
                            {parsedRecipe?.Steps?.replace(/\\n/g, "\n")}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t("calories")}</Text>
                        <Text style={styles.sectionContent}>{parsedRecipe?.Calories}</Text>
                    </View>
                </View>
            );
        }

        return <Text style={styles.errorText}>{t("recipe_error")}</Text>;
    };

    return (
        <View style={styles.container}>
            <ScrollView>{renderRecipe()}</ScrollView>
            <View style={styles.buttonContainer}>
                {requestData && <Button title={t("try_again")} onPress={handleTryAgain} />}
                <Button title={t("save_to_book")} onPress={handleSaveToBook} />
                <Button title={t("new_recipe")} onPress={handleNewRecipe} />
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
    recipeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
    },
    description: {
        fontSize: 16,
        fontStyle: "italic",
        marginBottom: 15,
        textAlign: "center",
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    sectionContent: {
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
    sectionTitle: {
        fontSize: 16,
        color: "#4caf50",
        marginBottom: 10,
        textAlign: "center",
    },
});
