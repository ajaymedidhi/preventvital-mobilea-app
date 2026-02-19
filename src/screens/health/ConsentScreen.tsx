import React from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useConsent } from '../../health/ConsentContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';

export default function ConsentScreen() {
    const { giveConsent } = useConsent();
    const { signOut } = useAuth();

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
                    By clicking "Allow Access", you agree to our Terms of Service and Privacy Policy, and grant PreventVital permission to read your health data from Google Fit/Apple Health.
                </Text>

                <View style={styles.buttonContainer}>
                    <Button title="Allow Access" onPress={giveConsent} />
                    <View style={styles.spacer} />
                    <Button title="Decline" onPress={handleDecline} color="red" />
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
        color: '#666',
        marginTop: 30,
        marginBottom: 30,
        fontStyle: 'italic',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    spacer: {
        height: 10,
    }
});
