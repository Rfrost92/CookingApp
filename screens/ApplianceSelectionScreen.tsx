// ApplianceSelectionScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

const appliances = [
    "Oven",
    "Microwave",
    "Stove",
    "Mixer",
    "Blender",
    "Multicooker",
    "Hot-air Grill",
];

export default function ApplianceSelectionScreen() {
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [selectedAppliances, setSelectedAppliances] = useState<{ [key: string]: boolean }>({
        Any: true, // "Any" is selected by default
    });
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedIngredients } = route.params;

    const toggleAppliance = (appliance: string) => {
        setSelectedAppliances((prev) => {
            if (appliance === "Any") {
                return { Any: !prev.Any }; // If "Any" is selected, unselect all others
            } else {
                return {
                    ...prev,
                    [appliance]: !prev[appliance],
                    Any: false, // If a specific appliance is selected, unselect "Any"
                };
            }
        });
    };

    const resetSelection = () => {
        setSelectedAppliances({ Any: true }); // Reset to default: only "Any" selected
    };

    const handleNext = () => {
        const selected = Object.keys(selectedAppliances).filter((key) => selectedAppliances[key]);

        if (selected.length === 0) {
            Alert.alert(t("no_appliances_selected"), t("select_at_least_one"));
            return;
        }

        navigation.navigate("MealTypeSelection", {
            selectedIngredients,
            selectedAppliances: selected.includes("Any") ? ["Any"] : selected,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("select_appliances")}</Text>
            <View style={styles.applianceList}>
                <TouchableOpacity
                    style={[
                        styles.applianceItem,
                        styles.anyItem,
                        selectedAppliances.Any && styles.applianceItemSelected,
                    ]}
                    onPress={() => toggleAppliance("Any")}
                >
                    <Text
                        style={[
                            styles.applianceText,
                            selectedAppliances.Any && styles.applianceTextSelected,
                        ]}
                    >
                        {t("any")}
                    </Text>
                </TouchableOpacity>
                {appliances.map((appliance) => (
                    <TouchableOpacity
                        key={appliance}
                        style={[
                            styles.applianceItem,
                            selectedAppliances[appliance] && styles.applianceItemSelected,
                        ]}
                        onPress={() => toggleAppliance(appliance)}
                    >
                        <Text
                            style={[
                                styles.applianceText,
                                selectedAppliances[appliance] && styles.applianceTextSelected,
                            ]}
                        >
                            {t(appliance.toLowerCase())}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.buttonContainer}>
                <Button title={t("reset")} onPress={resetSelection} />
                <Button title={t("next")} onPress={handleNext} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    applianceList: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    applianceItem: {
        padding: 15,
        marginVertical: 5,
        width: "80%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        alignItems: "center",
    },
    anyItem: {
        backgroundColor: "#f0f8ff", // Light blue for "Any"
        borderColor: "#87ceeb",
    },
    applianceItemSelected: {
        backgroundColor: "#d1f5d3",
        borderColor: "#4caf50",
    },
    applianceText: {
        fontSize: 18,
    },
    applianceTextSelected: {
        color: "#4caf50",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
