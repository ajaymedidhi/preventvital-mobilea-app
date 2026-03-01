import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ActivityScreen = () => {

    // Mock data for weekly steps chart
    const weeklyData = [
        { day: 'Mon', steps: 6000, max: 10000 },
        { day: 'Tue', steps: 8500, max: 10000 },
        { day: 'Wed', steps: 11000, max: 10000 }, // hit goal
        { day: 'Thu', steps: 4200, max: 10000 },
        { day: 'Fri', steps: 9000, max: 10000 },
        { day: 'Sat', steps: 12500, max: 10000 }, // hit goal
        { day: 'Sun', steps: 3450, max: 10000 },  // today
    ];

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Activity</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="filter" size={20} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Date Picker Ribbon (Mock) */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRibbon} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {['12', '13', '14', '15', '16', '17', '18'].map((day, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.dateBubble, idx === 6 && styles.dateBubbleActive]}
                        >
                            <Text style={[styles.dateDayText, idx === 6 && styles.dateTextActive]}>
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                            </Text>
                            <Text style={[styles.dateNumText, idx === 6 && styles.dateTextActive]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ paddingHorizontal: 20 }}>
                    {/* Daily Summary Grid */}
                    <Text style={styles.sectionTitle}>Today's Overview</Text>
                    <View style={styles.summaryGrid}>
                        <SummaryCard
                            title="Active Time" value="45" unit="min"
                            icon="timer-outline" color="#F59E0B" bgColor="#FEF3C7"
                        />
                        <SummaryCard
                            title="Calories" value="1,240" unit="kcal"
                            icon="flame-outline" color="#EF4444" bgColor="#FEE2E2"
                        />
                        <SummaryCard
                            title="Distance" value="4.2" unit="km"
                            icon="walk-outline" color="#3B82F6" bgColor="#EFF6FF"
                        />
                        <SummaryCard
                            title="Sleep" value="7h 20m" unit=""
                            icon="moon-outline" color="#8B5CF6" bgColor="#EDE9FE"
                        />
                    </View>

                    {/* Weekly Steps Chart */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.chartTitle}>Steps</Text>
                                <Text style={styles.chartSubtitle}>Weekly Progress</Text>
                            </View>
                            <Text style={styles.chartTotal}>3,450 <Text style={{ fontSize: 14, color: '#94A3B8', fontWeight: '500' }}>today</Text></Text>
                        </View>

                        <View style={styles.barChartContainer}>
                            {weeklyData.map((data, index) => {
                                const heightPercentage = (data.steps / data.max) * 100;
                                const isToday = index === 6;
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
