//ResetPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { resetPassword } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function ResetPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert(t("error"), t("please_enter_email"));
            return;
        }

        try {
            await resetPassword(email.trim(), t);
            Alert.alert(t("success"), t("password_reset_email_sent"));
            navigation.navigate("LogIn");
        } catch (error: any) {
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("reset_password")}</Text>
            <Text style={styles.description}>{t("enter_email_to_reset_password")}</Text>
            <TextInput
                style={styles.input}
                placeholder={t("email")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <Button title={t("send_reset_email")} onPress={handleResetPassword} />
            <Button title={t("back_to_login")} onPress={() => navigation.navigate("LogIn")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    description: { fontSize: 16, textAlign: "center", marginBottom: 20 },
    input: { height: 40, borderColor: "#ccc", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 15 },
});
