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
    "Any", // Special option for default behavior
];

export default function ApplianceSelectionScreen() {
    const [selectedAppliances, setSelectedAppliances] = useState<{ [key: string]: boolean }>({});
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedIngredients } = route.params;

    const toggleAppliance = (appliance: string) => {
        setSelectedAppliances((prev) => ({
            ...prev,
            [appliance]: !prev[appliance],
        }));
    };

    const resetSelection = () => {
        setSelectedAppliances({});
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
