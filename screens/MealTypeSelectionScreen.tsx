// MealTypeSelectionScreen.tsx
import React, {useContext, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Button,
    Alert,
    Switch,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { fetchRecipeScenario1 } from "../services/openaiService";
import {AuthContext} from "../contexts/AuthContext";

export default function MealTypeSelectionScreen() {
    const { user, isLoggedIn } = useContext(AuthContext);
    const [mealType, setMealType] = useState<string>("Dinner"); // Default: Dinner
    const [dishType, setDishType] = useState<string>("Main Course"); // Default: Main Course
    const [portions, setPortions] = useState<string>("2"); // Default: 2 portions
    const [maxCookingTime, setMaxCookingTime] = useState<number>(60); // Default: 60 minutes
    const [openness, setOpenness] = useState<number>(0); // Default: 0
    const [isVegan, setIsVegan] = useState<boolean>(false);
    const [isVegetarian, setIsVegetarian] = useState<boolean>(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { selectedIngredients, selectedAppliances } = route.params;

    const handleReset = () => {
        setMealType("Dinner");
        setDishType("Main Course");
        setPortions("2");
        setMaxCookingTime(60);
        setOpenness(0);
        setIsVegan(false);
        setIsVegetarian(false);
    };

    const handleVeganChange = (value: boolean) => {
        setIsVegan(value);
        if (value) {
            setIsVegetarian(false); // Unmark Vegetarian if Vegan is selected
        }
    };

    const handleVegetarianChange = (value: boolean) => {
        setIsVegetarian(value);
        if (value) {
            setIsVegan(false); // Unmark Vegan if Vegetarian is selected
        }
    };

    const handleSubmit = async () => {
        if (!portions || isNaN(Number(portions)) || Number(portions) <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid number of portions.");
            return;
        }

        const serializableUser = user ? { uid: user.uid } : null;
        const requestData = {
            selectedIngredients,
            selectedAppliances,
            mealType,
            dishType,
            portions: Number(portions),
            maxCookingTime,
            openness,
            isVegan,
            isVegetarian,
            user: serializableUser,
        };

        const response = await fetchRecipeScenario1(requestData);

        if (response?.error) {
            Alert.alert(
                "Daily Limit Reached",
                response.error === "Error: Daily request limit reached for non-signed-in users."
                    ? "Please sign up for a free account to continue creating recipes."
                    : "You have reached your daily limit. Upgrade your subscription for more requests.",
                [{ text: "OK" }]
            );
        } else {
            const scenario = 1;
            navigation.navigate("RecipeResult", { recipe: response, requestData, scenario });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Customize Your Recipe</Text>

            {/* Meal Type */}
            <Text style={styles.label}>Meal Type:</Text>
            <View style={styles.choiceContainer}>
                {["Breakfast", "Lunch", "Dinner"].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.choiceItem,
                            mealType === type && styles.choiceItemSelected,
                        ]}
                        onPress={() => setMealType(type)}
                    >
                        <Text
                            style={[
                                styles.choiceText,
                                mealType === type && styles.choiceTextSelected,
                            ]}
                        >
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Dish Type */}
            <Text style={styles.label}>Dish Type:</Text>
            <View style={styles.choiceContainer}>
                {["Starter", "Main Course", "Dessert"].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.choiceItem,
                            dishType === type && styles.choiceItemSelected,
                        ]}
                        onPress={() => setDishType(type)}
                    >
                        <Text
                            style={[
                                styles.choiceText,
                                dishType === type && styles.choiceTextSelected,
                            ]}
                        >
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Portions */}
            <Text style={styles.label}>Number of Portions:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={portions}
                onChangeText={setPortions}
                placeholder="Enter number of portions"
            />

            {/* Maximum Cooking Time */}
            <Text style={styles.label}>Maximum Cooking Time (minutes):</Text>
            <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={120}
                step={5}
                value={maxCookingTime}
                onValueChange={setMaxCookingTime}
            />
            <Text style={styles.sliderValue}>{maxCookingTime} min</Text>

            {/* Openness to Additional Ingredients */}
            <Text style={styles.label}>Openness to Additional Ingredients:</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={3}
                step={1}
                value={openness}
                onValueChange={setOpenness}
            />
            <Text style={styles.sliderValue}>
                {["No", "Low", "Medium", "High"][openness]}
            </Text>

            {/* Vegan and Vegetarian */}
            <View style={styles.checkmarkContainer}>
                <View style={styles.checkmarkItem}>
                    <Switch value={isVegan} onValueChange={handleVeganChange} />
                    <Text style={styles.checkmarkText}>Vegan</Text>
                </View>
                <View style={styles.checkmarkItem}>
                    <Switch value={isVegetarian} onValueChange={handleVegetarianChange} />
                    <Text style={styles.checkmarkText}>Vegetarian</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button title="Reset" onPress={handleReset} />
                <Button title="Submit" onPress={handleSubmit} />
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
    choiceContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 15,
    },
    choiceItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },
    choiceItemSelected: {
        backgroundColor: "#d1f5d3",
        borderColor: "#4caf50",
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
        marginBottom: 15,
    },
    slider: {
        width: "100%",
        height: 40,
    },
    sliderValue: {
        textAlign: "center",
        fontSize: 16,
        marginVertical: 5,
    },
    checkmarkContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },
    checkmarkItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkmarkText: {
        marginLeft: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});
