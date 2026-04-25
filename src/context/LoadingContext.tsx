import React, { createContext, useState, useContext, ReactNode } from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingContextType {
    showLoading: (message?: string) => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | undefined>();

    const showLoading = (msg?: string) => {
        setMessage(msg);
        setLoading(true);
    };

    const hideLoading = () => {
        setLoading(false);
        setMessage(undefined);
    };

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {children}
            <Modal
                transparent={true}
                animationType="fade"
                visible={loading}
                onRequestClose={() => {}}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.activityIndicatorWrapper}>
                        <ActivityIndicator animating={loading} size="large" color="#BF40A3" />
                        {message && <Text style={styles.messageText}>{message}</Text>}
                    </View>
                </View>
            </Modal>
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.8)' // Dark slate semi-transparent
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10
    },
    messageText: {
        marginTop: 16,
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
        letterSpacing: 0.5,
        textAlign: 'center'
    }
});
