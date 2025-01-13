//RootNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import IngredientSelectionScreen from '../screens/IngredientSelectionScreen';
import RecipeResultScreen from '../screens/RecipeResultScreen';
import ApplianceSelectionScreen from "../screens/ApplianceSelectionScreen";
import MealTypeSelectionScreen from "../screens/MealTypeSelectionScreen";
import Scenario2Step1Screen from "../screens/Scenario2Step1Screen";
import Scenario2Step2Screen from "../screens/Scenario2Step2Screen";
import Scenario2Step3Screen from "../screens/Scenario2Step3Screen";

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
                <Stack.Screen name="Scenario2Step1" component={Scenario2Step1Screen} />
                <Stack.Screen name="Scenario2Step2" component={Scenario2Step2Screen} />
                <Stack.Screen name="Scenario2Step3" component={Scenario2Step3Screen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
