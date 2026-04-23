import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../../context/ShopContext';
import { createOrder, verifyPayment } from '../../api/shopApi';
import { useAuth } from '../../auth/AuthContext';

const CheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, totalAmount, clearCart } = useShop();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
    });

    const handlePlaceOrder = async () => {
        // Validation
        if (!address.street || !address.city || !address.state || !address.postalCode) {
            Alert.alert('Error', 'Please fill in all shipping details');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await createOrder({
                items: cart.map(item => ({ product: item._id, quantity: item.quantity })),
                shippingAddress: address
            });

            console.log("Order Created:", orderRes);
            const { order } = orderRes;

            // 2. MOCK PAYMENT FLOW (Since no native Razorpay is available)
            // In a real app with native Razorpay, we would open the Razorpay checkout here.
            // For now, we'll simulate a successful payment verification.
            
            Alert.alert(
                'Payment Simulation',
                'Since this is a development build without native Razorpay, we will simulate a successful payment.',
                [
                    {
                        text: 'PROCEED',
                        onPress: async () => {
                            try {
                                const verifyRes = await verifyPayment({
                                    razorpay_order_id: order.id,
                                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                                    razorpay_signature: 'bypass', // Backend logic allows 'bypass' if in dev mode
                                    items: cart,
                                    totalAmount: totalAmount,
                                    shippingAddress: address
                                });

                                if (verifyRes.status === 'success') {
                                    clearCart();
                                    navigation.navigate('OrderSuccess', { orderId: verifyRes.order.orderId });
                                } else {
                                    Alert.alert('Error', 'Payment verification failed');
                                }
                            } catch (err: any) {
                                console.error("Verification Error:", err);
                                Alert.alert('Error', err.response?.data?.message || 'Verification failed');
                            }
                        }
                    }
                ]
            );

        } catch (err: any) {
            console.error("Order Creation Error:", err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        {cart.map(item => (
                            <View key={item._id} style={styles.summaryItem}>
                                <Text style={styles.summaryName}>{item.quantity}x {item.name}</Text>
                                <Text style={styles.summaryPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{totalAmount}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <View style={styles.formCard}>
                        <TextInput
                            style={styles.input}
                            placeholder="Street Address"
                            value={address.street}
                            onChangeText={text => setAddress({ ...address, street: text })}
                        />
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                placeholder="City"
                                value={address.city}
                                onChangeText={text => setAddress({ ...address, city: text })}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="State"
                                value={address.state}
                                onChangeText={text => setAddress({ ...address, state: text })}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                placeholder="Postal Code"
                                keyboardType="numeric"
                                value={address.postalCode}
                                onChangeText={text => setAddress({ ...address, postalCode: text })}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: '#F1F5F9' }]}
                                placeholder="Country"
                                value={address.country}
                                editable={false}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.infoAlert}>
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text style={styles.infoAlertText}>
                        Payments are processed securely via Razorpay. Currently in Demo Mode.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.payBtn, loading && styles.disabledBtn]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.btnText}>Pay ₹{totalAmount}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryName: { fontSize: 14, color: '#475569' },
    summaryPrice: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    totalValue: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 12,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputRow: { flexDirection: 'row' },
    infoAlert: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
    },
    infoAlertText: { flex: 1, fontSize: 12, color: '#1E40AF', fontWeight: '500' },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    payBtn: { height: 56, borderRadius: 16, overflow: 'hidden' },
    disabledBtn: { opacity: 0.7 },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
