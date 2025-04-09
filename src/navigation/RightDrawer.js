import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Entypo from 'react-native-vector-icons/Entypo';
import BottomTabNavigator from './BottomTabNavigator';
import Icon from 'react-native-vector-icons/Entypo';

const Drawer = createDrawerNavigator();

export default function RightDrawer() {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: true,
                drawerPosition: 'right',
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
                name="Home"
                component={BottomTabNavigator}
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

            {/* <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} /> */}
        </Drawer.Navigator>
    );
}
