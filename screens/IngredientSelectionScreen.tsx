//IngredientsSelectionScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Image
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import categoriesData from "../data/ingredientCategories.json";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import { getTranslation } from "../helpers/loadTranslations";
import { Ionicons } from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";

export default function IngredientSelectionScreen() {
    const { language } = useLanguage(); // Get the selected language
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState<string>(""); // Search state
    const [loading, setLoading] = useState(true);
    const [customIngredient, setCustomIngredient] = useState<string>(""); // Input for new ingredients
    const navigation = useNavigation();

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                // Fetch ingredients from Firestore
                const ingredientSnapshot = await getDocs(collection(db, "ingredients"));
                const fetchedIngredients = ingredientSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Group ingredients under their respective categories
                const groupedCategories = categoriesData.map((category: any) => {
                    const categoryIngredients = fetchedIngredients.filter(
                        (ingredient: any) => ingredient.category === category.id // Match `id` with `category`
                    );

                    return {
                        ...category,
                        ingredients: categoryIngredients, // Attach matching ingredients to the category
                    };
                });

                // Preselect essential ingredients
                const preselected = fetchedIngredients.reduce((acc: any, ingredient: any) => {
                    if (ingredient.isEssential) acc[ingredient.id] = true;
                    return acc;
                }, {});

                setCategories(groupedCategories);
                setFilteredCategories(groupedCategories); // Initially show all categories
                setSelectedIngredients(preselected); // Preselect essential ingredients
                setLoading(false);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId], // Toggle the expanded state
        }));
    };

    // Toggle ingredient selection
    const toggleIngredient = (id: string) => {
        setSelectedIngredients((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Add a custom ingredient to the Miscellaneous category
    const addCustomIngredient = () => {
        if (!customIngredient.trim()) {
            Alert.alert(
                getTranslation(language, "error"),
                getTranslation(language, "enter_valid_ingredient")
            );
            return;
        }

        const newIngredient = {
            id: `custom-${Date.now()}`, // Unique ID for custom ingredient
            name: { [language]: customIngredient },
        };

        // Add to Miscellaneous category
        setCategories((prevCategories) => {
            return prevCategories.map((category) => {
                if (category.id === "miscellaneous") {
                    return {
                        ...category,
                        ingredients: [...category.ingredients, newIngredient],
                    };
                }
                return category;
            });
        });

        setFilteredCategories((prevCategories) => {
            return prevCategories.map((category) => {
                if (category.id === "miscellaneous") {
                    return {
                        ...category,
                        ingredients: [...category.ingredients, newIngredient],
                    };
                }
                return category;
            });
        });

        setSelectedIngredients((prev) => ({
            ...prev,
            [newIngredient.id]: true, // Automatically select the new ingredient
        }));

        setCustomIngredient(""); // Clear input field
    };

    // Reset all selected ingredients
    const handleReset = () => {
        setSelectedIngredients({});
    };

    // Get selected ingredients
    const getSelectedIngredients = () => {
        const selected = [];
        for (const [id, isSelected] of Object.entries(selectedIngredients)) {
            if (isSelected) {
                const ingredient = categories
                    .flatMap((category: any) => category.ingredients)
                    .find((ingredient: any) => ingredient.id === id);
                if (ingredient) selected.push(ingredient.name[language] || ingredient.name.en);
            }
        }
        return selected;
    };

    // Search functionality
    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setFilteredCategories(categories); // Show all categories if query is less than 2 characters
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const filtered = categories
            .map((category) => {
                const matchingIngredients = category.ingredients.filter((ingredient: any) =>
                    (ingredient.name[language] || ingredient.name.en)
                        .toLowerCase()
                        .includes(lowerCaseQuery)
                );
                return matchingIngredients.length > 0
                    ? { ...category, ingredients: matchingIngredients }
                    : null;
            })
            .filter(Boolean);

        setFilteredCategories(filtered as any[]);
    };

    // Render individual ingredient
    const renderIngredient = ({ item }: any) => (
        <View style={styles.ingredientRow}>
            <Switch
                value={!!selectedIngredients[item.id]}
                onValueChange={() => toggleIngredient(item.id)}
            />
            <Text style={styles.ingredientText}>
                {item.name[language] || item.name.en || "Unknown Ingredient"}
            </Text>
        </View>
    );

    const categoryIcons: { [key: string]: any } = {
        "fruits_vegetables": require("../assets/vegetable.png"),
        "proteins": require("../assets/protein.png"),
        "grains_nuts": require("../assets/grain.png"),
        "spices_oils_sauces": require("../assets/spice.png"),
        "dairy": require("../assets/dairy.png"),
        "beverages": require("../assets/beverages.png"),
        "miscellaneous": require("../assets/miscellaneous.png"),
    };
    // Render category
    const renderCategory = ({ item }: any) => {
        const isExpanded = expandedCategories[item.id];

        // Calculate the count of selected ingredients in the category
        const selectedCount = item.ingredients.filter(
            (ingredient: any) => selectedIngredients[ingredient.id]
        ).length;

        return (
            <View key={item.id} style={styles.categoryContainer}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(item.id)}
                >
                    <Text style={styles.categoryTitle}>
                        {item.name[language] || item.name.en || "Unknown Category"} ({selectedCount}
                        /{item.ingredients.length})
                    </Text>
                    <Text style={styles.categoryToggle}>{isExpanded ? "-" : "+"}</Text>
                </TouchableOpacity>
                {isExpanded && (
                    <FlatList
                        data={item.ingredients}
                        keyExtractor={(ingredient) => ingredient.id} // Ensure unique key for ingredients
                        renderItem={renderIngredient}
                    />
                )}
            </View>
        );
    };

    const handleNext = () => {
        const selected = getSelectedIngredients();
        if (selected.length === 0) {
            Alert.alert(
                getTranslation(language, "no_ingredients_selected"),
                getTranslation(language, "please_select_ingredients")
            );
            return;
        }
        navigation.navigate("ApplianceSelection", { selectedIngredients: selected });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{getTranslation(language, "loading")}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} >
            <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{getTranslation(language, "select_ingredients")}</Text>
                <Text style={styles.stepText}>1/3</Text>
            </View>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder={getTranslation(language, "search_ingredients")}
                value={searchQuery}
                onChangeText={handleSearch}
            />
            {/* Add Custom Ingredient */}
            <View style={styles.customIngredientContainer}>
                <TextInput
                    style={styles.customIngredientInput}
                    placeholder={getTranslation(language, "add_custom_ingredient")}
                    value={customIngredient}
                    onChangeText={setCustomIngredient}
                />
                <TouchableOpacity style={styles.addButton} onPress={addCustomIngredient}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isExpanded = expandedCategories[item.id];
                    const selectedCount = item.ingredients.filter((ing: any) => selectedIngredients[ing.id]).length;

                    return (
                        <View style={styles.categoryContainer}>
                            <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(item.id)}>
                                <View style={styles.categoryTitleContainer}>
                                    <Image source={categoryIcons[item.id]} style={styles.categoryImage} />
                                    <Text style={styles.categoryTitle}>
                                        {item.name[language] || item.name.en} ({selectedCount}/{item.ingredients.length})
                                    </Text>
                                </View>
                                <Text style={styles.categoryToggle}>{isExpanded ? "-" : "+"}</Text>
                            </TouchableOpacity>
                            {isExpanded && (
                                <View style={styles.ingredientsContainer}>
                                    {item.ingredients.map((ingredient: any) => (
                                        <TouchableOpacity
                                            key={ingredient.id}
                                            style={styles.ingredientRow}
                                            onPress={() => toggleIngredient(ingredient.id)}
                                        >
                                            <View style={styles.checkboxContainer}>
                                                {selectedIngredients[ingredient.id] ? (
                                                    <Ionicons name="checkmark" size={22} color="black" />
                                                ) : (
                                                    <View style={styles.emptyCheckbox} />
                                                )}
                                            </View>
                                            <Text style={styles.ingredientText}>
                                                {ingredient.name[language] || ingredient.name.en}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}


                        </View>
                    );
                }}
            />
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomButton} onPress={() => setSelectedIngredients({})}>
                    <Text style={styles.bottomButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleNext}>
                    <Text style={styles.bottomButtonText}>Next</Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    stepText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },

    categoryIcon: {
        marginRight: 12,  // More spacing between icon and text
    },

    bottomButton: {
        paddingVertical: 10,
    },
    bottomButtonText: {
        fontSize: 18,
        color: "#fff",
    },
    searchBar: {
        height: 40,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        marginBottom: 10,
    },
    customIngredientContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    customIngredientInput: {
        flex: 1,
        height: 40,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },
    addButton: {
        padding: 10,
        backgroundColor: "#000",
        marginLeft: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    categoryContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    categoryTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1, // Ensures proper spacing
    },

    categoryToggle: {
        fontSize: 22,
        fontWeight: "bold",
    },

    checkbox: {
        fontSize: 22,
        fontWeight: "bold",
        marginRight: 10,
    },

    categoryTitle: {
        fontSize: 20, // Make category title slightly bigger
        fontWeight: "bold",
    },

    ingredientText: {
        fontSize: 18, // Slightly smaller than category name
        fontWeight: "500", // Medium-bold for better visibility
        marginLeft: 10, // Ensures alignment under category name
    },

    ingredientsContainer: {
        marginTop: 5,
        paddingLeft: 10, // Align with category text
    },

    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },

    checkboxContainer: {
        width: 22, // Fixed width so the checkmark does not shift text
        justifyContent: "center",
        alignItems: "center",
    },

    emptyCheckbox: {
        width: 22,
        height: 22,
    },

    categoryImage: {
        width: 30,
        height: 30,
        marginRight: 12,
    },
});
