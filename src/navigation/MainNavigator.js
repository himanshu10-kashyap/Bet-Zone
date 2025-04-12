import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import OpenBets from '../screens/OpenBets';
import { View, Text } from 'react-native';
import AccountStatement from '../screens/AccountStatement';
import ChangePassword from '../screens/ChangePassword';
import LotteryPurchaseScreen from '../screens/LotteryPurchaseScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function DummyScreen({ title }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{title}</Text>
        </View>
    );
}

function BottomTabs({ route }) {
    const initialRoute = route?.params?.screen || 'Home';

    return (
        <Tab.Navigator
            initialRouteName={initialRoute}
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
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Open Bets') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Menu') {
                        iconName = 'menu';
                    } else if (route.name === 'Lottery') {
                        iconName = focused ? 'game-controller' : 'game-controller-outline';
                    } else if (route.name === 'Color Game') {
                        iconName = focused ? 'color-palette' : 'color-palette-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Open Bets" component={OpenBets} />
            <Tab.Screen name="Lottery" children={() => <DummyScreen title="Lottery Screen" />} />
            <Tab.Screen name="Color Game" children={() => <DummyScreen title="Color Game Screen" />} />
            <Tab.Screen name="Menu" children={() => <DummyScreen title="Menu Screen" />} />
        </Tab.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: true,
                drawerPosition: 'left',
                headerStyle: {
                    backgroundColor: '#3F51B5',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#fff',
                headerTitleAlign: 'center',
            }}
        >
    
            <Drawer.Screen
                name="Account Statement"
                component={AccountStatement}
                options={{
                    title: 'Account Statement',
                }}
            />
            <Drawer.Screen
                name="Change Password"
                component={ChangePassword}
                options={{
                    title: 'Change Password',
                }}
            />

            <Drawer.Screen
                name="Lottery Purchase"
                component={LotteryPurchaseScreen}
                options={{
                    title: 'Lottery Purchase',
                }}
            />

            <Drawer.Screen
                name="Winning Results"
                component={BottomTabs}
                options={{
                    title: 'Winning Results',
                }}
            />

            <Drawer.Screen
                name="Profit & Loss"
                component={BottomTabs}
                options={{
                    title: 'Profit & Loss',
                }}
            />

            <Drawer.Screen
                name="Bet History"
                component={BottomTabs}
                options={{
                    title: 'Bet History',
                }}
            />

            <Drawer.Screen
                name="Activity Log"
                component={BottomTabs}
                options={{
                    title: 'Activity Log',
                }}
            />

            <Drawer.Screen
                name="Logout"
                component={BottomTabs}
                options={{
                    title: 'Logout',
                }} />
        </Drawer.Navigator>
    );
}
