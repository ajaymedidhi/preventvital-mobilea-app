import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FILTER_TAGS = ['All Programs', 'Diabetes', 'Hypertension', 'Cardiac', 'Respiratory'];

const RECOMMENDED_PROGRAMS = [
    {
        id: '1',
        title: 'Diabetes Management',
        duration: '30 days',
        sessions: '45 sessions',
        rating: '4.8',
        reviews: '1250',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    },
    {
        id: '2',
        title: 'Hypertension Control',
        duration: '30 days',
        sessions: '45 sessions',
        rating: '4.8',
        reviews: '1250',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
    }
];

const ALL_PROGRAMS = [
    {
        id: '1',
        title: 'Diabetes Management',
        description: 'Blood glucose control, insulin sensitivity',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.8',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
        actionType: 'enrolled'
    },
    {
        id: '2',
        title: 'Hypertension Control',
        description: 'BP reduction, stress management',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
        actionType: 'enroll'
    },
    {
        id: '3',
        title: 'Cardiac Wellness',
        description: 'Post-op recovery, heart health',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.6',
        image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',
        actionType: 'enroll'
    },
    {
        id: '4',
        title: 'Respiratory Health',
        description: 'Lung capacity, breathing efficiency',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
        actionType: 'chevron'
    },
    {
        id: '5',
        title: 'Mental Wellness',
        description: 'Anxiety, depression, stress relief',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1512438248248-f9f14d38ea18?w=400&q=80',
        actionType: 'chevron'
    },
    {
        id: '6',
        title: 'Weight Management',
        description: 'Weight loss, metabolic health',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
        actionType: 'chevron'
    },
    {
        id: '7',
        title: 'Cancer Support',
        description: 'Post-treatment recovery, immunity',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
        actionType: 'chevron'
    },
    {
        id: '8',
        title: 'Cholesterol & Lipid Management',
        description: 'Lipid profile improvement',
        duration: '30 day',
        sessions: 'Sessions',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80',
        actionType: 'chevron'
    }
];

