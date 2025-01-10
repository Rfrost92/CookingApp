//HomeScreen.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Button
                title="I would like to cook something from the ingredients available at home"
                onPress={() => navigation.navigate('IngredientSelection')}
            />
            <Button
                title="I am open to new ideas, I want to cook something from any ingredients"
                onPress={() => navigation.navigate('IngredientSelection')}
            />
            <Button
                title="Classic recipes"
                onPress={() => navigation.navigate('RecipeResult')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
