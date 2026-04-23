import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import YoutubeIframe from 'react-native-youtube-iframe';

import { getVitals } from '../api/vitalsSync';
import { NormalizedHealthData } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const { width } = Dimensions.get('window');

const HealthDashboardScreen = ({ route }: any) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { user, isNewRegistration } = useAuth();
    const [data, setData] = useState<NormalizedHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const vitals = await getVitals();
            setData(vitals);

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
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
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
                            {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 'Patient'}
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
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
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
                    onPress={() => navigation.navigate('WellnessScore')}
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
                                <Text style={styles.scoreVal}>{wellnessScore}</Text>
                                <Text style={styles.scoreMax}>cvital™</Text>
                            </View>
                        </View>

                        <View style={styles.scoreInfo}>
                            <Text style={styles.scoreSubtitle}>Cardiovascular State</Text>
                            <Text style={styles.scoreTitle}>{dbStatusText}</Text>
                            <View style={[styles.scorePill, { backgroundColor: dbStatusColor + '15' }]}>
                                <Ionicons name="pulse" size={14} color={dbStatusColor} />
                                <Text style={[styles.scorePillText, { color: dbStatusColor }]}>
                                    Based on recent data
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={styles.chevron} />
                    </View>
                </TouchableOpacity>

                {/* Alerts */}
                <View style={styles.alertCard}>
                    <View style={styles.alertLine} />
                    <View style={styles.alertIconBg}>
                        <Ionicons name="warning" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Elevated Blood Pressure</Text>
                        <Text style={styles.alertDesc}>145/92 mmHg • 2h ago</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.alertAction}>Review</Text>
                    </TouchableOpacity>
                </View>

                {/* Vitals Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Key Metrics</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllVitals')}>
                        <Text style={styles.seeAll}>See All Metrics</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.vitalsGrid}>
                    <VitalCard icon="heart" color="#E11D48" value={data?.hr?.avg ? Math.round(data.hr.avg).toString() : '72'} unit="bpm" label="Heart Rate" />
                    <VitalCard icon="medical" color="#4F46E5" value="118/76" unit="mmHg" label="Blood Pressure" />
                    <VitalCard icon="water" color="#0EA5E9" value="95" unit="%" label="Oxygen (SpO2)" />
                    <VitalCard icon="footsteps" color="#D97706" value={data?.s ? (data.s / 1000).toFixed(1) + 'k' : '3.4k'} unit="steps" label="Activity" />
                </View>

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
                                        <TouchableOpacity onPress={() => setPlayingVideoId(null)}>
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
    greeting: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
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
    seeAll: { fontSize: 13, color: '#2563EB', fontWeight: '700' },

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
    videoWrapper: { width: '100%', height: 200, backgroundColor: '#000' }
});

export default HealthDashboardScreen;
