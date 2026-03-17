import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

const { width } = Dimensions.get('window');

const TABS = ['Today', 'Week', 'Month', '3M', 'Year'];

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 30;

    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <Svg height={height} width={width}>
            <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
            />
        </Svg>
    );
};

const VitalCard = ({
    icon,
    iconColor,
    bgColor,
    title,
    value,
    unit,
    status,
    statusColor,
    statusBg,
    time,
    chartData,
    chartColor
}: any) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.valueRow}>
                    <Text style={styles.value}>{value}</Text>
                    <Text style={styles.unit}>{unit}</Text>
                </View>
            </View>
            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                </View>
                <Text style={styles.timeText}>{time}</Text>
            </View>
        </View>
        <View style={styles.chartContainer}>
            <Sparkline data={chartData} color={chartColor} />
        </View>
    </View>
);

export default function AllVitalsScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('Today');

    // Mock trend data
    const hrData = [70, 75, 72, 80, 78, 72, 70];
    const bpData = [115, 120, 118, 124, 122, 118, 120];
    const bgData = [90, 95, 100, 98, 92, 95, 96];
    const spO2Data = [97, 98, 98, 99, 97, 98, 98];
    const weightData = [76, 75.8, 75.5, 75.6, 75.4, 75.5, 75.5];
    const stepsData = [4000, 5500, 4800, 6000, 5200, 7000, 5420];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Vital Score</Text>
                <TouchableOpacity style={styles.logButton}>
                    <Ionicons name="add" size={16} color="#64748B" />
                    <Text style={styles.logButtonText}>Log</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <VitalCard
                    icon="heart" iconColor="#EF4444" bgColor="#FEE2E2"
                    title="Heart Rate" value="72" unit="bpm"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="5 min ago" chartData={hrData} chartColor="#EF4444"
                />

                <VitalCard
                    icon="pulse-outline" iconColor="#3B82F6" bgColor="#DBEAFE"
                    title="Blood Pressure" value="120/80" unit="mmHg"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="9 hr ago" chartData={bpData} chartColor="#3B82F6"
                />

                <VitalCard
                    icon="water" iconColor="#F59E0B" bgColor="#FEF3C7"
                    title="Blood Glucose" value="95" unit="mg/dL"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="9 hr ago" chartData={bgData} chartColor="#F59E0B"
                />

                <VitalCard
                    icon="leaf-outline" iconColor="#10B981" bgColor="#D1FAE5"
                    title="SpO2" value="98" unit="%"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="9 hr ago" chartData={spO2Data} chartColor="#10B981"
                />

                <VitalCard
                    icon="barbell-outline" iconColor="#8B5CF6" bgColor="#EDE9FE"
                    title="Weight" value="75.5" unit="kg"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="This morning" chartData={weightData} chartColor="#8B5CF6"
                />

                <VitalCard
                    icon="footsteps" iconColor="#F59E0B" bgColor="#FEF3C7"
                    title="Steps" value="5,420" unit="/10,000"
                    status="Normal" statusColor="#059669" statusBg="#D1FAE5"
                    time="9 hr ago" chartData={stepsData} chartColor="#F59E0B"
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    logButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    logButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        marginLeft: 4,
    },
    tabsContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tabsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#8B5CF6',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    unit: {
        fontSize: 12,
        color: '#94A3B8',
        marginLeft: 4,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 10,
        color: '#94A3B8',
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
});
