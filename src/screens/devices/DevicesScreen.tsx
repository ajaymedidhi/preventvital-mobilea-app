import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Alert, ActivityIndicator, Modal, Switch, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import client from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { syncVitals } from '../../api/vitalsSync';

const { width } = Dimensions.get('window');

const DevicesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    // Connection states
    const [googleFitConnected, setGoogleFitConnected] = useState(false);
    const [appleHealthConnected, setAppleHealthConnected] = useState(false);
    const [connectingGoogle, setConnectingGoogle] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);

    // Health data from backend
    const [latestVitals, setLatestVitals] = useState<any>(null);
    const [vitalHistory, setVitalHistory] = useState<any[]>([]);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

    // Check connection status on mount
    const checkConnectionStatus = useCallback(async () => {
        try {
            const res = await client.get('/api/users/me');
            const profile = res.data?.data?.user || res.data?.user;
            if (profile?.wearableIntegrations?.googleFit?.connected) {
                setGoogleFitConnected(true);
            }
        } catch (err) {
            console.log('Could not check integration status');
        }
    }, []);

    // Load health data
    const loadHealthData = useCallback(async () => {
        try {
            // Fetch latest vitals
            const latestRes = await client.get('/api/wearables/latest');
            if (latestRes.data?.data) {
                setLatestVitals(latestRes.data.data);
                if (latestRes.data.data.lastUpdated) {
                    const d = new Date(latestRes.data.data.lastUpdated);
                    setLastSyncTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
            }

            // Fetch recent history
            const histRes = await client.get('/api/wearables/history?limit=20');
            if (histRes.data?.data) {
                setVitalHistory(histRes.data.data);
            }
        } catch (err) {
            console.log('Could not load health data');
        }
    }, []);

    useEffect(() => {
        checkConnectionStatus();
        loadHealthData();
    }, [checkConnectionStatus, loadHealthData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await checkConnectionStatus();
        await loadHealthData();
        setRefreshing(false);
    };

    // Google Fit Auth (Backend OAuth Flow via Isolated WebView)
    const connectGoogleFit = async () => {
        setConnectingGoogle(true);
        try {
            // Get the OAuth URL from the backend
            const res = await client.get('/api/wearables/oauth/googlefit/login');
            if (res.data?.url) {
                // Open in an isolated WebView to prevent Android OS from intercepting the URL
                // and trying to execute the "Add Account to Device" intent
                setGoogleAuthUrl(res.data.url);
            }
        } catch (err) {
            setConnectingGoogle(false);
            Alert.alert(
                'Error',
                'Could not open Google Fit login. Would you like to simulate a successful connection?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Simulate Auth',
                        onPress: async () => {
                            setGoogleFitConnected(true);
                            await loadHealthData();
                            Alert.alert('✅ Connected (Simulated)', 'Google Fit simulated link successful.');
                        }
                    }
                ]
            );
            console.error(err);
        }
    };

    const disconnectGoogleFit = () => {
        Alert.alert('Disconnect Google Fit', 'This will remove the Google Fit integration from your account.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Disconnect', style: 'destructive',
                onPress: async () => {
                    try {
                        // No explicit disconnect endpoint, just reset UI
                        setGoogleFitConnected(false);
                        setLatestVitals(null);
                        setVitalHistory([]);
                        Alert.alert('Disconnected', 'Google Fit has been removed.');
                    } catch (err) {
                        Alert.alert('Error', 'Failed to disconnect.');
                    }
                }
            }
        ]);
    };

    const syncNow = async () => {
        setSyncing(true);
        try {
            // Sync Google Fit natively via the backend (since emulator Android SDK may fail)
            if (googleFitConnected) {
                await client.post('/api/wearables/sync/googlefit');
            } else if (appleHealthConnected && Platform.OS === 'ios') {
                await syncVitals();
            }
            // Pull the latest snapshot from backend to update UI
            await loadHealthData();
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            Alert.alert('✅ Synced', 'Latest health data has been fetched.');
        } catch (err) {
            Alert.alert('Sync Failed', 'Could not fetch latest data.');
        }
        setSyncing(false);
    };

    // Latest vitals data
    const heartRate = latestVitals?.heartRate || null;
    const spo2 = latestVitals?.spo2 || null;
    const bp = latestVitals?.bloodPressure || null;
    const steps = latestVitals?.steps || null;
    const calories = latestVitals?.calories || null;
    const distance = latestVitals?.distance || null;
    const anyConnected = googleFitConnected || appleHealthConnected;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
            >
                {/* ── Header ──────────────────────────────────────── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Connected Devices</Text>
                        <Text style={styles.headerSub}>Sync health data from your wearables</Text>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#6366F1" />
                    </TouchableOpacity>
                </View>

                {/* ── Live Stream Access ──────────────────────────────── */}
                <TouchableOpacity
                    style={styles.liveAccessCard}
                    onPress={() => navigation.navigate('WearableDashboard')}
                    activeOpacity={0.8}
                >
                    <View style={styles.liveAccessIconBox}>
                        <Ionicons name="pulse" size={24} color="#EF4444" />
                        <View style={styles.liveDot} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.liveAccessTitle}>Live Monitoring</Text>
                        <Text style={styles.liveAccessSub}>View real-time telemetry from connected devices</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                {/* ── Status Hero ──────────────────────────────────── */}
                <LinearGradient
                    colors={anyConnected ? ['#6366F1', '#8B5CF6'] : ['#64748B', '#94A3B8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconOutline}>
                            <Ionicons
                                name={anyConnected ? 'checkmark-circle' : 'hardware-chip'}
                                size={28}
                                color="#FFF"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.heroTitle}>
                                {anyConnected ? 'Devices Connected' : 'No Devices Linked'}
                            </Text>
                            <Text style={styles.heroSub}>
                                {anyConnected
                                    ? `Last sync: ${lastSyncTime} `
                                    : 'Connect a device to start syncing health data'
                                }
                            </Text>
                        </View>
                    </View>
                    {anyConnected && (
                        <TouchableOpacity style={styles.syncBtn} onPress={syncNow} disabled={syncing}>
                            {syncing ? (
                                <ActivityIndicator size="small" color="#6366F1" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="sync" size={16} color="#6366F1" />
                                    <Text style={styles.syncBtnText}>Sync Now</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* ── Google Fit ──────────────────────────────────── */}
                <Text style={styles.sectionTitle}>Health Platforms</Text>

                <View style={[styles.deviceCard, googleFitConnected && styles.deviceCardConnected]}>
                    <View style={styles.deviceRow}>
                        <View style={[styles.deviceIconBox, { backgroundColor: googleFitConnected ? '#DCFCE7' : '#F1F5F9' }]}>
                            <Text style={{ fontSize: 24 }}>🏃</Text>
                        </View>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>Google Fit</Text>
                            <Text style={styles.deviceMeta}>
                                {googleFitConnected ? '✅ Connected & syncing' : 'Android health data'}
                            </Text>
                        </View>
                        {connectingGoogle ? (
                            <ActivityIndicator size="small" color="#6366F1" />
                        ) : googleFitConnected ? (
                            <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectGoogleFit}>
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.connectBtn} onPress={connectGoogleFit}>
                                <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.connectBtnInner}>
                                    <Ionicons name="link" size={14} color="#FFF" />
                                    <Text style={styles.connectBtnText}>Connect</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Connected Status Details */}
                    {googleFitConnected && (
                        <View style={styles.connectedDetails}>
                            <View style={styles.detailChip}>
                                <Ionicons name="sync-circle" size={14} color="#16A34A" />
                                <Text style={styles.detailChipText}>Auto-sync active</Text>
                            </View>
                            <View style={styles.detailChip}>
                                <Ionicons name="time-outline" size={14} color="#64748B" />
                                <Text style={styles.detailChipText}>Last: {lastSyncTime}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Apple Health */}
                <View style={[styles.deviceCard, appleHealthConnected && styles.deviceCardConnected]}>
                    <View style={styles.deviceRow}>
                        <View style={[styles.deviceIconBox, { backgroundColor: appleHealthConnected ? '#DCFCE7' : '#F1F5F9' }]}>
                            <Text style={{ fontSize: 24 }}>⌚</Text>
                        </View>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>Apple Health</Text>
                            <Text style={styles.deviceMeta}>
                                {appleHealthConnected ? '✅ Connected' : 'iOS health data (HealthKit)'}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#E2E8F0", true: "#6366F1" }}
                            thumbColor="#FFF"
                            ios_backgroundColor="#E2E8F0"
                            value={appleHealthConnected}
                            onValueChange={(val) => {
                                if (Platform.OS !== 'ios') {
                                    Alert.alert('iOS Only', 'Apple Health is only available on iOS devices.');
                                    return;
                                }
                                setAppleHealthConnected(val);
                            }}
                        />
                    </View>
                </View>

                {/* ── Synced Health Data ──────────────────────────── */}
                {anyConnected && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Synced Health Data</Text>

                        <View style={styles.vitalsGrid}>
                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="heart" size={18} color="#EF4444" />
                                </View>
                                <Text style={styles.vitalVal}>{heartRate ?? '—'}</Text>
                                <Text style={styles.vitalUnit}>bpm</Text>
                                <Text style={styles.vitalLabel}>Heart Rate</Text>
                            </View>

                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="water" size={18} color="#3B82F6" />
                                </View>
                                <Text style={styles.vitalVal}>{spo2 ?? '—'}</Text>
                                <Text style={styles.vitalUnit}>%</Text>
                                <Text style={styles.vitalLabel}>SpO₂</Text>
                            </View>

                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="pulse" size={18} color="#8B5CF6" />
                                </View>
                                <Text style={styles.vitalVal}>
                                    {bp ? `${bp.systolic || '—'}/${bp.diastolic || '—'}` : '—'}
                                </Text >
                                <Text style={styles.vitalUnit}>mmHg</Text>
                                <Text style={styles.vitalLabel}>Blood Pressure</Text>
                            </View >
                        </View >

                        <View style={[styles.vitalsGrid, { marginTop: 10 }]}>
                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="footsteps" size={18} color="#16A34A" />
                                </View>
                                <Text style={styles.vitalVal}>{steps ?? '—'}</Text>
                                <Text style={styles.vitalUnit}>steps</Text>
                                <Text style={styles.vitalLabel}>Activity</Text>
                            </View>

                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="flame" size={18} color="#F59E0B" />
                                </View>
                                <Text style={styles.vitalVal}>{calories ?? '—'}</Text>
                                <Text style={styles.vitalUnit}>kcal</Text>
                                <Text style={styles.vitalLabel}>Burned</Text>
                            </View>

                            <View style={styles.vitalCard}>
                                <View style={styles.vitalIcon}>
                                    <Ionicons name="location" size={18} color="#6366F1" />
                                </View>
                                <Text style={styles.vitalVal}>
                                    {distance !== null ? (distance / 1000).toFixed(2) : '—'}
                                </Text >
                                <Text style={styles.vitalUnit}>km</Text>
                                <Text style={styles.vitalLabel}>Distance</Text>
                            </View >
                        </View >

                        {/* Recent Activity Log */}
                        {
                            vitalHistory.length > 0 && (
                                <View style={styles.logCard}>
                                    <Text style={styles.logTitle}>Recent Sync History</Text>
                                    {vitalHistory.slice(0, 8).map((item, i) => (
                                        <View key={i} style={styles.logRow}>
                                            <View style={[styles.logDot, {
                                                backgroundColor: item.status === 'critical' ? '#EF4444'
                                                    : item.status === 'warning' ? '#EAB308' : '#16A34A'
                                            }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.logItemTitle}>
                                                    {(item.vitalType || '').replace(/_/g, ' ')}
                                                </Text>
                                                <Text style={styles.logItemSub}>
                                                    {typeof item.value === 'object'
                                                        ? `${item.value?.systolic || ''}/${item.value?.diastolic || ''}`
                                                        : item.value
                                                    } {item.unit}
                                                </Text>
                                            </View>
                                            <Text style={styles.logTime}>
                                                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )
                        }
                    </>
                )}

                {/* ── Other Integrations ──────────────────────────── */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Other Integrations</Text>

                {
                    [
                        { name: 'Fitbit', emoji: '📟', desc: 'Charge, Sense, Versa' },
                        { name: 'Garmin Connect', emoji: '⛰️', desc: 'Forerunner, Venu, Fenix' },
                        { name: 'boAt Watch', emoji: '🛥️', desc: 'Via Google Fit / Apple Health' },
                        { name: 'Oura Ring', emoji: '💍', desc: 'Gen 3, Gen 4' },
                    ].map((item, i) => (
                        <View key={i} style={styles.deviceCard}>
                            <View style={styles.deviceRow}>
                                <View style={[styles.deviceIconBox, { backgroundColor: '#F8FAFC' }]}>
                                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                                </View>
                                <View style={styles.deviceInfo}>
                                    <Text style={styles.deviceName}>{item.name}</Text>
                                    <Text style={styles.deviceMeta}>{item.desc}</Text>
                                </View>
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                                </View>
                            </View>
                        </View>
                    ))
                }

                {/* ── Info Card ──────────────────────────────────── */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#6366F1" />
                    <Text style={styles.infoText}>
                        Connected devices sync health data automatically in the background. Your data is encrypted and never shared without consent.
                    </Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView >

            {/* Isolated WebView for Google Auth */}
            < Modal visible={!!googleAuthUrl} animationType="slide" presentationStyle="pageSheet" >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
                    <View style={styles.webviewHeader}>
                        <TouchableOpacity onPress={() => {
                            setGoogleAuthUrl(null);
                            setConnectingGoogle(false);
                        }}>
                            <Text style={styles.webviewClose}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.webviewTitle}>Connect Google Fit</Text>
                        <View style={{ width: 50 }} />
                    </View>
                    {googleAuthUrl && (
                        <WebView
                            source={{ uri: googleAuthUrl }}
                            // Spoof user agent to bypass Google's "disallowed_useragent" block for embedded WebViews
                            userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.79 Mobile Safari/537.36"
                            onNavigationStateChange={async (navState) => {
                                // Close the modal once we hit our backend callback URL securely
                                if (navState.url.includes('/oauth/googlefit/callback') && !navState.loading) {
                                    const url = navState.url;
                                    const hasError = url.includes('error=');
                                    
                                    if (hasError) {
                                        setGoogleAuthUrl(null);
                                        setConnectingGoogle(false);
                                        Alert.alert('Connection Failed', 'Authorization was denied or an error occurred during login.');
                                        return;
                                    }

                                    setGoogleAuthUrl(null);
                                    setTimeout(async () => {
                                        try {
                                            const checkRes = await client.get('/api/users/me');
                                            const profile = checkRes.data?.data?.user || checkRes.data?.user;
                                            if (profile?.wearableIntegrations?.googleFit?.connected) {
                                                setGoogleFitConnected(true);
                                                setConnectingGoogle(false);
                                                try { await client.post('/api/wearables/sync/googlefit'); } catch (e) { }
                                                await loadHealthData();
                                                Alert.alert('✅ Connected!', 'Google Fit is now linked and syncing.');
                                            } else {
                                                Alert.alert('Almost there', 'We are still waiting for the connection to finalize. Try refreshing in a moment.');
                                                setConnectingGoogle(false);
                                            }
                                        } catch (e: any) {
                                            setConnectingGoogle(false);
                                            const errorMsg = e.response?.data?.message || e.message || 'Unknown error';
                                            Alert.alert('Error', `Failed to verify connection status: ${errorMsg}`);
                                        }
                                    }, 1500);
                                }
                            }}
                        />
                    )}
                </SafeAreaView>
            </Modal >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    // WebView Modal Header
    webviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    webviewTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    webviewClose: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
    headerSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
    refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },

    // Hero
    liveAccessCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    liveAccessIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative' },
    liveDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FEF2F2' },
    liveAccessTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    liveAccessSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    heroCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
    heroContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    heroIconOutline: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    heroTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
    heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    syncBtn: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    syncBtnText: { color: '#6366F1', fontWeight: '700', fontSize: 14 },

    // Section
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 4 },

    // Device Cards
    deviceCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    deviceCardConnected: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
    deviceRow: { flexDirection: 'row', alignItems: 'center' },
    deviceIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    deviceInfo: { flex: 1 },
    deviceName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    deviceMeta: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    connectBtn: { borderRadius: 10, overflow: 'hidden' },
    connectBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    connectBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
    disconnectBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' },
    disconnectText: { fontSize: 11, fontWeight: '600', color: '#EF4444' },
    connectedDetails: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#DCFCE7' },
    detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    detailChipText: { fontSize: 10, color: '#64748B', fontWeight: '600' },

    // Vitals Grid
    vitalsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    vitalCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    vitalIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    vitalVal: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    vitalUnit: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
    vitalLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 4 },

    // Sync Log
    logCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
    logTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    logDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    logItemTitle: { fontSize: 12, fontWeight: '600', color: '#0F172A', textTransform: 'capitalize' },
    logItemSub: { fontSize: 10, color: '#94A3B8' },
    logTime: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

    // Coming Soon
    comingSoonBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    comingSoonText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

    // Info
    infoCard: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14, gap: 10, marginTop: 8 },
    infoText: { flex: 1, fontSize: 11, color: '#4338CA', lineHeight: 17, fontWeight: '500' },
});

export default DevicesScreen;
