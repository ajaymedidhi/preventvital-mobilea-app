import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LegalOption = ({ title, icon, onPress }: { title: string, icon: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.optionIconContainer}>
            <Ionicons name={icon as any} size={24} color="#818CF8" />
        </View>
        <Text style={styles.optionTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
);

export default function PrivacyOverviewScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A78BFA', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backIconContainer}>
                            <Ionicons name="arrow-back" size={20} color="#6366F1" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy & Security</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <LegalOption 
                    title="Prevent Vital Privacy Policy" 
                    icon="shield-checkmark-outline" 
                    onPress={() => navigation.navigate('PrivacyPolicyLanding')}
                />
                <LegalOption 
                    title="Terms and conditions" 
                    icon="document-text-outline" 
                    onPress={() => navigation.navigate('TermsAndConditions')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingBottom: 40,
        shadowColor: "#818CF8",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    backButton: {
        padding: 4,
    },
    backIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 14,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    optionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#EEF2FF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
});
