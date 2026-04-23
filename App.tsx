import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { ConsentProvider } from './src/health/ConsentContext';
import { ShopProvider } from './src/context/ShopContext';
import { LoadingProvider } from './src/context/LoadingContext';
import AppNavigator from './src/navigation/AppNavigator';

console.log("App.tsx: Module loaded");

export default function App() {
    console.log("App: Component rendering");
    return (
        <SafeAreaProvider>
            <LoadingProvider>
                <AuthProvider>
                    <ConsentProvider>
                        <ShopProvider>
                            <AppNavigator />
                            <StatusBar style="auto" />
                        </ShopProvider>
                    </ConsentProvider>
                </AuthProvider>
            </LoadingProvider>
        </SafeAreaProvider>
    );
}
