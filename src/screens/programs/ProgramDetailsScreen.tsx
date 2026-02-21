import React, { useState } from 'react';
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

    // State for accordions
    const [expandedWeek, setExpandedWeek] = useState<number | null>(1); // Default open first week

    // Mock Data based on ID
    const program = {
        title: 'Diabetes Management Program',
        subtitle: 'Blood glucose control & insulin sensitivity',
        description: 'A comprehensive 30-day wellness journey designed for individuals with Type 1 or Type 2 diabetes. Through evidence-based yoga, mindfulness meditation, and specialized breathing exercises.',
        achievements: [
            'Improved health markers & lab results',
            'Better vitals stability and consistency',
            'Reduced stress-related spikes',
            'Weight management support',
            'Enhanced energy and well-being'
        ],
        stats: [
            { icon: 'time-outline', value: '30 days' },
            { icon: 'play-outline', value: '30 days' }, // Note: Both seem to say 30 days in mockup, so I will match text. You can change the data here as needed.
            { icon: 'trending-up-outline', value: '30 days' },
            { icon: 'globe-outline', value: '30 days' },
        ],
        structure: [
            { week: 1, title: 'Foundation Phase', content: 'Learning basics, establishing routine. Gentle yoga, basic breathing.' },
            { week: 2, title: 'Building Phase', content: 'Intensity increase, response training. Intermediate yoga, longer meditation.' },
            { week: 3, title: 'Integration Phase', content: 'Lifestyle integration, habit formation. Advanced techniques.' },
            { week: 4, title: 'Mastery Phase', content: 'Independent practice, long-term maintenance.' },
        ],
        sampleSessions: [
            { title: '10-Min Morning Yoga', duration: '10 min', tag: 'Free Preview', image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&q=80' },
            { title: 'Breathing Exercise', duration: '10 min', tag: 'Free Preview', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80' },
        ],
        reviews: [
            { id: 1, initial: 'P', name: 'Priya Sharma', date: 'completed', rating: 4, text: 'This program changed my life! My HbA1c dropped significantly. The daily yoga sessions are easy to follow.' },
            { id: 2, initial: 'A', name: 'Arun Mishra', date: 'completed', rating: 5, text: 'Excellent program. The instructor is very clear and the breathing exercises really help manage stress.' }
        ]
    };

    const toggleWeek = (week: number) => {
        setExpandedWeek(expandedWeek === week ? null : week);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{program.title}</Text>
                    <Text style={styles.headerSubtitle}>{program.subtitle}</Text>
                </View>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-social-outline" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero Video Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' }}
                        style={styles.heroImage}
                    />
                    <TouchableOpacity style={styles.playButton}>
                        <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    {program.stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Ionicons name={stat.icon as any} size={20} color="#3b82f6" />
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Start Button */}
                <View style={styles.actionContainer}>
                    <LinearGradient
                        colors={['#8A88E1', '#B660C9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButtonStart}
                    >
                        <Text style={styles.actionButtonStartText}>Start Program</Text>
                    </LinearGradient>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About This Program</Text>
                    <Text style={styles.descriptionText}>{program.description}</Text>
                </View>

                {/* What You'll Achieve */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What You'll Achieve</Text>
                    {program.achievements.map((item, index) => (
                        <View key={index} style={styles.achievementItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                            <Text style={styles.achievementText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Program Structure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Program Structure</Text>
                    {program.structure.map((item) => (
                        <View key={item.week} style={styles.accordionContainer}>
                            <TouchableOpacity
                                style={[styles.accordionHeader, expandedWeek === item.week && styles.accordionHeaderActive]}
                                onPress={() => toggleWeek(item.week)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.accordionTitle}>Week {item.week} : {item.title}</Text>
                                <Ionicons name={expandedWeek === item.week ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
                            </TouchableOpacity>
                            {expandedWeek === item.week && (
                                <View style={styles.accordionContent}>
                                    <Text style={styles.accordionContentText}>{item.content}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Sample Sessions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sample Sessions</Text>
                    {program.sampleSessions.map((session, index) => (
                        <View key={index} style={styles.sessionCard}>
                            <Image source={{ uri: session.image }} style={styles.sessionImage} />
                            <View style={styles.sessionInfo}>
                                <Text style={styles.sessionTitle}>{session.title}</Text>
                                <Text style={styles.sessionDuration}>{session.duration} • <Text style={styles.sessionTag}>{session.tag}</Text></Text>
                            </View>
                            <TouchableOpacity style={styles.sessionPlayBtn}>
                                <Ionicons name="play-circle-outline" size={28} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Reviews Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    {program.reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewAvatar}>
                                    <Text style={styles.reviewAvatarText}>{review.initial}</Text>
                                </View>
                                <View style={styles.reviewAuthorInfo}>
                                    <Text style={styles.reviewAuthorName}>{review.name}</Text>
                                    <View style={styles.reviewMetaRow}>
                                        <Text style={styles.reviewAuthorDate}>{review.date}</Text>
                                        <View style={styles.starsRow}>
                                            {[...Array(5)].map((_, i) => (
                                                <Ionicons key={i} name="star" size={12} color={i < review.rating ? "#EAB308" : "#E2E8F0"} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.reviewText}>{review.text}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'flex-start' },
    shareButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'flex-end' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    headerSubtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },

    scrollContent: { paddingBottom: 40 },

    heroContainer: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden'
    },
    heroImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -24 }, { translateY: -24 }], // Center the 48x48 button
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Translucent overlay
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)'
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
    },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 10, color: '#64748b', marginTop: 8, fontWeight: '500' },

    actionContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    actionButtonStart: {
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButtonStartText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },

    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
    descriptionText: { fontSize: 12, color: '#64748b', lineHeight: 20 },

    achievementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    achievementText: { fontSize: 12, color: '#475569', marginLeft: 10, flex: 1 },

    accordionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden'
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    accordionHeaderActive: {
        // Option to change active header color
    },
    accordionTitle: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
    accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
    },
    accordionContentText: { fontSize: 11, color: '#64748b', lineHeight: 18 },

    sessionCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    sessionImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    sessionInfo: { flex: 1, justifyContent: 'center' },
    sessionTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
    sessionDuration: { fontSize: 11, color: '#64748b' },
    sessionTag: { color: '#94a3b8' },
    sessionPlayBtn: { padding: 4 },

    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    reviewAvatarText: { color: '#FFF', fontWeight: 'bold' },
    reviewAuthorInfo: { flex: 1 },
    reviewAuthorName: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 2 },
    reviewMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewAuthorDate: { fontSize: 10, color: '#94a3b8' },
    starsRow: { flexDirection: 'row' },
    reviewText: { fontSize: 12, color: '#475569', lineHeight: 18 }
});

export default ProgramDetailsScreen;
