import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const UserProfileScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAuth();

    // Mock user data
    const user = {
        name: 'Ajay Medidhi',
        email: 'ajay@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Ajay+M&background=0D8ABC&color=fff&size=200',
        joined: 'January 2025'
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
            ]
        );
    };

    const MenuItem = ({ icon, label, onPress, color = '#1E293B', showChevron = true }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${color}10` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            {showChevron && <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.joinedBadge}>
                        <Text style={styles.joinedText}>Member since {user.joined}</Text>
                    </View>
                </View>

                {/* Account Settings */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.sectionContainer}>
                    <MenuItem icon="person-outline" label="Edit Profile" color="#4F46E5" />
                    <MenuItem icon="notifications-outline" label="Notifications" color="#F59E0B" />
                    <MenuItem icon="shield-checkmark-outline" label="Privacy & Security" color="#10B981" />
                </View>

                {/* Support & Info */}
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.sectionContainer}>
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        color="#6366F1"
                        onPress={() => (navigation as any).navigate('ContactUs')}
                    />
                    <MenuItem icon="document-text-outline" label="Terms of Service" color="#64748B" />
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },

    profileCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 10,
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F1F5F9' },
    editAvatarButton: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#4F46E5', width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff'
    },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    userEmail: { fontSize: 14, color: '#64748B', marginBottom: 16 },
    joinedBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    joinedText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginLeft: 20, marginBottom: 12, marginTop: 10 },
    sectionContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        paddingVertical: 8,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
        marginBottom: 10
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: '#F8FAFC'
    },
    menuIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuLabel: { flex: 1, fontSize: 16, color: '#334155', fontWeight: '500' },

    signOutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 20, marginHorizontal: 20,
        backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16,
        borderWidth: 1, borderColor: '#FECACA'
    },
    signOutText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#EF4444' },

    versionInfo: { alignItems: 'center', marginTop: 24 },
    versionText: { fontSize: 12, color: '#94A3B8' }
});

export default UserProfileScreen;
