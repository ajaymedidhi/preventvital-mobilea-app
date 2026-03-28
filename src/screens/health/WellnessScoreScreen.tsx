import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useAuth } from '../../auth/AuthContext';

const WellnessScoreScreen = () => {
    const navigation = useNavigation<any>();
    const { user, refreshUser, isLoading } = useAuth();
    const [refreshing, setRefreshing] = React.useState(false);

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

                {/* Labels positioned around the arc */}
                <Text style={[styles.gaugeLabel, { top: 20, alignSelf: 'center' }]}>MEDIUM</Text>
                <Text style={[styles.gaugeLabel, { bottom: 20, left: 30 }]}>LOW</Text>
                <Text style={[styles.gaugeLabel, { bottom: 20, right: 30 }]}>HIGH</Text>
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
                    {refreshing && <ActivityIndicator size="small" color="#6366F1" />}
                </View>
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
                    <ScoreRow label="Body Fat" value={bodyFat} color={bodyFat > 25 ? "#F59E0B" : "#10B981"} maxValue={60} unit="%" />
                    {vascularAge > 0 && <ScoreRow label="Vascular Age" value={vascularAge} color="#8B5CF6" maxValue={100} unit=" yrs" />}
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
