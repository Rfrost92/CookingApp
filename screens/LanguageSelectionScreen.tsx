import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const availableLanguages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "ua", label: "Українська" },
    { code: "ru", label: "Russian" },
    // Add more if needed
];

export default function LanguageSelectionScreen() {
    const navigation = useNavigation();
    const { setLanguage } = useLanguage();

    const handleLanguageSelect = async (langCode: string) => {
        await setLanguage(langCode);
        await AsyncStorage.setItem("hasSeenLanguageSelection", "true");
        navigation.replace("Onboarding");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose your language</Text>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {availableLanguages.map((item) => (
                    <TouchableOpacity
                        key={item.code}
                        style={styles.languageButton}
                        onPress={() => handleLanguageSelect(item.code)}
                    >
                        <Text style={styles.languageText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
        paddingTop: Platform.OS === "ios" ? 80 : 60,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        alignSelf: "center",
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: "center",
    },
    languageButton: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 10,
        width: "100%",
        alignItems: "center",
    },
    languageText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
});
