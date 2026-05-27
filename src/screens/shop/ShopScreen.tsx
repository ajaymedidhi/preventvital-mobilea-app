import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    FlatList, Dimensions, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { getProducts } from '../../api/shopApi';
import { useShop, Product } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';
import { Colors, Gradients } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

const CAT_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
    wearables:   { icon: 'watch-outline',        color: '#2563EB', bg: '#EFF6FF', label: 'Wearables' },
    test_kits:   { icon: 'flask-outline',         color: '#7C3AED', bg: '#F5F3FF', label: 'Test Kits' },
    supplements: { icon: 'nutrition-outline',     color: '#059669', bg: '#ECFDF5', label: 'Supplements' },
    equipment:   { icon: 'barbell-outline',       color: '#EA580C', bg: '#FFF7ED', label: 'Equipment' },
    monitors:    { icon: 'pulse-outline',         color: '#DC2626', bg: '#FEF2F2', label: 'Monitors' },
    All:         { icon: 'grid-outline',          color: '#51A6CB', bg: '#F0FAFF', label: 'All' },
};

const FEATURE_BANNERS = [
    { id: '1', title: 'Heart Health Bundle', sub: 'BP Monitor + Omega-3 + ECG Band', tag: 'TOP PICK', colors: ['#1D4ED8', '#2563EB'] as [string,string], icon: 'heart', category: 'monitors' },
    { id: '2', title: 'Diabetes Care Kit',   sub: 'Glucometer + Test Strips + Log',  tag: 'POPULAR', colors: ['#059669', '#10B981'] as [string,string], icon: 'fitness', category: 'test_kits' },
    { id: '3', title: 'Stress Relief Pack',  sub: 'Supplements for daily wellness',   tag: 'NEW',     colors: ['#7C3AED', '#8B5CF6'] as [string,string], icon: 'leaf', category: 'supplements' },
];

const getHealthBenefit = (category: string): { label: string; color: string; bg: string } => {
    switch (category) {
        case 'wearables':   return { label: '❤️ Heart Health',     color: '#DC2626', bg: '#FEF2F2' };
        case 'test_kits':   return { label: '🔬 Know Your Risk',   color: '#2563EB', bg: '#EFF6FF' };
        case 'supplements': return { label: '💊 Metabolic Health', color: '#059669', bg: '#ECFDF5' };
        default:            return { label: '🛡️ Wellness',          color: '#7C3AED', bg: '#F5F3FF' };
    }
};

const ShopScreen = () => {
    const insets = useSafeAreaInsets();
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
        } catch {
            // empty state shown
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => { fetchProductsData(); }, [fetchProductsData]);

    const onRefresh = () => { setRefreshing(true); fetchProductsData(); };

    const rawCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const categories = ['All', ...rawCategories];

    const filteredProducts = products.filter(p => {
        if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        return true;
    });

    const renderProductItem = ({ item }: { item: Product }) => {
        const benefit = getHealthBenefit(item.category);
        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                activeOpacity={0.9}
            >
                <View style={styles.imageWrap}>
                    <Image
                        source={getImageUrl(item.image, item.images)}
                        style={styles.productImage}
                        contentFit="contain"
                    />
                    {item.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}% OFF</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <View style={[styles.healthTag, { backgroundColor: benefit.bg }]}>
                        <Text style={[styles.healthTagText, { color: benefit.color }]} numberOfLines={1}>
                            {benefit.label}
                        </Text>
                    </View>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    {(item.averageRating || 0) > 0 && (
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={10} color="#F59E0B" />
                            <Text style={styles.ratingText}>{item.averageRating?.toFixed(1)}</Text>
                            {item.reviewCount && (
                                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                            )}
                        </View>
                    )}

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.productPrice}>₹{item.price}</Text>
                            {item.originalPrice && item.originalPrice > item.price && (
                                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.addToCartBtn}
                            onPress={() => addToCart(item)}
                            accessibilityLabel={`Add ${item.name} to cart`}
                            accessibilityRole="button"
                        >
                            <Ionicons name="add" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />

            {/* Header */}
            <LinearGradient
                colors={Gradients.brandFade}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                locations={[0, 0.6, 1]}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Health Shop</Text>
                        <Text style={styles.headerSub}>Curated wellness products</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => navigation.navigate('Cart')}
                        accessibilityLabel={cart.length > 0 ? `Cart, ${cart.length} items` : 'Cart'}
                        accessibilityRole="button"
                    >
                        <Ionicons name="cart-outline" size={24} color="#FFF" />
                        {cart.length > 0 && (
                            <View style={[styles.badge, { borderColor: Colors.gradientStart }]}>
                                <Text style={styles.badgeText}>{cart.length > 9 ? '9+' : cart.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={16} color="#93C5FD" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#93C5FD"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={16} color="#93C5FD" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {categories.map(cat => {
                        const cfg = CAT_CONFIG[cat] || CAT_CONFIG['All'];
                        const active = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[styles.filterChip, active && styles.filterChipActive]}
                            >
                                <Ionicons name={cfg.icon as any} size={12} color={active ? Colors.gradientStart : 'rgba(255,255,255,0.8)'} />
                                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                                    {cfg.label || cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.gradientStart} />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : filteredProducts.length === 0 ? (
                <ScrollView
                    contentContainerStyle={styles.emptyWrap}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gradientStart} />}
                >
                    {/* Feature Banners in empty state */}
                    <FeaturedBanners onCategoryPress={setSelectedCategory} />
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="storefront-outline" size={40} color={Colors.gradientStart} />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {searchQuery || selectedCategory !== 'All' ? 'No matches found' : 'No products yet'}
                        </Text>
                        <Text style={styles.emptySub}>
                            {searchQuery || selectedCategory !== 'All'
                                ? 'Try a different keyword or category'
                                : 'Check back soon for new arrivals'}
                        </Text>
                        {(searchQuery || selectedCategory !== 'All') && (
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            >
                                <Text style={styles.clearBtnText}>Clear Filters</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<FeaturedBanners onCategoryPress={setSelectedCategory} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gradientStart} />
                    }
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
};

