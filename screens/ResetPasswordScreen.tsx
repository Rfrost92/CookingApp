import React, { useState } from "react";
import { View, Text, TextInput, Alert, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { resetPassword } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert(t("error"), t("please_enter_email"));
            return;
        }

        try {
            await resetPassword(email);
            Alert.alert(t("success"), t("password_reset_email_sent"));
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black"/>
                </TouchableOpacity>
                <Text style={styles.title}>{t("forgot_password")}</Text>
                <Text style={styles.headerPlaceholder}>{''}</Text>
            </View>

            <View>
                {/* Input Field */}
                <TextInput
                    style={styles.input}
                    placeholder={t("email")}
                    placeholderTextColor="#777"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Reset Password Button */}
                <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
                    <Text style={styles.buttonText}>{t("reset_password")}</Text>
                </TouchableOpacity>

                {/* Go Back to Log In */}
                {/*
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("LogIn")}>
                    <Text style={styles.secondaryButtonText}>{t("back_to_login")}</Text>
                </TouchableOpacity>
                */}
            </View>
            <View style={{height: 20}}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
        padding: 20,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    input: {
        height: 45,
        backgroundColor: "white",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    button: {
        backgroundColor: "#FCE71C",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    agreementText: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginTop: 20,
    },
    linkText: {
        color: "#007BFF",
        textDecorationLine: "underline",
    },
    headerPlaceholder: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
    },
});
