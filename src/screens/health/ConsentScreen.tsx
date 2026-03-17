import React from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useConsent } from '../../health/ConsentContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ConsentScreen() {
    const { giveConsent } = useConsent();
    const { signOut } = useAuth();
    const navigation = useNavigation();

    const handleDecline = () => {
        Alert.alert(
            "Consent Required",
            "PreventVital requires access to your health data to function. You cannot use the app without providing consent.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    onPress: signOut,
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Data Privacy & Consent</Text>

                <Text style={styles.sectionTitle}>Why we need your data</Text>
                <Text style={styles.text}>
                    PreventVital is designed to help you monitor and improve your health. To do this, we need access to specific health metrics from your device.
                </Text>

                <Text style={styles.sectionTitle}>What we collect</Text>
                <Text style={styles.text}>
                    • Steps count{'\n'}
                    • Heart Rate{'\n'}
                    • Sleep analysis
                </Text>

                <Text style={styles.sectionTitle}>How we use it</Text>
                <Text style={styles.text}>
                    Your data is used solely to generate your daily health score and provide personalized program recommendations. We do not sell your data to third parties.
                </Text>

                <Text style={styles.disclaimer}>
                    By clicking "Allow Access", you agree to our{' '}
                    <Text style={styles.link} onPress={() => (navigation as any).navigate('TermsAndConditions')}>Terms & Conditions</Text>
                    {' '}and{' '}
                    <Text style={styles.link} onPress={() => (navigation as any).navigate('PrivacyOverview')}>Privacy Policy</Text>
                    , and grant PreventalVital permission to read your health data from Google Fit/Apple Health.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.allowButton} onPress={giveConsent}>
                        <Text style={styles.allowButtonText}>Allow Access</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    disclaimer: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 30,
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    link: {
        color: '#4F46E5',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 40,
    },
    allowButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    allowButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    declineButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    declineButtonText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
});
