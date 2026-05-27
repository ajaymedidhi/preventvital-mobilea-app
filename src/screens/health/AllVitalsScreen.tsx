import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline } from 'react-native-svg';
import client from '../../api/client';
import { Colors, Gradients } from '../../theme/colors';

const { width } = Dimensions.get('window');

const TABS = ['Today', 'Week', 'Month', '3M', 'Year'];
const TAB_DAYS: Record<string, number> = { Today: 1, Week: 7, Month: 30, '3M': 90, Year: 365 };

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatSyncTime = (date: Date): string => {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin === 1) return '1 min ago';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    return diffHr === 1 ? '1 hr ago' : `${diffHr} hrs ago`;
};

const hrStatus = (v: number) => {
    if (v >= 60 && v <= 100) return { text: 'Normal', color: '#059669', bg: '#D1FAE5' };
    if (v > 100) return { text: 'Elevated', color: '#D97706', bg: '#FEF3C7' };
    return { text: 'Low', color: '#DC2626', bg: '#FEE2E2' };
};

const spo2Status = (v: number) => {
    if (v >= 95) return { text: 'Normal', color: '#059669', bg: '#D1FAE5' };
    if (v >= 90) return { text: 'Low', color: '#D97706', bg: '#FEF3C7' };
    return { text: 'Critical', color: '#DC2626', bg: '#FEE2E2' };
};

const bpStatus = (s: number, d: number) => {
    if (s < 120 && d < 80) return { text: 'Normal', color: '#059669', bg: '#D1FAE5' };
    if (s < 130 && d < 80) return { text: 'Elevated', color: '#D97706', bg: '#FEF3C7' };
    if (s < 140 || d < 90) return { text: 'High', color: '#EF4444', bg: '#FEE2E2' };
    return { text: 'Stage 2', color: '#DC2626', bg: '#FEE2E2' };
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length < 2) return <View style={{ height: 30, width: 80 }} />;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const W = 80, H = 30;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
    }).join(' ');
    return (
        <Svg height={H} width={W}>
            <Polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        </Svg>
    );
};

