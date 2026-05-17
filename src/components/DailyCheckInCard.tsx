import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const MOODS = [
    { value: 1, emoji: '😞', label: 'Rough' },
    { value: 2, emoji: '😐', label: 'Meh' },
    { value: 3, emoji: '🙂', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Great' },
];

interface Props {
    onCheckInDone?: (streak: number, isMilestone: boolean) => void;
}

export default function DailyCheckInCard({ onCheckInDone }: Props) {
    const [streak, setStreak] = useState(0);
    const [checkedInToday, setCheckedInToday] = useState(false);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [milestoneMsg, setMilestoneMsg] = useState('');
    const scaleAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        client.get('/api/users/streak')
            .then(r => {
                setStreak(r.data.data.streak);
                setCheckedInToday(r.data.data.checkedInToday);
            })
            .catch(() => {});
    }, []);

    const handleCheckIn = async (mood: number) => {
        if (loading || checkedInToday) return;
        setSelectedMood(mood);
        setLoading(true);
        try {
            const r = await client.post('/api/users/checkin', { mood });
            const { streak: newStreak, isMilestone, alreadyCheckedIn } = r.data.data;
            setStreak(newStreak);
            setCheckedInToday(true);

            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();

            if (isMilestone && !alreadyCheckedIn) {
                setMilestoneMsg(`🎉 ${newStreak}-day milestone!`);
            }
            onCheckInDone?.(newStreak, isMilestone);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Daily Check-In</Text>
                    <Text style={styles.sub}>How are you feeling today?</Text>
                </View>
                <Animated.View style={[styles.streakBadge, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="flame" size={14} color="#F97316" />
                    <Text style={styles.streakNum}>{streak}</Text>
                </Animated.View>
            </View>

            {checkedInToday ? (
                <View style={styles.doneRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                    <Text style={styles.doneText}>
                        {milestoneMsg || `Checked in · ${streak}-day streak`}
                    </Text>
                </View>
            ) : (
                <View style={styles.moodRow}>
                    {MOODS.map(m => (
                        <TouchableOpacity
                            key={m.value}
                            style={[styles.moodBtn, selectedMood === m.value && styles.moodBtnActive]}
                            onPress={() => handleCheckIn(m.value)}
                            disabled={loading}
                        >
                            <Text style={styles.moodEmoji}>{m.emoji}</Text>
                            <Text style={styles.moodLabel}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    sub: { fontSize: 12, color: '#64748b', marginTop: 2 },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    streakNum: { fontSize: 14, fontWeight: '700', color: '#F97316' },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
    moodBtn: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 2,
    },
    moodBtnActive: { backgroundColor: '#EFF6FF' },
    moodEmoji: { fontSize: 22 },
    moodLabel: { fontSize: 10, color: '#64748b', marginTop: 3 },
    doneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    doneText: { fontSize: 14, color: '#22C55E', fontWeight: '600' },
});
