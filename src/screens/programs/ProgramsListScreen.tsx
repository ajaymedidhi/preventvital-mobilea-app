import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FILTER_TAGS = ['All Programs', 'Diabetes', 'Hypertension', 'Cardio', 'Yoga'];

const RECOMMENDED_PROGRAMS = [
    {
        id: '1',
        title: 'Diabetes Management Program',
        duration: '30 days',
        sessions: '45 Sessions',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
        color: ['#6366f1', '#818cf8'],
        enrolled: false
    },
    {
        id: '2',
        title: 'Hypertension Control Program',
        duration: '30 days',
        sessions: '30 Sessions',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
        color: ['#ef4444', '#f87171'],
        enrolled: false
    }
];

const ALL_PROGRAMS = [
    {
        id: '1',
        title: 'Diabetes Management Program',
        duration: '30 days',
        sessions: '45 Sessions',
        level: 'Beginner',
        progress: 17,
        description: 'Blood glucose control, insulin sensitivity',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
        color: '#6366f1',
        enrolled: true
    },
    {
        id: '2',
        title: 'Hypertension Control Program',
        duration: '30 days',
        sessions: '45 Sessions',
        level: 'Beginner',
        progress: 0,
        description: 'BP reduction, stress management',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
        color: '#ef4444',
        enrolled: false
    },
    {
        id: '3',
        title: 'Daily Yoga Routine',
        duration: '15 days',
        sessions: '15 Sessions',
        level: 'Intermediate',
        progress: 0,
        description: 'Flexibility, mindfulness, core strength',
        image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&q=80',
        color: '#10b981',
        enrolled: false
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
        >
            <LinearGradient colors={item.color} style={styles.recommendedGradient}>
                <View style={styles.recommendedIconContainer}>
                    <Ionicons name="pulse" size={24} color="#fff" />
                </View>
                <Text style={styles.recommendedTitle}>{item.title}</Text>
                <View style={styles.recommendedStatsRow}>
                    <View style={styles.pill}><Text style={styles.pillText}>{item.duration}</Text></View>
                    <View style={styles.pill}><Text style={styles.pillText}>{item.sessions}</Text></View>
                </View>
                <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ProgramDetails', { programId: item.id })}>
                    <Text style={styles.viewButtonText}>View Program</Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Wellness Programs</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search programs, conditions, Keywords"
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {FILTER_TAGS.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            style={[styles.filterChip, selectedTag === tag && styles.filterChipActive]}
                            onPress={() => setSelectedTag(tag)}
                        >
                            <Text style={[styles.filterText, selectedTag === tag && styles.filterTextActive]}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                {ALL_PROGRAMS.map((program) => (
                    <TouchableOpacity
                        key={program.id}
                        style={styles.programCard}
                        onPress={() => navigation.navigate('ProgramDetails', { programId: program.id })}
                    >
                        <View style={styles.programHeader}>
                            <View style={[styles.programIcon, { backgroundColor: program.color }]}>
                                <Ionicons name="pulse" size={24} color="#fff" />
                            </View>
                            <View style={styles.programInfo}>
                                <Text style={styles.programTitleSmall}>{program.title}</Text>
                                <View style={styles.programTags}>
                                    <View style={styles.smPill}><Text style={styles.smPillText}>{program.duration}</Text></View>
                                    <View style={styles.smPill}><Text style={styles.smPillText}>{program.sessions}</Text></View>
                                    <View style={[styles.smPill, { backgroundColor: '#e0f2fe' }]}><Text style={[styles.smPillText, { color: '#0284c7' }]}>{program.level}</Text></View>
                                </View>
                            </View>
                            {program.enrolled && <Text style={styles.enrolledText}>Enrolled</Text>}
                        </View>

                        {program.enrolled ? (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressRow}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressValue}>{program.progress}%</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${program.progress}%`, backgroundColor: program.color }]} />
                                </View>
                            </View>
                        ) : null}

                        <Text style={styles.programDesc}>{program.description}</Text>

                        <TouchableOpacity
                            style={[styles.cardButton, { backgroundColor: '#6366f1' }]} // Using a consistent blue for buttons
                            onPress={() => navigation.navigate('ProgramDetails', { programId: program.id })}
                        >
                            <Text style={styles.cardButtonText}>View Program</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 20
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#0f172a' },

    filterContainer: { marginBottom: 24 },
    filterContent: { paddingHorizontal: 20 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
    },
    filterChipActive: { backgroundColor: '#4f46e5' },
    filterText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    filterTextActive: { color: '#fff' },

    scrollContent: { paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginLeft: 20, marginBottom: 16 },

    recommendedList: { paddingHorizontal: 20, paddingBottom: 10 },
    recommendedCard: { width: width * 0.6, marginRight: 16, height: 200, borderRadius: 20, overflow: 'hidden' },
    recommendedGradient: { flex: 1, padding: 16, justifyContent: 'space-between' },
    recommendedIconContainer: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    recommendedTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 12 },
    recommendedStatsRow: { flexDirection: 'row', marginTop: 8 },
    pill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
    pillText: { color: '#fff', fontSize: 10, fontWeight: '600' },
    viewButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
    viewButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    programCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    programHeader: { flexDirection: 'row', marginBottom: 12 },
    programIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    programInfo: { flex: 1 },
    programTitleSmall: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
    programTags: { flexDirection: 'row', flexWrap: 'wrap' },
    smPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 6, marginBottom: 4 },
    smPillText: { fontSize: 10, color: '#64748b', fontWeight: '500' },
    enrolledText: { fontSize: 10, color: '#10b981', fontWeight: 'bold' },

    progressContainer: { marginBottom: 12 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { fontSize: 12, color: '#64748b' },
    progressValue: { fontSize: 12, color: '#0f172a', fontWeight: 'bold' },
    progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    programDesc: { fontSize: 12, color: '#64748b', marginBottom: 16 },
    cardButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    cardButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default ProgramsListScreen;
