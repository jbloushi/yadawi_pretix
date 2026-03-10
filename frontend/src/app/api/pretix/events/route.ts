import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/pretix-cache';

const PRETIX_API_URL = process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000';

// Hardcoded fallbacks to ensure build works even if .env is missing on VPS
const FALLBACK_TOKENS = {
  'yadawi': '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro',
  'yadawi-sa': 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro'
};

const getOrganizerToken = (orgSlug: 'yadawi' | 'yadawi-sa') => {
  let token = '';
  if (orgSlug === 'yadawi-sa') {
    token = process.env.PRETIX_SA_API_TOKEN || process.env.NEXT_PUBLIC_PRETIX_SA_API_TOKEN || '';
  } else {
    token = process.env.PRETIX_API_TOKEN || process.env.NEXT_PUBLIC_PRETIX_API_TOKEN || '';
  }
  
  // Use fallback if env is empty
  return token || FALLBACK_TOKENS[orgSlug];
};

const ORGANIZERS = [
  { slug: 'yadawi', token: getOrganizerToken('yadawi') },
  { slug: 'yadawi-sa', token: getOrganizerToken('yadawi-sa') },
];

/** Safely convert any Pretix field to a plain string. Handles: string, {en:..., ar:...}, null, {} */
function toStr(val: any, fallback = ''): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const found = val.en || val.ar || (Object.values(val).find((v: any) => typeof v === 'string' && v) as string);
    return found || fallback;
  }
  return String(val);
}

function normalizeEvent(event: any, orgSlug: string) {
  let coverImage = '';
  try {
    const descStr = toStr(event.description);
    if (descStr.trim().startsWith('{')) {
      const parsed = JSON.parse(descStr);
      coverImage = parsed.coverImage || '';
    }
  } catch (e) {
    // ignore
  }

  return {
    id: event.id,
    slug: event.slug,
    name: toStr(event.name, event.slug),
    date_from: event.date_from || null,
    date_to: event.date_to || null,
    location: toStr(event.location),
    currency: orgSlug === 'yadawi' ? 'KWD' : 'SAR',
    live: event.live ?? true,
    public_url: event.public_url || '',
    sales_channels: event.sales_channels || ['web'],
    organizer: orgSlug,
    description: event.description || '',
    coverImage: coverImage,
  };
}

export async function GET(request: NextRequest) {
  const debugMode = request.nextUrl.searchParams.get('debug') === '1';
  const debug: any[] = [];

  try {
    const cachedData = getCache('events');
    if (cachedData && !debugMode) { // Skip cache for debug requests
      console.log('API: Returning cached events');
      return NextResponse.json(cachedData);
    }

    const allEvents: any[] = [];
    console.log(`API: Fetching events from ${PRETIX_API_URL}`);

    const configuredOrganizers = ORGANIZERS.filter((org) => org.token);
    if (configuredOrganizers.length === 0) {
      console.error('API: No Pretix API tokens available.');
      return NextResponse.json({ error: 'Pretix API token is not configured' }, { status: 500 });
    }

    const getPretixHeaders = (token: string) => {
      return {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      };
    };

    // Fetch events from all organizers in parallel
    const orgPromises = configuredOrganizers.map(async (org) => {
      try {
        const url = `${PRETIX_API_URL}/api/v1/organizers/${org.slug}/events/`;
        const headers = getPretixHeaders(org.token);
        
        console.log(`API: Requesting events for ${org.slug} from ${url}`);

        const response = await fetch(url, {
          headers: headers,
          next: { revalidate: 60 },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API: Failed fetch for ${org.slug}. Status: ${response.status}`);
          debug.push({ 
            organizer: org.slug, 
            ok: false, 
            status: response.status, 
            error: errorText.substring(0, 500), // Increased for 500 errors
            url: url,
            token_prefix: org.token.substring(0, 5) + '...' 
          });
          return [];
        }

        const data = await response.json();
        const events = data.results || [];
        console.log(`API: Found ${events.length} events for ${org.slug}`);

        const enrichedEvents = await Promise.all(events.map(async (e: any) => {
          const normalized = normalizeEvent(e, org.slug);
          let minPrice = undefined;

          try {
            const itemsUrl = `${PRETIX_API_URL}/api/v1/organizers/${org.slug}/events/${e.slug}/items/`;
            const itemsRes = await fetch(itemsUrl, {
              headers: getPretixHeaders(org.token),
              next: { revalidate: 60 }
            });

            if (itemsRes.ok) {
              const itemsData = await itemsRes.json();
              const items = itemsData.results || [];
              const prices = items
                .map((i: any) => parseFloat(i.default_price || i.price || '0'))
                .filter((p: number) => p > 0);

              if (prices.length > 0) {
                minPrice = Math.min(...prices);
              }
            }
          } catch (err) {
            console.error(`API: Error fetching items for ${e.slug}:`, err);
          }
          return { ...normalized, minPrice };
        }));

        debug.push({ organizer: org.slug, ok: true, events: events.length });
        return enrichedEvents;
      } catch (error) {
        console.error(`API: Error fetching from ${org.slug}:`, error);
        debug.push({ organizer: org.slug, ok: false, error: String(error) });
        return [];
      }
    });

    const results = await Promise.all(orgPromises);
    allEvents.push(...results.flat());

    console.log(`API: Total enriched events fetched: ${allEvents.length}`);

    allEvents.sort((a, b) => {
      const dateA = a.date_from ? new Date(a.date_from).getTime() : 0;
      const dateB = b.date_from ? new Date(b.date_from).getTime() : 0;
      return dateA - dateB;
    });

    const finalData = { count: allEvents.length, next: null, previous: null, results: allEvents };

    setCache('events', finalData);

    return NextResponse.json(debugMode ? { ...finalData, debug } : finalData);
  } catch (error) {
    console.error('API: Critical error in GET events:', error);
    return NextResponse.json({ error: 'Internal server error', debug }, { status: 500 });
  }
}
