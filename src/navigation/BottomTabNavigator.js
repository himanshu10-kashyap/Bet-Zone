import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text } from 'react-native';
import OpenBets from '../screens/OpenBets';
import HomeScreen from '../screens/HomeScreen';
import RightDrawer from './RightDrawer';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#3F51B5',
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          borderTopColor: '#ccc',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.getParent()?.openDrawer()}
            style={{ marginRight: 15 }}
          >
            <Icon name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Open Bets') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Menu') {
            iconName = 'menu'; 
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Open Bets" component={OpenBets} />

      <Tab.Screen
        name="Menu"
        component={RightDrawer}
        options={({ navigation }) => ({
          headerRight: () => (
            <Icon
              name="menu"
              size={28}
              color="#fff"
              style={{ marginLeft: 15 }}
              onPress={() => navigation.openDrawer()}
            />
          ),
          title: 'Home',
        })}
      />
    </Tab.Navigator>
  );
}
