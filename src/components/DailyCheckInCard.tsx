import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../api/client';

const MOODS = [
    { value: 1, emoji: '😞', label: 'Rough',  color: '#EF4444' },
    { value: 2, emoji: '😐', label: 'Meh',    color: '#F97316' },
    { value: 3, emoji: '🙂', label: 'Okay',   color: '#F59E0B' },
    { value: 4, emoji: '😊', label: 'Good',   color: '#22C55E' },
    { value: 5, emoji: '🤩', label: 'Great',  color: '#10B981' },
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
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        client.get('/api/users/streak')
            .then(r => {
                setStreak(r.data.data.streak);
                setCheckedInToday(r.data.data.checkedInToday);
            })
            .catch(() => {});

        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [fadeAnim]);

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
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 160, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]).start();
            if (isMilestone && !alreadyCheckedIn) setMilestoneMsg(`🎉 ${newStreak}-day milestone!`);
            onCheckInDone?.(newStreak, isMilestone);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const moodObj = MOODS.find(m => m.value === selectedMood);

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.topRow}>
                <View style={styles.titleBlock}>
                    <Ionicons name="sunny" size={15} color="#F97316" />
                    <Text style={styles.title}>Daily Check-In</Text>
                </View>
                <Animated.View style={[styles.streakPill, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="flame" size={13} color="#F97316" />
                    <Text style={styles.streakNum}>{streak}</Text>
                    <Text style={styles.streakLabel}>{streak === 1 ? 'day' : 'days'}</Text>
                </Animated.View>
            </View>

            {checkedInToday ? (
                /* Done state */
                <View style={styles.doneWrap}>
                    <LinearGradient
                        colors={['#ECFDF5', '#D1FAE5']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.doneCard}
                    >
                        <View style={styles.doneIconWrap}>
                            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                        </View>
                        <View>
                            <Text style={styles.donePrimary}>
                                {milestoneMsg || `${streak}-day streak! 🔥`}
                            </Text>
                            <Text style={styles.doneSub}>
                                {moodObj ? `Feeling ${moodObj.label.toLowerCase()} today` : 'See you tomorrow!'}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            ) : (
                /* Mood picker */
                <View>
                    <Text style={styles.prompt}>How are you feeling today?</Text>
                    <View style={styles.moodRow}>
                        {MOODS.map(m => {
                            const active = selectedMood === m.value;
                            return (
                                <TouchableOpacity
                                    key={m.value}
                                    style={[styles.moodBtn, active && { backgroundColor: m.color + '18', borderColor: m.color }]}
                                    onPress={() => handleCheckIn(m.value)}
                                    disabled={loading}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Mood: ${m.label}`}
                                >
                                    <Text style={styles.emoji}>{m.emoji}</Text>
                                    <Text style={[styles.moodLabel, active && { color: m.color, fontWeight: '700' }]}>
                                        {m.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 5,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    titleBlock: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    title: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    streakPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    streakNum: { fontSize: 14, fontWeight: '800', color: '#F97316' },
    streakLabel: { fontSize: 11, fontWeight: '600', color: '#F97316' },

    prompt: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 14 },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
    moodBtn: {
        flex: 1, alignItems: 'center', paddingVertical: 10,
        borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent',
        backgroundColor: '#F8FAFC',
    },
    emoji: { fontSize: 24, marginBottom: 5 },
    moodLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

    doneWrap: { borderRadius: 14, overflow: 'hidden' },
    doneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
    doneIconWrap: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
    },
    donePrimary: { fontSize: 14, fontWeight: '800', color: '#065F46' },
    doneSub: { fontSize: 12, color: '#059669', marginTop: 2, fontWeight: '500' },
});
