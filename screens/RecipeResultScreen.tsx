import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';

export default function RecipeResultScreen({ route, navigation }: any) {
    const { recipe } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{recipe.recipe}</Text>
            <Text style={styles.subtitle}>Instructions:</Text>
            <FlatList
                data={recipe.instructions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <Text style={styles.instruction}>{`${index + 1}. ${item}`}</Text>
                )}
            />
            <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
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
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 5,
    },
});
