import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';

export const OfflineBanner = () => {
    const { isOnline } = useNetwork();
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-80)).current;
    const wasOffline = useRef(false);

    useEffect(() => {
        if (!isOnline) {
            wasOffline.current = true;
        }
        Animated.spring(translateY, {
            toValue: isOnline ? -80 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 60,
        }).start();
    }, [isOnline, translateY]);

    // Don't render at all if never went offline
    if (isOnline && !wasOffline.current) return null;

    return (
        <Animated.View
            style={[
                styles.banner,
                { paddingTop: insets.top + 8, transform: [{ translateY }] },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={isOnline ? 'Back online' : 'You are offline'}
        >
            <Ionicons
                name={isOnline ? 'cloud-done-outline' : 'cloud-offline-outline'}
                size={16}
                color="#FFF"
            />
            <Text style={styles.text}>
                {isOnline ? 'Back online' : "You're offline — some features may be limited"}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E293B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        paddingHorizontal: 16,
        gap: 8,
        zIndex: 9999,
        elevation: 999,
    },
    text: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
});
