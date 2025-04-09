import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import Icon from 'react-native-vector-icons/Entypo';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

const Drawer = createDrawerNavigator();

function DummyScreen({ title }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{title}</Text>
        </View>
    );
}

export default function DrawerNavigator() {
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
                name="Lottery"
                component={() => <DummyScreen title="Lottery Screen" />}
            />
            <Drawer.Screen
                name="Color Game"
                component={() => <DummyScreen title="Colo Game Screen" />}
            />
            <Drawer.Screen
                name="Home"
                component={BottomTabNavigator}
                options={({ navigation }) => ({
                    headerLeft: () => (
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

        </Drawer.Navigator>
    );
}
