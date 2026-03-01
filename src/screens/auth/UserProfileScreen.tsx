import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchMySubscription } from '../../api/subscriptionApi';

const UserProfileScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [currentSubscription, setCurrentSubscription] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getSubscription = async () => {
            const data = await fetchMySubscription();
            if (data?.subscription?.plan) {
                const planStr = data.subscription.plan;
                setCurrentSubscription(planStr.charAt(0).toUpperCase() + planStr.slice(1));
            } else {
                setCurrentSubscription('Free');
            }
        };
        if (user) {
            getSubscription();
        }
    }, [user]);

    // Fallback display values
    const displayName = user?.profile?.firstName
        ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
        : (user?.name || 'User');
    const displayEmail = user?.email || 'No Email';

    const initials = displayName.split(' ')
        .map((n: string) => n[0])
        .join('').toUpperCase().substring(0, 2) || 'U';

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

    const MenuItem = ({ icon, label, onPress, color = '#000', iconColor, iconBackground }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={24} color={iconColor || color} style={styles.menuIcon} />
                <Text style={[styles.menuLabel, { color }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Gradient Area */}
                <LinearGradient
                    colors={['#8A88E1', '#8551C7']} // Match gradient from mockup
                    style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <Text style={styles.headerTitle}>Profile</Text>

                    <View style={styles.userInfoContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{displayName}</Text>
                            <Text style={styles.userEmail}>{displayEmail}</Text>
                            {/* Subscription Badge */}
                            <View style={styles.subscriptionBadge}>
                                <Ionicons name="star" size={12} color={currentSubscription !== 'Free' ? "#EAB308" : "#94A3B8"} />
                                <Text style={styles.subscriptionText}>Current: {currentSubscription || 'Loading...'}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Menu Items Container */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="person-outline"
                        label="Personal Information"
                        iconColor="#3b82f6"
                        onPress={() => (navigation as any).navigate('ProfileDetails')}
                    />
                    <MenuItem
                        icon="sync"
                        label="Subscription"
                        iconColor="#3b82f6"
                        onPress={() => (navigation as any).navigate('Subscription')}
                    />
                    <MenuItem
                        icon="phone-portrait-outline"
                        label="Connected Devices"
                        iconColor="#3b82f6"
                    />
                    <MenuItem
                        icon="notifications-outline"
                        label="Notifications"
                        iconColor="#3b82f6"
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Privacy & Security"
                        iconColor="#3b82f6"
                    />
                    <MenuItem
                        icon="settings-outline"
                        label="App Settings"
                        iconColor="#3b82f6"
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        iconColor="#3b82f6"
                        onPress={() => (navigation as any).navigate('ContactUs')}
                    />

                    <MenuItem
                        icon="log-out-outline"
                        label="Sign Out"
                        color="#ff3b30"
                        iconColor="#ff3b30"
                        onPress={handleSignOut}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light grey background
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Translucent overlay
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#E0E7FF', // Light blue-ish white
        fontWeight: '400',
        marginBottom: 8,
    },
    subscriptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    subscriptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 4,
    },
    menuContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#F5F5F5',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        // Shadow formatting for a raised card look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default UserProfileScreen;
