//RootNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import IngredientSelectionScreen from '../screens/IngredientSelectionScreen';
import RecipeResultScreen from '../screens/RecipeResultScreen';
import ApplianceSelectionScreen from "../screens/ApplianceSelectionScreen";
import MealTypeSelectionScreen from "../screens/MealTypeSelectionScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="IngredientSelection" component={IngredientSelectionScreen} />
                <Stack.Screen name="RecipeResult" component={RecipeResultScreen} />
                <Stack.Screen name="ApplianceSelection" component={ApplianceSelectionScreen} />
                <Stack.Screen name="MealTypeSelection" component={MealTypeSelectionScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
