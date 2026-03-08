import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/admin-auth';
import { pretixFetch } from '@/lib/pretix';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['admin', 'usher'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const ordersData = await pretixFetch<{ results: any[] }>(
      `events/${slug}/orders/?status=p`
    );

    const attendees: any[] = [];

    for (const order of ordersData.results) {
      for (const position of order.positions) {
        attendees.push({
          id: position.id,
          name: position.attendee_name || 'Guest',
          ticket: position.item_name || 'Ticket',
          status: position.checked_in ? 'checked_in' : 'pending',
          code: position.secret,
          order_code: order.code,
          checkin_secret: position.checkin_secret,
        });
      }
    }

    const total = attendees.length;
    const checkedIn = attendees.filter(a => a.status === 'checked_in').length;

    return NextResponse.json({
      results: attendees,
      stats: { total, checked_in: checkedIn }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendees' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['admin', 'usher'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    const { position_id, checkin_secret } = body;

    if (!position_id || !checkin_secret) {
      return NextResponse.json({ error: 'Missing position_id or checkin_secret' }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/events/${slug}/checkin/${position_id}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'}`,
        },
        body: JSON.stringify({ force: false }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.already_checked_in) {
        return NextResponse.json({ error: 'Already checked in', code: 'ALREADY_CHECKED_IN' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Check-in failed' }, { status: 400 });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Checkin POST error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}
