import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OnboardingScreen from "../screens/OnboardingScreen";

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
    );
}
