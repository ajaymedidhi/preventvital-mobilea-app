import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, StatusBar,
} from 'react-native';
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
import { RetryView } from '../components/RetryView';
import client from '../api/client';
import DailyCheckInCard from '../components/DailyCheckInCard';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;
const SESSION_W = width * 0.72;

// ─── Static helpers ───────────────────────────────────────────────────────────
const getScoreConfig = (s: number) => {
    if (s >= 80) return { label: 'Excellent', color: '#10B981', accent: '#059669' };
    if (s >= 60) return { label: 'Good',      color: '#3B82F6', accent: '#1D4ED8' };
    if (s >= 40) return { label: 'Fair',      color: '#F59E0B', accent: '#D97706' };
    if (s > 0)   return { label: 'At Risk',   color: '#EF4444', accent: '#B91C1C' };
    return             { label: 'No Score',  color: '#94A3B8', accent: '#64748B' };
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', icon: '🌤️' };
    if (h < 17) return { text: 'Good Afternoon', icon: '☀️' };
    return             { text: 'Good Evening',   icon: '🌙' };
};

const formatSync = (d: Date | null) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 1) return 'Just synced';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
};

const TIPS = [
    { icon: 'water-outline',   color: '#0EA5E9', tip: 'Drink 8 glasses of water today to support cardiovascular function.' },
    { icon: 'walk-outline',    color: '#10B981', tip: '30 minutes of brisk walking 5 days a week reduces heart disease risk by 35%.' },
    { icon: 'moon-outline',    color: '#8B5CF6', tip: 'Getting 7–9 hours of sleep nightly lowers blood pressure significantly.' },
    { icon: 'leaf-outline',    color: '#22C55E', tip: 'Eating 5 servings of fruits and vegetables daily cuts stroke risk by 26%.' },
    { icon: 'fitness-outline', color: '#F59E0B', tip: 'Deep breathing for 5 minutes can reduce systolic BP by up to 10 mmHg.' },
];
const todayTip = TIPS[new Date().getDate() % TIPS.length];

