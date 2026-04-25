import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { setToken, getToken, deleteToken } from '../api/storage';
import { login, signup, fetchMe } from '../api/authApi';
import { fetchMySubscription } from '../api/subscriptionApi';

interface AuthContextType {
    userToken: string | null;
    user: any | null;
    subscription: any | null;
    currentPlan: string;
    isLoading: boolean;
    isNewRegistration: boolean;
    signIn: (email: string, password?: string) => Promise<void>;
    signUp: (userData: any) => Promise<void>;
    signOut: () => Promise<void>;
    setAuthToken: (token: string, user?: any, isNewReg?: boolean) => Promise<void>;
    refreshSubscription: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [subscription, setSubscription] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewRegistration, setIsNewRegistration] = useState(false);

    const loadUserAndSubscription = async () => {
        try {
            // Parallelize these calls to cut loading time in half
            const [fetchedUser, subData] = await Promise.all([
                fetchMe(),
                fetchMySubscription()
            ]);
            
            setUser(fetchedUser);
            setSubscription(subData?.subscription || null);
        } catch (e) {
            console.error("Failed to fetch user or subscription:", e);
        }
    };

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            try {
                token = await getToken('userToken');
                if (token) {
                    await loadUserAndSubscription();
                }
            } catch (e) {
                console.error("Failed to bootstrap auth:", e);
                token = null;
                await deleteToken('userToken');
            }
            setUserToken(token);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const refreshSubscription = async () => {
        const subData = await fetchMySubscription();
        setSubscription(subData?.subscription || null);
    };

    const signIn = async (email: string, password?: string) => {
        if (password) {
            const { token, user: loggedInUser } = await login(email, password);
            await setToken('userToken', token);
            setUserToken(token);
            setUser(loggedInUser);
            
            // Fire and forget - don't block the UI transition with subscription fetch
            refreshSubscription();
        } else {
            console.warn("Using unsafe/mock signIn");
        }
    };

    const signUp = async (userData: any) => {
        const { token, user: signedUpUser } = await signup(userData);
        await setToken('userToken', token);
        setUserToken(token);
        setUser(signedUpUser);
        await refreshSubscription();
    };

    const setAuthToken = async (token: string, fetchedUser?: any, isNewReg = false) => {
        await setToken('userToken', token);
        setUserToken(token);
        if (fetchedUser) setUser(fetchedUser);
        setIsNewRegistration(isNewReg);
        await refreshSubscription();
    };

    const signOut = async () => {
        await deleteToken('userToken');
        setUserToken(null);
        setUser(null);
        setIsNewRegistration(false);
    };

    const currentPlan = (user?.subscriptionPlan || subscription?.plan || user?.corporateSubscription?.plan || 'free').toLowerCase();

    return (
        <AuthContext.Provider value={{ userToken, user, subscription, currentPlan, isLoading, isNewRegistration, signIn, signUp, signOut, setAuthToken, refreshSubscription, refreshUser: loadUserAndSubscription }}>
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
