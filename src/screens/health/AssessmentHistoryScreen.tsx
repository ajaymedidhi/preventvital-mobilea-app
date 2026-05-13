import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Polyline, Circle as SvgCircle, Line } from 'react-native-svg';
import { getAssessmentHistory } from '../../api/vitalsSync';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const CHART_H = 72;
const CHART_W = width - 112;

const ScoreTrendChart = ({ history, isLocked, onUpgrade }: { history: any[]; isLocked: boolean; onUpgrade: () => void }) => {
    const sorted = [...history]
        .sort((a, b) => new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime())
        .slice(-6);
    const scores = sorted.map(h => h.results?.cvitalScore || 0).filter((s: number) => s > 0);
    if (scores.length < 2 && !isLocked) return null;

    const firstScore = scores[0] ?? 0;
    const lastScore = scores[scores.length - 1] ?? 0;
    const diff = lastScore - firstScore;
    const diffColor = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#94A3B8';
    const diffLabel = diff > 0 ? `▲ +${diff} pts` : diff < 0 ? `▼ ${diff} pts` : '— No change';

    const minV = Math.max(0, Math.min(...scores) - 8);
    const maxV = Math.min(100, Math.max(...scores) + 8);
    const getX = (i: number) => (i / Math.max(scores.length - 1, 1)) * CHART_W;
    const getY = (v: number) => CHART_H - ((v - minV) / Math.max(maxV - minV, 1)) * CHART_H;
    const points = scores.map((s: number, i: number) => `${getX(i)},${getY(s)}`).join(' ');

    return (
        <View style={chartStyles.container}>
            <View style={chartStyles.headerRow}>
                <Text style={chartStyles.title}>Score Trend</Text>
                {isLocked ? (
                    <View style={chartStyles.goldBadge}>
                        <Ionicons name="lock-closed" size={11} color="#D97706" />
                        <Text style={chartStyles.goldBadgeText}>Gold+</Text>
                    </View>
                ) : (
                    <Text style={[chartStyles.diff, { color: diffColor }]}>{diffLabel}</Text>
                )}
            </View>

            {isLocked ? (
                <View style={chartStyles.lockedBody}>
                    <View style={chartStyles.blurredChart}>
                        {/* Decorative blurred lines */}
                        {[30, 50, 65, 55, 70].map((y, i) => (
                            <View key={i} style={[chartStyles.blurLine, { left: `${i * 22}%`, height: `${y}%` }]} />
                        ))}
                    </View>
                    <View style={chartStyles.lockOverlay}>
                        <Ionicons name="lock-closed" size={24} color="#D97706" />
                        <Text style={chartStyles.lockTitle}>Score trend history is a Gold feature</Text>
                        <Text style={chartStyles.lockDesc}>Upgrade to see your 3-month progress and track improvements over time.</Text>
                        <TouchableOpacity onPress={onUpgrade} style={chartStyles.upgradeBtn}>
                            <Text style={chartStyles.upgradeBtnText}>Upgrade to Gold →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <Svg height={CHART_H + 4} width={CHART_W + 4} style={{ marginVertical: 8 }}>
                        <Line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="#F1F5F9" strokeWidth="1" />
                        <Polyline points={points} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {scores.map((s: number, i: number) => (
                            <SvgCircle key={i} cx={getX(i)} cy={getY(s)} r="4" fill="#8B5CF6" stroke="#fff" strokeWidth="2" />
                        ))}
                    </Svg>
                    {scores.length >= 2 && (
                        <Text style={chartStyles.summary}>
                            {diff > 0
                                ? `You've improved from ${firstScore} → ${lastScore} — keep it up!`
                                : diff < 0
                                ? `Score dropped from ${firstScore} → ${lastScore}. Focus on your recommendations.`
                                : `Score stable at ${lastScore}. Small lifestyle changes can push you higher.`}
                        </Text>
                    )}
                </>
            )}
        </View>
    );
};

