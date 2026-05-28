import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Platform, Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useShop, CartItem } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { cart, removeFromCart, updateQuantity, totalAmount } = useShop();

    const handleCheckout = () => {
        navigation.navigate('Checkout');
    };

    if (cart.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
                <LinearGradient
                    colors={['#3A8AB5', '#51A6CB']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
                            <Ionicons name="chevron-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Cart</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="cart-outline" size={50} color="#3A8AB5" />
                    </View>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySub}>Looks like you haven't added anything to your cart yet.</Text>
                    <TouchableOpacity 
                        style={styles.shopNowBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                            style={styles.shopNowGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            locations={[0, 0.28, 0.7, 1]}
                        >
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3A8AB5" />
            <LinearGradient
                colors={['#3A8AB5', '#51A6CB']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {cart.map((item) => (
                    <View key={item._id} style={styles.cartItem}>
                        <Image source={getImageUrl(item.image, item.images)} style={styles.itemImage} resizeMode="contain" />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.itemCategory}>{item.category || 'Wellness'}</Text>
                            <Text style={styles.itemPrice}>₹{item.price}</Text>
                        </View>
                        <View style={styles.actionColumn}>
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => removeFromCart(item._id)}
                                accessibilityLabel={`Remove ${item.name} from cart`}
                                accessibilityRole="button"
                            >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item._id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove" size={14} color="#475569" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item._id, item.quantity + 1)}
                                >
                                    <Ionicons name="add" size={14} color="#475569" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Summary & Checkout */}
            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{totalAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={[styles.summaryValue, { color: '#059669', fontWeight: '700' }]}>FREE</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.checkoutBtn}
                    onPress={handleCheckout}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        locations={[0, 0.28, 0.7, 1]}
                    >
                        <Text style={styles.btnText}>Proceed to Checkout</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
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
    cartList: { flex: 1, padding: 16 },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    itemImage: { width: 75, height: 75, borderRadius: 12, backgroundColor: '#F8FAFC' },
    itemInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
    itemName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    itemCategory: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 },
    itemPrice: { fontSize: 16, fontWeight: '900', color: '#1E40AF' },
    actionColumn: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 75,
    },
    removeBtn: { padding: 4 },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 4,
    },
    qtyBtn: { padding: 6, paddingHorizontal: 8 },
    qtyText: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginHorizontal: 6 },
    footer: {
        backgroundColor: '#FFF',
        padding: 24,
        paddingTop: 18,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#1E40AF' },
    checkoutBtn: { height: 52, borderRadius: 16, overflow: 'hidden', marginTop: 18 },
    btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center', lineHeight: 20 },
    shopNowBtn: { marginTop: 24, width: 200, height: 50, borderRadius: 16, overflow: 'hidden' },
    shopNowGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    shopNowText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

export default CartScreen;
