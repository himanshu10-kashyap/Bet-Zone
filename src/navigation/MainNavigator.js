import React from 'react';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import OpenBets from '../screens/OpenBets';
import { View, Text, ScrollView } from 'react-native';
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
import UserActivityLogScreen from '../screens/UserActivityLogScreen';
import LinearGradient from 'react-native-linear-gradient';
import DrawerHeader from '../components/DrawerHeader';
import LotteryResultsScreen from '../screens/LotteryResultsScreen';
import LogoutComponent from '../components/LogoutComponent';
import LotteryScreen from '../screens/LotteryScreen';
import ColorGameMarketsScreen from '../screens/ColorGameMarketsScreen';
import ColorGamePlayScreen from '../screens/ColorGamePlayScreen';
import LotteryMarketDetailScreen from '../screens/LotteryMarketDetailScreen';
import PurchaseLottery from '../screens/PurchaseLottery';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabs({ route }) {
    const initialRoute = route?.params?.screen;

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
            <Tab.Screen name="Lottery" component={LotteryScreen} />
            <Tab.Screen name="Color Game" component={ColorGameMarketsScreen} />
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
                headerTitleAlign: 'left',
                drawerStyle: {
                    backgroundColor: '#ffffff',
                    width: 300,
                },
                headerRight: () => (
                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        marginRight: 15,
                        paddingVertical: 5
                    }}>
                        {/* Wallet Balance */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 4
                        }}>
                            <Icon name="wallet-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={{ color: '#fff', fontSize: 14 }}>₹5,000</Text>
                        </View>

                        {/* Exposure */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon name="flash-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={{ color: '#fff', fontSize: 14 }}>₹1,200</Text>
                        </View>
                    </View>
                ),
                drawerActiveBackgroundColor: '#3F51B5',
                drawerActiveTintColor: '#fff',
                drawerInactiveTintColor: '#555',
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                    marginLeft: 0,
                    paddingLeft: 20,
                    marginVertical: 4,
                },
                drawerItemStyle: {
                    borderRadius: 8,
                    marginHorizontal: 10,
                    marginVertical: 4,
                    height: 56,
                    paddingHorizontal: 12,
                },
            }}
            drawerContent={(props) => (
                <View style={{ flex: 1 }}>
                    {/* Custom Header */}
                    <DrawerHeader />

                    {/* Drawer Items */}
                    <ScrollView
                        contentContainerStyle={{
                            paddingVertical: 10,
                            paddingBottom: 20,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <DrawerItemList {...props} />

                        {/* Custom Logout Component */}
                        <LogoutComponent
                            label="Logout"
                            iconName="exit"
                        />
                    </ScrollView>

                    {/* Footer */}
                    <View style={{
                        padding: 16,
                        borderTopWidth: 1,
                        borderTopColor: '#eee',
                        backgroundColor: '#f8f9fa',
                    }}>
                        <Text style={{
                            color: '#666',
                            textAlign: 'center',
                            fontSize: 12
                        }}>
                            Version 1.2.0 • © 2023 BetMaster
                        </Text>
                    </View>
                </View>
            )}
        >
            {/* Drawer Screens */}
            <Drawer.Screen
                name="Home"
                component={BottomTabs}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="home" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Account Statement"
                component={AccountStatement}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="wallet" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Change Password"
                component={ChangePassword}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="lock-closed" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Lottery Purchase"
                component={LotteryPurchaseScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="sparkles" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Winning Results"
                component={LotteryResultsScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="medal" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Profit & Loss"
                component={ProfitLossScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="analytics" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Bet History"
                component={BetHistoryScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="time" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="Activity Log"
                component={UserActivityLogScreen}
                options={{
                    drawerIcon: ({ color }) => (
                        <View style={{ width: 30, alignItems: 'center' }}>
                            <Icon name="document-text" size={22} color={color} />
                        </View>
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}


export default function MainNavigator() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false, headerStyle: {
                backgroundColor: '#3F51B5',
                elevation: 0,
                shadowOpacity: 0,
            },

            headerTintColor: '#fff',
            headerTitleAlign: 'left',
            drawerStyle: {
                backgroundColor: '#ffffff',
                width: 300,
            },
            headerRight: () => (
                <View style={{
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    marginRight: 15,
                    paddingVertical: 5
                }}>
                    {/* Wallet Balance */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4
                    }}>
                        <Icon name="wallet-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                        <Text style={{ color: '#fff', fontSize: 14 }}>₹5,000</Text>
                    </View>

                    {/* Exposure */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Icon name="flash-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                        <Text style={{ color: '#fff', fontSize: 14 }}>₹1,200</Text>
                    </View>
                </View>
            ),


        }}>
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
            <Stack.Screen
                name="ColorGamePlayScreen"
                component={ColorGamePlayScreen}
                options={{ headerShown: true, title: 'Play Game' }}
            />
            <Stack.Screen
                name="LotteryMarketDetailScreen"
                component={LotteryMarketDetailScreen}
                options={{ headerShown: true, title: 'Lottery Purchase' }}
            />
            <Stack.Screen
                name="PurchaseLottery"
                component={PurchaseLottery}
                options={{ headerShown: true, title: 'Lottery Purchase' }}
            />
        </Stack.Navigator>
    );
}