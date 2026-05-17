import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Health Coach</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.gateContainer}>
                    <View style={styles.coachAvatar}>
                        <Ionicons name="person-circle-outline" size={64} color="#8B5CF6" />
                    </View>
                    <Text style={styles.gateTitle}>Certified Health Coach</Text>
                    <Text style={styles.gateDesc}>
                        Family members get direct access to a certified health coach who reviews your CVITAL data and creates a personalised plan for you.
                    </Text>
                    <View style={styles.featureList}>
                        {['Personalized weekly health plans', 'Async messaging — reply within 24h', 'CVITAL score + vitals review', 'Diet & exercise guidance'].map((f, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                                <Text style={styles.featureText}>{f}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
                        <Text style={styles.upgradeBtnText}>Upgrade to Family</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.coachAvatarSmall}>
                        <Ionicons name="person-circle" size={32} color="#8B5CF6" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Health Coach</Text>
                        <Text style={styles.headerSub}>Certified • Replies within 24h</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator color="#8B5CF6" style={{ flex: 1 }} />
            ) : (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
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
                                            <Ionicons name="person-circle" size={22} color="#8B5CF6" />
                                        </View>
                                    )}
                                    <View style={[styles.bubbleContent, isUser ? styles.bubbleContentUser : styles.bubbleContentCoach]}>
                                        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextCoach]}>
                                            {m.text}
                                        </Text>
                                        <Text style={styles.bubbleTime}>
                                            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {sending && (
                            <View style={[styles.bubble, styles.bubbleCoach]}>
                                <View style={styles.coachBubbleAvatar}>
                                    <Ionicons name="person-circle" size={22} color="#8B5CF6" />
                                </View>
                                <View style={[styles.bubbleContent, styles.bubbleContentCoach]}>
                                    <ActivityIndicator size="small" color="#8B5CF6" />
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
                            <Ionicons name="send" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    back: { width: 40, justifyContent: 'center' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    headerSub: { fontSize: 11, color: '#22C55E', fontWeight: '600' },
    coachAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
    gateContainer: { flex: 1, alignItems: 'center', padding: 32, paddingTop: 48, gap: 16 },
    coachAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
    gateTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
    gateDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
    featureList: { alignSelf: 'stretch', gap: 10 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureText: { fontSize: 14, color: '#374151' },
    upgradeBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8 },
    upgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    chatContent: { padding: 16, paddingBottom: 8, gap: 12 },
    bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
    bubbleUser: { justifyContent: 'flex-end' },
    bubbleCoach: { justifyContent: 'flex-start' },
    coachBubbleAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    bubbleContent: { maxWidth: '78%', borderRadius: 18, padding: 12, paddingBottom: 8 },
    bubbleContentUser: { backgroundColor: '#6366F1', borderBottomRightRadius: 4 },
    bubbleContentCoach: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: '#fff' },
    bubbleTextCoach: { color: '#1E293B' },
    bubbleTime: { fontSize: 10, color: 'rgba(148,163,184,0.9)', marginTop: 4, alignSelf: 'flex-end' },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
    chatInput: { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1E293B', maxHeight: 100 },
    sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { opacity: 0.4 },
});
