// ChooseClassicRecipeScreen.ts
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Button,
    Alert,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { fetchRecipeScenario3 } from "../services/openaiService";

export default function ChooseClassicRecipeScreen() {
    const [dishes, setDishes] = useState<any[]>([]);
    const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [customDish, setCustomDish] = useState<string>("");
    const navigation = useNavigation();

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const dishesSnapshot = await getDocs(collection(db, "classicDishes"));
                const fetchedDishes = dishesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDishes(fetchedDishes);
                setFilteredDishes(fetchedDishes);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dishes:", error);
                Alert.alert("Error", "Failed to load classic dishes.");
                setLoading(false);
            }
        };

        fetchDishes();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredDishes(dishes);
        } else {
            setFilteredDishes(
                dishes.filter((dish) =>
                    dish.name.en.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    const handleSelectDish = async (dishName: string) => {
        try {
            const recipe = await fetchRecipeScenario3(dishName);

            // Navigate to RecipeResult with the generated recipe
            navigation.navigate("RecipeResult", { recipe });
        } catch (error) {
            Alert.alert("Error", "Failed to fetch the recipe. Please try again.");
        }
    };

    const renderDish = ({ item }: any) => (
        <TouchableOpacity
            style={styles.dishItem}
            onPress={() => handleSelectDish(item.name.en)}
        >
            <Text style={styles.dishName}>{item.name.en}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading dishes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose a Classic Dish</Text>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search dishes..."
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Custom Dish Input */}
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.customDishInput}
                    placeholder="Type a custom dish name"
                    value={customDish}
                    onChangeText={setCustomDish}
                />
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        customDish.trim() !== "" && styles.confirmButtonActive,
                    ]}
                    onPress={() => handleSelectDish(customDish)}
                    disabled={customDish.trim() === ""}
                >
                    <Text
                        style={[
                            styles.confirmButtonText,
                            customDish.trim() !== "" && styles.confirmButtonTextActive,
                        ]}
                    >
                        Confirm
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Dish List */}
            <FlatList
                data={filteredDishes}
                keyExtractor={(item) => item.id}
                renderItem={renderDish}
            />
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
    searchBar: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    customInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    customDishInput: {
        flex: 1,
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
        backgroundColor: "#ccc",
    },
    confirmButtonActive: {
        backgroundColor: "#4caf50",
    },
    confirmButtonText: {
        fontSize: 16,
        color: "#fff",
    },
    confirmButtonTextActive: {
        color: "#fff",
    },
    dishItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
    },
    dishName: {
        fontSize: 18,
    },
});
