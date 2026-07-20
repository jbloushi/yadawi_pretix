import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/pretix-cache';
import { getRegionalPretixConfig, marketFromRequest } from '@/lib/regions.server';
import { isUpcomingEvent, normalizePretixEvent } from '@/lib/pretix-normalize';

export async function GET(request: NextRequest) {
  const market = marketFromRequest(request.nextUrl.searchParams.get('market'));
  if (!market) return NextResponse.json({ error: 'A valid market (KWT or KSA) is required.' }, { status: 400 });

  const cacheKey = `events:${market}`;
  const cached = getCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const region = getRegionalPretixConfig(market);
    const response = await fetch(`${region.baseUrl}/api/v1/organizers/${region.organizer}/events/?ordering=date_from`, {
      headers: { Authorization: `Token ${region.token}`, Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      console.error('Pretix event list failed', { market, status: response.status });
      return NextResponse.json({ error: 'Workshops are temporarily unavailable. Please try again.' }, { status: 502 });
    }

    const raw = await response.json();
    const normalized = (raw.results || [])
      .map((event: Record<string, unknown>) => normalizePretixEvent(event, region))
      .filter((event: ReturnType<typeof normalizePretixEvent>) => isUpcomingEvent(event))
      .sort((a: ReturnType<typeof normalizePretixEvent>, b: ReturnType<typeof normalizePretixEvent>) =>
        new Date(a.date_from || 0).getTime() - new Date(b.date_from || 0).getTime());

    const events = await Promise.all(normalized.map(async (event: ReturnType<typeof normalizePretixEvent>) => {
      try {
        const itemsResponse = await fetch(`${region.baseUrl}/api/v1/organizers/${region.organizer}/events/${event.slug}/items/`, {
          headers: { Authorization: `Token ${region.token}`, Accept: 'application/json' },
          next: { revalidate: 60 },
        });
        if (!itemsResponse.ok) return event;
        const items = (await itemsResponse.json()).results || [];
        const prices = items.map((item: Record<string, unknown>) => Number(item.default_price || item.price)).filter((price: number) => Number.isFinite(price) && price >= 0);
        return { ...event, minPrice: prices.length ? Math.min(...prices) : undefined };
      } catch { return event; }
    }));

    const payload = { count: events.length, next: null, previous: null, results: events };
    setCache(cacheKey, payload);
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=30' } });
  } catch (error) {
    console.error('Regional Pretix configuration failure', { market, error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'This market is not available right now.' }, { status: 503 });
  }
}
