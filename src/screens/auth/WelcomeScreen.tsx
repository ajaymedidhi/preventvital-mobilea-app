import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    Extrapolation,
    withDelay,
    withSequence,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 100;
const ORBIT_RADIUS = width * 0.35; // Responsive radius
const ICON_SIZE = 44;

// Health Component Icons data
const ORBIT_ICONS = [
    {
        icon: <Ionicons name="watch-outline" size={24} color="#4F46E5" />,
        label: "Wearables",
        Component: Ionicons,
        name: "watch-outline"
    },
    {
        icon: <MaterialCommunityIcons name="heart-pulse" size={24} color="#EC4899" />,
        label: "Heart Rate",
        Component: MaterialCommunityIcons,
        name: "heart-pulse"
    },
    {
        icon: <FontAwesome5 name="weight" size={20} color="#10B981" />,
        label: "Weight",
        Component: FontAwesome5,
        name: "weight"
    },
    {
        icon: <MaterialCommunityIcons name="diabetes" size={24} color="#F59E0B" />,
        label: "Glucose",
        Component: MaterialCommunityIcons,
        name: "diabetes"
    },
    {
        icon: <Ionicons name="water-outline" size={24} color="#3B82F6" />,
        label: "Hydration",
        Component: Ionicons,
        name: "water-outline"
    },
];

const WelcomeScreen = () => {
    const navigation = useNavigation<any>();

    // Animation Values
    const rotation = useSharedValue(0);
    const floating = useSharedValue(0);
    const logoScale = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    useEffect(() => {
        // Start Orbit Rotation loop
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 20000,
                easing: Easing.linear,
            }),
            -1, // Infinite
            false // Do not reverse
        );

        // Start Floating effect (breathing)
        floating.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true // Reverse
        );

        // Entrance Animations
        logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });
        textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(500, withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }));
    }, []);

    // Animated Styles
    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: logoScale.value },
                { translateY: floating.value }
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        };
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#51A6CB', '#BF40A3']} // New Blue to Pink-Purple gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} // Vertical gradient looks better for this combo
                style={styles.background}
            />

            {/* Background Decor */}
            <View style={styles.bgDecorCircle1} />
            <View style={styles.bgDecorCircle2} />

            <SafeAreaView style={styles.contentContainer}>

                {/* Animation Area */}
                <View style={styles.animationArea}>

                    {/* Orbit Path (Visual Guide - Optional) */}
                    <View style={styles.orbitPath} />
                    <View style={[styles.orbitPath, { width: ORBIT_RADIUS * 1.5, height: ORBIT_RADIUS * 1.5, opacity: 0.1, borderColor: '#a78bfa' }]} />

                    {/* Orbiting Icons */}
                    {ORBIT_ICONS.map((item, index) => {
                        const angleStep = 360 / ORBIT_ICONS.length;
                        const initialAngle = index * angleStep;

                        const animatedIconStyle = useAnimatedStyle(() => {
                            // Calculate current angle in degrees
                            const currentAngle = rotation.value + initialAngle;
                            const rad = (currentAngle * Math.PI) / 180;

                            // Position
                            const translateX = ORBIT_RADIUS * Math.cos(rad);
                            const translateY = ORBIT_RADIUS * Math.sin(rad);

                            // Counter-rotation to keep icon upright
                            // We rotate the container by 'currentAngle', so we rotate the icon by '-currentAngle' to stabilize it
                            // However, we are positioning with X/Y translate, so no container rotation needed actually.
                            // But if we want to add 3D depth scale:
                            const scale = interpolate(
                                Math.sin(rad),
                                [-1, 1],
                                [0.8, 1.1], // Items at bottom (front) larger, top (back) smaller
                                Extrapolation.CLAMP
                            );

                            const zIndex = Math.sin(rad) > 0 ? 10 : 1; // Front items on top
                            const opacity = interpolate(
                                Math.sin(rad),
                                [-1, 1],
                                [0.6, 1],
                                Extrapolation.CLAMP
                            );

                            return {
                                transform: [
                                    { translateX },
                                    { translateY },
                                    { scale }
                                ],
                                zIndex,
                                opacity
                            };
                        });

                        return (
                            <Animated.View key={index} style={[styles.orbitIconContainer, animatedIconStyle]}>
                                <View style={styles.orbitIconCircle}>
                                    {/* Using clones for simplicity in reanimated loop */}
                                    <item.Component name={item.name as any} size={20} color={index % 2 === 0 ? "#8B5CF6" : "#3B82F6"} />
                                </View>
                            </Animated.View>
                        );
                    })}

                    {/* Central Logo */}
                    <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                        <View style={styles.logoInner}>
                            <Image
                                source={require('../../../assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        {/* Glow Effect behind logo */}
                        <View style={styles.logoGlow} />
                    </Animated.View>

                </View>

                {/* Bottom Content */}
                <Animated.View style={[styles.bottomContent, textAnimatedStyle]}>

                    {/* Light Background Curve for "Already have account" area */}

                    <View style={styles.textContainer}>
                        <Text style={styles.appName}>Prevent Vital</Text>
                        <Text style={styles.tagline}>Connected Health Ecosystem</Text>
                        <Text style={styles.description}>
                            Seamlessly integrate your health devices and track your vitals in real-time.
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.getStartedButton}
                            onPress={() => navigation.navigate('SignUp')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#fff', '#fff']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={[styles.getStartedButtonText, { color: '#BF40A3' }]}>Get Started</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => navigation.navigate('SignIn')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    bgDecorCircle1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#6366F1',
        opacity: 0.1,
    },
    bgDecorCircle2: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#8B5CF6',
        opacity: 0.1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    animationArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        // Ensure orbit doesn't get cut off if screen is small
        minHeight: width * 0.8,
    },
    orbitPath: {
        position: 'absolute',
        width: ORBIT_RADIUS * 2,
        height: ORBIT_RADIUS * 2,
        borderRadius: ORBIT_RADIUS,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    orbitIconContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // Center the icon container on the path line
        // Since we translate from center (0,0), no offset needed here depending on layout
    },
    orbitIconCircle: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    logoWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Ensure logo is above back orbit items, but below front ones if intended? 
        // Actually, for a simple orbit, logo usually in distinct layer. 
        // If we want icons to go BEHIND logo, we need to sort views or use zIndex prop in animated style.
        // We set zIndex in animatedIconStyle: 1 or 10. Logo should be e.g. 5.
    },
    logoInner: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        backgroundColor: '#fff',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        shadowColor: "#8B5CF6", // Purple glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    logoGlow: {
        position: 'absolute',
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 24,
        backgroundColor: '#8B5CF6',
        opacity: 0.3,
        transform: [{ scale: 1.2 }],
        zIndex: -1,
    },
    logo: {
        width: LOGO_SIZE * 0.7,
        height: LOGO_SIZE * 0.7,
    },
    bottomContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        backgroundColor: 'transparent', // Or a blur view if needed
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        color: '#C4B5FD', // Light purple
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: 15,
        color: '#E2E8F0', // Slate 200
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '85%',
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    getStartedButton: {
        height: 56,
        borderRadius: 12, // Reduced radius slightly to match image style usually, or keep pill
        shadowColor: "#8B5CF6",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden'
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedButtonText: {
        color: '#BF40A3', // Or Blue based on image? Image looked like blue text. 
        // Keeping consistent with gradient for now, can change if needed.
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    signInButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
        backgroundColor: 'transparent'
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Removed bottomCurve as it wasn't in the reference image provided
});

export default WelcomeScreen;
