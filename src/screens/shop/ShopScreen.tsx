import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    FlatList, Dimensions, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { getProducts } from '../../api/shopApi';
import { useShop, Product } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 50) / 2;

const ShopScreen = () => {
    const navigation = useNavigation<any>();
    const { addToCart, cart } = useShop();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchProductsData = useCallback(async () => {
        try {
            const res = await getProducts();
            setProducts(res.data?.products || []);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchProductsData();
    }, [fetchProductsData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProductsData();
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filteredProducts = products.filter(p => {
        if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        return true;
    });

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            activeOpacity={0.9}
        >
            <Image
                source={getImageUrl(item.image, item.images)}
                style={styles.productImage}
                contentFit="contain"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <TouchableOpacity
                        style={styles.addToCartBtn}
                        onPress={() => addToCart(item)}
                    >
                        <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
            
            {/* Header */}
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Shop</Text>
                            <Text style={styles.headerSub}>Health & Wellness Supplies</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.cartIconContainer}
                            onPress={() => navigation.navigate('Cart')}
                        >
                            <Ionicons name="cart-outline" size={28} color="#FFF" />
                            {cart.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cart.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color="#93C5FD" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search products..."
                            placeholderTextColor="#93C5FD"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Categories */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                            >
                                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : filteredProducts.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No products found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
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
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingBottom: 20 },
    headerContent: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        marginTop: 10,
        marginBottom: 15
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 13, color: '#DBEAFE', fontWeight: '500', marginTop: 2 },
    cartIconContainer: { padding: 5 },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2563EB'
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    searchBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        marginHorizontal: 20, 
        borderRadius: 12, 
        paddingHorizontal: 14, 
        height: 44, 
        marginBottom: 15 
    },
    searchInput: { flex: 1, fontSize: 14, color: '#FFF', marginLeft: 8 },
    filterRow: { paddingHorizontal: 20 },
    filterChip: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        marginRight: 10 
    },
    filterChipActive: { backgroundColor: '#FFF' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#BFDBFE' },
    filterChipTextActive: { color: '#2563EB' },
    
    productList: { padding: 15 },
    productCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    productImage: { 
        width: '100%', 
        height: COLUMN_WIDTH - 24, 
        marginBottom: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 10
    },
    productInfo: { flex: 1 },
    productName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    productCategory: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginBottom: 8 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productPrice: { fontSize: 15, fontWeight: '800', color: '#2563EB' },
    addToCartBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '500' }
});

export default ShopScreen;
