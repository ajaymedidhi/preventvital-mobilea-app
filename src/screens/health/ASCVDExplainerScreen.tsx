import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

// Pooled Cohort Equations (simplified 10-year ASCVD estimation)
function estimateASCVD(params: {
    age: number; totalChol: number; hdl: number;
    sbp: number; onBPMeds: boolean; smoker: boolean; diabetic: boolean; sex: 'male' | 'female';
}): number {
    const { age, totalChol, hdl, sbp, onBPMeds, smoker, diabetic, sex } = params;
    let lnAge = Math.log(age);
    let lnTC = Math.log(totalChol);
    let lnHDL = Math.log(hdl);
    let lnSBP = Math.log(sbp);

    let score: number;
    if (sex === 'male') {
        score = 12.344 * lnAge + 11.853 * lnTC - 2.664 * lnAge * lnTC
            - 7.990 * lnHDL + 1.769 * lnAge * lnHDL
            + (onBPMeds ? 1.797 : 1.764) * lnSBP
            + (smoker ? 7.837 - 1.795 * lnAge : 0)
            + (diabetic ? 0.661 : 0)
            - 61.18;
        const s10 = 0.9144;
        return Math.round((1 - Math.pow(s10, Math.exp(score))) * 100 * 10) / 10;
    } else {
        score = -29.799 * lnAge + 4.884 * lnAge * lnAge + 13.540 * lnTC
            - 3.114 * lnAge * lnTC - 13.578 * lnHDL + 3.149 * lnAge * lnHDL
            + (onBPMeds ? 2.019 : 1.957) * lnSBP
            + (smoker ? 7.574 - 1.665 * lnAge : 0)
            + (diabetic ? 0.661 : 0)
            - 29.799;
        const s10 = 0.9665;
        return Math.round((1 - Math.pow(s10, Math.exp(score))) * 100 * 10) / 10;
    }
}

const RISK_COLOR = (r: number) => r < 5 ? '#22C55E' : r < 7.5 ? '#84CC16' : r < 10 ? '#F59E0B' : '#EF4444';
const RISK_LABEL = (r: number) => r < 5 ? 'Low' : r < 7.5 ? 'Borderline' : r < 10 ? 'Intermediate' : 'High';

const InputRow = ({ label, value, onChangeText, unit, numeric = true }: any) => (
    <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrap}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                keyboardType={numeric ? 'numeric' : 'default'}
                placeholderTextColor="#94A3B8"
            />
            {unit ? <Text style={styles.inputUnit}>{unit}</Text> : null}
        </View>
    </View>
);

