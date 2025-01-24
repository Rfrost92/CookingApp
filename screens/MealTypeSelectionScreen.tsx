// MealTypeSelectionScreen.tsx
import React, { useContext, useState } from "react";
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
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function MealTypeSelectionScreen() {
    const { user } = useContext(AuthContext);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [mealType, setMealType] = useState<string>("Dinner");
    const [dishType, setDishType] = useState<string>("Main Course");
    const [portions, setPortions] = useState<string>("2");
    const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
    const [openness, setOpenness] = useState<number>(0);
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
            setIsVegetarian(false);
        }
    };

    const handleVegetarianChange = (value: boolean) => {
        setIsVegetarian(value);
        if (value) {
            setIsVegan(false);
        }
    };

    const handleSubmit = async () => {
        if (!portions || isNaN(Number(portions)) || Number(portions) <= 0) {
            Alert.alert(t("invalid_input"), t("valid_portions"));
            return;
        }

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
            user: user ? { uid: user.uid } : null,
            language: language
        };

        const response = await fetchRecipeScenario1(requestData);

        if (response?.error) {
            Alert.alert(
                t("daily_limit_reached"),
                response.error === "Error: Daily request limit reached for non-signed-in users."
                    ? t("signup_to_continue")
                    : t("upgrade_subscription"),
                [{ text: "OK" }]
            );
        } else {
            const scenario = 1;
            navigation.navigate("RecipeResult", { recipe: response, requestData, scenario });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("customize_recipe")}</Text>

            <Text style={styles.label}>{t("meal_type")}:</Text>
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
                            {t(type.toLowerCase())}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>{t("dish_type")}:</Text>
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
                            {t(type.toLowerCase().replace(" ", "_"))}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>{t("number_of_portions")}:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={portions}
                onChangeText={setPortions}
                placeholder={t("enter_portions")}
            />

            <Text style={styles.label}>{t("max_cooking_time")}:</Text>
            <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={120}
                step={5}
                value={maxCookingTime}
                onValueChange={setMaxCookingTime}
            />
            <Text style={styles.sliderValue}>{maxCookingTime} {t("minutes")}</Text>

            <Text style={styles.label}>{t("openness_to_ingredients")}:</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={3}
                step={1}
                value={openness}
                onValueChange={setOpenness}
            />
            <Text style={styles.sliderValue}>{t(["no", "low", "medium", "high"][openness])}</Text>

            <View style={styles.checkmarkContainer}>
                <View style={styles.checkmarkItem}>
                    <Switch value={isVegan} onValueChange={handleVeganChange} />
                    <Text style={styles.checkmarkText}>{t("vegan")}</Text>
                </View>
                <View style={styles.checkmarkItem}>
                    <Switch value={isVegetarian} onValueChange={handleVegetarianChange} />
                    <Text style={styles.checkmarkText}>{t("vegetarian")}</Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button title={t("reset")} onPress={handleReset} />
                <Button title={t("submit")} onPress={handleSubmit} />
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
