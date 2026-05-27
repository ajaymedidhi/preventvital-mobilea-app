import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { Colors, Gradients } from '../../theme/colors';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
        icon: 'leaf-outline' as const,
        color: '#64748B',
        accentBg: '#F1F5F9',
        features: [
            'Basic health tracking',
            'CVITAL score (1 assessment/month)',
            'Community access',
            '4 free wellness programs',
        ],
        buttonGradient: Gradients.brand,
        buttonText: 'Current Plan',
    },
    {
        id: 'premium',
        name: 'Premium',
        monthlyPrice: 299,
        annualPrice: 2999,
        icon: 'star-outline' as const,
        color: '#2563EB',
        accentBg: '#EFF6FF',
        features: [
            'Everything in Free',
            'Unlimited assessments',
            'Priority support',
            'Ad-free experience',
            'Advanced vitals history',
        ],
        buttonGradient: null,
        buttonColor: '#2563EB',
        buttonText: 'Upgrade to Premium',
    },
    {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 499,
        annualPrice: 4999,
        icon: 'diamond-outline' as const,
        color: '#D97706',
        accentBg: '#FFFBEB',
        features: [
            'Everything in Premium',
            'Advanced analytics',
            '1 free consultation/month',
            'Wearable device sync',
            'AI health insights',
        ],
        buttonGradient: null,
        buttonColor: '#D97706',
        buttonText: 'Upgrade to Pro',
        popular: true,
    },
    {
        id: 'family',
        name: 'Family',
        monthlyPrice: 999,
        annualPrice: 9999,
        icon: 'people-outline' as const,
        color: '#7C3AED',
        accentBg: '#F5F3FF',
        features: [
            'Everything in Pro',
            'Up to 4 family members',
            'Unlimited consultations',
            'Personal health coach',
            'Dedicated support line',
        ],
        buttonGradient: null,
        buttonColor: '#7C3AED',
        buttonText: 'Upgrade to Family',
    },
];

