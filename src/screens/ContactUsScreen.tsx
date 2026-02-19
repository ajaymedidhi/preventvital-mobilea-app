import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const ContactUsScreen = () => {
    const navigation = useNavigation<any>();
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
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F3F4F6' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Support</Text>
                <View style={{ width: 24 }} />
            </View>

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
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your issue or feedback..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
                        <LinearGradient colors={['#38BDF8', '#0EA5E9']} style={styles.buttonGradient}>
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
    container: { padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },

    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#64748B',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', marginBottom: 32, lineHeight: 20 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#475569', marginBottom: 8, fontWeight: '500' },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B',
        backgroundColor: '#F8FAFC'
    },
    textArea: { height: 120 },

    button: { width: '100%', height: 50, borderRadius: 12, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    infoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    infoText: { color: '#64748B', fontSize: 12, marginLeft: 8 }
});

export default ContactUsScreen;
