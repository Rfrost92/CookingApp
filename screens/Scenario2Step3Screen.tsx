// Scenario2Step3Screen.ts
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
import { fetchRecipeScenario2 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import translations from "../data/translations.json";
import { useLanguage } from "../services/LanguageContext";

export default function Scenario2Step3Screen() {
    const { user } = useContext(AuthContext);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [mealType, setMealType] = useState<string>("Dinner");
    const [dishType, setDishType] = useState<string>("Main Course");
    const [portions, setPortions] = useState<string>("2");
    const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
    const [isVegan, setIsVegan] = useState<boolean>(false);
    const [isVegetarian, setIsVegetarian] = useState<boolean>(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { selectedData, selectedAppliances } = route.params;

    const handleReset = () => {
        setMealType("Dinner");
        setDishType("Main Course");
        setPortions("2");
        setMaxCookingTime(60);
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
            Alert.alert(t("invalid_input"), t("enter_valid_portions"));
            return;
        }

        const serializableUser = user ? { uid: user.uid } : null;
        const requestData = {
            ...selectedData,
            selectedAppliances,
            mealType,
            dishType,
            portions: Number(portions),
            maxCookingTime,
            isVegan,
            isVegetarian,
            user: serializableUser,
            language
        };

        const response = await fetchRecipeScenario2(requestData);

        if (response?.error) {
            Alert.alert(
                t("daily_limit_reached"),
                response.error === "Error: Daily request limit reached."
                    ? t("signup_to_continue")
                    : t("upgrade_for_more"),
                [{ text: t("ok") }]
            );
            return; // **Prevent further execution**
        }

        const scenario = 2;
        const recipe = response.recipe;
        navigation.navigate("RecipeResult", { recipe, requestData, scenario, image: response.image });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("customize_recipe")}</Text>

            {/* Meal Type */}
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

            {/* Dish Type */}
            <Text style={styles.label}>{t("dish_type")}:</Text>
            <View style={styles.choiceContainer}>
                {["Starter", "Main_Course", "Dessert"].map((type) => (
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
                            {t(type.toLowerCase())}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Portions */}
            <Text style={styles.label}>{t("portions")}:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={portions}
                onChangeText={setPortions}
                placeholder={t("enter_portions")}
            />

            {/* Maximum Cooking Time */}
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

            {/* Vegan and Vegetarian */}
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

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button title={t("reset")} onPress={handleReset} />
                <Button title={t("submit")} onPress={handleSubmit} />
            </View>
            {!user && (
                <View style={styles.agreementContainer}>
                    <Text style={styles.agreementText}>
                        {t("by_clicking_submit")}
                        <Text style={styles.linkText} onPress={() => navigation.navigate("HelpScreen")}>
                            {t("terms_of_use")}
                        </Text>
                        {t("comma")}
                        <Text style={styles.linkText} onPress={() => navigation.navigate("HelpScreen")}>
                            {t("privacy_policy")}
                        </Text>
                        {t("and")}
                        <Text style={styles.linkText} onPress={() => navigation.navigate("HelpScreen")}>
                            {t("disclaimer")}
                        </Text>.
                    </Text>
                </View>
            )}
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
    agreementContainer: {
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    agreementText: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
    },
    linkText: {
        color: "#007BFF",
        textDecorationLine: "underline",
    },
});
