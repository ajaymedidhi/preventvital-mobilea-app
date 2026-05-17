import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

const MEDS_PRESETS = ['Metformin', 'Atorvastatin', 'Amlodipine', 'Aspirin', 'Lisinopril', 'Other'];

export default function ManualVitalsEntryScreen() {
    const navigation = useNavigation<any>();

    // Vitals
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [glucose, setGlucose] = useState('');
    const [weight, setWeight] = useState('');
    const [spo2, setSpo2] = useState('');

    // Medications
    const [medName, setMedName] = useState('');
    const [medDosage, setMedDosage] = useState('');
    const [medTaken, setMedTaken] = useState(true);
    const [medLogs, setMedLogs] = useState<any[]>([]);
    const [loadingMeds, setLoadingMeds] = useState(true);

    const [savingVitals, setSavingVitals] = useState(false);
    const [savingMed, setSavingMed] = useState(false);

    useFocusEffect(useCallback(() => {
        client.get('/api/vitals/medications')
            .then(r => setMedLogs(r.data.data.medications || []))
            .catch(() => {})
            .finally(() => setLoadingMeds(false));
    }, []));

    const handleSaveVitals = async () => {
        const hasAny = systolic || heartRate || glucose || spo2 || weight;
        if (!hasAny) { Alert.alert('Nothing to save', 'Enter at least one value.'); return; }

        const payload: any = {};
        if (systolic && diastolic) payload.bloodPressure = { systolic: Number(systolic), diastolic: Number(diastolic) };
        if (heartRate) payload.heartRate = Number(heartRate);
        if (glucose) payload.glucose = Number(glucose);
        if (spo2) payload.spo2 = Number(spo2);
        if (weight) payload.weight = Number(weight);

        setSavingVitals(true);
        try {
            await client.post('/api/vitals', payload);
            Alert.alert('Saved!', 'Vitals logged successfully.');
            setSystolic(''); setDiastolic(''); setHeartRate(''); setGlucose(''); setSpo2(''); setWeight('');
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not save vitals.');
        } finally {
            setSavingVitals(false);
        }
    };

    const handleLogMed = async () => {
        if (!medName.trim()) { Alert.alert('Name required', 'Enter the medication name.'); return; }
        setSavingMed(true);
        try {
            await client.post('/api/vitals/medications', { name: medName, dosage: medDosage, taken: medTaken });
            setMedLogs(prev => [{ name: medName, dosage: medDosage, taken: medTaken, loggedAt: new Date().toISOString() }, ...prev]);
            setMedName(''); setMedDosage('');
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not log medication.');
        } finally {
            setSavingMed(false);
        }
    };

    const VitalInput = ({ label, value, setter, unit, placeholder }: any) => (
        <View style={styles.vitalRow}>
            <Text style={styles.vitalLabel}>{label}</Text>
            <View style={styles.vitalInputWrap}>
                <TextInput
                    style={styles.vitalInput}
                    value={value}
                    onChangeText={setter}
                    keyboardType="numeric"
                    placeholder={placeholder || '—'}
                    placeholderTextColor="#CBD5E1"
                />
                <Text style={styles.vitalUnit}>{unit}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Vitals & Medications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Manual Vitals */}
                <Text style={styles.sectionTitle}>Daily Vitals</Text>
                <View style={styles.card}>
                    <View style={styles.bpRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vitalLabel}>Systolic</Text>
                            <View style={styles.vitalInputWrap}>
                                <TextInput style={styles.vitalInput} value={systolic} onChangeText={setSystolic} keyboardType="numeric" placeholder="120" placeholderTextColor="#CBD5E1" />
                                <Text style={styles.vitalUnit}>mmHg</Text>
                            </View>
                        </View>
                        <Text style={styles.bpSlash}>/</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vitalLabel}>Diastolic</Text>
                            <View style={styles.vitalInputWrap}>
                                <TextInput style={styles.vitalInput} value={diastolic} onChangeText={setDiastolic} keyboardType="numeric" placeholder="80" placeholderTextColor="#CBD5E1" />
                                <Text style={styles.vitalUnit}>mmHg</Text>
                            </View>
                        </View>
                    </View>
                    <VitalInput label="Heart Rate" value={heartRate} setter={setHeartRate} unit="bpm" placeholder="72" />
                    <VitalInput label="Blood Glucose" value={glucose} setter={setGlucose} unit="mg/dL" placeholder="100" />
                    <VitalInput label="SpO₂" value={spo2} setter={setSpo2} unit="%" placeholder="98" />
                    <VitalInput label="Weight" value={weight} setter={setWeight} unit="kg" placeholder="70" />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveVitals} disabled={savingVitals}>
                        {savingVitals
                            ? <ActivityIndicator color="#fff" />
                            : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Save Vitals</Text></>
                        }
                    </TouchableOpacity>
                </View>

                {/* Medications */}
                <Text style={styles.sectionTitle}>Medication Log</Text>
                <View style={styles.card}>
                    <Text style={styles.fieldLabel}>Medication Name</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        {MEDS_PRESETS.map(m => (
                            <TouchableOpacity key={m} style={[styles.presetChip, medName === m && styles.presetChipActive]} onPress={() => setMedName(m)}>
                                <Text style={[styles.presetText, medName === m && styles.presetTextActive]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TextInput
                        style={styles.fieldInput}
                        placeholder="Or type a medication name"
                        placeholderTextColor="#94A3B8"
                        value={medName}
                        onChangeText={setMedName}
                    />
                    <TextInput
                        style={[styles.fieldInput, { marginTop: 8 }]}
                        placeholder="Dosage (e.g. 500mg)"
                        placeholderTextColor="#94A3B8"
                        value={medDosage}
                        onChangeText={setMedDosage}
                    />
                    <View style={styles.takenRow}>
                        <Text style={styles.takenLabel}>Taken today</Text>
                        <Switch
                            value={medTaken}
                            onValueChange={setMedTaken}
                            trackColor={{ false: '#E2E8F0', true: '#22C55E' }}
                            thumbColor="#fff"
                        />
                    </View>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#10B981' }]} onPress={handleLogMed} disabled={savingMed}>
                        {savingMed
                            ? <ActivityIndicator color="#fff" />
                            : <><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Log Medication</Text></>
                        }
                    </TouchableOpacity>
                </View>

                {/* Recent medication logs */}
                {!loadingMeds && medLogs.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Logs</Text>
                        {medLogs.slice(0, 10).map((m, i) => (
                            <View key={i} style={styles.logRow}>
                                <View style={[styles.logDot, { backgroundColor: m.taken ? '#22C55E' : '#EF4444' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logName}>{m.name}{m.dosage ? ` · ${m.dosage}` : ''}</Text>
                                    <Text style={styles.logDate}>{new Date(m.loggedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <Text style={[styles.logStatus, { color: m.taken ? '#22C55E' : '#EF4444' }]}>
                                    {m.taken ? 'Taken' : 'Missed'}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    back: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
    content: { padding: 16, paddingBottom: 48 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    bpRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
    bpSlash: { fontSize: 24, color: '#CBD5E1', marginBottom: 8 },
    vitalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    vitalLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
    vitalInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    vitalInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 15, color: '#1E293B', width: 80, textAlign: 'right' },
    vitalUnit: { fontSize: 12, color: '#64748B', width: 44 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 13, marginTop: 16, gap: 8 },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    fieldInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1E293B' },
    presetChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 6, backgroundColor: '#F8FAFC' },
    presetChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
    presetText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    presetTextActive: { color: '#fff' },
    takenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
    takenLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
    logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 10 },
    logDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    logName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    logDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    logStatus: { fontSize: 12, fontWeight: '700' },
});
