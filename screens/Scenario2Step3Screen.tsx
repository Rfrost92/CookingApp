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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
            if (response.error === "Error: Your input might be inappropriate or invalid. Try a different request.") {
                Alert.alert(
                    t("error"),
                    t("inappropriate"),
                    [{ text: "OK" }]
                );
                return;
            }
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("customize_recipe")}</Text>
                <Text style={styles.stepText}>3/3</Text>
            </View>

            {/* Meal Type Selection */}
            <Text style={styles.label}>{t("meal_type")}</Text>
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
                            style={mealType === type ? styles.choiceTextSelected : styles.choiceText}
                        >
                            {t(type.toLowerCase())}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Dish Type Selection */}
            <Text style={styles.label}>{t("dish_type")}</Text>
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
                            style={dishType === type ? styles.choiceTextSelected : styles.choiceText}
                        >
                            {t(type.toLowerCase().replace(" ", "_"))}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Portions Input */}
            <Text style={styles.label}>{t("number_of_portions")}</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={portions}
                onChangeText={setPortions}
                placeholder={t("e.g. 2")}
            />

            {/* Cooking Time Slider */}
            <Text style={styles.label}>{t("max_cooking_time")} ⏱</Text>
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={120}
                    step={5}
                    value={maxCookingTime}
                    onValueChange={setMaxCookingTime}
                    minimumTrackTintColor="#FCE71C"
                    maximumTrackTintColor="#CCC"
                    thumbTintColor="#FCE71C"
                />
                <Text style={styles.sliderValue}>{maxCookingTime} {t("minutes")}</Text>
            </View>

            {/* Vegan & Vegetarian Options */}
            <View style={styles.dietContainer}>
                <View style={styles.dietRow}>
                    <Text style={styles.dietText}>{t("vegetarian")}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setIsVegetarian((prev) => !prev);
                            setIsVegan(false);
                        }}
                        style={styles.checkBox}
                    >
                        {isVegetarian && <Ionicons name="checkmark" size={22} color="black" />}
                    </TouchableOpacity>
                </View>
                <View style={styles.dietRow}>
                    <Text style={styles.dietText}>{t("vegan")}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setIsVegan((prev) => !prev);
                            setIsVegetarian(false);
                        }}
                        style={styles.checkBox}
                    >
                        {isVegan && <Ionicons name="checkmark" size={22} color="black" />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomButton} onPress={handleReset}>
                    <Text style={styles.bottomButtonText}>{t("reset")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleSubmit}>
                    <Text style={[styles.bottomButtonText, styles.submitButtonText]}>{t("submit")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    backButton: {
        padding: 5
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#71f2c9",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    stepText: {
        fontSize: 18,
        fontWeight: "bold",
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
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        //  borderWidth: 2,
        borderColor: "gray",
        marginHorizontal: 5,
    },
    choiceItemSelected: {
        backgroundColor: "#FCE71C",
        // borderColor: "yellow",
    },
    choiceText: { fontSize: 16, color: "black" },
    choiceTextSelected: { fontSize: 16, fontWeight: "bold", color: "black" },

    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "lightgray",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderValue: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
        // color: "#ffb440", // Orange Text
    },
    checkmarkContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },
    checkmarkItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    checkmarkText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
        marginRight: 8,
    },
    submitButtonText: {
        fontWeight: "bold",
        color: "#FCE71C",
    },
    dietContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },
    dietRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dietText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
        marginRight: 10,
    },
    checkBox: {
        width: 30,
        height: 30,
        backgroundColor: "#FCE71C",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
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
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 35,
    },
    bottomButton: {
        paddingVertical: 10,
    },
    bottomButtonText: {
        fontSize: 18,
        color: "#fff",
    },
});
