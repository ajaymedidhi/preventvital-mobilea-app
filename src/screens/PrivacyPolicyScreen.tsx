import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SectionCard = ({ title, children }: { title?: string, children: React.ReactNode }) => (
    <View style={styles.card}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
        {children}
    </View>
);

export default function PrivacyPolicyScreen() {
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
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.titleContainer}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="shield-checkmark" size={32} color="#818CF8" />
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
                        <Text style={styles.bold}>Important Notice:</Text> This Privacy Policy describes how PreventalVital Health Technologies ("PreventalVital", "we", "us", or "our") collects, uses, shares, and protects your personal and health information when you use our mobile application, web platform, and associated services. By using PreventalVital, you consent to the practices described in this policy.
                    </Text>
                </SectionCard>

                <SectionCard title="1. Information We Collect">
                    <Text style={styles.paragraph}>We collect the following categories of information to provide and improve our cardiovascular health monitoring services:</Text>

                    <Text style={styles.subSectionTitle}>1.1 Personal Identification Information</Text>
                    <Text style={styles.listItem}>• Full name, date of birth, age, and biological sex</Text>
                    <Text style={styles.listItem}>• Email address and mobile phone number</Text>
                    <Text style={styles.listItem}>• Account credentials (encrypted passwords)</Text>
                    <Text style={styles.listItem}>• Profile photograph (optional)</Text>

                    <Text style={styles.subSectionTitle}>1.2 Health and Medical Information</Text>
                    <Text style={styles.listItem}>• Cardiovascular risk assessment responses</Text>
                    <Text style={styles.listItem}>• Blood pressure readings, heart rate, HRV</Text>
                    <Text style={styles.listItem}>• Blood glucose, HbA1c, cholesterol values</Text>
                    <Text style={styles.listItem}>• Weight, BMI, body composition</Text>
                    <Text style={styles.listItem}>• Sleep duration, physical activity, medication logs</Text>
                    <Text style={styles.listItem}>• Dietary habits, symptoms, and mental health</Text>

                    <Text style={styles.subSectionTitle}>1.3 Computed Health Scores</Text>
                    <Text style={styles.listItem}>• CVITAL Score™ and ASCVD 10-year risk percentage</Text>
                    <Text style={styles.listItem}>• Vascular age estimate and domain risk breakdowns</Text>

                    <Text style={styles.subSectionTitle}>1.4 Device and Wearable Data</Text>
                    <Text style={styles.listItem}>• Apple HealthKit, Google Fit, Fitbit data</Text>
                    <Text style={styles.listItem}>• Bluetooth BP monitor & CGM readings</Text>

                    <Text style={styles.subSectionTitle}>1.5 Technical & 1.6 VITA AI</Text>
                    <Text style={styles.paragraph}>We collect device type, IP address, and platform usage. When interacting with VITA AI, conversation history is stored to provide contextual, personalised responses.</Text>
                </SectionCard>

                <SectionCard title="2. How We Use Your Information">
                    <Text style={styles.paragraph}>We do not sell your personal or health data to third parties. We use your info exclusively to:</Text>
                    <Text style={styles.listItem}>• Calculate CVITAL Score™ and ASCVD risk.</Text>
                    <Text style={styles.listItem}>• Generate AI health summaries via VITA AI.</Text>
                    <Text style={styles.listItem}>• Send critical health alerts, reminders, and updates.</Text>
                    <Text style={styles.listItem}>• Analyze de-identified patterns to improve algorithms.</Text>
                    <Text style={styles.listItem}>• Comply with legal and safety requirements.</Text>
                </SectionCard>

                <SectionCard title="3. Data Sharing & Third Parties">
                    <Text style={styles.paragraph}>We work with trusted third-party providers under strict data processing agreements:</Text>
                    <View style={styles.tableCard}>
                        <Text style={styles.tableRow}><Text style={styles.bold}>MongoDB Atlas:</Text> Database hosting (encrypted)</Text>
                        <Text style={styles.tableRow}><Text style={styles.bold}>Firebase / Twilio:</Text> Notifications and SMS alerts</Text>
                        <Text style={styles.tableRow}><Text style={styles.bold}>Google Gemini AI:</Text> VITA AI chatbot context</Text>
                        <Text style={styles.tableRow}><Text style={styles.bold}>Wearable APIs:</Text> Apple HealthKit, Google Fit, Fitbit, Dexcom (with permission)</Text>
                    </View>
                    <Text style={styles.paragraph}><Text style={styles.bold}>Note:</Text> We do not sell your data to advertisers.</Text>
                </SectionCard>

                <SectionCard title="4. Data Security">
                    <Text style={styles.paragraph}>We implement industry-standard security measures:</Text>
                    <Text style={styles.listItem}>• Encryption in transit (TLS 1.3) & rest (AES-256)</Text>
                    <Text style={styles.listItem}>• Passwords hashed using bcrypt (salt rounds = 12)</Text>
                    <Text style={styles.listItem}>• JWT tokens with 15-min expiry + refresh rotation</Text>
                    <Text style={styles.listItem}>• Role-based access and strict API rate limiting</Text>
                </SectionCard>

                <SectionCard title="5. Your Rights & Choices">
                    <Text style={styles.paragraph}>You have the right to <Text style={styles.bold}>Access, Correct, Delete, Export, Restrict</Text>, and <Text style={styles.bold}>Object</Text> to your data processing. To exercise these rights, contact info@preventvital.com (response within 30 days).</Text>
                </SectionCard>

                <SectionCard title="6. Data Retention">
                    <Text style={styles.listItem}>• Account & Assessment: Duration of account</Text>
                    <Text style={styles.listItem}>• Vitals & Alert History: 2-3 years</Text>
                    <Text style={styles.listItem}>• VITA AI chat history: 90 days from last message</Text>
                    <Text style={styles.listItem}>• Deleted account data: 30 days then purged</Text>
                </SectionCard>

                <SectionCard title="7. Children's Privacy">
                    <Text style={styles.paragraph}>PreventalVital is not intended for use by individuals under the age of 18. We do not knowingly collect personal health information from children.</Text>
                </SectionCard>

                <SectionCard title="8. AI and Automated Processing">
                    <Text style={styles.paragraph}>Your CVITAL Score and ASCVD Risk are automated calculations. VITA AI (Gemini 2.5 Flash) provides health guidance based on your profile.</Text>
                    <View style={styles.alertBox}>
                        <Ionicons name="warning" size={20} color="#D97706" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={styles.alertText}>VITA AI is not a medical device. Always consult your doctor before making health decisions.</Text>
                    </View>
                </SectionCard>

                <SectionCard title="9. Additional Terms">
                    <Text style={styles.subSectionTitle}>9. Cookies</Text>
                    <Text style={styles.paragraph}>Our platform uses essential and analytics cookies. No advertising cookies are used.</Text>
                    <Text style={styles.subSectionTitle}>10. International Transfers</Text>
                    <Text style={styles.paragraph}>We use Standard Contractual Clauses and DPAs for safe cross-border data transfers.</Text>
                    <Text style={styles.subSectionTitle}>11. Policy Changes</Text>
                    <Text style={styles.paragraph}>Material changes will be notified via email 14 days in advance.</Text>
                </SectionCard>

                <SectionCard title="Contact Us">
                    <Text style={styles.paragraph}>If you have any questions, please contact our Data Protection team:</Text>
                    <Text style={styles.listItem}><Text style={styles.bold}>Email:</Text> info@preventvital.com</Text>
                    <Text style={styles.listItem}><Text style={styles.bold}>Entity:</Text> gruentzig.ai Private Limited</Text>
                </SectionCard>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This document constitutes the complete Privacy Policy of gruentzig.ai Private Limited.{"\n"}
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
        backgroundColor: '#FAFAFA',
    },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingBottom: 20,
        shadowColor: "#818CF8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
        borderRadius: 32,
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    subSectionTitle: {
        fontSize: 15,
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
    tableCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    tableRow: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 8,
        lineHeight: 20,
    },
    alertBox: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        marginTop: 12,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 20,
    },
    footer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
});