const ProgramsListScreen = () => {
    const navigation = useNavigation<any>();
    const [selectedTag, setSelectedTag] = useState('All Programs');
    const [searchQuery, setSearchQuery] = useState('');

    const renderRecommendedItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.recommendedCard}
            onPress={() => navigation.navigate('ProgramDetails', { programId: item.id })}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.image }} style={styles.recommendedImage} />
            <View style={styles.recommendedContent}>
                <Text style={styles.recommendedTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.recommendedBottomRow}>
                    <Text style={styles.recommendedStatText}>{item.duration} • {item.sessions}</Text>
                </View>
                <View style={styles.recommendedRatingRow}>
                    <Ionicons name="star" size={10} color="#EAB308" />
                    <Text style={styles.recommendedRatingText}>{item.rating} <Text style={styles.reviewsText}>({item.reviews})</Text></Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#A6A0F1" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
                {/* Header Gradient Section */}
                <LinearGradient
                    colors={['#A6A0F1', '#Dcdbfa', '#FAFAFA']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.6, 1]}
                >
                    <SafeAreaView edges={['top', 'left', 'right']}>
                        <View style={styles.headerTop}>
                            <Text style={styles.headerTitle}>Wellness Program</Text>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#F8F8FF" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Programs"
                                placeholderTextColor="#F8F8FF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <View style={styles.filterContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                                {FILTER_TAGS.map((tag) => {
                                    const isActive = selectedTag === tag;
                                    return (
                                        <TouchableOpacity
                                            key={tag}
                                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                                            onPress={() => setSelectedTag(tag)}
                                        >
                                            {isActive ? (
                                                <LinearGradient
                                                    colors={['#8B5CF6', '#A75FCD']}
                                                    style={styles.filterGradientActive}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                >
                                                    <Text style={styles.filterTextActive}>{tag}</Text>
                                                </LinearGradient>
                                            ) : (
                                                <Text style={styles.filterText}>{tag}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Recommended For You</Text>
                    <FlatList
                        data={RECOMMENDED_PROGRAMS}
                        renderItem={renderRecommendedItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recommendedList}
                    />

                    <Text style={styles.sectionTitle}>All Programs</Text>
                    <View style={styles.allProgramsList}>
                        {ALL_PROGRAMS.map((program) => (
                            <TouchableOpacity
                                key={program.id}
                                style={styles.programCard}
                                onPress={() => navigation.navigate('ProgramDetails', { programId: program.id })}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: program.image }} style={styles.programLeftImage} />

                                <View style={styles.programInfoContainer}>
                                    <View style={styles.programInfo}>
                                        <Text style={styles.programTitleSmall} numberOfLines={1}>{program.title}</Text>
                                        <Text style={styles.programDesc} numberOfLines={1}>{program.description}</Text>

                                        <View style={styles.programStatsRowList}>
                                            <Ionicons name="time-outline" size={12} color="#64748b" />
                                            <Text style={styles.programStatText}>{program.duration}</Text>

                                            <Ionicons name="journal-outline" size={12} color="#64748b" style={{ marginLeft: 8 }} />
                                            <Text style={styles.programStatText}>{program.sessions}</Text>

                                            <Ionicons name="star" size={10} color="#EAB308" style={{ marginLeft: 8 }} />
                                            <Text style={styles.programStatText}>{program.rating}</Text>
                                        </View>
                                    </View>

                                    {program.actionType === 'enrolled' && (
                                        <TouchableOpacity onPress={() => navigation.navigate('MyPrograms')}>
                                            <LinearGradient
                                                colors={['#8A88E1', '#B660C9']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.actionButtonEnrolled}
                                            >
                                                <Text style={styles.actionButtonEnrolledText}>Enrolled</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}

                                    {program.actionType === 'enroll' && (
                                        <View style={styles.actionButtonEnroll}>
                                            <Text style={styles.actionButtonEnrollText}>Enroll Now</Text>
                                        </View>
                                    )}

                                    {program.actionType === 'chevron' && (
                                        <View style={styles.actionChevron}>
                                            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#FAFAFA' },

    headerGradient: {
        width: '100%',
        paddingBottom: 24,
    },
    headerTop: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(230, 230, 255, 0.4)', // Very soft translucent white
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 24,
    },
    searchIcon: { marginRight: 10, color: '#F0F0FF' },
    searchInput: { flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '500' },

    filterContainer: { marginBottom: 10 },
    filterContent: { paddingHorizontal: 20 },
    filterChip: {
        borderRadius: 24,
        backgroundColor: '#F3F4F6', // Lighter grey for inactive
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    filterChipActive: {
        backgroundColor: 'transparent', // Gradient handles background
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    filterGradientActive: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
    },
    filterText: { paddingHorizontal: 20, paddingVertical: 10, fontSize: 14, color: '#6B7280', fontWeight: '600' },
    filterTextActive: { color: '#ffffff', fontSize: 14, fontWeight: '600' },

    scrollContent: { flexGrow: 1, paddingBottom: 40 },

    contentSection: {
        paddingTop: 10,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginLeft: 20, marginBottom: 16 },

    recommendedList: { paddingHorizontal: 20, paddingBottom: 24 },
    recommendedCard: {
        width: width * 0.75, // Wider cards to match mockup
        marginRight: 16,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    recommendedImage: {
        width: '100%',
        height: 140, // Taller image
        resizeMode: 'cover'
    },
    recommendedContent: {
        padding: 14,
    },
    recommendedTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    recommendedBottomRow: { flexDirection: 'row', marginBottom: 2 },
    recommendedStatText: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
    recommendedRatingRow: { flexDirection: 'row', alignItems: 'center' },
    recommendedRatingText: { color: '#0f172a', fontSize: 11, fontWeight: '600', marginLeft: 4 },
    reviewsText: { color: '#94a3b8', fontWeight: '400' },

    allProgramsList: { paddingHorizontal: 20 },
    programCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        height: 110, // Fixed height for full image effect
        overflow: 'hidden', // clips the left image to the border radius
    },
    programLeftImage: {
        width: 110,
        height: '100%',
        resizeMode: 'cover',
    },
    programInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    programInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    programTitleSmall: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    programDesc: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
    programStatsRowList: { flexDirection: 'row', alignItems: 'center' },
    programStatText: { fontSize: 11, color: '#64748b', marginLeft: 4, fontWeight: '600' },

    actionButtonEnrolled: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 10,
    },
    actionButtonEnrolledText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold'
    },
    actionButtonEnroll: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#B660C9', // Purplish border
        marginLeft: 10,
    },
    actionButtonEnrollText: {
        color: '#B660C9',
        fontSize: 11,
        fontWeight: '600'
    },
    actionChevron: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProgramsListScreen;
