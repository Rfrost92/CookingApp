// ChooseClassicRecipeScreen.ts
import React, {useState, useEffect, useContext} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert, Modal, ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { fetchRecipeScenario3 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {containsInappropriateWords, logInappropriateInput} from "../helpers/validator";
import {getTranslation} from "../helpers/loadTranslations";

export default function ChooseClassicRecipeScreen() {
    const { user, isLoggedIn } = useContext(AuthContext);
    const { language } = useLanguage();
    const [dishes, setDishes] = useState<any[]>([]);
    const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [customDish, setCustomDish] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const t = (key: string) => translations[language][key] || key;

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
                Alert.alert(t("error"), t("load_dishes_fail"));
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
                    dish.name[language]?.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    const handleSelectDish = async (dishName: string) => {
        const serializableUser = user ? { uid: user.uid } : null;
        console.log('here');

        if (containsInappropriateWords(dishName.trim())) {
            Alert.alert(
                getTranslation(language, "error"),
                getTranslation(language, "inappropriate_enter_valid_dish")
            );
            await logInappropriateInput(user?.uid, dishName)
            return;
        }
        setIsLoading(true);

        const response = await fetchRecipeScenario3({
            classicDishName: dishName,
            user: serializableUser,
            language: language
        });
        setIsLoading(false); // Hide loading screen

        if (response?.error) {
            if (response.error === "Error: Your input might be inappropriate or invalid. Try a different request.") {
                Alert.alert(
                    t("error"),
                    t("inappropriate"),
                    [{ text: "OK" }]
                );
                await logInappropriateInput(user?.uid, dishName)
                return;
            }
            Alert.alert(
                t("daily_limit_reached"),
                response.error === "Error: Daily request limit reached."
                    ? t("signup_for_free")
                    : t("upgrade_subscription"),
                [{ text: "OK" }]
            );
            return; // Prevent further execution
        }

        const recipe = response.recipe;
        navigation.navigate("RecipeResult", { recipe, image: response.image, classicRecipe: dishName });
    };

    const renderDish = ({ item }: any) => (
        <TouchableOpacity
            style={styles.dishItem}
            onPress={() => handleSelectDish(item.name[language])}
        >
            <Text style={styles.dishName}>{item.name[language]}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{t("loading_dishes")}</Text>
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
                <Text style={styles.title}>{t("choose_classic_dish")}</Text>
                <Text style={styles.stepText}>1/1</Text>
            </View>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder={t("search_dishes_placeholder")}
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Custom Dish Input */}
            <View style={styles.customInputContainer}>
                <TextInput
                    style={styles.customDishInput}
                    placeholder={t("type_custom_dish")}
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
                        {t("confirm")}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Dish List */}
            <FlatList
                data={filteredDishes}
                keyExtractor={(item) => item.id}
                renderItem={renderDish}
                contentContainerStyle={styles.listContent}
            />
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FCE71C" />
                        <Text style={styles.loadingText}>{t("generating_recipe")}</Text>
                        {/* Placeholder for Ad: Future Implementation */}
                        {/* <AdComponent /> */}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    backButton: {
        padding: 5
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    stepText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    searchBar: {
        height: 40,
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    customInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    customDishInput: {
        flex: 1,
        height: 40,
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10,
        backgroundColor: "#ccc",
    },
    confirmButtonActive: {
        backgroundColor: "#FCE71C",
    },
    confirmButtonText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
    confirmButtonTextActive: {
        color: "black",
    },
    dishItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "white",
        marginBottom: 10,
        alignItems: "center",
    },
    dishName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    listContent: {
        paddingBottom: 10,
    },
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "center",
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
    loadingContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
        justifyContent: "center",
        alignItems: "center",
    },

    loadingBox: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "80%",
    },

    loadingText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center"
    }
});
