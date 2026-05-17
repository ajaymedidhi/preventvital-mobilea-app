import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HealthDashboardScreen from '../screens/HealthDashboardScreen';
import ProgramsListScreen from '../screens/programs/ProgramsListScreen';
import UserProfileScreen from '../screens/auth/UserProfileScreen';
import DevicesScreen from '../screens/devices/DevicesScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import VIDAChatbot from '../components/VIDAChatbot';

const Tab = createBottomTabNavigator();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { active: TabIconName; inactive: TabIconName; label: string }> = {
    Home:     { active: 'home',            inactive: 'home-outline',           label: 'Home' },
    Programs: { active: 'documents',       inactive: 'documents-outline',      label: 'Programs' },
    Shop:     { active: 'cart',            inactive: 'cart-outline',           label: 'Shop' },
    Devices:  { active: 'hardware-chip',   inactive: 'hardware-chip-outline',  label: 'Devices' },
    Profile:  { active: 'person',          inactive: 'person-outline',         label: 'Profile' },
};

interface TabIconProps {
    name: string;
    focused: boolean;
    color: string;
}

const TabIcon = ({ name, focused, color }: TabIconProps) => {
    const cfg = TAB_CONFIG[name];
    return (
        <View style={styles.iconWrap}>
            {focused && <View style={styles.activePill} />}
            <Ionicons
                name={focused ? cfg.active : cfg.inactive}
                size={23}
                color={color}
            />
        </View>
    );
};

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    const tabBarHeight = Platform.OS === 'ios' ? 56 : 58;
    const bottomPad = insets.bottom > 0 ? insets.bottom : 8;

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: [
                        styles.tabBar,
                        { height: tabBarHeight + bottomPad, paddingBottom: bottomPad },
                    ],
                    tabBarActiveTintColor: '#51A6CB',
                    tabBarInactiveTintColor: '#94A3B8',
                    tabBarShowLabel: true,
                    tabBarLabelStyle: styles.label,
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon name={route.name} focused={focused} color={color} />
                    ),
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HealthDashboardScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Home',
                        tabBarLabel: ({ focused, color }) => (
                            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
                                Home
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Programs"
                    component={ProgramsListScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Wellness Programs',
                        tabBarLabel: ({ focused, color }) => (
                            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
                                Programs
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Shop"
                    component={ShopScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Shop',
                        tabBarLabel: ({ focused, color }) => (
                            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
                                Shop
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Devices"
                    component={DevicesScreen}
                    options={{
                        tabBarAccessibilityLabel: 'Connected Devices',
                        tabBarLabel: ({ focused, color }) => (
                            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
                                Devices
                            </Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={UserProfileScreen}
                    options={{
                        tabBarAccessibilityLabel: 'My Profile',
                        tabBarLabel: ({ focused, color }) => (
                            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
                                Profile
                            </Text>
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
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        paddingTop: 6,
        // Strong shadow to clearly separate from screen content
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 24,
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 30,
    },
    activePill: {
        position: 'absolute',
        top: 0,
        width: 28,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#51A6CB',
    },
    label: {
        fontSize: 10,
        marginTop: 2,
    },
});

export default BottomTabNavigator;
