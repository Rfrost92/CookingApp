// InstructionSlides.tsx
import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

const screenHeight = Dimensions.get("window").height;

export default function InstructionSlides({ onDone }: { onDone: () => void }) {
    const { language } = useLanguage();
    const t = (key: string) => translations?.[language]?.[key] || `[${key}]`;

    return (
        <Onboarding
            onDone={onDone}
            onSkip={onDone}
            skipLabel={t("skip")}
            nextLabel={t("next")}
            doneLabel={t("done")}
            pages={[
                {
                    backgroundColor: "#71f2c9",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image source={require("../assets/generated-1.jpg")} style={styles.image} />
                            <Text style={styles.title}>{t("slide1_title")}</Text>
                            <Text style={styles.subtitle}>{t("slide1_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image source={require("../assets/generated-2.jpg")} style={styles.image} />
                            <Text style={styles.title}>{t("slide2_title")}</Text>
                            <Text style={styles.subtitle}>{t("slide2_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#FFFCE1",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image source={require("../assets/generated-fridge.jpg")} style={styles.image} />
                            <Text style={styles.title}>{t("slide3_title")}</Text>
                            <Text style={styles.subtitle}>{t("slide3_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#E9FCE7",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image source={require("../assets/orange.png")} style={styles.imageSmall} />
                            <Text style={styles.title}>{t("slide4_title")}</Text>
                            <Text style={styles.subtitle}>{t("slide4_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Text style={styles.bigEmoji}>📅</Text>
                            <Text style={styles.title}>{t("slide5_title")}</Text>
                            <Text style={styles.subtitle}>{t("slide5_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
        minHeight: screenHeight,
        paddingHorizontal: 20,
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: "cover",
        borderRadius: 16,
        marginBottom: 20,
    },
    imageSmall: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        marginBottom: 20,
    },
    bigEmoji: {
        fontSize: 100,
        textAlign: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
    },
});
