import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface PartnerCardProps {
    name: string;
    description: string;
    badge?: string;
}

interface Section {
    title: string;
    items?: string[];
    partnerCards?: PartnerCardProps[];
    badge?: string;
    custom?: React.ReactNode;
}

interface ContentData {
    title: string;
    subtitle: string;
    sections: Section[];
    customContent?: React.ReactNode;
    footerContent?: React.ReactNode;
    next?: { title: string; id: string };
}

const PartnerCard = ({ name, description, badge }: PartnerCardProps) => (
    <View style={styles.partnerCard}>
        <View style={styles.partnerMain}>
            <View style={styles.partnerBullet} />
            <View style={styles.partnerTextContainer}>
                <Text style={styles.partnerName}>{name}</Text>
                <Text style={styles.partnerDesc}>{description}</Text>
            </View>
            {badge && (
                <View style={[styles.partnerBadge, { backgroundColor: badge.includes('Encrypted') || badge.includes('Active') || badge.includes('lifetime') ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={[styles.partnerBadgeText, { color: badge.includes('Encrypted') || badge.includes('Active') || badge.includes('lifetime') ? '#16A34A' : '#D97706' }]}>{badge}</Text>
                </View>
            )}
        </View>
    </View>
);

export default function PrivacyDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { categoryId } = route.params;

    const getContent = (): ContentData => {
        switch (categoryId) {
            case 'collect':
                return {
                    title: 'What We Collect',
                    subtitle: '6 categories of data',
                    sections: [
                        {
                            title: 'Personal Identification',
                            items: [
                                'Name, DOB & Age: Full name, date of birth, biological sex',
                                'Contact Details: Email address, mobile number',
                                'Account Credentials: Encrypted passwords, optional profile photo',
                            ]
                        },
                        {
                            title: 'Health & Medical',
                            items: [
                                'Cardiovascular Profile: 50-question health assessment responses',
                                'Vitals: BP, heart rate, HRV, SpO2, glucose, HbA1c',
                                'Body Metrics: Weight, BMI, waist circumference',
                                'Lifestyle Factors: Smoking, alcohol, diet, sleep, medications',
                            ]
                        },
                        {
                            title: 'Computed Health Scores',
                            items: [
                                'CVITAL Score™: Cardiovascular vitality index, 0-100 scale',
                                'ASCVD Risk %: 10-year cardiovascular risk (ACC/AHA)',
                                'Vascular Age & Trends: Vascular age estimate and historical trends',
                            ]
                        },
                        {
                            title: 'Device & Wearable Data',
                            items: [
                                'Apple HealthKit: With your explicit permission',
                                'Google Fit / Fitbit: Activity, sleep, heart rate via OAuth',
                                'CGM / Dexcom: Continuous glucose readings via OAuth',
                            ]
                        },
                        {
                            title: 'Technical & VITA AI',
                            items: [
                                'VITA AI Conversations: Chat history stored 90 days for personalized context. May be reviewed for safety & quality.',
                            ]
                        },
                    ],
                    next: { title: 'How We Use It', id: 'use' }
                };
            case 'use':
                return {
                    title: 'How We Use It',
                    subtitle: '4 purposes, exclusively for you',
                    customContent: (
                        <View style={styles.useNoticeCard}>
                            <View style={styles.partnerBullet} />
                            <Text style={styles.useNoticeText}>
                                <Text style={styles.bold}>We do not sell your data.</Text> All use is strictly for delivering and improving your health services.
                            </Text>
                        </View>
                    ),
                    sections: [
                        {
                            title: 'Primary Health Services',
                            items: [
                                'Calculate CVITAL Score™ and ASCVD risk',
                                'Generate AI health summaries via VITA AI',
                                'Recommend wellness programs for your profile',
                                'Monitor vitals and trigger clinical alerts',
                                'Create personalized cardiovascular reports',
                                'Medication adherence tracking & reminders',
                            ],
                            badge: 'Core'
                        },
                        {
                            title: 'Communications',
                            items: [
                                'Critical health alerts via push, SMS, email',
                                'Wellness program session reflections',
                                'Monthly health progress summaries',
                                'Account security notifications',
                            ],
                            badge: 'SMS'
                        },
                        {
                            title: 'Platform Improvement',
                            items: [
                                'Aggregated, anonymous usage analysis only',
                                'Improve CVITAL Score™ accuracy over time',
                                'Optimize VITA AI with anonymized patterns',
                                'Debug and optimize app performance',
                            ],
                            badge: 'De-identified'
                        },
                        {
                            title: 'Legal & Safety',
                            items: [
                                'Comply with applicable laws & legal processes',
                                'Enforce Terms & Conditions',
                                'Detect, prevent & address fraud',
                            ],
                            badge: 'Compliance'
                        },
                    ],
                    next: { title: 'Data Sharing', id: 'sharing' }
                };
            case 'sharing':
                return {
                    title: 'Data Sharing',
                    subtitle: 'Trusted processors only',
                    sections: [
                        {
                            title: 'Service Providers',
                            partnerCards: [
                                { name: 'MongoDB Atlas', description: 'Database hosting. All account & health data (AES-256 encrypted)', badge: 'Encrypted' },
                                { name: 'Firebase (Google)', description: 'Push notifications. FCM device tokens only', badge: 'Active' },
                                { name: 'Twilio', description: 'SMS notifications. Phone number + message content', badge: 'Active' },
                                { name: 'Google Gemini AI', description: 'VITA AI chatbot. Health context + chat messages', badge: 'Active' },
                                { name: 'Apple / Google Fit / Fitbit', description: 'Wearable sync. Your permission required via OAuth', badge: 'OAuth' },
                                { name: 'Dexcom API', description: 'CGM glucose data. Glucose readings via OAuth only', badge: 'OAuth' },
                            ]
                        }
                    ],
                    footerContent: (
                        <View style={styles.neverCard}>
                            <Text style={styles.neverTitle}>We Never Do This</Text>
                            <View style={styles.neverItem}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.neverText}>Sell personal or health data to advertisers</Text>
                            </View>
                            <View style={styles.neverItem}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.neverText}>Share identifiable data with employers or insurers</Text>
                            </View>
                            <View style={styles.neverItem}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.neverText}>Use your data to train third-party AI without consent</Text>
                            </View>
                            <View style={styles.neverItem}>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.neverText}>Share data with pharma companies for marketing</Text>
                            </View>
                        </View>
                    ),
                    next: { title: 'Security & Retention', id: 'security' }
                };
            case 'security':
                return {
                    title: 'Security & Retention',
                    subtitle: 'Industry-grade protection',
                    sections: [
                        {
                            title: 'Security Measures',
                            partnerCards: [
                                { name: 'Encryption in Transit', description: 'All data transmitted securely', badge: 'TLS 1.3' },
                                { name: 'Encryption at Rest', description: 'MongoDB health data encrypted', badge: 'AES-256' },
                                { name: 'Authentication', description: 'JWT tokens, 15-min expiry + 7-day refresh', badge: 'JWT' },
                                { name: 'Password Security', description: 'bcrypt hashed, 12 salt rounds', badge: 'bcrypt' },
                                { name: 'Role-Based Access', description: 'Patients cannot see other patient data', badge: 'RBAC' },
                            ]
                        },
                        {
                            title: 'Data Retention',
                            partnerCards: [
                                { name: 'Account Information', description: 'Service provision', badge: 'Lifetime + 30d' },
                                { name: 'Daily Vital Logs', description: 'Long-term health trends', badge: '3 years' },
                                { name: 'Alert History', description: 'Clinical safety records', badge: '2 years' },
                                { name: 'VITA AI Chat History', description: 'Contextual AI responses', badge: '90 days' },
                                { name: 'Wearable Sync Data', description: 'Health trend analysis', badge: '2 years' },
                                { name: 'Deleted Account Data', description: 'Error recovery window', badge: '30 days' },
                            ]
                        }
                    ],
                    customContent: (
                        <View style={styles.breachCard}>
                            <View style={styles.partnerBullet} />
                            <Text style={styles.breachText}>
                                <Text style={styles.boldRed}>Breach notification:</Text> In case of a data breach, we notify you within <Text style={styles.boldRed}>72 hours</Text> via your registered email.
                            </Text>
                        </View>
                    ),
                    next: { title: 'Your Rights', id: 'rights' }
                };
            case 'rights':
                return {
                    title: 'Your Rights',
                    subtitle: "You're in control • DPDPA Act 2023",
                    customContent: (
                        <View style={styles.rightsCard}>
                            <Text style={styles.rightsHeader}>We respond to all data rights requests <Text style={styles.bold}>within 30 days.</Text> Identity verification required for deletion & export.</Text>
                        </View>
                    ),
                    sections: [
                        {
                            title: 'Categories',
                            items: [
                                'Access: Request a copy of all data we hold',
                                'Correction: Update inaccurate or incomplete health data',
                                'Deletion: Request deletion of account and all health data',
                                'Portability: Export your health data in JSON or CSV',
                                'Restriction: Limit how we process your data',
                                'Objection: Opt out of analytics and AI training',
                                'Withdraw Consent: Revoke wearable permissions in Settings',
                            ]
                        },
                        {
                            title: 'Exercise Your Rights',
                            custom: (
                                <View style={styles.exerciseCard}>
                                    <Text style={styles.exerciseEmail}>info@preventvital.com</Text>
                                    <Text style={styles.exerciseDesc}>Response within 30 business days.</Text>
                                </View>
                            )
                        }
                    ],
                    next: { title: 'AI & Automation', id: 'ai' }
                };
            case 'ai':
                return {
                    title: 'AI & Automation',
                    subtitle: 'How algorithms work for you',
                    sections: [
                        {
                            title: 'Algorithms',
                            items: [
                                'CVITAL Score™: Proprietary algorithm calculating cardiovascular vitality.',
                                'ASCVD Risk: ACC/AHA 10-year cardiovascular risk assessment.',
                                'VITA AI: Generative AI for health insights & guidance.',
                            ]
                        },
                        {
                            title: 'Exercise Your Rights',
                            custom: (
                                <View style={styles.exerciseCard}>
                                    <Text style={styles.exerciseEmail}>info@preventvital.com</Text>
                                    <Text style={styles.exerciseDesc}>Response within 30 business days.</Text>
                                </View>
                            )
                        }
                    ],
                    next: { title: 'Back to Start', id: 'collect' }
                };
            default:
                return { title: 'Privacy Detail', subtitle: '', sections: [] };
        }
    };

    const content = getContent();

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
                    <View style={styles.headerTextCenter}>
                        <Text style={styles.headerTitle}>{content.title}</Text>
                        <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {content.customContent}

                {content.sections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.sectionContainer}>
                        {section.title ? (
                            <View style={styles.sectionHeadingRow}>
                                <View style={styles.partnerBullet} />
                                <Text style={styles.sectionHeading}>{section.title}</Text>
                                {section.badge && (
                                    <View style={styles.headingBadge}>
                                        <Text style={styles.headingBadgeText}>{section.badge}</Text>
                                    </View>
                                )}
                            </View>
                        ) : null}

                        {section.items && (
                            <View style={styles.itemsCard}>
                                {section.items.map((item, iIndex) => {
                                    const parts = item.split(':');
                                    return (
                                        <View key={iIndex} style={[styles.listItem, iIndex === section.items!.length - 1 && { borderBottomWidth: 0 }]}>
                                            <View style={styles.itemBullet} />
                                            <Text style={styles.itemText}>
                                                {parts.length > 1 ? (
                                                    <><Text style={styles.bold}>{parts[0]}:</Text>{parts[1]}</>
                                                ) : item}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {section.partnerCards && (
                            <View style={styles.partnersContainer}>
                                {section.partnerCards.map((p, pIndex) => (
                                    <PartnerCard key={pIndex} {...p} />
                                ))}
                            </View>
                        )}

                        {section.custom}
                    </View>
                ))}

                {content.footerContent}

                {content.next && (
                    <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={() => navigation.replace('PrivacyDetail', { categoryId: content.next!.id })}
                    >
                        <Text style={styles.nextText}>Next: {content.next.title} <Ionicons name="arrow-forward" size={14} /></Text>
                        <Text style={styles.nextDesc}>Continue through your data journey</Text>
                    </TouchableOpacity>
                )}
                
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
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerTextCenter: {
        flex: 1,
        alignItems: 'center',
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
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 10,
    },
    partnerBullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#3B82F6',
        marginRight: 10,
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
    },
    headingBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    headingBadgeText: {
        fontSize: 10,
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    itemsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    listItem: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        alignItems: 'flex-start',
    },
    itemBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#818CF8',
        marginTop: 7,
        marginRight: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    partnersContainer: {
        gap: 12,
    },
    partnerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    partnerMain: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    partnerTextContainer: {
        flex: 1,
    },
    partnerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    partnerDesc: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,
    },
    partnerBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    partnerBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    neverCard: {
        backgroundColor: '#FFF1F2',
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    neverTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9F1239',
        marginBottom: 12,
    },
    neverItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    neverText: {
        fontSize: 12,
        color: '#BE123C',
        marginLeft: 8,
    },
    useNoticeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    useNoticeText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    nextButton: {
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 16,
        marginTop: 32,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    nextText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 4,
    },
    nextDesc: {
        fontSize: 12,
        color: '#3B82F6',
    },
    breachCard: {
        backgroundColor: '#FFF7ED',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFEDD5',
        marginTop: 16,
    },
    breachText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    boldRed: {
        fontWeight: 'bold',
        color: '#C2410C',
    },
    rightsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },
    rightsHeader: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    exerciseCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    exerciseEmail: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 4,
    },
    exerciseDesc: {
        fontSize: 12,
        color: '#64748B',
    },
});
