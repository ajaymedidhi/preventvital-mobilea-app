import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ActivityScreen = () => {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'weekly'>('today');
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [todayStats, setTodayStats] = useState<any>({
        steps: 0,
        calories: 0,
        distance: 0,
        activeTime: 15 // Mock for now as activeTime is not yet synced
    });

    const loadData = useCallback(async () => {
        try {
            let historyRes = { data: { success: false, history: [] } };
            try {
                historyRes = await client.get('/api/wearables/history/googlefit');
            } catch (e) {
                console.log('[ACTIVITY] History not available');
            }

            const userRes = await client.get('/api/users/me');

            if (historyRes.data.success) {
                setHistory(historyRes.data.history);
            }

            const latest = userRes.data?.data?.user?.latestVitals || userRes.data?.user?.latestVitals;
            if (latest) {
                setTodayStats({
                    steps: latest.steps || 0,
                    calories: latest.calories || 0,
                    distance: latest.distance || 0,
                    activeTime: 15 // Placeholder
                });
            }
        } catch (error) {
            console.error('[ACTIVITY] Failed to load data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Calculate weekly chart data from real history
    const weeklyData = history.slice(-7).map(item => ({
        day: item.dayName,
        steps: item.steps,
        max: 10000 // Goal threshold
    }));

    // Pad with empty data if history is shorter than 7 days
    while (weeklyData.length < 7 && weeklyData.length > 0) {
        // Just showing whatever we have for now
        break;
    }

    const SummaryCard = ({ title, value, unit, icon, color, bgColor }: any) => (
        <View style={styles.summaryCard}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.summaryValue}>
                    {value} <Text style={styles.summaryUnit}>{unit}</Text>
                </Text>
                <Text style={styles.summaryTitle}>{title}</Text>
            </View>
        </View>
    );

    const WorkoutLog = ({ title, type, duration, calories, date, icon }: any) => (
        <View style={styles.logCard}>
            <View style={[styles.logIconContainer, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name={icon} size={24} color="#6366F1" />
            </View>
            <View style={styles.logInfo}>
                <Text style={styles.logTitle}>{title}</Text>
                <Text style={styles.logDetails}>{type} • {date}</Text>
            </View>
            <View style={styles.logStats}>
                <Text style={styles.logDuration}>{duration}</Text>
                <Text style={styles.logCalories}>{calories} kcal</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Activity</Text>
                    <View style={styles.filterTabs}>
                        <TouchableOpacity
                            onPress={() => setFilter('today')}
                            style={[styles.filterTab, filter === 'today' && styles.filterTabActive]}
                        >
                            <Text style={[styles.filterTabText, filter === 'today' && styles.filterTextActive]}>Day</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilter('weekly')}
                            style={[styles.filterTab, filter === 'weekly' && styles.filterTabActive]}
                        >
                            <Text style={[styles.filterTabText, filter === 'weekly' && styles.filterTextActive]}>Week</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {loading && !refreshing ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={{ marginTop: 12, color: '#64748B' }}>Fetching your progress...</Text>
                        </View>
                    ) : (
                        <View style={{ paddingHorizontal: 20 }}>
                            {/* Daily Summary Grid */}
                            <Text style={styles.sectionTitle}>{filter === 'today' ? "Today's Overview" : 'Weekly Average'}</Text>
                            <View style={styles.summaryGrid}>
                                <SummaryCard
                                    title="Steps"
                                    value={filter === 'today' ? todayStats.steps?.toLocaleString() : Math.round(weeklyData.reduce((acc, curr) => acc + curr.steps, 0) / (weeklyData.length || 1)).toLocaleString()}
                                    unit=""
                                    icon="footsteps-outline" color="#16A34A" bgColor="#DCFCE7"
                                />
                                <SummaryCard
                                    title="Calories"
                                    value={filter === 'today' ? todayStats.calories : Math.round(history.reduce((acc, curr) => acc + curr.calories, 0) / (history.length || 1))}
                                    unit="kcal"
                                    icon="flame-outline" color="#EF4444" bgColor="#FEE2E2"
                                />
                                <SummaryCard
                                    title="Distance"
                                    value={filter === 'today' ? (todayStats.distance / 1000).toFixed(2) : (history.reduce((acc, curr) => acc + (curr.distance || 0), 0) / (history.length || 1) / 1000).toFixed(2)}
                                    unit="km"
                                    icon="walk-outline" color="#3B82F6" bgColor="#EFF6FF"
                                />
                                <SummaryCard
                                    title="Active Time" value={todayStats.activeTime} unit="min"
                                    icon="timer-outline" color="#F59E0B" bgColor="#FEF3C7"
                                />
                            </View>

                            {/* Weekly Steps Chart */}
                            <View style={styles.chartCard}>
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartTitle}>Steps</Text>
                                        <Text style={styles.chartSubtitle}>Weekly Progress</Text>
                                    </View>
                                    <Text style={styles.chartTotal}>{todayStats.steps?.toLocaleString()} <Text style={{ fontSize: 14, color: '#94A3B8', fontWeight: '500' }}>today</Text></Text>
                                </View>

                                <View style={styles.barChartContainer}>
                                    {weeklyData.length === 0 ? (
                                        <Text style={{ color: '#94A3B8', textAlign: 'center', width: '100%' }}>No activity data found for this week</Text>
                                    ) : weeklyData.map((data, index) => {
                                        const heightPercentage = (data.steps / data.max) * 100;
                                        const isToday = index === weeklyData.length - 1;
                                        const hitGoal = data.steps >= data.max;

                                        return (
                                            <View key={index} style={styles.barColumn}>
                                                <View style={styles.barTrack}>
                                                    <LinearGradient
                                                        colors={hitGoal ? ['#22C55E', '#16A34A'] : (isToday ? ['#6366F1', '#8B5CF6'] : ['#94A3B8', '#CBD5E1'])}
                                                        style={[styles.barFill, { height: `${Math.min(heightPercentage, 100)}%` }]}
                                                    />
                                                </View>
                                                <Text style={[styles.barLabel, isToday && { fontWeight: '700', color: '#1E293B' }]}>
                                                    {data.day}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Recent Workouts List */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Logs</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAllText}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            <WorkoutLog
                                title="Morning Jog"
                                type="Outdoor Run"
                                date="Today, 7:00 AM"
                                duration="30 min"
                                calories="320"
                                icon="walk"
                            />
                            <WorkoutLog
                                title="Yoga Session"
                                type="Flexibility"
                                date="Yesterday, 6:30 PM"
                                duration="45 min"
                                calories="180"
                                icon="body"
                            />
                            <WorkoutLog
                                title="Strength Training"
                                type="Gym"
                                date="Thu, 5:00 PM"
                                duration="60 min"
                                calories="450"
                                icon="barbell"
                            />

                            <View style={{ height: 60 }} />
                        </View>
                    )}

                </ScrollView>
            </View>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
    },
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
    },
    filterTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    filterTabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#6366F1',
    },
    scrollContent: {
        paddingTop: 10,
    },
    dateRibbon: {
        marginBottom: 24,
        flexGrow: 0,
    },
    dateBubble: {
        width: 50,
        height: 64,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dateBubbleActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    dateDayText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
        marginBottom: 4,
    },
    dateNumText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    dateTextActive: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    seeAllText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '600',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    summaryCard: {
        width: (width - 40 - 16) / 2, // 40 horizontal padding total, 16 middle gap
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    summaryUnit: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    summaryTitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    chartSubtitle: {
        fontSize: 13,
        color: '#64748B',
    },
    chartTotal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B5CF6',
    },
    barChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
    },
    barColumn: {
        alignItems: 'center',
        width: 30,
    },
    barTrack: {
        width: 8,
        height: 100,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        marginBottom: 8,
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        borderRadius: 4,
    },
    barLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    logCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    logIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logInfo: {
        flex: 1,
    },
    logTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    logDetails: {
        fontSize: 12,
        color: '#64748b',
    },
    logStats: {
        alignItems: 'flex-end',
    },
    logDuration: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    logCalories: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
    },
});

export default ActivityScreen;
