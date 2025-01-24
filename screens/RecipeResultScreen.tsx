// RecipeResultScreen.tsx
import React, {useContext} from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchRecipeScenario1, fetchRecipeScenario2 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import { saveRecipe } from "../helpers/databaseHelpers";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function RecipeResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isLoggedIn } = useContext(AuthContext);
    const { recipe, requestData, scenario } = route.params; // Ensure requestData is passed here
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleTryAgain = async () => {
        if (!requestData) {
            Alert.alert(t("error"), t("missing_request_data"));
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
                    t("daily_limit_reached"),
                    newRecipe.error === "Error: Daily request limit reached for non-signed-in users."
                        ? t("signup_to_continue")
                        : t("upgrade_subscription"),
                    [{ text: "OK" }]
                );
                return;
            }

            navigation.setParams({ recipe: newRecipe }); // Update the recipe on this screen
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
            await saveRecipe(user?.uid, "Recipe Title", recipe);
            Alert.alert(t("success"), t("recipe_saved"));
        } catch (error) {
            Alert.alert(t("error"), error.message || t("failed_to_save"));
        }
    };

    const handleNewRecipe = () => {
        navigation.navigate("Home");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("your_recipe")}</Text>
            <ScrollView>
                {typeof recipe === "string" ? (
                    <Text style={styles.recipeText}>{recipe}</Text>
                ) : (
                    <Text style={styles.errorText}>{t("recipe_error")}</Text>
                )}
            </ScrollView>
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