function FeaturedBanners({ onCategoryPress }: { onCategoryPress: (cat: string) => void }) {
    return (
        <View style={styles.bannersSection}>
            <View style={styles.bannersSectionHeader}>
                <Text style={styles.bannersSectionTitle}>Featured Collections</Text>
                <Ionicons name="sparkles" size={14} color="#F59E0B" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {FEATURE_BANNERS.map(b => (
                    <TouchableOpacity
                        key={b.id}
                        activeOpacity={0.88}
                        onPress={() => onCategoryPress(b.category)}
                    >
                        <LinearGradient
                            colors={b.colors}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.bannerCard}
                        >
                            <View style={styles.bannerTagWrap}>
                                <Text style={styles.bannerTag}>{b.tag}</Text>
                            </View>
                            <Ionicons name={b.icon as any} size={28} color="rgba(255,255,255,0.3)" style={styles.bannerBgIcon} />
                            <Text style={styles.bannerTitle}>{b.title}</Text>
                            <Text style={styles.bannerSub}>{b.sub}</Text>
                            <View style={styles.bannerBtn}>
                                <Text style={styles.bannerBtnText}>Browse</Text>
                                <Ionicons name="arrow-forward" size={12} color={b.colors[0]} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

    // ── Header ──
    header: { paddingBottom: 16 },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 14,
    },
    headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
    headerSub: { fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginTop: 2 },
    cartBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
    badge: {
        position: 'absolute', top: -2, right: -2,
        backgroundColor: '#EF4444', borderRadius: 9, minWidth: 18, height: 18,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.gradientStart,
    },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 14,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#FFF', fontWeight: '500' },
    filterRow: { paddingHorizontal: 16, paddingBottom: 2, gap: 8 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    filterChipActive: { backgroundColor: '#FFF' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
    filterChipTextActive: { color: Colors.gradientStart },

    // ── Featured Banners ──
    bannersSection: { paddingTop: 20, paddingBottom: 8 },
    bannersSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
    bannersSectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    bannerCard: {
        width: width * 0.62, borderRadius: 18, padding: 16,
        minHeight: 130, justifyContent: 'space-between', overflow: 'hidden',
    },
    bannerTagWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
    bannerTag: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
    bannerBgIcon: { position: 'absolute', top: 12, right: 12 },
    bannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 15 },
    bannerBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFF', alignSelf: 'flex-start',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    },
    bannerBtnText: { fontSize: 11, fontWeight: '800', color: '#1E40AF' },

    // ── Product Grid ──
    productList: { padding: 12, paddingBottom: 100 },
    columnWrapper: { gap: 10, marginBottom: 10 },
    productCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    imageWrap: { position: 'relative', backgroundColor: '#F8FAFC' },
    productImage: { width: '100%', height: CARD_WIDTH - 20, backgroundColor: '#F1F5F9' },
    discountBadge: {
        position: 'absolute', top: 8, left: 8,
        backgroundColor: '#EF4444', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    discountText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
    productInfo: { padding: 12 },
    healthTag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginBottom: 7, alignSelf: 'flex-start' },
    healthTagText: { fontSize: 9, fontWeight: '700' },
    productName: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18, marginBottom: 5 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
    reviewCount: { fontSize: 10, color: '#94A3B8' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    productPrice: { fontSize: 15, fontWeight: '800', color: '#1E40AF' },
    originalPrice: { fontSize: 10, color: '#94A3B8', textDecorationLine: 'line-through' },
    addToCartBtn: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: Colors.gradientStart,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.gradientStart, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
    },

    // ── Empty State ──
    emptyWrap: { flexGrow: 1 },
    emptyState: { flex: 1, alignItems: 'center', paddingHorizontal: 40, paddingVertical: 40 },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 8, textAlign: 'center', lineHeight: 20 },
    clearBtn: { marginTop: 24, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.gradientStart },
    clearBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default ShopScreen;
