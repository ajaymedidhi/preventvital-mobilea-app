import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

export default function AssessmentResultsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { setAuthToken, userToken, user: contextUser } = useAuth();
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
        patientName: user?.name || 'User',
        patientAge: formData?.age || 0,
        patientSex: formData?.sex === 'female' ? 'Female' : 'Male',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

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

    const animatedPulseStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value
    }));

    const handleGoToDashboard = async () => {
        const effectiveToken = token || userToken;
        const effectiveUser = user || contextUser;

        if (effectiveToken && effectiveUser) {
            const updatedProfile = {
                ...(effectiveUser.profile || {}),
                healthScore: results.cvitalScore
            };
            const updatedUser = { ...effectiveUser, profile: updatedProfile };
            await setAuthToken(effectiveToken, updatedUser);

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            }, 100);
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        }
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
                    
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.patientCard}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={24} color="#8B5CF6" />
                        </View>
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{results.patientName}</Text>
                            <Text style={styles.patientMeta}>{results.patientAge} yrs • {results.patientSex}</Text>
                        </View>
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateLabel}>DATE</Text>
                            <Text style={styles.dateValue}>{results.date}</Text>
                        </View>
                    </Animated.View>

                    <View style={styles.scoresContainer}>
                        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.mainScoreCard, { borderColor: results.cvitalTierDetails.color }]}>
                            <View style={styles.scoreBadge}>
                                <Ionicons name="pulse" size={14} color={results.cvitalTierDetails.color} />
                                <Text style={[styles.scoreBadgeText, { color: results.cvitalTierDetails.color }]}>VITALITY INDEX</Text>
                            </View>
                            <Text style={styles.scoreValue}>{results.cvitalScore}</Text>
                            <Text style={[styles.scoreTier, { color: results.cvitalTierDetails.color }]}>{results.cvitalTierDetails.label}</Text>
                            <View style={[styles.actionBox, { borderLeftColor: results.cvitalTierDetails.color }]}>
                                <Text style={styles.actionText}>{results.cvitalTierDetails.action}</Text>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.secondaryScoreCard}>
                            <View style={styles.scoreBadge}>
                                <Ionicons name="medkit" size={14} color="#3B82F6" />
                                <Text style={[styles.scoreBadgeText, { color: '#3B82F6' }]}>10-YR RISK</Text>
                            </View>
                            <Text style={styles.riskValue}>{results.ascvdRisk}%</Text>
                            <Text style={styles.riskLabel}>ACC/AHA POOLED COHORT</Text>
                            <View style={styles.riskScale}>
                                <View style={[styles.scaleItem, results.ascvdRisk < 5 && styles.scaleActive, { borderLeftColor: '#10B981' }]}>
                                    <Text style={styles.scaleText}>Low {'<'}5%</Text>
                                </View>
                                <View style={[styles.scaleItem, results.ascvdRisk >= 5 && results.ascvdRisk < 20 && styles.scaleActive, { borderLeftColor: '#F59E0B' }]}>
                                    <Text style={styles.scaleText}>Borderline</Text>
                                </View>
                                <View style={[styles.scaleItem, results.ascvdRisk >= 20 && styles.scaleActive, { borderLeftColor: '#EF4444' }]}>
                                    <Text style={styles.scaleText}>High ≥20%</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.vaCard}>
                        <View style={styles.vaIconContainer}>
                            <Ionicons name="infinite" size={32} color="#F59E0B" />
                        </View>
                        <View style={styles.vaDivider} />
                        <View style={styles.vaInfo}>
                            <Text style={styles.vaLabel}>VASCULAR AGE</Text>
                            <Text style={styles.vaValue}>{results.vascularAge} <Text style={{ fontSize: 20 }}>yrs</Text></Text>
                            <Text style={styles.vaNote}>Chronological Age: {results.patientAge} years</Text>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.aiCard}>
                        <View style={styles.aiHeader}>
                            <Animated.View style={[styles.aiPulse, animatedPulseStyle]} />
                            <Text style={styles.aiTitle}>CLINICAL INTELLIGENCE</Text>
                        </View>
                        <Text style={styles.aiText}>
                            Based on your assessment, your cardiovascular profile shows {results.cvitalTierDetails.label.toLowerCase()} risk. 
                            We recommend focusing on {results.cvitalTierDetails.action.toLowerCase()}. 
                            Regular monitoring of your vitals is advised.
                        </Text>
                    </Animated.View>

                    <View style={styles.footerButtons}>
                        <TouchableOpacity style={styles.gradientButtonContainer} onPress={handleGoToDashboard}>
                            <LinearGradient
                                colors={['#60A5FA', '#8B5CF6']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.gradientButtonText}>Go to Dashboard</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('CardioAssessment')}>
                            <Text style={styles.outlineButtonText}>Retake Assessment</Text>
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

    patientCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0'
    },
    avatarContainer: {
        width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F3FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    patientInfo: { flex: 1 },
    patientName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    patientMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
    dateContainer: { alignItems: 'flex-end' },
    dateLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold' },
    dateValue: { fontSize: 13, color: '#1E293B', marginTop: 2 },

    scoresContainer: { gap: 20, marginBottom: 20 },
    mainScoreCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4
    },
    scoreBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 16
    },
    scoreBadgeText: { fontSize: 11, fontWeight: 'bold', marginLeft: 6, letterSpacing: 1 },
    scoreValue: { fontSize: 64, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
    scoreTier: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, marginTop: -8, marginBottom: 20 },
    actionBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderLeftWidth: 4 },
    actionText: { fontSize: 13, color: '#475569', lineHeight: 20 },

    secondaryScoreCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#E2E8F0'
    },
    riskValue: { fontSize: 48, fontWeight: 'bold', color: '#3B82F6', textAlign: 'center' },
    riskLabel: { fontSize: 10, color: '#94A3B8', textAlign: 'center', letterSpacing: 1, marginBottom: 20 },
    riskScale: { gap: 8 },
    scaleItem: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8,
        backgroundColor: '#F8FAFC', borderLeftWidth: 3
    },
    scaleActive: { backgroundColor: '#F1F5F9' },
    scaleText: { fontSize: 12, color: '#475569' },

    vaCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0'
    },
    vaIconContainer: { width: 56, alignItems: 'center' },
    vaDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', marginHorizontal: 20 },
    vaInfo: { flex: 1 },
    vaLabel: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 1 },
    vaValue: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginVertical: 4 },
    vaNote: { fontSize: 13, color: '#64748B' },

    aiCard: {
        backgroundColor: '#F5F3FF', borderRadius: 20, padding: 24, marginBottom: 32,
        borderWidth: 1, borderColor: '#DDD6FE'
    },
    aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    aiPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6', marginRight: 10 },
    aiTitle: { color: '#8B5CF6', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    aiText: { fontSize: 14, color: '#4C1D95', lineHeight: 22 },

    footerButtons: { gap: 16, paddingBottom: 40 },
    gradientButtonContainer: { height: 56 },
    gradientButton: { flex: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    gradientButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    outlineButton: {
        height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center'
    },
    outlineButtonText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
});
