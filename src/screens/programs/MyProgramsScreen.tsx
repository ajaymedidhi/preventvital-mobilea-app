import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '../../theme/colors';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const getRecommendation = (score: number): { title: string; desc: string } => {
    if (score === 0) return {
        title: 'Complete your assessment first',
        desc: 'Take the 5-min health assessment to get a personalised program recommendation based on your cardiovascular profile.',
    };
    if (score < 40) return {
        title: 'Cardiac Rehabilitation Program',
        desc: `Your CVITAL score of ${score} is in the At Risk range. This program is designed to help reduce cardiovascular risk through guided exercises and diet changes.`,
    };
    if (score < 60) return {
        title: 'Hypertension Control Program',
        desc: `Based on your score of ${score}, managing blood pressure is your top priority. This 30-day program combines breathing, diet, and light cardio.`,
    };
    if (score < 80) return {
        title: 'Heart Health Boost Program',
        desc: `Your score of ${score} is Good — this program will help push you into the Excellent band with targeted cardio and stress-reduction sessions.`,
    };
    return {
        title: 'Advanced Cardiovascular Fitness',
        desc: `Excellent score of ${score}! Maintain your momentum with this advanced program focused on longevity and peak heart performance.`,
    };
};

const MyProgramsScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const cvitalScore = (user as any)?.healthProfile?.cvitalScore || (user as any)?.profile?.healthScore || 0;
    const rec = getRecommendation(cvitalScore);

    // Active programs would come from the API; empty array until user enrolls
    const activePrograms: any[] = [];

    const completedPrograms = [
        { id: '1', title: 'Hypertension Control Program', completedOn: 'Dec 1, 2025' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Programs</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="share-social-outline" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active</Text>

                    {activePrograms.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="ribbon-outline" size={32} color="#6366F1" />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {cvitalScore > 0
                                    ? `Based on your CVITAL score of ${cvitalScore}, we recommend:`
                                    : 'No active programs yet'}
                            </Text>
                            <Text style={styles.emptyRecTitle}>{rec.title}</Text>
                            <Text style={styles.emptyDesc}>{rec.desc}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Programs')}
                                style={styles.emptyCtaWrap}
                            >
                                <LinearGradient
                                    colors={Gradients.brand}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.emptyCta}
                                >
                                    <Ionicons name="search-outline" size={16} color="#fff" />
                                    <Text style={styles.emptyCtaText}>Browse Programs</Text>
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
                                            <Text style={styles.remainingText}>{prog.remainingSessions} Sessions remaining today</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBarTrack}>
                                        <View style={[styles.progressBarFill, { width: `${prog.progress}%` }]} />
                                    </View>
                                </View>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.continueButtonContainer}
                                        onPress={() => navigation.navigate('ProgramDayView', { programId: prog.id })}
                                    >
                                        <LinearGradient
                                            colors={Gradients.brand}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.continueButtonBackground}
                                        >
                                            <Text style={styles.continueButtonText}>Continue</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.progressButtonContainer}>
                                        <Text style={styles.progressButtonText}>Progress</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {completedPrograms.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Completed</Text>
                        {completedPrograms.map((prog) => (
                            <View key={prog.id} style={styles.completedCard}>
                                <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="trophy-outline" size={24} color="#22C55E" />
                                </View>
                                <View style={styles.cardHeaderInfo}>
                                    <Text style={styles.programTitle}>{prog.title}</Text>
                                    <Text style={styles.programSubtitle}>Completed on {prog.completedOn}</Text>
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedBadgeText}>Completed</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    activeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardHeaderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    programTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    programSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 4,
        fontWeight: '500'
    },
    remainingBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    redDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
        marginRight: 6,
    },
    remainingText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#22c55e', // Green progress bar matching mockup
        borderRadius: 3,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    continueButtonContainer: {
        flex: 1,
        marginRight: 10,
    },
    continueButtonBackground: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    progressButtonContainer: {
        flex: 1,
        marginLeft: 10,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressButtonText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 14,
    },
    completedCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    completedBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    completedBadgeText: {
        color: '#16a34a',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEF2FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyRecTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyDesc: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    emptyCtaWrap: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    emptyCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    emptyCtaText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default MyProgramsScreen;
