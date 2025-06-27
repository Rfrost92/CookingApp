import React from "react";
import { ScrollView, Image, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

const screenHeight = Dimensions.get("window").height;

const OnboardingScreen = () => {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = (key: string) => translations?.[language]?.[key] ?? `[${key}]`;

    const handleDone = async () => {
        console.warn(`[User Click] Finish onboarding | Anonymous`);
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        navigation.replace("Home");
    };

    const handleCreateAccount = async () => {
        console.warn(`[User Click] Sign up from onboarding | Anonymous`);
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
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image
                                source={require("../assets/generated-1.jpg")}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <Image
                                source={require("../assets/orange.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>{t("onboarding_welcome_title")}</Text>
                            <Text style={styles.subtitle}>{t("onboarding_welcome_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#E9FCE7",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image
                                source={require("../assets/generated-3.jpg")}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <Text style={styles.title}>{t("onboarding_discover_title")}</Text>
                            <Text style={styles.subtitle}>{t("onboarding_discover_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <Image
                                source={require("../assets/generated-2.jpg")}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            <Text style={styles.title}>{t("onboarding_create_account_title")}</Text>
                            <Text style={styles.subtitle}>{t("onboarding_create_account_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                },
                {
                    backgroundColor: "#FFFCE1",
                    image: (
                        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingHorizontal: 10, marginTop:20 }]} showsVerticalScrollIndicator={false}>
                            <Text style={styles.comparisonTitle}>{t("feature_comparison_title")}</Text>

                            <View style={{ width: "100%", maxWidth: 400 }}>
                                <View style={styles.table}>
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <View style={[styles.headerCell, styles.featureColumn]}>
                                            <Text style={styles.headerText}></Text>
                                        </View>
                                        <View style={[styles.headerCell, styles.planColumn]}>
                                            <Text style={styles.headerText}>{t("no_account")}</Text>
                                        </View>
                                        <View style={[styles.headerCell, styles.planColumn]}>
                                            <Text style={styles.headerText}>{t("signed_in")}</Text>
                                        </View>
                                        <View style={[styles.headerCell, styles.planColumn]}>
                                            <Text style={styles.headerText}>{t("smartchef_plus")}</Text>
                                        </View>
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
                                            <View style={[styles.cell, styles.featureColumn]}>
                                                <Text style={styles.cellText}>{row[0]}</Text>
                                            </View>
                                            <View style={[styles.cell, styles.planColumn]}>
                                                <Text style={styles.cellText}>{row[1]}</Text>
                                            </View>
                                            <View style={[styles.cell, styles.planColumn]}>
                                                <Text style={styles.cellText}>{row[2]}</Text>
                                            </View>
                                            <View style={[styles.cell, styles.planColumn]}>
                                                <Text style={styles.cellText}>{row[3]}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.ctaButton} onPress={handleCreateAccount}>
                                <Text style={styles.ctaButtonText}>{t("onboarding_cta")}</Text>
                            </TouchableOpacity>

                            <Text style={styles.title}>{t("onboarding_premium_title")}</Text>
                            <Text style={styles.subtitle}>{t("onboarding_premium_subtitle")}</Text>
                        </ScrollView>
                    ),
                    title: "",
                    subtitle: "",
                }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
        minHeight: screenHeight,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 20,
        marginBottom: 20,
    },
    logo: {
        width: 120,
        height: 120,
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
        marginHorizontal: 20,
        marginTop: 8,
    },
    ctaButton: {
        marginTop: 20,
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
        textAlign: "center",
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
        width: "100%",
        alignItems: "stretch", // ← force all cells to match height
    },
    featureColumn: { flex: 2.2 },
    planColumn: { flex: 1.2 },

    cell: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
        justifyContent: "center",  // ensures alignment
        minHeight: 48,
    },
    cellText: {
        fontSize: 13,
        textAlign: "center",
        flexWrap: "wrap",
    },
    headerCell: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        backgroundColor: "#FCE71C",
        borderRightWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center", // ← add this to ensure consistent layout
    },
    headerText: {
        fontWeight: "bold",
        fontSize: 12,
        textAlign: "center",
        flexWrap: "wrap",
    }


});

export default OnboardingScreen;
