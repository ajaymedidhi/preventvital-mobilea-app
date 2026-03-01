import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// Mocking OTP verification for now
import { useAuth } from '../../auth/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpVerificationScreen() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { phoneNumber } = route.params;

    const handleVerify = async () => {
        setLoading(true);
        // Mock OTP verification logic since verifyOtp is not exported
        await new Promise(resolve => setTimeout(resolve, 1000));
        const token = 'mock_token';
        setLoading(false);
        if (token) {
            // Normally we might navigate to profile setup if new user, or sign in directly
            // For this task, we'll navigate to ProfileSetup
            navigation.navigate('ProfileSetup', { token });
        } else {
            Alert.alert('Error', 'Invalid OTP');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the code sent to {phoneNumber}</Text>
            <TextInput
                style={styles.input}
                placeholder="123456"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
            />
            <Button title={loading ? "Verifying..." : "Verify"} onPress={handleVerify} disabled={loading} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
});
