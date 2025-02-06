import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function HelpScreen() {
    const { language } = useLanguage();
    const navigation = useNavigation();
    const t = (key: string) => translations[language][key] || key;

    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    const openModal = (contentType: string) => {
        if (contentType === "instructions") {
            setModalContent(t("instructions_text"));
        } else if (contentType === "disclaimer") {
            setModalContent(t("disclaimer_text"));
        }
        setModalVisible(true);
    };

    const sendFeedback = () => {
        if (feedbackText.trim()) {
            Alert.alert(t("thank_you"), t("feedback_received"));
            setFeedbackText("");
            setFeedbackVisible(false);
        } else {
            Alert.alert(t("error"), t("please_enter_feedback"));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("help")}</Text>

            {/* Instructions Button */}
            <TouchableOpacity style={styles.button} onPress={() => openModal("instructions")}>
                <Text style={styles.buttonText}>{t("instructions")}</Text>
            </TouchableOpacity>

            {/* Disclaimer Button */}
            <TouchableOpacity style={styles.button} onPress={() => openModal("disclaimer")}>
                <Text style={styles.buttonText}>{t("disclaimer")}</Text>
            </TouchableOpacity>

            {/* Legal Links */}
            <TouchableOpacity style={styles.link} onPress={() => Linking.openURL("https://your-terms-url.com")}>
                <Text style={styles.linkText}>{t("terms_and_conditions")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => Linking.openURL("https://your-privacy-policy-url.com")}>
                <Text style={styles.linkText}>{t("privacy_policy")}</Text>
            </TouchableOpacity>

            {/* Feedback Button */}
            <TouchableOpacity style={styles.button} onPress={() => setFeedbackVisible(true)}>
                <Text style={styles.buttonText}>{t("send_feedback")}</Text>
            </TouchableOpacity>

            {/* Modal for Instructions/Disclaimer */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{modalContent}</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>{t("close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal animationType="slide" transparent={true} visible={feedbackVisible} onRequestClose={() => setFeedbackVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("send_feedback")}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t("enter_feedback")}
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                            multiline
                            numberOfLines={4}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={sendFeedback}>
                            <Text style={styles.modalButtonText}>{t("submit")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setFeedbackVisible(false)}>
                            <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    button: { backgroundColor: "#4caf50", padding: 15, borderRadius: 10, marginBottom: 15, width: "100%", alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    link: { marginTop: 10 },
    linkText: { color: "#007bff", fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "80%", backgroundColor: "#fff", borderRadius: 10, padding: 20, alignItems: "center" },
    modalText: { fontSize: 16, marginBottom: 20 },
    modalButton: { backgroundColor: "#4caf50", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10 },
    modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    input: { width: "100%", borderColor: "#ccc", borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 15 },
});
