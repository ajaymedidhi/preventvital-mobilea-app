import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MyProgramsScreen = () => {
    const navigation = useNavigation<any>();

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

                    <View style={styles.activeCard}>
                        <View style={styles.cardTopRow}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="pulse" size={24} color="#EF4444" />
                            </View>
                            <View style={styles.cardHeaderInfo}>
                                <Text style={styles.programTitle}>Diabetes Management Program</Text>
                                <Text style={styles.programSubtitle}>Day 12 of 30</Text>
                                <View style={styles.remainingBadgeRow}>
                                    <View style={styles.redDot} />
                                    <Text style={styles.remainingText}>2 Sessions remaining today</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarTrack}>
                                <View style={[styles.progressBarFill, { width: '40%' }]} />
                            </View>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.continueButtonContainer}
                                onPress={() => navigation.navigate('ProgramDayView', { programId: '1' })}
                            >
                                <LinearGradient
                                    colors={['#6366f1', '#a855f7']}
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
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Completed</Text>

                    <View style={styles.completedCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                            <Ionicons name="trophy-outline" size={24} color="#22C55E" />
                        </View>
                        <View style={styles.cardHeaderInfo}>
                            <Text style={styles.programTitle}>Hypertension Control Program</Text>
                            <Text style={styles.programSubtitle}>Completed on Dec 1, 2025</Text>
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>Completed</Text>
                            </View>
                        </View>
                    </View>
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
    }
});

export default MyProgramsScreen;
