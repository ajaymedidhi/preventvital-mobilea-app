import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SessionPlayerScreen = () => {
    const navigation = useNavigation<any>();
    const [playbackSpeed, setPlaybackSpeed] = useState('1x');

    const speeds = ['0.75x', '1x', '1.25x', '1.5x'];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Breathing Exercise for Focus</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Player Card */}
                <View style={styles.playerCard}>
                    <View style={styles.videoPlaceholder}>
                        <View style={styles.playButtonOutline}>
                            <Ionicons name="play" size={32} color="#3B82F6" style={{ marginLeft: 4 }} />
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: '45%' }]} />
                            <View style={styles.progressNub} />
                        </View>
                        <Text style={styles.timeText}>3:30</Text>
                    </View>
                </View>

                {/* Live Vitals */}
                <View style={styles.vitalsCard}>
                    <View style={styles.vitalsHeader}>
                        <Text style={styles.vitalsTitle}>Live Vitals</Text>
                        <View style={styles.nowIndicator}>
                            <View style={styles.greenDot} />
                            <Text style={styles.nowText}>Now</Text>
                        </View>
                    </View>

                    <Text style={styles.metricLabel}>HEART RATE</Text>
                    <View style={styles.metricRow}>
                        <Text style={styles.metricValue}>72</Text>
                        <Text style={styles.metricUnit}>bpm</Text>
                    </View>
                </View>

                {/* Playback Speed */}
                <View style={styles.speedCard}>
                    <Text style={styles.speedTitle}>Playback Speed</Text>
                    <View style={styles.speedOptionsRow}>
                        {speeds.map((speed) => (
                            <TouchableOpacity
                                key={speed}
                                style={[
                                    styles.speedButton,
                                    playbackSpeed === speed && styles.speedButtonActive
                                ]}
                                onPress={() => setPlaybackSpeed(speed)}
                            >
                                <Text style={[
                                    styles.speedButtonText,
                                    playbackSpeed === speed && styles.speedButtonTextActive
                                ]}>
                                    {speed}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    playerCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    videoPlaceholder: {
        height: 180,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    playButtonOutline: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#BFDBFE',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    progressContainer: {
        width: '100%',
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    progressNub: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#3B82F6',
        marginLeft: -7, // align center to fill edge
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
    },
    vitalsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#22C55E', // Green border as requested
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    vitalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    vitalsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    nowIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E',
        marginRight: 6,
    },
    nowText: {
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '600',
    },
    metricLabel: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    metricValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#3B82F6', // Blue number
        marginRight: 6,
    },
    metricUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
    },
    speedCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    speedTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
    },
    speedOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    speedButton: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedButtonActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    speedButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    speedButtonTextActive: {
        color: '#3B82F6',
        fontWeight: '700',
    }
});

export default SessionPlayerScreen;
