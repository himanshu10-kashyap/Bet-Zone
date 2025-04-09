import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();

export default function AppNavigator () {
  return(
    <NavigationContainer>
       <Stack.Navigator screenOptions={{ headerShown: false }}>
       <Stack.Screen name='SplashScreen' component={SplashScreen} />
        <Stack.Screen name= 'LoginScreen' component={LoginScreen} />
        <Stack.Screen name= 'DrawerNavigator' component={DrawerNavigator} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}