import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const HealthConditionsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { token, user, personalInfo } = route.params || {};

    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [otherCondition, setOtherCondition] = useState('');

    const conditions = [
        "Diabetes ( Type 1 or Type 2 )",
        "Hypertension",
        "Cardiac Condition",
        "Respiratory condition ( COPD, Asthma)",
        "Mental Health ( Anxiety, Depression)",
        "Weight management needed",
        "High cholesterol or lipid issues",
        "Cancer survivor or in treatment",
        "None of the above"
    ];

    const toggleCondition = (condition: string) => {
        if (selectedConditions.includes(condition)) {
            setSelectedConditions(selectedConditions.filter(c => c !== condition));
        } else {
            if (condition === "None of the above") {
                setSelectedConditions(["None of the above"]);
            } else {
                const newSelection = selectedConditions.filter(c => c !== "None of the above");
                newSelection.push(condition);
                setSelectedConditions(newSelection);
            }
        }
    };

    const handleNext = () => {
        navigation.navigate('HealthGoals', { token, user, personalInfo, healthConditions: { selected: selectedConditions, other: otherCondition } });
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
                        <Text style={styles.stepText}>Steps 2 of 4</Text>
                        <TouchableOpacity onPress={handleNext}>
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
                        <View style={styles.progressIcon}>
                            <Ionicons name="golf-outline" size={16} color="#fff" />
                        </View>
                        <View style={styles.progressLine} />
                        <View style={styles.progressIcon}>
                            <Ionicons name="phone-portrait-outline" size={16} color="#fff" />
                        </View>
                    </View>

                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Health Conditions</Text>
                    <Text style={styles.subtitle}>Select your primary health conditions</Text>

                    {conditions.map((condition) => (
                        <TouchableOpacity
                            key={condition}
                            style={[styles.optionCard, selectedConditions.includes(condition) && styles.optionCardSelected]}
                            onPress={() => toggleCondition(condition)}
                        >
                            <View style={[styles.checkbox, selectedConditions.includes(condition) && styles.checkboxSelected]}>
                                {selectedConditions.includes(condition) && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={[styles.optionText, selectedConditions.includes(condition) && styles.optionTextSelected]}>
                                {condition}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TextInput
                        style={styles.textArea}
                        placeholder="Any allergies or medical history..."
                        multiline
                        numberOfLines={3}
                        value={otherCondition}
                        onChangeText={setOtherCondition}
                    />

                    <TouchableOpacity onPress={handleNext}>
                        <LinearGradient
                            colors={['#60A5FA', '#8B5CF6']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.nextButton}
                        >
                            <Text style={styles.nextButtonText}>Next</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
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
    scrollContent: { padding: 24, paddingTop: 32 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },

    optionCard: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1,
        borderColor: '#E2E8F0', marginBottom: 12
    },
    optionCardSelected: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
    checkbox: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1',
        marginRight: 12, justifyContent: 'center', alignItems: 'center'
    },
    checkboxSelected: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    optionText: { fontSize: 14, color: '#1E293B' },
    optionTextSelected: { color: '#6366F1', fontWeight: '500' },

    textArea: {
        borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, height: 100,
        textAlignVertical: 'top', marginTop: 12, marginBottom: 12
    },

    nextButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        height: 56, borderRadius: 16, marginTop: 20, gap: 8
    },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default HealthConditionsScreen;
