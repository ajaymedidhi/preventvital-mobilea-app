import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

const ICON_MAP: Record<string, any> = {
    flame: 'flame', trophy: 'trophy', medal: 'medal',
    heart: 'heart', watch: 'watch-outline', clipboard: 'clipboard-outline', star: 'star',
};

function shareAchievement(badge: any) {
    Share.share({ message: `I earned the "${badge.label}" badge on PreventVital! 🏆 Track your heart health at preventvital.com` });
}

export default function AchievementsScreen() {
    const navigation = useNavigation<any>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        client.get('/api/users/achievements')
            .then(r => setData(r.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []));

    const earned = (data?.badges || []).filter((b: any) => b.earned);
    const locked = (data?.badges || []).filter((b: any) => !b.earned);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Achievements</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator color="#6366F1" style={{ flex: 1 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Points & streak summary */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryValue}>{data?.points ?? 0}</Text>
                            <Text style={styles.summaryLabel}>Points</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryValue}>Lv {data?.level ?? 1}</Text>
                            <Text style={styles.summaryLabel}>Level</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <View style={styles.streakRow}>
                                <Ionicons name="flame" size={18} color="#F97316" />
                                <Text style={[styles.summaryValue, { color: '#F97316' }]}>{data?.streak ?? 0}</Text>
                            </View>
                            <Text style={styles.summaryLabel}>Day Streak</Text>
                        </View>
                    </View>

                    {earned.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Earned ({earned.length})</Text>
                            <View style={styles.badgesGrid}>
                                {earned.map((b: any) => (
                                    <TouchableOpacity key={b.id} style={styles.badgeCard} onLongPress={() => shareAchievement(b)}>
                                        <View style={styles.badgeIconEarned}>
                                            <Ionicons name={ICON_MAP[b.icon] || 'star'} size={28} color="#6366F1" />
                                        </View>
                                        <Text style={styles.badgeLabel}>{b.label}</Text>
                                        <Text style={styles.badgeHint}>Hold to share</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {locked.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Locked ({locked.length})</Text>
                            <View style={styles.badgesGrid}>
                                {locked.map((b: any) => (
                                    <View key={b.id} style={[styles.badgeCard, styles.badgeCardLocked]}>
                                        <View style={styles.badgeIconLocked}>
                                            <Ionicons name="lock-closed-outline" size={22} color="#CBD5E1" />
                                        </View>
                                        <Text style={styles.badgeLabelLocked}>{b.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Milestone info */}
                    <View style={styles.milestoneCard}>
                        <Text style={styles.milestoneTitle}>Streak Milestones</Text>
                        {[
                            { days: 7, reward: 'Flame badge + 50 pts', icon: 'flame' },
                            { days: 30, reward: 'Trophy badge + 200 pts', icon: 'trophy' },
                            { days: 90, reward: 'Medal badge + 500 pts', icon: 'medal' },
                        ].map((m, i) => (
                            <View key={i} style={styles.milestoneRow}>
                                <Ionicons name={m.icon as any} size={18} color="#F97316" />
                                <Text style={styles.milestoneDays}>{m.days}-day streak</Text>
                                <Text style={styles.milestoneReward}>{m.reward}</Text>
                            </View>
                        ))}
                    </View>
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
    content: { padding: 16, paddingBottom: 48 },
    summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    summaryLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    badgeCard: { width: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    badgeCardLocked: { opacity: 0.5 },
    badgeIconEarned: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    badgeIconLocked: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    badgeLabel: { fontSize: 11, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    badgeLabelLocked: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textAlign: 'center' },
    badgeHint: { fontSize: 9, color: '#CBD5E1' },
    milestoneCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
    milestoneTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    milestoneDays: { fontSize: 13, fontWeight: '700', color: '#374151', width: 100 },
    milestoneReward: { flex: 1, fontSize: 13, color: '#64748B' },
});
