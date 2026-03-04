import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateAssessmentScore, updateOnboarding } from '../../api/authApi';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const SECTIONS = [
    { id: 1, icon: 'person-outline', title: 'Personal Demographics', desc: 'Basic patient profile' },
    { id: 2, icon: 'body-outline', title: 'Body Measurements', desc: 'Anthropometric data' },
    { id: 3, icon: 'medical-outline', title: 'Blood Pressure', desc: 'Hypertension status' },
    { id: 4, icon: 'flask-outline', title: 'Lipid Profile', desc: 'Cholesterol levels' },
    { id: 5, icon: 'water-outline', title: 'Diabetes Assessment', desc: 'Blood sugar control' },
    { id: 6, icon: 'heart-half-outline', title: 'CVD History', desc: 'Cardiovascular events' },
    { id: 7, icon: 'walk-outline', title: 'Lifestyle Factors', desc: 'Habits and physical activity' },
    { id: 8, icon: 'analytics-outline', title: 'Advanced Biomarkers', desc: 'Inflammation & renal function' },
    { id: 9, icon: 'pulse-outline', title: 'Organ Assessment', desc: 'Target organ damage' }
];

export default function CardioAssessmentScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { userToken, setAuthToken } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);

    const progressWidth = useSharedValue(0);

    useEffect(() => {
        progressWidth.value = withTiming(((currentStep + 1) / SECTIONS.length) * 100 + '%', {
            duration: 500,
            easing: Easing.out(Easing.quad)
        });
    }, [currentStep]);

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: progressWidth.value as any
        };
    });

    // Get user details passed from SignUp screen
    const { token, user } = route.params || {};

    // Basic Form State (Steps 1-3)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: '',
        sex: '',
        menopause: '',
        race: '',
        country: '',

        height: '',
        weight: '',
        waist: '',
        hip: '',
        mac: '',

        sbp: '',
        dbp: '',
        htnStatus: '',
        bpMeds: '',
        bpNumMeds: '',

        tc: '',
        ldl: '',
        hdl: '',
        trig: '',

        dmStatus: '',
        hba1c: '',
        fbg: '',

        cvdHist: '',
        fhCvd: '',

        smoking: '',
        alcohol: '',
        activity: '',
        diet: '',

        crp: '',
        egfr: '',
        microalbumin: '',

        lvh: '',
        plaque: '',
        abi: ''
    });

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const calcBMI = () => {
        if (formData.height && formData.weight) {
            const h = parseFloat(formData.height) / 100;
            const w = parseFloat(formData.weight);
            if (h > 0) return (w / (h * h)).toFixed(1);
        }
        return '—';
    };

    const calcWHR = () => {
        if (formData.waist && formData.hip) {
            const w = parseFloat(formData.waist);
            const h = parseFloat(formData.hip);
            if (h > 0) return (w / h).toFixed(2);
        }
        return '—';
    };

    const validateStep = () => {
        let isValid = true;
        switch (currentStep) {
            case 0:
                if (!formData.age || !formData.sex || !formData.race) isValid = false;
                break;
            case 1:
                if (!formData.height || !formData.weight || !formData.waist) isValid = false;
                break;
            case 2:
                if (!formData.sbp || !formData.htnStatus || !formData.bpMeds) isValid = false;
                break;
            case 3:
                if (!formData.tc || !formData.hdl) isValid = false;
                break;
            case 4:
                if (!formData.dmStatus) isValid = false;
                break;
            case 5:
                if (!formData.cvdHist || !formData.fhCvd) isValid = false;
                break;
            case 6:
                if (!formData.smoking || !formData.alcohol || !formData.activity || !formData.diet) isValid = false;
                break;
        }

        if (!isValid) {
            Alert.alert('Missing Information', 'Please fill out all required fields marked with * before continuing.');
        }
        return isValid;
    };

    const nextStep = async () => {
        if (!validateStep()) return;

        if (currentStep < SECTIONS.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            // Calculate and show results
            const effectiveToken = token || userToken;
            try {
                if (effectiveToken) {
                    const scoreData = await calculateAssessmentScore(formData, effectiveToken);
                    navigation.navigate('AssessmentResults', { token: effectiveToken, user, formData, scoreData });
                    console.log('Finished with API Score', scoreData);
                } else {
                    // Fallback if token missing
                    navigation.navigate('AssessmentResults', { token: null, user, formData });
                }
            } catch (e) {
                console.error(e);
                // Navigate anyway with fallback dummy data to not block the user
                navigation.navigate('AssessmentResults', { token: effectiveToken, user, formData });
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(curr => curr - 1);
    };

    const skipAssessment = async () => {
        const effectiveToken = token || userToken;
        if (effectiveToken && user) {
            // Use -1 to flag that the user explicitly skipped
            const updatedProfile = { ...(user.profile || {}), healthScore: -1 };
            const updatedUser = { ...user, profile: updatedProfile };

            try {
                // Save this flag to the backend permanently so the user isn't trapped next session
                await updateOnboarding({ healthScore: -1 });
            } catch (e) {
                console.warn('Could not sync skip status to backend', e);
            }

            await setAuthToken(effectiveToken, updatedUser);
        }

        navigation.reset({
            index: 0,
            routes: [{
                name: 'Main',
                params: {
                    screen: 'Home',
                    params: { skippedAssessment: true }
                }
            }],
        });
    };

    const renderOption = (key: string, label: string, value: string, sublabel?: string, flexOption?: boolean) => {
        const isSelected = formData[key as keyof typeof formData] === value;
        return (
            <TouchableOpacity
                style={[
                    styles.radioCard,
                    isSelected && styles.radioCardSelected,
                    flexOption && { flex: 1, marginRight: 8 }
                ]}
                onPress={() => updateForm(key, value)}
                activeOpacity={0.7}
            >
                <View style={[styles.radioDot, isSelected && styles.radioDotSelected]}>
                    {isSelected && <View style={styles.radioDotInner} />}
                </View>
                <View style={styles.radioTextContainer}>
                    <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>{label}</Text>
                    {sublabel && <Text style={styles.radioSubText}>{sublabel}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Age <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 45" keyboardType="numeric" value={formData.age} onChangeText={(t) => updateForm('age', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Biological Sex <Text style={styles.req}>*</Text></Text>
                            <View style={styles.row}>
                                {renderOption('sex', 'Male', 'male', undefined, true)}
                                {renderOption('sex', 'Female', 'female', undefined, true)}
                            </View>
                        </View>

                        {formData.sex === 'female' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Menopausal Status</Text>
                                <Text style={styles.hintText}>Females only — affects risk stratification</Text>
                                {renderOption('menopause', 'Pre-menopausal', 'pre')}
                                {renderOption('menopause', 'Post-menopausal', 'post', 'Increases cardiovascular risk')}
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ethnicity <Text style={styles.req}>*</Text></Text>
                            {renderOption('race', 'White / South Asian / Other', 'white')}
                            {renderOption('race', 'African / Afro-Caribbean', 'black')}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Country of Residence</Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. India, UK, USA" value={formData.country} onChangeText={(t) => updateForm('country', t)} />
                        </View>
                    </Animated.View>
                );
            case 1:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Height (cm) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 170" keyboardType="numeric" value={formData.height} onChangeText={(t) => updateForm('height', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Weight (kg) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 75" keyboardType="numeric" value={formData.weight} onChangeText={(t) => updateForm('weight', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>BMI (auto-calculated)</Text>
                            <TextInput style={[styles.input, styles.readOnlyInput]} value={calcBMI()} editable={false} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Waist (cm) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 90" keyboardType="numeric" value={formData.waist} onChangeText={(t) => updateForm('waist', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hip (cm)</Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 100" keyboardType="numeric" value={formData.hip} onChangeText={(t) => updateForm('hip', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Waist-to-Hip Ratio</Text>
                            <TextInput style={[styles.input, styles.readOnlyInput]} value={calcWHR()} editable={false} />
                        </View>
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroupRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Systolic BP <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 130" keyboardType="numeric" value={formData.sbp} onChangeText={(t) => updateForm('sbp', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Diastolic BP</Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 85" keyboardType="numeric" value={formData.dbp} onChangeText={(t) => updateForm('dbp', t)} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hypertension Status <Text style={styles.req}>*</Text></Text>
                            {renderOption('htnStatus', 'No hypertension', 'none')}
                            {renderOption('htnStatus', 'Controlled', 'controlled', '<140/90 on med')}
                            {renderOption('htnStatus', 'Uncontrolled', 'uncontrolled', '≥140/90 on med')}
                            {renderOption('htnStatus', 'Resistant', 'resistant', '≥3 meds')}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>On BP Medications? <Text style={styles.req}>*</Text></Text>
                            <View style={styles.row}>
                                {renderOption('bpMeds', 'No', 'no', undefined, true)}
                                {renderOption('bpMeds', 'Yes', 'yes', undefined, true)}
                            </View>
                        </View>

                        {formData.bpMeds === 'yes' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Number of BP Medications</Text>
                                <View style={styles.row}>
                                    {renderOption('bpNumMeds', '1', '1', undefined, true)}
                                    {renderOption('bpNumMeds', '2', '2', undefined, true)}
                                    {renderOption('bpNumMeds', '3+', '3', undefined, true)}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroupRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Total Cholesterol (mg/dL) <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 200" keyboardType="numeric" value={formData.tc} onChangeText={(t) => updateForm('tc', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>LDL (mg/dL)</Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 120" keyboardType="numeric" value={formData.ldl} onChangeText={(t) => updateForm('ldl', t)} />
                            </View>
                        </View>
                        <View style={styles.inputGroupRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>HDL (mg/dL) <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 50" keyboardType="numeric" value={formData.hdl} onChangeText={(t) => updateForm('hdl', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Triglycerides (mg/dL)</Text>
                                <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 150" keyboardType="numeric" value={formData.trig} onChangeText={(t) => updateForm('trig', t)} />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 4:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Diabetes Status <Text style={styles.req}>*</Text></Text>
                            {renderOption('dmStatus', 'No Diabetes', 'none')}
                            {renderOption('dmStatus', 'Pre-diabetes', 'pre')}
                            {renderOption('dmStatus', 'Type 2 Diabetes', 't2dm')}
                            {renderOption('dmStatus', 'Type 1 Diabetes', 't1dm')}
                        </View>
                        {formData.dmStatus && formData.dmStatus !== 'none' && (
                            <View style={styles.inputGroupRow}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>HbA1c (%)</Text>
                                    <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 6.5" keyboardType="numeric" value={formData.hba1c} onChangeText={(t) => updateForm('hba1c', t)} />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Fasting Glucose (mg/dL)</Text>
                                    <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 110" keyboardType="numeric" value={formData.fbg} onChangeText={(t) => updateForm('fbg', t)} />
                                </View>
                            </View>
                        )}
                    </Animated.View>
                );
            case 5:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Prior Cardiovascular Event <Text style={styles.req}>*</Text></Text>
                            <Text style={styles.hintText}>Heart attack, stroke, bypass, stenting, angina</Text>
                            {renderOption('cvdHist', 'No prior CVD', 'none')}
                            {renderOption('cvdHist', 'Established CVD', 'yes')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Premature Family History of CVD <Text style={styles.req}>*</Text></Text>
                            <Text style={styles.hintText}>1st degree relative: Male {'<'}55 / Female {'<'}65</Text>
                            {renderOption('fhCvd', 'No / Unknown', 'no')}
                            {renderOption('fhCvd', 'Yes (1 relative)', '1')}
                            {renderOption('fhCvd', 'Yes (≥2 relatives)', '2')}
                        </View>
                    </Animated.View>
                );
            case 6:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Smoking Status <Text style={styles.req}>*</Text></Text>
                            {renderOption('smoking', 'Never smoked', 'never')}
                            {renderOption('smoking', 'Former smoker', 'former')}
                            {renderOption('smoking', 'Current smoker', 'current')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Alcohol Consumption <Text style={styles.req}>*</Text></Text>
                            {renderOption('alcohol', 'None / Occasional', 'low')}
                            {renderOption('alcohol', 'Moderate (<14u/wk)', 'moderate')}
                            {renderOption('alcohol', 'Heavy (≥14u/wk)', 'heavy')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Physical Activity <Text style={styles.req}>*</Text></Text>
                            <Text style={styles.hintText}>Moderate intensity exercise per week</Text>
                            {renderOption('activity', 'Active (≥150 min/wk)', 'active')}
                            {renderOption('activity', 'Insufficient (<150 min/wk)', 'insufficient')}
                            {renderOption('activity', 'Sedentary', 'sedentary')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Diet Quality <Text style={styles.req}>*</Text></Text>
                            {renderOption('diet', 'Healthy (Med/DASH)', 'healthy')}
                            {renderOption('diet', 'Average', 'average')}
                            {renderOption('diet', 'Poor (High fat/sugar)', 'poor')}
                        </View>
                    </Animated.View>
                );
            case 7:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>High-sensitivity CRP (mg/L)</Text>
                            <Text style={styles.hintText}>Marker of systemic inflammation</Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 1.5" keyboardType="numeric" value={formData.crp} onChangeText={(t) => updateForm('crp', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Estimated GFR (mL/min/1.73m²)</Text>
                            <Text style={styles.hintText}>Renal function {'>'}60 is normal</Text>
                            <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.5)" placeholder="e.g. 90" keyboardType="numeric" value={formData.egfr} onChangeText={(t) => updateForm('egfr', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Microalbuminuria</Text>
                            {renderOption('microalbumin', 'Negative / Normal', 'negative')}
                            {renderOption('microalbumin', 'Positive (30-300 mg/g)', 'positive')}
                        </View>
                    </Animated.View>
                );
            case 8:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Left Ventricular Hypertrophy (LVH)</Text>
                            <Text style={styles.hintText}>Determined via ECG or Echo</Text>
                            {renderOption('lvh', 'No', 'no')}
                            {renderOption('lvh', 'Yes', 'yes')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Carotid Plaque / IMT {'>'}0.9mm</Text>
                            <Text style={styles.hintText}>Determined via ultrasound</Text>
                            {renderOption('plaque', 'No', 'no')}
                            {renderOption('plaque', 'Yes', 'yes')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ankle-Brachial Index (ABI) {'<'}0.9</Text>
                            <Text style={styles.hintText}>Indicator of peripheral artery disease</Text>
                            {renderOption('abi', 'Normal (≥0.9)', 'normal')}
                            {renderOption('abi', 'Abnormal (<0.9)', 'abnormal')}
                        </View>
                    </Animated.View>
                );
            default:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <Text style={{ color: '#fff' }}>Section implementation in progress...</Text>
                    </Animated.View>
                );
        }
    };

    const section = SECTIONS[currentStep];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#51A6CB', '#BF40A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.background}
            />
            <SafeAreaView style={styles.contentContainer} edges={['bottom', 'left', 'right']}>
                {/* Top Bar with Progress */}
                <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) }]}>
                    <View style={styles.topBarInner}>
                        <Text style={styles.miniBrand}>🫀 CVITAL™</Text>
                        <View style={styles.progressWrap}>
                            <View style={styles.progressLabel}>
                                <Text style={styles.progressText}>Section {currentStep + 1} of {SECTIONS.length} — {section.title}</Text>
                                <Text style={styles.progressText}>{Math.round(((currentStep + 1) / SECTIONS.length) * 100)}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
                            </View>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name={section.icon as any} size={24} color="#10d98a" />
                            </View>
                            <View style={styles.sectionTitleWrap}>
                                <Text style={styles.sectionNum}>SECTION 0{currentStep + 1}</Text>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionDesc}>{section.desc}</Text>
                            </View>
                        </View>

                        {/* Specific Step Content */}
                        {renderStep()}

                        {/* Nav Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.btnBack, currentStep === 0 && { opacity: 1 }]}
                                onPress={currentStep === 0 ? skipAssessment : prevStep}
                            >
                                <Text style={styles.btnBackText}>{currentStep === 0 ? 'Skip' : 'Back'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnNext} onPress={nextStep}>
                                <LinearGradient colors={['#10d98a', '#0ab87a']} style={styles.btnNextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.btnNextText}>{currentStep === SECTIONS.length - 1 ? 'Calculate Score' : 'Continue'}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#000" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
    },
    topBar: {
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: 'transparent'
    },
    topBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniBrand: {
        color: '#10d98a',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 16,
        letterSpacing: 1
    },
    progressWrap: {
        flex: 1,
    },
    progressLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        color: '#6b7280',
        fontSize: 11,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#111520',
        borderRadius: 2,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10d98a', // Actually it was gradient in CSS, but solid is fine
        borderRadius: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    sectionIcon: {
        width: 52,
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sectionTitleWrap: {
        flex: 1,
    },
    sectionNum: {
        color: '#10d98a',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 4,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold', // Using system font instead of DM Serif Display for now
    },
    sectionDesc: {
        color: '#6b7280',
        fontSize: 13,
        marginTop: 4,
    },
    stepContent: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputGroupRow: {
        flexDirection: 'row',
    },
    label: {
        color: '#e4e8f5',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    req: {
        color: '#f04f4f',
    },
    hintText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginBottom: 8,
        marginTop: -4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 18,
        color: '#fff',
        fontSize: 16,
    },
    readOnlyInput: {
        color: '#10d98a',
        backgroundColor: 'rgba(16,217,138,0.12)',
        borderColor: 'rgba(16,217,138,0.2)',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    radioCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    radioCardSelected: {
        borderColor: '#10d98a',
        backgroundColor: 'rgba(16,217,138,0.12)',
    },
    radioDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.12)',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDotSelected: {
        borderColor: '#10d98a',
        backgroundColor: '#10d98a',
    },
    radioDotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
    },
    radioTextContainer: {
        flex: 1,
    },
    radioText: {
        color: '#ffffff',
        fontSize: 14,
    },
    radioTextSelected: {
        fontWeight: '600',
    },
    radioSubText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 16,
    },
    btnBack: {
        flex: 1,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnBackText: {
        color: '#e4e8f5',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    btnNext: {
        flex: 1,
        shadowColor: '#10d98a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    btnNextGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    btnNextText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
        letterSpacing: 0.5
    }
});
