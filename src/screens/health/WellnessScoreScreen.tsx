import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useAuth } from '../../auth/AuthContext';
import client from '../../api/client';

const WellnessScoreScreen = () => {
    const navigation = useNavigation<any>();
    const { user, refreshUser, isLoading, currentPlan } = useAuth();
    const [refreshing, setRefreshing] = React.useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleShare = async () => {
        if (['pro', 'family'].includes(currentPlan)) {
            // Pro+ users get a link to the HTML report
            try {
                const reportUrl = `${client.defaults.baseURL}/api/vitals/report-html`;
                await Share.share({
                    message: `My PreventVital Health Report\n\nCVITAL Score: ${score} — ${statusText}\nView full report: ${reportUrl}`,
                    title: 'My PreventVital Health Report',
                });
            } catch {
                Alert.alert('Share failed', 'Unable to share report. Please try again.');
            }
            return;
        }

        // Free/Premium: text-only report
        const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const report = [
            '━━━━━━━━━━━━━━━━━━━━━━━━',
            'PREVENTVITAL HEALTH REPORT',
            '━━━━━━━━━━━━━━━━━━━━━━━━',
            `Generated: ${date}`,
            '',
            `CVITAL™ Score: ${score > 0 ? score : 'Not assessed'} — ${statusText}`,
            ascvdScore > 0 ? `ASCVD Risk: ${ascvdScore}%` : null,
            bodyFat > 0    ? `Body Fat: ${bodyFat}%` : null,
            vascularAge > 0 ? `Vascular Age: ${vascularAge} yrs` : null,
            '',
            'Powered by PreventVital · preventvital.com',
            '━━━━━━━━━━━━━━━━━━━━━━━━',
        ].filter(Boolean).join('\n');

        await Share.share({ message: report, title: 'My PreventVital Health Report' });
    };

    useFocusEffect(
        useCallback(() => {
            const refresh = async () => {
                setRefreshing(true);
                await refreshUser();
                setRefreshing(false);
            };
            refresh();
        }, [])
    );

    // Retrieve backend scores with fallbacks
    // Retrieve backend scores with fallbacks
    const score = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const ascvdScore = user?.healthProfile?.ascvdRisk || 0;
    const bodyFat = user?.healthProfile?.bodyFat || 0;
    const vascularAge = user?.healthProfile?.vascularAge || 0;
    const metabolicScore = user?.healthProfile?.metabolicAge || 0;

    // Determine status text based on CVITAL
    let statusText = "Pending";
    let statusColor = "#94A3B8";
    if (score >= 80) { statusText = "Excellent"; statusColor = "#22C55E"; }
    else if (score >= 60) { statusText = "Good"; statusColor = "#3B82F6"; }
    else if (score >= 40) { statusText = "Fair"; statusColor = "#EAB308"; }
    else if (score > 0) { statusText = "At Risk"; statusColor = "#EF4444"; }

    // Custom Gauge Component
    const WellnessGauge = () => {
        const radius = 75;
        const strokeWidth = 16;
        const center = 100;
        const circumference = 2 * Math.PI * radius;
        
        // We'll use a 280-degree arc for the gauge
        const arcDegrees = 280;
        const gapDegrees = 360 - arcDegrees;
        const totalArcLength = (arcDegrees / 360) * circumference;
        const progressLength = (score / 100) * totalArcLength;
        
        return (
            <View style={styles.gaugeContainer}>
                <Svg height="250" width="250" viewBox="0 0 200 200">
                    {/* Background Arc (Gray) */}
                    <G rotation={90 + gapDegrees/2} origin="100, 100">
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke="#F1F5F9"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={[totalArcLength, circumference]}
                            strokeLinecap="round"
                        />
                        {/* Foreground Progress Arc (Blue) */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={statusColor}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={[progressLength, circumference]}
                            strokeLinecap="round"
                        />
                    </G>
                    
                    {/* Tick Markings - Small dots around the circle */}
                    {[...Array(8)].map((_, i) => {
                        const angle = (i * (arcDegrees / 7)) + (90 + gapDegrees/2);
                        const rad = (angle * Math.PI) / 180;
                        const x = center + (radius + 15) * Math.cos(rad);
                        const y = center + (radius + 15) * Math.sin(rad);
                        return <Circle key={i} cx={x} cy={y} r="1.5" fill="#CBD5E1" />;
                    })}
                </Svg>

                {/* Inner Content - Moved OUTSIDE SVG so it actually renders on mobile */}
                <View style={styles.innerGaugeContent}>
                    <Text style={styles.scoreBig}>{score}</Text>
                    <Text style={styles.scoreSub}>Out Of 100</Text>
                </View>

                {/* Scale markers */}
                <Text style={[styles.gaugeLabel, { top: 20, alignSelf: 'center' }]}>50</Text>
                <Text style={[styles.gaugeLabel, { bottom: 20, left: 30 }]}>0</Text>
                <Text style={[styles.gaugeLabel, { bottom: 20, right: 30 }]}>100</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Vital Score</Text>
                <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
                    {refreshing
                        ? <ActivityIndicator size="small" color="#6366F1" />
                        : <TouchableOpacity onPress={() => setShowInfo(true)} accessibilityLabel="What is my CVITAL score?" accessibilityRole="button">
                            <Ionicons name="information-circle-outline" size={26} color="#6366F1" />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {/* CVITAL Info Modal */}
            <Modal visible={showInfo} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowInfo(false)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Understanding CVITAL</Text>
                        <TouchableOpacity onPress={() => setShowInfo(false)} accessibilityLabel="Close" accessibilityRole="button">
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalSectionLabel}>What is CVITAL?</Text>
                        <Text style={styles.modalText}>
                            CVITAL is a composite cardiovascular health score from 0–100. It combines your blood pressure, cholesterol, weight, lifestyle, family history, and biomarkers to estimate your overall heart health risk in a single number.
                        </Text>

                        <Text style={styles.modalSectionLabel}>Score bands</Text>
                        {[
                            { range: '80 – 100', label: 'Excellent', color: '#10B981', bg: '#ECFDF5', desc: 'Low cardiovascular risk. Keep up your current lifestyle.' },
                            { range: '60 – 79', label: 'Good', color: '#3B82F6', bg: '#EFF6FF', desc: 'Moderate-low risk. Small improvements can push you to Excellent.' },
                            { range: '40 – 59', label: 'Fair', color: '#F59E0B', bg: '#FFFBEB', desc: 'Moderate risk. Lifestyle changes are recommended.' },
                            { range: '1 – 39', label: 'At Risk', color: '#EF4444', bg: '#FEF2F2', desc: 'High cardiovascular risk. Medical consultation is advised.' },
                        ].map(b => (
                            <View key={b.label} style={[styles.bandRow, { backgroundColor: b.bg }]}>
                                <View style={[styles.bandDot, { backgroundColor: b.color }]} />
                                <View style={{ flex: 1 }}>
                                    <View style={styles.bandTitleRow}>
                                        <Text style={[styles.bandLabel, { color: b.color }]}>{b.label}</Text>
                                        <Text style={styles.bandRange}>{b.range}</Text>
                                    </View>
                                    <Text style={styles.bandDesc}>{b.desc}</Text>
                                </View>
                            </View>
                        ))}

                        <Text style={styles.modalSectionLabel}>
                            {score === 0 ? 'Get started' : `Your score is ${score} — what to focus on`}
                        </Text>
                        {(score === 0
                            ? ['Complete your health assessment (takes ~5 min)', 'Answer questions about your measurements and lifestyle', 'Get your full cardiovascular risk profile']
                            : score >= 80
                            ? ['Maintain your current exercise and diet routine', 'Re-assess every 3 months to track trends', 'Connect a wearable to monitor vitals daily']
                            : score >= 60
                            ? ['Aim for 150 min of moderate exercise per week', 'Monitor your blood pressure weekly', 'Reduce sodium intake and processed foods']
                            : score >= 40
                            ? ['Consult a healthcare professional about your risk', 'Start a cardiac wellness or breathing program', 'Reduce sedentary time — take breaks every hour']
                            : ['Speak to a doctor — your risk is elevated', 'Start the Cardiac Rehabilitation program in the app', 'Track vitals daily with a connected wearable']
                        ).map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={[styles.tipNum, { backgroundColor: statusColor + '20' }]}>
                                    <Text style={[styles.tipNumText, { color: statusColor }]}>{i + 1}</Text>
                                </View>
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.scoreSection}>
                    <WellnessGauge />
                </View>

                <View style={styles.statusContainer}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        Your Vital Score is <Text style={styles.statusExcellent}>{statusText}</Text>
                    </Text>
                    <Text style={styles.statusSub}>Based on your recent assessment and vitals</Text>
                </View>

                <View style={styles.breakdownContainer}>
                    {score > 0 && <ScoreRow label="CVITAL Score" value={score} color={statusColor} maxValue={100} />}
                    {ascvdScore > 0 && <ScoreRow label="ASCVD Risk" value={ascvdScore} color={ascvdScore > 7.5 ? "#EF4444" : "#3B82F6"} maxValue={100} unit="%" />}
                    {bodyFat > 0 && <ScoreRow label="Body Fat" value={bodyFat} color={bodyFat > 25 ? "#F59E0B" : "#10B981"} maxValue={60} unit="%" />}
                    {vascularAge > 0 && <ScoreRow label="Vascular Age" value={vascularAge} color="#8B5CF6" maxValue={100} unit=" yrs" />}
                    {metabolicScore > 0 && <ScoreRow label="Metabolic Age" value={metabolicScore} color="#8B5CF6" maxValue={100} unit=" yrs" />}
                    {score === 0 && (
                        <View style={styles.noDataRow}>
                            <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
                            <Text style={styles.noDataText}>Complete a health assessment to see your detailed breakdown</Text>
                        </View>
                    )}
                </View>

                {currentPlan === 'free' ? (
                    <TouchableOpacity
                        style={styles.historyButtonLocked}
                        onPress={() => navigation.navigate('Subscription')}
                    >
                        <Ionicons name="lock-closed" size={18} color="#D97706" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.historyButtonTextLocked}>View Assessment History</Text>
                            <Text style={styles.historyButtonSubLocked}>Score trend history is a Pro feature</Text>
                        </View>
                        <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>Pro</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('AssessmentHistory')}
                    >
                        <Ionicons name="time-outline" size={20} color="#6366F1" />
                        <Text style={styles.historyButtonText}>View Assessment History</Text>
                        <Ionicons name="chevron-forward" size={16} color="#6366F1" />
                    </TouchableOpacity>
                )}

                {/* Consultation CTA for at-risk / fair users */}
                {score > 0 && score < 60 && (
                    <TouchableOpacity
                        style={styles.consultationButton}
                        onPress={() => navigation.navigate('Consultation')}
                    >
                        <Ionicons name="videocam-outline" size={20} color="#fff" />
                        <Text style={styles.consultationButtonText}>Book a Doctor Consultation</Text>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                )}

                {/* ASCVD Explainer */}
                {ascvdScore > 0 && (
                    <TouchableOpacity
                        style={styles.ascvdButton}
                        onPress={() => navigation.navigate('ASCVDExplainer', { ascvdScore, score })}
                    >
                        <Ionicons name="analytics-outline" size={20} color="#6366F1" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.ascvdButtonText}>Understand Your ASCVD Risk</Text>
                            <Text style={styles.ascvdButtonSub}>See what drives your {ascvdScore}% score</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#6366F1" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    accessibilityLabel="Share health report"
                    accessibilityRole="button"
                >
                    <Ionicons name={['pro','family'].includes(currentPlan) ? 'document-text-outline' : 'share-outline'} size={20} color="#0F172A" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.shareButtonText}>Share Report with Doctor</Text>
                        {!['pro','family'].includes(currentPlan) && (
                            <Text style={styles.shareButtonSub}>Upgrade to Pro for full PDF report</Text>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const ScoreRow = ({ label, value, color, maxValue, unit = '' }: { label: string, value: number, color: string, maxValue: number, unit?: string }) => {
    // Fill percentage computation, safe bounded 0-100
    const fillPercent = Math.min(Math.max((value / maxValue) * 100, 0), 100);

    return (
        <View style={styles.scoreRow}>
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${fillPercent}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.rowValue}>{value}{unit}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    scoreSection: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 280,
    },
    gaugeContainer: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerGaugeContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreBig: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    scoreSub: {
        fontSize: 14,
        color: '#64748B',
    },
    gaugeLabel: {
        position: 'absolute',
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        backgroundColor: '#fff',
        paddingHorizontal: 4,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    statusText: {
        fontSize: 18,
        color: '#22C55E',
        fontWeight: '500',
        marginBottom: 4,
    },
    statusExcellent: {
        fontWeight: 'bold',
    },
    statusSub: {
        fontSize: 14,
        color: '#94A3B8',
    },
    breakdownContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        // shadow for card look
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    rowLabel: {
        width: 100,
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    rowValue: {
        width: 30,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        textAlign: 'right',
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F5F3FF',
        borderRadius: 16,
        width: '100%',
        marginTop: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E0E7FF'
    },
    historyButtonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    noDataRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    noDataText: { flex: 1, fontSize: 13, color: '#94A3B8', lineHeight: 20 },

    // Info Modal
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalBody: { padding: 20, paddingBottom: 48 },
    modalSectionLabel: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 24, marginBottom: 12 },
    modalText: { fontSize: 14, color: '#475569', lineHeight: 22 },
    bandRow: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 14, marginBottom: 10 },
    bandDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 12, flexShrink: 0 },
    bandTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    bandLabel: { fontSize: 14, fontWeight: '700' },
    bandRange: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    bandDesc: { fontSize: 13, color: '#64748B', lineHeight: 19 },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    tipNum: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
    tipNumText: { fontSize: 13, fontWeight: '800' },
    tipText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 21 },
    shareButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 20,
        backgroundColor: '#F8FAFC', borderRadius: 16,
        width: '100%', marginTop: 12, gap: 12,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    shareButtonText: { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
    historyButtonLocked: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 20,
        backgroundColor: '#FFFBEB', borderRadius: 16,
        width: '100%', marginTop: 24, gap: 12,
        borderWidth: 1, borderColor: '#FDE68A',
    },
    historyButtonTextLocked: { fontSize: 15, fontWeight: 'bold', color: '#92400E' },
    historyButtonSubLocked: { fontSize: 11, color: '#D97706', marginTop: 2 },
    proBadge: { backgroundColor: '#FDE68A', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    proBadgeText: { fontSize: 11, fontWeight: '800', color: '#92400E' },
    consultationButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 20,
        backgroundColor: '#EF4444', borderRadius: 16,
        width: '100%', marginTop: 12, gap: 12,
    },
    consultationButtonText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
    ascvdButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 20,
        backgroundColor: '#EEF2FF', borderRadius: 16,
        width: '100%', marginTop: 12, gap: 12,
        borderWidth: 1, borderColor: '#E0E7FF',
    },
    ascvdButtonText: { fontSize: 15, fontWeight: '700', color: '#4338CA' },
    ascvdButtonSub: { fontSize: 12, color: '#6366F1', marginTop: 2 },
    shareButtonSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});

export default WellnessScoreScreen;
