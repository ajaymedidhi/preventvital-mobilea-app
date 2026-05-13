import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardSkeleton = () => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        startAnimation();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Animated.View style={[styles.skeleton, styles.greeting, { opacity }]} />
                    <Animated.View style={[styles.skeleton, styles.userName, { opacity }]} />
                </View>
                <Animated.View style={[styles.skeleton, styles.avatar, { opacity }]} />
            </View>

            <Animated.View style={[styles.skeleton, styles.mainCard, { opacity }]} />
            
            <View style={styles.grid}>
                {[1, 2, 3, 4].map((i) => (
                    <Animated.View key={i} style={[styles.skeleton, styles.smallCard, { opacity }]} />
                ))}
            </View>

            <Animated.View style={[styles.skeleton, styles.listHeader, { opacity }]} />
            <Animated.View style={[styles.skeleton, styles.sessionCard, { opacity }]} />
            <Animated.View style={[styles.skeleton, styles.sessionCard, { opacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, marginTop: 20 },
    headerText: { flex: 1 },
    skeleton: { backgroundColor: '#E2E8F0', borderRadius: 12 },
    greeting: { width: 100, height: 16, marginBottom: 8 },
    userName: { width: 180, height: 28 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    mainCard: { width: '100%', height: 160, borderRadius: 24, marginBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    smallCard: { width: (width - 55) / 2, height: 100, borderRadius: 20, marginBottom: 15 },
    listHeader: { width: 150, height: 20, marginBottom: 16, marginTop: 10 },
    sessionCard: { width: '100%', height: 160, borderRadius: 24, marginBottom: 16 }
});

export default DashboardSkeleton;
