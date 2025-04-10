// Scenario2Step1Screen.tsx
import React, {useContext, useEffect, useState} from "react";
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
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {containsInappropriateWords, logInappropriateInput} from "../helpers/validator";
import {getTranslation} from "../helpers/loadTranslations";
import {AuthContext, useAuth} from "../contexts/AuthContext";
import PremiumModal from "./PremiumModal";
import PremiumOnlyModal from "./PremiumOnlyModal";
import {BannerAd, BannerAdSize, TestIds} from "react-native-google-mobile-ads";

export default function Scenario2Step1Screen() {
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key ||'';
    const { subscriptionType } = useAuth();
    const [showPremiumOnlyModal, setShowPremiumOnlyModal] = useState(false);

    const [cuisineOptions, setCuisineOptions] = useState<string[]>([
        t("any"),
        t("chinese"),
        t("japanese"),
        t("any_asian"),
        t("any_european"),
        t("ukrainian"),
    ]);
    const [thematicOptions, setThematicOptions] = useState<string[]>([
        t("any"),
        t("christmas_dinner"),
        t("birthday_celebration"),
        t("romantic_dinner"),
        t("business_lunch"),
    ]);
    const [starIngredientOptions, setStarIngredientOptions] = useState<any[]>([]);
    const [filteredCuisineOptions, setFilteredCuisineOptions] = useState<string[]>([
        t("any"),
    ]);
    const [filteredThematicOptions, setFilteredThematicOptions] = useState<string[]>([t("any")]);
    const [filteredStarIngredients, setFilteredStarIngredients] = useState<any[]>([
        { name: { [language]: t("any") } },
    ]);

    const [selectedCuisine, setSelectedCuisine] = useState<string>(t("any"));
    const [customCuisine, setCustomCuisine] = useState<string>("");
    const [isCustomCuisineSelected, setIsCustomCuisineSelected] = useState<boolean>(false);

    const [selectedThematic, setSelectedThematic] = useState<string>(t("any"));
    const [customThematic, setCustomThematic] = useState<string>("");
    const [isCustomThematicSelected, setIsCustomThematicSelected] = useState<boolean>(false);

    const [selectedStarIngredient, setSelectedStarIngredient] = useState<string>(t("any"));
    const [customStarIngredient, setCustomStarIngredient] = useState<string>("");
    const [isCustomStarIngredientSelected, setIsCustomStarIngredientSelected] =
        useState<boolean>(false);

    const [cuisineSearch, setCuisineSearch] = useState<string>("");
    const [thematicSearch, setThematicSearch] = useState<string>("");
    const [starIngredientSearch, setStarIngredientSearch] = useState<string>("");

    const { user, isLoggedIn } = useContext(AuthContext);

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
                    { name: { [language]: t("any") } },
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
    }, [language]);

    useEffect(() => {
        setFilteredCuisineOptions(
            cuisineOptions.filter((option) =>
                option?.toLowerCase()?.includes(cuisineSearch.toLowerCase())
            )
        );
    }, [cuisineSearch, cuisineOptions]);

    useEffect(() => {
        setFilteredThematicOptions(
            thematicOptions.filter((option) =>
                option?.toLowerCase()?.includes(thematicSearch.toLowerCase())
            )
        );
    }, [thematicSearch, thematicOptions]);

    useEffect(() => {
        setFilteredStarIngredients(
            starIngredientOptions.filter((ingredient: any) =>
                ingredient?.name?.[language]?.toLowerCase()?.includes(starIngredientSearch.toLowerCase())
            )
        );
    }, [starIngredientSearch, starIngredientOptions, language]);

    const handleReset = () => {
        setSelectedCuisine(t("any"));
        setCustomCuisine("");
        setIsCustomCuisineSelected(false);
        setCuisineSearch("");

        setSelectedThematic(t("any"));
        setCustomThematic("");
        setIsCustomThematicSelected(false);
        setThematicSearch("");

        setSelectedStarIngredient(t("any"));
        setCustomStarIngredient("");
        setIsCustomStarIngredientSelected(false);
        setStarIngredientSearch("");
    };

    const handleNext = async () => {
        const cuisine = isCustomCuisineSelected ? customCuisine : selectedCuisine;
        const thematic = isCustomThematicSelected ? customThematic : selectedThematic;
        const starIngredient = isCustomStarIngredientSelected
            ? customStarIngredient
            : selectedStarIngredient;

        if (!cuisine || !cuisine.trim()) {
            Alert.alert(t("cuisine_missing"), t("select_or_custom_cuisine"));
            return;
        }

        if (!thematic || !thematic.trim()) {
            Alert.alert(t("thematic_missing"), t("select_or_custom_thematic"));
            return;
        }

        if (!starIngredient || !starIngredient.trim()) {
            Alert.alert(t("star_ingredient_missing"), t("select_or_custom_star_ingredient"));
            return;
        }

        if (containsInappropriateWords(cuisine.trim()) || containsInappropriateWords(thematic.trim()) || containsInappropriateWords(starIngredient.trim())) {
            Alert.alert(
                getTranslation(language, "error"),
                getTranslation(language, "inappropriate_enter_valid")
            );
            await logInappropriateInput(user?.uid, cuisine.trim() + ', ' + thematic.trim() + ', ' + starIngredient.trim())
            return;
        }

        const selectedData = {
            cuisine,
            thematic,
            starIngredient,
        };

        navigation.navigate("ApplianceSelection", { selectedData });
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
                <Text style={styles.title}>{t("loading")}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("customize_recipe")}</Text>
                <Text style={styles.stepText}>1/3</Text>
            </View>

            {/* Cuisine Selection */}
            <Text style={styles.label}>{t("cuisine")}:</Text>
            <View style={styles.choiceSearchBox}>
            <TextInput
                style={styles.searchBar}
                placeholder={t("search_cuisine")}
                value={cuisineSearch}
                onChangeText={setCuisineSearch}
            />
            <FlatList style={styles.customFlatlist}
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
            </View>
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t("custom_cuisine")}
                    value={customCuisine}
                    onChangeText={setCustomCuisine}
                />
                {renderChoiceButton(
                    t("use"),
                    isCustomCuisineSelected,
                    () => {
                        if (subscriptionType !== "premium") {
                            setShowPremiumOnlyModal(true);
                            return;
                        }
                        setIsCustomCuisineSelected(true);
                        setSelectedCuisine("");
                    },
                    !customCuisine.trim()
                )}
            </View>

            {/* Thematic Selection */}
            <Text style={styles.label}>{t("thematic")}:</Text>
            <View style={styles.choiceSearchBox}>
            <TextInput
                style={styles.searchBar}
                placeholder={t("search_thematic")}
                value={thematicSearch}
                onChangeText={setThematicSearch}
            />
            <FlatList style={styles.customFlatlist}
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
            </View>
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t("custom_thematic")}
                    value={customThematic}
                    onChangeText={setCustomThematic}
                />
                {renderChoiceButton(
                    t("use"),
                    isCustomThematicSelected,
                    () => {
                        if (subscriptionType !== "premium") {
                            setShowPremiumOnlyModal(true);
                            return;
                        }
                        setIsCustomThematicSelected(true);
                        setSelectedThematic("");
                    },
                    !customThematic.trim()
                )}
            </View>

            {/* Star Ingredient */}
            <Text style={styles.label}>{t("star_ingredient")}:</Text>
            <View style={styles.choiceSearchBox}>
            <TextInput
                style={styles.searchBar}
                placeholder={t("search_star_ingredient")}
                value={starIngredientSearch}
                onChangeText={setStarIngredientSearch}
            />
            <FlatList style={styles.customFlatlist}
                data={filteredStarIngredients}
                horizontal
                keyExtractor={(item, index) => `${item}-${index}`} // Ensure a unique key
                renderItem={({ item }) =>
                    renderChoiceButton(
                        item.name[language],
                        selectedStarIngredient === item.name[language] && !isCustomStarIngredientSelected,
                        () => {
                            setSelectedStarIngredient(item.name[language]);
                            setIsCustomStarIngredientSelected(false);
                        }
                    )
                }
                showsHorizontalScrollIndicator={false}
            />
            </View>
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t("custom_star_ingredient")}
                    value={customStarIngredient}
                    onChangeText={setCustomStarIngredient}
                />
                {renderChoiceButton(
                    t("use"),
                    isCustomStarIngredientSelected,
                    () => {
                        if (subscriptionType !== "premium") {
                            setShowPremiumOnlyModal(true);
                            return;
                        }
                        setIsCustomStarIngredientSelected(true);
                        setSelectedStarIngredient("");
                    },
                    !customStarIngredient.trim()
                )}
            </View>

            {/* Banner Ad for non-premium users */}
            {subscriptionType !== "premium" && (
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-5120112871612534~2963819076'}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    />
                </View>
            )}
            {/* Bottom Navigation */}
            <View style={styles.bottomBar}>
                {/* Reset Button - Replaces Back Button */}
                <TouchableOpacity style={styles.bottomButton} onPress={handleReset}>
                    <Text style={styles.bottomButtonText}>{t("reset")}</Text>
                </TouchableOpacity>

                {/* Next Button - Now White Instead of Yellow */}
                <TouchableOpacity style={styles.bottomButton} onPress={handleNext}>
                    <Text style={styles.bottomButtonText}>{t("next")}</Text>
                </TouchableOpacity>
            </View>
            <PremiumOnlyModal visible={showPremiumOnlyModal} onClose={() => setShowPremiumOnlyModal(false)} />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#71f2c9",
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
    searchBar: {
        height: 40,
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    choiceItem: {
        backgroundColor: "white",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderColor: "gray",
        marginHorizontal: 4,
        minHeight: 40,
        maxHeight: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    choiceItemSelected: {
        backgroundColor: "#FCE71C",
    },
    choiceText: {
        fontSize: 14,
        color: "black",
    },
    choiceTextSelected: {
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
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
    submitButtonText: {
        fontWeight: "bold",
        color: "#FCE71C",
    },
    choiceItemDisabled: {
        backgroundColor: "#f0f0f0",
        borderColor: "#ccc",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    customFlatlist: {
        marginBottom: 5,  // Reduce space after slider
    },
    choiceSearchBox: {
    },
    customInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,  // Ensures spacing remains balanced
        marginTop: 5,  // Bring it closer
    },
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        flex: 1,
        marginRight: 10,  // Ensure spacing from "Use" button
    },
    useButton: {
        backgroundColor: "black",  // Default black
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    useButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    useButtonDisabled: {
        backgroundColor: "#ccc", // Light gray when disabled
    },
    useButtonSelected: {
        backgroundColor: "#FCE71C", // Yellow when selected
    },
    adContainer: {
        width: "100%",
        alignItems: "center",
        backgroundColor: "#71f2c9",
        paddingBottom: 15,
    },

});
