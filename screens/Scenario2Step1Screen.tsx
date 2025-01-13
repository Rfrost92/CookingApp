// Scenario2Step1Screen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Button,
    Alert,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function Scenario2Step1Screen() {
    const [cuisineOptions, setCuisineOptions] = useState<string[]>([
        "any",
        "chinese",
        "japanese",
        "any asian",
        "any european",
        "ukrainian",
    ]);
    const [thematicOptions, setThematicOptions] = useState<string[]>([
        "any",
        "Christmas dinner",
        "Birthday celebration",
        "romantic dinner",
        "business lunch",
    ]);
    const [starIngredientOptions, setStarIngredientOptions] = useState<any[]>([]);
    const [filteredCuisineOptions, setFilteredCuisineOptions] = useState<string[]>([
        "any",
    ]);
    const [filteredThematicOptions, setFilteredThematicOptions] = useState<string[]>(["any"]);
    const [filteredStarIngredients, setFilteredStarIngredients] = useState<any[]>([
        { name: { en: "any" } },
    ]);

    const [selectedCuisine, setSelectedCuisine] = useState<string>("any");
    const [customCuisine, setCustomCuisine] = useState<string>("");
    const [isCustomCuisineSelected, setIsCustomCuisineSelected] = useState<boolean>(false);

    const [selectedThematic, setSelectedThematic] = useState<string>("any");
    const [customThematic, setCustomThematic] = useState<string>("");
    const [isCustomThematicSelected, setIsCustomThematicSelected] = useState<boolean>(false);

    const [selectedStarIngredient, setSelectedStarIngredient] = useState<string>("any");
    const [customStarIngredient, setCustomStarIngredient] = useState<string>("");
    const [isCustomStarIngredientSelected, setIsCustomStarIngredientSelected] =
        useState<boolean>(false);

    const [cuisineSearch, setCuisineSearch] = useState<string>("");
    const [thematicSearch, setThematicSearch] = useState<string>("");
    const [starIngredientSearch, setStarIngredientSearch] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const ingredientSnapshot = await getDocs(collection(db, "ingredients"));
                const fetchedIngredients = ingredientSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const filteredIngredients = [
                    { name: { en: "any" } },
                    ...fetchedIngredients.filter((ingredient) =>
                        ["fruits_vegetables", "proteins"].includes(ingredient.category)
                    ),
                ];

                setStarIngredientOptions(filteredIngredients);
                setFilteredStarIngredients(filteredIngredients);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);

    useEffect(() => {
        setFilteredCuisineOptions(
            cuisineOptions.filter((option) =>
                option.toLowerCase().includes(cuisineSearch.toLowerCase())
            )
        );
    }, [cuisineSearch, cuisineOptions]);

    useEffect(() => {
        setFilteredThematicOptions(
            thematicOptions.filter((option) =>
                option.toLowerCase().includes(thematicSearch.toLowerCase())
            )
        );
    }, [thematicSearch, thematicOptions]);

    useEffect(() => {
        setFilteredStarIngredients(
            starIngredientOptions.filter((ingredient: any) =>
                ingredient.name.en.toLowerCase().includes(starIngredientSearch.toLowerCase())
            )
        );
    }, [starIngredientSearch, starIngredientOptions]);

    const handleReset = () => {
        setSelectedCuisine("any cuisine");
        setCustomCuisine("");
        setIsCustomCuisineSelected(false);
        setCuisineSearch("");

        setSelectedThematic("any");
        setCustomThematic("");
        setIsCustomThematicSelected(false);
        setThematicSearch("");

        setSelectedStarIngredient("any");
        setCustomStarIngredient("");
        setIsCustomStarIngredientSelected(false);
        setStarIngredientSearch("");
    };

    const handleNext = () => {
        const cuisine = isCustomCuisineSelected ? customCuisine : selectedCuisine;
        const thematic = isCustomThematicSelected ? customThematic : selectedThematic;
        const starIngredient = isCustomStarIngredientSelected
            ? customStarIngredient
            : selectedStarIngredient;

        if (!cuisine || !cuisine.trim()) {
            Alert.alert("Cuisine Missing", "Please select or use a custom cuisine.");
            return;
        }

        if (!thematic || !thematic.trim()) {
            Alert.alert("Thematic Missing", "Please select or use a custom thematic.");
            return;
        }

        if (!starIngredient || !starIngredient.trim()) {
            Alert.alert("Star Ingredient Missing", "Please select or use a custom star ingredient.");
            return;
        }

        const selectedData = {
            cuisine,
            thematic,
            starIngredient,
        };

        navigation.navigate("Scenario2Step2", { selectedData });
    };

    const renderChoiceButton = (
        label: string,
        isSelected: boolean,
        onPress: () => void,
        disabled: boolean = false
    ) => (
        <TouchableOpacity
            style={[
                styles.choiceItem,
                isSelected && styles.choiceItemSelected,
                disabled && styles.choiceItemDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Customize Your Recipe</Text>

            {/* Cuisine Selection */}
            <Text style={styles.label}>Cuisine:</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search cuisine..."
                value={cuisineSearch}
                onChangeText={setCuisineSearch}
            />
            <FlatList
                data={filteredCuisineOptions}
                horizontal
                keyExtractor={(item, index) => `${item}-${index}`} // Ensure a unique key
                renderItem={({ item }) =>
                    renderChoiceButton(
                        item,
                        selectedCuisine === item && !isCustomCuisineSelected,
                        () => {
                            setSelectedCuisine(item);
                            setIsCustomCuisineSelected(false);
                        }
                    )
                }
                showsHorizontalScrollIndicator={false}
            />
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Use custom cuisine"
                    value={customCuisine}
                    onChangeText={setCustomCuisine}
                />
                {renderChoiceButton(
                    "Use",
                    isCustomCuisineSelected,
                    () => {
                        setIsCustomCuisineSelected(true);
                        setSelectedCuisine("");
                    },
                    !customCuisine.trim()
                )}
            </View>

            {/* Thematic Selection */}
            <Text style={styles.label}>Thematic:</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search thematic..."
                value={thematicSearch}
                onChangeText={setThematicSearch}
            />
            <FlatList
                data={filteredThematicOptions}
                horizontal
                keyExtractor={(item, index) => `${item}-${index}`} // Ensure a unique key
                renderItem={({ item }) =>
                    renderChoiceButton(
                        item,
                        selectedThematic === item && !isCustomThematicSelected,
                        () => {
                            setSelectedThematic(item);
                            setIsCustomThematicSelected(false);
                        }
                    )
                }
                showsHorizontalScrollIndicator={false}
            />
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Use custom thematic"
                    value={customThematic}
                    onChangeText={setCustomThematic}
                />
                {renderChoiceButton(
                    "Use",
                    isCustomThematicSelected,
                    () => {
                        setIsCustomThematicSelected(true);
                        setSelectedThematic("");
                    },
                    !customThematic.trim()
                )}
            </View>

            {/* Star Ingredient */}
            <Text style={styles.label}>Star Ingredient:</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search star ingredient..."
                value={starIngredientSearch}
                onChangeText={setStarIngredientSearch}
            />
            <FlatList
                data={filteredStarIngredients}
                horizontal
                keyExtractor={(item, index) => `${item}-${index}`} // Ensure a unique key
                renderItem={({ item }) =>
                    renderChoiceButton(
                        item.name.en,
                        selectedStarIngredient === item.name.en && !isCustomStarIngredientSelected,
                        () => {
                            setSelectedStarIngredient(item.name.en);
                            setIsCustomStarIngredientSelected(false);
                        }
                    )
                }
                showsHorizontalScrollIndicator={false}
            />
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Use custom star ingredient"
                    value={customStarIngredient}
                    onChangeText={setCustomStarIngredient}
                />
                {renderChoiceButton(
                    "Use",
                    isCustomStarIngredientSelected,
                    () => {
                        setIsCustomStarIngredientSelected(true);
                        setSelectedStarIngredient("");
                    },
                    !customStarIngredient.trim()
                )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button title="Reset" onPress={handleReset} />
                <Button title="Next" onPress={handleNext} />
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
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    searchBar: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    choiceItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginHorizontal: 5,
    },
    choiceItemSelected: {
        backgroundColor: "#d1f5d3",
        borderColor: "#4caf50",
    },
    choiceItemDisabled: {
        backgroundColor: "#f0f0f0",
        borderColor: "#ccc",
    },
    choiceText: {
        fontSize: 16,
    },
    choiceTextSelected: {
        color: "#4caf50",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        flex: 1,
    },
    customInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});
