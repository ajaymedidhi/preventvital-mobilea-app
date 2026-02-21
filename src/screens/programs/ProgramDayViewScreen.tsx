import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const ProgramDayViewScreen = () => {
    const navigation = useNavigation<any>();

    const sessions = [
        {
            id: '1',
            title: 'Morning Yoga for Glucose Control',
            category: 'Yoga',
            duration: '20min',
            status: 'Completed',
            icon: 'pulse',
            iconColor: '#22C55E',
            iconBg: '#DCFCE7'
        },
        {
            id: '2',
            title: 'Breathing Exercise for Focus',
            category: 'Breathing',
            duration: '20min',
            status: 'Start',
            icon: 'aperture-outline',
            iconColor: '#3B82F6',
            iconBg: '#DBEAFE'
        },
        {
            id: '3',
            title: 'Evening Meditation for Stress',
            category: 'Meditation',
            duration: '15min',
            status: 'Start',
            icon: 'heart',
            iconColor: '#3B82F6',
            iconBg: '#DBEAFE'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Diabetes Program- Day 12</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.progressCard}>
                    <View style={styles.circularProgressContainer}>
                        <View style={styles.circularProgressRing}>
                            <View style={styles.circularProgressInner}>
                                <Text style={styles.circularProgressText}>40%</Text>
                                <Text style={styles.circularProgressSubtext}>Completed</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.progressDetailText}>Day 12 of 30 . 18 sessions done</Text>
                </View>

                <View style={styles.tipCard}>
                    <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
                    <Text style={styles.tipText}>
                        Tip : Check your blood glucose 1-2 hours after yoga best results
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Today's Sessions</Text>

                <View style={styles.sessionList}>
                    {sessions.map((session) => (
                        <View key={session.id} style={styles.sessionCard}>
                            <View style={[styles.sessionIconContainer, { backgroundColor: session.iconBg }]}>
                                <Ionicons name={session.icon as any} size={24} color={session.iconColor} />
                            </View>

                            <View style={styles.sessionContent}>
                                <Text style={styles.sessionTitle}>{session.title}</Text>
                                <View style={styles.sessionTagsRow}>
                                    <View style={styles.tagBadge}>
                                        <Text style={styles.tagText}>{session.category}</Text>
                                    </View>
                                    <Text style={styles.durationText}>{session.duration}</Text>
                                </View>

                                <View style={styles.statusRow}>
                                    {session.status === 'Completed' ? (
                                        <View style={styles.completedBadgeCenter}>
                                            <Text style={styles.completedBadgeCenterText}>Completed</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.startButtonContainer}
                                            onPress={() => navigation.navigate('SessionPlayer', { sessionId: session.id })}
                                        >
                                            <LinearGradient
                                                colors={['#6366f1', '#a855f7']}
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                style={styles.startButtonGradient}
                                            >
                                                <Text style={styles.startButtonText}>Start</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

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
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    progressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 16,
    },
    circularProgressContainer: {
        marginRight: 20,
    },
    circularProgressRing: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: '#E0E7FF',
        borderLeftColor: '#4F46E5', // Faking a 40% fill
        borderTopColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-45deg' }], // Rotate to start from top
    },
    circularProgressInner: {
        transform: [{ rotate: '45deg' }], // Counter rotate inner content
        alignItems: 'center',
    },
    circularProgressText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    circularProgressSubtext: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },
    progressDetailText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    tipCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    tipText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    sessionList: {},
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    sessionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sessionContent: {
        flex: 1,
        justifyContent: 'center',
    },
    sessionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 8,
    },
    sessionTagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    tagText: {
        fontSize: 10,
        color: '#0284C7',
        fontWeight: '600',
    },
    durationText: {
        fontSize: 12,
        color: '#64748b',
    },
    statusRow: {
        alignItems: 'flex-start',
    },
    startButtonContainer: {
        width: 80,
    },
    startButtonGradient: {
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    completedBadgeCenter: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    completedBadgeCenterText: {
        color: '#16a34a',
        fontSize: 10,
        fontWeight: '600',
    }
});

export default ProgramDayViewScreen;
