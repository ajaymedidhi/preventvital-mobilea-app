import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SectionCard = ({ title, children, icon }: { title?: string, children: React.ReactNode, icon?: string }) => (
    <View style={styles.card}>
        <View style={styles.sectionHeader}>
            {icon && <Ionicons name={icon as any} size={18} color="#818CF8" style={{ marginRight: 8 }} />}
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
        </View>
        {children}
    </View>
);

export default function TermsAndConditionsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

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
                    <Text style={styles.headerTitle}>Terms & Conditions</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.titleContainer}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="document-text" size={32} color="#818CF8" />
                    </View>
                    <Text style={styles.title}>PreventalVital</Text>
                    <Text style={styles.subtitle}>(gruentzig.ai Private Limited)</Text>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>LEGAL DOCUMENT</Text>
                    </View>
                    <Text style={styles.versionInfo}>
                        Version 1.0 • Effective: March 1, 2026{"\n"}
                        Hyderabad, India • info@preventvital.com
                    </Text>
                </View>

                <SectionCard>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>Please Read Carefully:</Text> These Terms and Conditions ("Terms") govern your access to and use of the PreventalVital application, website, and related services. By creating an account or using our services, you agree to be bound by these Terms. If you do not agree, do not use PreventalVital.
                    </Text>
                </SectionCard>

                <SectionCard title="1. Acceptance of Terms" icon="checkbox-outline">
                    <Text style={styles.paragraph}>By downloading, installing, or using PreventalVital, you represent that:</Text>
                    <Text style={styles.listItem}>• You are at least 18 years of age</Text>
                    <Text style={styles.listItem}>• You have read, understood, and agree to these Terms</Text>
                    <Text style={styles.listItem}>• You have the legal capacity to enter into an agreement</Text>
                    <Text style={styles.listItem}>• All information you provide is accurate and truthful</Text>
                    <Text style={styles.listItem}>• You use the Service for personal health monitoring</Text>
                </SectionCard>

                <SectionCard title="2. Description of Services" icon="apps-outline">
                    <Text style={styles.paragraph}>PreventalVital provides the following wellness services:</Text>
                    <Text style={styles.subSectionTitle}>2.1 CVITAL Score™ & 2.2 ASCVD Risk</Text>
                    <Text style={styles.paragraph}>Proprietary cardiovascular risk scoring system and ACC/AHA 10-year risk estimation (informational tools only).</Text>
                    <Text style={styles.subSectionTitle}>2.3 Wellness Programs & 2.4 Wearables</Text>
                    <Text style={styles.paragraph}>Structured lifestyle programs, and integration with health apps and devices.</Text>
                    <Text style={styles.subSectionTitle}>2.5 VITA AI & 2.6 Health Alerts</Text>
                    <Text style={styles.paragraph}>An AI-powered health assistant and an automated vital sign alert system.</Text>
                </SectionCard>

                <SectionCard title="3. Medical Disclaimer" icon="medical-outline">
                    <View style={styles.alertBox}>
                        <Ionicons name="medical" size={20} color="#DC2626" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={styles.alertTextBold}>NOT MEDICAL ADVICE</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        PreventalVital is a health information platform. It is NOT a medical device, does NOT provide medical advice, and is NOT a substitute for professional medical care.
                    </Text>
                    <Text style={styles.listItem}>• Do not use as a substitute for consulting a doctor.</Text>
                    <Text style={styles.listItem}>• Delaying emergency care based on app data is strictly prohibited.</Text>
                    <Text style={styles.listItem}>• Always consult your specialist before making medication changes.</Text>
                </SectionCard>

                <SectionCard title="4. Account Registration & Security" icon="lock-closed-outline">
                    <Text style={styles.listItem}>• You must create an account and provide accurate info.</Text>
                    <Text style={styles.listItem}>• Keep credentials confidential; notify us of unauthorized access.</Text>
                    <Text style={styles.listItem}>• We reserve the right to suspend accounts for violations, false data, or disruption.</Text>
                </SectionCard>

                <SectionCard title="5. Subscriptions & Payments" icon="card-outline">
                    <Text style={styles.paragraph}>We offer free and premium subscription plans.</Text>
                    <Text style={styles.listItem}>• Premium tiers are billed in advance (monthly/annual).</Text>
                    <Text style={styles.listItem}>• Fees are non-refundable unless required by law.</Text>
                    <Text style={styles.listItem}>• Subscriptions can be canceled at any time; access remains until billing period ends.</Text>
                </SectionCard>

                <SectionCard title="6. Intellectual Property" icon="color-palette-outline">
                    <Text style={styles.paragraph}>All content, features, and algorithms are the property of gruentzig.ai Private Limited.</Text>
                    <Text style={styles.listItem}>• You may not reverse engineer the CVITAL Score™.</Text>
                    <Text style={styles.listItem}>• You own your data, but grant us a license to process it.</Text>
                    <Text style={styles.listItem}>• Scraping or commercially exploiting platform content is prohibited.</Text>
                </SectionCard>

                <SectionCard title="7. Acceptable Use Policy" icon="shield-outline">
                    <Text style={styles.paragraph}>You must not:</Text>
                    <Text style={styles.listItem}>• Provide false health data to manipulate risk scores.</Text>
                    <Text style={styles.listItem}>• Upload malware, bots, or scripts.</Text>
                    <Text style={styles.listItem}>• Harass, impersonate users, or override security measures.</Text>
                </SectionCard>

                <SectionCard title="8. VITA AI Terms" icon="chatbubble-outline">
                    <Text style={styles.paragraph}>VITA AI uses Google Gemini AI.</Text>
                    <Text style={styles.listItem}>• Responses are informational and must be verified by a professional.</Text>
                    <Text style={styles.listItem}>• History stored for 90 days; deletion available upon request.</Text>
                    <Text style={styles.listItem}>• Do not use VITA AI for emergency situations.</Text>
                </SectionCard>

                <SectionCard title="9. Wearable Devices" icon="watch-outline">
                    <Text style={styles.paragraph}>When connecting third-party wearables, you acknowledge that we are not responsible for their inaccuracies or failures.</Text>
                </SectionCard>

                <SectionCard title="10. Limitation of Liability" icon="warning-outline">
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>DISCLAIMER:</Text> Provided "as is" and "as available". We are not liable for health outcomes, decisions made based on data, loss of data, or tech failures. Liability never exceeds your 12-month subscription cost. You agree to indemnify us from claims arising from your misuse or policy violation.
                    </Text>
                </SectionCard>

                <SectionCard title="11. Governing Law" icon="globe-outline">
                    <Text style={styles.paragraph}>Governed by the laws of India, including the DPDPA Act 2023. Disputes will be informally resolved via info@preventvital.com first, failing which they will fall under the jurisdiction of courts in Hyderabad.</Text>
                    <Text style={styles.paragraph}>Class action lawsuits are waived where permitted by law.</Text>
                </SectionCard>

                <SectionCard title="Contact Information" icon="mail-outline">
                    <Text style={styles.paragraph}>For any questions about these Terms, please contact:</Text>
                    <Text style={styles.listItem}><Text style={styles.bold}>Email:</Text> info@preventvital.com</Text>
                    <Text style={styles.listItem}><Text style={styles.bold}>Company:</Text> gruentzig.ai Private Limited</Text>
                </SectionCard>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using PreventalVital, you acknowledge that you agree to be bound by these Terms and Conditions.{"\n"}
                        Effective Date: March 1, 2026 | Version 1.0
                    </Text>
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
        elevation: 8,
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
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    badgeContainer: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    badgeText: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    versionInfo: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginTop: 12,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 8,
    },
    listItem: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 6,
        paddingLeft: 4,
    },
    bold: {
        fontWeight: '700',
        color: '#334155',
    },
    alertBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    alertTextBold: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#991B1B',
    },
    footer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
});
