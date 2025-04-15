// RecipeDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity, Modal, Linking,
} from "react-native";
import { fetchRecipeById, sanitizeAndParseRecipe } from "../helpers/recipeHelpers";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function RecipeDetailScreen({ route, navigation }: any) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState<any>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;
    const [showNutritionInfo, setShowNutritionInfo] = useState(false);

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
                <Modal visible={loading} transparent={true} animationType="fade">
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color="#FCE71C" />
                            <Text style={styles.loadingText}>{t("loading_recipe")}</Text>
                            {/* Placeholder for Ad: Future Implementation */}
                            {/* <AdComponent /> */}
                        </View>
                    </View>
                </Modal>
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
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                {/* Recipe Title */}
                <Text style={styles.recipeTitle}>{recipe.Title}</Text>
                <Text style={styles.recipeTitle}>{''}</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Recipe Image */}
                {imageURL && (
                    <Image source={{ uri: imageURL }} style={styles.recipeImage} resizeMode="cover" />
                )}

                {/* Recipe Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="flame" size={20} color="black" />
                        <Text style={styles.infoText}>{recipe.Calories}</Text>
                    </View>
                    {recipe.isVegetarian && (
                        <View style={styles.infoRow}>
                            <Ionicons name="leaf" size={20} color="black" />
                            <Text style={styles.infoText}>Vegetarian</Text>
                        </View>
                    )}
                    {recipe.isVegan && (
                        <View style={styles.infoRow}>
                            <Ionicons name="leaf" size={20} color="black" />
                            <Text style={styles.infoText}>Vegan</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="black" />
                        <Text style={styles.infoText}>{recipe.cookingTime} min</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowNutritionInfo(true)}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>ⓘ</Text>
                    </TouchableOpacity>
                </View>

                {/* Prewords (Short Intro) */}
                <View style={styles.prewordsContainer}>
                    <Text style={styles.prewordsText}>{recipe.Prewords}</Text>
                </View>

                {/* Ingredients Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t("ingredients")}</Text>
                    <View style={styles.ingredientList}>
                        {(recipe?.Ingredients?.includes("\\n")
                                ? recipe?.Ingredients?.split("\\n")
                                : recipe?.Ingredients?.split("\n")
                        ).map((item, index) => (
                            <Text key={index} style={styles.ingredientItem}>• {item.replace('- ', '').trim()}</Text>
                        ))}
                    </View>
                </View>

                {/* Process Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t("Steps to cook")}</Text>
                    {(recipe?.Steps?.includes("\\n")
                            ? recipe?.Steps?.split("\\n")
                            : recipe?.Steps?.split("\n")
                    ).map((step, index) => {
                        const stepText = step.replace(/^\d+\.\s*/, "").trim();
                        return (
                            <View key={index} style={styles.processItemContainer}>
                                <Text style={styles.stepNumber}>{index + 1}.</Text>
                                <Text style={styles.processItem}>{stepText}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <Modal visible={showNutritionInfo} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('nutrition_disclaimer_title')}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            <Text style={styles.modalText}>
                                {t('nutrition_disclaimer_body_1')}
                                {t('nutrition_disclaimer_body_2')}
                            </Text>
                            <Text style={[styles.modalText, { color: "blue" }]} onPress={() => Linking.openURL("https://fdc.nal.usda.gov/")}>
                                • USDA FoodData Central
                            </Text>
                            <Text style={styles.modalText}>
                                {t('nutrition_disclaimer_body_3')}
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowNutritionInfo(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Bar */}
{/*            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.bottomButtonText}>Back</Text>
                </TouchableOpacity>
            </View>*/}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop:0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
    },
    backButton: {
        padding: 5,
    },
    recipeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
    },
    recipeImage: {
        width: "100%",
        height: 250,
        borderRadius: 10,
        marginBottom: 15,
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoText: {
        marginLeft: 5,
        fontSize: 16,
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
    ingredientList: {
        paddingLeft: 10,
        marginTop: 5,
    },
    ingredientItem: {
        fontSize: 16,
        marginVertical: 3,
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
    },
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#000",
        paddingVertical: 12,
    },
    bottomButton: {
        paddingVertical: 10,
    },
    bottomButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#71f2c9", // Semi-transparent background
        justifyContent: "center",
        alignItems: "center",
    },

    loadingBox: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "80%",
    },

    loadingText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        width: "85%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 15,
        marginBottom: 10,
        color: "#000",
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: "#FCE71C",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },

});
