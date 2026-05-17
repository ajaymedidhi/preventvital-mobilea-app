import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import client from '../../api/client';
import Svg, { Rect } from 'react-native-svg';

const SCORE_BANDS = [
    { label: 'Excellent', range: '80–100', color: '#22C55E', bg: '#ECFDF5' },
    { label: 'Good',      range: '60–79',  color: '#84CC16', bg: '#F7FEE7' },
    { label: 'Fair',      range: '40–59',  color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'At Risk',   range: '1–39',   color: '#EF4444', bg: '#FEF2F2' },
];

const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 100, paddingTop: 8 }}>
            {data.map((d, i) => {
                const h = Math.max((d.value / max) * 80, 4);
                return (
                    <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: d.color }}>{d.value}</Text>
                        <View style={{ height: h, width: '100%', backgroundColor: d.color + '30', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' }}>
                            <View style={{ height: h * 0.7, backgroundColor: d.color, borderRadius: 4 }} />
                        </View>
                        <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>{d.label}</Text>
                    </View>
                );
            })}
        </View>
    );
};

export default function CorporateDashboardScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isCorporateAdmin = user?.role === 'corporate_admin' || user?.role === 'admin' || user?.role === 'super_admin';

    useFocusEffect(useCallback(() => {
        if (!isCorporateAdmin) { setLoading(false); return; }
        client.get('/api/corporate/stats')
            .then(r => setStats(r.data.data || r.data))
            .catch(() => {
                // Mock data for demo
                setStats({
                    totalEmployees: 124,
                    assessedThisMonth: 89,
                    avgCvital: 67,
                    highRiskCount: 12,
                    distribution: { excellent: 28, good: 41, fair: 20, atRisk: 12 },
                    departments: [
                        { name: 'Engineering', avg: 71, count: 42 },
                        { name: 'Sales', avg: 63, count: 35 },
                        { name: 'Operations', avg: 69, count: 28 },
                        { name: 'HR', avg: 74, count: 19 },
                    ]
                });
            })
            .finally(() => setLoading(false));
    }, [isCorporateAdmin]));

    if (!isCorporateAdmin) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Corporate Dashboard</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.gateContainer}>
                    <Ionicons name="business-outline" size={56} color="#6366F1" />
                    <Text style={styles.gateTitle}>Corporate Dashboard</Text>
                    <Text style={styles.gateDesc}>
                        This dashboard is available to corporate HR admins. Contact your organisation administrator to request access.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Corporate Dashboard</Text>
                <TouchableOpacity style={styles.exportBtn}>
                    <Ionicons name="download-outline" size={20} color="#6366F1" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#6366F1" style={{ flex: 1 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* KPI row */}
                    <View style={styles.kpiRow}>
                        {[
                            { label: 'Total Employees', value: stats?.totalEmployees ?? '—', icon: 'people-outline', color: '#6366F1' },
                            { label: 'Assessed This Month', value: stats?.assessedThisMonth ?? '—', icon: 'clipboard-outline', color: '#3B82F6' },
                            { label: 'Avg CVITAL Score', value: stats?.avgCvital ?? '—', icon: 'heart-outline', color: '#10B981' },
                            { label: 'High Risk', value: stats?.highRiskCount ?? '—', icon: 'warning-outline', color: '#EF4444' },
                        ].map((k, i) => (
                            <View key={i} style={styles.kpiCard}>
                                <Ionicons name={k.icon as any} size={20} color={k.color} />
                                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                                <Text style={styles.kpiLabel}>{k.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Score distribution chart */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Score Distribution</Text>
                        <BarChart data={[
                            { label: 'Excellent', value: stats?.distribution?.excellent ?? 0, color: '#22C55E' },
                            { label: 'Good', value: stats?.distribution?.good ?? 0, color: '#84CC16' },
                            { label: 'Fair', value: stats?.distribution?.fair ?? 0, color: '#F59E0B' },
                            { label: 'At Risk', value: stats?.distribution?.atRisk ?? 0, color: '#EF4444' },
                        ]} />
                    </View>

                    {/* Department breakdown */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>By Department</Text>
                        {(stats?.departments || []).map((d: any, i: number) => {
                            const bandColor = d.avg >= 80 ? '#22C55E' : d.avg >= 60 ? '#84CC16' : d.avg >= 40 ? '#F59E0B' : '#EF4444';
                            return (
                                <View key={i} style={styles.deptRow}>
                                    <Text style={styles.deptName}>{d.name}</Text>
                                    <View style={styles.deptBar}>
                                        <View style={[styles.deptBarFill, { width: `${d.avg}%`, backgroundColor: bandColor }]} />
                                    </View>
                                    <Text style={[styles.deptScore, { color: bandColor }]}>{d.avg}</Text>
                                    <Text style={styles.deptCount}>{d.count} emp</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* High risk alert */}
                    {(stats?.highRiskCount ?? 0) > 0 && (
                        <View style={styles.alertCard}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.alertTitle}>{stats.highRiskCount} employees in High Risk band</Text>
                                <Text style={styles.alertSub}>Consider a targeted wellness intervention or consultation subsidy for this cohort.</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    back: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    exportBtn: { width: 40, alignItems: 'flex-end' },
    content: { padding: 16, paddingBottom: 48 },
    gateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
    gateTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    gateDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
    kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    kpiCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    kpiValue: { fontSize: 24, fontWeight: '800' },
    kpiLabel: { fontSize: 11, color: '#94A3B8', textAlign: 'center', fontWeight: '600' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    deptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    deptName: { fontSize: 13, fontWeight: '600', color: '#374151', width: 90 },
    deptBar: { flex: 1, height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
    deptBarFill: { height: '100%', borderRadius: 4 },
    deptScore: { fontSize: 14, fontWeight: '800', width: 30, textAlign: 'right' },
    deptCount: { fontSize: 11, color: '#94A3B8', width: 46 },
    alertCard: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: '#FECACA' },
    alertTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
    alertSub: { fontSize: 13, color: '#B91C1C', lineHeight: 19 },
});
