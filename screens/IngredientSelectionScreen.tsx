//IngredientsSelectionScreen.tsx
import React, {useContext, useEffect, useState} from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Image, ActivityIndicator
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import categoriesData from "../data/ingredientCategories.json";
import {useNavigation, useRoute} from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import { getTranslation } from "../helpers/loadTranslations";
import { Ionicons } from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {containsInappropriateWords, logInappropriateInput} from "../helpers/validator";
import {AuthContext, useAuth} from "../contexts/AuthContext";
import PremiumOnlyModal from "./PremiumOnlyModal";
import {fetchIngredientsFromImage} from "../services/openaiService";
import * as ImagePicker from "expo-image-picker";
import PremiumOnlyDetectionModal from "./PremiumOnlyDetectionModal";

export default function IngredientSelectionScreen() {
    const { language } = useLanguage(); // Get the selected language
    const [categories, setCategories] = useState<any[]>([]);
    const { user, isLoggedIn } = useContext(AuthContext);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState<string>(""); // Search state
    const [loading, setLoading] = useState(true);
    const [customIngredient, setCustomIngredient] = useState<string>(""); // Input for new ingredients
    const navigation = useNavigation();
    const { subscriptionType } = useAuth();
    const [showPremiumOnlyModal, setShowPremiumOnlyModal] = useState(false);
    const [showPremiumDetectionModal, setShowPremiumDetectionModal] = useState(false);
    const [showDetectedModal, setShowDetectedModal] = useState(false);
    const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
    const [selectedDetected, setSelectedDetected] = useState<{ [key: string]: boolean }>({});
    const [analyzingPhoto, setAnalyzingPhoto] = useState(false);

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
    const addCustomIngredient = async () => {
        if (subscriptionType !== "premium") {
            setShowPremiumOnlyModal(true);
            return;
        }
        if (!customIngredient.trim()) {
            Alert.alert(
                getTranslation(language, "error"),
                getTranslation(language, "enter_valid_ingredient")
            );
            return;
        }
        if (containsInappropriateWords(customIngredient.trim())) {
            Alert.alert(
                getTranslation(language, "error"),
                getTranslation(language, "inappropriate_enter_valid_ingredient")
            );
            await logInappropriateInput(user?.uid, customIngredient.trim())
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

    const handleTakePhoto = async () => {
        console.warn(`[User Click] Camera ingredients | ${user?.email || user?.uid || "Anonymous"}`);
        if (subscriptionType !== "premium") {
            setShowPremiumDetectionModal(true);
            return;
        }

        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(getTranslation(language, "permission_required"), getTranslation(language, "camera_access_required"));
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.6,
                base64: true,
            });

            if (!result.canceled && result.assets?.[0]?.base64) {
                const asset = result.assets?.[0];
                const base64Image = asset?.base64;

                if (!base64Image) {
                    Alert.alert(getTranslation(language, "image_error"), getTranslation(language, "failed_photo"))
                    return;
                }

                setAnalyzingPhoto(true);
                const visionResponse = await fetchIngredientsFromImage(base64Image, language);
                setAnalyzingPhoto(false);

                const newIngs = visionResponse.ingredients;
                const initialSelection = Object.fromEntries(newIngs.map(ing => [ing, true]));

                setDetectedIngredients(newIngs);
                setSelectedDetected(initialSelection);
                setShowDetectedModal(true);
            } else {
                Alert.alert(getTranslation(language, "no_ingredients"), getTranslation(language, "try_clearer_photo"))
            }
        } catch (err) {
            console.error("Camera/photo error:", err);
            Alert.alert(getTranslation(language, "error"), getTranslation(language, "camera_error"))
        }
    };

    const handleAddDetectedIngredients = () => {
        const toAdd = detectedIngredients.filter(ing => selectedDetected[ing]);
        const newSelected = { ...selectedIngredients };

        const deepCopy = (arr: any[]) => JSON.parse(JSON.stringify(arr));
        const updatedCategories = deepCopy(categories);
        const updatedFiltered = deepCopy(filteredCategories);

        // Build map of all ingredient names
        const existingMap: { [lowerName: string]: { id: string } } = {};
        for (const cat of updatedCategories) {
            for (const ing of cat.ingredients) {
                const name = (ing.name[language] || ing.name.en)?.toLowerCase();
                if (name) existingMap[name] = ing;
            }
        }

        console.log('existing', existingMap);
        let timestamp = Date.now();

        toAdd.forEach((ingName, idx) => {
            const lower = ingName.toLowerCase();

            // Select if exists
            if (existingMap[lower]) {
                newSelected[existingMap[lower].id] = true;
                return;
            }

            // Create new ingredient
            const newIng = {
                id: `photo-${timestamp}-${idx}`,
                name: { [language]: ingName },
            };

            // Add only to Miscellaneous in each structure
            for (const target of [updatedCategories, updatedFiltered]) {
                const misc = target.find(c => c.id === "miscellaneous");
                if (misc) {
                    misc.ingredients.push(newIng);
                }
            }


            newSelected[newIng.id] = true;
        });

        setCategories(updatedCategories);
        setFilteredCategories(updatedFiltered);
        setSelectedIngredients(newSelected);
        setShowDetectedModal(false);
    };



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
                    <Text style={styles.addButtonText}>{getTranslation(language, "add")}</Text>
                </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
                style={styles.flatlist}
                showsVerticalScrollIndicator={false}
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
                    <Text style={styles.bottomButtonText}>{getTranslation(language, "reset")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={32} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleNext}>
                    <Text style={styles.bottomButtonText}>{getTranslation(language, "next")}</Text>
                </TouchableOpacity>
            </View>
            <PremiumOnlyModal visible={showPremiumOnlyModal} onClose={() => setShowPremiumOnlyModal(false)} />
            <PremiumOnlyDetectionModal visible={showPremiumDetectionModal} onClose={() => setShowPremiumDetectionModal(false)} />
            {showDetectedModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{getTranslation(language, "detected_ingredients")}</Text>
                        {detectedIngredients.map((ingredient) => (
                            <TouchableOpacity
                                key={ingredient}
                                style={styles.ingredientRow}
                                onPress={() =>
                                    setSelectedDetected(prev => ({
                                        ...prev,
                                        [ingredient]: !prev[ingredient],
                                    }))
                                }
                            >
                                <View style={styles.checkboxContainer}>
                                    {selectedDetected[ingredient] ? (
                                        <Ionicons name="checkmark" size={22} color="black" />
                                    ) : (
                                        <View style={styles.emptyCheckbox} />
                                    )}
                                </View>
                                <Text style={styles.ingredientText}>{ingredient}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.addSelectedButton}
                            onPress={handleAddDetectedIngredients}
                        >
                            <Text style={styles.addSelectedText}>{getTranslation(language, "add_selected")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {analyzingPhoto && (
                <View style={styles.modalOverlay}>
                    <View style={styles.analyzingModal}>
                        <Text style={styles.analyzingText}>{getTranslation(language, "analyzing_image")}</Text>
                        <ActivityIndicator size="large" color="#000" style={{ marginTop: 10 }} />
                    </View>
                </View>
            )}
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
        // borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        marginBottom: 10,
    },
    customIngredientContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    customIngredientInput: {
        flex: 1,
        height: 40,
        borderColor: "#000",
        // borderWidth: 1,
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
      //  shadowColor: "#000",
      //  shadowOffset: { width: 0, height: 2 },
      //  shadowOpacity: 0.1,
       // shadowRadius: 4,
    },

    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    categoryTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
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
        fontSize: 20,
        fontWeight: "bold",
        flexShrink: 1,
        flexWrap: "wrap"
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
    photoButton: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 30,
        marginBottom: 5,
    },
    modalOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "100%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    addButtonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 20,
    },

    addSelectedButton: {
        backgroundColor: "#71f2c9", // your mint green
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },

    addSelectedText: {
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
    },
    analyzingModal: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 200,
    },
    analyzingText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    flatlist: {
        marginBottom: 20,
    }
});
