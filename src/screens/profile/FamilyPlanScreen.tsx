import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import client from '../../api/client';

const RELATIONSHIPS = ['spouse', 'child', 'parent', 'sibling', 'other'];

export default function FamilyPlanScreen() {
    const navigation = useNavigation<any>();
    const { currentPlan } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', relationship: 'spouse', gender: 'male', dateOfBirth: '' });

    const load = useCallback(() => {
        client.get('/api/users/family')
            .then(r => setMembers(r.data.data.familyProfiles || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleAdd = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            Alert.alert('Missing info', 'First and last name are required.');
            return;
        }
        setSaving(true);
        try {
            await client.post('/api/users/family', form);
            setShowAdd(false);
            setForm({ firstName: '', lastName: '', relationship: 'spouse', gender: 'male', dateOfBirth: '' });
            load();
        } catch (e: any) {
            Alert.alert('Failed', e?.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = (id: string, name: string) => {
        Alert.alert(`Remove ${name}?`, 'This will delete their profile.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/api/users/family/${id}`);
                        load();
                    } catch { Alert.alert('Error', 'Could not remove member.'); }
                }
            }
        ]);
    };

    const isFamilyPlan = currentPlan === 'family';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Family Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Plan gate */}
                {!isFamilyPlan && (
                    <View style={styles.gateCard}>
                        <Ionicons name="people-outline" size={36} color="#8B5CF6" />
                        <Text style={styles.gateTitle}>Family Plan</Text>
                        <Text style={styles.gateDesc}>
                            Add up to 4 family members under one account. Each member gets their own CVITAL score, assessment history, and wellness programs.
                        </Text>
                        <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
                            <Text style={styles.upgradeBtnText}>Upgrade to Family</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isFamilyPlan && (
                    <>
                        <View style={styles.infoBar}>
                            <Ionicons name="people-outline" size={16} color="#8B5CF6" />
                            <Text style={styles.infoText}>{members.length}/4 family members added</Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator color="#8B5CF6" style={{ marginTop: 32 }} />
                        ) : members.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="person-add-outline" size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No family members yet</Text>
                                <Text style={styles.emptySub}>Add up to 4 members to share health tracking</Text>
                            </View>
                        ) : (
                            members.map((m, i) => (
                                <View key={m._id || i} style={styles.memberCard}>
                                    <View style={styles.memberAvatar}>
                                        <Text style={styles.memberAvatarText}>{(m.firstName?.[0] || '?').toUpperCase()}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.memberName}>{m.firstName} {m.lastName}</Text>
                                        <Text style={styles.memberRel}>{m.relationship} · {m.gender}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemove(m._id, m.firstName)} style={styles.removeBtn}>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}

                        {members.length < 4 && (
                            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
                                <Ionicons name="person-add-outline" size={20} color="#8B5CF6" />
                                <Text style={styles.addBtnText}>Add Family Member</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Family Member</Text>
                        <TouchableOpacity onPress={() => setShowAdd(false)}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        {[
                            { label: 'First Name', key: 'firstName', placeholder: 'Jane' },
                            { label: 'Last Name', key: 'lastName', placeholder: 'Doe' },
                            { label: 'Date of Birth', key: 'dateOfBirth', placeholder: 'YYYY-MM-DD' },
                        ].map(({ label, key, placeholder }) => (
                            <View key={key} style={styles.field}>
                                <Text style={styles.fieldLabel}>{label}</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder={placeholder}
                                    placeholderTextColor="#94A3B8"
                                    value={(form as any)[key]}
                                    onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                                />
                            </View>
                        ))}

                        <Text style={styles.fieldLabel}>Relationship</Text>
                        <View style={styles.chipRow}>
                            {RELATIONSHIPS.map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.chip, form.relationship === r && styles.chipActive]}
                                    onPress={() => setForm(f => ({ ...f, relationship: r }))}
                                >
                                    <Text style={[styles.chipText, form.relationship === r && styles.chipTextActive]}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.fieldLabel}>Gender</Text>
                        <View style={styles.chipRow}>
                            {['male', 'female', 'other'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.chip, form.gender === g && styles.chipActive]}
                                    onPress={() => setForm(f => ({ ...f, gender: g }))}
                                >
                                    <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Member</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    back: { width: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    content: { padding: 16, paddingBottom: 48 },
    gateCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 32, gap: 12 },
    gateTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    gateDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
    upgradeBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8 },
    upgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    infoBar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    infoText: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyText: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
    emptySub: { fontSize: 13, color: '#CBD5E1', textAlign: 'center' },
    memberCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
    memberAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
    memberAvatarText: { fontSize: 18, fontWeight: '800', color: '#8B5CF6' },
    memberName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    memberRel: { fontSize: 13, color: '#64748B', marginTop: 2, textTransform: 'capitalize' },
    removeBtn: { padding: 6 },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE9FE', borderRadius: 14, paddingVertical: 14, gap: 8, marginTop: 8 },
    addBtnText: { fontSize: 15, fontWeight: '700', color: '#8B5CF6' },
    modal: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalBody: { padding: 20, paddingBottom: 40 },
    field: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    fieldInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    chipActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    chipTextActive: { color: '#fff' },
    saveBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
