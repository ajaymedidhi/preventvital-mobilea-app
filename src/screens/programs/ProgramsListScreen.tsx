import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    FlatList, Dimensions, StatusBar, ActivityIndicator, Linking, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

// ── Recommended Demo Programs with YouTube Videos ──────────────────
const RECOMMENDED_PROGRAMS = [
    {
        id: 'rp-1', title: 'Guided Meditation', category: 'Mindfulness', emoji: '🧘',
        colors: ['#7C3AED', '#6366F1'] as [string, string],
        description: 'Calm your mind with guided meditation for stress relief and clarity.',
        duration: '4 weeks', difficulty: 'Beginner',
        sessions: [
            { title: '10-Min Morning Meditation', duration: '10 min', videoId: 'inpok4MKVLM' },
            { title: 'Deep Sleep Meditation', duration: '20 min', videoId: 'aEqlQvczMJQ' },
            { title: 'Stress Relief Body Scan', duration: '15 min', videoId: 'MIr3RsUWrdo' },
        ]
    },
    {
        id: 'rp-2', title: 'Pranayam Breathing', category: 'Breathing', emoji: '🌬️',
        colors: ['#0D9488', '#06B6D4'] as [string, string],
        description: 'Ancient breathing techniques to boost oxygen and reduce anxiety.',
        duration: '3 weeks', difficulty: 'Beginner',
        sessions: [
            { title: 'Anulom Vilom for Beginners', duration: '12 min', videoId: '8VwufJrUhic' },
            { title: 'Kapalbhati Pranayam', duration: '10 min', videoId: 'DcUjhJTmHbg' },
            { title: 'Bhramari (Bee Breath)', duration: '8 min', videoId: 'hJD0uFnylQo' },
        ]
    },
    {
        id: 'rp-3', title: 'Morning Exercise', category: 'Fitness', emoji: '💪',
        colors: ['#EA580C', '#DC2626'] as [string, string],
        description: 'Energizing workouts for cardiovascular health and strength.',
        duration: '6 weeks', difficulty: 'Intermediate',
        sessions: [
            { title: '15-Min Full Body Workout', duration: '15 min', videoId: 'UBMk30rjy0o' },
            { title: 'Cardio HIIT for Heart Health', duration: '20 min', videoId: 'ml6cT4AZdqI' },
            { title: 'Core Strength for Beginners', duration: '12 min', videoId: 'AnYl6Nmu9Qo' },
        ]
    },
    {
        id: 'rp-4', title: 'Yoga for Health', category: 'Yoga', emoji: '🧎',
        colors: ['#059669', '#16A34A'] as [string, string],
        description: 'Holistic yoga combining asanas with breathing for flexibility and peace.',
        duration: '8 weeks', difficulty: 'All Levels',
        sessions: [
            { title: 'Sun Salutation (Surya Namaskar)', duration: '15 min', videoId: 'klmBssEYkdU' },
            { title: 'Yoga for Back Pain Relief', duration: '20 min', videoId: 'XeXz8fIZDCE' },
            { title: 'Evening Relaxation Yoga', duration: '18 min', videoId: 'COp7BR_Dvps' },
        ]
    },
];

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
    free: { bg: '#F3F4F6', text: '#6B7280' },
    silver: { bg: '#DBEAFE', text: '#2563EB' },
    gold: { bg: '#FEF3C7', text: '#D97706' },
    platinum: { bg: '#EDE9FE', text: '#7C3AED' },
};

const CAT_EMOJI: Record<string, string> = {
    hypertension: '🫀', diabetes: '🩸', cardiac: '❤️', stress: '🧠', sleep: '😴',
    fitness: '💪', nutrition: '🥗', metabolic: '🔬', cardiovascular: '🫁',
    respiratory: '🌬️', mental: '🧘', musculoskeletal: '🦴', preventive: '🛡️',
};

