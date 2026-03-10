import { NextRequest, NextResponse } from 'next/server';
import { pretixFetch } from '@/lib/pretix';

const getOrganizerToken = (orgSlug: 'yadawi' | 'yadawi-sa') => {
  if (orgSlug === 'yadawi-sa') {
    return process.env.PRETIX_SA_API_TOKEN || process.env.NEXT_PUBLIC_PRETIX_SA_API_TOKEN || '';
  }

  return process.env.PRETIX_API_TOKEN || process.env.NEXT_PUBLIC_PRETIX_API_TOKEN || '';
};

/** Safely resolve a Pretix multilingual field to a plain string */
function toStr(val: any, fallback = ''): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.en || val.ar || (Object.values(val).find((v: any) => typeof v === 'string' && v) as string) || fallback;
  }
  return String(val);
}

function getCookie(name: string, cookies: string | null): string | undefined {
  if (!cookies) return undefined;
  const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export async function GET(request: NextRequest) {
  // Check role from header (consistent with orders API) or cookie
  const role = request.headers.get('x-user-role') || 'viewer';
  const email = request.headers.get('x-user-email');
  const userBranch = request.headers.get('x-user-branch') || 'ALL'; // KWT | KSA | ALL

  const cookies = request.headers.get('cookie');
  const cookieEmail = getCookie('yadawi_email', cookies);
  const cookieRole = getCookie('yadawi_role', cookies);

  const userEmail = email || cookieEmail;
  const userRole = role !== 'viewer' ? role : (cookieRole || 'viewer');

  if (!userEmail || !['admin', 'viewer', 'usher'].includes(userRole)) {
    return NextResponse.json({ error: 'Unauthorized - Role: ' + userRole }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const debugMode = searchParams.get('debug') === '1';
    const debug: any[] = [];
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    // branch filter from query (for ALL users) or from session
    const queryBranch = searchParams.get('branch');
    const effectiveBranch = userBranch !== 'ALL' ? userBranch : (queryBranch || 'ALL');

    const params = new URLSearchParams();
    params.set('ordering', 'date_from');

    if (status && status !== 'all') {
      params.set('live', status === 'live' ? 'true' : 'false');
    }

    // All organizers, then restricted by branch
    const allOrganizers = [
      { slug: 'yadawi', token: getOrganizerToken('yadawi'), branch: 'KWT' },
      { slug: 'yadawi-sa', token: getOrganizerToken('yadawi-sa'), branch: 'KSA' },
    ];
    const branchFilteredOrganizers = effectiveBranch === 'ALL'
      ? allOrganizers
      : allOrganizers.filter(o => o.branch === effectiveBranch);

    const organizers = branchFilteredOrganizers.filter((o) => {
      const tokenConfigured = Boolean(o.token);
      if (!tokenConfigured) debug.push({ organizer: o.slug, ok: false, reason: 'missing_token' });
      return tokenConfigured;
    });

    if (organizers.length === 0) {
      return NextResponse.json({ error: 'Pretix API token is not configured for selected branch', debug }, { status: 500 });
    }

    const allEvents: any[] = [];
    console.log(`Admin API: Fetching events for branch: ${effectiveBranch}`);

    for (const org of organizers) {
      try {
        const headers = { 'Authorization': `Token ${org.token}` };
        const url = `organizers/${org.slug}/events/?${params.toString()}`;
        console.log(`Admin API: Fetching from ${org.slug} - ${url}`);

        const eventsData = await pretixFetch<{ results: any[] }>(url, { headers });
        console.log(`Admin API: Got ${eventsData.results.length} events for ${org.slug}`);
        debug.push({ organizer: org.slug, ok: true, events: eventsData.results.length });

        const augmented = eventsData.results.map(e => ({ ...e, _token: org.token, _orgSlug: org.slug, _branch: org.branch }));
        allEvents.push(...augmented);
      } catch (err) {
        console.error(`Admin API: Error fetching events for ${org.slug}:`, err);
        debug.push({ organizer: org.slug, ok: false, error: String(err) });
      }
    }

    let events = allEvents;

    if (search) {
      events = events.filter((e: any) => {
        const nameStr = typeof e.name === 'string' ? e.name : (e.name?.en || e.name?.ar || '');
        return nameStr.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase());
      });
    }

    const eventsWithStats = await Promise.all(
      events.map(async (event: any) => {
        try {
          const headers = { 'Authorization': `Token ${event._token}` };
          const ordersData = await pretixFetch<{ results: any[] }>(
            `organizers/${event._orgSlug}/events/${event.slug}/orders/?status=n`,
            { headers }
          );

          let totalSold = 0;
          let totalRevenue = 0;

          for (const order of ordersData.results) {
            for (const position of order.positions) {
              totalSold += position.quantity;
              totalRevenue += parseFloat(position.price) * position.quantity;
            }
          }

          return {
            id: event.id,
            slug: event.slug,
            organizer: event.organizer,
            branch: event._branch,
            name: toStr(event.name, event.slug),
            date_from: event.date_from,
            date_to: event.date_to,
            location: toStr(event.location),
            status: event.live ? 'live' : 'draft',
            total_sold: totalSold,
            total_revenue: totalRevenue,
            price: 0,
          };
        } catch (err) {
          console.error(`Error fetching stats for ${event.slug}:`, err);
          return {
            id: event.id,
            slug: event.slug,
            organizer: event.organizer,
            branch: event._branch,
            name: toStr(event.name, event.slug),
            date_from: event.date_from,
            date_to: event.date_to,
            location: toStr(event.location),
            status: event.live ? 'live' : 'draft',
            total_sold: 0,
            total_revenue: 0,
            price: 0,
          };
        }
      })
    );

    eventsWithStats.sort((a: any, b: any) => new Date(b.date_from).getTime() - new Date(a.date_from).getTime());

    return NextResponse.json(debugMode ? { results: eventsWithStats, debug } : { results: eventsWithStats });
  } catch (error) {
    console.error('Admin events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-user-role') || 'viewer';
  const email = request.headers.get('x-user-email');
  const cookies = request.headers.get('cookie');
  const cookieEmail = getCookie('yadawi_email', cookies);
  const cookieRole = getCookie('yadawi_role', cookies);

  const userEmail = email || cookieEmail;
  const userRole = role !== 'viewer' ? role : (cookieRole || 'viewer');

  if (!userEmail || userRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Determine branch and organizer from location
    const branch = (data.location === 'Kuwait') ? 'KWT' : 'KSA';
    const org = branch === 'KWT' ? 'yadawi' : 'yadawi-sa';
    const token = getOrganizerToken(org as 'yadawi' | 'yadawi-sa');

    if (!token) {
      return NextResponse.json({ error: 'Pretix API token is not configured for selected branch' }, { status: 500 });
    }

    // Build the stringified description with metadata
    const parsedMeta = {
      description: data.description || '',
      duration: data.duration || '',
      instructorName: data.instructorName || '',
      instructorExperience: data.instructorExperience || '',
      syllabus: data.syllabus ? data.syllabus.split('\n').filter((s: string) => s.trim() !== '') : [],
      coverImage: data.coverImage || ''
    };

    const eventPayload = {
      name: { en: data.name },
      slug: data.slug,
      live: data.status === 'live',
      currency: branch === 'KWT' ? 'KWD' : 'SAR',
      date_from: `${data.dateFrom}T${data.timeFrom || '00:00'}:00Z`,
      date_to: data.dateTo ? `${data.dateTo}T${data.timeTo || '00:00'}:00Z` : `${data.dateFrom}T${data.timeFrom || '00:00'}:00Z`,
      timezone: branch === 'KWT' ? 'Asia/Kuwait' : 'Asia/Riyadh',
      location: { en: data.location },
      plugins: [
        "pretix.plugins.stripe",
        "pretix.plugins.ticketoutputpdf"
      ],
      has_subevents: false,
      is_public: true,
      sales_channels: ["web"],
      description: { en: JSON.stringify(parsedMeta) }
    };

    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    };

    const createEventRes = await fetch(`${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/organizers/${org}/events/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventPayload)
    });

    const createEventData = await createEventRes.json();

    if (!createEventRes.ok) {
      return NextResponse.json({ error: createEventData }, { status: createEventRes.status });
    }

    // Create tickets (items) for the event
    if (data.tickets && data.tickets.length > 0) {
      for (const t of data.tickets) {
        const itemPayload = {
          name: { en: t.name },
          default_price: t.price || "0.00",
          active: true,
          admission: true,
          generate_tickets: true
        };
        const createItemRes = await fetch(`${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/organizers/${org}/events/${data.slug}/items/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(itemPayload)
        });

        if (!createItemRes.ok) {
          console.error(`Failed to create ticket ${t.name}`, await createItemRes.json());
        }
      }
    }

    return NextResponse.json({ success: true, event: createEventData });

  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

