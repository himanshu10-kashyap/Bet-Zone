import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const customErrorHandler = (error) => {
    const navigation = useNavigation();
    let errorMessage = '';
       console.log('error', error);
    console.log('error.response', error?.response);
    console.log('error.data', error?.data);
    console.log('error.message', error?.message);
       
    if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error?.response?.data?.errMessage) {
        errorMessage = error.response.data.errMessage;
        
        if (error?.response?.data?.responseCode === 401) {
            // Handle unauthorized access
            if (navigation) {
                navigation.navigate('LoginScreen');
            }
            // Clear storage (using AsyncStorage or your preferred storage solution)
            AsyncStorage.multiRemove(['user', 'role']);
        }
    } else {
        errorMessage = "Something went wrong";
    }
    
    // Show alert in React Native
    Alert.alert('Error', errorMessage);
    
    return errorMessage;
};