import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import { Colors, Gradients } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;
const STEP_GOAL = 10_000;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type StatItem = { label: string; value: string; unit: string; icon: string; color: string; bg: string; progress?: number };


const ActivityScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter]         = useState<'today' | 'week'>('today');
    const [history, setHistory]       = useState<any[]>([]);
    const [todayStats, setTodayStats] = useState({ steps: 0, calories: 0, distance: 0, activeTime: 15 });

    const loadData = useCallback(async () => {
        try {
            let hist: any[] = [];
            try {
                const r = await client.get('/api/wearables/history/googlefit');
                if (r.data.success) hist = r.data.history;
            } catch { /* endpoint may not be live */ }

            const userRes = await client.get('/api/users/me');
            const latest  = userRes.data?.data?.user?.latestVitals || userRes.data?.user?.latestVitals;
            if (latest) {
                setTodayStats({
                    steps: latest.steps || 0,
                    calories: latest.calories || 0,
                    distance: latest.distance || 0,
                    activeTime: 15,
                });
            }
            setHistory(hist);
        } catch { /* non-fatal */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const onRefresh = () => { setRefreshing(true); loadData(); };

    // Build 7-day chart data
    const today = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d  = new Date(today); d.setDate(today.getDate() - (6 - i));
        const hit = history.find(h => new Date(h.date).toDateString() === d.toDateString());
        return { day: DAYS[d.getDay()], steps: hit?.steps || 0, isToday: i === 6 };
    });

    const avgSteps = history.length
        ? Math.round(history.reduce((a, b) => a + (b.steps || 0), 0) / history.length)
        : 0;

    const statsToday: StatItem[] = [
        { label: 'Steps',       value: todayStats.steps.toLocaleString(), unit: '',     icon: 'footsteps-outline', color: '#16A34A', bg: '#DCFCE7', progress: todayStats.steps / STEP_GOAL },
        { label: 'Calories',    value: String(todayStats.calories),        unit: 'kcal', icon: 'flame-outline',     color: '#EF4444', bg: '#FEE2E2', progress: todayStats.calories / 500 },
        { label: 'Distance',    value: (todayStats.distance / 1000).toFixed(1), unit: 'km', icon: 'walk-outline',  color: '#2563EB', bg: '#EFF6FF', progress: todayStats.distance / 5000 },
        { label: 'Active Time', value: String(todayStats.activeTime),      unit: 'min',  icon: 'timer-outline',    color: '#D97706', bg: '#FEF3C7', progress: todayStats.activeTime / 60 },
    ];

    const statsWeek: StatItem[] = [
        { label: 'Avg Steps',   value: avgSteps.toLocaleString(), unit: '',     icon: 'footsteps-outline', color: '#16A34A', bg: '#DCFCE7' },
        { label: 'Total Cals',  value: history.reduce((a, b) => a + (b.calories || 0), 0).toLocaleString(), unit: 'kcal', icon: 'flame-outline', color: '#EF4444', bg: '#FEE2E2' },
        { label: 'Total km',    value: (history.reduce((a, b) => a + (b.distance || 0), 0) / 1000).toFixed(1), unit: 'km', icon: 'walk-outline', color: '#2563EB', bg: '#EFF6FF' },
        { label: 'Active Days', value: String(history.filter(h => h.steps > 1000).length), unit: 'days', icon: 'calendar-outline', color: '#7C3AED', bg: '#F5F3FF' },
    ];

    const stats = filter === 'today' ? statsToday : statsWeek;
    const stepProgress = Math.min(todayStats.steps / STEP_GOAL, 1);

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={Gradients.brandFade}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                locations={[0, 0.6, 1]}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerGreeting}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                        <Text style={styles.headerTitle}>My Activity</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deviceBtn}
                        onPress={() => navigation.navigate('Devices')}
                        accessibilityLabel="Connect device"
                    >
                        <Ionicons name="hardware-chip-outline" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Step Goal Ring (visual only) */}
                <View style={styles.goalCard}>
                    <View style={styles.goalLeft}>
                        <Text style={styles.goalLabel}>Daily Step Goal</Text>
                        <Text style={styles.goalValue}>{todayStats.steps.toLocaleString()}</Text>
                        <Text style={styles.goalSub}>of {STEP_GOAL.toLocaleString()} steps</Text>
                        <View style={styles.goalBarBg}>
                            <View style={[styles.goalBarFill, { width: `${Math.round(stepProgress * 100)}%` as any }]} />
                        </View>
                        <Text style={styles.goalPct}>{Math.round(stepProgress * 100)}% complete</Text>
                    </View>
                    <View style={styles.goalRight}>
                        <View style={styles.ringOuter}>
                            <View style={[styles.ringInner, { borderColor: stepProgress >= 1 ? '#4ADE80' : '#A5B4FC' }]}>
                                <Ionicons name="footsteps" size={28} color={stepProgress >= 1 ? '#4ADE80' : '#C7D2FE'} />
                            </View>
                        </View>
                        {stepProgress >= 1 && <Text style={styles.goalAchieved}>Goal Hit! 🎉</Text>}
                    </View>
                </View>

                {/* Toggle */}
                <View style={styles.filterWrap}>
                    {(['today', 'week'] as const).map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === 'today' ? 'Today' : 'This Week'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
            >
                {loading && !refreshing ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.loadingText}>Fetching your progress...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <View style={styles.gridWrap}>
                            {stats.map(s => (
                                <View key={s.label} style={styles.statCard}>
                                    <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                                        <Ionicons name={s.icon as any} size={20} color={s.color} />
                                    </View>
                                    <Text style={styles.statValue}>{s.value}</Text>
                                    <Text style={styles.statUnit}>{s.unit || ' '}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                    {s.progress !== undefined && (
                                        <View style={styles.miniBarBg}>
                                            <View style={[styles.miniBarFill, { width: `${Math.min(Math.round(s.progress * 100), 100)}%` as any, backgroundColor: s.color }]} />
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Weekly Bar Chart */}
                        <View style={styles.chartCard}>
                            <View style={styles.chartHeader}>
                                <View>
                                    <Text style={styles.chartTitle}>Weekly Steps</Text>
                                    <Text style={styles.chartSub}>Goal: {STEP_GOAL.toLocaleString()} / day</Text>
                                </View>
                                <View style={styles.legendRow}>
                                    <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                                    <Text style={styles.legendText}>Today</Text>
                                    <View style={[styles.legendDot, { backgroundColor: '#4ADE80', marginLeft: 8 }]} />
                                    <Text style={styles.legendText}>Goal met</Text>
                                </View>
                            </View>

                            <View style={styles.barChart}>
                                {weeklyData.map((d, i) => {
                                    const pct = Math.min(d.steps / STEP_GOAL, 1);
                                    const hitGoal = d.steps >= STEP_GOAL;
                                    return (
                                        <View key={i} style={styles.barCol}>
                                            <Text style={styles.barSteps}>
                                                {d.steps > 0 ? (d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : String(d.steps)) : ''}
                                            </Text>
                                            <View style={styles.barTrack}>
                                                <LinearGradient
                                                    colors={hitGoal ? ['#4ADE80', '#16A34A'] : d.isToday ? ['#818CF8', '#6366F1'] : ['#CBD5E1', '#94A3B8']}
                                                    style={[styles.barFill, { height: `${Math.max(pct * 100, d.steps > 0 ? 5 : 0)}%` as any }]}
                                                />
                                            </View>
                                            <Text style={[styles.barLabel, d.isToday && styles.barLabelToday]}>{d.day}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {history.length === 0 && (
                                <View style={styles.noDataWrap}>
                                    <Ionicons name="hardware-chip-outline" size={28} color="#CBD5E1" />
                                    <Text style={styles.noDataText}>Connect a wearable to see live data</Text>
                                    <TouchableOpacity
                                        style={styles.connectBtn}
                                        onPress={() => navigation.navigate('Devices')}
                                    >
                                        <Text style={styles.connectBtnText}>Connect Device</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Recent Logs */}
                        <View style={styles.logsHeader}>
                            <Text style={styles.logsTitle}>Recent Logs</Text>
                        </View>

                        {history.length > 0 ? (
                            history.slice(0, 5).map((log: any, i: number) => (
                                <View key={i} style={styles.logCard}>
                                    <View style={[styles.logIcon, { backgroundColor: '#EFF6FF' }]}>
                                        <Ionicons name="walk-outline" size={22} color="#2563EB" />
                                    </View>
                                    <View style={styles.logBody}>
                                        <Text style={styles.logTitle}>
                                            {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </Text>
                                        <Text style={styles.logSub}>Wearable sync</Text>
                                    </View>
                                    <View style={styles.logRight}>
                                        {log.steps > 0 && (
                                            <View style={styles.logStatRow}>
                                                <Ionicons name="footsteps-outline" size={11} color="#16A34A" />
                                                <Text style={styles.logDuration}>{log.steps?.toLocaleString()} steps</Text>
                                            </View>
                                        )}
                                        {log.calories > 0 && (
                                            <View style={styles.logStatRow}>
                                                <Ionicons name="flame-outline" size={11} color="#EF4444" />
                                                <Text style={styles.logCalories}>{log.calories} kcal</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.logsEmptyCard}>
                                <View style={styles.logsEmptyIcon}>
                                    <Ionicons name="fitness-outline" size={32} color={Colors.gradientStart} />
                                </View>
                                <Text style={styles.logsEmptyTitle}>No activity logged yet</Text>
                                <Text style={styles.logsEmptySub}>
                                    Connect a wearable to automatically sync your daily steps, calories, and distance.
                                </Text>
                                <TouchableOpacity style={styles.logsConnectBtn} onPress={() => navigation.navigate('Devices')}>
                                    <Ionicons name="hardware-chip-outline" size={14} color="#FFF" />
                                    <Text style={styles.logsConnectBtnText}>Connect Device</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },

    // ── Header ──
    header: { paddingBottom: 0 },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, marginBottom: 16,
    },
    headerGreeting: { fontSize: 12, color: '#C7D2FE', fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
    deviceBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Goal card
    goalCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 18, padding: 16,
    },
    goalLeft: { flex: 1, marginRight: 12 },
    goalLabel: { fontSize: 11, color: '#C7D2FE', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    goalValue: { fontSize: 32, fontWeight: '900', color: '#FFF' },
    goalSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 },
    goalBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
    goalBarFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 3 },
    goalPct: { fontSize: 11, color: '#C7D2FE', fontWeight: '600' },
    goalRight: { alignItems: 'center', gap: 8 },
    ringOuter: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    ringInner: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    },
    goalAchieved: { fontSize: 10, fontWeight: '700', color: '#4ADE80' },

    // Filter toggle
    filterWrap: {
        flexDirection: 'row', marginHorizontal: 16, marginBottom: 0,
        backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 3,
    },
    filterTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
    filterTabActive: { backgroundColor: '#FFF' },
    filterText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
    filterTextActive: { color: Colors.gradientStart },

    // ── Content ──
    scroll: { paddingTop: 20, paddingHorizontal: 16 },
    loadingWrap: { height: 400, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#94A3B8' },

    // Stat Cards
    gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    statCard: {
        width: CARD_W, backgroundColor: '#FFF', borderRadius: 18,
        padding: 16, alignItems: 'flex-start',
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    },
    statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
    statUnit: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: -2, marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    miniBarBg: { width: '100%', height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
    miniBarFill: { height: '100%', borderRadius: 2 },

    // Bar Chart
    chartCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    chartTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    chartSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
    barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
    barCol: { flex: 1, alignItems: 'center' },
    barSteps: { fontSize: 8, color: '#94A3B8', fontWeight: '600', marginBottom: 4, textAlign: 'center' },
    barTrack: {
        width: 14, height: 90, backgroundColor: '#F1F5F9',
        borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 6,
    },
    barFill: { width: '100%', borderRadius: 7 },
    barLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
    barLabelToday: { color: '#6366F1', fontWeight: '800' },
    noDataWrap: { alignItems: 'center', paddingTop: 20, gap: 8 },
    noDataText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
    connectBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10, backgroundColor: '#EEF2FF', marginTop: 4 },
    connectBtnText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },

    // Recent Logs
    logsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    logsTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
    logsEmptyCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 28, alignItems: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    logsEmptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FAFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    logsEmptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    logsEmptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 20 },
    logsConnectBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.gradientStart, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12,
    },
    logsConnectBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    logCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    logIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    logBody: { flex: 1 },
    logTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
    logSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    logRight: { alignItems: 'flex-end', gap: 4 },
    logStatRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    logDuration: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    logCalories: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
});

export default ActivityScreen;
