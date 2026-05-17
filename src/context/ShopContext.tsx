import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    images?: string[];
    category: string;
    stock: number;
    averageRating?: number;
    reviewCount?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

interface ShopContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    // Tracks which user's cart is currently loaded — null means "between users, don't save"
    const activeCartKey = useRef<string | null>(null);

    // Reload cart whenever the logged-in user changes (login, logout, user switch)
    useEffect(() => {
        const userId = user?._id || user?.id || null;
        const newKey = userId ? `cart_${userId}` : null;

        if (newKey === activeCartKey.current) return;

        // Clear in-memory cart and disable saving until the new user's cart is loaded
        setCart([]);
        activeCartKey.current = null;

        if (newKey) {
            AsyncStorage.getItem(newKey)
                .then(saved => {
                    activeCartKey.current = newKey;
                    setCart(saved ? JSON.parse(saved) : []);
                })
                .catch(() => {
                    activeCartKey.current = newKey;
                });
        }
        // If newKey is null (logged out), leave activeCartKey.current as null — cart stays empty, nothing is saved
    }, [user?._id, user?.id]);

    // Persist cart on every change, but only for the currently active user key
    useEffect(() => {
        if (!activeCartKey.current) return;
        AsyncStorage.setItem(activeCartKey.current, JSON.stringify(cart)).catch(() => {});
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <ShopContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalAmount,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
