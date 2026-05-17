import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RetryViewProps {
    message?: string;
    onRetry: () => void;
    loading?: boolean;
}

export const RetryView = ({
    message = 'Failed to load. Check your connection.',
    onRetry,
    loading = false,
}: RetryViewProps) => (
    <View style={styles.container}>
        <Ionicons name="cloud-offline-outline" size={52} color="#CBD5E1" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
            style={styles.button}
            onPress={onRetry}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Retry"
        >
            {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <>
                    <Ionicons name="refresh-outline" size={16} color="#FFF" />
                    <Text style={styles.buttonText}>Try Again</Text>
                </>
            )}
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 16,
        marginBottom: 28,
        maxWidth: 280,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#51A6CB',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 120,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
