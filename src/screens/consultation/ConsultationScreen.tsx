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

const SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const PLAN_LIMITS: Record<string, number> = {
    free: 0, premium: 1, pro: 3, family: 99,
};

function getNextDates(count: number): Date[] {
    const dates: Date[] = [];
    let d = new Date();
    d.setDate(d.getDate() + 1);
    while (dates.length < count) {
        if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return dates;
}

export default function ConsultationScreen() {
    const navigation = useNavigation<any>();
    const { user, currentPlan } = useAuth();
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const dates = getNextDates(7);
    const limit = PLAN_LIMITS[currentPlan] || 0;

    useFocusEffect(useCallback(() => {
        client.get('/api/users/my-consultations')
            .then(r => setConsultations(r.data.data.consultations || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []));

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) {
            Alert.alert('Select date & time', 'Please pick a date and a time slot.');
            return;
        }
        const [time, period] = selectedSlot.split(' ');
        const [h, m] = time.split(':').map(Number);
        const hour = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h);
        const dt = new Date(selectedDate);
        dt.setHours(hour, m, 0, 0);

        setBooking(true);
        try {
            await client.post('/api/users/consultations', {
                date: dt.toISOString(),
                type: 'video',
                notes,
            });
            Alert.alert('Consultation Booked!', `Your slot on ${dt.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at ${selectedSlot} has been confirmed. A doctor will be assigned shortly.`);
            setShowBooking(false);
            setSelectedDate(null);
            setSelectedSlot(null);
            setNotes('');
            // Refresh list
            const r = await client.get('/api/users/my-consultations');
            setConsultations(r.data.data.consultations || []);
        } catch (e: any) {
            Alert.alert('Booking failed', e?.response?.data?.message || 'Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const statusColor = (s: string) => {
        if (s === 'scheduled') return '#3B82F6';
        if (s === 'completed') return '#22C55E';
        if (s === 'cancelled') return '#EF4444';
        return '#94A3B8';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Doctor Consultations</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Plan quota card */}
                <View style={styles.quotaCard}>
                    <View style={styles.quotaLeft}>
                        <Text style={styles.quotaTitle}>Your Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Text>
                        <Text style={styles.quotaSub}>
                            {limit === 0
                                ? 'Upgrade to Premium to book consultations'
                                : limit === 99
                                ? 'Unlimited consultations per month'
                                : `${limit} consultation${limit > 1 ? 's' : ''} per month`}
                        </Text>
                    </View>
                    <Ionicons name="medical-outline" size={28} color="#6366F1" />
                </View>

                {/* Book CTA */}
                {limit === 0 ? (
                    <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
                        <Ionicons name="lock-closed" size={18} color="#D97706" />
                        <Text style={styles.upgradeBtnText}>Upgrade to book consultations</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.bookBtn} onPress={() => setShowBooking(true)}>
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <Text style={styles.bookBtnText}>Book a Consultation</Text>
                    </TouchableOpacity>
                )}

                {/* Past consultations */}
                <Text style={styles.sectionTitle}>Your Consultations</Text>
                {loading ? (
                    <ActivityIndicator color="#6366F1" style={{ marginTop: 24 }} />
                ) : consultations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="videocam-outline" size={40} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No consultations yet</Text>
                    </View>
                ) : (
                    consultations.map((c, i) => (
                        <View key={i} style={styles.consultCard}>
                            <View style={styles.consultLeft}>
                                <Text style={styles.consultDate}>
                                    {new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                <Text style={styles.consultTime}>
                                    {new Date(c.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                {c.notes ? <Text style={styles.consultNotes}>{c.notes}</Text> : null}
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor(c.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: statusColor(c.status) }]}>
                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Booking Modal */}
            <Modal visible={showBooking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBooking(false)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Book Consultation</Text>
                        <TouchableOpacity onPress={() => setShowBooking(false)}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        <Text style={styles.pickerLabel}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
                            {dates.map((d, i) => {
                                const isSelected = selectedDate?.toDateString() === d.toDateString();
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.dateChip, isSelected && styles.dateChipActive]}
                                        onPress={() => setSelectedDate(d)}
                                    >
                                        <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextActive]}>
                                            {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                                        </Text>
                                        <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextActive]}>
                                            {d.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={styles.pickerLabel}>Select Time</Text>
                        <View style={styles.slotsGrid}>
                            {SLOTS.map(s => {
                                const isSelected = selectedSlot === s;
                                return (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.slotChip, isSelected && styles.slotChipActive]}
                                        onPress={() => setSelectedSlot(s)}
                                    >
                                        <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>{s}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.pickerLabel}>Notes for Doctor (optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            multiline
                            numberOfLines={3}
                            placeholder="Describe your concern or symptoms…"
                            placeholderTextColor="#94A3B8"
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <TouchableOpacity
                            style={[styles.confirmBtn, (!selectedDate || !selectedSlot) && styles.confirmBtnDisabled]}
                            onPress={handleBook}
                            disabled={booking || !selectedDate || !selectedSlot}
                        >
                            {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
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
    content: { padding: 16, paddingBottom: 40 },
    quotaCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    quotaLeft: { flex: 1 },
    quotaTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    quotaSub: { fontSize: 13, color: '#64748B', marginTop: 3 },
    bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 14, gap: 8, marginBottom: 20 },
    bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    upgradeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBEB', borderRadius: 14, paddingVertical: 14, gap: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
    upgradeBtnText: { fontSize: 15, fontWeight: '600', color: '#92400E' },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    emptyText: { fontSize: 14, color: '#94A3B8' },
    consultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    consultLeft: { flex: 1 },
    consultDate: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    consultTime: { fontSize: 13, color: '#64748B', marginTop: 2 },
    consultNotes: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '700' },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalBody: { padding: 20, paddingBottom: 40 },
    pickerLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },
    dateRow: { marginBottom: 4 },
    dateChip: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 8, backgroundColor: '#F8FAFC' },
    dateChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    dateChipDay: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    dateChipNum: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 2 },
    dateChipTextActive: { color: '#fff' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slotChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    slotChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    slotText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    slotTextActive: { color: '#fff' },
    notesInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, color: '#1E293B', textAlignVertical: 'top', minHeight: 80 },
    confirmBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
    confirmBtnDisabled: { opacity: 0.5 },
    confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
