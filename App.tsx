import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { ConsentProvider } from './src/health/ConsentContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ConsentProvider>
                    <AppNavigator />
                    <StatusBar style="auto" />
                </ConsentProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
