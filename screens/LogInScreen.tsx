// LogInScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { logIn } from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function LogInScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleLogIn = async () => {
        try {
            await logIn(email, password);
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home"); // Redirect to home screen
        } catch (error: any) {
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("log_in")}</Text>
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
            <Button title={t("log_in")} onPress={handleLogIn} />
            <Button
                title={t("dont_have_account")}
                onPress={() => navigation.navigate("SignUp")}
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
