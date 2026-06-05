import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/AuthContext';
import { useConsent } from '../../health/ConsentContext';
import client from '../../api/client';

// ─── Plan config ────────────────────────────────────────────────────────────
const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
    free:    { label: 'Free',    color: '#64748B', bg: '#F1F5F9', icon: 'person-outline' },
    premium: { label: 'Premium', color: '#2563EB', bg: '#DBEAFE', icon: 'star' },
    pro:     { label: 'Pro',     color: '#D97706', bg: '#FEF3C7', icon: 'flash' },
    family:  { label: 'Family',  color: '#7C3AED', bg: '#EDE9FE', icon: 'people' },
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface MenuRowProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconBg: string;
    iconColor: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
    last?: boolean;
}

interface MenuSection {
    title: string;
    rows: Omit<MenuRowProps, 'last'>[];
}

// ─── Row component ───────────────────────────────────────────────────────────
const MenuRow = ({ icon, iconBg, iconColor, label, subtitle, onPress, danger, last }: MenuRowProps) => (
    <TouchableOpacity
        style={[styles.row, !last && styles.rowBorder]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
    >
        <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.rowText}>
            <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
            {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
        </View>
        {!danger && <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />}
    </TouchableOpacity>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, rows }: MenuSection) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.card}>
            {rows.map((row, i) => (
                <MenuRow key={row.label} {...row} last={i === rows.length - 1} />
            ))}
        </View>
    </View>
);

