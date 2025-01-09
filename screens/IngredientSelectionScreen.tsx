import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Button, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import categoriesData from '../data/ingredientCategories.json';
import { useNavigation } from '@react-navigation/native';

export default function IngredientSelectionScreen() {
    const [categories, setCategories] = useState<any[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                // Fetch ingredients from Firestore
                const ingredientSnapshot = await getDocs(collection(db, 'ingredients'));
                const fetchedIngredients = ingredientSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Group ingredients under their respective categories
                const groupedCategories = categoriesData.map((category: any) => {
                    const categoryIngredients = fetchedIngredients.filter(
                        (ingredient: any) => ingredient.category === category.id // Match `id` with `category`
                    );

                    return {
                        ...category,
                        ingredients: categoryIngredients, // Attach matching ingredients to the category
                    };
                });

                // Initialize expanded state for categories
                const expandedState = groupedCategories.reduce((acc: any, category: any) => {
                    acc[category.id] = false; // Default to collapsed
                    return acc;
                }, {});

                // Preselect essential ingredients
                const preselected = fetchedIngredients.reduce((acc: any, ingredient: any) => {
                    if (ingredient.isEssential) acc[ingredient.id] = true;
                    return acc;
                }, {});

                setCategories(groupedCategories);
                setExpandedCategories(expandedState);
                setSelectedIngredients(preselected);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching ingredients:', error);
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId], // Toggle the expanded state
        }));
    };

    // Toggle ingredient selection
    const toggleIngredient = (id: string) => {
        setSelectedIngredients((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Get selected ingredients
    const getSelectedIngredients = () => {
        const selected = [];
        for (const [id, isSelected] of Object.entries(selectedIngredients)) {
            if (isSelected) {
                const ingredient = categories
                    .flatMap((category: any) => category.ingredients)
                    .find((ingredient: any) => ingredient.id === id);
                if (ingredient) selected.push(ingredient.name.en);
            }
        }
        return selected;
    };

    // Submit ingredients to GPT API
    const handleGetRecipe = async () => {
        const selected = getSelectedIngredients();
        if (selected.length === 0) {
            Alert.alert('No ingredients selected', 'Please select at least one ingredient.');
            return;
        }

        const prompt = `I have the following ingredients: ${selected.join(
            ', '
        )}. Can you suggest a recipe using these ingredients?`;

        console.log(prompt);

        // Replace this with actual GPT API integration
        const mockResponse = {
            recipe: "Here's a simple recipe using your ingredients...",
            instructions: ['Step 1: Do this', 'Step 2: Do that', 'Step 3: Serve and enjoy!'],
        };

        // Navigate to RecipeResult with response
        navigation.navigate('RecipeResult', { recipe: mockResponse });
    };



    // Render individual ingredient
    const renderIngredient = ({ item }: any) => (
        <View style={styles.ingredientRow}>
            <Switch
                value={!!selectedIngredients[item.id]}
                onValueChange={() => toggleIngredient(item.id)}
            />
            <Text style={styles.ingredientText}>{item.name.en || 'Unknown Ingredient'}</Text>
        </View>
    );

    // Render category
    const renderCategory = ({ item }: any) => {
        const isExpanded = expandedCategories[item.id];
        return (
            <View key={item.id} style={styles.categoryContainer}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(item.id)}
                >
                    <Text style={styles.categoryTitle}>
                        {item.name.en || 'Unknown Category'} ({item.ingredients.length})
                    </Text>
                    <Text style={styles.categoryToggle}>{isExpanded ? '-' : '+'}</Text>
                </TouchableOpacity>
                {isExpanded && (
                    <FlatList
                        data={item.ingredients}
                        keyExtractor={(ingredient) => ingredient.id} // Ensure unique key for ingredients
                        renderItem={renderIngredient}
                    />
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Ingredients</Text>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id} // Ensure unique key for categories
                renderItem={renderCategory}
            />
            <View style={styles.submitButton}>
                <Button title="Get Recipe" onPress={handleGetRecipe} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryContainer: {
        marginBottom: 15,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    categoryToggle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    ingredientText: {
        fontSize: 16,
        marginLeft: 10,
    },
    submitButton: {
        marginTop: 20,
    },
});
