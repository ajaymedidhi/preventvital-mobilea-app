import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { createSubscription, verifySubscription } from '../../api/subscriptionApi';
import { useAuth } from '../../auth/AuthContext';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
        features: ['Basic Health Tracking', 'Community Access'],
        backgroundColor: '#ffffff',
        headerColor: '#64748b',
        buttonGradient: ['#56A3CD', '#AA41B4'],
        buttonColor: null, // We'll use gradient for Free
        isCurrent: true,
        buttonText: 'Current'
    },
    {
        id: 'silver',
        name: 'Silver',
        monthlyPrice: 499,
        annualPrice: 4999,
        features: ['Basic Health Tracking', 'Community Access', 'Priority Support', 'Ad - free Experience'],
        backgroundColor: '#EBEBEB',
        headerColor: '#6b7280',
        buttonGradient: null,
        buttonColor: '#B6C0C6', // Grey button
        isCurrent: false,
        buttonText: 'Upgrade Now'
    },
    {
        id: 'gold',
        name: 'Gold',
        monthlyPrice: 999,
        annualPrice: 9999,
        features: ['All Silver Features', 'Advanced Analytics', '1 Free Consultation/mo', 'Device Sync'],
        backgroundColor: '#FFF8CE',
        headerColor: '#E6A800',
        buttonGradient: null,
        buttonColor: '#EAB308', // Gold button
        isCurrent: false,
        buttonText: 'Upgrade Now'
    },
    {
        id: 'platinum',
        name: 'Platinum',
        monthlyPrice: 2499,
        annualPrice: 24999,
        features: ['All Gold Features', 'Unlimited Consultations', 'Family Plan ( up to 4)', 'Personal Health Coach'],
        backgroundColor: '#DBFBFF',
        headerColor: '#1774A0',
        buttonGradient: null,
        buttonColor: '#2691C3', // Blue button
        isCurrent: false,
        buttonText: 'Upgrade Now'
    }
];

const SubscriptionScreen = () => {
    const navigation = useNavigation();
    const { userToken } = useAuth(); // If needed for refetching user profile later
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

    const handleSubscribe = async (plan: any) => {
        if (plan.monthlyPrice === 0) {
            Alert.alert("Current Plan", "You are already on the Free tier.");
            return;
        }

        setLoading(true);
        setProcessingPlanId(plan.id);

        try {
            // 1. Create Subscription on Backend
            console.log(`Creating subscription for ${plan.name} (${isAnnual ? 'Annual' : 'Monthly'})...`);
            const subscription = await createSubscription(plan.id, isAnnual ? 'annual' : 'monthly');
            console.log("Subscription Created:", subscription);

            // 2. Mock Payment Flow (Since native modules are tricky in Expo Go)
            // In production, integrate 'react-native-razorpay' or WebView here.

            // Simulating user payment interaction...
            Alert.alert(
                "Confirm Payment",
                `Pay ₹${isAnnual ? plan.annualPrice : plan.monthlyPrice} for ${plan.name}? (Mock Payment)`,
                [
                    {
                        text: "Cancel",
                        onPress: () => {
                            setLoading(false);
                            setProcessingPlanId(null);
                        },
                        style: "cancel"
                    },
                    {
                        text: "Pay Now",
                        onPress: async () => {
                            await finalizeMockPayment(subscription, plan.id);
                        }
                    }
                ]
            );

        } catch (error: any) {
            Alert.alert("Error", error.message);
            setLoading(false);
            setProcessingPlanId(null);
        }
    };

    const finalizeMockPayment = async (subscription: any, planId: string) => {
        try {
            // 3. Verify on Backend
            const paymentData = {
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_subscription_id: subscription.id,
                razorpay_signature: 'mock_signature', // Backend needs to allow this for dev/test
                planId: planId
            };

            console.log("Verifying payment...", paymentData);
            await verifySubscription(paymentData);

            Alert.alert("Success", "Subscription active! Welcome to " + PLANS.find(p => p.id === planId)?.name);
            navigation.goBack(); // Or navigate to Home/Profile

        } catch (error: any) {
            Alert.alert("Payment Failed", error.message);
        } finally {
            setLoading(false);
            setProcessingPlanId(null);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Your Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.toggleContainerWrapper}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, !isAnnual && styles.toggleActive]}
                        onPress={() => setIsAnnual(false)}
                    >
                        <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, isAnnual && styles.toggleActive]}
                        onPress={() => setIsAnnual(true)}
                    >
                        <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Annual ( Save ~ 17%)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {PLANS.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[
                            styles.planCard,
                            { backgroundColor: plan.backgroundColor },
                            plan.id === 'gold' && { borderColor: '#EAB308', borderWidth: 1 },
                            plan.id === 'platinum' && { borderColor: '#38bdf8', borderWidth: 1 }
                        ]}
                        activeOpacity={0.9}
                        onPress={() => handleSubscribe(plan)}
                        disabled={loading}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={[styles.planName, { color: plan.headerColor }]}>{plan.name}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceValue}>
                                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                                </Text>
                                <Text style={styles.pricePeriod}>
                                    /{isAnnual ? 'yr' : 'mo'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.featuresList}>
                            {plan.features.map((feature, idx) => (
                                <View key={idx} style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" style={styles.checkIcon} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {plan.buttonGradient ? (
                            <LinearGradient
                                colors={plan.buttonGradient as unknown as readonly [string, string, ...string[]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.subscribeButton}
                            >
                                <Text style={styles.subscribeText}>{plan.buttonText}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={[styles.subscribeButton, { backgroundColor: plan.buttonColor }]}>
                                {loading && processingPlanId === plan.id ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.subscribeText}>{plan.buttonText}</Text>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    backButton: { padding: 8 },

    toggleContainerWrapper: {
        paddingHorizontal: 20,
        marginBottom: 20
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EBEBEB', // Light grey background like mockup
        borderRadius: 8,
        padding: 4,
    },
    toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
    toggleActive: { backgroundColor: '#3b82f6', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }, // Active blue background
    toggleText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    toggleTextActive: { color: '#fff' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    planCard: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: { marginBottom: 16 },
    planName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
    priceValue: { fontSize: 36, fontWeight: 'bold', color: '#0f172a' },
    pricePeriod: { fontSize: 14, color: '#64748b', marginLeft: 4 },

    divider: { height: 1, backgroundColor: '#d1d5db', marginBottom: 16 },

    featuresList: { marginBottom: 24 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkIcon: { marginRight: 10 },
    featureText: { fontSize: 14, color: '#475569', fontWeight: '500' },

    subscribeButton: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subscribeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SubscriptionScreen;
