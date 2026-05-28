import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../../context/ShopContext';
import { createOrder } from '../../api/shopApi';

const CheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { cart, totalAmount } = useShop();
    
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
            await createOrder({
                items: cart.map(item => ({ product: item._id, quantity: item.quantity })),
                shippingAddress: address
            });

            // TODO: Integrate native Razorpay SDK before going live.
            Alert.alert(
                'Payment Not Configured',
                'Native Razorpay integration is required for production payments. Please integrate the react-native-razorpay SDK before releasing.',
                [{ text: 'OK' }]
            );

        } catch (err: any) {
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
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stepper */}
                <View style={styles.stepperContainer}>
                    <View style={styles.step}>
                        <View style={[styles.stepDot, styles.stepDotCompleted]}>
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                        </View>
                        <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Cart</Text>
                    </View>
                    <View style={styles.stepLineActive} />
                    <View style={styles.step}>
                        <View style={[styles.stepDot, styles.stepDotActive]}>
                            <Text style={styles.stepDotTextActive}>2</Text>
                        </View>
                        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Shipping</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.step}>
                        <View style={styles.stepDot}>
                            <Text style={styles.stepDotText}>3</Text>
                        </View>
                        <Text style={styles.stepLabel}>Payment</Text>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        {cart.map(item => (
                            <View key={item._id} style={styles.summaryItem}>
                                <Text style={styles.summaryName} numberOfLines={1}>{item.quantity}x {item.name}</Text>
                                <Text style={styles.summaryPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}
                        <View style={styles.dashedDivider} />
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
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Street Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Street Address"
                                value={address.street}
                                onChangeText={text => setAddress({ ...address, street: text })}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.inputLabel}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    value={address.city}
                                    onChangeText={text => setAddress({ ...address, city: text })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>State</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="State"
                                    value={address.state}
                                    onChangeText={text => setAddress({ ...address, state: text })}
                                />
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.inputLabel}>Postal Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Postal Code"
                                    keyboardType="numeric"
                                    value={address.postalCode}
                                    onChangeText={text => setAddress({ ...address, postalCode: text })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Country</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#F1F5F9' }]}
                                    placeholder="Country"
                                    value={address.country}
                                    editable={false}
                                />
                            </View>
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
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        locations={[0, 0.28, 0.7, 1]}
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
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerGradient: {
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    scrollContent: { padding: 16 },
    
    // Stepper
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    step: {
        alignItems: 'center',
        flex: 1,
    },
    stepDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepDotActive: {
        backgroundColor: '#3A8AB5',
    },
    stepDotCompleted: {
        backgroundColor: '#10B981',
    },
    stepDotText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },
    stepDotTextActive: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    stepLabelActive: {
        color: '#3A8AB5',
        fontWeight: '800',
    },
    stepLabelCompleted: {
        color: '#10B981',
        fontWeight: '700',
    },
    stepLine: {
        height: 2,
        backgroundColor: '#E2E8F0',
        flex: 1,
        marginHorizontal: -10,
        marginTop: -16,
    },
    stepLineActive: {
        height: 2,
        backgroundColor: '#10B981',
        flex: 1,
        marginHorizontal: -10,
        marginTop: -16,
    },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryName: { fontSize: 14, color: '#475569', fontWeight: '500', flex: 1, marginRight: 10 },
    summaryPrice: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    dashedDivider: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 1,
        marginVertical: 12,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    totalValue: { fontSize: 18, fontWeight: '900', color: '#1E40AF' },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontWeight: '600',
    },
    inputRow: { flexDirection: 'row' },
    infoAlert: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        gap: 10,
    },
    infoAlertText: { flex: 1, fontSize: 12, color: '#1E40AF', fontWeight: '600', lineHeight: 18 },
    footer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    payBtn: { height: 52, borderRadius: 16, overflow: 'hidden' },
    disabledBtn: { opacity: 0.7 },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default CheckoutScreen;
