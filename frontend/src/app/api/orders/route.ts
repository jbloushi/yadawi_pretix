import { NextRequest, NextResponse } from 'next/server';

const PRETIX_API_URL = process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000';
const PRETIX_API_TOKEN = process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz';
// Removed hardcoded ORGANIZER_SLUG

interface OrderPosition {
  eventSlug: string;
  organizerSlug: string;
  itemId: number;
  variationId?: number;
  quantity: number;
  name: string;
  phone: string;
  email?: string;
}

interface OrderRequest {
  positions: OrderPosition[];
}

function getToken(organizerSlug: string) {
  return organizerSlug === 'yadawi-sa'
    ? process.env.PRETIX_API_TOKEN_SA || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'
    : process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz';
}

async function pretixFetch<T>(endpoint: string, organizerSlug: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${getToken(organizerSlug)}`,
    ...options.headers,
  };

  const response = await fetch(`${PRETIX_API_URL}/api/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

async function ensureQuotaExists(organizerSlug: string, eventSlug: string, itemId: number): Promise<void> {
  try {
    const quotas = await pretixFetch<{ results: { id: number; items: number[] }[] }>(
      `organizers/${organizerSlug}/events/${eventSlug}/quotas/`,
      organizerSlug
    );

    const hasQuota = quotas.results.some(q => q.items.includes(itemId));

    if (!hasQuota) {
      await pretixFetch(
        `organizers/${organizerSlug}/events/${eventSlug}/quotas/`,
        organizerSlug,
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Standard',
            size: 100,
            items: [itemId],
          }),
        }
      );
      console.log(`Created quota for organizer ${organizerSlug}, event ${eventSlug}, item ${itemId}`);
    }
  } catch (error) {
    console.error('Error ensuring quota exists:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    const { positions } = body;

    if (!positions || positions.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    const firstPos = positions[0];
    if (!firstPos.name) {
      return NextResponse.json(
        { error: 'Missing required fields: name' },
        { status: 400 }
      );
    }

    const emailGenerated = firstPos.email || (firstPos.phone ? `${firstPos.phone.replace(/^\+/, '')}@yadawi.local` : `customer@yadawi.local`);

    const eventGroups = new Map<string, { organizerSlug: string; positions: OrderPosition[] }>();
    for (const pos of positions) {
      const key = `${pos.organizerSlug}/${pos.eventSlug}`;
      if (!eventGroups.has(key)) {
        eventGroups.set(key, { organizerSlug: pos.organizerSlug, positions: [] });
      }
      eventGroups.get(key)!.positions.push(pos);
    }

    // Pre-check and ensure quotas
    for (const [key, group] of Array.from(eventGroups.entries())) {
      const [organizerSlug, eventSlug] = key.split('/');
      const itemIds = Array.from(new Set(group.positions.map(p => p.itemId)));

      try {
        const quotas = await pretixFetch<{ results: { id: number; items: number[] }[] }>(
          `organizers/${organizerSlug}/events/${eventSlug}/quotas/`,
          organizerSlug
        );

        for (const itemId of itemIds) {
          const hasQuota = quotas.results.some(q => q.items.includes(itemId));
          if (!hasQuota) {
            await ensureQuotaExists(organizerSlug, eventSlug, itemId);
          }
        }
      } catch (err) {
        console.error(`Quota check failed for ${key}:`, err);
      }
    }

    const orders: { code: string; event: string }[] = [];

    for (const [key, group] of Array.from(eventGroups.entries())) {
      const [organizerSlug, eventSlug] = key.split('/');
      const orderPositions = group.positions.map(pos => ({
        item: pos.itemId,
        variation: pos.variationId || null,
        quantity: pos.quantity,
        attendee_name_parts: {
          full_name: pos.name,
        },
      }));

      const orderData = {
        email: emailGenerated,
        sales_channel: 'web',
        payment_provider: 'manual',
        positions: orderPositions,
      };

      const response = await fetch(
        `${PRETIX_API_URL}/api/v1/organizers/${organizerSlug}/events/${eventSlug}/orders/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${getToken(organizerSlug)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create order' }));
        console.error('pretix order error:', errorData);
        return NextResponse.json(
          { error: errorData.detail || JSON.stringify(errorData) || `Failed to create order for ${eventSlug}` },
          { status: response.status }
        );
      }

      const order = await response.json();
      orders.push({ code: order.code, event: eventSlug });
    }

    if (orders.length === 1) {
      return NextResponse.json({ code: orders[0].code, event: orders[0].event });
    }

    return NextResponse.json({
      orders: orders,
      message: `${orders.length} orders created`
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
