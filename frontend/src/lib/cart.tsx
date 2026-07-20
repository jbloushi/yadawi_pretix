'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBranch } from './branch';
import { track } from './analytics';
import type { Market } from './market';

export interface CartItem {
  eventSlug: string;
  organizerSlug: string;
  eventName: string;
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  currency: string;
  date: string;
  subeventId?: number | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventSlug: string, itemId: number, subeventId?: number | null) => void;
  updateQuantity: (eventSlug: string, itemId: number, quantity: number, subeventId?: number | null) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hydrated: boolean;
}

type RegionalCarts = Record<Market, CartItem[]>;
const emptyCarts = (): RegionalCarts => ({ KWT: [], KSA: [] });
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { branch, orgSlug } = useBranch();
  const [carts, setCarts] = useState<RegionalCarts>(emptyCarts);
  const [hydrated, setHydrated] = useState(false);
  const items = carts[branch];

  useEffect(() => {
    const loaded = emptyCarts();
    (['KWT', 'KSA'] as Market[]).forEach(market => {
      try {
        const raw = localStorage.getItem(`yadawi-cart:${market}`);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) loaded[market] = parsed;
      } catch { /* Ignore corrupt local state and keep the cart usable. */ }
    });
    setCarts(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (['KWT', 'KSA'] as Market[]).forEach(market => {
      localStorage.setItem(`yadawi-cart:${market}`, JSON.stringify(carts[market]));
    });
  }, [carts, hydrated]);

  const sameLine = (a: CartItem, b: Partial<CartItem>) =>
    a.eventSlug === b.eventSlug && a.itemId === b.itemId &&
    (a.subeventId ?? null) === (b.subeventId ?? null);

  const updateActiveCart = (updater: (current: CartItem[]) => CartItem[]) => {
    setCarts(previous => ({ ...previous, [branch]: updater(previous[branch]) }));
  };

  const addItem = (item: CartItem) => {
    if (item.organizerSlug !== orgSlug) {
      throw new Error('This item belongs to a different market. Switch markets before adding it.');
    }
    updateActiveCart(previous => {
      const existing = previous.find(i => sameLine(i, item));
      return existing
        ? previous.map(i => sameLine(i, item) ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...previous, item];
    });
    track('cart_updated', { market: branch, currency: item.currency, product_id: item.itemId, seat_count: item.quantity });
  };

  const removeItem = (eventSlug: string, itemId: number, subeventId: number | null = null) => {
    updateActiveCart(previous => previous.filter(i => !sameLine(i, { eventSlug, itemId, subeventId })));
  };

  const updateQuantity = (eventSlug: string, itemId: number, quantity: number, subeventId: number | null = null) => {
    if (quantity <= 0) return removeItem(eventSlug, itemId, subeventId);
    updateActiveCart(previous => previous.map(i =>
      sameLine(i, { eventSlug, itemId, subeventId }) ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    updateActiveCart(() => []);
    track('cart_updated', { market: branch, seat_count: 0 });
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
