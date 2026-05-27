import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Alert, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { Colors, Gradients } from '../../theme/colors';
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />

            {/* Gradient Header */}
            <LinearGradient colors={Gradients.brandFade} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} locations={[0, 0.55, 1]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Doctor Consultations</Text>
                            <Text style={styles.headerSub}>Book & manage your health visits</Text>
                        </View>
                        <View style={styles.headerMedIcon}>
                            <Ionicons name="medical-outline" size={20} color="#FFF" />
                        </View>
                    </View>

                    {/* Plan quota inline */}
                    <View style={styles.quotaBanner}>
                        <View style={[styles.quotaDot, { backgroundColor: limit === 0 ? '#FCD34D' : '#4ADE80' }]} />
                        <Text style={styles.quotaBannerText}>
                            {limit === 0
                                ? `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan · Upgrade to book`
                                : limit === 99
                                ? 'Family plan · Unlimited consultations'
                                : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan · ${limit} consultation${limit > 1 ? 's' : ''}/month`}
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Book CTA */}
                {limit === 0 ? (
                    <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
                        <View style={styles.upgradeBtnIcon}>
                            <Ionicons name="lock-closed" size={16} color="#D97706" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.upgradeBtnTitle}>Unlock Consultations</Text>
                            <Text style={styles.upgradeBtnSub}>Upgrade to Premium or above</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#D97706" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.bookBtnWrap} onPress={() => setShowBooking(true)} activeOpacity={0.88}>
                        <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bookBtn}>
                            <Ionicons name="calendar-outline" size={20} color="#fff" />
                            <Text style={styles.bookBtnText}>Book a Consultation</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Past consultations */}
                <Text style={styles.sectionTitle}>Your Consultations</Text>
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator color={Colors.gradientStart} size="large" />
                        <Text style={styles.loadingText}>Loading consultations…</Text>
                    </View>
                ) : consultations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="videocam-outline" size={36} color={Colors.gradientStart} />
                        </View>
                        <Text style={styles.emptyTitle}>No consultations yet</Text>
                        <Text style={styles.emptyText}>
                            {limit === 0
                                ? 'Upgrade your plan to book video consultations with certified doctors.'
                                : 'Book your first consultation. A doctor will be assigned to your slot.'}
                        </Text>
                    </View>
                ) : (
                    consultations.map((c, i) => (
                        <View key={i} style={styles.consultCard}>
                            <View style={[styles.consultIconWrap, { backgroundColor: statusColor(c.status) + '18' }]}>
                                <Ionicons
                                    name={c.status === 'completed' ? 'checkmark-circle' : c.status === 'cancelled' ? 'close-circle' : 'videocam'}
                                    size={22}
                                    color={statusColor(c.status)}
                                />
                            </View>
                            <View style={styles.consultLeft}>
                                <Text style={styles.consultDate}>
                                    {new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                                <Text style={styles.consultTime}>
                                    {new Date(c.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                {c.notes ? <Text style={styles.consultNotes} numberOfLines={1}>{c.notes}</Text> : null}
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor(c.status) + '18' }]}>
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
                        <TouchableOpacity onPress={() => setShowBooking(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={20} color="#64748B" />
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
                            onPress={handleBook}
                            disabled={booking || !selectedDate || !selectedSlot}
                            activeOpacity={0.88}
                        >
                            <LinearGradient
                                colors={selectedDate && selectedSlot ? Gradients.brand : ['#E2E8F0', '#E2E8F0']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.confirmBtn}
                            >
                                {booking ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                        <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: { paddingBottom: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 12, marginBottom: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 12, color: '#C7D2FE', fontWeight: '500', marginTop: 2 },
    headerMedIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    quotaBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    quotaDot: { width: 8, height: 8, borderRadius: 4 },
    quotaBannerText: { fontSize: 12, color: '#FFF', fontWeight: '600' },

    content: { padding: 16, paddingBottom: 40 },

    // Book / Upgrade CTAs
    bookBtnWrap: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
    bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    upgradeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A', gap: 10 },
    upgradeBtnIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
    upgradeBtnTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
    upgradeBtnSub: { fontSize: 12, color: '#B45309', marginTop: 1 },

    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },

    // Loading / Empty
    loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    loadingText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
    emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 19 },

    // Consultation cards
    consultCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1,
    },
    consultIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    consultLeft: { flex: 1 },
    consultDate: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    consultTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
    consultNotes: { fontSize: 11, color: '#94A3B8', marginTop: 3, fontStyle: 'italic' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700' },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    modalBody: { padding: 20, paddingBottom: 40 },
    pickerLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
    dateRow: { marginBottom: 4 },
    dateChip: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 8, backgroundColor: '#F8FAFC' },
    dateChipActive: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
    dateChipDay: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    dateChipNum: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 2 },
    dateChipTextActive: { color: '#fff' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slotChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    slotChipActive: { backgroundColor: Colors.gradientStart, borderColor: Colors.gradientStart },
    slotText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    slotTextActive: { color: '#fff' },
    notesInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, color: '#1E293B', textAlignVertical: 'top', minHeight: 80 },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16, marginTop: 24 },
    confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
