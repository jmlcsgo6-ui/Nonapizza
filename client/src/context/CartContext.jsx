import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('nona_cart');
        return saved ? JSON.parse(saved) : [];
    });
    
    // Optional floating UI states we can manage globally here or in layout
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('nona_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => [...prev, item]); // Ensure unique IDs if complex
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart, cartTotal,
            isCartOpen, setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
