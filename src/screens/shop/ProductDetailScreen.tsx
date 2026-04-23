import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useShop, Product } from '../../context/ShopContext';
import { getImageUrl } from '../../utils/imageUtils';
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
        } catch (error) {
            console.error("Add to cart failed:", error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={getImageUrl(product.image, product.images)}
                        style={styles.image}
                        contentFit="contain"
                    />
                    <SafeAreaView style={styles.headerButtons} edges={['top']}>
                        <TouchableOpacity 
                            style={styles.iconBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>₹{product.price}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.infoBox}>
                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
                            <Text style={styles.infoText}>Quality Certified</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="timer-outline" size={20} color="#2563EB" />
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
                >
                    <LinearGradient
                        colors={added ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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
    container: { flex: 1, backgroundColor: '#FFF' },
    imageContainer: {
        width: width,
        height: width * 0.8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: { width: '80%', height: '80%' },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFF',
        marginTop: -30,
    },
    categoryBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    categoryText: { color: '#2563EB', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    name: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    price: { fontSize: 22, fontWeight: '800', color: '#2563EB', marginBottom: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
    description: { fontSize: 15, color: '#64748B', lineHeight: 24, marginBottom: 24 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        gap: 20,
    },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    bottomBar: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFF',
    },
    addToCartBtn: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default ProductDetailScreen;
