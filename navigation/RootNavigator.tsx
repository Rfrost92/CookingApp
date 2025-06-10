// RootNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import IngredientSelectionScreen from "../screens/IngredientSelectionScreen";
import RecipeResultScreen from "../screens/RecipeResultScreen";
import ApplianceSelectionScreen from "../screens/ApplianceSelectionScreen";
import MealTypeSelectionScreen from "../screens/MealTypeSelectionScreen";
import Scenario2Step1Screen from "../screens/Scenario2Step1Screen";
import Scenario2Step2Screen from "../screens/Scenario2Step2Screen";
import Scenario2Step3Screen from "../screens/Scenario2Step3Screen";
import ChooseClassicRecipeScreen from "../screens/ChooseClassicRecipeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LogInScreen from "../screens/LogInScreen";
import BookOfRecipesScreen from "../screens/BookOfRecipesScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import HelpScreen from "../screens/HelpScreen";
import GoPremiumScreen from "../screens/GoPremiumScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import InitialSignUpScreen from "../screens/InitialSignUpScreen";
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
import DeleteAccountScreen from "../screens/DeleteAccountScreen";

const Stack = createStackNavigator();

export default function RootNavigator({ initialRouteName }: { initialRouteName: string }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Home" component={HomeScreen} options={{
                                gestureEnabled: false, // 👈 disables swipe-to-go-back on iOS
                                headerLeft: () => null, // (Optional) removes the back arrow
                        }}
                />
                <Stack.Screen name="IngredientSelection" component={IngredientSelectionScreen} />
                <Stack.Screen name="RecipeResult" component={RecipeResultScreen} />
                <Stack.Screen name="ApplianceSelection" component={ApplianceSelectionScreen} />
                <Stack.Screen name="MealTypeSelection" component={MealTypeSelectionScreen} />
                <Stack.Screen name="Scenario2Step1" component={Scenario2Step1Screen} />
                <Stack.Screen name="Scenario2Step2" component={Scenario2Step2Screen} />
                <Stack.Screen name="Scenario2Step3" component={Scenario2Step3Screen} />
                <Stack.Screen name="ChooseClassicRecipe" component={ChooseClassicRecipeScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="LogIn" component={LogInScreen} />
                <Stack.Screen name="BookOfRecipes" component={BookOfRecipesScreen} />
                <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="HelpScreen" component={HelpScreen} options={{ title: 'Help & Info' }} />
                <Stack.Screen name="GoPremium" component={GoPremiumScreen} />
                <Stack.Screen name="InitialSignUp" component={InitialSignUpScreen} />
                <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />

        </Stack.Navigator>
    );
}
