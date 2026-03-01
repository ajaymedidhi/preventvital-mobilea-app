import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

// Screens
import HealthDashboardScreen from '../screens/HealthDashboardScreen';
import ProgramsListScreen from '../screens/programs/ProgramsListScreen';
import UserProfileScreen from '../screens/auth/UserProfileScreen';
import DevicesScreen from '../screens/devices/DevicesScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: -5,
                    marginBottom: 5,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HealthDashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Programs"
                component={ProgramsListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="documents-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Devices"
                component={DevicesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="watch-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Activity"
                component={ActivityScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="clipboard-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={UserProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        height: Platform.OS === 'ios' ? 88 : 60,
        paddingTop: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default BottomTabNavigator;
