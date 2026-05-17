import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { ConsentProvider } from './src/health/ConsentContext';
import { ShopProvider } from './src/context/ShopContext';
import { LoadingProvider } from './src/context/LoadingContext';
import { NetworkProvider, useNetwork } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { setNetworkStatusCallback } from './src/api/client';

function AppContent() {
    const { setIsOnline } = useNetwork();

    useEffect(() => {
        setNetworkStatusCallback(setIsOnline);
        return () => setNetworkStatusCallback(null);
    }, [setIsOnline]);

    return (
        <>
            <AppNavigator />
            <StatusBar style="auto" />
            <OfflineBanner />
        </>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <NetworkProvider>
                    <LoadingProvider>
                        <AuthProvider>
                            <ConsentProvider>
                                <ShopProvider>
                                    <AppContent />
                                </ShopProvider>
                            </ConsentProvider>
                        </AuthProvider>
                    </LoadingProvider>
                </NetworkProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
