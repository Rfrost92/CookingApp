// ApplianceSelectionScreen.tsx
import React, { useState } from "react";
import {View, Text, StyleSheet, Button, Alert, TouchableOpacity, FlatList} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLanguage } from "../services/LanguageContext";
import { getTranslation } from "../helpers/loadTranslations";
import translations from "../data/translations.json";
import { Ionicons } from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";

const appliances = [
    { id: "any", name: "Any" },
    { id: "oven", name: "Oven" },
    { id: "microwave", name: "Microwave" },
    { id: "stove", name: "Stove" },
    { id: "mixer", name: "Mixer" },
    { id: "blender", name: "Blender" },
    { id: "multicooker", name: "Multicooker" },
    { id: "hot_air_grill", name: "Hot-air Grill" },
];

export default function ApplianceSelectionScreen() {
    const { language } = useLanguage();
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedIngredients, selectedData } = route.params;
    const t = (key: string) => getTranslation(language, key);

    const [selectedAppliances, setSelectedAppliances] = useState<{ [key: string]: boolean }>({
        any: true, // Default selection
    });

    const toggleAppliance = (id: string) => {
        setSelectedAppliances((prev) => {
            if (id === "any") {
                return { any: !prev.any };
            } else {
                return {
                    ...prev,
                    [id]: !prev[id],
                    any: false, // If a specific appliance is selected, unselect "Any"
                };
            }
        });
    };

    const handleReset = () => {
        setSelectedAppliances({ any: true }); // Reset to default
    };

    const handleNext = () => {
        const selected = Object.keys(selectedAppliances).filter((key) => selectedAppliances[key]);

        if (selected.length === 0) {
            Alert.alert(t("no_appliances_selected"), t("select_at_least_one"));
            return;
        }

        if (selectedIngredients) {
            navigation.navigate("MealTypeSelection", {
                selectedIngredients,
                selectedAppliances: selected.includes("any") ? ["Any"] : selected,
            });
        } else if (selectedData) {
            navigation.navigate("Scenario2Step3", {
                selectedData,
                selectedAppliances: selected.includes("any") ? ["Any"] : selected,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("select_appliances")}</Text>
                <Text style={styles.stepText}>2/3</Text>
            </View>

            {/* Appliance List */}
            <FlatList
                data={appliances}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.applianceItem,
                            selectedAppliances[item.id] && styles.applianceItemSelected,
                        ]}
                        onPress={() => toggleAppliance(item.id)}
                    >
                        <Text
                            style={[
                                styles.applianceText,
                                selectedAppliances[item.id] && styles.applianceTextSelected,
                            ]}
                        >
                            {t(item.name.toLowerCase())}
                        </Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
            />

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomButton} onPress={handleReset}>
                    <Text style={styles.bottomButtonText}>{t("reset")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleNext}>
                    <Text style={styles.bottomButtonText}>{t("next")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        paddingBottom: 0,
        backgroundColor: "#71f2c9",
        borderBottomWidth: 1,
        borderColor: "#71f2c9",
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    stepText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    listContent: {
        padding: 20,
    },
    applianceItem: {
        padding: 15,
        marginVertical: 5,
        width: "90%",
        alignSelf: "center",
      //  borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    applianceItemSelected: {
        backgroundColor: "#FCE71C",
        borderColor: "yellow",
    },
    applianceText: {
        fontSize: 18,
    },
    applianceTextSelected: {
      //  color: "#4caf50",
        fontWeight: "bold",
    },
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 35,
    },
    bottomButton: {
        paddingVertical: 10,
    },
    bottomButtonText: {
        fontSize: 18,
        color: "#fff",
    },
});

