// ChooseClassicRecipeScreen.ts
import React, {useState, useEffect, useContext} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { fetchRecipeScenario3 } from "../services/openaiService";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function ChooseClassicRecipeScreen() {
    const { user, isLoggedIn } = useContext(AuthContext);
    const { language } = useLanguage();
    const [dishes, setDishes] = useState<any[]>([]);
    const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [customDish, setCustomDish] = useState<string>("");
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

        const response = await fetchRecipeScenario3({
            classicDishName: dishName,
            user: serializableUser,
            language: language
        });

        if (response?.error) {
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
        navigation.navigate("RecipeResult", { recipe, image: response.image });
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
        <View style={styles.container}>
            <Text style={styles.title}>{t("choose_classic_dish")}</Text>

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
                contentContainerStyle={styles.listContainer}
                style={styles.list}
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
        marginBottom: 15,
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
        width: "100%",
    },
    dishName: {
        fontSize: 18,
        textAlign: "center",
    },
    listContainer: {
        paddingBottom: 10,
    },
    list: {
        flex: 1,
    },
});
