// GoPremiumScreen.ts
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../contexts/AuthContext";
import * as RNIap from "react-native-iap";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";

const itemSkus = ["com.rFrostSmartChef.premium.monthly"];

export default function GoPremiumScreen() {
    const { user, setSubscriptionType } = useAuth();
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                await RNIap.initConnection();
                const products = await RNIap.getSubscriptions({ skus: itemSkus});
                if (products.length > 0) {
                    setProduct(products[0]);
                }
            } catch (error) {
                console.error("Error fetching subscription:", error);
            }
        };

        fetchSubscription();
    }, []);

    const handleSubscriptionPurchase = async () => {
        try {
            if (!product) {
                Alert.alert(t("error"), t("subscription_not_available"));
                return;
            }
            const purchase = await RNIap.requestSubscription(product.productId);
            console.log("✅ Subscription successful:", purchase);

            // Update Firestore subscriptionType
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { subscriptionType: "premium" });

            setSubscriptionType("premium"); // Update global state
            Alert.alert(t("success"), t("premium_user_success"));
            navigation.goBack();
        } catch (error) {
            console.error("❌ Subscription failed:", error);
            Alert.alert(t("error"), t("subscription_failed"));
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Top Bar with Back Button */}
            <View style={styles.titleBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{t("go_premium")}</Text>
            </View>

            <View style={styles.container}>
                {/* Logo Positioned Above the White Box */}
                <Image source={require("../assets/orange.png")} style={styles.logo} />

                {/* White Box Containing Benefits */}
                <View style={styles.whiteBox}>
                    <Text style={styles.benefit}>✅ {t("try_free_3_days")}</Text>
                    <Text style={styles.benefit}>✅ {t("unlimited_recipes")}</Text>
                    <Text style={styles.benefit}>✅ {t("individual_recipes")}</Text>
                    <Text style={styles.benefit}>✅ {t("fridge_analysis")}</Text>
                </View>

                {/* Subscription Button */}
                <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscriptionPurchase}>
                    <Text style={styles.subscribeButtonText}>{t("try_premium_free")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#71f2c9", // Consistent mint green background
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 10,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        marginBottom: 20, // Overlapping the box slightly
        zIndex: 1,
    },
    whiteBox: {
        width: "80%", // Same width as the button
        backgroundColor: "white",
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: 20, // Rounded corners
        alignItems: "flex-start", // Align text to the left
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    benefit: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: "bold",
        textAlign: "left", // Ensure left-aligned text
    },
    subscribeButton: {
        backgroundColor: "#FFD700",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: "center", // Centered button
    },
    subscribeButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
});

export default GoPremiumScreen;
