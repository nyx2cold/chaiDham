"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

const CART_KEY = "chaidham_cart";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Save to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        } catch { }
    }, [cartItems]);

    const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i._id === item._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCartItems((prev) => prev.filter((i) => i._id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setCartItems((prev) => prev.filter((i) => i._id !== id));
        } else {
            setCartItems((prev) =>
                prev.map((i) => (i._id === id ? { ...i, quantity } : i))
            );
        }
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}