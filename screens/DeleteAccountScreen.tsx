// DeleteAccountScreen.tsx
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { deleteRevenueCatSubscriber } from "../services/subscriptionService";
import { reauthenticateUser, reauthWithApple, reauthWithGoogle } from "../services/authService";

export default function DeleteAccountScreen() {
    const { user, subscriptionType } = useContext(AuthContext);
    const { language } = useLanguage();
    const navigation = useNavigation();
    const t = (key: string) => translations[language][key] || key;

    const handleDeleteAccount = async () => {
        try {
            const provider = user?.providerData[0]?.providerId;

            if (provider === "google.com") {
                try {
                    await reauthWithGoogle();
                } catch (err) {
                    console.warn("❌ Google reauth cancelled or failed", err);
                    return;
                }
            } else if (provider === "apple.com") {
                try {
                    await reauthWithApple();
                } catch (err) {
                    console.warn("❌ Apple reauth cancelled or failed", err);
                    return;
                }
            } else {
                Alert.prompt(
                    t("confirm_delete"),
                    t("enter_password_to_confirm"),
                    async (password) => {
                        if (!user?.email || !password) return;
                        try {
                            await reauthenticateUser(user.email, password);
                            console.warn(`User deleted themselves. ID: ${user.uid}, email: ${user.email}, email: ${user.email} subscription: ${subscriptionType}`);
                            if (subscriptionType !== "guest") {
                                console.log('deleting a premium user');
                                await deleteRevenueCatSubscriber(user.uid);
                            }
                            await deleteDoc(doc(db, "users", user.uid));
                            await deleteUser(auth.currentUser);
                            Alert.alert(t("deleted"), t("account_deleted"));
                            navigation.navigate("Home");
                        } catch (error) {
                            console.error("❌ Deletion error", error);
                            Alert.alert(t("error"), error.message);
                        }
                    },
                    "secure-text"
                );
                return;
            }

            console.warn(`User deleted themselves. ID: ${user.uid}, email: ${user.email}, email: ${user.email} subscription: ${subscriptionType}`);
            if (subscriptionType !== "guest") {
                console.log('deleting a premium user')
                await deleteRevenueCatSubscriber(user.uid);
            }

            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(auth.currentUser);
            Alert.alert(t("deleted"), t("account_deleted"));
            navigation.navigate("Home");

        } catch (error) {
            console.error("❌ Reauth error", error);
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.warningText}>{t("delete_warning_text")}</Text>

            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                <Text style={styles.dangerText}>{t("confirm_delete_account")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>{t("go_back")}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    warningText: {
        fontSize: 16,
        textAlign: "center",
        color: "#333",
        marginBottom: 30,
    },
    dangerButton: {
        backgroundColor: "#ff4d4d",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    dangerText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        marginTop: 15,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        backgroundColor: "#ccc",
    },
    cancelText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
});
