import { NextRequest, NextResponse } from 'next/server';
import { getRegionalPretixConfig } from '@/lib/regions.server';
import { marketFromOrganizer } from '@/lib/market';

interface OrderPosition {
  eventSlug: string;
  organizerSlug: string;
  itemId: number;
  variationId?: number;
  subeventId?: number | null;
  quantity: number;
  name: string;
  phone: string;
  email: string;
}

const safeSlug = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const positions = Array.isArray(body.positions) ? body.positions as OrderPosition[] : [];
    if (!positions.length || positions.length > 20) return NextResponse.json({ error: 'Your cart is empty or too large.' }, { status: 400 });

    const first = positions[0];
    const market = marketFromOrganizer(first.organizerSlug);
    if (!market) return NextResponse.json({ error: 'This cart has an invalid market.' }, { status: 400 });
    const region = getRegionalPretixConfig(market);

    if (positions.some(position => position.organizerSlug !== region.organizer)) {
      return NextResponse.json({ error: 'Items from Kuwait and Saudi Arabia cannot be checked out together.' }, { status: 409 });
    }
    if (positions.some(position => !safeSlug.test(position.eventSlug) || !Number.isInteger(position.itemId) || position.itemId <= 0 || !Number.isInteger(position.quantity) || position.quantity < 1 || position.quantity > 10)) {
      return NextResponse.json({ error: 'One or more cart items are invalid.' }, { status: 400 });
    }
    if (!first.name?.trim() || !/^\S+@\S+\.\S+$/.test(first.email || '')) {
      return NextResponse.json({ error: 'A valid name and email are required for ticket delivery.' }, { status: 400 });
    }

    const eventSlugs = new Set(positions.map(position => position.eventSlug));
    if (eventSlugs.size > 1) {
      return NextResponse.json({ error: 'This checkout can process one workshop at a time. Your other items remain saved in your cart.' }, { status: 409 });
    }
    const eventSlug = first.eventSlug;
    const orderPositions = positions.flatMap(position => Array.from({ length: position.quantity }, () => ({
      item: position.itemId,
      variation: position.variationId ?? null,
      ...(position.subeventId != null ? { subevent: position.subeventId } : {}),
      attendee_name_parts: { full_name: position.name.trim() },
    })));

    const response = await fetch(`${region.baseUrl}/api/v1/organizers/${region.organizer}/events/${eventSlug}/orders/`, {
      method: 'POST',
      headers: { Authorization: `Token ${region.token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: first.email.trim().toLowerCase(), sales_channel: 'web', positions: orderPositions }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      console.error('Pretix order creation failed', { market, eventSlug, status: response.status });
      const availabilityChanged = response.status === 400 || response.status === 409;
      return NextResponse.json({ error: availabilityChanged ? 'Availability or pricing changed. Review your selection and try again.' : 'Checkout is temporarily unavailable.' }, { status: availabilityChanged ? 409 : 502 });
    }

    const order = await response.json();
    return NextResponse.json({ code: order.code, event: eventSlug, status: order.status, expires: order.expires });
  } catch (error) {
    console.error('Order creation failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 500 });
  }
}
