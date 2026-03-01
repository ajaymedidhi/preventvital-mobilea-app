import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Dimensions, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signup } from '../../api/authApi';

const { width, height } = Dimensions.get('window');

const SignUpScreen = () => {
    const navigation = useNavigation<any>();
    const { setAuthToken } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // Password Validation State
    const [isPasswordValid, setIsPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [allValid, setAllValid] = useState(false);

    // Update validation on password change
    const validatePassword = (pass: string) => {
        const newState = {
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
        };
        setIsPasswordValid(newState);
        setPassword(pass);
    };

    // Check if form is valid for button enablement
    const isFormValid =
        name.length > 0 &&
        email.length > 0 &&
        password.length > 0 &&
        Object.values(isPasswordValid).every(Boolean) &&
        password === confirmPassword &&
        agreeToTerms;

    const handleSignUp = async () => {
        if (!isFormValid) return;
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (!agreeToTerms) {
            Alert.alert('Error', 'Please agree to the Terms and Conditions');
            return;
        }

        setLoading(true);
        try {
            const { token, user } = await signup({ name, email, password });

            // Set the token globally. This triggers AppNavigator to unmount AuthStack
            // and mount either ConsentStack or AppStack depending on hasConsented.
            await setAuthToken(token, user);

        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#51A6CB', '#BF40A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <SafeAreaView style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start your wellness journey</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'name' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={focusedInput === 'name' ? "#3B82F6" : "#94A3B8"}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#94A3B8"
                                    value={name}
                                    onChangeText={setName}
                                    onFocus={() => setFocusedInput('name')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'email' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={focusedInput === 'email' ? "#3B82F6" : "#94A3B8"}
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'password' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'password' ? "#3B82F6" : "#94A3B8"}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={validatePassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={focusedInput === 'password' ? "#3B82F6" : "#94A3B8"}
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Password Requirements List */}
                            <View style={styles.requirementsContainer}>
                                <RequirementItem fulfilled={isPasswordValid.length} text="At least 8 characters" />
                                <RequirementItem fulfilled={isPasswordValid.uppercase} text="One uppercase letter" />
                                <RequirementItem fulfilled={isPasswordValid.lowercase} text="One lowercase letter" />
                                <RequirementItem fulfilled={isPasswordValid.number} text="One number" />
                                <RequirementItem fulfilled={isPasswordValid.special} text="One special character" />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'confirmPassword' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={focusedInput === 'confirmPassword' ? "#3B82F6" : "#94A3B8"}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#94A3B8"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={focusedInput === 'confirmPassword' ? "#3B82F6" : "#94A3B8"}
                                    />
                                </TouchableOpacity>
                            </View>
                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <Text style={styles.errorText}>Passwords do not match</Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreeToTerms(!agreeToTerms)}>
                            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                                {agreeToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                I agree to the <Text style={styles.linkText}>Terms and Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, !isFormValid && styles.buttonDisabled]}
                            onPress={handleSignUp}
                            disabled={!isFormValid || loading}
                        >
                            <LinearGradient
                                colors={['#51A6CB', '#BF40A3']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    gradientHeader: {
        height: height * 0.35,
        justifyContent: 'flex-start',
    },
    headerContent: {
        marginLeft: 24,
        marginTop: 10,
    },
    backButton: {
        padding: 8,
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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
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
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF', // Light blue background
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    requirementsContainer: {
        marginTop: 8,
        marginLeft: 4,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    requirementText: {
        fontSize: 12,
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    buttonDisabled: {
        opacity: 0.5, // Faded effect
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonTextDisabled: {
        color: '#fff', // Keep white even if disabled
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#BF40A3', // Updated to match scheme
        borderColor: '#BF40A3',
    },
    checkboxLabel: {
        fontSize: 12,
        color: '#64748B',
        flex: 1,
    },
    button: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#BF40A3", // Updated shadow color
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 24,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#64748B',
    },
    linkText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: 'bold',
    },
});

const RequirementItem = ({ fulfilled, text }: { fulfilled: boolean; text: string }) => (
    <View style={styles.requirementItem}>
        <Ionicons
            name={fulfilled ? "checkmark-circle" : "checkmark"}
            size={14}
            color={fulfilled ? "#22C55E" : "#94A3B8"}
        />
        <Text style={[
            styles.requirementText,
            { color: fulfilled ? "#22C55E" : "#94A3B8" }
        ]}>
            {text}
        </Text>
    </View>
);

export default SignUpScreen;
