import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useShop, CartItem } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, removeFromCart, updateQuantity, totalAmount } = useShop();

    const handleCheckout = () => {
        navigation.navigate('Checkout');
    };

    if (cart.length === 0) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.header} edges={['top']}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySub}>Add some items to get started!</Text>
                    <TouchableOpacity 
                        style={styles.shopNowBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.shopNowText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                {cart.map((item) => (
                    <View key={item._id} style={styles.cartItem}>
                        <Image source={getImageUrl(item.image, item.images)} style={styles.itemImage} contentFit="contain" />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.itemPrice}>₹{item.price}</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item._id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove" size={16} color="#475569" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item._id, item.quantity + 1)}
                                >
                                    <Ionicons name="add" size={16} color="#475569" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.removeBtn}
                            onPress={() => removeFromCart(item._id)}
                        >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Summary & Checkout */}
            <View style={styles.footer}>
                <SafeAreaView edges={['bottom']} style={styles.safeFooter}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{totalAmount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={[styles.summaryValue, { color: '#059669' }]}>FREE</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{totalAmount}</Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.checkoutBtn}
                        onPress={handleCheckout}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.btnText}>Proceed to Checkout</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </View>
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
    cartList: { flex: 1, padding: 15 },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    itemImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F8FAFC' },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    itemPrice: { fontSize: 14, fontWeight: '800', color: '#2563EB', marginBottom: 10 },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    qtyBtn: { padding: 4, paddingHorizontal: 8 },
    qtyText: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginHorizontal: 10 },
    removeBtn: { padding: 10 },
    footer: {
        backgroundColor: '#FFF',
        padding: 24,
        paddingTop: 16,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    safeFooter: {
        paddingBottom: Platform.OS === 'android' ? 10 : 0
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#64748B' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    totalLabel: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    totalValue: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
    checkoutBtn: { height: 56, borderRadius: 16, overflow: 'hidden', marginTop: 24 },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
    shopNowBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, backgroundColor: '#3B82F6' },
    shopNowText: { color: '#FFF', fontWeight: '700' },
});

export default CartScreen;
