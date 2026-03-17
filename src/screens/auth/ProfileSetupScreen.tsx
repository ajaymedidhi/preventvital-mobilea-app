import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const { signIn } = useAuth();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { token } = route.params || {};

    const handleCompleteSetup = async () => {
        if (!age || !gender) {
            alert('Please fill in all fields');
            return;
        }
        await signIn(token);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#60A5FA', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>PROFILE SETUP</Text>
                        <View style={{ width: 32 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView 
                style={styles.contentCard} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="person-add" size={32} color="#8B5CF6" />
                    </View>
                    
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.subtitle}>Let's get your profile ready to begin your wellness journey.</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>How old are you?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Age"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={setAge}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Biological Sex</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Male / Female"
                            placeholderTextColor="#94A3B8"
                            value={gender}
                            onChangeText={setGender}
                        />
                    </View>

                    <TouchableOpacity style={styles.buttonContainer} onPress={handleCompleteSetup}>
                        <LinearGradient
                            colors={['#60A5FA', '#8B5CF6']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Complete Setup</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 60 },
    headerSafeArea: { paddingHorizontal: 24, paddingTop: 10 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
    },
    backButton: { padding: 4 },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        marginTop: -40, overflow: 'hidden'
    },
    scrollContent: { padding: 32, alignItems: 'center' },
    
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F3FF',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 22 },

    inputGroup: { width: '100%', marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8, marginLeft: 4 },
    input: {
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 20,
        height: 56, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC'
    },

    buttonContainer: { width: '100%', height: 56, marginTop: 10 },
    button: {
        flex: 1, borderRadius: 16, flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 10
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
