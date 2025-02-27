import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from "react-native";
import { fetchUserRecipes, deleteRecipeById } from "../helpers/recipeHelpers";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookOfRecipesScreen() {
    const { user } = useContext(AuthContext);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [recipes, setRecipes] = useState<any[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const navigation = useNavigation();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const userRecipes = await fetchUserRecipes(user?.uid);
                setRecipes(userRecipes);
                setFilteredRecipes(userRecipes);
            } catch (error) {
                console.error("Error fetching recipes:", error);
                Alert.alert(t("error"), t("failed_to_load_recipes"));
            }
        };

        fetchRecipes();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredRecipes(recipes);
        } else {
            setFilteredRecipes(
                recipes.filter((recipe) =>
                    recipe.title.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    const handleDeleteRecipe = async (recipeId: string) => {
        try {
            await deleteRecipeById(recipeId);
            setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
            setFilteredRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
            Alert.alert(t("success"), t("recipe_deleted"));
        } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert(t("error"), t("failed_to_delete_recipe"));
        }
    };

    const handleRecipePress = (recipeId: string) => {
        navigation.navigate("RecipeDetail", { recipeId });
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Title Bar with Back Button */}
            <View style={styles.titleBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>

                <Text style={styles.title}>{t("book_of_recipes")}</Text>
            </View>

            <View style={styles.container}>
                {/* Search Bar */}
                <TextInput
                    style={styles.searchBar}
                    placeholder={t("search_recipes")}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />

                {/* Recipe List */}
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={filteredRecipes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.recipeButton}
                            onPress={() => handleRecipePress(item.id)}
                        >
                            <Image source={{ uri: item.imageURL }} style={styles.recipeThumbnail} />
                            <Text style={styles.recipeTitle}>
                                {item.title.length > 100 ? item.title.substring(0, 100) + "..." : item.title}
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteRecipe(item.id)}
                            >
                                <Ionicons name="trash-outline" size={22} color="white" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContainer}
                    style={styles.list}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#71f2c9", // Consistent mint green background
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 10,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    searchBar: {
        height: 45,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        backgroundColor: "white",
        marginBottom: 15,
    },
    recipeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 10,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    recipeThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flexShrink: 1,
        flex: 1,
        color: "#000",
    },
    deleteButton: {
        backgroundColor: "#ff4d4d",
        padding: 10,
        borderRadius: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    list: {
        flex: 1,
    },
});