const VitalCard = ({ icon, iconColor, bgColor, title, value, unit, status, statusColor, statusBg, time, chartData, chartColor }: any) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.valueRow}>
                    <Text style={[styles.cardValue, !value || value === '—' ? styles.cardValueEmpty : null]}>{value || '—'}</Text>
                    {value && value !== '—' && <Text style={styles.unit}>{unit}</Text>}
                </View>
            </View>
            <View style={styles.statusContainer}>
                {status ? (
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[styles.statusText, { color: '#94A3B8' }]}>No data</Text>
                    </View>
                )}
                <Text style={styles.timeText}>{time || ''}</Text>
            </View>
        </View>
        {chartData && chartData.length >= 2 && (
            <View style={styles.chartContainer}>
                <Sparkline data={chartData} color={chartColor} />
            </View>
        )}
    </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AllVitalsScreen() {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState('Today');
    const [latestVitals, setLatestVitals] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncTime, setSyncTime] = useState<string>('');

    const getSparkline = (vitalType: string): number[] => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (TAB_DAYS[activeTab] ?? 7));
        return history
            .filter(h =>
                h.vitalType === vitalType &&
                typeof h.value === 'number' &&
                new Date(h.recordedAt || h.createdAt) >= cutoff
            )
            .slice(0, 20)
            .map(h => h.value)
            .reverse();
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [latestRes, histRes] = await Promise.all([
                client.get('/api/wearables/latest'),
                client.get('/api/wearables/history?limit=30'),
            ]);
            if (latestRes.data?.data) {
                setLatestVitals(latestRes.data.data);
                if (latestRes.data.data.lastUpdated) {
                    setSyncTime(formatSyncTime(new Date(latestRes.data.data.lastUpdated)));
                }
            }
            if (histRes.data?.data) {
                setHistory(histRes.data.data);
            }
        } catch (_) {}
        setLoading(false);
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    // Derived values
    const hr = latestVitals?.heartRate != null ? Math.round(latestVitals.heartRate) : null;
    const spo2 = latestVitals?.spo2 != null ? Math.round(latestVitals.spo2) : null;
    const systolic = latestVitals?.bloodPressure?.systolic ?? null;
    const diastolic = latestVitals?.bloodPressure?.diastolic ?? null;
    const steps = latestVitals?.steps ?? null;
    const calories = latestVitals?.calories ?? null;
    const distance = latestVitals?.distance != null ? (latestVitals.distance / 1000).toFixed(2) : null;
    const weight = latestVitals?.weight ?? null;
    const glucose = latestVitals?.bloodGlucose ?? null;

    const hasAnyData = !!(hr || spo2 || systolic || steps || calories);

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
            <LinearGradient colors={Gradients.brandFade} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} locations={[0, 0.55, 1]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>All Vitals</Text>
                            {syncTime ? <Text style={styles.syncSubtitle}>Synced {syncTime}</Text> : null}
                        </View>
                        <View style={{ width: 38, alignItems: 'center' }}>
                            {loading && <ActivityIndicator size="small" color="#FFF" />}
                        </View>
                    </View>

                    {/* Tab strip inside gradient */}
                    <View style={styles.tabsWrapper}>
                        {TABS.map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>

                {!loading && !hasAnyData && (
                    <TouchableOpacity style={styles.connectNudge} onPress={() => navigation.navigate('Devices')} activeOpacity={0.8}>
                        <Ionicons name="hardware-chip-outline" size={18} color="#51A6CB" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.connectNudgeTitle}>No vitals data yet</Text>
                            <Text style={styles.connectNudgeSub}>Connect Google Fit or Apple Health to start tracking your health metrics in real time.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#51A6CB" />
                    </TouchableOpacity>
                )}

                <VitalCard
                    icon="heart" iconColor="#EF4444" bgColor="#FEE2E2"
                    title="Heart Rate"
                    value={hr?.toString()}
                    unit="bpm"
                    status={hr ? hrStatus(hr).text : null}
                    statusColor={hr ? hrStatus(hr).color : null}
                    statusBg={hr ? hrStatus(hr).bg : null}
                    time={hr ? syncTime : ''}
                    chartData={getSparkline('heart_rate')}
                    chartColor="#EF4444"
                />

                <VitalCard
                    icon="pulse-outline" iconColor="#3B82F6" bgColor="#DBEAFE"
                    title="Blood Pressure"
                    value={systolic && diastolic ? `${systolic}/${diastolic}` : null}
                    unit="mmHg"
                    status={systolic && diastolic ? bpStatus(systolic, diastolic).text : null}
                    statusColor={systolic && diastolic ? bpStatus(systolic, diastolic).color : null}
                    statusBg={systolic && diastolic ? bpStatus(systolic, diastolic).bg : null}
                    time={systolic ? syncTime : ''}
                    chartData={getSparkline('blood_pressure')}
                    chartColor="#3B82F6"
                />

                <VitalCard
                    icon="leaf-outline" iconColor="#10B981" bgColor="#D1FAE5"
                    title="SpO2"
                    value={spo2?.toString()}
                    unit="%"
                    status={spo2 ? spo2Status(spo2).text : null}
                    statusColor={spo2 ? spo2Status(spo2).color : null}
                    statusBg={spo2 ? spo2Status(spo2).bg : null}
                    time={spo2 ? syncTime : ''}
                    chartData={getSparkline('spo2')}
                    chartColor="#10B981"
                />

                <VitalCard
                    icon="footsteps" iconColor="#F59E0B" bgColor="#FEF3C7"
                    title="Steps"
                    value={steps != null ? steps.toLocaleString() : null}
                    unit="steps"
                    status={steps != null ? (steps >= 10000 ? 'Goal met' : 'In progress') : null}
                    statusColor={steps != null ? (steps >= 10000 ? '#059669' : '#D97706') : null}
                    statusBg={steps != null ? (steps >= 10000 ? '#D1FAE5' : '#FEF3C7') : null}
                    time={steps != null ? syncTime : ''}
                    chartData={getSparkline('steps')}
                    chartColor="#F59E0B"
                />

                <VitalCard
                    icon="flame" iconColor="#EF4444" bgColor="#FEE2E2"
                    title="Calories Burned"
                    value={calories != null ? Math.round(calories).toString() : null}
                    unit="kcal"
                    status={calories != null ? 'Tracked' : null}
                    statusColor="#059669"
                    statusBg="#D1FAE5"
                    time={calories != null ? syncTime : ''}
                    chartData={getSparkline('calories')}
                    chartColor="#EF4444"
                />

                <VitalCard
                    icon="location-outline" iconColor="#6366F1" bgColor="#EDE9FE"
                    title="Distance"
                    value={distance}
                    unit="km"
                    status={distance ? 'Tracked' : null}
                    statusColor="#059669"
                    statusBg="#D1FAE5"
                    time={distance ? syncTime : ''}
                    chartData={getSparkline('distance')}
                    chartColor="#6366F1"
                />

                {weight != null && (
                    <VitalCard
                        icon="barbell-outline" iconColor="#8B5CF6" bgColor="#EDE9FE"
                        title="Weight"
                        value={weight.toFixed(1)}
                        unit="kg"
                        status="Tracked"
                        statusColor="#059669"
                        statusBg="#D1FAE5"
                        time={syncTime}
                        chartData={getSparkline('weight')}
                        chartColor="#8B5CF6"
                    />
                )}

                {glucose != null && (
                    <VitalCard
                        icon="water" iconColor="#F59E0B" bgColor="#FEF3C7"
                        title="Blood Glucose"
                        value={Math.round(glucose).toString()}
                        unit="mg/dL"
                        status={glucose < 70 ? 'Low' : glucose <= 99 ? 'Normal' : glucose <= 125 ? 'Pre-diabetic' : 'High'}
                        statusColor={glucose < 70 || glucose > 125 ? '#DC2626' : glucose <= 99 ? '#059669' : '#D97706'}
                        statusBg={glucose < 70 || glucose > 125 ? '#FEE2E2' : glucose <= 99 ? '#D1FAE5' : '#FEF3C7'}
                        time={syncTime}
                        chartData={getSparkline('blood_glucose')}
                        chartColor="#F59E0B"
                    />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingBottom: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 12, marginBottom: 14 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    syncSubtitle: { fontSize: 11, color: '#C7D2FE', marginTop: 2, fontWeight: '500' },
    tabsWrapper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 3 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
    activeTab: { backgroundColor: '#FFF' },
    tabText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
    activeTabText: { color: Colors.gradientStart, fontWeight: '700' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

    connectNudge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF9FF', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' },
    connectNudgeTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1', marginBottom: 2 },
    connectNudgeSub: { fontSize: 12, color: '#0369A1', lineHeight: 18, opacity: 0.8 },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    titleContainer: { flex: 1, justifyContent: 'center' },
    cardTitle: { fontSize: 14, color: '#64748B', marginBottom: 4 },
    valueRow: { flexDirection: 'row', alignItems: 'baseline' },
    cardValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    cardValueEmpty: { color: '#CBD5E1' },
    unit: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
    statusContainer: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },
    timeText: { fontSize: 10, color: '#94A3B8' },
    chartContainer: { alignItems: 'center', marginTop: 12 },
});
