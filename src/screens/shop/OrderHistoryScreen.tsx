import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getMyOrders } from '../../api/shopApi';
import { Image } from 'expo-image';
import { getLocalProductImage } from '../../utils/productAssets';

const OrderHistoryScreen = () => {
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await getMyOrders();
            // Sort by createdAt desc
            const sortedOrders = (res.data?.orders || []).sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return '#059669';
            case 'shipped': return '#3B82F6';
            case 'placed':
            case 'confirmed': return '#8B5CF6';
            case 'cancelled': return '#EF4444';
            default: return '#64748B';
        }
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
                    <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    })}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
                        {item.orderStatus.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            {item.items.map((product: any, index: number) => (
                <View key={index} style={styles.productRow}>
                    <Image 
                        source={getLocalProductImage(product.productImage) || { uri: product.productImage }}
                        style={styles.productImage}
                        contentFit="contain"
                    />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>{product.productName}</Text>
                        <Text style={styles.productQty}>Qty: {product.quantity} × ₹{product.price}</Text>
                    </View>
                </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.orderFooter}>
                <Text style={styles.itemCount}>{item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}</Text>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalValue}>₹{item.pricing?.total || item.pricing?.subtotal}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptySub}>When you buy something, it'll show up here!</Text>
                    <TouchableOpacity 
                        style={styles.shopNowBtn}
                        onPress={() => navigation.navigate('Main', { screen: 'Shop' })}
                    >
                        <Text style={styles.shopNowText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                    }
                />
            )}
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
    listContent: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderIdText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    orderDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    productImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F1F5F9' },
    productInfo: { flex: 1, marginLeft: 12 },
    productName: { fontSize: 14, fontWeight: '600', color: '#334155' },
    productQty: { fontSize: 12, color: '#64748B', marginTop: 2 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemCount: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
    totalContainer: { flexDirection: 'row', alignItems: 'center' },
    totalLabel: { fontSize: 14, color: '#1E293B' },
    totalValue: { fontSize: 16, fontWeight: '800', color: '#2563EB' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
    shopNowBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, backgroundColor: '#3B82F6' },
    shopNowText: { color: '#FFF', fontWeight: '700' },
});

export default OrderHistoryScreen;
