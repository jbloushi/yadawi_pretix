'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import { COLORS } from '@/lib/theme';
import { track } from '@/lib/analytics';
import { marketFromOrganizer } from '@/lib/market';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';


function SuccessView({ code }: { code: string }) {
  const router = useRouter();
  console.log('[DEBUG] SuccessView: Rendering');

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        }}>Booking received</div>
        <div style={{
          fontSize: 14, color: COLORS.smoke, lineHeight: 1.6, marginBottom: 30
        }}>Check your email for payment and ticket status. Your place is confirmed when payment is recorded.</div>
        <div style={{ background: COLORS.sand, borderRadius: 16, padding: '16px 20px', width: '100%', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: COLORS.smoke, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Order Number</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.terracotta, fontFamily: "'Playfair Display', serif" }}>#{code}</div>
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

function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, total, hydrated } = useCart();
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

  // Per-field errors, shown next to the field that caused them. `touched` gates
  // display so we validate on blur/submit rather than on every keystroke.
  type FieldErrors = { name?: string; phone?: string; email?: string };
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (!hydrated || !items.length || checkoutTracked.current) return;
    checkoutTracked.current = true;
    const market = marketFromOrganizer(items[0].organizerSlug) || undefined;
    track('checkout_started', { market, currency: items[0].currency, value: total, seat_count: items.reduce((sum, item) => sum + item.quantity, 0), funnel_step: 'attendee_details' });
    track('attendee_details_started', { market, seat_count: items.reduce((sum, item) => sum + item.quantity, 0) });
  }, [hydrated, items, total]);

  const validateDetails = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Please enter your full name.';
    const digits = phone.trim().replace(/\D/g, '');
    if (!digits) errs.phone = 'Please enter your phone number.';
    else if (digits.length < 8) errs.phone = 'That number looks too short — check and try again.';
    if (!email.trim()) errs.email = 'Enter an email so we can deliver your tickets.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email like name@example.com.';
    return errs;
  };

  const handleFieldBlur = (field: keyof FieldErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(validateDetails());
  };

  const handleContinueToPayment = () => {
    const errs = validateDetails();
    setFieldErrors(errs);
    setTouched({ name: true, phone: true, email: true });
    const firstInvalid = (['name', 'phone', 'email'] as const).find(f => errs[f]);
    if (firstInvalid) {
      // Send focus to the first problem field so keyboard/SR users land on it.
      ({ name: nameRef, phone: phoneRef, email: emailRef })[firstInvalid].current?.focus();
      return;
    }
    track('attendee_details_completed', { market: marketFromOrganizer(items[0]?.organizerSlug) || undefined, seat_count: items.reduce((sum, item) => sum + item.quantity, 0) });
    setStep(2);
  };

  const showError = (field: keyof FieldErrors) =>
    touched[field] ? fieldErrors[field] : undefined;

  console.log(`[DEBUG] CheckoutForm: step=${step}, success=${!!successOrderCode}, items=${items.length}`);

  // Pre-fill name + phone if the booking link (from the WhatsApp assistant) supplied them.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('yadawi-prefill');
      if (!raw) return;
      const { name: pName, phone: pPhone } = JSON.parse(raw);
      if (pName) setName(pName);
      if (pPhone) {
        const digits = String(pPhone).replace(/^\+/, '');
        // Match known dialing codes (longest first); fall back to keeping the full
        // international number so we never mangle non-Gulf numbers (e.g. Egypt +20).
        // Pre-sorted longest-first so we never mutate a shared array at runtime.
        const knownCodes = ['966', '965', '971', '973', '974', '968', '962', '90', '44', '20', '1'];
        const cc = knownCodes.find(c => digits.startsWith(c));
        if (cc) {
          // Store CC + local number. If the code isn't in the dropdown it still
          // yields a correct E.164 number even though the dropdown can't show it.
          setCountryCode(cc);
          setPhone(digits.slice(cc.length));
        } else {
          setCountryCode('');
          setPhone(digits);
        }
      }
      sessionStorage.removeItem('yadawi-prefill');
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Wait for the cart to load before acting on "empty" — otherwise a hard load
    // of /checkout sees the initial empty array and bounces to /cart every time.
    if (!hydrated) return;
    // ONLY redirect if we are NOT in the success state
    if (items.length === 0 && !successOrderCode && step !== 3) {
      router.push('/cart');
    }
  }, [hydrated, items.length, successOrderCode, step, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Backstop: step 1 already validates, but if anything slipped through, send
    // the user back to the field rather than silently doing nothing.
    const errs = validateDetails();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setTouched({ name: true, phone: true, email: true });
      setStep(1);
      setError('Please check your details before placing the order.');
      return;
    }

    const phoneDigits = phone.trim().replace(/\D/g, '');

    setSubmitting(true);
    setError(null);

    const fullPhone = `+${countryCode}${phoneDigits}`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: items.map(item => ({
            eventSlug: item.eventSlug,
            organizerSlug: item.organizerSlug,
            itemId: item.itemId,
            subeventId: item.subeventId ?? null,
            quantity: item.quantity,
            name: name.trim(),
            phone: fullPhone,
            email: email.trim(),
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');

      const orderCode = data.code || (data.orders?.[0]?.code) || 'ORD-' + Date.now();

      // Order of operations to prevent hook mismatch:
      // 1. Success code 
      // 2. Clear cart
      // 3. Set step
      setSuccessOrderCode(orderCode);
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Order error:', err);
      track('checkout_failed', { market: marketFromOrganizer(items[0]?.organizerSlug) || undefined, failure_category: 'order_creation' });
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS UI
  if (successOrderCode || step === 3) {
    return <SuccessView code={successOrderCode || 'DONE'} />;
  }

  // EMPTY UI (Redirects anyway via useEffect)
  if (items.length === 0) {
    return null;
  }

  const subtotal = total;
  const currency = items[0]?.currency || 'SAR';
  // Pretix prices are all-inclusive (no tax rule), so the charged total = subtotal.
  // Don't add VAT on top or the displayed amount won't match the Pretix order.
  const totalWithVat = subtotal;

  return (
    <div style={{ backgroundColor: COLORS.cream, minHeight: '100vh', paddingBottom: 20 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '50px 20px 20px' }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/cart')} style={{
          width: 38, height: 38, borderRadius: 12, background: COLORS.sand,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: COLORS.bark
        }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: COLORS.bark }}>Checkout</div>
        <div style={{ width: 38 }} />
      </div>

      {/* STEPS */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 16px', gap: 6 }}>
        {[1, 2].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i === 0 ? 1 : 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: step >= s ? COLORS.terracotta : COLORS.sand,
              color: step >= s ? COLORS.white : COLORS.smoke
            }}>{s}</div>
            <span style={{ fontSize: 11, color: step >= s ? COLORS.bark : COLORS.smoke, fontWeight: 600 }}>
              {s === 1 ? 'Details' : 'Payment'}
            </span>
            {i < 1 && <div style={{ flex: 1, height: 1, background: 'rgba(61,43,26,0.15)', margin: '0 10px' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.bark, padding: '16px 20px 10px' }}>Personal Details</div>
          {error && (
            <div role="alert" style={{ margin: '0 20px 12px', padding: 12, borderRadius: 12, background: '#FEF2F2', border: `2px solid ${COLORS.danger}`, color: '#B91C1C', fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}
          <div style={{ padding: '0 20px 12px' }}>
            <label htmlFor="checkout-name" style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Full Name <span aria-hidden="true" style={{ color: COLORS.terracotta }}>*</span>
              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>required</span>
            </label>
            <input
              id="checkout-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              placeholder="Your full name"
              required
              autoComplete="name"
              aria-invalid={!!showError('name')}
              aria-describedby={showError('name') ? 'checkout-name-error' : undefined}
              style={{
                width: '100%', background: COLORS.sand, borderRadius: 14, padding: '12px 14px',
                fontSize: 16, color: COLORS.bark, minHeight: 44,
                border: `1.5px solid ${showError('name') ? COLORS.danger : 'transparent'}`,
              }} />
            {showError('name') && (
              <p id="checkout-name-error" role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: COLORS.danger }}>
                {showError('name')}
              </p>
            )}
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label htmlFor="checkout-phone" style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Phone Number <span aria-hidden="true" style={{ color: COLORS.terracotta }}>*</span>
              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>required</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="Country calling code"
                style={{ width: 100, background: COLORS.sand, border: 'none', borderRadius: 14, padding: '12px 10px', fontSize: 16, color: COLORS.bark, minHeight: 44 }}>
                {countryCodes.map(cc => <option key={cc.code} value={cc.code}>{cc.flag} +{cc.code}</option>)}
              </select>
              <input
                id="checkout-phone"
                ref={phoneRef}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                type="tel"
                inputMode="numeric"
                placeholder="51000000"
                required
                autoComplete="tel-national"
                aria-invalid={!!showError('phone')}
                aria-describedby={showError('phone') ? 'checkout-phone-error' : undefined}
                style={{
                  flex: 1, background: COLORS.sand, borderRadius: 14, padding: '12px 14px',
                  fontSize: 16, color: COLORS.bark, minHeight: 44,
                  border: `1.5px solid ${showError('phone') ? COLORS.danger : 'transparent'}`,
                }} />
            </div>
            {showError('phone') && (
              <p id="checkout-phone-error" role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: COLORS.danger }}>
                {showError('phone')}
              </p>
            )}
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <label htmlFor="checkout-email" style={{ fontSize: 11, fontWeight: 600, color: COLORS.smoke, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Email <span style={{ textTransform: 'none', fontWeight: 500 }}>(optional)</span>
            </label>
            <input
              id="checkout-email"
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              type="email"
              inputMode="email"
              placeholder="email@example.com"
              autoComplete="email"
              aria-invalid={!!showError('email')}
              aria-describedby={showError('email') ? 'checkout-email-error' : 'checkout-email-hint'}
              style={{
                width: '100%', background: COLORS.sand, borderRadius: 14, padding: '12px 14px',
                fontSize: 16, color: COLORS.bark, minHeight: 44,
                border: `1.5px solid ${showError('email') ? COLORS.danger : 'transparent'}`,
              }} />
            {showError('email') ? (
              <p id="checkout-email-error" role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: COLORS.danger }}>
                {showError('email')}
              </p>
            ) : (
              <p id="checkout-email-hint" style={{ margin: '6px 0 0', fontSize: 12, color: COLORS.smoke }}>
                We'll send your booking confirmation here.
              </p>
            )}
          </div>

          <div style={{ margin: '8px 20px', background: COLORS.sand, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.bark, marginBottom: 4 }}>Order Summary</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.smoke, padding: '3px 0' }}>
                <span>{item.eventName} ×{item.quantity}</span>
                <span style={{ color: COLORS.bark }}>{formatCurrency(item.price * item.quantity, item.currency || 'SAR')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, color: COLORS.bark, paddingTop: 8, borderTop: '1px solid rgba(61,43,26,0.1)', marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: COLORS.terracotta }}>{formatCurrency(totalWithVat, currency)}</span>
            </div>
          </div>

          <button type="button" onClick={handleContinueToPayment} style={{
            margin: '16px 20px', width: 'calc(100% - 40px)', background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer', minHeight: 44
          }}>Continue to Payment →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.bark, padding: '16px 20px 10px' }}>Payment Method</div>
          {/* Real radios in a fieldset: keyboard-selectable with arrow keys and
              announced as a group. A div+onClick is unreachable without a mouse. */}
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
              Payment method
            </legend>
            {([
              { id: 'cod', label: 'Cash on Delivery', Icon: Banknote },
              { id: 'card', label: 'Card', Icon: CreditCard },
              { id: 'apple', label: 'Apple Pay', Icon: Smartphone },
            ] as const).map(({ id, label, Icon }) => (
              <label key={id} htmlFor={`pay-${id}`} style={{
                margin: '0 20px 12px', background: COLORS.white,
                border: `1.5px solid ${payMethod === id ? COLORS.terracotta : 'transparent'}`, borderRadius: 16, padding: 14,
                display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', minHeight: 44,
              }}>
                <input
                  type="radio"
                  id={`pay-${id}`}
                  name="payment-method"
                  value={id}
                  checked={payMethod === id}
                  onChange={() => setPayMethod(id)}
                  style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                />
                <span style={{ width: 40, height: 28, borderRadius: 6, background: COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={COLORS.bark} aria-hidden="true" />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.bark }}>{label}</span>
                <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === id ? COLORS.terracotta : COLORS.smoke}`, marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {payMethod === id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.terracotta }} />}
                </span>
              </label>
            ))}
          </fieldset>

          {error && <div role="alert" style={{ margin: '0 20px 12px', padding: 12, borderRadius: 12, background: '#FEF2F2', border: `2px solid ${COLORS.danger}`, color: '#B91C1C', fontSize: 14, fontWeight: 600 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={submitting} style={{
            margin: '16px 20px', width: 'calc(100% - 40px)', background: submitting ? '#9CA3AF' : `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.ember})`,
            color: 'white', border: 'none', borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer'
          }}>{submitting ? 'Processing...' : `Place Order — ${formatCurrency(totalWithVat, currency)}`}</button>
        </>
      )}
    </div>
  );
}

export function CheckoutPage() {
  return <CheckoutForm />;
}
