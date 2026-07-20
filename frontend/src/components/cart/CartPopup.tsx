'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { X, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function CartPopup() {
  const router = useRouter();
  const { items, removeItem, total, itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAddedItem, setHasAddedItem] = useState(false);

  useEffect(() => {
    if (items.length > 0 && hasAddedItem) {
      setIsOpen(true);
      const timer = setTimeout(() => {
        setIsOpen(false);
        setHasAddedItem(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [items.length, hasAddedItem]);

  useEffect(() => {
    const handleAddToCart = () => {
      setHasAddedItem(true);
    };

    window.addEventListener('addToCart', handleAddToCart);
    return () => window.removeEventListener('addToCart', handleAddToCart);
  }, []);

  // Every dismissible overlay needs a keyboard escape route, not just a tap target.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (items.length === 0) return null;

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(26,14,7,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-popup-title"
            style={{
              position: 'relative',
              background: '#FAF6F0',
              borderRadius: '28px 28px 0 0',
              width: '100%',
              maxWidth: 400,
              maxHeight: '85%',
              overflow: 'hidden',
            }}>
            {/* Handle */}
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: 'rgba(61,43,26,0.2)',
              margin: '14px auto 8px',
            }} />

            {/* Header */}
            <div style={{ padding: '0 20px 16px', borderBottom: '1px solid rgba(61,43,26,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={24} color="#C8622A" aria-hidden="true" />
                  <h2 id="cart-popup-title" style={{ fontWeight: 700, fontSize: 18, color: '#3D2B1A' }}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close cart summary"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#F2EAD8',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={18} color="#6F6154" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: 16, overflowY: 'auto', maxHeight: 240 }}>
              {items.slice(-3).map((item, idx) => (
                <div key={`${item.eventSlug}-${item.itemId}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#3D2B1A' }}>{item.eventName}</p>
                    <p style={{ fontSize: 12, color: '#8B7B6E' }}>{item.itemName} × {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#C8622A', fontSize: 15 }}>
                    {formatCurrency(item.price * item.quantity, item.currency || 'SAR')}
                  </p>
                </div>
              ))}
              {items.length > 3 && (
                <p style={{ fontSize: 12, textAlign: 'center', color: '#8B7B6E' }}>
                  +{items.length - 3} more items
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(61,43,26,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, color: '#3D2B1A', fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 900, color: '#C8622A', fontSize: 20, fontFamily: "'Playfair Display', serif" }}>
                  {formatCurrency(total, items[0]?.currency || 'SAR')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/checkout');
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #C8622A, #E8873A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Checkout
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    flex: 1,
                    background: '#F2EAD8',
                    color: '#3D2B1A',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
