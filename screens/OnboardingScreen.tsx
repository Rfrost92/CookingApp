import React from "react";
import { Image, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OnboardingScreen = () => {
    const navigation = useNavigation();

    const handleDone = async () => {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        navigation.replace("Home");
    };

    const handleCreateAccount = async () => {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        navigation.replace("InitialSignUp");
    };

    return (
        <Onboarding
            onDone={handleDone}
            onSkip={handleDone}
            pages={[
                {
                    backgroundColor: "#71f2c9",
                    image: (
                        <View style={{ alignItems: "center" }}>
                            <Image
                                source={require("../assets/generated-1.jpg")}
                                style={{ width: 300, height: 300, borderRadius: 16, marginBottom: 20 }}
                                resizeMode="cover"
                            />
                            <Image
                                source={require("../assets/orange.png")}
                                style={{ width: 120, height: 120 }}
                                resizeMode="contain"
                            />
                        </View>
                    ),
                    title: "Welcome to Smart Chef",
                    subtitle: "Whip up healthy meals with what you already have in your fridge. No stress, just good food.",
                },
                {
                    backgroundColor: "#ffffff",
                    image: (
                        <Image
                            source={require("../assets/generated-2.jpg")}
                            style={{ width: 300, height: 300, borderRadius: 20 }}
                            resizeMode="cover"
                        />
                    ),
                    title: "Create a Free Account",
                    subtitle: "Want more than just the basics?\nCreate a free account to save recipes, access all three cooking scenarios, and get the most out of Smart Chef.",
                },
                {
                    backgroundColor: "#FFFCE1",
                    image: (
                        <View style={{ alignItems: "center" }}>
                            <Image
                                source={require("../assets/generated-3.jpg")}
                                style={{ width: 320, height: 320, borderRadius: 20, marginBottom: 20 }}
                                resizeMode="cover"
                            />
                            <TouchableOpacity style={styles.ctaButton} onPress={handleCreateAccount}>
                                <Text style={styles.ctaButtonText}>Create Free Account & Try Premium</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                    title: "Enjoy Premium – Try 3 Days Free",
                    subtitle: "Unlimited recipes, ad-free experience, and full personalization.\nTry it free for 3 days – cancel anytime!",
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    ctaButton: {
        marginTop: 10,
        backgroundColor: "#FFD700",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default OnboardingScreen;
