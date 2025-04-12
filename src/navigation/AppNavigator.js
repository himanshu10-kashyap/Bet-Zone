import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator () {
  return(
    <NavigationContainer>
       <Stack.Navigator screenOptions={{ headerShown: false }}>
       <Stack.Screen name='SplashScreen' component={SplashScreen} />
        <Stack.Screen name= 'LoginScreen' component={LoginScreen} />
        <Stack.Screen name= 'MainNavigator' component={MainNavigator} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}