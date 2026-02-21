import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/AuthContext';

import { updateOnboarding } from '../../api/authApi';

const ConnectDevicesScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { token, personalInfo, healthConditions, healthGoals } = route.params || {};

    // In a real app, we might save profile data here using an API call with the token
    const { setAuthToken } = useAuth(); // We need to add this to AuthContext

    const handleComplete = async () => {
        try {
            // 1. Submit collected data to backend (profile update)
            console.log("Submitting Onboarding Data:", { personalInfo, healthConditions, healthGoals });

            if (token && setAuthToken) {
                // Store token first
                await setAuthToken(token);
                // Now client.ts should pick it up from storage/state for the API call

                await updateOnboarding({
                    personalInfo,
                    healthConditions,
                    healthGoals
                });

                Alert.alert("Success", "Profile updated successfully!");
            } else {
                Alert.alert("Error", "Authentication token missing. Please try logging in.");
                navigation.navigate('SignIn');
            }
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            Alert.alert("Error", "Failed to save profile. " + error.message);
            // Optionally navigate to Home anyway if it's non-critical
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Progress */}
            <LinearGradient
                colors={['#60A5FA', '#8B5CF6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.stepText}>Steps 4 of 4</Text>
                        <TouchableOpacity onPress={handleComplete}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress Icons */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressIcon, styles.activeProgress]}>
                            <Ionicons name="person" size={16} color="#2563EB" />
                        </View>
                        <View style={styles.progressLine} />
                        <View style={[styles.progressIcon, styles.activeProgress]}>
                            <Ionicons name="medical" size={16} color="#2563EB" />
                        </View>
                        <View style={styles.progressLine} />
                        <View style={[styles.progressIcon, styles.activeProgress]}>
                            <Ionicons name="golf" size={16} color="#2563EB" />
                        </View>
                        <View style={styles.progressLine} />
                        <View style={[styles.progressIcon, styles.activeProgress]}>
                            <Ionicons name="phone-portrait" size={16} color="#2563EB" />
                        </View>
                    </View>

                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Connect Your Devices</Text>
                    <Text style={styles.subtitle}>
                        Connect wearable devices for automatic vitals tracking. This step is optional — you can add devices later.
                    </Text>

                    <View style={{ height: 40 }} />

                    <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert("Connect", "Device scanning would start here...")}>
                        <Text style={styles.primaryButtonText}>I have a wearable device</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleComplete}>
                        <Text style={styles.secondaryButtonText}>I ' ll add  devices later</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 30 },
    headerSafeArea: { paddingHorizontal: 20 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10
    },
    backButton: { padding: 4 },
    stepText: { color: '#fff', fontSize: 16, fontWeight: '500' },
    skipText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 10 },
    progressIcon: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    activeProgress: { backgroundColor: '#fff', borderColor: '#fff' },
    progressLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
        overflow: 'hidden'
    },
    scrollContent: { padding: 24, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center', lineHeight: 22 },

    primaryButton: {
        width: '100%', height: 56, backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    primaryButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },

    secondaryButton: {
        width: '100%', height: 56, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center'
    },
    secondaryButtonText: { color: '#64748B', fontSize: 16 },
});

export default ConnectDevicesScreen;
