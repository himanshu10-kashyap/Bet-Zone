// components/LogoutComponent.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LogoutComponent = ({ label = "Logout", iconName = "exit", iconSize = 22 }) => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleLogout = async () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // Clear any stored data
                            await AsyncStorage.multiRemove(['authToken', 'userData']);
                            
                            // Reset navigation to Splash screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SplashScreen' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                marginVertical: 4,
            }}
        >
            <View style={{ width: 30, alignItems: 'center' }}>
                {loading ? (
                    <ActivityIndicator size="small" color="#555" />
                ) : (
                    <Icon name={iconName} size={iconSize} color="#555" />
                )}
            </View>
            <Text style={{ marginLeft: 20, fontSize: 16, color: '#555' }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default LogoutComponent;