import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../redux/context';
import strings from '../utilities/stringConstant';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { dispatch } = useAppContext();
  const navigation = useNavigation();
  
  const [scaleValue] = useState(new Animated.Value(1));
  const [fadeValue] = useState(new Animated.Value(0));
  const [modalOpacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const showCustomAlert = () => {
    setShowSuccessModal(true);
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideCustomAlert();
      navigation.replace('MainNavigator');
    }, 2000);
  };

  const hideCustomAlert = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSuccessModal(false));
  };

  const handleLogin = async () => {
    if (!userName || !password) {
      // You can add a custom error message here if needed
      return;
    }
    
    setLoading(true);
    try {
      const data = await loginUser({ userName, password });
  
      if (data.data?.accessToken) {
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        
        dispatch({
          type: strings.LOG_IN,
          payload: {
            accessToken: data.data.accessToken,
            isLogin: true,
            userName: data.data.userName,
            userId: data.data.userId,
            userType: data.data.userType,
          }
        });
        
        showCustomAlert();
      }
    } catch (error) {
      // Handle error (you can add custom error display)
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E1E6D" barStyle="light-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeValue }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.subheading}>Sign in to your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons 
            name="person-outline" 
            size={22} 
            color="#FFD700" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons 
            name="lock-outline" 
            size={22} 
            color="#FFD700" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={22}
              color="#FFD700"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>SIGN IN</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
      
      {/* Custom Success Modal */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="none"
        onRequestClose={hideCustomAlert}
      >
        <Animated.View style={[styles.modalContainer, { opacity: modalOpacity }]}>
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check" size={36} color="#FFF" />
            </View>
            <Text style={styles.successText}>Login Successful!</Text>
            <Text style={styles.successSubtext}>Welcome back, {userName}</Text>
          </View>
        </Animated.View>
      </Modal>
      
      {/* Decorative elements */}
      <View style={styles.cornerAccentTop} />
      <View style={styles.cornerAccentBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E6D',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  button: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E6D',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 30,
  },
  cornerAccentTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  cornerAccentBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 150,
    height: 150,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successBox: {
    backgroundColor: '#1E1E6D',
    width: width * 0.8,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4BB543',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
});