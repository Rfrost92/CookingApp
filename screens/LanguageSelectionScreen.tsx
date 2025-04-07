import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
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
            <View style={styles.content}>
                <Text style={styles.title}>Choose your language</Text>
                <FlatList
                    data={availableLanguages}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.languageButton}
                            onPress={() => handleLanguageSelect(item.code)}
                        >
                            <Text style={styles.languageText}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
        paddingTop: 80,
        paddingHorizontal: 30,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
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
    languagesContainer: {
        flexDirection: "column",
        justifyContent: "center"
    }
});
