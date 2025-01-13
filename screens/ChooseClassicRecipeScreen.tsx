// ChooseClassicRecipeScreen.ts
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import {fetchRecipeScenario2, fetchRecipeScenario3} from "../services/openaiService";

export default function ChooseClassicRecipeScreen() {
    const [dishes, setDishes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const dishesSnapshot = await getDocs(collection(db, "classicDishes"));
                const fetchedDishes = dishesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDishes(fetchedDishes);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dishes:", error);
                Alert.alert("Error", "Failed to load classic dishes.");
                setLoading(false);
            }
        };

        fetchDishes();
    }, []);

    const handleSelectDish = async (dish: any) => {
        try {
            const recipe = await fetchRecipeScenario3(dish.name.en);

            // Navigate to RecipeResult with the generated recipe
            navigation.navigate("RecipeResult", { recipe });
        } catch (error) {
            Alert.alert("Error", "Failed to fetch the recipe. Please try again.");
        }
    };

    const renderDish = ({ item }: any) => (
        <TouchableOpacity
            style={styles.dishItem}
            onPress={() => handleSelectDish(item)}
        >
            <Text style={styles.dishName}>{item.name.en}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading dishes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose a Classic Dish</Text>
            <FlatList
                data={dishes}
                keyExtractor={(item) => item.id}
                renderItem={renderDish}
            />
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
    dishItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
    },
    dishName: {
        fontSize: 18,
    },
});
