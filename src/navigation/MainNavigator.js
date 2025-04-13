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
import ProfitLossScreen from '../screens/ProfitLossScreen';
import { createStackNavigator } from '@react-navigation/stack';
import LotteryProfitAndLossScreen from '../screens/LotteryProfitAndLossScreen';
import MarketDetailsScreen from '../screens/MarketDetailsScreen';
import ColorgameProfitAndLossScreen from '../screens/ColorgameProfitAndLossScreen';
import MarketDetailsScreenCg from '../screens/MarketDetailsScreenCg';
import RunnerDetailsScreen from '../screens/RunnerDetailsScreen';
import BetHistoryScreen from '../screens/BetHistory';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
            {/* <Tab.Screen name="Menu" children={() => <DummyScreen title="Menu Screen" />} /> */}
        </Tab.Navigator>
    );
}

function DrawerNavigator() {
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
                component={ProfitLossScreen}
                options={{
                    title: 'Winning Results',
                }}
            />

            <Drawer.Screen
                name="Profit & Loss"
                component={ProfitLossScreen}
                options={{
                    title: 'Profit & Loss',
                }}
            />

            <Drawer.Screen
                name="Bet History"
                component={BetHistoryScreen}
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

export default function MainNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
        <Stack.Screen
          name="LotteryProfitAndLossScreen"
          component={LotteryProfitAndLossScreen}
          options={{ headerShown: true, title: 'Lottery Profit & Loss' }}
        />
        <Stack.Screen
          name="MarketDetailsScreen"
          component={MarketDetailsScreen}
          options={{ headerShown: true, title: 'Bet History' }}
        />
        <Stack.Screen
          name="ColorgameProfitAndLossScreen"
          component={ColorgameProfitAndLossScreen}
          options={{ headerShown: true, title: 'Color Game P&L' }}
        />
        <Stack.Screen
          name="MarketDetailsScreenCg"
          component={MarketDetailsScreenCg}
          options={{ headerShown: true, title: 'Market Profit & Loss' }}
        />
        <Stack.Screen
          name="RunnerDetailsScreen"
          component={RunnerDetailsScreen}
          options={{ headerShown: true, title: 'Bet History' }}
        />
      </Stack.Navigator>
    );
  }