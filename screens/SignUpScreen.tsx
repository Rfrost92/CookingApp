// SignUpScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signUp } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleSignUp = async () => {
        try {
            await signUp(email, password);
            Alert.alert(t("success"), t("account_created_successfully"));
            navigation.navigate("LogIn"); // Redirect to login
        } catch (error: any) {
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("sign_up")}</Text>
            <TextInput
                style={styles.input}
                placeholder={t("email")}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder={t("password")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title={t("sign_up")} onPress={handleSignUp} />
            <Button
                title={t("already_have_account")}
                onPress={() => navigation.navigate("LogIn")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
});
