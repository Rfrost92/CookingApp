import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

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
                        <Image
                            source={require("../assets/generated-1.jpg")}
                            style={styles.image}
                        />
                    ),
                    title: t("slide1_title"),
                    subtitle: t("slide1_subtitle"),
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <Image
                            source={require("../assets/generated-2.jpg")}
                            style={styles.image}
                        />
                    ),
                    title: t("slide2_title"),
                    subtitle: t("slide2_subtitle"),
                },
                {
                    backgroundColor: "#FFFCE1",
                    image: (
                        <Image
                            source={require("../assets/generated-fridge.jpg")}
                            style={styles.image}
                        />
                    ),
                    title: t("slide3_title"),
                    subtitle: t("slide3_subtitle"),
                },
                {
                    backgroundColor: "#E9FCE7",
                    image: (
                        <Image
                            source={require("../assets/orange.png")}
                            style={styles.imageSmall}
                        />
                    ),
                    title: t("slide4_title"),
                    subtitle: t("slide4_subtitle"),
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <View style={{ height: 200 }}>
                            <Text style={styles.bigEmoji}>📅</Text>
                        </View>
                    ),
                    title: t("slide5_title"),
                    subtitle: t("slide5_subtitle"),
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
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
    },
    bigEmoji: {
        fontSize: 100,
        textAlign: "center",
    },
});