// ─── Main screen ─────────────────────────────────────────────────────────────
const UserProfileScreen = () => {
    const nav = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { user, currentPlan, signOut } = useAuth();
    const { revokeConsent } = useConsent();

    const displayName = user?.profile?.firstName
        ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
        : (user?.name || 'User');
    const displayEmail = user?.email || '';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

    const score: number = user?.healthProfile?.cvitalScore || user?.profile?.healthScore || 0;
    const plan = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.free;

    const isCorporate = ['corporate_admin', 'admin', 'super_admin'].includes(user?.role);

    const handleSignOut = () =>
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to permanently delete your account? This will erase all of your CVITAL scores and health data.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Confirm Permanent Deletion",
                            "This action is irreversible. Confirm account deletion?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete Permanently",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await client.delete('/api/users/deleteMe');
                                            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
                                            await signOut();
                                        } catch (error: any) {
                                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete account');
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const accountRows: Omit<MenuRowProps, 'last'>[] = [
        { icon: 'person-outline',       iconBg: '#EFF6FF', iconColor: '#3B82F6', label: 'Personal Information',   onPress: () => nav.navigate('ProfileDetails') },
        { icon: 'time-outline',          iconBg: '#F0FDF4', iconColor: '#22C55E', label: 'Assessment History',      onPress: () => nav.navigate('AssessmentHistory') },
        { icon: 'receipt-outline',       iconBg: '#FFF7ED', iconColor: '#F97316', label: 'My Orders',               onPress: () => nav.navigate('OrderHistory') },
        { icon: 'notifications-outline', iconBg: '#FFF1F2', iconColor: '#F43F5E', label: 'Notifications',           onPress: () => nav.navigate('Notifications') },
        { icon: 'trash-outline',         iconBg: '#FEE2E2', iconColor: '#EF4444', label: 'Delete Account',           onPress: handleDeleteAccount },
    ];

    const healthRows: Omit<MenuRowProps, 'last'>[] = [
        { icon: 'create-outline',   iconBg: '#ECFDF5', iconColor: '#10B981', label: 'Log Vitals',           onPress: () => nav.navigate('ManualVitalsEntry') },
        { icon: 'videocam-outline', iconBg: '#FEF2F2', iconColor: '#EF4444', label: 'Book a Consultation',  onPress: () => nav.navigate('Consultation') },
        { icon: 'analytics-outline',iconBg: '#EEF2FF', iconColor: '#6366F1', label: 'ASCVD Risk Explainer', onPress: () => nav.navigate('ASCVDExplainer') },
    ];

    const premiumRows: Omit<MenuRowProps, 'last'>[] = [
        { icon: 'flash-outline',        iconBg: '#FEF3C7', iconColor: '#D97706', label: 'Upgrade Plan',  subtitle: 'Unlock all features', onPress: () => nav.navigate('Subscription') },
        { icon: 'people-outline',       iconBg: '#EDE9FE', iconColor: '#7C3AED', label: 'Family Plan',                                    onPress: () => nav.navigate('FamilyPlan') },
        { icon: 'person-circle-outline',iconBg: '#EDE9FE', iconColor: '#8B5CF6', label: 'Health Coach',                                    onPress: () => nav.navigate('HealthCoach') },
        ...(isCorporate ? [{ icon: 'business-outline' as const, iconBg: '#EFF6FF', iconColor: '#3B82F6', label: 'Corporate Dashboard', onPress: () => nav.navigate('CorporateDashboard') }] : []),
    ];

    const communityRows: Omit<MenuRowProps, 'last'>[] = [
        { icon: 'trophy-outline', iconBg: '#FFFBEB', iconColor: '#F59E0B', label: 'Achievements & Badges', onPress: () => nav.navigate('Achievements') },
    ];

    const legalRows: Omit<MenuRowProps, 'last'>[] = [
        { icon: 'shield-checkmark-outline', iconBg: '#F0FDF4', iconColor: '#22C55E', label: 'Privacy & Security',   onPress: () => nav.navigate('PrivacyOverview') },
        { icon: 'document-text-outline',    iconBg: '#EFF6FF', iconColor: '#3B82F6', label: 'Terms & Conditions',   onPress: () => nav.navigate('TermsAndConditions') },
        { icon: 'help-circle-outline',      iconBg: '#FFF7ED', iconColor: '#F97316', label: 'Help & Support',       onPress: () => nav.navigate('ContactUs') },
        {
            icon: 'remove-circle-outline',
            iconBg: '#FEE2E2',
            iconColor: '#EF4444',
            label: 'Revoke Health Data Consent',
            onPress: () => {
                Alert.alert(
                    "Revoke Consent",
                    "Are you sure you want to revoke consent to access your health data? This will log you out, and you will not be able to use PreventVital without re-granting consent.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Revoke & Log Out",
                            style: "destructive",
                            onPress: async () => {
                                await revokeConsent();
                                await signOut();
                            }
                        }
                    ]
                );
            }
        },
    ];

    return (
        <View style={styles.root}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Hero header ───────────────────────────────────────────── */}
                <LinearGradient
                    colors={['#3E95BF', '#51A6CB', '#9B35A0', '#BF40A3']}
                    locations={[0, 0.3, 0.7, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.hero, { paddingTop: insets.top + 20 }]}
                >
                    {/* Top row: title + edit button */}
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>My Profile</Text>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => nav.navigate('ProfileDetails')}
                            accessibilityRole="button"
                            accessibilityLabel="Edit profile"
                        >
                            <Ionicons name="pencil" size={14} color="#FFF" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Avatar + name block */}
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        </View>
                        <View style={styles.nameBlock}>
                            <Text style={styles.heroName}>{displayName}</Text>
                            <Text style={styles.heroEmail}>{displayEmail}</Text>
                            {/* Plan badge */}
                            <View style={[styles.planBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                <Ionicons name={plan.icon} size={12} color="#FFF" />
                                <Text style={styles.planBadgeText}>{plan.label} Plan</Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <StatChip
                            value={score > 0 ? String(score) : '—'}
                            label="CVITAL"
                            icon="pulse"
                        />
                        <View style={styles.statDivider} />
                        <StatChip
                            value={user?.profile?.age ? `${user.profile.age}y` : '—'}
                            label="Age"
                            icon="person"
                        />
                        <View style={styles.statDivider} />
                        <StatChip
                            value={user?.profile?.gender ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) : '—'}
                            label="Gender"
                            icon="body"
                        />
                    </View>
                </LinearGradient>

                {/* ── Upgrade banner (free plan only) ──────────────────────── */}
                {currentPlan === 'free' && (
                    <TouchableOpacity
                        style={styles.upgradeBanner}
                        onPress={() => nav.navigate('Subscription')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#7C3AED', '#A855F7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upgradeBannerInner}
                        >
                            <View style={styles.upgradeBannerLeft}>
                                <Ionicons name="flash" size={20} color="#FFF" />
                                <View>
                                    <Text style={styles.upgradeBannerTitle}>Upgrade to Premium</Text>
                                    <Text style={styles.upgradeBannerSub}>Unlock coaching, wearables & more</Text>
                                </View>
                            </View>
                            <View style={styles.upgradeBannerArrow}>
                                <Ionicons name="arrow-forward" size={16} color="#FFF" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* ── Menu sections ─────────────────────────────────────────── */}
                <View style={styles.sections}>
                    <SectionCard title="Account" rows={accountRows} />
                    <SectionCard title="Health" rows={healthRows} />
                    <SectionCard title="Premium" rows={premiumRows} />
                    <SectionCard title="Community" rows={communityRows} />
                    <SectionCard title="Legal & Support" rows={legalRows} />

                    {/* Sign out — standalone danger button */}
                    <TouchableOpacity
                        style={styles.signOutBtn}
                        onPress={handleSignOut}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Sign out"
                    >
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>PreventVital v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

// ─── Stat chip ────────────────────────────────────────────────────────────────
const StatChip = ({ value, label, icon }: { value: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) => (
    <View style={styles.statChip}>
        <Ionicons name={icon} size={13} color="rgba(255,255,255,0.7)" style={{ marginBottom: 4 }} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F1F5F9' },

    // Hero
    hero: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    editBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    // Avatar
    avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
    avatarRing: {
        width: 84, height: 84, borderRadius: 42,
        borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
        padding: 3,
    },
    avatarCircle: {
        flex: 1, borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 30, fontWeight: '800', color: '#FFF' },
    nameBlock: { flex: 1, gap: 3 },
    heroName: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '400' },
    planBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, marginTop: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    planBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },

    // Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    statChip: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
    statValue: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

    // Upgrade banner
    upgradeBanner: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
    upgradeBannerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
    upgradeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    upgradeBannerTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
    upgradeBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 2 },
    upgradeBannerArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    // Sections
    sections: { paddingHorizontal: 20, paddingTop: 20 },
    section: { marginBottom: 8 },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginBottom: 8, marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F1F5F9',
    },
    rowIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        flexShrink: 0,
    },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    rowSub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },

    // Sign out
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    signOutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#CBD5E1',
        marginTop: 20,
        fontWeight: '500',
    },
});

export default UserProfileScreen;
