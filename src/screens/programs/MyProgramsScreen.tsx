import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gradients, Colors } from '../../theme/colors';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const getRecommendation = (score: number): { title: string; desc: string; icon: string } => {
    if (score === 0) return {
        title: 'Complete your assessment first',
        desc: 'Take the 5-min health assessment to get a personalised program recommendation based on your cardiovascular profile.',
        icon: 'clipboard-outline',
    };
    if (score < 40) return {
        title: 'Cardiac Rehabilitation Program',
        desc: `Your CVITAL score of ${score} is in the At Risk range. This program reduces cardiovascular risk through guided exercises and diet changes.`,
        icon: 'heart-outline',
    };
    if (score < 60) return {
        title: 'Hypertension Control Program',
        desc: `Based on your score of ${score}, managing blood pressure is your top priority. 30 days of breathing, diet, and light cardio.`,
        icon: 'pulse-outline',
    };
    if (score < 80) return {
        title: 'Heart Health Boost Program',
        desc: `Your score of ${score} is Good — this program will push you into the Excellent band with targeted cardio and stress-reduction sessions.`,
        icon: 'fitness-outline',
    };
    return {
        title: 'Advanced Cardiovascular Fitness',
        desc: `Excellent score of ${score}! Maintain your momentum with this advanced program focused on longevity and peak heart performance.`,
        icon: 'trophy-outline',
    };
};

const MyProgramsScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const cvitalScore = (user as any)?.healthProfile?.cvitalScore || (user as any)?.profile?.healthScore || 0;
    const rec = getRecommendation(cvitalScore);

    // Active programs come from the API — empty until user enrolls
    const activePrograms: any[] = [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />

            {/* ── Gradient Header ──────────────────────────────── */}
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>My Programs</Text>
                            <Text style={styles.headerSub}>Your enrolled wellness journeys</Text>
                        </View>
                        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Programs')}>
                            <Ionicons name="add" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── Active Programs ──────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{activePrograms.length}</Text>
                        </View>
                    </View>

                    {activePrograms.length === 0 ? (
                        <View style={styles.emptyCard}>
                            {/* Recommendation Banner */}
                            <LinearGradient
                                colors={cvitalScore >= 80 ? ['#059669', '#10B981'] : cvitalScore >= 60 ? ['#2563EB', '#3B82F6'] : cvitalScore >= 40 ? ['#D97706', '#F59E0B'] : cvitalScore > 0 ? ['#DC2626', '#EF4444'] : ['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.recBanner}
                            >
                                <View style={styles.recBannerIcon}>
                                    <Ionicons name={rec.icon as any} size={24} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    {cvitalScore > 0 && (
                                        <Text style={styles.recBannerLabel}>Based on CVITAL score {cvitalScore}</Text>
                                    )}
                                    <Text style={styles.recBannerTitle}>{rec.title}</Text>
                                </View>
                            </LinearGradient>

                            <Text style={styles.emptyDesc}>{rec.desc}</Text>

                            <View style={styles.emptyHint}>
                                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                                <Text style={styles.emptyHintText}>
                                    Enroll in a program to track your daily sessions and progress here.
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => navigation.navigate('Programs')} style={styles.ctaWrap}>
                                <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                                    <Ionicons name="search-outline" size={16} color="#fff" />
                                    <Text style={styles.ctaText}>Browse Programs</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        activePrograms.map((prog) => (
                            <View key={prog.id} style={styles.activeCard}>
                                <View style={styles.cardTopRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                        <Ionicons name="pulse" size={24} color="#EF4444" />
                                    </View>
                                    <View style={styles.cardHeaderInfo}>
                                        <Text style={styles.programTitle}>{prog.title}</Text>
                                        <Text style={styles.programSubtitle}>Day {prog.currentDay} of {prog.totalDays}</Text>
                                        <View style={styles.remainingBadgeRow}>
                                            <View style={styles.redDot} />
                                            <Text style={styles.remainingText}>{prog.remainingSessions} sessions remaining today</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressHead}>
                                        <Text style={styles.progressLabel}>Progress</Text>
                                        <Text style={styles.progressPct}>{prog.progress}%</Text>
                                    </View>
                                    <View style={styles.progressBarTrack}>
                                        <LinearGradient
                                            colors={Gradients.brand}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={[styles.progressBarFill, { width: `${prog.progress}%` as any }]}
                                        />
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.continueWrap}
                                        onPress={() => navigation.navigate('ProgramDayView', { programId: prog.id })}
                                    >
                                        <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.continueBtn}>
                                            <Ionicons name="play" size={14} color="#FFF" />
                                            <Text style={styles.continueBtnText}>Continue</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.progressBtn}>
                                        <Ionicons name="bar-chart-outline" size={14} color={Colors.textSecondary} />
                                        <Text style={styles.progressBtnText}>Progress</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* ── Quick Stats Row ──────────────────────────── */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Enrolled', value: activePrograms.length.toString(), icon: 'ribbon-outline', color: '#6366F1' },
                        { label: 'Completed', value: '0', icon: 'trophy-outline', color: '#10B981' },
                        { label: 'Sessions Done', value: '0', icon: 'checkmark-circle-outline', color: '#3B82F6' },
                    ].map((stat) => (
                        <View key={stat.label} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '18' }]}>
                                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Discover Banner ──────────────────────────── */}
                <TouchableOpacity onPress={() => navigation.navigate('Programs')} activeOpacity={0.88} style={styles.discoverWrap}>
                    <LinearGradient colors={['#0F172A', '#1E293B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.discoverCard}>
                        <View style={styles.discoverLeft}>
                            <Text style={styles.discoverTag}>WELLNESS LIBRARY</Text>
                            <Text style={styles.discoverTitle}>Explore All Programs</Text>
                            <Text style={styles.discoverSub}>Meditation, Yoga, Pranayam & more</Text>
                        </View>
                        <View style={styles.discoverIcon}>
                            <Text style={{ fontSize: 36 }}>🧘</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: { paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 8, gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 12, color: '#C7D2FE', fontWeight: '500', marginTop: 2 },
    browseBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    scrollContent: { padding: 20, paddingBottom: 50 },

    // Section
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    countBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    countBadgeText: { fontSize: 11, fontWeight: '800', color: '#6366F1' },

    // Empty / Recommendation Card
    emptyCard: {
        backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    recBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    recBannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    recBannerLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
    recBannerTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', lineHeight: 18 },
    emptyDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, padding: 16, paddingTop: 14 },
    emptyHint: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 },
    emptyHintText: { flex: 1, fontSize: 11, color: Colors.textMuted, lineHeight: 16 },
    ctaWrap: { margin: 16, marginTop: 0, borderRadius: 14, overflow: 'hidden' },
    cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    ctaText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

    // Active Card
    activeCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    cardTopRow: { flexDirection: 'row', marginBottom: 14 },
    iconContainer: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    cardHeaderInfo: { flex: 1, justifyContent: 'center' },
    programTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
    programSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4 },
    remainingBadgeRow: { flexDirection: 'row', alignItems: 'center' },
    redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
    remainingText: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
    progressSection: { marginBottom: 14 },
    progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    progressPct: { fontSize: 11, fontWeight: '800', color: Colors.gradientStart },
    progressBarTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    actionRow: { flexDirection: 'row', gap: 10 },
    continueWrap: { flex: 1, borderRadius: 10, overflow: 'hidden' },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
    continueBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    progressBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    progressBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },

    // Stats Row
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textAlign: 'center' },

    // Discover Banner
    discoverWrap: { borderRadius: 20, overflow: 'hidden' },
    discoverCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
    discoverLeft: { flex: 1 },
    discoverTag: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
    discoverTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    discoverSub: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    discoverIcon: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
});

export default MyProgramsScreen;
