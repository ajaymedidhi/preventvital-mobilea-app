import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import { setToken, getToken, deleteToken } from '../api/storage';
import { initializeGoogleFit } from '../api/googleFitService';

interface ConsentContextType {
    hasConsented: boolean;
    isLoadingConsent: boolean;
    giveConsent: () => Promise<void>;
    revokeConsent: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
    const [hasConsented, setHasConsented] = useState(false);
    const [isLoadingConsent, setIsLoadingConsent] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let consent;
            try {
                consent = await getToken('userConsent');
            } catch (e) {
                // Restoring consent failed
            }
            setHasConsented(consent === 'true');
            setIsLoadingConsent(false);
        };

        bootstrapAsync();
    }, []);

    const giveConsent = async () => {
        await setToken('userConsent', 'true');
        setHasConsented(true);
        if (Platform.OS === 'android') {
            await initializeGoogleFit();
        }
    };

    const revokeConsent = async () => {
        await deleteToken('userConsent');
        setHasConsented(false);
    };

    return (
        <ConsentContext.Provider value={{ hasConsented, isLoadingConsent, giveConsent, revokeConsent }}>
            {children}
        </ConsentContext.Provider>
    );
};

export const useConsent = () => {
    const context = useContext(ConsentContext);
    if (!context) {
        throw new Error('useConsent must be used within a ConsentProvider');
    }
    return context;
};
