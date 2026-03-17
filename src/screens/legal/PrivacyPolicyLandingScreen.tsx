import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CategoryCard = ({ title, subtitle, icon, badge, onPress }: { 
    title: string, 
    subtitle: string, 
    icon: string, 
    badge: string,
    onPress: () => void 
}) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardIconContainer}>
            <Ionicons name={icon as any} size={22} color="#fff" />
        </View>
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
        </View>
        <View style={styles.cardRight}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
    </TouchableOpacity>
);

export default function PrivacyPolicyLandingScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const categories = [
        {
            id: 'collect',
            title: 'What We Collect',
            subtitle: 'Health metrics, variables, AI chat, & more',
            icon: 'list',
            badge: '11 items',
        },
        {
            id: 'use',
            title: 'How We Use It',
            subtitle: 'CVITAL scoring, VITA AI, wellness programs',
            icon: 'settings',
            badge: '4 purposes',
        },
        {
            id: 'sharing',
            title: 'Data Sharing',
            subtitle: 'Trusted providers only — never sold',
            icon: 'share-social',
            badge: '4 partners',
        },
        {
            id: 'security',
            title: 'Security & Retention',
            subtitle: 'AES-256, TLS 1.3 & data retention',
            icon: 'lock-closed',
            badge: '',
        },
        {
            id: 'rights',
            title: 'Your Rights',
            subtitle: 'Access, delete, reject or restrict data',
            icon: 'person',
            badge: '',
        },
        {
            id: 'ai',
            title: 'AI & Automation',
            subtitle: 'VITA AI, CVITAL Score™ and ASCVD',
            icon: 'text',
            badge: '',
        },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A78BFA', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top }]}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backIconContainer}>
                            <Ionicons name="arrow-back" size={20} color="#6366F1" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.docHeader}>
                    <View style={styles.titleRow}>
                        <Text style={styles.mainTitle}>Privacy <Text style={styles.blueText}>Policy</Text></Text>
                        <View style={styles.versionBadge}>
                            <Text style={styles.versionBadgeText}>v1.0 Mar 2026</Text>
                        </View>
                    </View>
                    <Text style={styles.entityName}>(gruentzig.ai Private Limited)</Text>
                    <Text style={styles.location}>Hyderabad India</Text>

                    <View style={styles.noticeCard}>
                        <Text style={styles.noticeText}>
                            <Text style={styles.bold}>Important Notice:</Text> This Privacy Policy describes how PreventalVital Health Technologies ("PreventalVital", "we", "us", "our") collects, uses, shares, and protects your personal and health information when you use our mobile application, web platform, and associated services. By using PreventalVital, you consent to the practices described in this policy.
                        </Text>
                    </View>

                    <Text style={styles.sectionHeading}>YOUR DATA JOURNEY</Text>
                </View>

                {categories.map((cat) => (
                    <CategoryCard 
                        key={cat.id}
                        title={cat.title}
                        subtitle={cat.subtitle}
                        icon={cat.icon}
                        badge={cat.badge}
                        onPress={() => navigation.navigate('PrivacyDetail', { categoryId: cat.id })}
                    />
                ))}

                <View style={styles.questionsContainer}>
                    <Text style={styles.questionText}>Questions? <Text style={styles.emailText}>info@preventvital.com</Text></Text>
                    <Text style={styles.complianceText}>Complies with DPDPA Act 2023 (India) - gruentzig.ai Private Limited</Text>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingBottom: 20,
        shadowColor: "#818CF8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButton: {
        padding: 4,
    },
    backIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    docHeader: {
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    blueText: {
        color: '#3B82F6',
    },
    versionBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    versionBadgeText: {
        fontSize: 11,
        color: '#3B82F6',
        fontWeight: '600',
    },
    entityName: {
        fontSize: 13,
        color: '#64748B',
    },
    location: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'right',
        marginTop: -15,
    },
    noticeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    noticeText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#818CF8',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
    },
    questionsContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    questionText: {
        fontSize: 13,
        color: '#64748B',
    },
    emailText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    complianceText: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: 20,
    },
});