// ─── Sub-components ───────────────────────────────────────────────────────────
const VitalCard = ({ icon, color, value, unit, label, onPress }: any) => (
    <TouchableOpacity
        style={styles.vitalCard}
        onPress={onPress}
        activeOpacity={0.82}
        accessible
        accessibilityLabel={`${label}: ${value === '—' ? 'no data' : `${value} ${unit}`}`}
    >
        <View style={[styles.vitalBar, { backgroundColor: color }]} />
        <View style={styles.vitalBody}>
            <View style={[styles.vitalIcon, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon} size={15} color={color} />
            </View>
            <Text style={styles.vitalLabel}>{label}</Text>
            <View style={styles.vitalDataRow}>
                <Text style={[styles.vitalVal, value === '—' && styles.vitalEmpty]}>{value}</Text>
                {value !== '—' && <Text style={styles.vitalUnit}>{unit}</Text>}
            </View>
        </View>
    </TouchableOpacity>
);

const SessionCard = ({ tag, title, details, image, onPress }: any) => (
    <TouchableOpacity
        style={styles.sessionCard}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Play: ${title}`}
    >
        <Image source={{ uri: image }} style={StyleSheet.absoluteFillObject as any} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(5,10,25,0.94)']} style={StyleSheet.absoluteFillObject as any} />
        <View style={styles.sessionBody}>
            <View style={styles.sessionPill}>
                <Text style={styles.sessionPillTxt}>{tag.toUpperCase()}</Text>
            </View>
            <Text style={styles.sessionTitle} numberOfLines={2}>{title}</Text>
            <View style={styles.sessionFooter}>
                <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.6)" />
                <Text style={styles.sessionMeta}>{details}</Text>
                <View style={styles.playBtn}>
                    <Ionicons name="play" size={11} color="#0F172A" style={{ marginLeft: 1 }} />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const HealthDashboardScreen = ({ route }: any) => {
    const nav = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { user, isNewRegistration } = useAuth();

    const [data, setData] = useState<NormalizedHealthData | null>(null);
    const [wearableData, setWearableData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [syncedAt, setSyncedAt] = useState<Date | null>(null);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const lastFetch = useRef<number>(0);

    const loadData = useCallback(async (force = false) => {
        if (!force && Date.now() - lastFetch.current < 2 * 60 * 1000) return;
        setLoading(true);
        setHasError(false);
        try {
            const vitals = await getVitals();
            setData(vitals);
            try {
                const wRes = await client.get('/api/wearables/latest');
                if (wRes.data?.data) {
                    setWearableData(wRes.data.data);
                    const ts = wRes.data.data.lastUpdated;
                    setSyncedAt(ts ? new Date(ts) : new Date());
                }
            } catch { if (vitals) setSyncedAt(new Date()); }

            const cur = user?.profile?.healthScore;
            const skipped = route?.params?.skippedAssessment || cur === -1;
            if (isNewRegistration && !skipped && (!cur || cur === 0))
                nav.reset({ index: 0, routes: [{ name: 'CardioAssessment' }] });
        } catch {
            if (!data) setHasError(true);
        } finally {
            lastFetch.current = Date.now();
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    if (loading) return <DashboardSkeleton />;
    if (hasError) return (
        <RetryView
            message="Couldn't load your health data. Check your connection and try again."
            onRetry={() => loadData(true)}
        />
    );

    // ── Derived ──────────────────────────────────────────────────────────────
    const score    = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const cfg      = getScoreConfig(score);
    const greeting = getGreeting();
    const name     = user?.profile?.firstName || 'there';
    const R = 48, CIRC = 2 * Math.PI * R;

    const hrVal  = wearableData?.heartRate != null ? String(Math.round(wearableData.heartRate))
                 : data?.metrics?.heartRate != null ? String(Math.round(data.metrics.heartRate)) : '—';
    const spo2   = wearableData?.spo2 != null ? String(Math.round(wearableData.spo2))
                 : data?.metrics?.spo2 != null ? String(Math.round(data.metrics.spo2)) : '—';
    const bp     = wearableData?.bloodPressure
                 ? `${wearableData.bloodPressure.systolic ?? '—'}/${wearableData.bloodPressure.diastolic ?? '—'}` : '—';
    const rawSteps = wearableData?.steps ?? data?.metrics?.steps;
    const steps  = rawSteps != null ? (rawSteps >= 1000 ? (rawSteps / 1000).toFixed(1) + 'k' : String(rawSteps)) : '—';
    const hasW   = !!(wearableData?.heartRate || wearableData?.spo2 || wearableData?.steps || wearableData?.bloodPressure);

    type AI = { key: string; icon: 'warning' | 'warning-outline' | 'alert-circle-outline'; color: string; bg: string; msg: string };
    const alerts: AI[] = hasW ? (() => {
        const out: AI[] = [];
        const { spo2: sp, heartRate: hr, bloodPressure: bpd } = wearableData ?? {};
        if (sp != null && sp < 90)     out.push({ key: 'spo2_crit', icon: 'warning',             color: '#DC2626', bg: '#FEF2F2', msg: `SpO₂ ${Math.round(sp)}% critically low — call your doctor immediately.` });
        else if (sp != null && sp < 94) out.push({ key: 'spo2_low',  icon: 'warning-outline',      color: '#F59E0B', bg: '#FFFBEB', msg: `SpO₂ ${Math.round(sp)}% slightly below normal. Monitor closely.` });
        if (hr != null && hr > 100)     out.push({ key: 'hr_high',   icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2', msg: `Heart rate ${Math.round(hr)} bpm elevated. Consult your doctor if persistent.` });
        else if (hr != null && hr < 50) out.push({ key: 'hr_low',    icon: 'alert-circle-outline', color: '#F59E0B', bg: '#FFFBEB', msg: `Heart rate ${Math.round(hr)} bpm is low. Consult your doctor if persistent.` });
        if (bpd?.systolic != null && (bpd.systolic > 140 || (bpd.diastolic ?? 0) > 90))
            out.push({ key: 'bp_high', icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2', msg: `High BP ${bpd.systolic}/${bpd.diastolic ?? '?'} mmHg — medical consultation recommended.` });
        return out.filter(a => !dismissed.has(a.key));
    })() : [];

    const recMap: Record<string, any> = {
        none:      { icon: 'fitness-outline',    color: '#6366F1', title: 'Get your CVITAL score',          body: 'A 5-min assessment unlocks your full cardiovascular risk profile.', screen: 'CardioAssessment' },
        at_risk:   { icon: 'warning-outline',    color: '#EF4444', title: 'Your heart needs attention',     body: 'Start a cardiac program and schedule a consultation.', screen: 'Programs' },
        fair:      { icon: 'walk-outline',       color: '#F59E0B', title: 'Boost your Fair score',          body: '30 min walks daily + less salt can meaningfully raise your score.', screen: 'Programs' },
        good:      { icon: 'trending-up-outline',color: '#3B82F6', title: "You're on the right track",     body: 'Connect a wearable to track daily vitals and push to Excellent.', screen: 'Devices' },
        excellent: { icon: 'ribbon-outline',     color: '#10B981', title: 'Excellent cardiovascular health',body: 'Re-assess in 3 months to confirm you\'re staying in the top band.', screen: 'WellnessScore' },
    };
    const recKey = score === 0 ? 'none' : score < 40 ? 'at_risk' : score < 60 ? 'fair' : score < 80 ? 'good' : 'excellent';
    const rec = recMap[recKey];

    const ALL_SESSIONS = [
        { tag: 'Morning',   title: 'Cardiovascular Awakening', details: '15 min · Gentle Cardio', videoId: 'klmBssEYkdU', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=600&auto=format&fit=crop' },
        { tag: 'Strength',  title: 'Core Stabilization',       details: '15 min · Rehab',         videoId: 'UBMk30rjy0o', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop' },
        { tag: 'Afternoon', title: 'Breathing for BP Control', details: '12 min · Respiratory',   videoId: '8VwufJrUhic', image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&auto=format&fit=crop' },
        { tag: 'Evening',   title: 'Cortisol Reduction',       details: '10 min · Mindfulness',   videoId: 'inpok4MKVLM', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop' },
    ];
    const h = new Date().getHours();
    const sessions = h < 12 ? [ALL_SESSIONS[0], ALL_SESSIONS[1], ALL_SESSIONS[2]]
                  : h < 17  ? [ALL_SESSIONS[2], ALL_SESSIONS[1], ALL_SESSIONS[3]]
                  : [ALL_SESSIONS[3], ALL_SESSIONS[0], ALL_SESSIONS[1]];

    const QA = [
        { icon: 'create-outline',        label: 'Log Vitals', screen: 'ManualVitalsEntry', color: '#10B981', bg: '#ECFDF5' },
        { icon: 'videocam-outline',       label: 'Consult',    screen: 'Consultation',      color: '#EF4444', bg: '#FEF2F2' },
        { icon: 'person-circle-outline',  label: 'Coach',      screen: 'HealthCoach',       color: '#8B5CF6', bg: '#EDE9FE' },
        { icon: 'trophy-outline',         label: 'Badges',     screen: 'Achievements',      color: '#F59E0B', bg: '#FFFBEB' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />

            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.heroBg, { height: 310 + insets.top }]}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 18 }]}
            >
                {/* ── Header ──────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetSmall}>{greeting.icon}  {greeting.text}</Text>
                        <Text style={styles.greetName}>{name}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.assessPill}
                            onPress={() => nav.navigate('CardioAssessment')}
                            accessibilityLabel="Take health assessment"
                            accessibilityRole="button"
                        >
                            <Ionicons name="fitness" size={13} color="#FFF" />
                            <Text style={styles.assessTxt}>Assess</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => nav.navigate('Notifications')}
                            accessibilityLabel="Notifications"
                        >
                            <Ionicons name="notifications-outline" size={20} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => nav.navigate('Profile')} style={styles.avatarRing} accessibilityLabel="Profile">
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarTxt}>{name[0].toUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Score Card ──────────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.scoreCard}
                    onPress={() => nav.navigate(score === 0 ? 'CardioAssessment' : 'WellnessScore')}
                    activeOpacity={0.92}
                    accessibilityRole="button"
                    accessibilityLabel={`CVITAL score ${score > 0 ? score : 'not set'}, ${cfg.label}`}
                >
                    {/* Circle */}
                    <View style={styles.scoreCircleWrap}>
                        <Svg height="120" width="120" viewBox="0 0 120 120">
                            <Defs>
                                <SvgGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor={cfg.color} stopOpacity="1" />
                                    <Stop offset="1" stopColor={cfg.accent} stopOpacity="1" />
                                </SvgGradient>
                            </Defs>
                            <G transform="rotate(-90, 60, 60)">
                                <Circle cx="60" cy="60" r={R} stroke="#EEF2F7" strokeWidth="10" fill="none" />
                                <Circle cx="60" cy="60" r={R}
                                    stroke={score > 0 ? 'url(#sg)' : '#E2E8F0'}
                                    strokeWidth="10" fill="none"
                                    strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)}
                                    strokeLinecap="round"
                                />
                            </G>
                        </Svg>
                        <View style={styles.scoreNumWrap}>
                            <Text style={[styles.scoreNum, score === 0 && { fontSize: 22 }]}>
                                {score > 0 ? score : '—'}
                            </Text>
                            <Text style={styles.scoreSub}>cvital™</Text>
                        </View>
                    </View>

                    {/* Right info */}
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreMeta}>CARDIOVASCULAR STATE</Text>
                        <Text style={[styles.scoreStatus, { color: cfg.color }]}>{cfg.label}</Text>

                        {/* Mini progress bar */}
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${score}%` as any, backgroundColor: cfg.color }]} />
                        </View>
                        <Text style={styles.progressTxt}>{score}/100</Text>

                        <View style={[styles.viewPill, { backgroundColor: cfg.color + '14' }]}>
                            <Ionicons name={score > 0 ? 'bar-chart-outline' : 'fitness-outline'} size={11} color={cfg.color} />
                            <Text style={[styles.viewPillTxt, { color: cfg.color }]}>
                                {score > 0 ? 'Full report →' : 'Begin now →'}
                            </Text>
                        </View>

                        {hasW && syncedAt && (
                            <View style={styles.syncRow}>
                                <Ionicons name="sync-circle" size={11} color="#16A34A" />
                                <Text style={styles.syncTxt}>Fit · {formatSync(syncedAt)}</Text>
                            </View>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={17} color="#CBD5E1" />
                </TouchableOpacity>

                {/* ── Alerts ──────────────────────────────────────────── */}
                {alerts.map(a => (
                    <View key={a.key} style={[styles.alertCard, { backgroundColor: a.bg }]}>
                        <View style={[styles.alertStripe, { backgroundColor: a.color }]} />
                        <Ionicons name={a.icon} size={17} color={a.color} style={{ flexShrink: 0 }} />
                        <Text style={styles.alertTxt}>{a.msg}</Text>
                        <TouchableOpacity
                            onPress={() => setDismissed(p => new Set([...p, a.key]))}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Dismiss alert"
                        >
                            <Ionicons name="close" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* ── Quick Actions (above FAB zone) ───────────────────── */}
                <View style={styles.qaCard}>
                    {QA.map(({ icon, label, screen, color, bg }) => (
                        <TouchableOpacity
                            key={screen}
                            style={styles.qaItem}
                            onPress={() => nav.navigate(screen)}
                            accessibilityRole="button"
                            accessibilityLabel={label}
                        >
                            <View style={[styles.qaIconWrap, { backgroundColor: bg }]}>
                                <Ionicons name={icon as any} size={22} color={color} />
                            </View>
                            <Text style={styles.qaLabel}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Recommendation ──────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.recCard}
                    onPress={() => nav.navigate(rec.screen)}
                    activeOpacity={0.88}
                >
                    <View style={[styles.recIconWrap, { backgroundColor: rec.color + '18' }]}>
                        <Ionicons name={rec.icon} size={22} color={rec.color} />
                    </View>
                    <View style={styles.recText}>
                        <Text style={[styles.recTitle, { color: rec.color }]}>{rec.title}</Text>
                        <Text style={styles.recBody}>{rec.body}</Text>
                    </View>
                    <View style={[styles.recArrow, { backgroundColor: rec.color + '18' }]}>
                        <Ionicons name="arrow-forward" size={13} color={rec.color} />
                    </View>
                </TouchableOpacity>

                {/* ── Daily Check-In ───────────────────────────────────── */}
                <DailyCheckInCard />

                {/* ── Health Tip of the Day ────────────────────────────── */}
                <View style={styles.tipCard}>
                    <LinearGradient
                        colors={['#0F172A', '#1E293B']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.tipGrad}
                    >
                        <View style={[styles.tipIconWrap, { backgroundColor: todayTip.color + '28' }]}>
                            <Ionicons name={todayTip.icon as any} size={20} color={todayTip.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tipLabel}>💡 Today's Health Tip</Text>
                            <Text style={styles.tipText}>{todayTip.tip}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* ── Key Metrics ─────────────────────────────────────── */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Key Metrics</Text>
                    <TouchableOpacity onPress={() => nav.navigate('AllVitals')} style={styles.seeAllRow}>
                        <Text style={styles.seeAllTxt}>See All</Text>
                        <Ionicons name="chevron-forward" size={13} color="#51A6CB" />
                    </TouchableOpacity>
                </View>

                {!hasW && (
                    <TouchableOpacity style={styles.connectCard} onPress={() => nav.navigate('Devices')} activeOpacity={0.85}>
                        <LinearGradient colors={['#EFF9FF', '#DBEAFE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.connectInner}>
                            <View style={styles.connectIcon}>
                                <Ionicons name="hardware-chip-outline" size={20} color="#0EA5E9" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.connectTitle}>Connect Google Fit</Text>
                                <Text style={styles.connectSub}>See live heart rate, SpO₂ & steps</Text>
                            </View>
                            <Ionicons name="arrow-forward-circle" size={24} color="#3B82F6" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <View style={styles.vitalsGrid}>
                    <VitalCard icon="heart"     color="#E11D48" value={hrVal} unit="bpm"   label="Heart Rate"     onPress={() => nav.navigate('AllVitals')} />
                    <VitalCard icon="medical"   color="#4F46E5" value={bp}    unit="mmHg"  label="Blood Pressure"  onPress={() => nav.navigate('AllVitals')} />
                    <VitalCard icon="water"     color="#0EA5E9" value={spo2}  unit="%"     label="SpO₂"            onPress={() => nav.navigate('AllVitals')} />
                    <VitalCard icon="footsteps" color="#D97706" value={steps} unit="steps" label="Activity"        onPress={() => nav.navigate('AllVitals')} />
                </View>

                {/* ── Today's Sessions (horizontal scroll) ─────────────── */}
                <View style={[styles.sectionRow, { marginTop: 4 }]}>
                    <Text style={styles.sectionTitle}>Today's Sessions</Text>
                    <TouchableOpacity onPress={() => nav.navigate('Programs')} style={styles.seeAllRow}>
                        <Text style={styles.seeAllTxt}>Library</Text>
                        <Ionicons name="chevron-forward" size={13} color="#51A6CB" />
                    </TouchableOpacity>
                </View>

                {playingVideoId && (
                    <View style={styles.videoCard}>
                        <View style={styles.videoHeader}>
                            <View style={styles.liveDot} />
                            <Text style={styles.videoTitle}>Now Playing</Text>
                            <TouchableOpacity onPress={() => setPlayingVideoId(null)} style={styles.videoClose} accessibilityLabel="Close video">
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <YoutubeIframe height={210} play videoId={playingVideoId} />
                    </View>
                )}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={SESSION_W + 12}
                    snapToAlignment="start"
                    contentContainerStyle={styles.sessionsScroll}
                >
                    {sessions.map((s, i) => (
                        <View key={i} style={{ width: SESSION_W, marginRight: 12 }}>
                            <SessionCard {...s} onPress={() => setPlayingVideoId(s.videoId)} />
                        </View>
                    ))}
                    {/* View All card */}
                    <TouchableOpacity
                        style={styles.viewAllCard}
                        onPress={() => nav.navigate('Programs')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.viewAllIcon}>
                            <Ionicons name="library-outline" size={28} color="#51A6CB" />
                        </View>
                        <Text style={styles.viewAllTxt}>View{'\n'}Library</Text>
                        <Ionicons name="arrow-forward" size={16} color="#51A6CB" style={{ marginTop: 8 }} />
                    </TouchableOpacity>
                </ScrollView>

                <View style={{ height: 130 }} />
            </ScrollView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F5F9' },
    heroBg: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    scroll: { paddingHorizontal: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
    greetSmall: { fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: '600', letterSpacing: 0.2, marginBottom: 3 },
    greetName:  { fontSize: 27, fontWeight: '800', color: '#FFF', letterSpacing: -0.6 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    assessPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)', paddingHorizontal: 12,
        paddingVertical: 7, borderRadius: 20,
    },
    assessTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    iconBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarRing: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 23, padding: 2 },
    avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    avatarTxt: { fontSize: 16, fontWeight: '800', color: '#FFF' },

    // Score Card
    scoreCard: {
        backgroundColor: '#FFF', borderRadius: 26, padding: 20,
        flexDirection: 'row', alignItems: 'center', marginBottom: 14,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.10, shadowRadius: 24, elevation: 12,
    },
    scoreCircleWrap: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    scoreNumWrap: { position: 'absolute', alignItems: 'center' },
    scoreNum:     { fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -1.5 },
    scoreSub:     { fontSize: 9, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: -2 },
    scoreInfo:    { flex: 1 },
    scoreMeta:    { fontSize: 9, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
    scoreStatus:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 10 },
    progressBg:   { height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    progressTxt:  { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginBottom: 10 },
    viewPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 6 },
    viewPillTxt:  { fontSize: 11, fontWeight: '700' },
    syncRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
    syncTxt:      { fontSize: 10, color: '#16A34A', fontWeight: '600' },

    // Alerts
    alertCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 14, marginBottom: 10, overflow: 'hidden' },
    alertStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
    alertTxt:    { flex: 1, fontSize: 13, color: '#1E293B', lineHeight: 19, fontWeight: '500', paddingLeft: 4 },

    // Quick Actions (inside a grouped card)
    qaCard: {
        flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 22,
        paddingVertical: 16, paddingHorizontal: 8, marginBottom: 14,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 5,
        justifyContent: 'space-around',
    },
    qaItem:    { alignItems: 'center', gap: 7 },
    qaIconWrap:{ width: 54, height: 54, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    qaLabel:   { fontSize: 11, fontWeight: '600', color: '#475569' },

    // Recommendation
    recCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 14,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 5,
    },
    recIconWrap: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    recText:  { flex: 1 },
    recTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
    recBody:  { fontSize: 12, color: '#64748B', lineHeight: 18 },
    recArrow: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

    // Tip
    tipCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 22, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 8 },
    tipGrad: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
    tipIconWrap: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    tipLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
    tipText:  { fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 19, fontWeight: '500' },

    // Section
    sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle:{ fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
    seeAllRow:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
    seeAllTxt:   { fontSize: 13, color: '#51A6CB', fontWeight: '700' },

    // Connect
    connectCard:  { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    connectInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    connectIcon:  { width: 42, height: 42, borderRadius: 13, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
    connectTitle: { fontSize: 14, fontWeight: '700', color: '#0369A1' },
    connectSub:   { fontSize: 12, color: '#0EA5E9', fontWeight: '500', marginTop: 2 },

    // Vitals
    vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 26 },
    vitalCard: {
        width: CARD_W, backgroundColor: '#FFF', borderRadius: 20,
        marginBottom: 12, overflow: 'hidden',
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    },
    vitalBar:     { height: 4, width: '100%' },
    vitalBody:    { padding: 14 },
    vitalIcon:    { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    vitalLabel:   { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
    vitalDataRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    vitalVal:     { fontSize: 27, fontWeight: '800', color: '#0F172A', letterSpacing: -0.8 },
    vitalEmpty:   { color: '#CBD5E1' },
    vitalUnit:    { fontSize: 11, fontWeight: '600', color: '#94A3B8' },

    // Sessions horizontal scroll
    sessionsScroll: { paddingLeft: 0, paddingRight: 8 },
    sessionCard: {
        width: '100%', height: 190, borderRadius: 24, overflow: 'hidden',
        backgroundColor: '#0F172A',
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
    },
    sessionBody: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
    sessionPill: {
        alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 8,
    },
    sessionPillTxt: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
    sessionTitle:   { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.4 },
    sessionFooter:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
    sessionMeta:    { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
    playBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },

    viewAllCard: {
        width: 110, height: 190, borderRadius: 24,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 5,
    },
    viewAllIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#EFF9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    viewAllTxt:  { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center', lineHeight: 18 },

    // Video player
    videoCard: {
        backgroundColor: '#0F172A', borderRadius: 24, overflow: 'hidden',
        marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22, shadowRadius: 16, elevation: 12,
    },
    videoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    liveDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
    videoTitle:  { flex: 1, fontSize: 12, fontWeight: '700', color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: 1.2 },
    videoClose:  { padding: 4 },
});

export default HealthDashboardScreen;
