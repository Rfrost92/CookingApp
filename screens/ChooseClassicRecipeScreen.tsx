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
import {AuthContext, useAuth} from "../contexts/AuthContext";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {containsInappropriateWords, logInappropriateInput} from "../helpers/validator";
import {getTranslation} from "../helpers/loadTranslations";
import PremiumModal from "./PremiumModal";
import PremiumOnlyModal from "./PremiumOnlyModal";
import {BannerAd, BannerAdSize, InterstitialAd, TestIds} from "react-native-google-mobile-ads";

const interstitial = InterstitialAd.createForAdRequest(
    __DEV__
        ? TestIds.INTERSTITIAL
        : 'ca-app-pub-5120112871612534/5030453482',
    {
        requestNonPersonalizedAdsOnly: true,
    }
);

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
    const { subscriptionType } = useAuth();
    const [showPremiumOnlyModal, setShowPremiumOnlyModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

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

    useEffect(() => {
        const unsubscribe = interstitial.addAdEventListener("loaded", () => {
            console.log("Interstitial ad loaded");
        });

        interstitial.load();

        return () => unsubscribe();
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

        if (containsInappropriateWords(dishName.trim())) {
            Alert.alert(t("error"), t("inappropriate_enter_valid_dish"));
            await logInappropriateInput(user?.uid, dishName);
            return;
        }

        setIsLoading(true);

        const response = await fetchRecipeScenario3({
            classicDishName: dishName,
            user: serializableUser,
            language: language
        });

        if (response?.error) {
            setIsLoading(false);

            if (response.error === "Error: Your input might be inappropriate or invalid. Try a different request.") {
                Alert.alert(t("error"), t("inappropriate"));
                await logInappropriateInput(user?.uid, dishName);
                return;
            }

            if (response.error === "Error: Weekly request limit reached.") {
                if (!user) {
                    Alert.alert(
                        t("weekly_limit_reached"),
                        t("signup_to_continue"),
                        [
                            { text: t("ok") },
                            {
                                text: t("log_in"),
                                onPress: () => navigation.navigate("LogIn"),
                            },
                        ]
                    );
                } else {
                    setTimeout(() => setShowPremiumModal(true), 500);
                }
                return;
            }
        }

        const recipe = response.recipe;

        if (subscriptionType !== "premium" && interstitial?.loaded) {
            interstitial.show();

            const unsubscribe = interstitial.addAdEventListener("closed", () => {
                setIsLoading(false); // Hide after ad
                navigation.navigate("RecipeResult", { recipe, image: response.image, classicRecipe: dishName });
                unsubscribe(); // clean up
            });
        } else {
            setIsLoading(false); // Hide immediately if no ad
            navigation.navigate("RecipeResult", { recipe, image: response.image, classicRecipe: dishName });
        }
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
                    onPress={() => {
                        // if (subscriptionType !== "premium") {
                        //     setShowPremiumOnlyModal(true);
                        //     return;
                        // }
                            handleSelectDish(customDish);
                        }
                    }
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
            {/* Banner Ad for non-premium users */}
            {subscriptionType !== "premium" && (
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-5120112871612534/8617871947'}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    />
                </View>
            )}
            <Modal visible={isLoading} transparent={true} animationType="fade">
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FCE71C" />
                        <Text style={styles.loadingText}>{t("generating_recipe")}</Text>

                        {subscriptionType !== "premium" && (
                            <View style={{ marginTop: 20 }}>
                                <BannerAd
                                    unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-5120112871612534/9863977768"}
                                    size={BannerAdSize.LARGE_BANNER}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            <PremiumModal visible={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
            <PremiumOnlyModal visible={showPremiumOnlyModal} onClose={() => setShowPremiumOnlyModal(false)} />
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
    },
    adContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%", // Fully stretched
        paddingVertical: 0,
        paddingHorizontal: 0, // Internal padding for button spacing
        minHeight: 70,
    },
});
