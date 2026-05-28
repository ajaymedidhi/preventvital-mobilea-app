import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';

type Priority = 'urgent' | 'warning' | 'info' | 'success' | 'tip';

type Notif = {
    id: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    body: string;
    time: string;
    priority: Priority;
    action?: { label: string; screen: string };
};

const PRIORITY_CONFIG: Record<Priority, { label: string; labelColor: string; labelBg: string; dot: string }> = {
    urgent:  { label: 'Action Needed', labelColor: '#DC2626', labelBg: '#FEF2F2', dot: '#EF4444' },
    warning: { label: 'Important',     labelColor: '#D97706', labelBg: '#FFFBEB', dot: '#F59E0B' },
    info:    { label: 'Info',          labelColor: '#2563EB', labelBg: '#EFF6FF', dot: '#3B82F6' },
    success: { label: 'Great News',    labelColor: '#059669', labelBg: '#ECFDF5', dot: '#10B981' },
    tip:     { label: 'Tip',           labelColor: '#7C3AED', labelBg: '#F5F3FF', dot: '#8B5CF6' },
};

const buildNotifications = (score: number): Notif[] => {
    const base: Notif[] = [
        {
            id: 'device',
            icon: 'hardware-chip-outline',
            iconColor: '#2563EB',
            iconBg: '#EFF6FF',
            title: 'Connect a Wearable',
            body: 'Link Google Fit or Apple Health to see real-time vitals on your dashboard.',
            time: 'Now',
            priority: 'info',
            action: { label: 'Connect Device', screen: 'Devices' },
        },
        {
            id: 'programs',
            icon: 'documents-outline',
            iconColor: '#7C3AED',
            iconBg: '#F5F3FF',
            title: 'Wellness Programs Available',
            body: 'Explore breathing, meditation, and cardiac rehabilitation programs tailored for you.',
            time: 'Today',
            priority: 'tip',
            action: { label: 'Browse Programs', screen: 'Programs' },
        },
        {
            id: 'reassess',
            icon: 'refresh-circle-outline',
            iconColor: '#6366F1',
            iconBg: '#EEF2FF',
            title: 'Re-Assess Every 3 Months',
            body: 'Cardiovascular risk changes with lifestyle. Re-run your assessment quarterly for accurate tracking.',
            time: 'Reminder',
            priority: 'tip',
            action: { label: 'Start Assessment', screen: 'CardioAssessment' },
        },
    ];

    let scoreBadge: Notif;
    if (score === 0) {
        scoreBadge = {
            id: 'assess',
            icon: 'fitness-outline',
            iconColor: '#DC2626',
            iconBg: '#FEF2F2',
            title: 'Complete Your Health Assessment',
            body: 'Your CVITAL score is pending. It takes about 5 minutes and gives you a full cardiovascular risk profile.',
            time: 'Action needed',
            priority: 'urgent',
            action: { label: 'Start Now', screen: 'CardioAssessment' },
        };
    } else if (score < 40) {
        scoreBadge = {
            id: 'risk',
            icon: 'warning-outline',
            iconColor: '#DC2626',
            iconBg: '#FEF2F2',
            title: 'Your CVITAL Score Needs Attention',
            body: 'Your score is in the At Risk range. Consider speaking to a healthcare professional and starting a cardiac program.',
            time: 'Important',
            priority: 'urgent',
            action: { label: 'View Score', screen: 'WellnessScore' },
        };
    } else if (score < 60) {
        scoreBadge = {
            id: 'fair',
            icon: 'trending-up-outline',
            iconColor: '#D97706',
            iconBg: '#FFFBEB',
            title: 'Improve Your Fair CVITAL Score',
            body: 'Small lifestyle changes — 30 min of walking daily and reducing salt — can meaningfully raise your score.',
            time: 'Tip',
            priority: 'warning',
            action: { label: 'View Programs', screen: 'Programs' },
        };
    } else if (score < 80) {
        scoreBadge = {
            id: 'good',
            icon: 'checkmark-circle-outline',
            iconColor: '#2563EB',
            iconBg: '#EFF6FF',
            title: 'Good CVITAL Score — Keep It Up',
            body: 'You\'re in the Good range. Consistent exercise and regular re-assessments will push you to Excellent.',
            time: 'Tip',
            priority: 'info',
            action: { label: 'View Programs', screen: 'Programs' },
        };
    } else {
        scoreBadge = {
            id: 'excellent',
            icon: 'ribbon-outline',
            iconColor: '#059669',
            iconBg: '#ECFDF5',
            title: 'Excellent Cardiovascular Health!',
            body: 'Your CVITAL score is in the top range. Keep up your current routine and sync a device to monitor trends.',
            time: 'Great news',
            priority: 'success',
        };
    }

    return [scoreBadge, ...base];
};

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const score = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const notifications = buildNotifications(score);

    const urgentCount = notifications.filter(n => n.priority === 'urgent' || n.priority === 'warning').length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            {/* Gradient header */}
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        {urgentCount > 0 && (
                            <View style={styles.urgentPill}>
                                <Text style={styles.urgentPillText}>{urgentCount} need attention</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.notifIconWrap}>
                        <Ionicons name="notifications" size={20} color="#FFF" />
                        {urgentCount > 0 && <View style={styles.headerDot} />}
                    </View>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{notifications.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, urgentCount > 0 && { color: '#FCA5A5' }]}>{urgentCount}</Text>
                        <Text style={styles.statLabel}>Urgent</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: '#86EFAC' }]}>
                            {notifications.filter(n => n.priority === 'success').length}
                        </Text>
                        <Text style={styles.statLabel}>Good news</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {notifications.map((n, index) => {
                    const pCfg = PRIORITY_CONFIG[n.priority];
                    return (
                        <View key={n.id} style={[styles.card, index === 0 && styles.cardFirst]}>
                            {/* Priority indicator line */}
                            <View style={[styles.priorityLine, { backgroundColor: pCfg.dot }]} />

                            <View style={styles.cardContent}>
                                {/* Icon */}
                                <View style={[styles.iconWrap, { backgroundColor: n.iconBg }]}>
                                    <Ionicons name={n.icon as any} size={20} color={n.iconColor} />
                                </View>

                                {/* Body */}
                                <View style={styles.body}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.title} numberOfLines={1}>{n.title}</Text>
                                        <View style={[styles.priorityBadge, { backgroundColor: pCfg.labelBg }]}>
                                            <Text style={[styles.priorityBadgeText, { color: pCfg.labelColor }]}>
                                                {pCfg.label}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.bodyText}>{n.body}</Text>

                                    <View style={styles.footer}>
                                        <View style={styles.timeWrap}>
                                            <Ionicons name="time-outline" size={11} color="#CBD5E1" />
                                            <Text style={styles.time}>{n.time}</Text>
                                        </View>
                                        {n.action && (
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate(n.action!.screen)}
                                                style={[styles.actionBtn, { backgroundColor: n.iconBg, borderColor: n.iconColor + '40' }]}
                                                accessibilityRole="button"
                                            >
                                                <Text style={[styles.actionText, { color: n.iconColor }]}>{n.action.label}</Text>
                                                <Ionicons name="arrow-forward" size={12} color={n.iconColor} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },

    // ── Header ──
    header: { paddingBottom: 20 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, marginBottom: 16, gap: 12,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: { flex: 1, gap: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    urgentPill: { backgroundColor: '#EF444422', borderRadius: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2 },
    urgentPillText: { fontSize: 10, fontWeight: '700', color: '#FCA5A5' },
    notifIconWrap: { position: 'relative', width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerDot: {
        position: 'absolute', top: 4, right: 4,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#475569',
    },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 14,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

    // ── Cards ──
    list: { padding: 16, gap: 12 },
    card: {
        backgroundColor: '#FFF', borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    },
    cardFirst: {
        shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 14, elevation: 5,
    },
    priorityLine: { height: 3, width: '100%' },
    cardContent: { flexDirection: 'row', padding: 16, gap: 12 },
    iconWrap: {
        width: 44, height: 44, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    body: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
    title: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, lineHeight: 19 },
    priorityBadge: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, flexShrink: 0 },
    priorityBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
    bodyText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 10 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    time: { fontSize: 10, color: '#CBD5E1', fontWeight: '500' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 10, borderWidth: 1,
    },
    actionText: { fontSize: 12, fontWeight: '700' },
});
