import React, { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    FlatList, Modal, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';

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
        { id: '1', role: 'vita', text: "Hi! I'm VIDA 👋 Ask me anything about your health." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const listRef = useRef<FlatList>(null);

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
            console.error('Chatbot API Error:', e);
            const errMsg = e.response?.data?.message || e.message || "Sorry, I'm having trouble connecting to AI. Try again.";
            setMsgs(prev => [...prev, {
                id: 'err-' + Date.now().toString(), role: 'vita', text: errMsg
            }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Floating button — always visible */}
            <TouchableOpacity 
                style={[
                    styles.fab, 
                    { 
                        bottom: (Platform.OS === 'ios' ? 88 : 60) + insets.bottom + 16,
                        right: 16 
                    }
                ]} 
                onPress={() => setOpen(true)} 
                activeOpacity={0.8}
            >
                <Image 
                    source={require('../../assets/images/vida_bot.png')} 
                    style={styles.fabImg} 
                />
            </TouchableOpacity>

            {/* Chat modal */}
            <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
                <KeyboardAvoidingView
                    style={styles.modal}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.avatar}>
                            <Image 
                                source={require('../../assets/images/vida_bot.png')} 
                                style={styles.headerImg} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vitaName}>VIDA AI</Text>
                            <Text style={styles.vitaStatus}>● Online · Gemini</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                            <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Suggestions */}
                    {msgs.length === 1 && (
                        <View style={styles.suggestions}>
                            {SUGGESTIONS.map((sug, i) => (
                                <TouchableOpacity key={i} style={styles.sugChip} onPress={() => send(sug)}>
                                    <Text style={styles.sugText}>{sug}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Messages */}
                    <FlatList
                        ref={listRef}
                        data={msgs}
                        keyExtractor={m => m.id}
                        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
                                <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.vitaBubble]}>
                                    <Text style={item.role === 'user' ? styles.userText : styles.vitaText}>
                                        {item.text}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />

                    {loading && <ActivityIndicator color="#3B82F6" style={{ padding: 8 }} />}

                    {/* Input */}
                    <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask VIDA..."
                            onSubmitEditing={() => send()}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={() => send()}>
                            <Text style={styles.sendIcon}>➤</Text>
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
        backgroundColor: '#3B82F6', justifyContent: 'center',
        alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, zIndex: 999,
        overflow: 'hidden'
    },
    fabImg: { width: 60, height: 60 },
    modal: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 16,
        borderBottomWidth: 1, borderColor: '#F3F4F6',
        backgroundColor: '#fff'
    },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#F3F4F6', overflow: 'hidden',
        borderWidth: 1, borderColor: '#E5E7EB'
    },
    headerImg: { width: 44, height: 44 },
    vitaName: { fontWeight: '700', fontSize: 16, color: '#111827' },
    vitaStatus: { fontSize: 12, color: '#10B981', marginTop: 2 },
    closeBtn: { padding: 8 },
    suggestions: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, borderBottomWidth: 1, borderColor: '#F3F4F6' },
    sugChip: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
    sugText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    msgRow: { flexDirection: 'row', padding: 12, paddingBottom: 4 },
    msgRowUser: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '80%', padding: 14, borderRadius: 16 },
    vitaBubble: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 4 },
    userBubble: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
    vitaText: { color: '#374151', fontSize: 15, lineHeight: 22 },
    userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
    inputRow: {
        flexDirection: 'row', padding: 12, gap: 10,
        borderTopWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#fff',
    },
    input: {
        flex: 1, backgroundColor: '#F9FAFB', borderRadius: 22,
        paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1, borderColor: '#E5E7EB', fontSize: 15
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#3B82F6', justifyContent: 'center',
        alignItems: 'center'
    },
    sendIcon: { color: '#fff', fontSize: 18 },
});
