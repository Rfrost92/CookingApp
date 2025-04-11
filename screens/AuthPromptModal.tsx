import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function AuthPromptModal({ visible, onClose }) {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = (key: string) => {
        const langData = translations?.[language];
        return langData?.[key] ?? `[${key}]`;
    };
    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <Text style={styles.title}>{t("log_in_or_sign_up") || "Log in or sign up for free!"}</Text>
                <Text style={styles.description}>
                    {t("auth_prompt_description") || "Unlock personalized recipes, your own recipe book, and the ability to go premium."}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        onClose();
                        navigation.navigate("LogIn");
                    }}
                >
                    <Text style={styles.buttonText}>{t("log_in_now") || "Log in or sign up (it's free)"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>{t("maybe_later")}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: "#71f2c9",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    description: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: "#FCE71C",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        textAlign: "center"
    },
    closeButton: {
        padding: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: "black",
        textDecorationLine: "underline",
        textAlign: "center"
    },
});
