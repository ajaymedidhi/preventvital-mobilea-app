import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useAuth } from '../../auth/AuthContext';

const WellnessScoreScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    // Retrieve backend scores with fallbacks
    const score = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const ascvdScore = user?.healthProfile?.ascvdRisk || 0;
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
        // Simplified SVG representation of the segmented gauge
        return (
            <View style={styles.gaugeContainer}>
                <Svg height="250" width="250" viewBox="0 0 200 200">
                    {/* Outer Dashed Circle - Simplified */}
                    <Circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="#E2E8F0"
                        strokeWidth="1"
                        strokeDasharray="4, 4"
                        fill="transparent"
                    />

                    {/* Text Labels on Circle */}
                    <Text style={[styles.gaugeLabel, { top: 90, left: -20 }]}>LOW</Text>
                    {/* Note: SVG Text is different, using absolute positioned View Text for simplicity/compatibility if needed, 
                        but here we'll use View over SVG for labels to avoid font issues 
                    */}

                    {/* Blue Segments - Hardcoded paths for the specific look */}
                    <G rotation="-90" origin="100, 100">
                        {/* Top Segment */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="70"
                            stroke="#3B82F6"
                            strokeWidth="20"
                            fill="transparent"
                            strokeDasharray={[110, 330]} // approximate arc
                            strokeLinecap="round"
                            rotation="45"
                            origin="100, 100"
                        />
                        {/* Left Segment */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="70"
                            stroke="#2563EB"
                            strokeWidth="20"
                            fill="transparent"
                            strokeDasharray={[110, 330]}
                            strokeLinecap="round"
                            rotation="165"
                            origin="100, 100"
                        />
                        {/* Right Segment */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="70"
                            stroke="#2563EB"
                            strokeWidth="20"
                            fill="transparent"
                            strokeDasharray={[110, 330]}
                            strokeLinecap="round"
                            rotation="-75"
                            origin="100, 100"
                        />
                    </G>
                </Svg>

                {/* Inner Content - Moved OUTSIDE SVG so it actually renders on mobile */}
                <View style={styles.innerGaugeContent}>
                    <Text style={styles.scoreBig}>{score}</Text>
                    <Text style={styles.scoreSub}>Out Of 100</Text>
                </View>

                {/* Labels positioned absolutely over the SVG area */}
                <Text style={[styles.gaugeLabel, { top: 10, alignSelf: 'center' }]}>MEDIUM</Text>
                <Text style={[styles.gaugeLabel, { top: '50%', left: 10, transform: [{ rotate: '-90deg' }] }]}>LOW</Text>
                <Text style={[styles.gaugeLabel, { top: '50%', right: 10, transform: [{ rotate: '90deg' }] }]}>HIGH</Text>
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
                <View style={{ width: 40 }} />
            </View>

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
                    <ScoreRow label="CVITAL Score" value={score} color={statusColor} maxValue={100} />
                    <ScoreRow label="ASCVD Risk" value={ascvdScore} color={ascvdScore > 7.5 ? "#EF4444" : "#3B82F6"} maxValue={100} unit="%" />
                    {metabolicScore > 0 && <ScoreRow label="Metabolic Age" value={metabolicScore} color="#8B5CF6" maxValue={100} unit=" yrs" />}
                    <ScoreRow label="Respiratory" value={90} color="#2563EB" maxValue={100} />
                    <ScoreRow label="Mental wellness" value={85} color="#3B82F6" maxValue={100} />
                </View>

                <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('AssessmentHistory')}
                >
                    <Ionicons name="time-outline" size={20} color="#6366F1" />
                    <Text style={styles.historyButtonText}>View Assessment History</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6366F1" />
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
    }
});

export default WellnessScoreScreen;
