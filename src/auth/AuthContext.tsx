import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { setToken, getToken, deleteToken } from '../api/storage';
import { login, signup, fetchMe } from '../api/authApi';

interface AuthContextType {
    userToken: string | null;
    user: any | null;
    isLoading: boolean;
    signIn: (email: string, password?: string) => Promise<void>;
    signUp: (userData: any) => Promise<void>;
    signOut: () => Promise<void>;
    setAuthToken: (token: string, user?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            try {
                token = await getToken('userToken');
                if (token) {
                    const fetchedUser = await fetchMe();
                    setUser(fetchedUser);
                }
            } catch (e) {
                // Restoring token failed or fetchMe failed (token invalid/expired)
                console.error("Failed to bootstrap auth:", e);
                token = null;
                await deleteToken('userToken');
            }
            setUserToken(token);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const signIn = async (email: string, password?: string) => {
        if (password) {
            const { token, user: loggedInUser } = await login(email, password);
            await setToken('userToken', token);
            setUserToken(token);
            setUser(loggedInUser);
        } else {
            console.warn("Using unsafe/mock signIn");
        }
    };

    const signUp = async (userData: any) => {
        const { token, user: signedUpUser } = await signup(userData);
        await setToken('userToken', token);
        setUserToken(token);
        setUser(signedUpUser);
    };

    const setAuthToken = async (token: string, fetchedUser?: any) => {
        await setToken('userToken', token);
        setUserToken(token);
        if (fetchedUser) setUser(fetchedUser);
    };

    const signOut = async () => {
        await deleteToken('userToken');
        setUserToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, user, isLoading, signIn, signUp, signOut, setAuthToken }}>
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
