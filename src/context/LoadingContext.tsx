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
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000060' // Slightly dark overlay
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        minHeight: 100,
        minWidth: 100,
        padding: 20,
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 8
    },
    messageText: {
        marginTop: 12,
        fontSize: 12,
        color: '#64748B',
        fontWeight: '700',
        textAlign: 'center'
    }
});