const ProgramsListScreen = () => {
    const navigation = useNavigation<any>();
    const { subscription, currentPlan } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [expandedRec, setExpandedRec] = useState<string | null>(null);

    const userPlan = currentPlan;
    const planHierarchy = ['free', 'silver', 'gold', 'platinum'];
    const userPlanRank = planHierarchy.indexOf(userPlan);

    // API state
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    const fetchPrograms = useCallback(async () => {
        try {
            const res = await client.get('/api/programs?limit=50');
            setPrograms(res.data?.data?.programs || []);
        } catch (err) {
            console.error('Failed to fetch programs', err);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

    const onRefresh = () => { setRefreshing(true); fetchPrograms(); };

    const handleEnroll = async (programId: string) => {
        setEnrollingId(programId);
        try {
            await client.post(`/api/programs/${programId}/enroll`);
            await fetchPrograms();
        } catch (err: any) {
            Alert.alert('Enrollment Failed', err.response?.data?.message || 'Something went wrong');
        }
        setEnrollingId(null);
    };

    const openYouTube = (videoId: string) => {
        Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
    };

    // Filters
    const categories = ['All', ...Array.from(new Set(programs.map(p => p.category).filter(Boolean)))];
    const filteredPrograms = programs.filter(p => {
        if (searchQuery && !p.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedTag !== 'All' && p.category !== selectedTag) return false;
        return true;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
            >
                {/* ── Header ──────────────────────────────────────── */}
                <LinearGradient colors={['#6366F1', '#8B5CF6', '#F5F3FF']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} locations={[0, 0.55, 1]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Wellness Programs</Text>
                            <Text style={styles.headerSub}>Curated for your health journey</Text>
                        </View>

                        {/* Search */}
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={18} color="#A5B4FC" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search programs..."
                                placeholderTextColor="#A5B4FC"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Category Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                            {categories.map((cat) => (
                                <TouchableOpacity key={cat} onPress={() => setSelectedTag(cat)}
                                    style={[styles.filterChip, selectedTag === cat && styles.filterChipActive]}>
                                    <Text style={[styles.filterChipText, selectedTag === cat && styles.filterChipTextActive]}>
                                        {cat === 'All' ? '🏷️ All' : `${CAT_EMOJI[cat] || '📋'} ${cat}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </SafeAreaView>
                </LinearGradient>

                {/* ── Recommended Programs ─────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🌟 Recommended For You</Text>
                        <Text style={styles.sectionSub}>Free wellness sessions to get started</Text>
                    </View>

                    <FlatList
                        data={RECOMMENDED_PROGRAMS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        snapToInterval={width * 0.72 + 16}
                        decelerationRate="fast"
                        keyExtractor={item => item.id}
                        renderItem={({ item: prog }) => (
                            <View style={{ width: width * 0.72, marginRight: 16 }}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('ProgramDetails', {
                                        programId: prog.id,
                                        program: {
                                            _id: prog.id,
                                            title: prog.title,
                                            category: prog.category,
                                            description: prog.description,
                                            difficulty: prog.difficulty,
                                            durationWeeks: parseInt(prog.duration) || 4,
                                            totalSessions: prog.sessions.length,
                                            accessiblePlans: ['free'],
                                            enrollmentRequired: false,
                                            enrollmentCount: 0,
                                            locked: false,
                                            isRecommended: true,
                                            emoji: prog.emoji,
                                            gradientColors: prog.colors,
                                            youtubeSessions: prog.sessions,
                                        }
                                    })}
                                >
                                    <LinearGradient colors={prog.colors} style={styles.recCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <View style={styles.recCardInner}>
                                            <Text style={styles.recEmoji}>{prog.emoji}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.recTitle}>{prog.title}</Text>
                                                <Text style={styles.recCat}>{prog.category}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.recDesc} numberOfLines={2}>{prog.description}</Text>
                                        <View style={styles.recMeta}>
                                            <View style={styles.recBadge}><Text style={styles.recBadgeText}>{prog.difficulty}</Text></View>
                                            <View style={styles.recBadge}><Text style={styles.recBadgeText}>⏱ {prog.duration}</Text></View>
                                            <View style={styles.recBadge}><Text style={styles.recBadgeText}>{prog.sessions.length} Sessions</Text></View>
                                        </View>
                                        <View style={styles.recFooter}>
                                            <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>🆓 Free</Text></View>
                                            <Text style={styles.viewSessions}>
                                                View Details ▸
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>

                {/* ── All Programs from API ────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📋 All Programs</Text>
                        <Text style={styles.sectionSub}>Based on your subscription plan</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 40 }} />
                    ) : filteredPrograms.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>📭</Text>
                            <Text style={styles.emptyText}>No programs found</Text>
                        </View>
                    ) : (
                        <View style={{ paddingHorizontal: 20 }}>
                            {filteredPrograms.map((program) => {
                                const reqPlan = program.requiredPlan?.toLowerCase() || 'free';
                                const reqPlanRank = planHierarchy.indexOf(reqPlan);
                                const emoji = CAT_EMOJI[program.category] || '📋';
                                // Robust access check: 
                                // 1. Use backend 'locked' flag if present
                                // 2. Otherwise check if currentPlan is in accessiblePlans
                                // 3. Fallback to rank comparison
                                const isLocked = program.locked !== undefined 
                                    ? program.locked 
                                    : (program.accessiblePlans && program.accessiblePlans.length > 0)
                                        ? !program.accessiblePlans.map((p: string) => p.toLowerCase()).includes(currentPlan.toLowerCase())
                                        : userPlanRank < reqPlanRank;

                                return (
                                    <TouchableOpacity
                                        key={program._id}
                                        style={[styles.programCard, isLocked && styles.programCardLocked]}
                                        onPress={() => navigation.navigate('ProgramDetails', { programId: program._id, program })}
                                        activeOpacity={0.85}
                                    >
                                        {/* Lock Badge */}
                                        {isLocked && (
                                            <View style={styles.lockBadge}>
                                                <Ionicons name="lock-closed" size={10} color="#FFF" />
                                                <Text style={styles.lockBadgeText}>{reqPlan?.charAt(0).toUpperCase() + reqPlan?.slice(1)}+</Text>
                                            </View>
                                        )}

                                        {/* Left Emoji Area */}
                                        <View style={[styles.programEmoji, isLocked && { opacity: 0.4 }]}>
                                            <Text style={{ fontSize: 32 }}>{emoji}</Text>
                                        </View>

                                        {/* Info */}
                                        <View style={styles.programInfo}>
                                            <Text style={styles.programTitle} numberOfLines={1}>{program.title}</Text>
                                            <Text style={styles.programDesc} numberOfLines={1}>{program.description}</Text>

                                            <View style={styles.programStatsRow}>
                                                <View style={styles.statChip}>
                                                    <Ionicons name="time-outline" size={10} color="#64748B" />
                                                    <Text style={styles.statChipText}>{program.durationWeeks}w</Text>
                                                </View>
                                                <View style={styles.statChip}>
                                                    <Ionicons name="book-outline" size={10} color="#64748B" />
                                                    <Text style={styles.statChipText}>{program.totalSessions}s</Text>
                                                </View>
                                                {(program.averageRating || 0) > 0 && (
                                                    <View style={styles.statChip}>
                                                        <Ionicons name="star" size={10} color="#EAB308" />
                                                        <Text style={styles.statChipText}>{program.averageRating?.toFixed(1)}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Plan badges */}
                                            <View style={styles.planBadges}>
                                                {(program.accessiblePlans || []).slice(0, 3).map((plan: string) => (
                                                    <View key={plan} style={[styles.planBadge, { backgroundColor: PLAN_BADGE[plan]?.bg || '#F3F4F6' }]}>
                                                        <Text style={[styles.planBadgeText, { color: PLAN_BADGE[plan]?.text || '#6B7280' }]}>{plan}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Action */}
                                        <View style={styles.programAction}>
                                            {isLocked ? (
                                                <View style={styles.upgradeBtnSmall}>
                                                    <Ionicons name="arrow-up-circle" size={18} color="#D97706" />
                                                </View>
                                            ) : program.enrollmentRequired && program.enrollmentStatus === 'not_enrolled' ? (
                                                <TouchableOpacity
                                                    style={styles.enrollBtn}
                                                    onPress={() => handleEnroll(program._id)}
                                                    disabled={enrollingId === program._id}
                                                >
                                                    {enrollingId === program._id ? (
                                                        <ActivityIndicator size="small" color="#7C3AED" />
                                                    ) : (
                                                        <Text style={styles.enrollBtnText}>Enroll</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },

    // ── Header ──
    header: { paddingBottom: 24 },
    headerContent: { paddingHorizontal: 20, marginTop: 12, marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginTop: 4 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, height: 48, marginBottom: 16 },
    searchInput: { flex: 1, fontSize: 14, color: '#FFF', fontWeight: '500', marginLeft: 8 },
    filterRow: { paddingHorizontal: 20, paddingBottom: 4 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 10 },
    filterChipActive: { backgroundColor: '#FFF' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#E0E7FF' },
    filterChipTextActive: { color: '#6366F1' },

    // ── Section ──
    section: { marginTop: 20 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    sectionSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

    // ── Recommended Cards ──
    recCard: { borderRadius: 20, padding: 18, minHeight: 170 },
    recCardInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    recEmoji: { fontSize: 36, marginRight: 12 },
    recTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
    recCat: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
    recDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginBottom: 12 },
    recMeta: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    recBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    recBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
    recFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    freeBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    freeBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
    viewSessions: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

    // ── Expanded Sessions ──
    sessionsExpanded: { marginTop: 10, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
    sessionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    sessionNum: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    sessionRowTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    sessionRowDur: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

    // ── API Program Cards ──
    programCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
    programCardLocked: { opacity: 0.7, borderColor: '#E5E7EB' },
    lockBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 3, zIndex: 2 },
    lockBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
    programEmoji: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    programInfo: { flex: 1, justifyContent: 'center' },
    programTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    programDesc: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
    programStatsRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    statChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statChipText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
    planBadges: { flexDirection: 'row', gap: 4 },
    planBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    planBadgeText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
    programAction: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
    upgradeBtnSmall: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
    enrollBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#7C3AED' },
    enrollBtnText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },

    // ── Empty ──
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyEmoji: { fontSize: 40, marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
});

export default ProgramsListScreen;
