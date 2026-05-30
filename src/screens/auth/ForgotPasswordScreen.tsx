import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';

const { height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleRequestOtp = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await client.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
            Alert.alert(
                'OTP Sent',
                'A 6-digit OTP code has been generated and logged. Check the server console.',
                [{ text: 'OK', onPress: () => setStep(2) }]
            );
        } catch (error: any) {
            Alert.alert('Failed', error.response?.data?.message || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp.trim() || !newPassword.trim()) {
            Alert.alert('Error', 'Please fill in both OTP and the new password');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await client.post('/api/auth/reset-password', {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                newPassword: newPassword.trim()
            });
            Alert.alert(
                'Success',
                'Your password has been reset successfully. Please log in.',
                [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
            );
        } catch (error: any) {
            Alert.alert('Failed', error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientHeader, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Password Recovery</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>{step === 1 ? 'Reset Password' : 'Verify Identity'}</Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'Enter your registered email address, and we will generate a recovery OTP code for you.'
                                : `We've generated an OTP code for ${email}. Enter it below along with your new password.`
                            }
                        </Text>

                        {step === 1 ? (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'email' && styles.inputWrapperFocused
                                ]}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={focusedInput === 'email' ? "#9035A0" : "#94A3B8"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={{ gap: 20 }}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>6-Digit OTP Code</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        focusedInput === 'otp' && styles.inputWrapperFocused
                                    ]}>
                                        <Ionicons
                                            name="key-outline"
                                            size={20}
                                            color={focusedInput === 'otp' ? "#9035A0" : "#94A3B8"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter OTP code"
                                            placeholderTextColor="#94A3B8"
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="numeric"
                                            maxLength={6}
                                            onFocus={() => setFocusedInput('otp')}
                                            onBlur={() => setFocusedInput(null)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        focusedInput === 'newPassword' && styles.inputWrapperFocused
                                    ]}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={focusedInput === 'newPassword' ? "#9035A0" : "#94A3B8"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Minimum 8 characters"
                                            placeholderTextColor="#94A3B8"
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            onFocus={() => setFocusedInput('newPassword')}
                                            onBlur={() => setFocusedInput(null)}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={step === 1 ? handleRequestOtp : handleResetPassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                                locations={[0, 0.28, 0.7, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Processing...' : (step === 1 ? 'Request Reset OTP' : 'Reset Password')}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {step === 2 && (
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.backToRequest}>
                                <Text style={styles.backToRequestText}>Change email address</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    gradientHeader: {
        height: height * 0.24,
        justifyContent: 'flex-start',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
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
    contentContainer: {
        flex: 1,
        marginTop: -60,
        backgroundColor: 'transparent',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        shadowColor: "#0F172A",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 32,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: '#F8FAFC',
    },
    inputWrapperFocused: {
        borderColor: '#9035A0',
        backgroundColor: '#FFF',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '600',
    },
    button: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 24,
        shadowColor: "#9035A0",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    backToRequest: {
        alignItems: 'center',
        marginTop: 20,
    },
    backToRequestText: {
        fontSize: 14,
        color: '#9035A0',
        fontWeight: '700',
    },
});

export default ForgotPasswordScreen;
