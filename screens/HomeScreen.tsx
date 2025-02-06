//HomeScreen.tsx
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from "react-native";
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
            {/* Help Button */}
            <TouchableOpacity style={styles.helpButton} onPress={() => navigation.navigate("HelpScreen")}>
                <Ionicons name="help-circle-outline" size={30} color="#4caf50" />
            </TouchableOpacity>
            <Text style={styles.title}>{t("welcome")}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("IngredientSelection")}>
                <Text style={styles.buttonText}>{t("ingredient_selection")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("Scenario2Step1")}>
                <Text style={styles.buttonText}>{t("open_to_ideas")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleClassicRecipesPress}>
                <Text style={styles.buttonText}>{t("classic_recipes")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} title={t("reset_counter")} onPress={resetNonSignedInCounter} />
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.navButton} onPress={handleAccountPress}>
                    <Text style={styles.navButtonText}>{isLoggedIn ? t("account") : t("login")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={handleRecipeBookPress}>
                    <Text style={styles.navButtonText}>{t("book")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={handleLanguageChange}>
                    <Text style={styles.navButtonText}>{t("language")}</Text>
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
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    helpButton: {
        position: "absolute",
        top: 40,  // Adjust for status bar
        right: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#4caf50",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        width: "100%",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
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
});
