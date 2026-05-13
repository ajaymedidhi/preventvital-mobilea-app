import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import HealthDashboardScreen from '../screens/HealthDashboardScreen';
import ProgramsListScreen from '../screens/programs/ProgramsListScreen';
import UserProfileScreen from '../screens/auth/UserProfileScreen';
import DevicesScreen from '../screens/devices/DevicesScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import VIDAChatbot from '../components/VIDAChatbot';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: [styles.tabBar, { 
                        height: (Platform.OS === 'ios' ? 88 : 70) + (insets.bottom > 0 ? insets.bottom : 5),
                        paddingBottom: (insets.bottom > 0 ? insets.bottom : 10)
                    }],
                    tabBarActiveTintColor: '#51A6CB',
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
                        tabBarAccessibilityLabel: 'Home',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="home-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Programs"
                    component={ProgramsListScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Wellness Programs',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="documents-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Shop"
                    component={ShopScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Shop',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="cart-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Devices"
                    component={DevicesScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Connected Devices',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="hardware-chip-outline" size={24} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={UserProfileScreen}
                    options={{
                        tabBarAccessibilityLabel: 'My Profile',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="person-outline" size={24} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>

            <VIDAChatbot />
        </>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default BottomTabNavigator;
