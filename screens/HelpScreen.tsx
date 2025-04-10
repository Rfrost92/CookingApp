//HelpScreen.tsx
import React, {useContext, useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import {AuthContext} from "../contexts/AuthContext";
import InstructionSlides from "./InstructionSlides";

const MAX_FEEDBACK_LENGTH = 500; // Define a reasonable limit for user feedback storage

export default function HelpScreen() {
    const { user } = useContext(AuthContext);
    const { language } = useLanguage();
    const navigation = useNavigation();
    const t = (key: string) => translations[language][key] || key;

    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [showInstructionsSlides, setShowInstructionsSlides] = useState(false);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("Home");
        }
    };

    const sendFeedback = async () => {
        if (feedbackText.trim()) {
            try {
                await addDoc(collection(db, "userFeedback"), {
                    userId: user?.uid || "anonymous",
                    userEmail: user?.email || null,
                    feedback: feedbackText.trim(),
                    timestamp: new Date(),
                });
                Alert.alert(t("thank_you"), t("feedback_received"));
                setFeedbackText("");
                setFeedbackVisible(false);
            } catch (error) {
                console.error("Error saving feedback:", error);
                Alert.alert(t("error"), t("feedback_not_sent"));
            }
        } else {
            Alert.alert(t("error"), t("please_enter_feedback"));
        }
    };

    const openModal = (contentType: string) => {
        if (contentType === "instructions") {
            setShowInstructionsSlides(true);
        } else if (contentType === "disclaimer") {
            setModalContent(t("disclaimer_text"));
            setModalVisible(true);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Custom Header with Back Button */}
            <View style={styles.titleBar}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("help")}</Text>
            </View>

            <View style={styles.container}>
                {/* Instructions Button */}
                <TouchableOpacity style={styles.button} onPress={() => openModal("instructions")}>
                    <Text style={styles.buttonText}>{t("instructions")}</Text>
                </TouchableOpacity>

                {/* Disclaimer Button */}
                <TouchableOpacity style={styles.button} onPress={() => Linking.openURL("https://rfrostapps1.web.app/disclaimer.html")}>
                    <Text style={styles.buttonText}>{t("disclaimer")}</Text>
                </TouchableOpacity>

                {/* Legal Links */}
                <TouchableOpacity style={styles.button} onPress={() => Linking.openURL("https://rfrostapps1.web.app/terms.html")}>
                    <Text style={styles.buttonText}>{t("terms_and_conditions")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => Linking.openURL("https://rfrostapps1.web.app/privacy.html")}>
                    <Text style={styles.buttonText}>{t("privacy_policy")}</Text>
                </TouchableOpacity>

                {/* Feedback Button */}
                <TouchableOpacity style={styles.button} onPress={() => setFeedbackVisible(true)}>
                    <Text style={styles.buttonText}>{t("send_feedback")}</Text>
                </TouchableOpacity>
            </View>

            {/* Instructions/Disclaimer Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("info")}</Text>
                        <Text style={styles.modalText}>{modalContent}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>{t("close")}</Text>
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
                            style={styles.feedbackInput}
                            placeholder={t("enter_feedback")}
                            value={feedbackText}
                            onChangeText={(text) => {
                                if (text.length <= MAX_FEEDBACK_LENGTH) {
                                    setFeedbackText(text);
                                }
                            }}
                            multiline
                            numberOfLines={6}
                        />
                        {/* Character Count */}
                        <Text style={styles.charCount}>
                            {feedbackText.length}/{MAX_FEEDBACK_LENGTH}
                        </Text>

                        <TouchableOpacity style={styles.submitButton} onPress={sendFeedback}>
                            <Text style={styles.submitButtonText}>{t("submit")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setFeedbackVisible(false)}>
                            <Text style={styles.closeButtonText}>{t("cancel")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {showInstructionsSlides && (
                <Modal visible={true} animationType="slide" transparent={false}>
                    <InstructionSlides onDone={() => setShowInstructionsSlides(false)} />
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#71f2c9", // Mint green background for consistency
        justifyContent: "center",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center", // Centering elements
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 10,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    button: {
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 15,
        width: "90%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        flexShrink: 1,
        textAlign: "center",
        width: "100%",
    },
    linkButton: {
        padding: 10,
    },
    linkText: {
        color: "#007bff",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    feedbackInput: {
        width: "100%",
        height: 120,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: "top",
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        color: "#555",
        marginTop: 5,
        alignSelf: "flex-end",
    },
    submitButton: {
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 10,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 10,
    },
    closeButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
});

