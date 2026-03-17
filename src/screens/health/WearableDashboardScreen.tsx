import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WearableSDK } from '../../api/wearableSDK';
import SparklineChart from '../../components/SparklineChart'; // Custom SVG chart
import client from '../../api/client';

export default function WearableDashboardScreen({ navigation }: any) {
    const [devices, setDevices] = useState({ apple: false, fitbit: false, google: false, withings: false, boat: false });
    const [vitals, setVitals] = useState<any>({});
    const [logs, setLogs] = useState<any[]>([]);
    const [history, setHistory] = useState<any>({ hr: [], spo2: [] });

    useEffect(() => {
        // Fetch historical vitals on load
        client.get('/api/wearables/history').then(res => {
            if (res.data.data) {
                const hrData = res.data.data.filter((d: any) => d.vitalType === 'heart_rate').map((d: any) => d.value).reverse();
                const spo2Data = res.data.data.filter((d: any) => d.vitalType === 'spo2').map((d: any) => d.value).reverse();
                setHistory({ hr: hrData, spo2: spo2Data });
            }
        });
    }, []);

    // Simulated Real-Time Data Stream
    useEffect(() => {
        let interval: any;
        const isAnyConnected = devices.apple || devices.fitbit || devices.google || devices.boat;

        if (isAnyConnected) {
            interval = setInterval(() => {
                // Generate realistic fluctuations
                const newHr = Math.floor(65 + Math.random() * 15); // 65-80 bpm
                const newSpo2 = Math.floor(95 + Math.random() * 5); // 95-99%

                setVitals((prev: any) => ({ ...prev, heartRate: newHr, spo2: newSpo2 }));

                // Update history for sparklines
                setHistory((prev: any) => ({
                    hr: [...prev.hr.slice(-19), newHr], // keep last 20 points
                    spo2: [...prev.spo2.slice(-19), newSpo2]
                }));

                // Add occasional log
                if (Math.random() > 0.7) {
                    addLog('STREAM', `Live update: HR ${newHr} bpm, SpO2 ${newSpo2}%`);
                }
            }, 3000); // Update every 3 seconds
        }

        return () => clearInterval(interval);
    }, [devices]);

    const connectAppleHealth = async () => {
        if (Platform.OS !== 'ios') {
            Alert.alert('Unsupported', 'Apple Health is only available on iOS');
            return;
        }
        try {
            await WearableSDK.requestHealthKitPermissions();
            setDevices(prev => ({ ...prev, apple: true }));
            Alert.alert('Success', 'Apple HealthKit Linked! Telemetry background listener activated.');

            // Subscribe to live stream
            WearableSDK.subscribeToHealthKit((data) => {
                setVitals((prev: any) => ({ ...prev, ...data }));
                setLogs((prev) => [{ time: new Date().toLocaleTimeString(), src: 'APPLE', msg: `Sync: ${data.type} ${data.value}${data.unit}` }, ...prev].slice(0, 20));
            });
        } catch (error: any) {
            Alert.alert('Permission Denied', error.message);
        }
    };

    const addLog = (src: string, msg: string) => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), src, msg }, ...prev].slice(0, 20));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#e4e8f5" />
                </TouchableOpacity>
                <Text style={styles.title}>Live Monitoring</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Link Wearables</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceStrip}>

                    {/* Apple Watch */}
                    <TouchableOpacity style={[styles.deviceCard, devices.apple && styles.connectedCard]} onPress={connectAppleHealth}>
                        <View style={[styles.deviceIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <Text>⌚</Text>
                        </View>
                        <View>
                            <Text style={styles.deviceName}>Apple Watch</Text>
                            <Text style={[styles.deviceStatus, devices.apple && { color: '#10d98a' }]}>
                                {devices.apple ? 'Streaming live' : 'Series 1–10, SE'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Fitbit */}
                    <TouchableOpacity style={[styles.deviceCard, devices.fitbit && styles.connectedCard]} onPress={() => {
                        Alert.alert('Fitbit OAuth', 'Redirecting to fitbit.com to authorize...', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Simulate Auth', onPress: () => {
                                    setDevices(prev => ({ ...prev, fitbit: true }));
                                    addLog('FITBIT', 'OAuth token received. Syncing history...');
                                }
                            }
                        ]);
                    }}>
                        <View style={[styles.deviceIcon, { backgroundColor: 'rgba(0,179,136,0.1)' }]}>
                            <Text>📟</Text>
                        </View>
                        <View>
                            <Text style={styles.deviceName}>Fitbit</Text>
                            <Text style={styles.deviceStatus}>{devices.fitbit ? 'Connected & syncing' : 'Charge, Sense, Versa'}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Google Fit */}
                    <TouchableOpacity style={[styles.deviceCard, devices.google && styles.connectedCard]} onPress={() => {
                        Alert.alert('Google Fit Auth', 'Redirecting to Google to authorize data access...', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Connect', onPress: async () => {
                                    try {
                                        const res = await client.get('/api/wearables/oauth/googlefit/login');
                                        if (res.data.url) {
                                            Linking.openURL(res.data.url);
                                            // Optimistically set UI connected since the callback handles the backend success
                                            setDevices(prev => ({ ...prev, google: true }));
                                            addLog('GOOGLE', 'Redirecting to browser for OAuth...');
                                        }
                                    } catch (err) {
                                        Alert.alert('Error', 'Could not reach backend for Google Auth');
                                        console.error(err);
                                    }
                                }
                            }
                        ]);
                    }}>
                        <View style={[styles.deviceIcon, { backgroundColor: 'rgba(66,133,244,0.1)' }]}>
                            <Text>🏃</Text>
                        </View>
                        <View>
                            <Text style={styles.deviceName}>Google Fit</Text>
                            <Text style={styles.deviceStatus}>{devices.google ? 'Connected & syncing' : 'Android Sources'}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* boAt Watch */}
                    <TouchableOpacity style={[styles.deviceCard, devices.boat && styles.connectedCard]} onPress={() => {
                        Alert.alert(
                            'boAt Integration',
                            'Please ensure your watch is paired with the boAt Crest app and "Sync to Google Fit / Apple Health" is enabled in its settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Connect via ' + (Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'),
                                    onPress: () => {
                                        setDevices(prev => ({ ...prev, boat: true }));
                                        Platform.OS === 'ios' ? connectAppleHealth() : Alert.alert('OAuth Proxy', 'Redirecting to Google Fit OAuth');
                                    }
                                }
                            ]
                        );
                    }}>
                        <View style={[styles.deviceIcon, { backgroundColor: 'rgba(235,50,35,0.1)' }]}>
                            <Text>🛥️</Text>
                        </View>
                        <View>
                            <Text style={styles.deviceName}>boAt Watch</Text>
                            <Text style={styles.deviceStatus}>Via Health/Fit Sync</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Vitals Stream</Text>
                <View style={styles.vitalGrid}>
                    <View style={styles.vitalCard}>
                        <View style={styles.vitalHeader}>
                            <Text style={styles.vitalLabel}>Heart Rate</Text>
                            <Text style={styles.unitText}>bpm</Text>
                        </View>
                        <Text style={styles.vitalValue}>{vitals.heartRate ? Math.round(vitals.heartRate) : '—'}</Text>
                        <View style={styles.sparkContainer}>
                            <SparklineChart data={history.hr.length ? history.hr : [0, 0, 0]} color="#10d98a" />
                        </View>
                    </View>

                    <View style={styles.vitalCard}>
                        <View style={styles.vitalHeader}>
                            <Text style={styles.vitalLabel}>SpO2</Text>
                            <Text style={styles.unitText}>%</Text>
                        </View>
                        <Text style={styles.vitalValue}>{vitals.spo2 ? Math.round(vitals.spo2) : '—'}</Text>
                        <View style={styles.sparkContainer}>
                            <SparklineChart data={history.spo2.length ? history.spo2 : [0, 0, 0]} color="#4f8ef0" />
                        </View>
                    </View>
                </View>

                {/* Event Log */}
                <View style={styles.logCard}>
                    <Text style={styles.logTitle}>Live Event Log</Text>
                    {logs.map((log, i) => (
                        <View key={i} style={styles.logRow}>
                            <Text style={styles.logTime}>{log.time}</Text>
                            <View style={styles.logSrcBadge}>
                                <Text style={styles.logSrcText}>{log.src}</Text>
                            </View>
                            <Text style={styles.logMsg} numberOfLines={1}>{log.msg}</Text>
                        </View>
                    ))}
                    {logs.length === 0 && <Text style={styles.logMsg}>No events yet. Connect a device.</Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#060810' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    title: { fontSize: 18, color: '#e4e8f5', fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#5b6380', textTransform: 'uppercase', letterSpacing: 1 },
    deviceStrip: { flexDirection: 'row', marginTop: 12 },
    deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginRight: 12, width: 220 },
    connectedCard: { borderColor: 'rgba(16,217,138,0.3)', backgroundColor: 'rgba(16,217,138,0.04)' },
    deviceIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    deviceName: { fontSize: 14, fontWeight: '600', color: '#e4e8f5' },
    deviceStatus: { fontSize: 12, color: '#5b6380' },
    vitalGrid: { flexDirection: 'row', gap: 14 },
    vitalCard: { flex: 1, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 },
    vitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    vitalLabel: { fontSize: 12, color: '#5b6380', fontWeight: '600', textTransform: 'uppercase' },
    unitText: { fontSize: 12, color: '#5b6380' },
    vitalValue: { fontSize: 42, color: '#e4e8f5', fontWeight: 'bold' },
    sparkContainer: { height: 40, marginTop: 10, overflow: 'hidden' },
    logCard: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginTop: 24, minHeight: 200 },
    logTitle: { fontSize: 12, color: '#5b6380', fontWeight: '600', textTransform: 'uppercase', marginBottom: 12 },
    logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111520', padding: 8, borderRadius: 8, marginBottom: 4 },
    logTime: { color: '#5b6380', fontSize: 12, width: 70 },
    logSrcBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
    logSrcText: { color: '#e4e8f5', fontSize: 10, fontWeight: 'bold' },
    logMsg: { color: '#e4e8f5', fontSize: 12, flex: 1 },
});
