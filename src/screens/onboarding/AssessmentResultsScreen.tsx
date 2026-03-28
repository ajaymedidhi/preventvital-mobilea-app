import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

export default function AssessmentResultsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { refreshUser, userToken, user: contextUser } = useAuth();
    const { token, user, formData, scoreData } = route.params || {};

    const results = {
        cvitalScore: scoreData?.cvitalScore || 0,
        cvitalTier: scoreData?.cvitalTier || 'PENDING',
        cvitalTierDetails: scoreData?.cvitalTierDetails || {
            action: "Awaiting calculation",
            color: "#94A3B8",
            label: "Pending"
        },
        ascvdRisk: scoreData?.ascvdRisk || 0,
        vascularAge: scoreData?.vascularAge || 0,
        patientName: user?.name || contextUser?.profile?.firstName || 'User',
        patientAge: formData?.age || route.params?.assessmentData?.demographics?.age || 0,
        patientSex: (formData?.sex || route.params?.assessmentData?.demographics?.sex || 'Male').toLowerCase() === 'female' ? 'Female' : 'Male',
        weight: parseFloat(formData?.weight) || route.params?.assessmentData?.anthropometry?.weight || 0,
        height: parseFloat(formData?.height) || route.params?.assessmentData?.anthropometry?.height || 0,
        bodyFat: parseFloat(formData?.bodyFat) || route.params?.assessmentData?.anthropometry?.bodyFatPercentage || 0,
        date: route.params?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const getBodyFatDetails = () => {
        const bf = results.bodyFat;
        const isFemale = formData?.sex === 'female';
        
        let categories = isFemale 
            ? [{lbl:'Essential',min:0,max:14,col:'#F59E0B'},{lbl:'Healthy',min:14,max:25,col:'#10B981'},{lbl:'Overfat',min:25,max:32,col:'#FB923C'},{lbl:'Obese',min:32,max:60,col:'#EF4444'}]
            : [{lbl:'Essential',min:0,max:6,col:'#F59E0B'},{lbl:'Healthy',min:6,max:18,col:'#10B981'},{lbl:'Overfat',min:18,max:26,col:'#FB923C'},{lbl:'Obese',min:26,max:60,col:'#EF4444'}];
        
        let currentCat = categories[1]; // Default Healthy
        for (let cat of categories) {
            if (bf >= cat.min && bf < cat.max) {
                currentCat = cat;
                break;
            }
        }
        if (bf >= 60) currentCat = categories[3];

        const fatMass = (results.weight * (bf / 100)).toFixed(1);
        const leanMass = (results.weight - parseFloat(fatMass)).toFixed(1);
        const bmi = results.height > 0 ? (results.weight / (Math.pow(results.height / 100, 2))).toFixed(1) : '0';
        const scoreImpact = scoreData?.domainBreakdown?.bodyFat || 0;

        let action = "";
        if (currentCat.lbl === 'Obese' || currentCat.lbl === 'Overfat') {
            action = "High body fat is a strong independent predictor of insulin resistance, hypertension and ASCVD. Weight management through diet and exercise is recommended.";
        } else if (currentCat.lbl === 'Essential') {
            action = "Body fat is critically low. Nutritional assessment and medical review recommended.";
        } else {
            action = "Body fat is within a healthy range. Maintain current lifestyle and balanced nutrition.";
        }

        return { 
            cat: currentCat.lbl, 
            color: currentCat.col, 
            fatMass, 
            leanMass, 
            bmi: bmi, // explicitly name to help TS inference
            action, 
            categories, 
            scoreImpact 
        };
    };

    const bfDetails = getBodyFatDetails();

    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const getManagementPlan = () => {
        const tier = results.cvitalTierDetails.tier || 'high';
        const ascvd = results.ascvdRisk;
        
        return [
            { id: 1, title: 'REVIEW FREQUENCY', value: results.cvitalTierDetails.reviewInterval || 'Checkup', icon: 'calendar', color: '#EF4444' },
            { id: 2, title: 'PHARMACOTHERAPY', value: ascvd >= 7.5 ? 'Statin + Multi-drug' : 'Standard preventative', icon: 'medkit', color: '#F59E0B' },
            { id: 3, title: 'LIFESTYLE', value: 'Supervised cardiac rehab', icon: 'walk', color: '#10B981' },
            { id: 4, title: 'LAB TESTS', value: 'Lipids, HbA1c quarterly', icon: 'flask', color: '#3B82F6' },
            { id: 5, title: 'CARDIOLOGY', value: tier === 'high' ? 'Urgent referral required' : 'Elective review advised', icon: 'heart', color: '#EF4444' },
            { id: 6, title: 'DIGITAL MONITORING', value: 'Continuous ECG / 24h ambulatory', icon: 'stats-chart', color: '#8B5CF6' }
        ];
    };

    const handleGoToDashboard = async () => {
        const effectiveToken = token || userToken;
        const effectiveUser = user || contextUser;

        if (effectiveToken && effectiveUser) {
            await refreshUser();
            setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }, 100);
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
    };

    const renderDomainBar = (label: string, earned: number, max: number, color: string) => {
        const percentage = Math.max(0, Math.min(100, (earned / max) * 100));
        return (
            <View style={styles.domainItem}>
                <View style={styles.domainHeader}>
                    <Text style={styles.domainLabel}>{label}</Text>
                    <Text style={styles.domainValue}>{earned} / {max}</Text>
                </View>
                <View style={styles.domainBarBg}>
                    <Animated.View 
                        entering={FadeInDown.delay(600).duration(800)}
                        style={[styles.domainBarFill, { width: `${percentage}%`, backgroundColor: color }]} 
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#60A5FA', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>ASSESSMENT RESULTS</Text>
                        <View style={{ width: 32 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.premiumHeaderCard}>
                        <View style={styles.phTop}>
                            <View style={styles.phAvatarContainer}>
                                <Ionicons name="person" size={20} color="#fff" />
                            </View>
                            <View style={styles.phPatientInfo}>
                                <Text style={styles.phPatientName}>{results.patientName}</Text>
                                <Text style={styles.phPatientMeta}>
                                    {results.patientAge} years • {formData?.sex === 'male' ? '♂ Male' : '♀ Female'} • BMI: {bfDetails.bmi} kg/m²
                                </Text>
                            </View>
                            <View style={styles.phDateContainer}>
                                <Text style={styles.phDateLabel}>REPORT DATE</Text>
                                <Text style={styles.phDateValue}>{results.date.toUpperCase()}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <View style={styles.primaryScoresRow}>
                        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.gaugeCard}>
                            <View style={styles.cardBadge}>
                                <Ionicons name="pulse" size={12} color="#10B981" />
                                <Text style={styles.cardBadgeText}>CVITAL SCORE™</Text>
                            </View>
                            <View style={styles.gaugeContainer}>
                                <View style={styles.gaugeCircle}>
                                    <Text style={styles.gaugeValue}>{results.cvitalScore}</Text>
                                    <Text style={[styles.gaugeTier, { color: results.cvitalTierDetails.color }]}>
                                        {results.cvitalTierDetails.label.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.infoBox, { borderLeftColor: results.cvitalTierDetails.color }]}>
                                <Text style={styles.infoText}>{results.cvitalTierDetails.action}</Text>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.gaugeCard}>
                            <View style={styles.cardBadge}>
                                <Ionicons name="medkit" size={12} color="#3B82F6" />
                                <Text style={[styles.cardBadgeText, { color: '#3B82F6' }]}>ASCVD 10-YEAR RISK</Text>
                            </View>
                            <View style={styles.riskCentral}>
                                <Text style={styles.riskBigValue}>{results.ascvdRisk}<Text style={{ fontSize: 20 }}>%</Text></Text>
                                <Text style={styles.riskSubLabel}>ACC/AHA POOLED COHORT (2013)</Text>
                            </View>
                            
                            <View style={[styles.statusBadge, { alignSelf: 'center', backgroundColor: results.ascvdRisk >= 20 ? '#EF444420' : results.ascvdRisk >= 5 ? '#F59E0B20' : '#10B98120', marginBottom: 16 }]}>
                                <View style={[styles.statusDot, { backgroundColor: results.ascvdRisk >= 20 ? '#EF4444' : results.ascvdRisk >= 5 ? '#F59E0B' : '#10B981' }]} />
                                <Text style={[styles.statusText, { color: results.ascvdRisk >= 20 ? '#EF4444' : results.ascvdRisk >= 5 ? '#F59E0B' : '#10B981' }]}>
                                    {results.ascvdRisk >= 20 ? 'HIGH RISK' : results.ascvdRisk >= 7.5 ? 'INTERMEDIATE' : results.ascvdRisk >= 5 ? 'BORDERLINE' : 'LOW RISK'}
                                </Text>
                            </View>

                            <View style={styles.riskScaleFlat}>
                                <View style={[styles.riskSegment, { backgroundColor: '#10B981', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]}>
                                    <Text style={styles.segmentText}>LOW</Text>
                                </View>
                                <View style={[styles.riskSegment, { backgroundColor: '#F59E0B' }]}>
                                    <Text style={styles.segmentText}>BORD.</Text>
                                </View>
                                <View style={[styles.riskSegment, { backgroundColor: '#F97316' }]}>
                                    <Text style={styles.segmentText}>INT.</Text>
                                </View>
                                <View style={[styles.riskSegment, { backgroundColor: '#EF4444', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]}>
                                    <Text style={styles.segmentText}>HIGH</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.bfCardPremium}>
                        <View style={styles.bfHeaderPremium}>
                            <Ionicons name="body-outline" size={20} color="#10B981" />
                            <Text style={styles.bfTitlePremium}>BODY FAT PERCENTAGE</Text>
                        </View>
                        <View style={styles.bfRowPremium}>
                            <View style={styles.bfIndicatorPremium}>
                                <Text style={styles.bfValuePremium}>{results.bodyFat}<Text style={{ fontSize: 18 }}>%</Text></Text>
                                <View style={[styles.statusBadge, { backgroundColor: bfDetails.color + '20' }]}>
                                    <Text style={[styles.statusText, { color: bfDetails.color }]}>{bfDetails.cat.toUpperCase()}</Text>
                                </View>
                            </View>
                            <View style={styles.bfStatsPremium}>
                                <View style={styles.bfStatItem}><Text style={styles.bfStatLabel}>FAT MASS</Text><Text style={styles.bfStatValue}>{bfDetails.fatMass} kg</Text></View>
                                <View style={styles.bfStatItem}><Text style={styles.bfStatLabel}>LEAN MASS</Text><Text style={styles.bfStatValue}>{bfDetails.leanMass} kg</Text></View>
                                <View style={styles.bfStatItem}><Text style={styles.bfStatLabel}>BMI</Text><Text style={styles.bfStatValue}>{bfDetails.bmi}</Text></View>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.vaCardPremium}>
                        <View style={styles.vaTopRow}>
                            <Ionicons name="timer-outline" size={24} color="#F59E0B" />
                            <Text style={styles.vaLabelPremium}>VASCULAR AGE™</Text>
                        </View>
                        <View style={styles.vaMainContent}>
                            <Text style={styles.vaValueBig}>{results.vascularAge} <Text style={{ fontSize: 24 }}>yrs</Text></Text>
                            <View style={styles.vaComparison}>
                                <Text style={styles.vaChronological}>Chronological Age: <Text style={{ color: '#1E293B', fontWeight: 'bold' }}>{results.patientAge} years</Text></Text>
                                {results.vascularAge > results.patientAge && (
                                    <Text style={styles.vaWarningText}>
                                        Vascular system is ageing <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{results.vascularAge - results.patientAge} years faster</Text> than biological age
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>MONITORING & MANAGEMENT PLAN</Text>
                        <View style={styles.managementGrid}>
                            {getManagementPlan().map((item) => (
                                <View key={item.id} style={styles.manageCard}>
                                    <View style={styles.manageHeader}>
                                        <Ionicons name={item.icon as any} size={16} color={item.color} />
                                        <Text style={[styles.manageTitle, { color: item.color }]}>{item.title}</Text>
                                    </View>
                                    <Text style={styles.manageValue}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(550).duration(500)} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>DOMAIN SCORE BREAKDOWN</Text>
                        <View style={styles.breakdownCard}>
                            {renderDomainBar('👤 Demographics', scoreData?.domainTotals?.demographics?.earned || 0, scoreData?.domainTotals?.demographics?.max || 15, '#EF4444')}
                            {renderDomainBar('⚖️ Metabolic Risk', scoreData?.domainTotals?.metabolic?.earned || 0, scoreData?.domainTotals?.metabolic?.max || 25, '#F59E0B')}
                            {renderDomainBar('❤️ Vascular History', scoreData?.domainTotals?.vascular?.earned || 0, scoreData?.domainTotals?.vascular?.max || 20, '#EF4444')}
                            {renderDomainBar('🏃 Lifestyle', scoreData?.domainTotals?.lifestyle?.earned || 0, scoreData?.domainTotals?.lifestyle?.max || 20, '#F59E0B')}
                            {renderDomainBar('🏥 Organ Health', scoreData?.domainTotals?.organHealth?.earned || 0, scoreData?.domainTotals?.organHealth?.max || 20, '#F59E0B')}
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.intelligenceCard}>
                        <View style={styles.intelligenceHeader}>
                            <View style={styles.bluePulse} />
                            <Text style={styles.intelligenceTitle}>CLINICAL INTELLIGENCE SUMMARY</Text>
                        </View>
                        <Text style={styles.intelligenceText}>
                            <Text style={{ fontWeight: 'bold' }}>{results.patientName}</Text>, {results.patientAge}-year-old {results.patientSex.toLowerCase()}, presents with a 
                            <Text style={{ color: results.cvitalTierDetails.color, fontWeight: 'bold' }}> CVITAL Score™ of {results.cvitalScore} ({results.cvitalTierDetails.label.toUpperCase()})</Text> and an 
                            <Text style={{ fontWeight: 'bold' }}> ASCVD 10-year risk of {results.ascvdRisk}%</Text>. Vascular age is estimated at 
                            <Text style={{ fontWeight: 'bold' }}> {results.vascularAge} years</Text>. Recommendation: {results.cvitalTierDetails.action}
                        </Text>
                    </Animated.View>

                    <View style={styles.footerActions}>
                        <TouchableOpacity style={styles.primaryActionButton} onPress={handleGoToDashboard}>
                            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionGradient}>
                                <Text style={styles.actionButtonText}>Save & Go to Dashboard</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => navigation.navigate('CardioAssessment')}>
                            <Text style={styles.secondaryActionText}>Retake Assessment</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 40 },
    headerSafeArea: { paddingHorizontal: 24, paddingTop: 10 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
    },
    backButton: { padding: 4 },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        marginTop: -30, overflow: 'hidden'
    },
    scrollContent: { padding: 24, paddingTop: 32 },

    premiumHeaderCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 20 },
    phTop: { flexDirection: 'row', alignItems: 'center' },
    phAvatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    phPatientInfo: { flex: 1 },
    phPatientName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    phPatientMeta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    phDateContainer: { alignItems: 'flex-end' },
    phDateLabel: { fontSize: 8, color: '#64748B', fontWeight: 'bold' },
    phDateValue: { fontSize: 11, color: '#fff', fontWeight: 'bold', marginTop: 2 },

    primaryScoresRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    gaugeCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
    cardBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#10B981', marginLeft: 4, letterSpacing: 0.5 },
    gaugeContainer: { height: 120, justifyContent: 'center', alignItems: 'center' },
    gaugeCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    gaugeValue: { fontSize: 36, fontWeight: 'bold', color: '#1E293B' },
    gaugeTier: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
    infoBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderLeftWidth: 3, marginTop: 12 },
    infoText: { fontSize: 10, color: '#475569', lineHeight: 14 },

    riskCentral: { alignItems: 'center', marginVertical: 12 },
    riskBigValue: { fontSize: 36, fontWeight: 'bold', color: '#1E293B' },
    riskSubLabel: { fontSize: 8, color: '#94A3B8', textAlign: 'center', marginTop: 4 },
    riskScaleFlat: { flexDirection: 'row', height: 16, gap: 2, marginTop: 8 },
    riskSegment: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    segmentText: { fontSize: 7, color: '#fff', fontWeight: 'bold' },

    vaCardPremium: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    vaTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    vaLabelPremium: { fontSize: 11, fontWeight: 'bold', color: '#1E293B', marginLeft: 8, letterSpacing: 1 },
    vaValueBig: { fontSize: 48, fontWeight: 'bold', color: '#1E293B' },
    vaComparison: { borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 15, marginLeft: 15, flex: 1 },
    vaChronological: { fontSize: 13, color: '#64748B' },
    vaWarningText: { fontSize: 12, color: '#EF4444', marginTop: 4, lineHeight: 18 },
    vaMainContent: { flexDirection: 'row', alignItems: 'center' },

    sectionContainer: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 15, letterSpacing: 1, marginLeft: 4 },
    managementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    manageCard: { width: (width - 58) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    manageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    manageTitle: { fontSize: 9, fontWeight: 'bold', marginLeft: 6 },
    manageValue: { fontSize: 12, color: '#1E293B', fontWeight: '600' },

    breakdownCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    domainItem: { marginBottom: 16 },
    domainHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    domainLabel: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
    domainValue: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
    domainBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    domainBarFill: { height: '100%', borderRadius: 3 },

    bfCardPremium: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
    bfHeaderPremium: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    bfTitlePremium: { fontSize: 11, fontWeight: 'bold', color: '#10B981', marginLeft: 8, letterSpacing: 1 },
    bfRowPremium: { flexDirection: 'row', alignItems: 'center' },
    bfIndicatorPremium: { alignItems: 'center', paddingRight: 20, borderRightWidth: 1, borderRightColor: '#F1F5F9' },
    bfValuePremium: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
    bfStatsPremium: { flex: 1, paddingLeft: 20, gap: 8 },
    bfStatItem: { flexDirection: 'row', justifyContent: 'space-between' },
    bfStatLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold' },
    bfStatValue: { fontSize: 12, color: '#1E293B', fontWeight: 'bold' },

    intelligenceCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    intelligenceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    intelligenceTitle: { fontSize: 11, fontWeight: 'bold', color: '#3B82F6', letterSpacing: 1 },
    intelligenceText: { fontSize: 14, color: '#334155', lineHeight: 22 },
    bluePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', marginRight: 8 },

    footerActions: { gap: 12, paddingBottom: 40 },
    primaryActionButton: { height: 56, borderRadius: 16, overflow: 'hidden' },
    actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    secondaryActionButton: { height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
    secondaryActionText: { fontSize: 15, color: '#64748B', fontWeight: '600' },

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 9, fontWeight: 'bold' },
});
