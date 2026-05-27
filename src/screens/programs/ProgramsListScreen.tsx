import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    FlatList, Dimensions, StatusBar, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Gradients, Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ── Recommended Wellness Programs ──────────────────────────────────────────────
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
    premium: { bg: '#DBEAFE', text: '#2563EB' },
    pro: { bg: '#FEF3C7', text: '#D97706' },
    family: { bg: '#EDE9FE', text: '#7C3AED' },
};

const CAT_EMOJI: Record<string, string> = {
    hypertension: '🫀', diabetes: '🩸', cardiac: '❤️', stress: '🧠', sleep: '😴',
    fitness: '💪', nutrition: '🥗', metabolic: '🔬', cardiovascular: '🫁',
    respiratory: '🌬️', mental: '🧘', musculoskeletal: '🦴', preventive: '🛡️',
};

const DIFFICULTY_COLOR: Record<string, string> = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
    'All Levels': '#6366F1',
};

const ProgramsListScreen = () => {
    const navigation = useNavigation<any>();
    const { currentPlan } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');

    const userPlan = currentPlan;
    const planHierarchy = ['free', 'premium', 'pro', 'family'];
    const userPlanRank = planHierarchy.indexOf(userPlan);

    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    const fetchPrograms = useCallback(async () => {
        try {
            const res = await client.get('/api/programs?limit=50');
            setPrograms(res.data?.data?.programs || []);
        } catch {
            // will show empty state
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

    const categories = ['All', ...Array.from(new Set(programs.map(p => p.category).filter(Boolean)))];
    const filteredPrograms = programs.filter(p => {
        if (searchQuery && !p.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedTag !== 'All' && p.category !== selectedTag) return false;
        return true;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gradientStart} />}
            >
                {/* ── Gradient Header ──────────────────────────────── */}
                <LinearGradient colors={Gradients.brandFade} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} locations={[0, 0.55, 1]}>
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
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            )}
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

                {/* ── Recommended Programs ──────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Recommended For You</Text>
                            <Text style={styles.sectionSub}>Free wellness programs to get started</Text>
                        </View>
                        <View style={styles.freePill}>
                            <Text style={styles.freePillText}>FREE</Text>
                        </View>
                    </View>

                    <FlatList
                        data={RECOMMENDED_PROGRAMS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        snapToInterval={width * 0.72 + 14}
                        decelerationRate="fast"
                        keyExtractor={item => item.id}
                        renderItem={({ item: prog }) => (
                            <TouchableOpacity
                                style={{ width: width * 0.72, marginRight: 14 }}
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
                                    {/* Top row */}
                                    <View style={styles.recCardTop}>
                                        <View style={styles.recEmojiWrap}>
                                            <Text style={styles.recEmoji}>{prog.emoji}</Text>
                                        </View>
                                        <View style={styles.recFreeTag}>
                                            <Text style={styles.recFreeTagText}>Free</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.recTitle}>{prog.title}</Text>
                                    <Text style={styles.recCat}>{prog.category.toUpperCase()}</Text>
                                    <Text style={styles.recDesc} numberOfLines={2}>{prog.description}</Text>

                                    <View style={styles.recDivider} />

                                    <View style={styles.recFooter}>
                                        <View style={styles.recMetaItem}>
                                            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                                            <Text style={styles.recMetaText}>{prog.duration}</Text>
                                        </View>
                                        <View style={styles.recMetaItem}>
                                            <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.7)" />
                                            <Text style={styles.recMetaText}>{prog.sessions.length} sessions</Text>
                                        </View>
                                        <View style={styles.recArrow}>
                                            <Ionicons name="arrow-forward" size={14} color="#FFF" />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* ── All Programs from API ──────────────────────────── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>All Programs</Text>
                            <Text style={styles.sectionSub}>Based on your subscription plan</Text>
                        </View>
                        {!loading && filteredPrograms.length > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{filteredPrograms.length}</Text>
                            </View>
                        )}
                    </View>

                    {loading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={Colors.gradientStart} />
                            <Text style={styles.loadingText}>Loading programs…</Text>
                        </View>
                    ) : filteredPrograms.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconWrap}>
                                <Text style={styles.emptyEmoji}>📭</Text>
                            </View>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No programs match your search' : 'No programs available'}
                            </Text>
                            <Text style={styles.emptySub}>
                                {searchQuery ? 'Try a different keyword or clear the search' : 'Check back soon — more programs are on the way'}
                            </Text>
                            {searchQuery ? (
                                <TouchableOpacity style={styles.emptyBtn} onPress={() => setSearchQuery('')}>
                                    <Text style={styles.emptyBtnText}>Clear Search</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : (
                        <View style={{ paddingHorizontal: 20 }}>
                            {filteredPrograms.map((program) => {
                                const reqPlan = program.requiredPlan?.toLowerCase() || 'free';
                                const reqPlanRank = planHierarchy.indexOf(reqPlan);
                                const emoji = CAT_EMOJI[program.category] || '📋';
                                const isLocked = program.locked !== undefined
                                    ? program.locked
                                    : (program.accessiblePlans && program.accessiblePlans.length > 0)
                                        ? !program.accessiblePlans.map((p: string) => p.toLowerCase()).includes(currentPlan.toLowerCase())
                                        : userPlanRank < reqPlanRank;
                                const diffColor = DIFFICULTY_COLOR[program.difficulty] || '#6366F1';

                                return (
                                    <TouchableOpacity
                                        key={program._id}
                                        style={styles.programCard}
                                        onPress={() => navigation.navigate('ProgramDetails', { programId: program._id, program })}
                                        activeOpacity={0.85}
                                    >
                                        {/* Left colored accent + emoji/image */}
                                        <View style={[styles.programThumbWrap, isLocked && { opacity: 0.5 }]}>
                                            {program.image && program.image !== 'https://placehold.co/600x400' ? (
                                                <Image
                                                    source={{ uri: program.image }}
                                                    style={styles.programThumb}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <Text style={{ fontSize: 28 }}>{emoji}</Text>
                                            )}
                                        </View>

                                        {/* Info */}
                                        <View style={styles.programInfo}>
                                            <View style={styles.programTitleRow}>
                                                <Text style={[styles.programTitle, isLocked && { color: '#94A3B8' }]} numberOfLines={1}>
                                                    {program.title}
                                                </Text>
                                                {isLocked && (
                                                    <View style={styles.lockBadge}>
                                                        <Ionicons name="lock-closed" size={9} color="#FFF" />
                                                        <Text style={styles.lockBadgeText}>{reqPlan}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.programDesc} numberOfLines={1}>{program.description}</Text>

                                            <View style={styles.programMetaRow}>
                                                <View style={styles.metaChip}>
                                                    <Ionicons name="time-outline" size={10} color={Colors.textSecondary} />
                                                    <Text style={styles.metaChipText}>{program.durationWeeks}w</Text>
                                                </View>
                                                <View style={styles.metaChip}>
                                                    <Ionicons name="book-outline" size={10} color={Colors.textSecondary} />
                                                    <Text style={styles.metaChipText}>{program.totalSessions} sessions</Text>
                                                </View>
                                                {program.difficulty && (
                                                    <View style={[styles.diffChip, { backgroundColor: diffColor + '18' }]}>
                                                        <Text style={[styles.diffChipText, { color: diffColor }]}>{program.difficulty}</Text>
                                                    </View>
                                                )}
                                                {(program.averageRating || 0) > 0 && (
                                                    <View style={styles.ratingChip}>
                                                        <Ionicons name="star" size={10} color="#EAB308" />
                                                        <Text style={styles.ratingText}>{program.averageRating?.toFixed(1)}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Plan badges */}
                                            {(program.accessiblePlans || []).length > 0 && (
                                                <View style={styles.planBadges}>
                                                    {(program.accessiblePlans as string[]).slice(0, 3).map((plan) => (
                                                        <View key={plan} style={[styles.planBadge, { backgroundColor: PLAN_BADGE[plan]?.bg || '#F3F4F6' }]}>
                                                            <Text style={[styles.planBadgeText, { color: PLAN_BADGE[plan]?.text || '#6B7280' }]}>{plan}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>

                                        {/* Right Action */}
                                        <View style={styles.programAction}>
                                            {isLocked ? (
                                                <View style={styles.upgradeBtnSmall}>
                                                    <Ionicons name="arrow-up-circle" size={20} color="#D97706" />
                                                </View>
                                            ) : program.enrollmentRequired && program.enrollmentStatus === 'not_enrolled' ? (
                                                <TouchableOpacity
                                                    style={styles.enrollBtn}
                                                    onPress={() => handleEnroll(program._id)}
                                                    disabled={enrollingId === program._id}
                                                >
                                                    {enrollingId === program._id ? (
                                                        <ActivityIndicator size="small" color={Colors.gradientStart} />
                                                    ) : (
                                                        <Text style={styles.enrollBtnText}>Enroll</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={styles.chevronWrap}>
                                                    <Ionicons name="chevron-forward" size={16} color={Colors.gradientStart} />
                                                </View>
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
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: { paddingBottom: 20 },
    headerContent: { paddingHorizontal: 20, marginTop: 10, marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginTop: 4 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        marginHorizontal: 20, borderRadius: 14,
        paddingHorizontal: 14, height: 46, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    searchInput: { flex: 1, fontSize: 14, color: '#FFF', fontWeight: '500', marginLeft: 8 },
    filterRow: { paddingHorizontal: 20, paddingBottom: 2 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
    filterChipActive: { backgroundColor: '#FFF' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#E0E7FF' },
    filterChipTextActive: { color: Colors.gradientStart },

    // Section
    section: { marginTop: 22 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
    sectionSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
    freePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    freePillText: { fontSize: 10, fontWeight: '800', color: '#16A34A', letterSpacing: 0.5 },
    countBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    countBadgeText: { fontSize: 11, fontWeight: '800', color: '#6366F1' },

    // Recommended Cards
    recCard: { borderRadius: 22, padding: 18, minHeight: 190 },
    recCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    recEmojiWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    recEmoji: { fontSize: 26 },
    recFreeTag: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    recFreeTagText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
    recTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 2 },
    recCat: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2, marginBottom: 8 },
    recDesc: { fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 17 },
    recDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12 },
    recFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    recMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    recMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
    recArrow: { marginLeft: 'auto' as any, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    // Loading / Empty
    loadingWrap: { alignItems: 'center', paddingVertical: 50, gap: 12 },
    loadingText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
    emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyEmoji: { fontSize: 36 },
    emptyText: { fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 19 },
    emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12, backgroundColor: Colors.gradientStart },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    // API Program Cards
    programCard: {
        flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 18,
        padding: 14, marginBottom: 12, alignItems: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    programThumbWrap: {
        width: 60, height: 60, borderRadius: 16,
        backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
        marginRight: 14, overflow: 'hidden',
    },
    programThumb: { width: 60, height: 60, borderRadius: 16 },
    programInfo: { flex: 1 },
    programTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    programTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },
    programDesc: { fontSize: 11, color: '#94A3B8', marginBottom: 8 },
    programMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    metaChipText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
    diffChip: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    diffChipText: { fontSize: 10, fontWeight: '700' },
    ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    ratingText: { fontSize: 10, color: '#D97706', fontWeight: '700' },
    lockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 3 },
    lockBadgeText: { fontSize: 8, fontWeight: '700', color: '#FFF', textTransform: 'capitalize' },
    planBadges: { flexDirection: 'row', gap: 4 },
    planBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    planBadgeText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
    programAction: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
    chevronWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    upgradeBtnSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
    enrollBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.gradientStart },
    enrollBtnText: { fontSize: 11, fontWeight: '700', color: Colors.gradientStart },
});

export default ProgramsListScreen;
