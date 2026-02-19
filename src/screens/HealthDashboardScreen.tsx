import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';

import { getVitals, syncVitals } from '../api/vitalsSync';
import { NormalizedHealthData } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const { width } = Dimensions.get('window');

const HealthDashboardScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const [data, setData] = useState<NormalizedHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const vitals = await getVitals();
        setData(vitals);
        setLoading(false);
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

    // Mock scores
    const wellnessScore = 85;
    const scoreProgress = wellnessScore / 100;
    const circleCircumference = 2 * Math.PI * 35; // Smaller circle
    const strokeDashoffset = circleCircumference * (1 - scoreProgress);

    return (
        <View style={styles.container}>
            {/* Header Gradient Background */}
            <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.headerGradient, { paddingTop: insets.top, height: 260 }]}
            >
                {/* Header Top Bar */}
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Good Morning</Text>
                        <Text style={styles.userName}>Rakesh Sharma</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={24} color="#6366F1" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Image
                                source={{ uri: 'https://ui-avatars.com/api/?name=Rakesh+S&background=F3F4F6&color=333' }}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Wellness Score Card - Overlapping Header */}
                <TouchableOpacity
                    style={styles.wellnessCard}
                    onPress={() => navigation.navigate('WellnessScore')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scoreCircle}>
                        <Svg height="80" width="80" viewBox="0 0 80 80">
                            <G rotation="-90" origin="40, 40">
                                <Circle cx="40" cy="40" r="35" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                                <Circle
                                    cx="40" cy="40" r="35"
                                    stroke="#2563EB" strokeWidth="8" fill="transparent"
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
                        <Text style={styles.scoreTitle}>Excellent Your Wellness Score</Text>
                        <Text style={styles.scoreSubtitle}>Based on vitals and activity</Text>
                        <View style={styles.scoreStatus}>
                            <Ionicons name="heart" size={14} color="#EF4444" />
                            <Text style={styles.scoreStatusText}>Healthy</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: -140 }} // Pull up content to overlap
            >
                <View style={{ height: 150 }} />

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
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitalsScroll}>
                    <VitalCard
                        icon="heart-outline" color="#2563EB"
                        value={data?.hr ? Math.round(data.hr.avg).toString() : '72'}
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
                                <Text style={styles.stepsCurrent}>{data?.s.toLocaleString() || '3,450'}</Text>
                                <Text style={styles.stepsTarget}> / 10,000</Text>
                            </Text>
                        </View>
                        <View style={styles.stepsProgressBg}>
                            <View style={[styles.stepsProgressFill, { width: '35%' }]} />
                        </View>
                    </View>
                </View>

                {/* Sessions Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Today's Sessions</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <SessionCard
                    title="Morning Yoga for Glucose Control"
                    details="20 min • Yoga • morning"
                    image="https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&q=80"
                />
                <SessionCard
                    title="Breathing Exercise for Stress"
                    details="10 min • Breathing • afternoon"
                    image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80"
                />
                <SessionCard
                    title="Weight Management"
                    details="10 min • Exercise • morning"
                    image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80"
                />

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

const SessionCard = ({ title, details, image }: any) => (
    <View style={styles.sessionCard}>
        <Image source={{ uri: image }} style={styles.sessionImage} />
        <View style={styles.sessionContent}>
            <Text style={styles.sessionTitle}>{title}</Text>
            <Text style={styles.sessionDetails}>{details}</Text>
        </View>
        <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerGradient: {
        paddingHorizontal: 20,
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
    },
    sessionImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
    },
    sessionContent: {
        flex: 1,
        marginRight: 12,
    },
    sessionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    sessionDetails: {
        fontSize: 11,
        color: '#64748B',
    },
    startButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default HealthDashboardScreen;
