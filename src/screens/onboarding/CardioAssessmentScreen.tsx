import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateAssessmentScore, updateOnboarding } from '../../api/authApi';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const SECTIONS = [
    { id: 1, icon: 'person', title: 'Personal Demographics', desc: 'Basic Patient Profile' },
    { id: 2, icon: 'body', title: 'Body Measurements', desc: 'Anthropometric data' },
    { id: 3, icon: 'medical', title: 'Blood Pressure', desc: 'Hypertension status' },
    { id: 4, icon: 'flask', title: 'Lipid Profile', desc: 'Cholesterol levels' },
    { id: 5, icon: 'water', title: 'Diabetes Assessment', desc: 'Blood sugar control' },
    { id: 6, icon: 'heart-half', title: 'CVD History', desc: 'Cardiovascular events' },
    { id: 7, icon: 'walk', title: 'Lifestyle Factors', desc: 'Habits and physical activity' },
    { id: 8, icon: 'analytics', title: 'Advanced Biomarkers', desc: 'Inflammation & renal function' },
    { id: 9, icon: 'pulse', title: 'Organ Assessment', desc: 'Target organ damage' }
];

export default function CardioAssessmentScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { userToken, setAuthToken } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);

    const progressWidth = useSharedValue(0);

    useEffect(() => {
        progressWidth.value = withTiming(((currentStep + 1) / SECTIONS.length) * 100, {
            duration: 500,
            easing: Easing.out(Easing.quad)
        });
    }, [currentStep]);

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value}%`
        };
    });

    // Get user details passed from SignUp screen
    const { token, user } = route.params || {};

    // Basic Form State
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
        neck: '',
        bodyFat: '',

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

    const calcBodyFat = () => {
        const h = parseFloat(formData.height);
        const w = parseFloat(formData.waist);
        const n = parseFloat(formData.neck);
        const hip = parseFloat(formData.hip);
        const isFemale = formData.sex === 'female';

        if (!h || !w || !n || (isFemale && !hip)) return '';

        let bf = 0;
        if (isFemale) {
            // US Navy Female formula (cm)
            bf = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
        } else {
            // US Navy Male formula (cm)
            bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
        }
        return bf > 0 ? bf.toFixed(1) : '0.0';
    };

    const nextStep = async () => {
        if (!validateStep()) return;

        if (currentStep < SECTIONS.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            const effectiveToken = token || userToken;
            try {
                if (effectiveToken) {
                    // Auto-calculate body fat if not manually provided
                    const calculatedBF = calcBodyFat();
                    const submissionData = {
                        ...formData,
                        bodyFat: formData.bodyFat || calculatedBF
                    };
                    const scoreData = await calculateAssessmentScore(submissionData, effectiveToken);
                    navigation.navigate('AssessmentResults', { token: effectiveToken, user, formData: submissionData, scoreData });
                } else {
                    navigation.navigate('AssessmentResults', { token: null, user, formData });
                }
            } catch (e) {
                console.error(e);
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
            const updatedProfile = { ...(user.profile || {}), healthScore: -1 };
            const updatedUser = { ...user, profile: updatedProfile };
            try {
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
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 45" keyboardType="numeric" value={formData.age} onChangeText={(t) => updateForm('age', t)} />
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
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. India, UK, USA" value={formData.country} onChangeText={(t) => updateForm('country', t)} />
                        </View>
                    </Animated.View>
                );
            case 1:
                return (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Height (cm) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 170" keyboardType="numeric" value={formData.height} onChangeText={(t) => updateForm('height', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Weight (kg) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 75" keyboardType="numeric" value={formData.weight} onChangeText={(t) => updateForm('weight', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>BMI (auto-calculated)</Text>
                            <TextInput style={[styles.input, styles.readOnlyInput]} value={calcBMI()} editable={false} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Waist (cm) <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 90" keyboardType="numeric" value={formData.waist} onChangeText={(t) => updateForm('waist', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hip (cm)</Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 100" keyboardType="numeric" value={formData.hip} onChangeText={(t) => updateForm('hip', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Neck Circumference (cm)</Text>
                            <Text style={styles.hintText}>Used to calc Body Fat %</Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 38" keyboardType="numeric" value={formData.neck} onChangeText={(t) => updateForm('neck', t)} />
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Body Fat % (Auto)</Text>
                                <TextInput style={[styles.input, styles.readOnlyInput]} value={calcBodyFat()} editable={false} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Manual Body Fat %</Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="Override" keyboardType="numeric" value={formData.bodyFat} onChangeText={(t) => updateForm('bodyFat', t)} />
                            </View>
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
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Systolic BP <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 130" keyboardType="numeric" value={formData.sbp} onChangeText={(t) => updateForm('sbp', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Diastolic BP</Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 85" keyboardType="numeric" value={formData.dbp} onChangeText={(t) => updateForm('dbp', t)} />
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
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Total Cholesterol <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 200" keyboardType="numeric" value={formData.tc} onChangeText={(t) => updateForm('tc', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>LDL</Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 100" keyboardType="numeric" value={formData.ldl} onChangeText={(t) => updateForm('ldl', t)} />
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>HDL <Text style={styles.req}>*</Text></Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 50" keyboardType="numeric" value={formData.hdl} onChangeText={(t) => updateForm('hdl', t)} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Triglycerides</Text>
                                <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 150" keyboardType="numeric" value={formData.trig} onChangeText={(t) => updateForm('trig', t)} />
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
                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>HbA1c (%)</Text>
                                    <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 6.5" keyboardType="numeric" value={formData.hba1c} onChangeText={(t) => updateForm('hba1c', t)} />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Fasting Glucose</Text>
                                    <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 100" keyboardType="numeric" value={formData.fbg} onChangeText={(t) => updateForm('fbg', t)} />
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
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 1.5" keyboardType="numeric" value={formData.crp} onChangeText={(t) => updateForm('crp', t)} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Estimated GFR (mL/min/1.73m²)</Text>
                            <Text style={styles.hintText}>Renal function {'>'}60 is normal</Text>
                            <TextInput style={styles.input} placeholderTextColor="#94A3B8" placeholder="e.g. 90" keyboardType="numeric" value={formData.egfr} onChangeText={(t) => updateForm('egfr', t)} />
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
                            <Text style={styles.label}>Carotid Plaque / IMT \u003e0.9mm</Text>
                            <Text style={styles.hintText}>Determined via ultrasound</Text>
                            {renderOption('plaque', 'No', 'no')}
                            {renderOption('plaque', 'Yes', 'yes')}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ankle-Brachial Index (ABI) \u003c0.9</Text>
                            <Text style={styles.hintText}>Indicator of peripheral artery disease</Text>
                            {renderOption('abi', 'Normal (≥0.9)', 'normal')}
                            {renderOption('abi', 'Abnormal (<0.9)', 'abnormal')}
                        </View>
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    const section = SECTIONS[currentStep];

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
                        <TouchableOpacity onPress={() => currentStep === 0 ? navigation.goBack() : prevStep()} style={styles.backIconButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>CVITAL</Text>
                            <View style={styles.logoBadge} />
                        </View>

                        <View style={styles.stepBadge}>
                            <Text style={styles.stepBadgeText}>{currentStep + 1}/{SECTIONS.length}</Text>
                        </View>
                    </View>

                    <View style={styles.headerInfo}>
                        <Text style={styles.profileSetupLabel}>Profile Setup</Text>
                        <Text style={styles.percentageText}>{Math.round(((currentStep + 1) / SECTIONS.length) * 100)}%</Text>
                    </View>

                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.sectionTitleRow}>
                        <View style={styles.sectionIconContainer}>
                            <Ionicons name={section.icon as any} size={28} color="#fff" />
                        </View>
                        <View style={styles.sectionTitleTextContainer}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionDesc}>{section.desc}</Text>
                        </View>
                    </View>

                    {renderStep()}

                    <View style={styles.footerButtons}>
                        <TouchableOpacity 
                            style={styles.outlineButton} 
                            onPress={currentStep === 0 ? skipAssessment : prevStep}
                        >
                            <Text style={styles.outlineButtonText}>{currentStep === 0 ? 'Skip' : 'Back'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.nextButtonContainer} onPress={nextStep}>
                            <LinearGradient
                                colors={['#60A5FA', '#8B5CF6']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.gradientButtonText}>
                                    {currentStep === SECTIONS.length - 1 ? 'Calculate Score' : 'Continue'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8B5CF6' },
    headerGradient: { paddingBottom: 40 },
    headerSafeArea: { paddingHorizontal: 24, paddingTop: 10 },
    headerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
    },
    backIconButton: { padding: 4 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
    logoBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginLeft: 4, marginTop: -10 },
    stepBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
    },
    stepBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    headerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
    profileSetupLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
    percentageText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },

    contentCard: {
        flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        marginTop: -30, overflow: 'hidden'
    },
    scrollContent: { padding: 24, paddingTop: 32 },
    
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    sectionIconContainer: {
        width: 56, height: 56, borderRadius: 16, backgroundColor: '#8B5CF6',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    sectionTitleTextContainer: { flex: 1 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    sectionDesc: { fontSize: 13, color: '#64748B' },

    stepContent: { marginBottom: 24 },
    inputRow: { flexDirection: 'row', marginBottom: 16 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
    req: { color: '#EF4444' },
    hintText: { fontSize: 12, color: '#64748B', marginBottom: 10, marginTop: -4 },
    input: {
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16,
        height: 54, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC'
    },
    readOnlyInput: { backgroundColor: '#F1F5F9', color: '#64748B' },

    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    radioCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, marginBottom: 12
    },
    radioCardSelected: { backgroundColor: '#F5F3FF', borderColor: '#8B5CF6' },
    radioDot: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    radioDotSelected: { borderColor: '#8B5CF6' },
    radioDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8B5CF6' },
    radioTextContainer: { flex: 1 },
    radioText: { fontSize: 14, color: '#475569' },
    radioTextSelected: { color: '#1E293B', fontWeight: '600' },
    radioSubText: { fontSize: 12, color: '#64748B', marginTop: 2 },

    footerButtons: { flexDirection: 'row', gap: 16, marginTop: 10, paddingBottom: 20 },
    outlineButton: {
        flex: 1, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center'
    },
    outlineButtonText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
    nextButtonContainer: { flex: 1.5 },
    gradientButton: {
        height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center'
    },
    gradientButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
