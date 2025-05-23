import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Alert,
    Linking,
    TouchableOpacity,
    StyleSheet, Platform,
} from "react-native";
import {signUp, signInWithGoogle, checkPremiumOffer, signInWithApple} from "../services/authService";
import { useLanguage } from "../services/LanguageContext";
import translations from "../data/translations.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from 'expo-apple-authentication';
import WhyLoginModal from "./WhyLoginModal";

export default function InitialSignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { language } = useLanguage();
    const t = (key: string) => translations[language][key] || key;
    const [whyModalVisible, setWhyModalVisible] = useState(false);

    const handleCreateAccount = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t("error"), t("please_enter_email_password"));
            return;
        }

        try {
            await signUp(email, password);
            Alert.alert(
                t("success"),
                t("account_created_successfully") + "\n" + t("please_verify_email"),
                [
                    {
                        text: t("ok"),
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "Home" }], // or "LogIn" or any preferred screen
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const user = await signInWithGoogle();
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
            await checkPremiumOffer(user.uid, navigation);
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const user = await signInWithApple(credential);
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
            await checkPremiumOffer(user.uid, navigation);
        } catch (e: any) {
            if (e.code === 'ERR_CANCELED') {
                console.log("Apple sign in cancelled");
            } else {
                console.error(e);
                Alert.alert("Apple Sign-In Failed", e.message || "Please try again.");
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("create_account")}</Text>
            </View>

            <View>
                <TextInput
                    style={styles.input}
                    placeholder={t("email")}
                    placeholderTextColor="#777"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder={t("password")}
                    placeholderTextColor="#777"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
                    <Text style={styles.buttonText}>{t("sign_up")}</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>{t("or")}</Text>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup}>
                    <Ionicons style = {styles.googleIcon} name="logo-google" size={24} color="white" />
                    <Text style={styles.buttonText}>{t("log_in_google")}</Text>
                </TouchableOpacity>

                {Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync() && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={5}
                        style={{ width: "100%", height: 45, marginBottom: 10 }}
                        onPress={handleAppleSignIn}
                    />
                )}

                <TouchableOpacity onPress={() => setWhyModalVisible(true)} style={{ marginTop: 5, marginBottom: 20 }}>
                    <Text style={{ textAlign: 'center', color: '#444' }}>{t("why_login") || "🛈 Why do I need to log in?"}</Text>
                </TouchableOpacity>

                <WhyLoginModal visible={whyModalVisible} onClose={() => setWhyModalVisible(false)} />

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Text style={styles.secondaryButtonText}>{t("i_will_create_later")}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.agreementText}>
                {t("by_signing_up")}{" "}
                <Text onPress={() => Linking.openURL("https://rfrostapps1.web.app/terms.html")} style={styles.linkText}>
                    {t("terms_of_use")}
                </Text>,{" "}
                <Text onPress={() => Linking.openURL("https://rfrostapps1.web.app/privacy.html")} style={styles.linkText}>
                    {t("privacy_policy")}
                </Text>{" "}
                {t("and")}{" "}
                <Text onPress={() => Linking.openURL("https://rfrostapps1.web.app/disclaimer.html")} style={styles.linkText}>
                    {t("disclaimer")}
                </Text>
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#71f2c9",
        padding: 20,
        justifyContent: "space-between",
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
    },
    input: {
        height: 45,
        backgroundColor: "white",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    button: {
        backgroundColor: "#FCE71C",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        marginLeft: 8,
    },
    orText: {
        fontSize: 18,
        color: "#555",
        textAlign: "center",
        margin: 20,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#DB4437",
        paddingVertical: 15,
        borderRadius: 8,
        justifyContent: "center",
        marginBottom: 10,
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    secondaryButtonText: {
        fontSize: 14,
        color: "#000",
        fontWeight: "bold",
    },
    agreementText: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginTop: 20,
    },
    linkText: {
        color: "#007BFF",
        textDecorationLine: "underline",
    },
    googleIcon: {
        marginRight: 10,
    }
});
