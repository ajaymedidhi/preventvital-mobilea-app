import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import YoutubeIframe from 'react-native-youtube-iframe';

import { getVitals, syncVitals } from '../api/vitalsSync';
import { NormalizedHealthData } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const { width } = Dimensions.get('window');

const HealthDashboardScreen = ({ route }: any) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { signOut, user, isNewRegistration } = useAuth();
    const [data, setData] = useState<NormalizedHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const vitals = await getVitals();
            setData(vitals);

            // Check if user is a new signup without an assessment
            // (e.g., wellness score is default or skipped)
            // If so, automatically open the Cardio Assessment onboarding
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

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    // Real backend scores
    const wellnessScore = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const scoreProgress = wellnessScore / 100;
    const circleCircumference = 2 * Math.PI * 35; // Smaller circle
    const strokeDashoffset = circleCircumference * (1 - scoreProgress);

    // Status Logic
    let dbStatusText = "Pending";
    let dbStatusColor = "#E2E8F0";
    if (wellnessScore >= 80) { dbStatusText = "Excellent"; dbStatusColor = "#22C55E"; }
    else if (wellnessScore >= 60) { dbStatusText = "Good"; dbStatusColor = "#3B82F6"; }
    else if (wellnessScore >= 40) { dbStatusText = "Fair"; dbStatusColor = "#EAB308"; }
    else if (wellnessScore > 0) { dbStatusText = "At Risk"; dbStatusColor = "#EF4444"; }

    return (
        <View style={styles.container}>
            {/* Absolute Background Gradient */}
            <LinearGradient
                colors={['#A78BFA', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.absoluteGradient, { height: 260 + insets.top }]}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
            >
                {/* Header Top Bar */}
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>
                            {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 'User'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>

                        <TouchableOpacity style={[styles.iconButton, { width: undefined, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 }]} onPress={() => navigation.navigate('CardioAssessment')}>
                            <Ionicons name="pulse" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 4 }}>Assess</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={24} color="#6366F1" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            {user?.profile?.firstName ? (
                                <View style={[styles.avatar, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>
                                        {user.profile.firstName[0].toUpperCase()}
                                        {user.profile.lastName ? user.profile.lastName[0].toUpperCase() : ''}
                                    </Text>
                                </View>
                            ) : (
                                <Image
                                    source={{ uri: 'https://ui-avatars.com/api/?name=User&background=F3F4F6&color=333' }}
                                    style={styles.avatar}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Wellness Score Card */}
                <TouchableOpacity
                    style={[styles.wellnessCard, { marginBottom: 24 }]}
                    onPress={() => navigation.navigate('WellnessScore')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scoreCircle}>
                        <Svg height="80" width="80" viewBox="0 0 80 80">
                            <G rotation="-90" origin="40, 40">
                                <Circle cx="40" cy="40" r="35" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                                <Circle
                                    cx="40" cy="40" r="35"
                                    stroke={wellnessScore > 0 ? dbStatusColor : "#E2E8F0"} strokeWidth="8" fill="transparent"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </G>
                        </Svg>
                        <View style={styles.scoreTextOverlay}>
                            <Text style={styles.scoreVal}>{wellnessScore}</Text>
                            <Text style={styles.scoreMax}>/100</Text>
                        </View>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreTitle}>Your Vital Score is {dbStatusText}</Text>
                        <Text style={styles.scoreSubtitle}>Based on recent assessment</Text>
                        <View style={styles.scoreStatus}>
                            <Ionicons name="heart" size={14} color={dbStatusColor} />
                            <Text style={[styles.scoreStatusText, { color: dbStatusColor }]}>
                                {wellnessScore > 0 ? dbStatusText : "Pending"}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                {/* Alert Card */}
                <View style={styles.alertCard}>
                    <View style={styles.alertIcon}>
                        <Ionicons name="warning-outline" size={20} color="#EAB308" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Blood Pressure elevated: 145/92 mmHg</Text>
                        <Text style={styles.alertTime}>2 hours ago</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#EAB308" />
                </View>

                {/* Vitals Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Vitals</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllVitals')}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitalsScroll}>
                    <VitalCard
                        icon="heart-outline" color="#2563EB"
                        value={data?.hr?.avg ? Math.round(data.hr.avg).toString() : '72'}
                        unit="bpm" label="Heart Rate"
                    />
                    <VitalCard
                        icon="pulse-outline" color="#EF4444"
                        value="118/76"
                        unit="mmHg" label="Blood Pressure"
                    />
                    <VitalCard
                        icon="water-outline" color="#EF4444"
                        value="95"
                        unit="%" label="Blood Oxygen"
                    />
                </ScrollView>

                {/* Steps Section */}
                <View style={styles.stepsCard}>
                    <View style={styles.stepsIconContainer}>
                        <Ionicons name="footsteps" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.stepsContent}>
                        <View style={styles.stepsRow}>
                            <Text style={styles.stepsLabel}>Steps Today</Text>
                            <Text style={styles.stepsValue}>
                                <Text style={styles.stepsCurrent}>{data?.s ? data.s.toLocaleString() : '3,450'}</Text>
                                <Text style={styles.stepsTarget}> / 10,000</Text>
                            </Text>
                        </View>
                        <View style={styles.stepsProgressBg}>
                            <View style={[styles.stepsProgressFill, { width: '35%' }]} />
                        </View>
                    </View>
                </View>

                {/* ── Today's Sessions (Dynamic) ────────────────── */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Today's Sessions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Programs')}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {(() => {
                    const hour = new Date().getHours();
                    const todaysSessions = [
                        // Morning
                        { emoji: '🧎', title: 'Sun Salutation (Surya Namaskar)', details: '15 min • Yoga • Morning', videoId: 'klmBssEYkdU', colors: ['#059669', '#16A34A'] as [string, string], timeSlot: '🌅 Morning', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&auto=format&fit=crop' },
                        { emoji: '💪', title: '15-Min Full Body Workout', details: '15 min • Fitness • Morning', videoId: 'UBMk30rjy0o', colors: ['#EA580C', '#DC2626'] as [string, string], timeSlot: '🌅 Morning', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop' },
                        // Afternoon
                        { emoji: '🌬️', title: 'Anulom Vilom Pranayam', details: '12 min • Breathing • Afternoon', videoId: '8VwufJrUhic', colors: ['#0D9488', '#06B6D4'] as [string, string], timeSlot: '☀️ Afternoon', image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&auto=format&fit=crop' },
                        { emoji: '🌬️', title: 'Kapalbhati Pranayam', details: '10 min • Breathing • Afternoon', videoId: 'DcUjhJTmHbg', colors: ['#0D9488', '#06B6D4'] as [string, string], timeSlot: '☀️ Afternoon', image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&auto=format&fit=crop' },
                        // Evening
                        { emoji: '🧘', title: '10-Minute Morning Meditation', details: '10 min • Mindfulness • Evening', videoId: 'inpok4MKVLM', colors: ['#7C3AED', '#6366F1'] as [string, string], timeSlot: '🌙 Evening', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop' },
                        { emoji: '🧎', title: 'Evening Relaxation Yoga', details: '18 min • Yoga • Evening', videoId: 'COp7BR_Dvps', colors: ['#059669', '#16A34A'] as [string, string], timeSlot: '🌙 Evening', image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&auto=format&fit=crop' },
                    ];

                    // Pick sessions based on time of day, always show 3
                    let picked: typeof todaysSessions = [];
                    if (hour < 12) {
                        picked = [todaysSessions[0], todaysSessions[1], todaysSessions[2]];
                    } else if (hour < 17) {
                        picked = [todaysSessions[2], todaysSessions[3], todaysSessions[4]];
                    } else {
                        picked = [todaysSessions[4], todaysSessions[5], todaysSessions[0]];
                    }

                    return (
                        <>
                            {/* Inline Video Player */}
                            {playingVideoId && (
                                <View style={styles.videoPlayerContainer}>
                                    <View style={styles.videoPlayerHeader}>
                                        <Text style={styles.videoPlayerTitle}>Now Playing</Text>
                                        <TouchableOpacity onPress={() => setPlayingVideoId(null)}>
                                            <Ionicons name="close-circle" size={24} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.videoWrapper}>
                                        <YoutubeIframe
                                            height={200}
                                            play={true}
                                            videoId={playingVideoId}
                                        />
                                    </View>
                                </View>
                            )}

                            {picked.map((s, i) => (
                                <SessionCard
                                    key={i}
                                    emoji={s.emoji}
                                    title={s.title}
                                    details={s.details}
                                    image={s.image}
                                    timeSlot={s.timeSlot}
                                    gradientColors={s.colors}
                                    onPress={() => setPlayingVideoId(s.videoId)}
                                />
                            ))}
                        </>
                    );
                })()}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const VitalCard = ({ icon, color, value, unit, label }: any) => (
    <View style={styles.vitalCard}>
        <View style={styles.vitalIconContainer}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.vitalRow}>
            <Text style={styles.vitalValue}>{value}</Text>
            <Text style={styles.vitalUnit}> {unit}</Text>
        </View>
        <Text style={styles.vitalLabel}>{label}</Text>
    </View>
);

const SessionCard = ({ title, details, image, emoji, timeSlot, gradientColors, onPress }: any) => (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.sessionImageWrap}>
            <Image source={{ uri: image }} style={styles.sessionImage} />
            <View style={styles.sessionPlayOverlay}>
                <Ionicons name="play" size={14} color="#FFF" style={{ marginLeft: 2 }} />
            </View>
        </View>
        <View style={styles.sessionContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                {timeSlot && <Text style={styles.sessionTimeSlot}>{timeSlot}</Text>}
            </View>
            <Text style={styles.sessionTitle} numberOfLines={1}>{emoji ? `${emoji} ` : ''}{title}</Text>
            <Text style={styles.sessionDetails}>{details}</Text>
        </View>
        {gradientColors ? (
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startButton}>
                <Ionicons name="play" size={12} color="#FFF" />
                <Text style={styles.startButtonText}>Play</Text>
            </LinearGradient>
        ) : (
            <TouchableOpacity style={[styles.startButton, { backgroundColor: '#8B5CF6' }]} onPress={onPress}>
                <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    absoluteGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },

    wellnessCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    scoreTextOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreVal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    scoreMax: {
        fontSize: 10,
        color: '#94A3B8',
    },
    scoreInfo: {
        flex: 1,
    },
    scoreTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    scoreSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 8,
    },
    scoreStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreStatusText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },

    scrollContent: {
        paddingHorizontal: 20,
    },

    alertCard: {
        backgroundColor: '#FEFCE8',
        borderWidth: 1,
        borderColor: '#FEF08A',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    alertIcon: {
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#854D0E',
        marginBottom: 2,
    },
    alertTime: {
        fontSize: 11,
        color: '#A16207',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    seeAll: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '600',
    },

    vitalsScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    vitalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: 140,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    vitalIconContainer: {
        marginBottom: 12,
    },
    vitalRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    vitalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    vitalUnit: {
        fontSize: 10,
        color: '#94A3B8',
        marginLeft: 2,
    },
    vitalLabel: {
        fontSize: 12,
        color: '#64748B',
    },

    stepsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    stepsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepsContent: {
        flex: 1,
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stepsLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    stepsValue: {
        fontSize: 12,
        color: '#64748B',
    },
    stepsCurrent: {
        fontWeight: 'bold',
        color: '#D97706',
    },
    stepsTarget: {
        color: '#94A3B8',
    },
    stepsProgressBg: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    stepsProgressFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
    },

    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sessionImageWrap: {
        width: 64,
        height: 64,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative' as const,
    },
    sessionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover' as const,
    },
    sessionPlayOverlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    sessionContent: {
        flex: 1,
        marginRight: 8,
    },
    sessionTimeSlot: {
        fontSize: 9,
        fontWeight: '700' as const,
        color: '#64748B',
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    sessionTitle: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: '#1E293B',
        marginBottom: 2,
    },
    sessionDetails: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 10,
    },

    // Video Player
    videoPlayerContainer: { marginTop: 16, marginBottom: 8, backgroundColor: '#F8FAFC', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
    videoPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
    videoPlayerTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
    videoWrapper: { width: '100%', height: 200, backgroundColor: '#000' },

    startButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700' as const,
    },
});

export default HealthDashboardScreen;
