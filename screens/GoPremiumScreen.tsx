// GoPremiumScreen.ts
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Alert, Image} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from "../contexts/AuthContext";
import * as RNIap from "react-native-iap";
import {db} from "../firebaseConfig";
import {doc, updateDoc} from "firebase/firestore";
import {useLanguage} from "../services/LanguageContext";
import translations from "../data/translations.json";
import * as Sentry from '@sentry/react-native';
import Purchases from "react-native-purchases";
import {testingMode} from "../services/openaiService";

const itemSkus = ["com.rFrostSmartChef.premium.monthly"];

export default function GoPremiumScreen() {
    const {user, setSubscriptionType, refreshSubscriptionType} = useAuth();
    const navigation = useNavigation();
    const {language} = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                await RNIap.initConnection();
                const products = await RNIap.getSubscriptions({skus: itemSkus});
                console.log('Available subscriptions', products);
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
            const offerings = await Purchases.getOfferings();
            const current = offerings.current;

            if (current && current.monthly) {
                const purchaseInfo = await Purchases.purchasePackage(current.monthly);
                const {customerInfo} = purchaseInfo;

                if (customerInfo.entitlements.active['smartchef Plus']) {
                    // Save to Firestore
                    await updateDoc(doc(db, "users", user.uid), {
                        subscriptionType: "premium",
                    });
                    setSubscriptionType("premium");
                    Alert.alert("Success", "You're now a premium user!");
                    navigation.goBack();
                }
            } else {
                Alert.alert("Error", "No offering available.");
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("❌ Purchase error:", e);
                Alert.alert("Error", e.message);
            }
        }
    };


    const handleRestore = async () => {
        if (!user) {
            const msg = "⚠️ Restore attempted without user logged in.";
            console.warn(msg);
            Sentry.captureMessage(msg, {level: "warning"});
            Alert.alert(t("error"), t("must_be_logged_in"));
            return;
        }

        try {
            const customerInfo = await Purchases.restorePurchases();

            if (customerInfo.entitlements.active['smartchef Plus']) {
                await updateDoc(doc(db, "users", user.uid), {
                    subscriptionType: "premium",
                });
                setSubscriptionType("premium");
                Sentry.captureMessage("✅ Purchases successfully restored", {level: "info"});
                Alert.alert(t("success"), t("restore_success"));
            } else {
                Alert.alert(t("info"), t("nothing_to_restore"));
            }
        } catch (e) {
            console.error("❌ Restore error:", e);
            Alert.alert("Error", e.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Top Bar with Back Button */}
            <View style={styles.titleBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black"/>
                </TouchableOpacity>
                <Text style={styles.title}>{t("go_premium")}</Text>
            </View>

            <View style={styles.container}>
                {/* Logo Positioned Above the White Box */}
                <Image source={require("../assets/orange.png")} style={styles.logo}/>

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
                {/* Restore Purchases Button */}
                <TouchableOpacity onPress={handleRestore}>
                    <Text style={styles.restoreLink}>{t("restore_purchases")}</Text>
                </TouchableOpacity>
                {testingMode && <TouchableOpacity
                    onPress={async () => {
                        try {
                            const customerInfo = await Purchases.getCustomerInfo();
                            console.log("🧾 RevenueCat Customer Info:", customerInfo);

                            const active = customerInfo.entitlements.active;
                            const entitlement = active["smartchef Plus"]; // or your actual entitlement key

                            if (entitlement) {
                                const msg = `
                                    🪪 Product ID: ${entitlement.productIdentifier}
                                    📆 Purchase Date: ${new Date(entitlement.purchaseDate).toLocaleString()}
                                    ⏭ Expires: ${entitlement.expirationDate
                                                                        ? new Date(entitlement.expirationDate).toLocaleString()
                                                                        : "Lifetime or undefined"}
                                    🔁 Will Renew: ${entitlement.willRenew ? "Yes" : "No"}
                                            `;
                                Alert.alert("Active Subscription", msg.trim());
                            } else {
                                Alert.alert("No Active Subscription", "You're not subscribed.");
                            }
                        } catch (e) {
                            console.error("❌ Error getting subscription info:", e);
                            Alert.alert("Error", e.message);
                        }
                    }}
                    style={[styles.subscribeButton, {backgroundColor: "#ccc"}]}
                >
                    <Text style={styles.subscribeButtonText}>Check Active Subscription</Text>
                </TouchableOpacity> }

                <Text style={styles.subscriptionInfoText}>
                    {product?.localizedPrice
                        ? t("subscription_info_dynamic").replace("{{price}}", product.localizedPrice)
                        : t("subscription_info")}
                </Text>
                <Text style={styles.alreadyTriedText}>
                    {t("already_tried")}
                </Text>
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
        shadowOffset: {width: 0, height: 2},
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
    restoreButton: {
        paddingVertical: 10,
        paddingHorizontal: 25,
        marginTop: 10,
        backgroundColor: "#eee",
        borderRadius: 6,
    },
    restoreButtonText: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
        fontWeight: "500",
    },
    restoreLink: {
        fontSize: 14,
        color: "#333",
        textDecorationLine: "underline",
        marginTop: 10,
        fontWeight: "500",
    },

    alreadyTriedText: {
        marginTop: 30,
        fontSize: 13,
        color: "#555",
        fontStyle: "italic",
        textAlign: "center",
    },
    subscriptionInfoText: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 5,
        marginHorizontal: 20,
    },
});

export default GoPremiumScreen;
