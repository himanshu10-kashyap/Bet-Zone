import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Importing MaterialIcons
import { useAppContext } from '../redux/context';
import strings from '../utilities/stringConstant';

export default function LoginScreen() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { dispatch } = useAppContext();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!userName || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    
    setLoading(true);
    try {
      const data = await loginUser({ userName, password });
  
      if (data.data?.accessToken) {
        // Save token to AsyncStorage
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        
        // Dispatch login action to store user data
        dispatch({
          type: strings.LOG_IN,
          payload: {
            accessToken: data.data.accessToken,
            isLogin: true,
            userName: data.data.userName,
            userId: data.data.userId,
            userType: data.data.userType,
            // Include any other relevant user data
          }
        });
  
        Alert.alert('Success', 'Login Successful!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainNavigator'),
          },
        ]);
      } else {
        Alert.alert('Error', 'Invalid login credentials.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#AAA"
        value={userName}
        onChangeText={setUserName}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#AAA"
          secureTextEntry={!showPassword} // Toggling password visibility
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)} // Toggle visibility
          style={styles.eyeIcon}
        >
          <MaterialIcons
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E6D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: StatusBar.currentHeight || 40,
    marginBottom: 50,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    color: '#000',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  button: {
    width: '90%',
    backgroundColor: '#F7C855',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E6D',
  },
});
