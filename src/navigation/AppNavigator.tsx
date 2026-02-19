import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { useConsent } from '../health/ConsentContext';

import ConsentScreen from '../screens/health/ConsentScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

import PersonalInformationScreen from '../screens/onboarding/PersonalInformationScreen';
import HealthConditionsScreen from '../screens/onboarding/HealthConditionsScreen';
import HealthGoalsScreen from '../screens/onboarding/HealthGoalsScreen';
import ConnectDevicesScreen from '../screens/onboarding/ConnectDevicesScreen';

import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();



import SignUpScreen from '../screens/auth/SignUpScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
            <Stack.Screen name="HealthConditions" component={HealthConditionsScreen} />
            <Stack.Screen name="HealthGoals" component={HealthGoalsScreen} />
            <Stack.Screen name="ConnectDevices" component={ConnectDevicesScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
    );
}

import BottomTabNavigator from './BottomTabNavigator';
import WellnessScoreScreen from '../screens/health/WellnessScoreScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import ProgramDetailsScreen from '../screens/programs/ProgramDetailsScreen';

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="WellnessScore" component={WellnessScoreScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
        </Stack.Navigator>
    );
}

function ConsentStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Consent" component={ConsentScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { userToken, isLoading: isAuthLoading } = useAuth();
    const { hasConsented, isLoadingConsent } = useConsent();

    console.log("AppNavigator: Rendering. userToken:", userToken, "hasConsented:", hasConsented);

    if (isAuthLoading || isLoadingConsent) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? (
                hasConsented ? <AppStack /> : <ConsentStack />
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 20,
        marginBottom: 20
    }
})
