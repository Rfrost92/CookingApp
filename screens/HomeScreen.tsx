//HomeScreen.tsx
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../contexts/AuthContext";
import { logOut } from "../services/authService";
import { isUserTest, resetNonSignedInCounter, resetRequestsForTestUser } from "../helpers/incrementRequest";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { Ionicons } from '@expo/vector-icons';

const availableLanguages = [
    { code: "en", name: "English" },
    { code: "de", name: "German" },
    { code: "ua", name: "Ukrainian" },
    { code: "ru", name: "Russian" },
];

export default function HomeScreen() {
    const { user, isLoggedIn } = useContext(AuthContext);
    const { language, setLanguage } = useLanguage();
    const navigation = useNavigation();
    const [guestRequests, setGuestRequests] = useState<number>(0);
    const [accountModalVisible, setAccountModalVisible] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [isTestUser, setIsTestUser] = useState<boolean | null>(null);
    const [isLemonMenuVisible, setLemonMenuVisible] = useState(false);

    const t = (key: string) => translations[language][key] || key;

    useEffect(() => {
        const fetchGuestRequests = async () => {
            try {
                const today = new Date().toISOString().split("T")[0];
                const storedData = await AsyncStorage.getItem(`guestRequests-${today}`);
                setGuestRequests(storedData ? parseInt(storedData, 10) : 0);
            } catch (error) {
                console.error("Error fetching guest requests:", error);
            }
        };
        const checkUserTestStatus = async () => {
            if (user && isLoggedIn) {
                try {
                    const testStatus = await isUserTest(user.uid);
                    setIsTestUser(testStatus);
                } catch (error) {
                    console.error("Error checking test user:", error);
                    setIsTestUser(false); // Assume false if error occurs
                }
            }
        };
        checkUserTestStatus();
        fetchGuestRequests();
    }, [user]);

    const handleRequest = async (scenario: string) => {
        try {
            navigation.navigate(scenario);
        } catch (error) {
            Alert.alert(t("unexpected_error"), t("error_message"), [{ text: "OK" }]);
        }
    };

    const handleAccountPress = () => {
        if (isLoggedIn) {
            setAccountModalVisible(true);
        } else {
            navigation.navigate("LogIn");
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
            setAccountModalVisible(false);
            Alert.alert(t("logged_out"), t("logout_success"));
        } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert(t("error"), t("logout_fail"));
        }
    };

    const handleRecipeBookPress = () => {
        if (isLoggedIn) {
            navigation.navigate("BookOfRecipes");
        } else {
            Alert.alert(t("signup_required"), t("recipe_book_access"));
        }
    };

    const handleLanguageChange = () => {
        setLanguageModalVisible(true);
    };

    const selectLanguage = (code: string) => {
        setLanguage(code);
        setLanguageModalVisible(false);
        Alert.alert(t("language_changed"), `${t("selected_language")} ${availableLanguages.find(lang => lang.code === code)?.name}`);
    };

    const handleClassicRecipesPress = () => {
        if (isLoggedIn) {
            navigation.navigate("ChooseClassicRecipe");
        } else {
            Alert.alert(t("signup_required"), t("classic_recipes_access"));
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("welcome")}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("IngredientSelection")}>
                <Ionicons name="cart-outline" style={styles.buttonIcon} color="gold" />
                <Text style={styles.buttonText}>{t("ingredient_selection")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleRequest("Scenario2Step1")}>
                <Ionicons name="star-outline" style={styles.buttonIcon} color="gold" />
                <Text style={styles.buttonText}>{t("open_to_ideas")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleClassicRecipesPress}>
                <Ionicons name="restaurant-outline" style={styles.buttonIcon} color="gold" />
                <Text style={styles.buttonText}>{t("classic_recipes")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} title={t("reset_counter")} onPress={resetNonSignedInCounter} />
            {isLemonMenuVisible && (
                <View style={styles.lemonMenu}>
                    {/* Account/Login Button */}
                    <TouchableOpacity style={styles.lemonMenuItem} onPress={handleAccountPress}>
                        <Text style={styles.lemonMenuText}>{isLoggedIn ? t("account") : t("login")}</Text>
                    </TouchableOpacity>

                    {/* Help Button */}
                    <TouchableOpacity style={styles.lemonMenuItem} onPress={() => navigation.navigate("HelpScreen")}>
                        <Text style={styles.lemonMenuText}>{t("help")}</Text>
                    </TouchableOpacity>

                    {/* Home Button (Only visible when NOT on Home) */}
                    {navigation.getState().index !== 0 && (
                        <TouchableOpacity style={styles.lemonMenuItem} onPress={() => navigation.navigate("Home")}>
                            <Text style={styles.lemonMenuText}>{t("home")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <View style={styles.bottomBar}>
                {/* Lemon Button */}
                <TouchableOpacity style={styles.lemonButton} onPress={() => setLemonMenuVisible(!isLemonMenuVisible)}>
                    <Image source={require("../assets/favicon.png")} style={styles.lemonIcon} />
                </TouchableOpacity>

                {/* Recipe Book Icon */}
                <TouchableOpacity style={styles.navButton} onPress={handleRecipeBookPress}>
                    <Ionicons name="book-outline" size={28} color="white" />
                </TouchableOpacity>

                {/* Language Selection (Current Language Code) */}
                <TouchableOpacity style={styles.navButton} onPress={handleLanguageChange}>
                    <Text style={styles.languageCode}>{language.toUpperCase()}</Text>
                </TouchableOpacity>
            </View>

            {/* Account Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={accountModalVisible}
                onRequestClose={() => setAccountModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("account_menu")}</Text>
                        <Text style={styles.modalText}>{t("welcome_user")} { user?.email || t("user") }</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                            <Text style={styles.modalButtonText}>{t("logout")}</Text>
                        </TouchableOpacity>
                        {isTestUser && (
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#ff9800" }]}
                                onPress={async () => {
                                    try {
                                        await resetRequestsForTestUser(user?.uid);
                                        Alert.alert(t("success"), t("request_reset_success"));
                                    } catch (error) {
                                        Alert.alert(t("error"), t("request_reset_fail"));
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>{t("reset_requests")}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.modalButton} onPress={() => setAccountModalVisible(false)}>
                            <Text style={styles.modalButtonText}>{t("close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Language Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("select_language")}</Text>
                        <FlatList
                            data={availableLanguages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        language === item.code && styles.languageOptionSelected,
                                    ]}
                                    onPress={() => selectLanguage(item.code)}
                                >
                                    <Text style={styles.languageText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={styles.modalButtonText}>{t("close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        backgroundColor: "#71f2c9", // Light mint green
    },
    helpButton: {
        position: "absolute",
        top: 40,  // Adjust for status bar
        right: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 22,  // Reduce font size
        fontWeight: "bold",
        color: "#000",
        textAlign: "left",
        width: "85%",  // Reduce width slightly
        marginTop: 40,  // Increased spacing
        marginBottom: 20,  // Added bottom spacing
    },

    subtitle: {
        fontSize: 18,
        color: "#333",
        marginBottom: 20,
        textAlign: "left",
        width: "90%",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 15,
        width: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 12,
        fontSize: 28,  // Increase icon size
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        flexShrink: 1,  // Ensures text wraps instead of overflowing
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",  // Ensure equal spacing
        position: "absolute",
        bottom: 0,
        width: "100%",  // Ensure it stretches full width
        backgroundColor: "#000",  // Black background
        paddingVertical: 12,
        paddingHorizontal: 25,
    },
    navButton: {
        flex: 1,
        alignItems: "center",
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#4caf50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    languageOption: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginVertical: 5,
        width: "100%",
        alignItems: "center",
    },
    languageOptionSelected: {
        backgroundColor: "#d1f5d3",
        borderColor: "#4caf50",
    },
    languageText: {
        fontSize: 16,
    },
    languageCode: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    lemonButton: {
        flex: 1, // Same as other buttons
        alignItems: "center",
    },
    lemonIcon: {
        width: 35,
        height: 35,
        resizeMode: "contain",
    },

    lemonMenu: {
        position: "absolute",
        bottom: 60,
        left: 10,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

    lemonMenuItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },

    lemonMenuText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
