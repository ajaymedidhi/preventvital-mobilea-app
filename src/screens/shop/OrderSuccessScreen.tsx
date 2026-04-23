import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Dimensions, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const OrderSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params || { orderId: 'N/A' };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.content}>
                <View style={styles.successIconContainer}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="checkmark" size={60} color="#FFF" />
                    </LinearGradient>
                </View>

                <Text style={styles.title}>Order Placed Successfully!</Text>
                <Text style={styles.subtitle}>
                    Thank you for your purchase. Your order has been received and is being processed.
                </Text>

                <View style={styles.orderCard}>
                    <Text style={styles.orderLabel}>Order ID</Text>
                    <Text style={styles.orderId}>{orderId}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="mail-outline" size={20} color="#64748B" />
                    <Text style={styles.infoText}>
                        A confirmation email has been sent to your registered address.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('Main')}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.btnText}>Back to Home</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryBtn}
                        onPress={() => navigation.navigate('Main', { screen: 'Shop' })}
                    >
                        <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    content: { flex: 1, alignItems: 'center', padding: 30, justifyContent: 'center' },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 30,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    iconGradient: {
        flex: 1,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    orderCard: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 30,
    },
    orderLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
    orderId: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 50,
    },
    infoText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20 },
    buttonContainer: { width: '100%', gap: 15 },
    primaryBtn: { height: 56, borderRadius: 16, overflow: 'hidden' },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    secondaryBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    secondaryBtnText: { color: '#64748B', fontSize: 16, fontWeight: '700' },
});

export default OrderSuccessScreen;
