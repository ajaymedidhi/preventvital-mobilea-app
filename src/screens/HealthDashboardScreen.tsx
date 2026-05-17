import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import YoutubeIframe from 'react-native-youtube-iframe';

import { getVitals } from '../api/vitalsSync';
import { NormalizedHealthData } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import DashboardSkeleton from '../components/DashboardSkeleton';
import client from '../api/client';
import DailyCheckInCard from '../components/DailyCheckInCard';

const { width } = Dimensions.get('window');

const HealthDashboardScreen = ({ route }: any) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { user, isNewRegistration } = useAuth();
    const [data, setData] = useState<NormalizedHealthData | null>(null);
    const [wearableData, setWearableData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [syncedAt, setSyncedAt] = useState<Date | null>(null);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const formatSyncTime = (date: Date | null): string => {
        if (!date) return '';
        const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diffMin < 1) return 'Synced just now';
        if (diffMin === 1) return 'Synced 1 min ago';
        if (diffMin < 60) return `Synced ${diffMin} min ago`;
        const diffHr = Math.floor(diffMin / 60);
        return diffHr === 1 ? 'Synced 1 hr ago' : `Synced ${diffHr} hrs ago`;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const vitals = await getVitals();
            setData(vitals);

            // Fetch real wearable vitals (Google Fit / Apple Health synced via backend)
            try {
                const wRes = await client.get('/api/wearables/latest');
                if (wRes.data?.data) {
                    setWearableData(wRes.data.data);
                    const ts = wRes.data.data.lastUpdated;
                    setSyncedAt(ts ? new Date(ts) : new Date());
                }
            } catch (_) {
                if (vitals) setSyncedAt(new Date());
            }

            const currentScore = user?.profile?.healthScore;
            const isSkippedFlag = route?.params?.skippedAssessment || false;
            const isSkippedDB = currentScore === -1;

            if (isNewRegistration && !isSkippedFlag && !isSkippedDB && (!currentScore || currentScore === 0)) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'CardioAssessment' }],
                });
            }
        } catch (error) {
            console.error("Error loading vitals:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    if (loading) {
        return <DashboardSkeleton />;
    }

    const wellnessScore = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const scoreProgress = wellnessScore / 100;
    const circleRadius = 46;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circleCircumference * (1 - scoreProgress);

    let dbStatusText = "Assess needed";
    let dbStatusColor = "#94A3B8";
    let accentColor = "#3B82F6"; // Darker clinical blue

    if (wellnessScore >= 80) { dbStatusText = "Excellent"; dbStatusColor = "#10B981"; accentColor = "#059669"; }
    else if (wellnessScore >= 60) { dbStatusText = "Good"; dbStatusColor = "#3B82F6"; accentColor = "#1D4ED8"; }
    else if (wellnessScore >= 40) { dbStatusText = "Fair"; dbStatusColor = "#F59E0B"; accentColor = "#D97706"; }
    else if (wellnessScore > 0) { dbStatusText = "At Risk"; dbStatusColor = "#EF4444"; accentColor = "#B91C1C"; }

    // Vital values — prefer real wearable data, fall back to assessment vitals, then dash
    const hrValue = wearableData?.heartRate != null
        ? Math.round(wearableData.heartRate).toString()
        : data?.metrics?.heartRate != null ? Math.round(data.metrics.heartRate).toString() : '—';

    const spo2Value = wearableData?.spo2 != null
        ? Math.round(wearableData.spo2).toString()
        : data?.metrics?.spo2 != null ? Math.round(data.metrics.spo2).toString() : '—';

    const bpValue = wearableData?.bloodPressure
        ? `${wearableData.bloodPressure.systolic ?? '—'}/${wearableData.bloodPressure.diastolic ?? '—'}`
        : '—';

    const stepsValue = wearableData?.steps != null
        ? wearableData.steps >= 1000 ? (wearableData.steps / 1000).toFixed(1) + 'k' : String(wearableData.steps)
        : data?.metrics?.steps != null ? (data.metrics.steps / 1000).toFixed(1) + 'k' : '—';

    const hasWearableData = !!(wearableData?.heartRate || wearableData?.spo2 || wearableData?.steps || wearableData?.bloodPressure);

    type AlertItem = { key: string; icon: 'warning' | 'warning-outline' | 'alert-circle-outline'; color: string; bg: string; msg: string };
    const abnormalAlerts: AlertItem[] = hasWearableData ? (() => {
        const items: AlertItem[] = [];
        const spo2 = wearableData?.spo2;
        const hr = wearableData?.heartRate;
        const sys = wearableData?.bloodPressure?.systolic;
        const dia = wearableData?.bloodPressure?.diastolic;
        if (spo2 != null && spo2 < 90)
            items.push({ key: 'spo2_critical', icon: 'warning', color: '#DC2626', bg: '#FEF2F2', msg: `SpO₂ reading of ${Math.round(spo2)}% is critically low. Contact your doctor immediately.` });
        else if (spo2 != null && spo2 < 94)
            items.push({ key: 'spo2_low', icon: 'warning-outline', color: '#F59E0B', bg: '#FFFBEB', msg: `SpO₂ reading of ${Math.round(spo2)}% is slightly below normal. Monitor closely.` });
        if (hr != null && hr > 100)
            items.push({ key: 'hr_high', icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2', msg: `Elevated heart rate (${Math.round(hr)} bpm) detected. Consult your doctor if this persists.` });
        else if (hr != null && hr < 50)
            items.push({ key: 'hr_low', icon: 'alert-circle-outline', color: '#F59E0B', bg: '#FFFBEB', msg: `Low heart rate (${Math.round(hr)} bpm) detected. Consult your doctor if this persists.` });
        if (sys != null && (sys > 140 || (dia != null && dia > 90)))
            items.push({ key: 'bp_high', icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2', msg: `High blood pressure (${sys}/${dia ?? '?'} mmHg) detected. Medical consultation recommended.` });
        return items.filter(a => !dismissedAlerts.has(a.key));
    })() : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#51A6CB" />

            <LinearGradient
                colors={['#51A6CB', '#BF40A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.absoluteGradient, { height: 280 + insets.top }]}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>
                {/* Header */}
                <View style={styles.headerTop}>
                    <View style={styles.headerGreetingCol}>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>
                            {user?.profile?.firstName || 'Patient'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={() => navigation.navigate('CardioAssessment')}
                        >
                            <Ionicons name="fitness" size={18} color="#FFF" />
                            <Text style={styles.headerActionText}>Assess</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Notifications" accessibilityRole="button">
                            <Ionicons name="notifications-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton} accessibilityLabel="View profile" accessibilityRole="button">
                            {user?.profile?.firstName ? (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarText}>
                                        {user.profile.firstName[0].toUpperCase()}
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={{ uri: 'https://ui-avatars.com/api/?name=U&background=51A6CB&color=fff' }}
                                    style={styles.avatar}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Score Dashboard */}
                <TouchableOpacity
                    style={styles.wellnessCard}
                    onPress={() => navigation.navigate(wellnessScore === 0 ? 'CardioAssessment' : 'WellnessScore')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreCircle}>
                            <Svg height="110" width="110" viewBox="0 0 110 110">
                                <Defs>
                                    <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                                        <Stop offset="0" stopColor={dbStatusColor} stopOpacity="1" />
                                        <Stop offset="1" stopColor={accentColor} stopOpacity="1" />
                                    </SvgGradient>
                                </Defs>
                                <G rotation="-90" origin="55, 55">
                                    <Circle cx="55" cy="55" r={circleRadius} stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                                    <Circle
                                        cx="55" cy="55" r={circleRadius}
                                        stroke={wellnessScore > 0 ? "url(#grad)" : "#E2E8F0"}
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={circleCircumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </G>
                            </Svg>
                            <View style={styles.scoreTextOverlay}>
                                <Text style={styles.scoreVal}>{wellnessScore > 0 ? wellnessScore : '—'}</Text>
                                <Text style={styles.scoreMax}>cvital™</Text>
                            </View>
                        </View>

                        <View style={styles.scoreInfo}>
                            <Text style={styles.scoreSubtitle}>Cardiovascular State</Text>
                            <Text style={styles.scoreTitle}>
                                {wellnessScore === 0 ? 'Get your score' : dbStatusText}
                            </Text>
                            {wellnessScore === 0 ? (
                                <View style={[styles.scorePill, { backgroundColor: '#6366F115' }]}>
                                    <Ionicons name="fitness-outline" size={14} color="#6366F1" />
                                    <Text style={[styles.scorePillText, { color: '#6366F1' }]}>
                                        Begin assessment →
                                    </Text>
                                </View>
                            ) : (
                                <View style={[styles.scorePill, { backgroundColor: dbStatusColor + '15' }]}>
                                    <Ionicons name="pulse" size={14} color={dbStatusColor} />
                                    <Text style={[styles.scorePillText, { color: dbStatusColor }]}>
                                        Based on recent data
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={styles.chevron} />
                    </View>
                </TouchableOpacity>

                {/* Today's Recommendation */}
                {(() => {
                    const rec = wellnessScore === 0
                        ? { icon: 'fitness-outline' as const, color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE', title: 'Get your CVITAL score', body: 'Complete your 5-min health assessment to unlock your full cardiovascular risk profile.', cta: 'Start assessment', screen: 'CardioAssessment' }
                        : wellnessScore < 40
                        ? { icon: 'warning-outline' as const, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', title: 'Your heart needs attention', body: 'Your score is in the At Risk range. Start a cardiac program and consult your doctor.', cta: 'View programs', screen: 'Programs' }
                        : wellnessScore < 60
                        ? { icon: 'walk-outline' as const, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', title: 'Boost your Fair score', body: 'A daily 30-min walk and reducing salt intake can meaningfully raise your CVITAL score.', cta: 'Browse programs', screen: 'Programs' }
                        : wellnessScore < 80
                        ? { icon: 'trending-up-outline' as const, color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', title: "You're on the right track", body: 'Good score! Connect a wearable to track daily vitals and push toward Excellent.', cta: 'Connect device', screen: 'Devices' }
                        : { icon: 'ribbon-outline' as const, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', title: 'Excellent cardiovascular health', body: "Keep up your routine and re-assess in 3 months to confirm you're staying in the top band.", cta: 'View score', screen: 'WellnessScore' };
                    return (
                        <TouchableOpacity style={[styles.recCard, { backgroundColor: rec.bg, borderColor: rec.border }]} onPress={() => navigation.navigate(rec.screen)} activeOpacity={0.85}>
                            <View style={[styles.recIconWrap, { backgroundColor: rec.color + '20' }]}>
                                <Ionicons name={rec.icon} size={20} color={rec.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.recTitle, { color: rec.color }]}>{rec.title}</Text>
                                <Text style={styles.recBody}>{rec.body}</Text>
                                <Text style={[styles.recCta, { color: rec.color }]}>{rec.cta} →</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })()}

                {/* Daily Check-In — after score context, natural "how do you feel?" moment */}
                <DailyCheckInCard />

                {/* Abnormal Reading Alerts */}
                {abnormalAlerts.map(alert => (
                    <View key={alert.key} style={[styles.abnormalAlert, { backgroundColor: alert.bg }]}>
                        <Ionicons name={alert.icon} size={18} color={alert.color} style={{ flexShrink: 0, marginTop: 1 }} />
                        <Text style={styles.abnormalAlertText}>{alert.msg}</Text>
                        <TouchableOpacity
                            onPress={() => setDismissedAlerts(prev => new Set([...prev, alert.key]))}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Dismiss alert"
                        >
                            <Ionicons name="close" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Quick Actions — above the data, triggers action on what they're about to see */}
                <View style={styles.quickActionsRow}>
                    {[
                        { icon: 'create-outline',        label: 'Log Vitals', screen: 'ManualVitalsEntry', color: '#10B981', bg: '#ECFDF5' },
                        { icon: 'videocam-outline',       label: 'Consult',    screen: 'Consultation',      color: '#EF4444', bg: '#FEF2F2' },
                        { icon: 'person-circle-outline',  label: 'Coach',      screen: 'HealthCoach',       color: '#8B5CF6', bg: '#EDE9FE' },
                        { icon: 'trophy-outline',         label: 'Badges',     screen: 'Achievements',      color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(({ icon, label, screen, color, bg }) => (
                        <TouchableOpacity
                            key={screen}
                            style={styles.quickActionBtn}
                            onPress={() => navigation.navigate(screen)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: bg }]}>
                                <Ionicons name={icon as any} size={20} color={color} />
                            </View>
                            <Text style={styles.quickActionLabel}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Vitals Grid */}
                <View style={{ marginBottom: 16, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>Key Metrics</Text>
                        <View style={styles.sectionRight}>
                            {syncedAt && <Text style={styles.syncLabel}>{formatSyncTime(syncedAt)}</Text>}
                            <TouchableOpacity onPress={() => navigation.navigate('AllVitals')}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {hasWearableData && (
                        <View style={styles.sourceBadge}>
                            <Ionicons name="sync-circle" size={11} color="#16A34A" />
                            <Text style={styles.sourceBadgeText}>Google Fit</Text>
                        </View>
                    )}
                </View>

                <View style={styles.vitalsGrid}>
                    <VitalCard icon="heart" color="#E11D48" value={hrValue} unit="bpm" label="Heart Rate" />
                    <VitalCard icon="medical" color="#4F46E5" value={bpValue} unit="mmHg" label="Blood Pressure" />
                    <VitalCard icon="water" color="#0EA5E9" value={spo2Value} unit="%" label="Oxygen (SpO2)" />
                    <VitalCard icon="footsteps" color="#D97706" value={stepsValue} unit="steps" label="Activity" />
                </View>

                {!hasWearableData && (
                    <TouchableOpacity
                        style={styles.connectNudge}
                        onPress={() => navigation.navigate('Devices')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="hardware-chip-outline" size={16} color="#51A6CB" />
                        <Text style={styles.connectNudgeText}>Connect Google Fit to see live vitals</Text>
                        <Ionicons name="chevron-forward" size={14} color="#51A6CB" />
                    </TouchableOpacity>
                )}

                {/* Today's Modules */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Prescribed Modules</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Programs')}>
                        <Text style={styles.seeAll}>Library</Text>
                    </TouchableOpacity>
                </View>

                {(() => {
                    const hour = new Date().getHours();
                    const todaysSessions = [
                        { tag: 'Morning Routine', title: 'Cardiovascular Awakening', details: '15 min • Gentle Cardio', videoId: 'klmBssEYkdU', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&auto=format&fit=crop' },
                        { tag: 'Strength', title: 'Core Stabilization', details: '15 min • Rehabilitation', videoId: 'UBMk30rjy0o', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop' },
                        { tag: 'Afternoon Reset', title: 'Breathing for BP Control', details: '12 min • Respiratory', videoId: '8VwufJrUhic', image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&auto=format&fit=crop' },
                        { tag: 'Evening Wind-down', title: 'Cortisol Reduction', details: '10 min • Mindfulness', videoId: 'inpok4MKVLM', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop' },
                    ];

                    let picked = hour < 12 ? [todaysSessions[0], todaysSessions[1]] :
                        hour < 17 ? [todaysSessions[2], todaysSessions[1]] :
                            [todaysSessions[3], todaysSessions[0]];

                    return (
                        <>
                            {playingVideoId && (
                                <View style={styles.videoPlayerContainer}>
                                    <View style={styles.videoPlayerHeader}>
                                        <Text style={styles.videoPlayerTitle}>Clinical Stream</Text>
                                        <TouchableOpacity onPress={() => setPlayingVideoId(null)} accessibilityLabel="Close video" accessibilityRole="button">
                                            <Ionicons name="close" size={24} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.videoWrapper}>
                                        <YoutubeIframe height={200} play={true} videoId={playingVideoId} />
                                    </View>
                                </View>
                            )}

                            {picked.map((s, i) => (
                                <SessionCard key={i} {...s} onPress={() => setPlayingVideoId(s.videoId)} />
                            ))}
                        </>
                    );
                })()}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const VitalCard = ({ icon, color, value, unit, label }: any) => (
    <View style={styles.vitalCard}>
        <View style={styles.vitalHeader}>
            <View style={[styles.vitalIconWrap, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={styles.vitalLabel}>{label}</Text>
        </View>
        <View style={styles.vitalDataRow}>
            <Text style={styles.vitalValue}>{value}</Text>
            <Text style={styles.vitalUnit}>{unit}</Text>
        </View>
    </View>
);

const SessionCard = ({ tag, title, details, image, onPress }: any) => (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: image }} style={styles.sessionImage} />
        <View style={styles.sessionOverlay}>
            <LinearGradient
                colors={['transparent', 'rgba(15,23,42,0.9)']}
                style={styles.sessionGradient}
            />
            <View style={styles.sessionCardContent}>
                <View style={styles.sessionTag}>
                    <Text style={styles.sessionTagText}>{tag}</Text>
                </View>
                <Text style={styles.sessionTitle}>{title}</Text>
                <View style={styles.sessionMetaRow}>
                    <Text style={styles.sessionDetails}>{details}</Text>
                    <View style={styles.playButton}>
                        <Ionicons name="play" size={12} color="#0F172A" style={{ marginLeft: 2 }} />
                    </View>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    absoluteGradient: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    scrollContent: { paddingHorizontal: 20 },

    // Header
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
    headerGreetingCol: { flex: 1 },
    greeting: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    userName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerActionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerActionText: { color: '#FFF', fontSize: 13, fontWeight: '700', marginLeft: 6 },
    iconButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    avatarButton: { borderWidth: 2, borderColor: '#51A6CB', borderRadius: 22, padding: 2 },
    avatarFallback: { width: 36, height: 36, backgroundColor: '#FFFFFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    avatar: { width: 36, height: 36, borderRadius: 18 },

    // Wellness Card
    wellnessCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: '#F1F5F9' },
    scoreRow: { flexDirection: 'row', alignItems: 'center' },
    scoreCircle: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
    scoreTextOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    scoreVal: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -1 },
    scoreMax: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: -2 },
    scoreInfo: { flex: 1 },
    scoreSubtitle: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
    scoreTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
    scorePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    scorePillText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
    chevron: { marginLeft: 8 },

    // Alerts
    alertCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 28, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
    alertLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#DC2626' },
    alertIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginLeft: 6, marginRight: 12 },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    alertDesc: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    alertAction: { fontSize: 13, fontWeight: '700', color: '#2563EB', padding: 8 },

    // Headers
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    syncLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
    seeAll: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
    sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    sourceBadgeText: { fontSize: 10, color: '#16A34A', fontWeight: '600' },
    connectNudge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF9FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 10, borderWidth: 1, borderColor: '#BAE6FD' },
    connectNudgeText: { flex: 1, fontSize: 13, color: '#0369A1', fontWeight: '600' },
    recCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, gap: 14 },
    recIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    recTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
    recBody: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 8 },
    recCta: { fontSize: 12, fontWeight: '700' },

    // Vitals
    vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
    vitalCard: { width: (width - 55) / 2, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 15, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#F8FAFC' },
    vitalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    vitalIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    vitalLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    vitalDataRow: { flexDirection: 'row', alignItems: 'baseline' },
    vitalValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    vitalUnit: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginLeft: 4 },

    // Sessions
    sessionCard: { height: 160, borderRadius: 24, overflow: 'hidden', marginBottom: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8, backgroundColor: '#0F172A' },
    sessionImage: { width: '100%', height: '100%' },
    sessionOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
    sessionGradient: { position: 'absolute', bottom: 0, width: '100%', height: '80%' },
    sessionCardContent: { padding: 20 },
    sessionTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sessionTagText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 0.5, textTransform: 'uppercase' },
    sessionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, letterSpacing: -0.5 },
    sessionMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sessionDetails: { fontSize: 13, color: '#CBD5E1', fontWeight: '500' },
    playButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },

    // Video Player
    videoPlayerContainer: { marginBottom: 24, backgroundColor: '#0F172A', borderRadius: 24, overflow: 'hidden', shadowColor: "#0F172A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
    videoPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    videoPlayerTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: 1 },
    videoWrapper: { width: '100%', height: 200, backgroundColor: '#000' },
    abnormalAlert: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 14, marginBottom: 12 },
    abnormalAlertText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500', color: '#1E293B' },
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 12, gap: 8 },
    quickActionBtn: { flex: 1, alignItems: 'center', gap: 6 },
    quickActionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    quickActionLabel: { fontSize: 11, fontWeight: '600', color: '#475569', textAlign: 'center' },
});

export default HealthDashboardScreen;
