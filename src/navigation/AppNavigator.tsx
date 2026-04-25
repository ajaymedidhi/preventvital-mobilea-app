import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { useConsent } from '../health/ConsentContext';
import PremiumLoadingScreen from '../components/PremiumLoadingScreen';

import ConsentScreen from '../screens/health/ConsentScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

import CardioAssessmentScreen from '../screens/onboarding/CardioAssessmentScreen';
import AssessmentResultsScreen from '../screens/onboarding/AssessmentResultsScreen';
import AssessmentHistoryScreen from '../screens/health/AssessmentHistoryScreen';
import TermsAndConditionsScreen from '../screens/legal/TermsAndConditionsScreen';
import PrivacyOverviewScreen from '../screens/legal/PrivacyOverviewScreen';
import PrivacyPolicyLandingScreen from '../screens/legal/PrivacyPolicyLandingScreen';
import PrivacyDetailScreen from '../screens/legal/PrivacyDetailScreen';

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
            <Stack.Screen name="CardioAssessment" component={CardioAssessmentScreen} />
            <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
            <Stack.Screen name="AssessmentHistory" component={AssessmentHistoryScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyOverview" component={PrivacyOverviewScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyPolicyLanding" component={PrivacyPolicyLandingScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyDetail" component={PrivacyDetailScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
}

import BottomTabNavigator from './BottomTabNavigator';
import WellnessScoreScreen from '../screens/health/WellnessScoreScreen';
import WearableDashboardScreen from '../screens/health/WearableDashboardScreen';
import AllVitalsScreen from '../screens/health/AllVitalsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import ProgramDetailsScreen from '../screens/programs/ProgramDetailsScreen';
import MyProgramsScreen from '../screens/programs/MyProgramsScreen';
import ProgramDayViewScreen from '../screens/programs/ProgramDayViewScreen';
import SessionPlayerScreen from '../screens/programs/SessionPlayerScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';

// Shop Screens
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import CheckoutScreen from '../screens/shop/CheckoutScreen';
import OrderSuccessScreen from '../screens/shop/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/shop/OrderHistoryScreen';

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="WellnessScore" component={WellnessScoreScreen} />
            <Stack.Screen name="WearableDashboard" component={WearableDashboardScreen} />
            <Stack.Screen name="AllVitals" component={AllVitalsScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
            <Stack.Screen name="MyPrograms" component={MyProgramsScreen} />
            <Stack.Screen name="ProgramDayView" component={ProgramDayViewScreen} />
            <Stack.Screen name="SessionPlayer" component={SessionPlayerScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
            
            {/* Shop Screens */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />

            <Stack.Screen name="CardioAssessment" component={CardioAssessmentScreen} />
            <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
            <Stack.Screen name="AssessmentHistory" component={AssessmentHistoryScreen} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyOverview" component={PrivacyOverviewScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyPolicyLanding" component={PrivacyPolicyLandingScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PrivacyDetail" component={PrivacyDetailScreen} options={{ presentation: 'modal' }} />
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

    console.log("AppNavigator: Rendering. userToken:", userToken ? "EXISTS" : "NULL", "hasConsented:", hasConsented, "isAuthLoading:", isAuthLoading, "isLoadingConsent:", isLoadingConsent);

    if (isAuthLoading || isLoadingConsent) {
        return <PremiumLoadingScreen />;
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