export default function ASCVDExplainerScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const initialASCVD = route.params?.ascvdScore || 0;

    const [age, setAge] = useState('55');
    const [tc, setTc] = useState('200');
    const [hdl, setHdl] = useState('50');
    const [sbp, setSbp] = useState('130');
    const [onBPMeds, setOnBPMeds] = useState(false);
    const [smoker, setSmoker] = useState(false);
    const [diabetic, setDiabetic] = useState(false);
    const [sex, setSex] = useState<'male' | 'female'>('male');

    const risk = (() => {
        try {
            const r = estimateASCVD({
                age: Number(age) || 55,
                totalChol: Number(tc) || 200,
                hdl: Number(hdl) || 50,
                sbp: Number(sbp) || 130,
                onBPMeds, smoker, diabetic, sex,
            });
            return Math.min(Math.max(r, 0), 100);
        } catch { return initialASCVD; }
    })();

    const lowerLDL20Risk = (() => {
        try {
            const newTC = Math.max(Number(tc) - 20, 100);
            const r = estimateASCVD({
                age: Number(age) || 55, totalChol: newTC,
                hdl: Number(hdl) || 50, sbp: Number(sbp) || 130,
                onBPMeds, smoker, diabetic, sex,
            });
            return Math.min(Math.max(r, 0), 100);
        } catch { return 0; }
    })();

    const riskColor = RISK_COLOR(risk);
    const riskLabel = RISK_LABEL(risk);
    const barWidth = Math.min(risk, 100);

    const FACTORS = [
        { label: 'Age', impact: 'High', desc: 'Risk doubles roughly every 5 years after 50', icon: 'time-outline' },
        { label: 'Total Cholesterol', impact: 'High', desc: 'LDL deposits in arterial walls driving plaque', icon: 'water-outline' },
        { label: 'HDL (Good Cholesterol)', impact: 'Protective', desc: 'Higher HDL removes cholesterol from arteries', icon: 'shield-checkmark-outline' },
        { label: 'Systolic Blood Pressure', impact: 'High', desc: 'Hypertension strains vessel walls and accelerates plaque', icon: 'pulse-outline' },
        { label: 'Smoking', impact: smoker ? 'High' : 'None', desc: 'Smoking damages vessel lining and doubles ASCVD risk', icon: 'ban-outline' },
        { label: 'Diabetes', impact: diabetic ? 'High' : 'None', desc: 'Insulin resistance promotes inflammation and plaque formation', icon: 'medical-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ASCVD Risk Explainer</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Risk gauge */}
                <View style={styles.riskCard}>
                    <Text style={styles.riskCardTitle}>10-Year Cardiovascular Risk</Text>
                    <View style={styles.riskValueRow}>
                        <Text style={[styles.riskValue, { color: riskColor }]}>{risk.toFixed(1)}%</Text>
                        <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                            <Text style={[styles.riskBadgeText, { color: riskColor }]}>{riskLabel}</Text>
                        </View>
                    </View>
                    <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: riskColor }]} />
                    </View>
                    <View style={styles.barLabels}>
                        <Text style={styles.barLabel}>0%</Text>
                        <Text style={[styles.barLabel, { color: '#22C55E' }]}>Low &lt;5%</Text>
                        <Text style={[styles.barLabel, { color: '#F59E0B' }]}>Intermediate 7.5–10%</Text>
                        <Text style={[styles.barLabel, { color: '#EF4444' }]}>High &gt;10%</Text>
                    </View>
                </View>

                {/* What-if scenario */}
                {lowerLDL20Risk < risk - 0.5 && (
                    <View style={styles.scenarioCard}>
                        <Ionicons name="bulb-outline" size={20} color="#6366F1" />
                        <Text style={styles.scenarioText}>
                            If you reduce total cholesterol by 20 mg/dL, your risk drops from{' '}
                            <Text style={{ fontWeight: '800', color: '#EF4444' }}>{risk.toFixed(1)}%</Text>
                            {' → '}
                            <Text style={{ fontWeight: '800', color: '#22C55E' }}>{lowerLDL20Risk.toFixed(1)}%</Text>
                        </Text>
                    </View>
                )}

                {/* Interactive inputs */}
                <Text style={styles.sectionLabel}>Adjust Your Inputs</Text>

                <View style={styles.card}>
                    <View style={styles.sexRow}>
                        {(['male', 'female'] as const).map(s => (
                            <TouchableOpacity key={s} style={[styles.sexChip, sex === s && styles.sexChipActive]} onPress={() => setSex(s)}>
                                <Text style={[styles.sexChipText, sex === s && styles.sexChipTextActive]}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <InputRow label="Age" value={age} onChangeText={setAge} unit="yrs" />
                    <InputRow label="Total Cholesterol" value={tc} onChangeText={setTc} unit="mg/dL" />
                    <InputRow label="HDL Cholesterol" value={hdl} onChangeText={setHdl} unit="mg/dL" />
                    <InputRow label="Systolic BP" value={sbp} onChangeText={setSbp} unit="mmHg" />

                    {[
                        { label: 'On BP Medications', value: onBPMeds, setter: setOnBPMeds },
                        { label: 'Current Smoker', value: smoker, setter: setSmoker },
                        { label: 'Diabetic', value: diabetic, setter: setDiabetic },
                    ].map(({ label, value, setter }) => (
                        <TouchableOpacity key={label} style={styles.toggleRow} onPress={() => setter(!value)}>
                            <Text style={styles.toggleLabel}>{label}</Text>
                            <View style={[styles.toggle, value && styles.toggleOn]}>
                                <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Risk factor explanations */}
                <Text style={styles.sectionLabel}>What Drives Your Risk</Text>
                {FACTORS.map((f, i) => (
                    <View key={i} style={styles.factorCard}>
                        <View style={[styles.factorIcon, { backgroundColor: f.impact === 'Protective' ? '#ECFDF5' : f.impact === 'None' ? '#F8FAFC' : '#FEF2F2' }]}>
                            <Ionicons name={f.icon as any} size={18} color={f.impact === 'Protective' ? '#10B981' : f.impact === 'None' ? '#94A3B8' : '#EF4444'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.factorTitleRow}>
                                <Text style={styles.factorLabel}>{f.label}</Text>
                                <Text style={[styles.impactBadge, {
                                    color: f.impact === 'Protective' ? '#059669' : f.impact === 'None' ? '#94A3B8' : '#DC2626',
                                    backgroundColor: f.impact === 'Protective' ? '#ECFDF5' : f.impact === 'None' ? '#F1F5F9' : '#FEF2F2',
                                }]}>{f.impact}</Text>
                            </View>
                            <Text style={styles.factorDesc}>{f.desc}</Text>
                        </View>
                    </View>
                ))}
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
    riskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    riskCardTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    riskValueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    riskValue: { fontSize: 48, fontWeight: '800' },
    riskBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    riskBadgeText: { fontSize: 14, fontWeight: '700' },
    barBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
    barFill: { height: '100%', borderRadius: 5 },
    barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    barLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },
    scenarioCard: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    scenarioText: { flex: 1, fontSize: 14, color: '#3730A3', lineHeight: 20 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
    sexRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    sexChip: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8FAFC' },
    sexChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    sexChipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    sexChipTextActive: { color: '#fff' },
    inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    inputLabel: { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: '#1E293B', width: 80, textAlign: 'right' },
    inputUnit: { fontSize: 12, color: '#64748B', width: 48 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    toggleLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
    toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', padding: 2 },
    toggleOn: { backgroundColor: '#6366F1' },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    toggleThumbOn: { transform: [{ translateX: 20 }] },
    factorCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    factorIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    factorTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    factorLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1 },
    impactBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    factorDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
});
