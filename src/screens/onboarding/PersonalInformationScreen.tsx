import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInformationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { token, user } = route.params || {};

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState(''); // Male, Female, Others, Prefer not to say
    const [dob, setDob] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date(2000, 0, 1)); // Default to 2000-01-01
    const [phone, setPhone] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleNext = () => {
        navigation.navigate('HealthConditions', { 
            token, user, 
            personalInfo: { firstName, lastName, gender, dob, phone, height, weight, bloodGroup, city, country } 
        });
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateObj(selectedDate);
            // Format as DD/MM/YYYY
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDob(`${day}/${month}/${year}`);
        }
    };

    const GenderButton = ({ label }: { label: string }) => (
        <TouchableOpacity
            style={[styles.genderButton, gender === label && styles.genderButtonSelected]}
            onPress={() => setGender(label)}
        >
            <Text style={[styles.genderText, gender === label && styles.genderTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    const BloodGroupButton = ({ label }: { label: string }) => (
        <TouchableOpacity
            style={[styles.bloodButton, bloodGroup === label && styles.bloodButtonSelected]}
            onPress={() => setBloodGroup(label)}
        >
            <Text style={[styles.bloodText, bloodGroup === label && styles.bloodTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

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
                        <Text style={styles.stepText}>Steps 1 of 4</Text>
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
                        <View style={styles.progressIcon}>
                            <Ionicons name="medical-outline" size={16} color="#fff" />
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
                    <Text style={styles.title}>Personal Information</Text>
                    <Text style={styles.subtitle}>Help us personalize your wellness experience</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
                        </View>
                    </View>

                    <Text style={styles.label}>Gender (Optional)</Text>
                    <View style={styles.genderRow}>
                        <GenderButton label="Male" />
                        <GenderButton label="Female" />
                        <GenderButton label="Others" />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date Of Birth (Optional)</Text>
                        <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                            <Text style={[styles.input, !dob && { color: '#64748B', borderWidth: 0 }]}>
                                {dob || "DD/MM/YYYY"}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dateObj}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeDate}
                            maximumDate={new Date()}
                        />
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone number</Text>
                        <TextInput style={styles.input} placeholder="+1 234 567 890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    </View>

                    <Text style={styles.label}>Blood Group (Optional)</Text>
                    <View style={styles.bloodRow}>
                        {BLOOD_GROUPS.map(bg => <BloodGroupButton key={bg} label={bg} />)}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City (Optional)</Text>
                            <TextInput style={styles.input} placeholder="e.g. London" value={city} onChangeText={setCity} />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Country (Optional)</Text>
                            <TextInput style={styles.input} placeholder="e.g. UK" value={country} onChangeText={setCountry} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Height (cm) (Optional)</Text>
                            <TextInput style={styles.input} placeholder="cm" value={height} onChangeText={setHeight} keyboardType="numeric" />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Weight (kg) (Optional)</Text>
                            <TextInput style={styles.input} placeholder="kg" value={weight} onChangeText={setWeight} keyboardType="numeric" />
                        </View>
                    </View>

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

    row: { flexDirection: 'row', marginBottom: 16 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 12, color: '#64748B', marginBottom: 6 },
    input: {
        borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12,
        height: 48, fontSize: 14, color: '#1E293B'
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
        borderRadius: 12, paddingHorizontal: 16, height: 52, backgroundColor: '#fff'
    },

    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    genderButton: {
        flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
    },
    genderButtonSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6', shadowColor: '#3B82F6', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    genderText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    genderTextSelected: { color: '#fff', fontWeight: '700' },

    bloodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    bloodButton: {
        flex: 1, minWidth: '22%', height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
    },
    bloodButtonSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6', shadowColor: '#3B82F6', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    bloodText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    bloodTextSelected: { color: '#fff', fontWeight: '700' },


    nextButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        height: 56, borderRadius: 16, marginTop: 20, gap: 8
    },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PersonalInformationScreen;
