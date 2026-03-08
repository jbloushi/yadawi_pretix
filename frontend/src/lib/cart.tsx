'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  eventSlug: string;
  organizerSlug: string;
  eventName: string;
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  currency: string;   // 'SAR' for yadawi-sa, 'KWD' for yadawi
  date: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventSlug: string, itemId: number) => void;
  updateQuantity: (eventSlug: string, itemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('yadawi-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yadawi-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.eventSlug === item.eventSlug && i.itemId === item.itemId);
      if (existing) {
        return prev.map(i =>
          i.eventSlug === item.eventSlug && i.itemId === item.itemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (eventSlug: string, itemId: number) => {
    setItems(prev => prev.filter(i => !(i.eventSlug === eventSlug && i.itemId === itemId)));
  };

  const updateQuantity = (eventSlug: string, itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(eventSlug, itemId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.eventSlug === eventSlug && i.itemId === itemId
        ? { ...i, quantity }
        : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
