import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import client from '../../api/client';

const COACH_INTRO = {
    sender: 'coach',
    text: "Hi! I'm your certified health coach. I've reviewed your CVITAL assessment and vitals. I'm here to help you understand your results and create a personalised wellness plan. What would you like to focus on today?",
    createdAt: new Date(Date.now() - 60000).toISOString(),
};

export default function HealthCoachScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { currentPlan } = useAuth();
    const scrollRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    useFocusEffect(useCallback(() => {
        if (currentPlan !== 'family') { setLoading(false); return; }
        client.get('/api/users/coach-messages')
            .then(r => {
                const msgs = r.data.data.messages || [];
                setMessages(msgs.length ? msgs : [COACH_INTRO]);
            })
            .catch(() => setMessages([COACH_INTRO]))
            .finally(() => setLoading(false));
    }, [currentPlan]));

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        const msg = { sender: 'user', text: text.trim(), createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, msg]);
        setText('');
        setSending(true);
        try {
            await client.post('/api/users/coach-messages', { text: msg.text });
            // Simulate async coach reply after 1.5s
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender: 'coach',
                    text: "Thanks for sharing that. I'll review your latest data and get back to you with a personalised recommendation within 24 hours.",
                    createdAt: new Date().toISOString(),
                }]);
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 1500);
        } catch { /* message already shown optimistically */ }
        finally { setSending(false); scrollRef.current?.scrollToEnd({ animated: true }); }
    };

    if (currentPlan !== 'family') {
        return (
            <View style={[styles.container, { paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
                <LinearGradient
                    colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                    locations={[0, 0.28, 0.7, 1]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Health Coach</Text>
                        <View style={{ width: 36 }} />
                    </View>
                </LinearGradient>

                <View style={styles.gateContainer}>
                    <View style={styles.coachAvatar}>
                        <Ionicons name="person-circle-outline" size={64} color="#9035A0" />
                    </View>
                    <Text style={styles.gateTitle}>Certified Health Coach</Text>
                    <Text style={styles.gateDesc}>
                        Family members get direct access to a certified health coach who reviews your CVITAL data and creates a personalised plan for you.
                    </Text>
                    <View style={styles.featureList}>
                        {['Personalized weekly health plans', 'Async messaging — reply within 24h', 'CVITAL score + vitals review', 'Diet & exercise guidance'].map((f, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                                <Text style={styles.featureText}>{f}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
                        <LinearGradient
                            colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                            locations={[0, 0.28, 0.7, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.upgradeBtnGradient}
                        >
                            <Text style={styles.upgradeBtnText}>Upgrade to Family</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={styles.coachAvatarSmall}>
                            <Ionicons name="person-circle" size={28} color="#9035A0" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Health Coach</Text>
                            <Text style={styles.headerSub}>Certified • Replies within 24h</Text>
                        </View>
                    </View>
                    <View style={{ width: 36 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator color="#9035A0" style={{ flex: 1 }} />
            ) : (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.chatContent}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                    >
                        {messages.map((m, i) => {
                            const isUser = m.sender === 'user';
                            return (
                                <View key={i} style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
                                    {!isUser && (
                                        <View style={styles.coachBubbleAvatar}>
                                            <Ionicons name="person-circle" size={22} color="#9035A0" />
                                        </View>
                                    )}
                                    {isUser ? (
                                        <LinearGradient
                                            colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                                            locations={[0, 0.28, 0.7, 1]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                            style={[styles.bubbleContent, styles.bubbleContentUser]}
                                        >
                                            <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
                                                {m.text}
                                            </Text>
                                            <Text style={[styles.bubbleTime, { color: 'rgba(255,255,255,0.75)' }]}>
                                                {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.bubbleContent, styles.bubbleContentCoach]}>
                                            <Text style={[styles.bubbleText, styles.bubbleTextCoach]}>
                                                {m.text}
                                            </Text>
                                            <Text style={styles.bubbleTime}>
                                                {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                        {sending && (
                            <View style={[styles.bubble, styles.bubbleCoach]}>
                                <View style={styles.coachBubbleAvatar}>
                                    <Ionicons name="person-circle" size={22} color="#9035A0" />
                                </View>
                                <View style={[styles.bubbleContent, styles.bubbleContentCoach]}>
                                    <ActivityIndicator size="small" color="#9035A0" />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.chatInput}
                            value={text}
                            onChangeText={setText}
                            placeholder="Message your coach…"
                            placeholderTextColor="#94A3B8"
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!text.trim() || sending}
                        >
                            <LinearGradient
                                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                                locations={[0, 0.28, 0.7, 1]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.sendBtnGradient}
                            >
                                <Ionicons name="paper-plane" size={16} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    headerGradient: {
        paddingBottom: 14,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 8 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 11, color: '#A7F3D0', fontWeight: '700' },
    coachAvatarSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    
    gateContainer: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40, gap: 18 },
    coachAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', shadowColor: '#9035A0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    gateTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    gateDesc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
    featureList: { alignSelf: 'stretch', gap: 12, backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureText: { fontSize: 14, color: '#334155', fontWeight: '600' },
    upgradeBtn: { width: '100%', height: 50, borderRadius: 16, overflow: 'hidden', marginTop: 12 },
    upgradeBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    upgradeBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

    chatContent: { padding: 16, paddingBottom: 16, gap: 12 },
    bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    bubbleUser: { justifyContent: 'flex-end' },
    bubbleCoach: { justifyContent: 'flex-start' },
    coachBubbleAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', flexShrink: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleContent: { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleContentUser: { borderBottomRightRadius: 4 },
    bubbleContentCoach: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: '#fff', fontWeight: '600' },
    bubbleTextCoach: { color: '#0F172A', fontWeight: '500' },
    bubbleTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end', fontWeight: '500' },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
    chatInput: { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#0F172A', maxHeight: 100, backgroundColor: '#F8FAFC', fontWeight: '600' },
    sendBtn: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
    sendBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { opacity: 0.5 },
});
