import { NextRequest, NextResponse } from 'next/server';
import { pretixFetch } from '@/lib/pretix';

/** Safely resolve a Pretix multilingual field (string, {en:...,ar:...}, or {}) to a plain string */
function toStr(val: any, fallback = ''): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.en || val.ar || (Object.values(val).find((v: any) => typeof v === 'string' && v) as string) || fallback;
  }
  return String(val);
}

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-user-role') || 'viewer';
  const email = request.headers.get('x-user-email');
  const userBranch = request.headers.get('x-user-branch') || 'ALL'; // KWT | KSA | ALL

  if (!email || !['admin', 'viewer', 'usher'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized - Role: ' + role }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const eventSlug = searchParams.get('event');
    // For ALL users, allow manual query param; branch-specific users are restricted automatically
    const queryBranch = searchParams.get('branch');
    const effectiveBranch = userBranch !== 'ALL' ? userBranch : (queryBranch || 'ALL');

    const allOrganizers = [
      { slug: 'yadawi', token: process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz', branch: 'KWT' },
      { slug: 'yadawi-sa', token: process.env.PRETIX_API_TOKEN_SA || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz', branch: 'KSA' },
    ];
    const organizers = effectiveBranch === 'ALL'
      ? allOrganizers
      : allOrganizers.filter(o => o.branch === effectiveBranch);


    const allEvents: any[] = [];
    for (const org of organizers) {
      try {
        const headers = { 'Authorization': `Token ${org.token}` };
        const eventsData = await pretixFetch<{ results: any[] }>(`organizers/${org.slug}/events/`, { headers });
        const augmented = eventsData.results.map(e => ({ ...e, _token: org.token, _orgSlug: org.slug, _branch: org.branch }));
        allEvents.push(...augmented);
      } catch (err) {
        console.error(`Error fetching events for ${org.slug}:`, err);
      }
    }

    const allOrders: any[] = [];

    for (const event of allEvents) {
      if (eventSlug && event.slug !== eventSlug) continue;

      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      params.set('limit', '100');

      try {
        const headers = { 'Authorization': `Token ${event._token}` };
        const ordersData = await pretixFetch<{ results: any[] }>(
          `organizers/${event._orgSlug}/events/${event.slug}/orders/?${params.toString()}`,
          { headers }
        );

        for (const order of ordersData.results) {
          const items = order.positions.map((pos: any) => ({
            name: pos.item_name || 'Ticket',
            quantity: pos.quantity,
            price: parseFloat(pos.price),
          }));

          let orderStatus = order.status;
          if (order.status === 'n') orderStatus = 'pending';
          else if (order.status === 'p') orderStatus = 'paid';
          else if (order.status === 'c') orderStatus = 'cancelled';
          else if (order.status === 'r') orderStatus = 'refunded';

          allOrders.push({
            id: order.code,
            code: order.code,
            branch: event._branch,
            name: order.positions[0]?.attendee_name || order.email || 'N/A',
            email: order.email,
            phone: order.phone || '',
            event_name: toStr(event.name, event.slug),
            event_slug: event.slug,
            items,
            total: parseFloat(order.total),
            status: orderStatus,
            payment_method: 'cod',
            created_at: order.datetime || order.created_at,
          });
        }
      } catch (err) {
        console.error(`Error fetching orders for ${event.slug}:`, err);
      }
    }

    let filteredOrders = allOrders;

    if (search) {
      filteredOrders = filteredOrders.filter((o: any) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase()) ||
        o.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    filteredOrders.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ results: filteredOrders });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
