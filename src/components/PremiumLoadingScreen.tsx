import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PremiumLoadingScreen = () => {
    const pulseAnim = new Animated.Value(1);
    const rotateAnim = new Animated.Value(0);

    useEffect(() => {
        // Pulsing animation for the logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Slow rotation for a subtle background effect
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 20000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#51A6CB', '#BF40A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Animated.View style={[styles.bgCircle, { transform: [{ rotate }] }]}>
                    <View style={styles.innerCircle} />
                </Animated.View>

                <View style={styles.content}>
                    <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="heart-half" size={80} color="#fff" />
                        <View style={styles.logoBadge} />
                    </Animated.View>
                    
                    <Text style={styles.brandName}>PREVENTVITAL</Text>
                    <Text style={styles.tagline}>Intelligent Wellness</Text>
                    
                    <View style={styles.loaderBarContainer}>
                        <Animated.View style={styles.loaderBarFill} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgCircle: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    innerCircle: {
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '50%',
        height: '50%',
        borderRadius: width,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBadge: {
        position: 'absolute',
        top: 10,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#51A6CB',
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 4,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    loaderBarContainer: {
        width: 140,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginTop: 40,
        overflow: 'hidden',
    },
    loaderBarFill: {
        width: '40%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
});

export default PremiumLoadingScreen;