const chartStyles = StyleSheet.create({
    container: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    diff: { fontSize: 13, fontWeight: '700' },
    goldBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    goldBadgeText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
    summary: { fontSize: 12, color: '#64748B', lineHeight: 18, marginTop: 2 },
    lockedBody: { height: 120, borderRadius: 12, overflow: 'hidden', marginTop: 8, position: 'relative' },
    blurredChart: { position: 'absolute', inset: 0, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, opacity: 0.15 },
    blurLine: { width: 12, backgroundColor: '#8B5CF6', borderRadius: 4, position: 'absolute', bottom: 0 },
    lockOverlay: { position: 'absolute', inset: 0, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', padding: 20, gap: 6 },
    lockTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
    lockDesc: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
    upgradeBtn: { marginTop: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    upgradeBtnText: { fontSize: 13, fontWeight: '700', color: '#D97706' },
});

export default function AssessmentHistoryScreen() {
    const navigation = useNavigation<any>();
    const { currentPlan } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isChartLocked = currentPlan === 'free' || currentPlan === 'silver';

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const data = await getAssessmentHistory();
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, []);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="clipboard-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Assessments Yet</Text>
            <Text style={styles.emptySubtitle}>Your medical assessment history will appear here once you complete your first health check.</Text>
            <TouchableOpacity 
                style={styles.startButton}
                onPress={() => navigation.navigate('CardioAssessment')}
            >
                <LinearGradient
                    colors={['#60A5FA', '#8B5CF6']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                >
                    <Text style={styles.startButtonText}>Start New Assessment</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

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
                        <Text style={styles.headerTitle}>ASSESSMENT HISTORY</Text>
                        <View style={{ width: 32 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                ) : history.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <ScoreTrendChart
                            history={history}
                            isLocked={isChartLocked}
                            onUpgrade={() => navigation.navigate('Subscription')}
                        />
                        {history.map((item, index) => (
                            <Animated.View 
                                key={item._id || index}
                                entering={FadeInDown.delay(index * 100).duration(500)}
                                style={styles.historyItem}
                            >
                                <View style={styles.historyIconContainer}>
                                    <Ionicons 
                                        name="pulse" 
                                        size={24} 
                                        color={item.results?.cvitalTierDetails?.color || '#3B82F6'} 
                                    />
                                </View>
                                <View style={styles.historyMain}>
                                    <View style={styles.historyTopRow}>
                                        <Text style={styles.historyTitle}>CVITAL™ Score</Text>
                                        <Text style={[styles.historyScore, { color: item.results?.cvitalTierDetails?.color || '#3B82F6' }]}>
                                            {item.results?.cvitalScore || '--'}
                                        </Text>
                                    </View>
                                    <View style={styles.historyBottomRow}>
                                        <View style={styles.historyMeta}>
                                            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                                            <Text style={styles.historyDate}>
                                                {item.completedAt || item.createdAt 
                                                    ? new Date(item.completedAt || item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'Recent'}
                                            </Text>
                                        </View>
                                        <View style={[styles.tierBadge, { backgroundColor: `${item.results?.cvitalTierDetails?.color || '#3B82F6'}15` }]}>
                                            <Text style={[styles.tierText, { color: item.results?.cvitalTierDetails?.color || '#3B82F6' }]}>
                                                {item.results?.cvitalTierDetails?.label || item.results?.cvitalTier || 'Unknown'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.detailsButton}
                                    onPress={() => navigation.navigate('AssessmentResults', { 
                                        scoreData: item.results, 
                                        formData: item.rawFormData,
                                        assessmentData: item.assessmentData,
                                        date: item.completedAt ? new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
                                    })}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 60 },
    headerSafeArea: { paddingHorizontal: 24, paddingTop: 10 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
    },
    backButton: { padding: 4 },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        marginTop: -40, overflow: 'hidden'
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 24, paddingTop: 32 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyIconCircle: { 
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', 
        justifyContent: 'center', alignItems: 'center', marginBottom: 24
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    startButton: { height: 56, width: '100%', borderRadius: 16, overflow: 'hidden' },
    startButtonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    historyItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 20, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    historyIconContainer: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    historyMain: { flex: 1 },
    historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    historyScore: { fontSize: 20, fontWeight: 'bold' },
    historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    historyDate: { fontSize: 12, color: '#94A3B8' },
    tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    tierText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    detailsButton: { padding: 4, marginLeft: 8 },
});
