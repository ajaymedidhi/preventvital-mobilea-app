import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { setToken, getToken, deleteToken } from '../api/storage';
import { login, signup } from '../api/authApi';

interface AuthContextType {
    userToken: string | null;
    isLoading: boolean;
    signIn: (email: string, password?: string) => Promise<void>;
    signUp: (userData: any) => Promise<void>;
    signOut: () => Promise<void>;
    setAuthToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            try {
                token = await getToken('userToken');
            } catch (e) {
                // Restoring token failed
            }
            setUserToken(token);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const signIn = async (email: string, password?: string) => {
        if (password) {
            // Real login
            const token = await login(email, password);
            await setToken('userToken', token);
            setUserToken(token);
        } else { // Fallback/Test mode if needed, or error
            console.warn("Using unsafe/mock signIn");
        }
    };

    const signUp = async (userData: any) => {
        const token = await signup(userData);
        await setToken('userToken', token);
        setUserToken(token);
    };

    const setAuthToken = async (token: string) => {
        await setToken('userToken', token);
        setUserToken(token);
    };

    const signOut = async () => {
        await deleteToken('userToken');
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signUp, signOut, setAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
