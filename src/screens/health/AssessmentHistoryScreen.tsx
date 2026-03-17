import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getAssessmentHistory } from '../../api/vitalsSync';

const { width } = Dimensions.get('window');

export default function AssessmentHistoryScreen() {
    const navigation = useNavigation<any>();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const data = await getAssessmentHistory();
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, []);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="clipboard-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Assessments Yet</Text>
            <Text style={styles.emptySubtitle}>Your medical assessment history will appear here once you complete your first health check.</Text>
            <TouchableOpacity 
                style={styles.startButton}
                onPress={() => navigation.navigate('CardioAssessment')}
            >
                <LinearGradient
                    colors={['#60A5FA', '#8B5CF6']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                >
                    <Text style={styles.startButtonText}>Start New Assessment</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#60A5FA', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>ASSESSMENT HISTORY</Text>
                        <View style={{ width: 32 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                ) : history.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {history.map((item, index) => (
                            <Animated.View 
                                key={item._id || index}
                                entering={FadeInDown.delay(index * 100).duration(500)}
                                style={styles.historyItem}
                            >
                                <View style={styles.historyIconContainer}>
                                    <Ionicons 
                                        name="pulse" 
                                        size={24} 
                                        color={item.results?.cvitalTierDetails?.color || '#3B82F6'} 
                                    />
                                </View>
                                <View style={styles.historyMain}>
                                    <View style={styles.historyTopRow}>
                                        <Text style={styles.historyTitle}>CVITAL™ Score</Text>
                                        <Text style={[styles.historyScore, { color: item.results?.cvitalTierDetails?.color || '#3B82F6' }]}>
                                            {item.results?.cvitalScore || '--'}
                                        </Text>
                                    </View>
                                    <View style={styles.historyBottomRow}>
                                        <View style={styles.historyMeta}>
                                            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                                            <Text style={styles.historyDate}>
                                                {item.completedAt || item.createdAt 
                                                    ? new Date(item.completedAt || item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'Recent'}
                                            </Text>
                                        </View>
                                        <View style={[styles.tierBadge, { backgroundColor: `${item.results?.cvitalTierDetails?.color || '#3B82F6'}15` }]}>
                                            <Text style={[styles.tierText, { color: item.results?.cvitalTierDetails?.color || '#3B82F6' }]}>
                                                {item.results?.cvitalTierDetails?.label || item.results?.cvitalTier || 'Unknown'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.detailsButton}
                                    onPress={() => navigation.navigate('AssessmentResults', { scoreData: item.results, formData: item.responses })}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 60 },
    headerSafeArea: { paddingHorizontal: 24, paddingTop: 10 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
    },
    backButton: { padding: 4 },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        marginTop: -40, overflow: 'hidden'
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 24, paddingTop: 32 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyIconCircle: { 
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', 
        justifyContent: 'center', alignItems: 'center', marginBottom: 24
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    startButton: { height: 56, width: '100%', borderRadius: 16, overflow: 'hidden' },
    startButtonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    historyItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 20, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    historyIconContainer: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    historyMain: { flex: 1 },
    historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    historyScore: { fontSize: 20, fontWeight: 'bold' },
    historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    historyDate: { fontSize: 12, color: '#94A3B8' },
    tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    tierText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    detailsButton: { padding: 4, marginLeft: 8 },
});
