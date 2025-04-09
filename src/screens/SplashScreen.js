import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Image } from 'react-native';
const logo = require('../assets/logo.png');
const background = require('../assets/bg.jpg');
const { width, height } = Dimensions.get('window');


export default function SplashScreen({ navigation }) {
    return (
        <View style={styles.mainContainer}>
            <ImageBackground source={background}
                style={styles.background}
                resizeMode="cover">

                <View style={styles.overlay}>
                    <View style={styles.contentContainer}>

                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={logo}
                                style={styles.logo}
                            />
                        </View>

                        {/* Button */}
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.navigate('LoginScreen')}
                            >
                                <Text style={styles.buttonText}>Let's Play →</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>

            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    background: {
        flex: 1,
        width: width,
        height: height,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        flex: 1,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "space-between",
        width: "100%",
    },
    logoContainer: {
        alignSelf: "center",
        marginTop: height * 0.08, // 8% from top
    },
    logo: {
        width: width * 0.6, // 60% of screen width
        height: height * 0.1, // 10% of screen height
        resizeMode: "contain",
    },
    buttonWrapper: {
        position: "absolute",
        bottom: height * 0.05, // Position near the bottom
        alignSelf: "center",
        width: "80%",
    },
    button: {
        width: "100%",
        backgroundColor: "#F7C855",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 25,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1E1E6D",
    },
}); 