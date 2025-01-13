// ApplianceSelectionScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

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
    const [selectedAppliances, setSelectedAppliances] = useState<{ [key: string]: boolean }>({
        Any: true, // "Any" is selected by default
    });
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedIngredients } = route.params;

    const toggleAppliance = (appliance: string) => {
        setSelectedAppliances((prev) => {
            if (appliance === "Any") {
                // If "Any" is selected, unselect all others
                return { Any: !prev.Any };
            } else {
                // If a specific appliance is selected, unselect "Any"
                return {
                    ...prev,
                    [appliance]: !prev[appliance],
                    Any: false,
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
            Alert.alert("No appliances selected", "Please select at least one appliance or choose 'Any'.");
            return;
        }

        // Navigate to the next screen (Meal Type selection) with the selected appliances
        navigation.navigate("MealTypeSelection", {
            selectedIngredients,
            selectedAppliances: selected.includes("Any") ? ["Any"] : selected, // Handle "Any" case
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Appliances</Text>
            <View style={styles.applianceList}>
                {/* "Any" option is visually distinct */}
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
                        Any
                    </Text>
                </TouchableOpacity>
                {/* Other appliances */}
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
                            {appliance}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Reset" onPress={resetSelection} />
                <Button title="Next" onPress={handleNext} />
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
