// PremiumModal.tsx
import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function PremiumModal({ visible, onClose }) {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <Text style={styles.title}>{t("weekly_limit_reached")}</Text>
                <Text style={styles.description}>
                    {t("upgrade_to_continue_weekly") || "You've used your 2 free requests this week. Upgrade to Premium to continue cooking without limits!"}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        onClose();
                        navigation.navigate("GoPremium");
                    }}
                >
                    <Text style={styles.buttonText}>{t("go_premium")}</Text>
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
    },
    description: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 30,
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
    },
    closeButton: {
        padding: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: "black",
        textDecorationLine: "underline",
    },
});
