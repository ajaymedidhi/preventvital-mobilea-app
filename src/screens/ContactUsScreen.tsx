import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const ContactUsScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!subject || !message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await client.post('/api/contact', { subject, message });
            Alert.alert(
                'Message Sent',
                'Thanks for reaching us! We will get back to you soon.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch {
            Alert.alert('Error', 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F1F5F9' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
                    <Text style={styles.headerTitle}>Contact Support</Text>
                    <View style={{ width: 36 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.title}>How can we help?</Text>
                    <Text style={styles.subtitle}>
                        Send us a message and our team will get back to you at your registered email address.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Account Issue, Feedback"
                            placeholderTextColor="#94A3B8"
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your issue or feedback..."
                            placeholderTextColor="#94A3B8"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
                        <LinearGradient
                            colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                            locations={[0, 0.28, 0.7, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Message'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.infoContainer}>
                        <Ionicons name="mail-outline" size={20} color="#64748B" />
                        <Text style={styles.infoText}>Typical response time: 24-48 hours</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    headerGradient: {
        paddingBottom: 16,
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginTop: 8,
    },
    title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 20 },

    inputGroup: { marginBottom: 20 },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontWeight: '600',
    },
    textArea: { height: 120 },

    button: { width: '100%', height: 50, borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    infoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    infoText: { color: '#64748B', fontSize: 12, marginLeft: 8, fontWeight: '600' }
});

export default ContactUsScreen;
