'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = {
  terracotta: '#C8622A',
  ember: '#E8873A',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
  smoke: '#8B7B6E',
};

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="screen" style={{ backgroundColor: COLORS.cream }}>
        <div className="page-header">
          <Link href="/" className="back-btn" style={{
            width: 38, height: 38, borderRadius: 12, background: COLORS.sand,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none', color: COLORS.bark
          }}>←</Link>
          <div className="page-header-title" style={{
            fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: COLORS.bark
          }}>My Cart</div>
        </div>
        <div className="success-screen" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 30px', textAlign: 'center', flex: 1
        }}>
          <div style={{
            width: 90, height: 90, borderRadius: 30, background: COLORS.sand,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, marginBottom: 24
          }}>🛒</div>
          <div className="success-title" style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: COLORS.bark, marginBottom: 12
          }}>Your cart is empty</div>
          <div className="success-sub" style={{
            fontSize: 14, color: COLORS.smoke, lineHeight: 1.6, marginBottom: 30
          }}>Discover workshops, classes, and craft supplies waiting for you.</div>
          <button className="continue-btn" onClick={() => router.push('/workshops')} style={{
            width: '100%', background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12
          }}>Browse Workshops</button>
          <button className="browse-btn" onClick={() => router.push('/shop')} style={{
            width: '100%', background: COLORS.sand, color: COLORS.bark, border: 'none',
            borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>Visit the Shop</button>
        </div>
      </div>
    );
  }

  const subtotal = total;
  const currency = items[0]?.currency || 'SAR';
  // KWD has no VAT; SA applies 15% VAT
  const vatRate = currency === 'KWD' ? 0 : 0.15;
  const vat = Math.round(subtotal * vatRate);
  const totalWithVat = subtotal + vat;

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: '100vh' }}>
      <div className="page-header">
        <Link href="/" className="back-btn" style={{
          width: 38, height: 38, borderRadius: 12, background: COLORS.sand,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none', color: COLORS.bark
        }}>←</Link>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: COLORS.bark
        }}>My Cart ({items.length})</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {items.map((item, idx) => (
          <div key={`${item.eventSlug}-${item.itemId}-${idx}`} style={{
            display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(61,43,26,0.06)', alignItems: 'flex-start'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0
            }}>🎫</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.bark, marginBottom: 3 }}>{item.eventName}</div>
              <div style={{ fontSize: 11, color: COLORS.smoke, marginBottom: 8 }}>{item.itemName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => updateQuantity(item.eventSlug, item.itemId, item.quantity - 1)} style={{
                  width: 28, height: 28, borderRadius: 8, background: COLORS.sand, border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: COLORS.bark
                }}>−</button>
                <span style={{ width: 20, textAlign: 'center', fontWeight: 700, color: COLORS.bark, fontSize: 14 }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.eventSlug, item.itemId, item.quantity + 1)} style={{
                  width: 28, height: 28, borderRadius: 8, background: COLORS.sand, border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: COLORS.bark
                }}>+</button>
                <button onClick={() => removeItem(item.eventSlug, item.itemId)} style={{
                  marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: COLORS.smoke
                }}>🗑</button>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.terracotta, alignSelf: 'center' }}>
              {formatCurrency(item.price * item.quantity, item.currency || 'SAR')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '16px 20px', background: COLORS.sand, borderRadius: 18, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(61,43,26,0.08)' }}>
          <span style={{ fontSize: 13, color: COLORS.smoke }}>Subtotal</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.bark }}>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(61,43,26,0.08)' }}>
          <span style={{ fontSize: 13, color: COLORS.smoke }}>{currency === 'KWD' ? 'VAT' : 'VAT (15%)'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.bark }}>{vat > 0 ? formatCurrency(vat, currency) : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.bark }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: COLORS.terracotta, fontFamily: "'Playfair Display', serif" }}>{formatCurrency(totalWithVat, currency)}</span>
        </div>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ background: 'rgba(200,98,42,0.08)', border: '1px solid rgba(200,98,42,0.2)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>🎟</span>
          <input placeholder="Promo code" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.bark }} />
          <button style={{ background: COLORS.terracotta, color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Apply</button>
        </div>
      </div>

      <button onClick={handleCheckout} style={{
        margin: '16px 20px', width: 'calc(100% - 40px)', background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
        color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: 0.3
      }}>
        Proceed to Checkout →
      </button>

      <div style={{ height: 20 }} />
    </div>
  );
}
