import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

export default function AssessmentResultsScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { setAuthToken } = useAuth();
    const { token, user, formData, scoreData } = route.params || {};

    // If scoreData exists (passed from API), use it, else default for now
    const results = {
        cvitalScore: scoreData?.cvitalScore || 82,
        cvitalTier: scoreData?.cvitalTier || 'OPTIMAL',
        cvitalTierDetails: scoreData?.cvitalTierDetails || {
            action: "Good cardiovascular health. Optimise lifestyle factors.",
            color: "#4ade80",
            label: "Good"
        },
        ascvdRisk: scoreData?.ascvdRisk || 5.4,
        vascularAge: scoreData?.vascularAge || 42,
        patientName: user?.name || 'Your Name',
        patientAge: formData?.age || 45,
        patientSex: formData?.sex === 'female' ? 'Female' : 'Male',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const pulseAnim = useSharedValue(1);
    const gaugeAnim = useSharedValue(0);

    useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );

        gaugeAnim.value = withTiming(results.cvitalScore, {
            duration: 1500,
            easing: Easing.out(Easing.cubic)
        });
    }, []);

    const animatedPulseStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value
    }));

    const handleGoToDashboard = async () => {
        if (token && user) {
            // Setting the auth token switches the AppNavigator to AppStack if coming from AuthStack
            await setAuthToken(token, user);

            // Wait for AppStack to mount before navigating
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            }, 100);
        } else {
            // Already in AppStack (e.g. taking assessment from Dashboard)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#51A6CB', '#BF40A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.background}
            />
            <SafeAreaView style={styles.contentContainer}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.miniBrand}>🫀 CVITAL™ RESULTS</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Patient Header */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.patientHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👤</Text>
                        </View>
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{results.patientName}</Text>
                            <Text style={styles.patientMeta}>{results.patientAge} yrs • {results.patientSex}</Text>
                        </View>
                        <View style={styles.dateInfo}>
                            <Text style={styles.dateLabel}>ASSESSMENT DATE</Text>
                            <Text style={styles.dateVal}>{results.date}</Text>
                        </View>
                    </Animated.View>

                    {/* Scores Row */}
                    <View style={styles.scoresRow}>
                        {/* CVITAL Card */}
                        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.card, { borderWidth: 2, borderColor: results.cvitalTierDetails.color }]}>
                            <View style={styles.badgeWrap}>
                                <View style={[styles.cardBadge, { backgroundColor: `${results.cvitalTierDetails.color}1E`, borderColor: `${results.cvitalTierDetails.color}40` }]}>
                                    <Ionicons name="pulse" size={12} color={results.cvitalTierDetails.color} />
                                    <Text style={[styles.cardBadgeText, { color: results.cvitalTierDetails.color }]}>VITALITY INDEX</Text>
                                </View>
                            </View>

                            <View style={styles.gaugeWrap}>
                                <Text style={styles.gaugeNum}>{results.cvitalScore}</Text>
                                <Text style={[styles.gaugeTier, { color: results.cvitalTierDetails.color }]}>{results.cvitalTierDetails.label}</Text>
                            </View>

                            <View style={[styles.actionBox, { borderLeftColor: results.cvitalTierDetails.color }]}>
                                <Text style={styles.actionText}>{results.cvitalTierDetails.action}</Text>
                            </View>
                        </Animated.View>

                        {/* ASCVD Card */}
                        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.card, styles.ascvdCard]}>
                            <View style={styles.badgeWrap}>
                                <View style={[styles.cardBadge, { backgroundColor: 'rgba(79,142,240,0.12)', borderColor: 'rgba(79,142,240,0.25)' }]}>
                                    <Ionicons name="medkit" size={12} color="#4f8ef0" />
                                    <Text style={[styles.cardBadgeText, { color: '#4f8ef0' }]}>10-YR RISK</Text>
                                </View>
                            </View>

                            <Text style={styles.ascvdNum}>{results.ascvdRisk}%</Text>
                            <Text style={styles.ascvdEq}>ACC/AHA POOLED COHORT</Text>

                            <View style={styles.ascvdBands}>
                                <View style={[styles.band, { borderColor: '#10d98a' }]}>
                                    <Text style={styles.bandText}>Low</Text>
                                    <Text style={styles.bandVal}>{'<'}5%</Text>
                                </View>
                                <View style={[styles.band, styles.bandActive, { borderColor: '#f5c842' }]}>
                                    <Text style={styles.bandText}>Borderline</Text>
                                    <Text style={styles.bandVal}>5–7.4%</Text>
                                </View>
                                <View style={[styles.band, { borderColor: '#f04f4f' }]}>
                                    <Text style={styles.bandText}>High</Text>
                                    <Text style={styles.bandVal}>≥20%</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Vascular Age */}
                    <Animated.View entering={FadeInDown.delay(400).duration(500)} style={[styles.card, styles.vaCard]}>
                        <Ionicons name="infinite-outline" size={32} color="#f5c842" />
                        <View style={styles.vaDivider} />
                        <View style={styles.vaInfo}>
                            <Text style={styles.vaLabel}>VASCULAR AGE</Text>
                            <Text style={styles.vaNum}>{results.vascularAge} <Text style={{ fontSize: 20 }}>yrs</Text></Text>
                            <Text style={styles.vaNote}>Your arterial age is {results.patientAge - results.vascularAge} years younger than your chronological age.</Text>
                        </View>
                    </Animated.View>

                    {/* AI Summary */}
                    <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.aiCard}>
                        <View style={styles.aiHeader}>
                            <Animated.View style={[styles.aiDot, animatedPulseStyle]} />
                            <Text style={styles.aiTitle}>CLINICAL INTELLIGENCE</Text>
                        </View>
                        <Text style={styles.aiText}>
                            Patient demonstrates optimal metabolic and hemodynamic profiles. ASCVD risk is borderline primarily driven by age, but heavily offset by excellent lifestyle metrics and lipid control. No immediate pharmacological intervention required. Continue annual monitoring.
                        </Text>
                    </Animated.View>

                    {/* Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.btnDashboard} onPress={handleGoToDashboard}>
                            <Text style={styles.btnDashboardText}>Go to Dashboard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnRetake} onPress={() => navigation.navigate('CardioAssessment')}>
                            <Text style={styles.btnRetakeText}>Retake Assessment</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'transparent',
    },
    backBtn: {
        padding: 4,
    },
    miniBrand: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    patientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    patientMeta: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginTop: 4,
    },
    dateInfo: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        letterSpacing: 1,
    },
    dateVal: {
        color: '#fff',
        fontSize: 14,
        marginTop: 4,
    },
    scoresRow: {
        flexDirection: 'column',
        gap: 20,
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(6,8,16,0.6)',
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
    },
    ascvdCard: {
        borderWidth: 2,
        borderColor: '#4f8ef0',
    },
    badgeWrap: {
        flexDirection: 'row',
    },
    cardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 6,
        letterSpacing: 1,
    },
    gaugeWrap: {
        alignItems: 'center',
        marginVertical: 10,
    },
    gaugeNum: {
        color: '#fff',
        fontSize: 56,
        fontWeight: '600',
        lineHeight: 60,
    },
    gaugeTier: {
        color: '#10d98a',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 4,
    },
    actionBox: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#10d98a',
    },
    actionText: {
        color: '#e4e8f5',
        fontSize: 13,
        lineHeight: 20,
    },
    ascvdNum: {
        color: '#4f8ef0',
        fontSize: 56,
        fontWeight: '600',
        lineHeight: 60,
        marginBottom: 4,
    },
    ascvdEq: {
        color: '#b8c4e0',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 20,
    },
    ascvdBands: {
        gap: 8,
    },
    band: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderLeftWidth: 3,
    },
    bandActive: {
        backgroundColor: 'rgba(245,200,66,0.2)',
    },
    bandText: {
        color: '#fff',
        fontSize: 13,
    },
    bandVal: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    vaCard: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(6,8,16,0.6)',
    },
    vaDivider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 20,
    },
    vaInfo: {
        flex: 1,
    },
    vaLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        letterSpacing: 2,
    },
    vaNum: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '600',
        lineHeight: 44,
        marginVertical: 4,
    },
    vaNote: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
    aiCard: {
        backgroundColor: 'rgba(6,8,16,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(79,142,240,0.3)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    aiDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4f8ef0',
        marginRight: 10,
        shadowColor: '#4f8ef0',
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    aiTitle: {
        color: '#4f8ef0',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    aiText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        gap: 16,
    },
    btnDashboard: {
        backgroundColor: '#10d98a',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#10d98a',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },
    btnDashboardText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    btnRetake: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    btnRetakeText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    }
});
