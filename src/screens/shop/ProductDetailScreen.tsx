import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useShop, Product } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';
import { Colors } from '../../theme/colors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { addToCart } = useShop();
    const { product } = route.params as { product: Product };
    const [added, setAdded] = React.useState(false);

    const handleAddToCart = () => {
        try {
            addToCart(product);
            setAdded(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Revert "Added" state after 2 seconds
            setTimeout(() => setAdded(false), 2000);
            
            // Explicit confirmation as requested
            Alert.alert('Success', `${product.name} added to cart!`);
        } catch {
            Alert.alert('Error', 'Could not add item to cart. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={getImageUrl(product.image, product.images)}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    <SafeAreaView style={styles.headerButtons} edges={['top']}>
                        <TouchableOpacity 
                            style={styles.iconBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={22} color="#0F172A" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category}</Text>
                        </View>
                        {(product.averageRating || 0) > 0 && (
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={13} color="#F59E0B" />
                                <Text style={styles.ratingText}>{product.averageRating?.toFixed(1)}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>₹{product.price}</Text>
                    
                    <View style={styles.divider} />
                    
                    {/* Description Card */}
                    <View style={styles.detailCard}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {product.detailedDescription || product.description || product.shortDescription}
                        </Text>
                    </View>

                    {product.benefits && product.benefits.length > 0 && (
                        <View style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Key Benefits</Text>
                            {product.benefits.map((benefit, index) => (
                                <View key={index} style={styles.bulletRow}>
                                    <View style={styles.benefitIconBg}>
                                        <Ionicons name="checkmark" size={12} color="#059669" />
                                    </View>
                                    <Text style={styles.bulletText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {product.usageInstructions && product.usageInstructions.length > 0 && (
                        <View style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>How to Use</Text>
                            {product.usageInstructions.map((instruction, index) => (
                                <View key={index} style={styles.stepRow}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.stepText}>{instruction}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {product.specs && product.specs.length > 0 && (
                        <View style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Specifications</Text>
                            <View style={styles.specsTable}>
                                {product.specs.map((spec, index) => (
                                    <View key={index} style={[styles.specTableRow, index % 2 === 0 && styles.specRowRowEven]}>
                                        <Text style={styles.specLabel}>{spec.label}</Text>
                                        <Text style={styles.specValue}>{spec.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.infoBox}>
                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark" size={20} color="#059669" />
                            <Text style={styles.infoText}>Quality Certified</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="flash" size={20} color="#3A8AB5" />
                            <Text style={styles.infoText}>Fast Delivery</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.addToCartBtn}
                    onPress={added ? () => navigation.navigate('Cart') : handleAddToCart}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={added ? ['#10B981', '#059669'] : ['#3A8AB5', '#51A6CB', '#9035A0', '#BF40A3']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        locations={added ? [0, 1] : [0, 0.28, 0.7, 1]}
                    >
                        <Ionicons 
                            name={added ? "checkmark-circle" : "cart"} 
                            size={20} 
                            color="#FFF" 
                            style={{ marginRight: 8 }} 
                        />
                        <Text style={styles.btnText}>
                            {added ? 'Added to Cart (View Cart)' : 'Add to Cart'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    imageContainer: {
        width: width,
        height: width * 0.85,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        position: 'relative',
    },
    image: { width: '75%', height: '75%' },
    headerButtons: {
        position: 'absolute',
        top: 10,
        left: 20,
        right: 20,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingTop: 24,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    categoryBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    categoryText: { color: '#2563EB', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
    name: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8, lineHeight: 28 },
    price: { fontSize: 24, fontWeight: '900', color: '#1E40AF', marginBottom: 18 },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
    detailCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    description: { fontSize: 14, color: '#475569', lineHeight: 22 },
    bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    benefitIconBg: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bulletText: { fontSize: 14, color: '#334155', flex: 1 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    stepNumber: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    stepNumberText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
    stepText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
    specsTable: {
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        overflow: 'hidden',
    },
    specTableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    specRowRowEven: { backgroundColor: '#F8FAFC' },
    specLabel: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    specValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        padding: 16,
        borderRadius: 20,
        justifyContent: 'space-around',
        marginTop: 8,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 13, fontWeight: '700', color: '#475569' },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFF',
    },
    addToCartBtn: {
        height: 54,
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default ProductDetailScreen;
