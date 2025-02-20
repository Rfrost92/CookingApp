import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchRecipeScenario1, fetchRecipeScenario2 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import { sanitizeAndParseRecipe, saveRecipe } from "../helpers/recipeHelpers";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import RecipeImage from "../services/RecipeImage";
import { Ionicons } from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RecipeResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isLoggedIn } = useContext(AuthContext);
    const { recipe, requestData, scenario, image } = route.params;
    const { language } = useLanguage();
    const t = (key) => translations[language][key] || key;

    const [base64Image, setBase64Image] = useState(null);

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

            const parsedRecipe = sanitizeAndParseRecipe(newRecipeResponse.recipe);
            if (!parsedRecipe || !parsedRecipe.Title) {
                Alert.alert(t("error"), t("recipe_parsing_failed"));
                return;
            }

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
                    {/* Recipe Title */}
                    <Text style={styles.recipeTitle}>{parsedRecipe.Title}</Text>

                    {/* Top Block with Image & Info */}
                    <View style={styles.topBlock}>
                        {/* Recipe Image */}
                        <Image source={{ uri: image }} style={styles.recipeImage} />

                        {/* Recipe Info */}
                        <View style={styles.recipeInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons name="flame" size={20} color="black" />
                                <Text style={styles.infoText}>{parsedRecipe.Calories}</Text>
                            </View>
                            {requestData.isVegetarian && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="leaf" size={20} color="black" />
                                    <Text style={styles.infoText}>Vegetarian</Text>
                                </View>
                            )}
                            {requestData.isVegan && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="leaf" size={20} color="black" />
                                    <Text style={styles.infoText}>Vegan</Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Ionicons name="person" size={20} color="black" />
                                <Text style={styles.infoText}>{requestData.portions}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="time" size={20} color="black" />
                                <Text style={styles.infoText}>{requestData.maxCookingTime} min</Text>
                            </View>
                        </View>
                    </View>

                    {/* Prewords (Short Intro) */}
                    <View style={styles.prewordsContainer}>
                        <Text style={styles.prewordsText}>{parsedRecipe.Prewords}</Text>
                    </View>

                    {/* Ingredients Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t("ingredients")}</Text>
                        <View style={styles.ingredientList}>
                            {parsedRecipe?.Ingredients?.split("\\n").map((item, index) => (
                                <Text key={index} style={styles.ingredientItem}>• {item.trim()}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Process Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t("Steps to cook")}</Text>
                        {parsedRecipe?.Steps?.split("\\n").map((step, index) => {
                            // Remove existing numbers (e.g., "1. ", "2. ") from steps
                            const stepText = step.replace(/^\d+\.\s*/, "").trim();
                            return (
                                <View key={index} style={styles.processItemContainer}>
                                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                                    <Text style={styles.processItem}>{stepText}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            );
        }

        return <Text style={styles.errorText}>{t("recipe_error")}</Text>;
    };



    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>{renderRecipe()}</ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                {requestData && <TouchableOpacity style={styles.bottomButton} title={t("try_again")} onPress={handleTryAgain} >
                    <Text style={styles.bottomButtonText}>{t("try_again")}</Text>
                </TouchableOpacity>}
                <TouchableOpacity style={styles.bottomButton} onPress={handleSaveToBook}>
                    <Text style={styles.bottomButtonText}>{t("save")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleNewRecipe}>
                    <Text style={styles.bottomButtonText}>{t("new_recipe")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
    },

    content: {
        flex: 1, // Takes all available space above bottom bar
        padding: 20, // This padding now applies only to the main content
        paddingTop: 0, // This padding now applies only to the main content
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        padding: 5,
    },
    backText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 5,
    },
    recipeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
    },
    topBlock: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        height: 180, // Adjust height to fit well on most screens
    },
    recipeImage: {
        width: "50%", // Makes sure it takes half of the `topBlock`
        height: "100%", // Ensures the image fills the space properly
        borderRadius: 10,
    },
    recipeInfo: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: "space-between",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    infoText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: "bold",
    },

    section: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%", // Fully stretched
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 35, // Internal padding for button spacing
    },
    bottomButton: {
        paddingVertical: 10,
    },
    bottomButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    prewordsContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    prewordsText: {
        fontSize: 16,
        fontStyle: "italic",
        textAlign: "center",
    },
    ingredientList: {
        paddingLeft: 10,
        marginTop: 5,
    },
    ingredientItem: {
        fontSize: 16,
        marginVertical: 3,
        lineHeight: 22,
    },
    processItemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 5,
    },
    stepNumber: {
        fontWeight: "bold",
        color: "#FCE71C",
        fontSize: 18,
        marginRight: 8,
    },
    processItem: {
        fontSize: 16,
        flex: 1,
        lineHeight: 22,
    },
});

