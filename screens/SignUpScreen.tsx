// SignUpScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { signUp, resendVerificationEmail } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showResend, setShowResend] = useState(false);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t("error"), t("please_enter_email_password"));
            return;
        }

        try {
            await signUp(email, password);
            Alert.alert(t("success"), t("account_created_successfully") + "\n" + t("please_verify_email"));
            setShowResend(true);
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim()) {
            Alert.alert(t("error"), t("please_enter_email"));
            return;
        }

        try {
            await resendVerificationEmail(email.trim(), t);
            Alert.alert(t("success"), t("verification_email_resent"));
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
                <Text style={styles.title}>{t("sign_up")}</Text>
                <Text style={styles.headerPlaceholder}>{''}</Text>
            </View>

            <View>
                {/* Input Fields */}
                <TextInput
                    style={styles.input}
                    placeholder={t("email")}
                    placeholderTextColor="#777"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder={t("password")}
                    placeholderTextColor="#777"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Sign Up Button */}
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>{t("sign_up")}</Text>
                </TouchableOpacity>

                {showResend && (
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleResendVerification}>
                        <Text style={styles.secondaryButtonText}>{t("resend_verification")}</Text>
                    </TouchableOpacity>
                )}

                {/* Already Have an Account? */}
                {/*
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("LogIn")}>
                    <Text style={styles.secondaryButtonText}>{t("already_have_account")}</Text>
                </TouchableOpacity>
                */}
            </View>

            {/* Terms and Conditions Notice */}
            <Text style={styles.agreementText}>
                {t("by_signing_up")}{" "}
                <Text onPress={() => Linking.openURL("https://yourapp.com/terms")} style={styles.linkText}>
                    {t("terms_of_use")}
                </Text>,{" "}
                <Text onPress={() => Linking.openURL("https://yourapp.com/privacy")} style={styles.linkText}>
                    {t("privacy_policy")}
                </Text>{" "}
                {t("and")}{" "}
                <Text onPress={() => Linking.openURL("https://yourapp.com/disclaimer")} style={styles.linkText}>
                    {t("disclaimer")}
                </Text>
            </Text>
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
        shadowOffset: {width: 0, height: 2},
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
