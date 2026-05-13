import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';

type Notif = {
    id: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    body: string;
    time: string;
    action?: { label: string; screen: string };
};

const buildNotifications = (score: number): Notif[] => {
    const base: Notif[] = [
        {
            id: 'device',
            icon: 'hardware-chip-outline',
            iconColor: '#51A6CB',
            iconBg: '#EFF9FF',
            title: 'Connect a wearable',
            body: 'Link Google Fit or Apple Health to see real-time vitals on your dashboard.',
            time: 'Now',
            action: { label: 'Connect', screen: 'Devices' },
        },
        {
            id: 'programs',
            icon: 'documents-outline',
            iconColor: '#8B5CF6',
            iconBg: '#F5F3FF',
            title: 'Wellness programs available',
            body: 'Explore breathing, meditation, and cardiac rehabilitation programs tailored for you.',
            time: 'Today',
            action: { label: 'Browse', screen: 'Programs' },
        },
    ];

    if (score === 0) {
        base.unshift({
            id: 'assess',
            icon: 'fitness-outline',
            iconColor: '#EF4444',
            iconBg: '#FEF2F2',
            title: 'Complete your health assessment',
            body: 'Your CVITAL score is pending. It takes about 5 minutes and gives you a full cardiovascular risk profile.',
            time: 'Action needed',
            action: { label: 'Start now', screen: 'CardioAssessment' },
        });
    } else if (score < 40) {
        base.unshift({
            id: 'risk',
            icon: 'warning-outline',
            iconColor: '#EF4444',
            iconBg: '#FEF2F2',
            title: 'Your CVITAL score needs attention',
            body: 'Your score is in the At Risk range. Consider speaking to a healthcare professional and starting a cardiac program.',
            time: 'Important',
            action: { label: 'View score', screen: 'WellnessScore' },
        });
    } else if (score < 60) {
        base.unshift({
            id: 'fair',
            icon: 'trending-up-outline',
            iconColor: '#F59E0B',
            iconBg: '#FFFBEB',
            title: 'Improve your Fair CVITAL score',
            body: 'Small lifestyle changes — 30 min of walking daily and reducing salt — can meaningfully raise your score.',
            time: 'Tip',
            action: { label: 'View programs', screen: 'Programs' },
        });
    } else if (score < 80) {
        base.unshift({
            id: 'good',
            icon: 'checkmark-circle-outline',
            iconColor: '#3B82F6',
            iconBg: '#EFF6FF',
            title: 'Good CVITAL score — keep it up',
            body: 'You\'re in the Good range. Consistent exercise and regular re-assessments will push you to Excellent.',
            time: 'Tip',
        });
    } else {
        base.unshift({
            id: 'excellent',
            icon: 'ribbon-outline',
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
            title: 'Excellent cardiovascular health!',
            body: 'Your CVITAL score is in the top range. Keep up your current routine and sync a device to monitor trends.',
            time: 'Great news',
        });
    }

    base.push({
        id: 'reassess',
        icon: 'refresh-circle-outline',
        iconColor: '#6366F1',
        iconBg: '#EEF2FF',
        title: 'Re-assess every 3 months',
        body: 'Cardiovascular risk changes with lifestyle and age. Re-run your assessment quarterly for accurate tracking.',
        time: 'Reminder',
        action: { label: 'Assess', screen: 'CardioAssessment' },
    });

    return base;
};

export default function NotificationsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const score = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const notifications = buildNotifications(score);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {notifications.map(n => (
                    <View key={n.id} style={styles.card}>
                        <View style={[styles.iconWrap, { backgroundColor: n.iconBg }]}>
                            <Ionicons name={n.icon as any} size={22} color={n.iconColor} />
                        </View>
                        <View style={styles.body}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title} numberOfLines={1}>{n.title}</Text>
                                <Text style={styles.time}>{n.time}</Text>
                            </View>
                            <Text style={styles.bodyText}>{n.body}</Text>
                            {n.action && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(n.action!.screen)}
                                    style={styles.actionBtn}
                                >
                                    <Text style={styles.actionText}>{n.action.label}</Text>
                                    <Ionicons name="chevron-forward" size={13} color="#51A6CB" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    list: { padding: 20, gap: 12 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
    body: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    title: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
    time: { fontSize: 10, color: '#94A3B8', fontWeight: '500', flexShrink: 0 },
    bodyText: { fontSize: 13, color: '#64748B', lineHeight: 19 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 10 },
    actionText: { fontSize: 13, fontWeight: '700', color: '#51A6CB' },
});