const SubscriptionScreen = () => {
    const navigation = useNavigation<any>();
    const { currentPlan, user } = useAuth();
    const [isAnnual, setIsAnnual] = useState(false);
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const [pendingPlan, setPendingPlan] = useState<string | null>(null);

    const isCorporate = user?.customerType === 'corporate';
    const corporateName = (user as any)?.corporateSubscription?.name || 'your organisation';

    const handleUpgrade = async (plan: typeof PLANS[0]) => {
        if (plan.monthlyPrice === 0 || plan.id === currentPlan) return;
        if (isCorporate) return;
        // Show "coming soon" inline — payment integration pending
        setPendingPlan(plan.id);
        setTimeout(() => setPendingPlan(null), 3000);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />

            {/* ── Gradient Header ──────────────────────── */}
            <LinearGradient colors={Gradients.brandFade} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} locations={[0, 0.55, 1]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Choose Your Plan</Text>
                            <Text style={styles.headerSub}>Unlock your full health potential</Text>
                        </View>
                    </View>

                    {/* Monthly / Annual toggle */}
                    <View style={styles.toggleWrap}>
                        {(['monthly', 'annual'] as const).map(mode => (
                            <TouchableOpacity
                                key={mode}
                                style={[styles.toggleBtn, (mode === 'annual') === isAnnual && styles.toggleBtnActive]}
                                onPress={() => setIsAnnual(mode === 'annual')}
                            >
                                <Text style={[styles.toggleText, (mode === 'annual') === isAnnual && styles.toggleTextActive]}>
                                    {mode === 'annual' ? 'Annual  ·  Save 17%' : 'Monthly'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* ── Corporate Banner ─────────────────────── */}
            {isCorporate && (
                <View style={styles.corporateBanner}>
                    <View style={styles.corporateIconWrap}>
                        <Ionicons name="business" size={18} color="#166534" />
                    </View>
                    <Text style={styles.corporateText}>
                        Managed by <Text style={{ fontWeight: '800' }}>{corporateName}</Text>. Contact your admin for plan changes.
                    </Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {PLANS.map((plan) => {
                    const isCurrentPlan = plan.id === currentPlan;
                    const isProcessing = processingPlanId === plan.id;
                    const isPending = pendingPlan === plan.id;

                    return (
                        <View key={plan.id} style={[
                            styles.planCard,
                            isCurrentPlan && styles.planCardCurrent,
                            plan.popular && !isCurrentPlan && styles.planCardPopular,
                        ]}>
                            {/* Popular badge */}
                            {plan.popular && !isCurrentPlan && (
                                <View style={styles.popularBadge}>
                                    <Ionicons name="flame" size={11} color="#FFF" />
                                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                                </View>
                            )}
                            {isCurrentPlan && (
                                <View style={[styles.popularBadge, { backgroundColor: '#16A34A' }]}>
                                    <Ionicons name="checkmark-circle" size={11} color="#FFF" />
                                    <Text style={styles.popularBadgeText}>Current Plan</Text>
                                </View>
                            )}

                            {/* Plan header */}
                            <View style={styles.planHeader}>
                                <View style={[styles.planIcon, { backgroundColor: plan.accentBg }]}>
                                    <Ionicons name={plan.icon} size={22} color={plan.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceValue}>
                                            {plan.monthlyPrice === 0 ? 'Free' : `₹${isAnnual ? plan.annualPrice : plan.monthlyPrice}`}
                                        </Text>
                                        {plan.monthlyPrice > 0 && (
                                            <Text style={styles.pricePeriod}>/{isAnnual ? 'yr' : 'mo'}</Text>
                                        )}
                                    </View>
                                    {isAnnual && plan.monthlyPrice > 0 && (
                                        <Text style={styles.savingsNote}>
                                            Save ₹{(plan.monthlyPrice * 12) - plan.annualPrice}/yr
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Features */}
                            <View style={styles.featuresList}>
                                {plan.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureItem}>
                                        <View style={[styles.featureCheck, { backgroundColor: plan.accentBg }]}>
                                            <Ionicons name="checkmark" size={12} color={plan.color} />
                                        </View>
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Payment coming soon notice */}
                            {isPending && (
                                <View style={styles.pendingNotice}>
                                    <Ionicons name="time-outline" size={14} color="#D97706" />
                                    <Text style={styles.pendingNoticeText}>
                                        Online payment coming soon. Contact us to upgrade.
                                    </Text>
                                </View>
                            )}

                            {/* CTA Button */}
                            {isCurrentPlan ? (
                                <View style={[styles.ctaBtn, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC' }]}>
                                    <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                                    <Text style={[styles.ctaBtnText, { color: '#16A34A' }]}>Your Current Plan</Text>
                                </View>
                            ) : isCorporate ? (
                                <View style={[styles.ctaBtn, { backgroundColor: '#F1F5F9' }]}>
                                    <Ionicons name="business-outline" size={16} color="#64748B" />
                                    <Text style={[styles.ctaBtnText, { color: '#64748B' }]}>Managed by Organisation</Text>
                                </View>
                            ) : plan.buttonGradient ? (
                                <TouchableOpacity onPress={() => handleUpgrade(plan)} activeOpacity={0.88}>
                                    <LinearGradient colors={plan.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                                        <Text style={styles.ctaBtnText}>{plan.buttonText}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.ctaBtn, { backgroundColor: isProcessing ? '#E2E8F0' : plan.buttonColor }]}
                                    onPress={() => handleUpgrade(plan)}
                                    disabled={isProcessing}
                                    activeOpacity={0.88}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <>
                                            <Ionicons name="arrow-up-circle-outline" size={16} color="#FFF" />
                                            <Text style={styles.ctaBtnText}>{plan.buttonText}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Contact CTA */}
                <TouchableOpacity style={styles.contactRow} onPress={() => navigation.navigate('ContactUs')}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.gradientStart} />
                    <Text style={styles.contactText}>Need help choosing? <Text style={styles.contactLink}>Chat with us</Text></Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: { paddingBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 12, marginBottom: 16 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 12, color: '#C7D2FE', fontWeight: '500', marginTop: 2 },

    // Toggle
    toggleWrap: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3 },
    toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
    toggleBtnActive: { backgroundColor: '#FFF' },
    toggleText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
    toggleTextActive: { color: Colors.gradientStart },

    // Corporate banner
    corporateBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 20, marginTop: 16, padding: 12,
        backgroundColor: '#DCFCE7', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0',
    },
    corporateIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
    corporateText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 17 },

    scrollContent: { padding: 20 },

    // Plan cards
    planCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    planCardCurrent: { borderColor: '#86EFAC', borderWidth: 1.5 },
    planCardPopular: { borderColor: '#FDE68A', borderWidth: 1.5 },

    popularBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        position: 'absolute', top: -1, right: 16,
        backgroundColor: '#D97706', paddingHorizontal: 10, paddingVertical: 4,
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    },
    popularBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

    planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16, marginTop: 8 },
    planIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    planName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    priceValue: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
    pricePeriod: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
    savingsNote: { fontSize: 10, color: '#16A34A', fontWeight: '700', marginTop: 2 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

    featuresList: { gap: 10, marginBottom: 20 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureCheck: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    featureText: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },

    pendingNotice: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, marginBottom: 12,
        borderWidth: 1, borderColor: '#FDE68A',
    },
    pendingNoticeText: { flex: 1, fontSize: 11, color: '#92400E', lineHeight: 16 },

    ctaBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, height: 48, borderRadius: 12,
    },
    ctaBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

    contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
    contactText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    contactLink: { color: Colors.gradientStart, fontWeight: '700' },
});

export default SubscriptionScreen;
