import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // In production, replace this with Sentry.captureException(error, { extra: info })
        if (__DEV__) {
            console.error('[ErrorBoundary] Caught error:', error.message);
            console.error('[ErrorBoundary] Component stack:', info.componentStack);
        }
    }

    reset = () => this.setState({ hasError: false, error: null });

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle-outline" size={72} color="#EF4444" />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        {__DEV__ && this.state.error?.message
                            ? this.state.error.message
                            : 'An unexpected error occurred. Please try again.'}
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.reset}
                        accessibilityRole="button"
                        accessibilityLabel="Try again"
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F8FAFC',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 36,
        maxWidth: 300,
    },
    button: {
        backgroundColor: '#51A6CB',
        paddingHorizontal: 36,
        paddingVertical: 14,
        borderRadius: 14,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
