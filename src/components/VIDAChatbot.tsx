import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    FlatList, Modal, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../api/client';

const VIDA_INTRO_KEY = 'pv_vida_intro_shown';

const SUGGESTIONS = [
    '📊 My health score',
    '💊 Best program for my condition?',
    '🩺 How to improve my BP?',
    '⌚ How to connect my device?',
];

export default function VIDAChatbot() {
    const insets = useSafeAreaInsets();
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState<any[]>([
        { id: '1', role: 'vita', text: "Hi! I'm VITA 👋 Ask me anything about your health." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        AsyncStorage.getItem(VIDA_INTRO_KEY).then(seen => {
            if (!seen) {
                setShowTooltip(true);
                AsyncStorage.setItem(VIDA_INTRO_KEY, '1');
                setTimeout(() => setShowTooltip(false), 5000);
            }
        });
    }, []);

    const send = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');
        setLoading(true);

        const userMsg = { id: Date.now().toString(), role: 'user', text: msg };
        setMsgs(prev => [...prev, userMsg]);

        try {
            const { data } = await client.post('/api/ai/chat', { message: msg, history });
            const vitaMsg = { id: (Date.now() + 1).toString(), role: 'vita', text: data.reply };
            setMsgs(prev => [...prev, vitaMsg]);
            setHistory(prev => [...prev,
            { role: 'user', parts: [{ text: msg }] },
            { role: 'model', parts: [{ text: data.reply }] }
            ]);
        } catch (e: any) {
            const errMsg = e.response?.data?.message || e.message || "Sorry, I'm having trouble connecting. Try again.";
            setMsgs(prev => [...prev, {
                id: 'err-' + Date.now().toString(), role: 'vita', text: errMsg
            }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* First-launch tooltip */}
            {showTooltip && (
                <TouchableOpacity
                    style={[styles.tooltip, { bottom: (Platform.OS === 'ios' ? 88 : 60) + insets.bottom + 84, right: 16 }]}
                    onPress={() => setShowTooltip(false)}
                    activeOpacity={0.9}
                >
                    <Text style={styles.tooltipText}>👋 Hi! I'm VITA, your AI health assistant. Tap me!</Text>
                    <View style={styles.tooltipArrow} />
                </TouchableOpacity>
            )}

            {/* Floating button — always visible */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        bottom: (Platform.OS === 'ios' ? 88 : 60) + insets.bottom + 16,
                        right: 16,
                    }
                ]}
                onPress={() => { setOpen(true); setShowTooltip(false); }}
                activeOpacity={0.85}
            >
                <Image 
                    source={require('../../assets/images/vita_bot.png')} 
                    style={styles.fabImg} 
                />
            </TouchableOpacity>

            {/* Chat modal */}
            <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
                <KeyboardAvoidingView
                    style={styles.modal}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                    {/* Header */}
                    <LinearGradient
                        colors={['#3A8AB5', '#51A6CB']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.headerGradient, { paddingTop: Platform.OS === 'ios' ? 30 : 16 }]}
                    >
                        <View style={styles.header}>
                            <View style={styles.avatar}>
                                <Image 
                                    source={require('../../assets/images/vita_bot.png')} 
                                    style={styles.headerImg} 
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.vitaName}>VITA AI</Text>
                                <View style={styles.statusRow}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.vitaStatus}>Online · Gemini</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Suggestions */}
                    {msgs.length === 1 && (
                        <View style={styles.suggestionsContainer}>
                            <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
                            <View style={styles.suggestions}>
                                {SUGGESTIONS.map((sug, i) => (
                                    <TouchableOpacity key={i} style={styles.sugChip} onPress={() => send(sug)} activeOpacity={0.82}>
                                        <Text style={styles.sugText}>{sug}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Messages */}
                    <FlatList
                        ref={listRef}
                        data={msgs}
                        keyExtractor={m => m.id}
                        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                        renderItem={({ item }) => (
                            <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
                                {item.role !== 'user' && (
                                    <View style={styles.bubbleAvatar}>
                                        <Image 
                                            source={require('../../assets/images/vita_bot.png')} 
                                            style={styles.bubbleAvatarImg} 
                                        />
                                    </View>
                                )}
                                {item.role === 'user' ? (
                                    <LinearGradient
                                        colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                                        style={[styles.bubble, styles.userBubble]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        locations={[0, 0.28, 0.7, 1]}
                                    >
                                        <Text style={styles.userText}>{item.text}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.bubble, styles.vitaBubble]}>
                                        <Text style={styles.vitaText}>{item.text}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    />

                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color="#3A8AB5" size="small" />
                            <Text style={styles.loaderText}>VITA is typing...</Text>
                        </View>
                    )}

                    {/* Input */}
                    <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask VITA..."
                            placeholderTextColor="#94A3B8"
                            onSubmitEditing={() => send()}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={() => send()} activeOpacity={0.85}>
                            <Ionicons name="paper-plane" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FFF', justifyContent: 'center',
        alignItems: 'center', shadowColor: '#3A8AB5', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 10, zIndex: 999,
        borderWidth: 2, borderColor: '#51A6CB',
        overflow: 'hidden'
    },
    fabImg: { width: 56, height: 56 },
    modal: { flex: 1, backgroundColor: '#F8FAFC' },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16,
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden',
        borderWidth: 1.5, borderColor: '#FFF'
    },
    headerImg: { width: 44, height: 44 },
    vitaName: { fontWeight: '800', fontSize: 18, color: '#FFF' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    vitaStatus: { fontSize: 12, color: '#E0F2FE', fontWeight: '600' },
    closeBtn: { padding: 8 },
    suggestionsContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    suggestionsTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    sugChip: { backgroundColor: '#F0FAFF', borderWidth: 1, borderColor: '#E0F2FE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    sugText: { color: '#0284C7', fontSize: 13, fontWeight: '700' },
    msgRow: { flexDirection: 'row', paddingBottom: 14, gap: 10, alignItems: 'flex-end' },
    msgRowUser: { justifyContent: 'flex-end' },
    bubbleAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#E2E8F0', overflow: 'hidden',
        borderWidth: 1, borderColor: '#CBD5E1',
        marginBottom: 2,
    },
    bubbleAvatarImg: { width: 28, height: 28 },
    bubble: { maxWidth: '78%', padding: 14, borderRadius: 20 },
    vitaBubble: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', borderBottomLeftRadius: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    userBubble: { borderBottomRightRadius: 4 },
    vitaText: { color: '#334155', fontSize: 14, lineHeight: 22, fontWeight: '500' },
    userText: { color: '#FFF', fontSize: 14, lineHeight: 22, fontWeight: '600' },
    loaderContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 54, paddingBottom: 16 },
    loaderText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    inputRow: {
        flexDirection: 'row', padding: 12, gap: 10,
        borderTopWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFF',
        alignItems: 'center',
    },
    input: {
        flex: 1, backgroundColor: '#F8FAFC', borderRadius: 22,
        paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15,
        color: '#0F172A', fontWeight: '600',
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#3A8AB5', justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3A8AB5', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
    },
    tooltip: { position: 'absolute', right: 16, backgroundColor: '#0F172A', borderRadius: 12, padding: 12, maxWidth: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
    tooltipText: { color: '#FFF', fontSize: 13, fontWeight: '600', lineHeight: 18 },
    tooltipArrow: { position: 'absolute', bottom: -7, right: 22, width: 14, height: 14, backgroundColor: '#0F172A', transform: [{ rotate: '45deg' }] },
});
