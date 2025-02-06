// LogInScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Linking, TouchableOpacity } from "react-native";
import { logIn, resendVerificationEmail } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function LogInScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showResend, setShowResend] = useState(false);
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleLogIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t("error"), t("please_enter_email_password"));
            return;
        }

        try {
            await logIn(email, password, t);
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
        } catch (error: any) {
            if (error.message === "email-not-verified") {
                Alert.alert(
                    t("email_not_verified"),
                    t("please_verify_email"),
                    [
                        { text: t("resend_verification"), onPress: handleResendVerification },
                        { text: t("cancel"), style: "cancel" }
                    ]
                );
                setShowResend(true);
            } else {
                Alert.alert(t("error"), error.message);
            }
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
        <View style={styles.container}>
            <Text style={styles.title}>{t("log_in")}</Text>
            <TextInput style={styles.input} placeholder={t("email")} value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder={t("password")} value={password} onChangeText={setPassword} secureTextEntry />
            <Button title={t("log_in")} onPress={handleLogIn} />
            {showResend && <Button title={t("resend_verification")} onPress={handleResendVerification} />}
            <Button title={t("forgot_password")} onPress={() => navigation.navigate("ResetPassword")} />
            <Button title={t("dont_have_account")} onPress={() => navigation.navigate("SignUp")} />

            {/* Terms and Conditions Notice */}
            <Text style={styles.agreementText}>
                {t("by_signing_in")}
                <TouchableOpacity onPress={() => Linking.openURL("https://yourapp.com/terms")}>
                    <Text style={styles.linkText}>{t("terms_of_use")}</Text>
                </TouchableOpacity>,
                <TouchableOpacity onPress={() => Linking.openURL("https://yourapp.com/privacy")}>
                    <Text style={styles.linkText}>{t("privacy_policy")}</Text>
                </TouchableOpacity>
                {t("and")}
                <TouchableOpacity onPress={() => Linking.openURL("https://yourapp.com/disclaimer")}>
                    <Text style={styles.linkText}>{t("disclaimer")}</Text>
                </TouchableOpacity>.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    input: { height: 40, borderColor: "#ccc", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
    agreementText: { fontSize: 12, color: "#555", marginTop: 20, textAlign: "center" },
    linkText: { color: "#1E90FF", textDecorationLine: "underline" },
});
