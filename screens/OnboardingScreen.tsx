import React from "react";
import { Image, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

const OnboardingScreen = () => {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = (key: string) => {
        const langData = translations?.[language];
        return langData?.[key] ?? `[${key}]`;
    };
    const handleDone = async () => {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        navigation.replace("Home");
    };

    const handleCreateAccount = async () => {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        navigation.replace("InitialSignUp");
    };

    return (
        <Onboarding
            onDone={handleDone}
            onSkip={handleDone}
            skipLabel={t("skip")}
            nextLabel={t("next")}
            doneLabel={t("done")}
            pages={[
                {
                    backgroundColor: "#71f2c9",
                    image: (
                        <View style={{ alignItems: "center" }}>
                            <Image
                                source={require("../assets/generated-1.jpg")}
                                style={{ width: 300, height: 300, borderRadius: 16, marginBottom: 20 }}
                                resizeMode="cover"
                            />
                            <Image
                                source={require("../assets/orange.png")}
                                style={{ width: 120, height: 120 }}
                                resizeMode="contain"
                            />
                        </View>
                    ),
                    title: t("onboarding_welcome_title"),
                    subtitle: t("onboarding_welcome_subtitle"),
                },
                {
                    backgroundColor: "#E9FCE7",
                    image: (
                        <Image
                            source={require("../assets/generated-3.jpg")}
                            style={{ width: 300, height: 300, borderRadius: 20 }}
                            resizeMode="cover"
                        />
                    ),
                    title: t("onboarding_discover_title"),
                    subtitle: t("onboarding_discover_subtitle"),
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <Image
                            source={require("../assets/generated-2.jpg")}
                            style={{ width: 300, height: 300, borderRadius: 20 }}
                            resizeMode="cover"
                        />
                    ),
                    title: t("onboarding_create_account_title"),
                    subtitle: t("onboarding_create_account_subtitle"),
                },
                {
                    backgroundColor: "#FFFCE1",
                    image: (
                        <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
                            <Text style={styles.comparisonTitle}>{t("feature_comparison_title")}</Text>

                            <View style={{ width: "100%", maxWidth: 400 }}>
                                <View style={styles.table}>
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={[styles.headerCell, styles.featureColumn]}></Text>
                                        <Text style={[styles.headerCell, styles.planColumn]}>{t("no_account")}</Text>
                                        <Text style={[styles.headerCell, styles.planColumn]}>{t("signed_in")}</Text>
                                        <Text style={[styles.headerCell, styles.planColumn]}>{t("smartchef_plus")}</Text>
                                    </View>

                                    {[
                                        [t("feature_classic_recipes"), "✅", "✅", "✅"],
                                        [t("feature_cook_from_ingredients"), "❌", "✅", "✅"],
                                        [t("feature_personalized_recipes"), "❌", "✅", "✅"],
                                        [t("feature_recipe_book"), "❌", "✅", "✅"],
                                        [t("feature_weekly_requests"), "2", "2", t("unlimited")],
                                        [t("feature_custom_input"), "❌", "❌", "✅"],
                                        [t("feature_fridge_photo"), "❌", "❌", "✅"],
                                    ].map((row, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.cell, styles.featureColumn]} numberOfLines={1} ellipsizeMode="tail">{row[0]}</Text>
                                            <Text style={[styles.cell, styles.planColumn]} numberOfLines={1}>{row[1]}</Text>
                                            <Text style={[styles.cell, styles.planColumn]} numberOfLines={1}>{row[2]}</Text>
                                            <Text style={[styles.cell, styles.planColumn]} numberOfLines={1}>{row[3]}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.ctaButton} onPress={handleCreateAccount}>
                                <Text style={styles.ctaButtonText}>{t("onboarding_cta")}</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                    title: t("onboarding_premium_title"),
                    subtitle: t("onboarding_premium_subtitle"),
                }
            ]}
        />
    );
};


const styles = StyleSheet.create({
    ctaButton: {
        marginTop: 10,
        backgroundColor: "#FFD700",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    comparisonTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333",
    },

    table: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 20,
        overflow: "hidden",
        width: "100%",
    },

    tableHeader: {
        backgroundColor: "#FCE71C",
    },

    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },

    headerCell: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        fontWeight: "bold",
        fontSize: 12,
        textAlign: "center",
        borderRightWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#FCE71C",
    },

    cell: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        fontSize: 12,
        textAlign: "center",
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },


    featureColumn: { flex: 2.2 },
    planColumn: { flex: 1 },
});

export default OnboardingScreen;
