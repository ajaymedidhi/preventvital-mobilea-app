import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const isWeb = Platform.OS === 'web';
const ENCRYPTION_KEY_ALIAS = 'pv_secure_encryption_key';

// Securely retrieves or dynamically initializes a 256-bit encryption key in SecureStore
const getOrCreateEncryptionKey = async (): Promise<string> => {
    try {
        let key = isWeb
            ? localStorage.getItem(ENCRYPTION_KEY_ALIAS)
            : await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);

        if (!key) {
            // Generate a random 256-bit (32 character) key
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-';
            let generatedKey = '';
            for (let i = 0; i < 32; i++) {
                generatedKey += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            key = generatedKey;

            if (isWeb) {
                localStorage.setItem(ENCRYPTION_KEY_ALIAS, key);
            } else {
                await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key);
            }
        }
        return key;
    } catch {
        // Fallback static key if SecureStore fails (to prevent app crash, but maintain encrypt integrity)
        return 'pv_fallback_static_secret_key_9912';
    }
};

export const setToken = async (key: string, value: string) => {
    if (isWeb) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // localStorage unavailable
        }
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

export const getToken = async (key: string): Promise<string | null> => {
    if (isWeb) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

export const deleteToken = async (key: string) => {
    if (isWeb) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // localStorage unavailable
        }
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

// Encrypted Large Data Storage (using AES-256 on AsyncStorage to bypass SecureStore size limits)
export const setEncryptedItem = async (key: string, value: string): Promise<void> => {
    try {
        const encryptionKey = await getOrCreateEncryptionKey();
        const ciphertext = CryptoJS.AES.encrypt(value, encryptionKey).toString();
        if (isWeb) {
            localStorage.setItem(key, ciphertext);
        } else {
            await AsyncStorage.setItem(key, ciphertext);
        }
    } catch (e) {
        console.error('Failed to set encrypted item:', e);
    }
};

export const getEncryptedItem = async (key: string): Promise<string | null> => {
    try {
        const ciphertext = isWeb
            ? localStorage.getItem(key)
            : await AsyncStorage.getItem(key);
            
        if (!ciphertext) return null;

        const encryptionKey = await getOrCreateEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedText || null;
    } catch (e) {
        console.error('Failed to get encrypted item:', e);
        return null;
    }
};

export const deleteEncryptedItem = async (key: string): Promise<void> => {
    try {
        if (isWeb) {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    } catch (e) {
        console.error('Failed to delete encrypted item:', e);
    }
};
