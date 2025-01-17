// BookOfRecipesScreen.tsx
import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { fetchUserRecipes, deleteRecipeById } from "../helpers/databaseHelpers";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function BookOfRecipesScreen() {
    const { user } = useContext(AuthContext);
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
                Alert.alert("Error", "Failed to load recipes.");
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
            Alert.alert("Success", "Recipe deleted successfully.");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert("Error", "Failed to delete recipe.");
        }
    };

    const handleRecipePress = (recipeId: string) => {
        navigation.navigate("RecipeDetail", { recipeId });
    };

    const renderRecipe = ({ item }: any) => (
        <View style={styles.recipeItem}>
            <TouchableOpacity onPress={() => handleRecipePress(item.id)}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecipe(item.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Book of Recipes</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search recipes..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                renderItem={renderRecipe}
                contentContainerStyle={styles.listContainer}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    searchBar: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    recipeItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
    },
    recipeTitle: { fontSize: 18 },
    deleteButton: { padding: 10, backgroundColor: "#ff4d4d", borderRadius: 5 },
    deleteButtonText: { color: "#fff", fontWeight: "bold" },
    listContainer: { paddingBottom: 10 },
    list: { flex: 1 },
});
