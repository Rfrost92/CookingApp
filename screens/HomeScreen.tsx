//HomeScreen.tsx
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../contexts/AuthContext";
import { logOut } from "../services/authService";
import { isUserTest, resetNonSignedInCounter, resetRequestsForTestUser } from "../helpers/incrementRequest";
import { useLanguage } from "../services/LanguageContext";

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

        fetchGuestRequests();
    }, []);

    const handleRequest = async (scenario: string) => {
        try {
            navigation.navigate(scenario);
        } catch (error) {
            Alert.alert("Unexpected error occurred", "There is an error", [{ text: "OK" }]);
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
            Alert.alert("Logged Out", "You have been logged out successfully.");
        } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
        }
    };

    const handleRecipeBookPress = () => {
        if (isLoggedIn) {
            navigation.navigate("BookOfRecipes");
        } else {
            Alert.alert("Sign Up Required", "Please log in or sign up to access your recipe book.");
        }
    };

    const handleLanguageChange = () => {
        setLanguageModalVisible(true);
    };

    const selectLanguage = (code: string) => {
        setLanguage(code);
        setLanguageModalVisible(false);
        Alert.alert("Language Changed", `You have selected ${availableLanguages.find(lang => lang.code === code)?.name}.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Cooking App</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("IngredientSelection")}>
                <Text style={styles.buttonText}>
                    I would like to cook something from the ingredients available at home
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("Scenario2Step1")}>
                <Text style={styles.buttonText}>
                    I am open to new ideas, I want to cook something from any ingredients
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleRequest("ChooseClassicRecipe")}>
                <Text style={styles.buttonText}>Classic recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} title="Reset Non-Signed-In Counter" onPress={resetNonSignedInCounter} />
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.navButton} onPress={handleAccountPress}>
                    <Text style={styles.navButtonText}>{isLoggedIn ? "Account" : "Log In"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={handleRecipeBookPress}>
                    <Text style={styles.navButtonText}>Book</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={handleLanguageChange}>
                    <Text style={styles.navButtonText}>Language</Text>
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
                        <Text style={styles.modalTitle}>Account Menu</Text>
                        <Text style={styles.modalText}>Welcome, {user?.email || "User"}!</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                            <Text style={styles.modalButtonText}>Log Out</Text>
                        </TouchableOpacity>
                        {user && isUserTest(user) && (
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#ff9800" }]}
                                onPress={async () => {
                                    try {
                                        await resetRequestsForTestUser(user?.uid);
                                        Alert.alert("Success", "Request count has been reset for today.");
                                    } catch (error) {
                                        Alert.alert("Error", error.message || "Failed to reset request count.");
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>Reset Requests</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.modalButton} onPress={() => setAccountModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Close</Text>
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
                        <Text style={styles.modalTitle}>Select Language</Text>
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
                            <Text style={styles.modalButtonText}>Close</Text>
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
