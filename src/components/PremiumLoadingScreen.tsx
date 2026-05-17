import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const PremiumLoadingScreen = () => {
    const pulseAnim = useRef(new Animated.Value(0.92)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Pulse the logo gently
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.06,
                    duration: 1200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.92,
                    duration: 1200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Expanding ring 1
        Animated.loop(
            Animated.sequence([
                Animated.timing(ring1, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.delay(400),
            ])
        ).start();

        // Expanding ring 2 (offset)
        setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(ring2, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.delay(400),
                ])
            ).start();
        }, 700);

        // Bouncing dots
        const dotSequence = (dot: Animated.Value, delay: number) =>
            setTimeout(() => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(dot, { toValue: -6, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                        Animated.timing(dot, { toValue: 0, duration: 350, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                        Animated.delay(600),
                    ])
                ).start();
            }, delay);

        dotSequence(dotAnim1, 0);
        dotSequence(dotAnim2, 180);
        dotSequence(dotAnim3, 360);
    }, []);

    const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
    const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.15, 0] });

    const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
    const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.1, 0] });

    return (
        <View style={styles.root}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#3E95BF', '#51A6CB', '#8B3B9E', '#BF40A3']}
                locations={[0, 0.35, 0.7, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Soft background blobs */}
            <View style={[styles.blob, styles.blobTop]} />
            <View style={[styles.blob, styles.blobBottom]} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Logo area with ripple rings */}
                <View style={styles.logoArea}>
                    <Animated.View style={[
                        styles.ring,
                        { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }
                    ]} />
                    <Animated.View style={[
                        styles.ring,
                        { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }
                    ]} />

                    <Animated.View style={[styles.logoCard, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)']}
                            style={styles.logoCardInner}
                        >
                            {/* ECG-style icon built from shapes */}
                            <View style={styles.heartWrapper}>
                                <Text style={styles.heartEmoji}>♥</Text>
                                <View style={styles.ecgLine}>
                                    <View style={styles.ecgFlat} />
                                    <View style={styles.ecgUp} />
                                    <View style={styles.ecgPeak} />
                                    <View style={styles.ecgDown} />
                                    <View style={styles.ecgFlat} />
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Brand text */}
                <View style={styles.textBlock}>
                    <Text style={styles.brandPart1}>PREVENT</Text>
                    <Text style={styles.brandPart2}>VITAL</Text>
                </View>
                <Text style={styles.tagline}>Predictive Health & Wellness</Text>

                {/* Bouncing dots loader */}
                <View style={styles.dotsRow}>
                    {[dotAnim1, dotAnim2, dotAnim3].map((dot, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.dot, { transform: [{ translateY: dot }] }]}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};

const LOGO_SIZE = 96;
const RING_SIZE = LOGO_SIZE + 20;

const styles = StyleSheet.create({
    root: { flex: 1 },

    blob: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    blobTop: { top: -width * 0.3, right: -width * 0.2 },
    blobBottom: { bottom: -width * 0.3, left: -width * 0.2 },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoArea: {
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },

    ring: {
        position: 'absolute',
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
    },

    logoCard: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 20,
    },
    logoCardInner: {
        flex: 1,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    heartWrapper: {
        alignItems: 'center',
    },
    heartEmoji: {
        fontSize: 42,
        color: '#FFFFFF',
        lineHeight: 50,
    },
    ecgLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        height: 12,
    },
    ecgFlat: {
        width: 8,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 1,
    },
    ecgUp: {
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'rgba(255,255,255,0.9)',
    },
    ecgPeak: {
        width: 0,
        height: 0,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(255,255,255,0.9)',
    },
    ecgDown: {
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(255,255,255,0.8)',
    },

    textBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    brandPart1: {
        fontSize: 28,
        fontWeight: '300',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 4,
    },
    brandPart2: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 8,
        marginBottom: 40,
    },

    dotsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: 'rgba(255,255,255,0.75)',
    },
});

export default PremiumLoadingScreen;
