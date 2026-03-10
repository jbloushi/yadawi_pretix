import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/pretix-cache';

// STATIC VERIFIED TOKEN - Both organizers use this long 64-char token
const VERIFIED_TOKEN = '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz';
const PRETIX_API_URL = 'https://pretix.mawthook.io';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const org = searchParams.get('organizer') || 'yadawi';

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const cacheKey = `items-${org}-${slug}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch(`${PRETIX_API_URL}/api/v1/organizers/${org}/events/${slug}/items/`, {
      headers: {
        'Authorization': `Token ${VERIFIED_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: response.status });
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Items fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
