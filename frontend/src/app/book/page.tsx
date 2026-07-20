'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { getLocalizedName } from '@/lib/utils';

/**
 * Deep-link cart seeder.
 *
 * Lets an external channel (e.g. the WhatsApp assistant) send a ready-to-checkout
 * link. It reads ?org, ?event (slug), ?item (Pretix item id), ?qty, fetches the
 * event + item, adds it to the cart, then forwards to /checkout.
 *
 * Example: /book?org=yadawi-sa&event=fossil-beads&item=42&qty=1
 */
function BookSeeder() {
  const router = useRouter();
  const params = useSearchParams();
  const { addItem, items } = useCart();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false); // guard against double-run in strict mode
  const target = useRef<{ eventSlug: string; itemId: number; subeventId: number | null } | null>(null);

  // Only navigate to checkout once the item is actually committed to the cart,
  // so /checkout never loads with an empty cart (avoids a state-commit race).
  useEffect(() => {
    const t = target.current;
    if (!t) return;
    const present = items.some(
      i => i.eventSlug === t.eventSlug && i.itemId === t.itemId && (i.subeventId ?? null) === t.subeventId
    );
    if (present) router.replace('/checkout');
  }, [items, router]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const org = params.get('org') || 'yadawi-sa';
    const eventSlug = params.get('event') || '';
    const itemId = parseInt(params.get('item') || '0', 10);
    const qty = Math.max(1, parseInt(params.get('qty') || '1', 10));
    const name = params.get('name') || '';
    const phone = params.get('phone') || '';
    const subeventId = parseInt(params.get('subevent') || '0', 10) || null;

    if (!eventSlug || !itemId) {
      setError('This booking link is missing its workshop or ticket.');
      return;
    }

    // Stash confirmed contact details so the checkout form can pre-fill them.
    if (name || phone) {
      try {
        sessionStorage.setItem('yadawi-prefill', JSON.stringify({ name, phone }));
      } catch { }
    }

    (async () => {
      try {
        const [evRes, itRes] = await Promise.all([
          fetch(`/api/pretix/event/${eventSlug}?organizer=${org}`),
          fetch(`/api/pretix/events/${eventSlug}/items/?organizer=${org}`),
        ]);
        if (!evRes.ok) throw new Error('Workshop not found');
        const event = await evRes.json();
        const itemsData = itRes.ok ? await itRes.json() : { results: [] };
        const item = (itemsData.results || []).find((i: any) => i.id === itemId);
        if (!item) throw new Error('Ticket not found for this workshop');

        // For an event-series, resolve the chosen session for its date + price.
        let date = event.date_from;
        let price = parseFloat(item.default_price || item.price || '0');
        if (subeventId) {
          const seRes = await fetch(`/api/pretix/events/${eventSlug}/subevents/?organizer=${org}`);
          const seData = seRes.ok ? await seRes.json() : { results: [] };
          const se = (seData.results || []).find((x: any) => x.id === subeventId);
          if (se) {
            date = se.date_from;
            const ov = (se.item_price_overrides || []).find((o: any) => o.item === itemId);
            if (ov?.price) price = parseFloat(ov.price);
          }
        }

        target.current = { eventSlug: event.slug || eventSlug, itemId, subeventId };
        addItem({
          eventSlug: event.slug || eventSlug,
          organizerSlug: org,
          eventName: getLocalizedName(event.name, 'en'),
          itemId,
          itemName: getLocalizedName(item.name, 'en') || 'Standard',
          price,
          quantity: qty,
          currency: event.currency || (org === 'yadawi' ? 'KWD' : 'SAR'),
          date,
          subeventId,
        });
        // Navigation happens in the effect above once `items` includes this entry.
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load this booking.');
      }
    })();
  }, [params, addItem, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF6F0', padding: 30, textAlign: 'center' }}>
      {error ? (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🤔</div>
          <div style={{ color: '#3D2B1A', fontWeight: 700, marginBottom: 8 }}>{error}</div>
          <button onClick={() => router.push('/workshops')} style={{ marginTop: 16, background: 'linear-gradient(135deg,#C8622A,#E8873A)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }}>
            Browse workshops
          </button>
        </>
      ) : (
        <>
          <div style={{ width: 32, height: 32, border: '4px solid #F2EAD8', borderTopColor: '#C8622A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 16, color: '#8B7B6E' }}>Preparing your booking…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookSeeder />
    </Suspense>
  );
}
