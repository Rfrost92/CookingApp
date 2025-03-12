// LogInScreen.tsx
import React, {useState} from "react";
import {View, Text, TextInput, Button, StyleSheet, Alert, Linking, TouchableOpacity} from "react-native";
import {logIn, resendVerificationEmail, signInWithGoogle} from "../services/authService";
import {useLanguage} from "../services/LanguageContext";
import translations from "../data/translations.json";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";

export default function LogInScreen({navigation}: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showResend, setShowResend] = useState(false);
    const {language} = useLanguage();
    const t = (key: string) => translations[language][key] || key;

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
        } catch (error: any) {
            return;
        }
    };

    const handleLogIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t("error"), t("please_enter_email_password"));
            return;
        }

        try {
            await logIn(email, password, t);
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
        } catch (error: any) {
            if (error.message === "email-not-verified") {
                Alert.alert(
                    t("email_not_verified"),
                    t("please_verify_email"),
                    [
                        {text: t("resend_verification"), onPress: handleResendVerification},
                        {text: t("cancel"), style: "cancel"}
                    ]
                );
                setShowResend(true);
            } else {
                Alert.alert(t("error"), error.message);
            }
        }
    };

 /*   const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            Alert.alert(t("success"), t("logged_in_successfully"));
            navigation.navigate("Home");
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };
*/
    const handleResendVerification = async () => {
        if (!email.trim()) {
            Alert.alert(t("error"), t("please_enter_email"));
            return;
        }

        try {
            await resendVerificationEmail(email.trim(), t);
            Alert.alert(t("success"), t("verification_email_resent"));
        } catch (error) {
            Alert.alert(t("error"), error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black"/>
                </TouchableOpacity>
                <Text style={styles.title}>{t("log_in")}</Text>
                <Text style={styles.headerPlaceholder}>{''}</Text>

            </View>

            <View>
                {/* Input Fields */}
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

                {/* Login Button */}
                <TouchableOpacity style={styles.button} onPress={handleLogIn}>
                    <Text style={styles.buttonText}>{t("log_in")}</Text>
                </TouchableOpacity>

                {showResend ? (
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleResendVerification}>
                        <Text style={styles.secondaryButtonText}>{t("resend_verification")}</Text>
                    </TouchableOpacity>
                ): null}

                <Text style={styles.orText}>{t("or")}</Text>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                    <Ionicons name="logo-google" size={24} color="white" />
                    <Text style={styles.buttonText}>{t("log_in_google")}</Text>
                </TouchableOpacity>

                {/* Forgot Password & Sign Up */}
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("ResetPassword")}>
                    <Text style={styles.secondaryButtonText}>{t("forgot_password")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("SignUp")}>
                    <Text style={styles.secondaryButtonText}>{t("dont_have_account")}</Text>
                </TouchableOpacity>


            </View>
            {/* Terms and Conditions Notice */}
            <Text style={styles.agreementText}>
                {t("by_signing_in") + " "}
                <Text style={styles.linkText} onPress={() => Linking.openURL("https://yourapp.com/terms")}>
                    {t("terms_of_use")}
                </Text>
                {", "}
                <Text style={styles.linkText} onPress={() => Linking.openURL("https://yourapp.com/privacy")}>
                    {t("privacy_policy")}
                </Text>
                {" " + t("and") + " "}
                <Text style={styles.linkText} onPress={() => Linking.openURL("https://yourapp.com/disclaimer")}>
                    {t("disclaimer")}
                </Text>
            </Text>
            {/*<View style={{height: 20}}/>*/}
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    input: {
        height: 45,
        backgroundColor: "white",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
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
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
    },
    agreementText: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginTop: 20,
    },
    orText: {
        fontSize: 18,
        color: "#555",
        textAlign: "center",
        margin: 20,
    },
    linkText: {
        color: "#007BFF",
        textDecorationLine: "underline",
    },
    headerPlaceholder: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
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

    facebookButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3b5998",
        paddingVertical: 15,
        borderRadius: 8,
        justifyContent: "center",
        marginBottom: 10,
    },
});

