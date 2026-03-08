'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { Check, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = {
  terracotta: '#C8622A',
  ember: '#E8873A',
  bark: '#3D2B1A',
  sand: '#F2EAD8',
  cream: '#FAF6F0',
  smoke: '#8B7B6E',
  white: '#FFFFFF',
};

function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, total } = useCart();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderCode, setSuccessOrderCode] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('cod');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [countryCode, setCountryCode] = useState('966');

  const countryCodes = [
    { code: '966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '971', name: 'UAE', flag: '🇦🇪' },
    { code: '973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '974', name: 'Qatar', flag: '🇶🇦' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || items.length === 0) return;

    const phoneDigits = phone.trim().replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    setError(null);

    const fullPhone = `+${countryCode}${phoneDigits}`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positions: items.map(item => ({
            eventSlug: item.eventSlug,
            organizerSlug: item.organizerSlug,
            itemId: item.itemId,
            quantity: item.quantity,
            name: name.trim(),
            phone: fullPhone,
            email: email.trim() || undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      clearCart();

      const orderCode = data.code || (data.orders && data.orders.length > 0
        ? data.orders.map((o: { code: string }) => o.code).join(',')
        : 'ORD-' + Date.now());

      setSuccessOrderCode(orderCode);
      setStep(3);
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const locale = 'ar';
  const subtotal = total;
  const currency = items[0]?.currency || 'SAR';
  const vatRate = currency === 'KWD' ? 0 : 0.15;
  const vat = Math.round(subtotal * vatRate);
  const totalWithVat = subtotal + vat;

  useEffect(() => {
    if (items.length === 0 && !successOrderCode && step !== 3) {
      router.push('/cart');
    }
  }, [items, successOrderCode, step, router]);

  if (successOrderCode || step === 3) {
    return (
      <div style={{ backgroundColor: COLORS.cream, minHeight: '100vh' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 30px', textAlign: 'center', flex: 1
        }}>
          <div style={{
            width: 90, height: 90, borderRadius: 30,
            background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
            marginBottom: 24, boxShadow: '0 20px 40px rgba(200,98,42,0.3)'
          }}>✅</div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: COLORS.bark, marginBottom: 12
          }}>Booking Confirmed!</div>
          <div style={{
            fontSize: 14, color: COLORS.smoke, lineHeight: 1.6, marginBottom: 30
          }}>You're all set! Check your email for confirmation and workshop details.</div>
          <div style={{ background: COLORS.sand, borderRadius: 16, padding: '16px 20px', width: '100%', marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.smoke, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Order Number</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.terracotta, fontFamily: "'Playfair Display', serif" }}>#{successOrderCode}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            width: '100%', background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12
          }}>Back to Home</button>
          <button onClick={() => router.push('/workshops')} style={{
            width: '100%', background: COLORS.sand, color: COLORS.bark, border: 'none',
            borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>Explore More Workshops</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: '100vh', paddingBottom: 20 }}>
      <div className="page-header">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/cart')} style={{
          width: 38, height: 38, borderRadius: 12, background: COLORS.sand,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: COLORS.bark
        }}>←</button>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: COLORS.bark
        }}>Checkout</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 16px', gap: 6 }}>
        {[1, 2].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: step >= s ? COLORS.terracotta : COLORS.sand,
              color: step >= s ? COLORS.white : COLORS.smoke
            }}>{s}</div>
            <span style={{ fontSize: 11, color: step >= s ? COLORS.bark : COLORS.smoke, fontWeight: 600 }}>
              {s === 1 ? (locale === 'ar' ? 'البيانات' : 'Details') : (locale === 'ar' ? 'الدفع' : 'Payment')}
            </span>
            {i < 1 && <div style={{ flex: 1, height: 1, background: 'rgba(61,43,26,0.15)' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.bark, padding: '16px 20px 10px' }}>
            {locale === 'ar' ? 'البيانات الشخصية' : 'Personal Details'}
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>
              {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'} style={{
              width: '100%', background: COLORS.sand, border: '1.5px solid transparent', borderRadius: 14,
              padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.bark, outline: 'none'
            }} />
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>
              {locale === 'ar' ? 'رقم الجوال' : 'Phone Number'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{
                width: 100, background: COLORS.sand, border: '1.5px solid transparent', borderRadius: 14,
                padding: '12px 10px', fontSize: 14, color: COLORS.bark, outline: 'none'
              }}>
                {countryCodes.map((cc) => (
                  <option key={cc.code} value={cc.code}>{cc.flag} +{cc.code}</option>
                ))}
              </select>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="51000000" style={{
                flex: 1, background: COLORS.sand, border: '1.5px solid transparent', borderRadius: 14,
                padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.bark, outline: 'none'
              }} />
            </div>
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" style={{
              width: '100%', background: COLORS.sand, border: '1.5px solid transparent', borderRadius: 14,
              padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.bark, outline: 'none'
            }} />
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>
              {locale === 'ar' ? 'ملاحظات خاصة (اختياري)' : 'Special Requests (optional)'}
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={locale === 'ar' ? 'أي متطلبات خاصة أو أسئلة...' : 'Any special requirements or questions...'} style={{
              width: '100%', background: COLORS.sand, border: '1.5px solid transparent', borderRadius: 14,
              padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.bark, outline: 'none', resize: 'none'
            }} />
          </div>

          <div style={{ margin: '8px 20px', background: COLORS.sand, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.bark, marginBottom: 4 }}>{locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.smoke, padding: '3px 0' }}>
                <span>{item.eventName} ×{item.quantity}</span>
                <span style={{ color: COLORS.bark }}>{formatCurrency(item.price * item.quantity, item.currency || 'SAR')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, color: COLORS.bark, paddingTop: 8, borderTop: '1px solid rgba(61,43,26,0.1)', marginTop: 4 }}>
              <span>{locale === 'ar' ? 'الإجمالي (شامل الضريبة)' : 'Total (incl. VAT)'}</span>
              <span style={{ color: COLORS.terracotta }}>{formatCurrency(totalWithVat, currency)}</span>
            </div>
          </div>

          {error && (
            <div style={{ margin: '0 20px 12px', padding: 12, borderRadius: 12, background: '#FEF2F2', border: '2px solid #FECACA' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <button onClick={() => setStep(2)} style={{
            margin: '16px 20px', width: 'calc(100% - 40px)', background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer'
          }}>
            {locale === 'ar' ? 'متابعة للدفع →' : 'Continue to Payment →'}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.bark, padding: '16px 20px 10px' }}>
            {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
          </div>

          {[
            { id: 'cod', icon: '💵', label: locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery', sub: locale === 'ar' ? 'ادفع عند استلام التذكرة' : 'Pay when you receive your ticket' },
            { id: 'card', icon: '💳', label: locale === 'ar' ? 'بطاقة ائتمان' : 'Credit / Debit Card', sub: 'Visa, Mastercard, Mada' },
            { id: 'apple', icon: '🍎', label: 'Apple Pay', sub: 'Touch ID or Face ID' },
          ].map((pm) => (
            <div key={pm.id} onClick={() => setPayMethod(pm.id)} style={{
              margin: '0 20px 12px', background: payMethod === pm.id ? COLORS.white : COLORS.white,
              border: `1.5px solid ${payMethod === pm.id ? COLORS.terracotta : 'transparent'}`, borderRadius: 16, padding: 14,
              display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer'
            }}>
              <div style={{ width: 40, height: 28, borderRadius: 6, background: COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{pm.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.bark }}>{pm.label}</div>
                <div style={{ fontSize: 11, color: COLORS.smoke }}>{pm.sub}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === pm.id ? COLORS.terracotta : COLORS.smoke}`, marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {payMethod === pm.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.terracotta }} />}
              </div>
            </div>
          ))}

          {error && (
            <div style={{ margin: '0 20px 12px', padding: 12, borderRadius: 12, background: '#FEF2F2', border: '2px solid #FECACA' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting} style={{
            margin: '16px 20px', width: 'calc(100% - 40px)', background: submitting ? '#9CA3AF' : `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer'
          }}>
            {submitting ? (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...') : `${locale === 'ar' ? 'تأكيد الطلب' : 'Place Order'} — ${formatCurrency(totalWithVat, currency)}`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '0 20px 20px' }}>
            <span style={{ fontSize: 11, color: COLORS.smoke }}>🔒</span>
            <span style={{ fontSize: 11, color: COLORS.smoke }}>{locale === 'ar' ? 'دفع آمن' : 'Secure payment'}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cream }}>
        <div style={{ width: 32, height: 32, border: `4px solid ${COLORS.terracotta}30`, borderTopColor: COLORS.terracotta, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
