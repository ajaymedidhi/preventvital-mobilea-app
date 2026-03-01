import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DevicesScreen = () => {
    // Mock state for connected devices
    const [isAppleHealthConnected, setAppleHealthConnected] = React.useState(true);
    const [isFitbitConnected, setFitbitConnected] = React.useState(false);
    const [isGarminConnected, setGarminConnected] = React.useState(false);

    const DeviceCard = ({ name, icon, isConnected, onToggle, lastSync, batteryLevel, type }: any) => (
        <View style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
                <View style={[styles.deviceIconContainer, { backgroundColor: isConnected ? '#EFF6FF' : '#F1F5F9' }]}>
                    <Ionicons name={icon} size={28} color={isConnected ? '#3B82F6' : '#94A3B8'} />
                </View>
                <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{name}</Text>
                    <Text style={styles.deviceType}>{type}</Text>
                </View>
                {/* Custom styled switch matching iOS look */}
                <Switch
                    trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
                    thumbColor={"#FFFFFF"}
                    ios_backgroundColor="#E2E8F0"
                    onValueChange={onToggle}
                    value={isConnected}
                />
            </View>

            {isConnected && (
                <View style={styles.deviceDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="sync-circle-outline" size={16} color="#64748B" />
                        <Text style={styles.detailText}>Last synced: {lastSync}</Text>
                    </View>
                    {batteryLevel && (
                        <View style={styles.detailRow}>
                            <Ionicons name="battery-half" size={16} color="#10B981" />
                            <Text style={styles.detailText}>Battery: {batteryLevel}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Connected Devices</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="refresh" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Status Hero Card */}
                <LinearGradient
                    colors={['#8B5CF6', '#A855F7']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconOutline}>
                            <Ionicons name="hardware-chip" size={32} color="#fff" />
                        </View>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>All devices synced</Text>
                            <Text style={styles.heroSubtitle}>Last update: Today at 9:41 AM</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.syncButton}>
                        <Text style={styles.syncButtonText}>Sync Now</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={styles.sectionTitle}>My Devices & Apps</Text>

                {/* Device List */}
                <DeviceCard
                    name="Apple Health"
                    type="Health App Integration"
                    icon="fitness-outline"
                    isConnected={isAppleHealthConnected}
                    onToggle={() => setAppleHealthConnected(!isAppleHealthConnected)}
                    lastSync="Just now"
                />

                <DeviceCard
                    name="Apple Watch Series 9"
                    type="Smartwatch"
                    icon="watch-outline"
                    isConnected={true} // Hardcoded as connected for demo
                    onToggle={() => { }}
                    lastSync="Just now"
                    batteryLevel="85%"
                />

                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Available Integrations</Text>

                <DeviceCard
                    name="Fitbit"
                    type="Wearable Device"
                    icon="pulse"
                    isConnected={isFitbitConnected}
                    onToggle={() => setFitbitConnected(!isFitbitConnected)}
                />

                <DeviceCard
                    name="Garmin Connect"
                    type="Wearable Device"
                    icon="navigate-circle-outline" // Closest generic icon
                    isConnected={isGarminConnected}
                    onToggle={() => setGarminConnected(!isGarminConnected)}
                />

                <DeviceCard
                    name="Oura Ring"
                    type="Smart Ring"
                    icon="aperture-outline"
                    isConnected={false}
                    onToggle={() => { }}
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC', // Match container background
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroIconOutline: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    syncButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    syncButtonText: {
        color: '#8B5CF6',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4,
    },
    deviceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    deviceType: {
        fontSize: 13,
        color: '#64748b',
    },
    deviceDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 6,
        fontWeight: '500',
    }
});

export default DevicesScreen;
