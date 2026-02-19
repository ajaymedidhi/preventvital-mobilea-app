import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProgramDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { programId } = route.params || {};

    // Mock Data based on ID (In real app, fetch from API)
    const program = {
        title: 'Diabetes Management Program',
        description: 'The Diabetes Management Program is a comprehensive 30-day wellness journey designed specifically for individuals with Type 1 or Type 2 diabetes. Through evidence-based yoga sequences, mindfulness meditation, and specialized breathing exercises, this program helps you achieve better blood glucose control, improve insulin sensitivity, and reduce diabetes-related complications.\n\nEach day includes structured sessions tailored to your glucose patterns, with automatic adjustments based on your real-time readings from connected devices.',
        currentDay: 5,
        totalDays: 30,
        color: '#6366f1',
        stats: [
            { icon: 'time-outline', value: '30 days', label: 'Duration' },
            { icon: 'play-outline', value: '30 days', label: 'Videos' },
            { icon: 'trending-up-outline', value: '30 days', label: 'Improvement' },
            { icon: 'globe-outline', value: '30 days', label: 'Community' },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero / Video Placeholder */}
                <View style={styles.heroContainer}>
                    <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.heroGradient}>
                        <View style={styles.playButtonContainer}>
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play" size={32} color="#6366f1" />
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=Yoga&background=transparent&color=fff&size=128' }}
                            style={styles.heroOverlayImage}
                        />
                        <Text style={styles.heroTitle}>{program.title}</Text>
                    </LinearGradient>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    {program.stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Ionicons name={stat.icon as any} size={20} color="#64748b" />
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Action Card */}
                <View style={styles.actionCard}>
                    <View style={styles.actionHeader}>
                        <Text style={styles.actionTitle}>Enrolled - Day {program.currentDay} of {program.totalDays}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Continue Program</Text>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About This Program</Text>
                    <Text style={styles.descriptionText}>
                        {program.description}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    heroContainer: { paddingHorizontal: 20, marginBottom: 24 },
    heroGradient: {
        height: 220,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        position: 'relative'
    },
    playButtonContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20, zIndex: 10
    },
    playButton: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', paddingLeft: 4
    },
    heroOverlayImage: { position: 'absolute', opacity: 0.1, width: 200, height: 200 },
    heroTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', bottom: 20 },

    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 30 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 12, color: '#64748b', marginTop: 8 },

    actionCard: {
        backgroundColor: '#6366f1',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 30
    },
    actionHeader: { marginBottom: 16 },
    actionTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
    actionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButtonText: { color: '#6366f1', fontWeight: 'bold', fontSize: 16 },

    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    descriptionText: { fontSize: 14, color: '#64748b', lineHeight: 24 }
});

export default ProgramDetailsScreen;
