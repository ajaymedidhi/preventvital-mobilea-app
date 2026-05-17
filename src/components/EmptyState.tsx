import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({
    icon = 'folder-open-outline',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) => (
    <View style={styles.container}>
        <View style={styles.iconWrap}>
            <Ionicons name={icon} size={52} color="#CBD5E1" />
        </View>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel && onAction ? (
            <TouchableOpacity
                style={styles.button}
                onPress={onAction}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
            >
                <Text style={styles.buttonText}>{actionLabel}</Text>
            </TouchableOpacity>
        ) : null}
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
    iconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 28,
        maxWidth: 280,
    },
    button: {
        backgroundColor: '#51A6CB',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
