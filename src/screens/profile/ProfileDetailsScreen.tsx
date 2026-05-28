import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../auth/AuthContext';
import client from '../../api/client';

const PLAN_COLORS: Record<string, string[]> = {
    free: ['#9CA3AF', '#6B7280'],
    premium: ['#94A3B8', '#64748B'],
    pro: ['#FBBF24', '#D97706'],
    family: ['#C084FC', '#9333EA'],
    trial: ['#34D399', '#059669'],
    standard: ['#60A5FA', '#2563EB'],
    growth: ['#A78BFA', '#7C3AED'],
    enterprise: ['#38BDF8', '#0284C7']
};

const ProfileDetailsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user, subscription, currentPlan, setAuthToken, userToken } = useAuth();

    // Mock user details populated from backend/state
    const [firstName, setFirstName] = useState(user?.profile?.firstName || user?.name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(user?.profile?.lastName || user?.name?.split(' ').slice(1).join(' ') || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.profile?.phoneNumber || '');

    // Parse Date for display 
    let initialDob = '';
    if (user?.profile?.dateOfBirth) {
        const d = new Date(user.profile.dateOfBirth);
        initialDob = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
    const [dob, setDob] = useState(initialDob);

    const [gender, setGender] = useState(user?.profile?.gender || '');
    const [bloodGroup, setBloodGroup] = useState(user?.profile?.bloodGroup || '');
    const [city, setCity] = useState(user?.profile?.city || '');
    const [country, setCountry] = useState(user?.profile?.country || '');
    const [height, setHeight] = useState(user?.profile?.height?.toString() || '');
    const [weight, setWeight] = useState(user?.profile?.weight?.toString() || '');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Photo upload not yet available — avatar tap is intentionally a no-op
    const handlePickPhoto = () => {};
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj, setDateObj] = useState(user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : new Date(2000, 0, 1));

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const GENDERS = ['Male', 'Female', 'Other'];

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateObj(selectedDate);
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDob(`${day}/${month}/${year}`);
        }
    };

    const handleSave = async () => {
        if (!firstName || !lastName) {
            Alert.alert("Required Fields", "Please enter both your first and last name.");
            return;
        }
        setIsSaving(true);
        try {
            // Reformat DOB back to ISO if provided, else undefined
            // Construct profile object and remove any empty string fields to avoid backend enum validation errors
            const profileData: any = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phone.trim() || undefined,
                gender: gender ? gender.toLowerCase() : undefined,
                bloodGroup: bloodGroup || undefined,
                city: city.trim() || undefined,
                country: country.trim() || undefined,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined
            };

            // Only add date if valid
            if (dob) {
                const date = new Date(dob.split('/').reverse().join('-'));
                if (!isNaN(date.getTime())) {
                    profileData.dateOfBirth = date;
                }
            }

            const updatedData = { profile: profileData };

            const response = await client.patch('/api/users/updateMe', updatedData);

            // Assuming response contains updated user, update global context
            if (response.data?.data?.user && userToken) {
                await setAuthToken(userToken, response.data.data.user);
            }

            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, value, onChangeText, keyboardType = 'default', editable = true, icon }: any) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapperField, !editable && styles.inputDisabled]}>
                {icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    editable={editable}
                    placeholder={`Enter ${label}`}
                    placeholderTextColor="#94A3B8"
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                locations={[0, 0.28, 0.7, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Information</Text>
                    <View style={{ width: 36 }} />
                </View>

                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85} style={styles.avatarTouchable}>
                        <View style={styles.avatarCircle}>
                            {photoUri ? (
                                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarInitials}>
                                    {(firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={13} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarName}>{firstName} {lastName}</Text>
                    <Text style={styles.avatarHint}>Tap photo to change</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Subscription Info Card */}
                {(() => {
                    const isCorporate = user?.customerType === 'corporate';
                    const activePlan = currentPlan;

                    const term = isCorporate
                        ? (user?.corporateSubscription?.term || '1_month')
                        : (user?.subscriptionTerm || '1_month');
                    const formattedTerm = term.replace('_', ' ');

                    const validUntilStr = isCorporate
                        ? user?.corporateSubscription?.validUntil
                        : user?.subscriptionValidUntil;
                    let validUntil = 'Lifetime';
                    if (validUntilStr) {
                        const dateObj = new Date(validUntilStr);
                        validUntil = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    }

                    const subColors = (PLAN_COLORS[activePlan] || ['#6366F1', '#4F46E5']) as [string, string];

                    return (
                        <LinearGradient
                            colors={subColors}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.subCard}
                        >
                            <View style={styles.subCardTop}>
                                <View>
                                    <Text style={styles.subCardLabel}>
                                        {isCorporate ? 'B2B CORPORATE PLAN' : 'B2C INDIVIDUAL PLAN'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Ionicons name="shield-checkmark" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.subCardPlanName}>{activePlan}</Text>
                                    </View>
                                    {isCorporate && user?.corporateSubscription?.name && (
                                        <Text style={styles.subCardOrgName}>Managed by: {user.corporateSubscription.name}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.subCardBottom}>
                                <View>
                                    <Text style={styles.subCardBottomLabel}>Billing Term</Text>
                                    <Text style={styles.subCardBottomValue}>{formattedTerm}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.subCardBottomLabel}>Valid Until</Text>
                                    <Text style={styles.subCardBottomValue}>{validUntil}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    );
                })()}

                <View style={styles.formCard}>
                    {/* Section: Identity */}
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-circle-outline" size={20} color="#9035A0" />
                        <Text style={styles.sectionTitle}>Identity</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <InputField label="First Name" value={firstName} onChangeText={setFirstName} icon="person-outline" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField label="Last Name" value={lastName} onChangeText={setLastName} icon="person-outline" />
                        </View>
                    </View>

                    <InputField label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" editable={false} icon="mail-outline" />
                    <InputField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />

                    <View style={styles.sectionDivider} />

                    {/* Section: Body Metrics */}
                    <View style={styles.sectionHeader}>
                        <Ionicons name="fitness-outline" size={20} color="#9035A0" />
                        <Text style={styles.sectionTitle}>Body Metrics</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                                <View style={[styles.inputWrapperField, { height: 52 }]}>
                                    <Ionicons name="calendar-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                                    <Text style={[styles.dateText, !dob && { color: '#94A3B8' }]}>
                                        {dob || "DD/MM/YYYY"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.chipRow}>
                                {GENDERS.map(g => (
                                    <TouchableOpacity 
                                        key={g} 
                                        style={[styles.chip, gender.toLowerCase() === g.toLowerCase() && styles.chipActive]} 
                                        onPress={() => setGender(g.toLowerCase())}
                                    >
                                        <Text style={[styles.chipText, gender.toLowerCase() === g.toLowerCase() && styles.chipTextActive]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
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

                    <Text style={styles.label}>Blood Group</Text>
                    <View style={styles.chipRow}>
                        {BLOOD_GROUPS.map(bg => (
                            <TouchableOpacity 
                                key={bg} 
                                style={[styles.bloodChip, bloodGroup === bg && styles.bloodChipActive]} 
                                onPress={() => setBloodGroup(bg)}
                            >
                                <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <InputField label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" icon="resize-outline" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" icon="barbell-outline" />
                        </View>
                    </View>

                    <View style={styles.sectionDivider} />

                    {/* Section: Location */}
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location-outline" size={20} color="#9035A0" />
                        <Text style={styles.sectionTitle}>Location</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <InputField label="City" value={city} onChangeText={setCity} icon="business-outline" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField label="Country" value={country} onChangeText={setCountry} icon="earth-outline" />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ marginTop: 24 }}>
                        <LinearGradient
                            colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                            locations={[0, 0.28, 0.7, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                        >
                            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    headerGradient: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    scrollContent: {
        padding: 16,
        paddingTop: 16,
    },
    subCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    subCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        paddingBottom: 16,
        marginBottom: 16,
    },
    subCardLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subCardPlanName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        textTransform: 'capitalize',
    },
    subCardOrgName: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    subCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subCardBottomLabel: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 2,
    },
    subCardBottomValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
    },
    inputContainer: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    inputWrapperField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        backgroundColor: '#F8FAFC',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        height: '100%',
        fontWeight: '600',
    },
    inputDisabled: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    inputWrapper: {
        marginBottom: 0,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: {
        backgroundColor: '#9035A0',
        borderColor: '#9035A0',
    },
    bloodChip: {
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        width: '23%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    bloodChipActive: {
        backgroundColor: '#9035A0',
        borderColor: '#9035A0',
    },
    chipText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: 'bold',
    },
    chipTextActive: {
        color: '#fff',
    },
    dateText: {
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '600',
    },
    saveButton: {
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#9035A0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    avatarSection: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 8,
    },
    avatarTouchable: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarInitials: {
        fontSize: 30,
        fontWeight: '800',
        color: '#fff',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#9035A0',
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 2,
    },
    avatarHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
    },
});

export default ProfileDetailsScreen;
