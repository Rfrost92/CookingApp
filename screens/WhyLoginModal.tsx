// WhyLoginModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {useLanguage} from "../services/LanguageContext";
import translations from "../data/translations.json";

export default function WhyLoginModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { language } = useLanguage();
    const t = (key: string) => {
        const langData = translations?.[language];
        return langData?.[key] ?? `[${key}]`;
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{t("why_login")}</Text>
                    <Text style={styles.text}>{t("why_login_bullets")}</Text>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>{t("why_login_explanation_bold")}</Text>
                        <Text>{t("why_login_explanation_rest")}</Text>
                    </Text>
                    <Text style={styles.paragraph}>{t("why_login_explanation2")}</Text>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{t("okay_got_it")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    text: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        color: '#444',
    },
    button: {
        backgroundColor: '#71f2c9',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    paragraph: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
        color: '#444',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000', // optional
    },
});
