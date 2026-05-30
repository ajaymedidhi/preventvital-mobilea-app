import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { useConsent } from '../health/ConsentContext';

import ConsentScreen from '../screens/health/ConsentScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import CardioAssessmentScreen from '../screens/onboarding/CardioAssessmentScreen';
import AssessmentResultsScreen from '../screens/onboarding/AssessmentResultsScreen';
import AssessmentHistoryScreen from '../screens/health/AssessmentHistoryScreen';
import TermsAndConditionsScreen from '../screens/legal/TermsAndConditionsScreen';
import PrivacyOverviewScreen from '../screens/legal/PrivacyOverviewScreen';
import PrivacyPolicyLandingScreen from '../screens/legal/PrivacyPolicyLandingScreen';
import PrivacyDetailScreen from '../screens/legal/PrivacyDetailScreen';

import BottomTabNavigator from './BottomTabNavigator';
import WellnessScoreScreen from '../screens/health/WellnessScoreScreen';
import WearableDashboardScreen from '../screens/health/WearableDashboardScreen';
import AllVitalsScreen from '../screens/health/AllVitalsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProgramDetailsScreen from '../screens/programs/ProgramDetailsScreen';
import MyProgramsScreen from '../screens/programs/MyProgramsScreen';
import ProgramDayViewScreen from '../screens/programs/ProgramDayViewScreen';
import SessionPlayerScreen from '../screens/programs/SessionPlayerScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';

import ConsultationScreen from '../screens/consultation/ConsultationScreen';
import FamilyPlanScreen from '../screens/profile/FamilyPlanScreen';
import ManualVitalsEntryScreen from '../screens/health/ManualVitalsEntryScreen';
import HealthCoachScreen from '../screens/coach/HealthCoachScreen';
import CorporateDashboardScreen from '../screens/corporate/CorporateDashboardScreen';
import ASCVDExplainerScreen from '../screens/health/ASCVDExplainerScreen';
import AchievementsScreen from '../screens/community/AchievementsScreen';

import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import CheckoutScreen from '../screens/shop/CheckoutScreen';
import OrderSuccessScreen from '../screens/shop/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/shop/OrderHistoryScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
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

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="WellnessScore" component={WellnessScoreScreen} />
            <Stack.Screen name="WearableDashboard" component={WearableDashboardScreen} />
            <Stack.Screen name="AllVitals" component={AllVitalsScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
            <Stack.Screen name="MyPrograms" component={MyProgramsScreen} />
            <Stack.Screen name="ProgramDayView" component={ProgramDayViewScreen} />
            <Stack.Screen name="SessionPlayer" component={SessionPlayerScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
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
            <Stack.Screen name="Consultation" component={ConsultationScreen} />
            <Stack.Screen name="FamilyPlan" component={FamilyPlanScreen} />
            <Stack.Screen name="ManualVitalsEntry" component={ManualVitalsEntryScreen} />
            <Stack.Screen name="HealthCoach" component={HealthCoachScreen} />
            <Stack.Screen name="CorporateDashboard" component={CorporateDashboardScreen} />
            <Stack.Screen name="ASCVDExplainer" component={ASCVDExplainerScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
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

    if (isAuthLoading || isLoadingConsent) {
        return null;
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
