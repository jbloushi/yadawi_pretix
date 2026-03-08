import { NextRequest, NextResponse } from 'next/server';

const PRETIX_API_URL = process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.yadawi.com';
const PRETIX_API_TOKEN = process.env.PRETIX_API_TOKEN || process.env.NEXT_PUBLIC_PRETIX_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organizer') || 'yadawi';

  const token =
    org === 'yadawi-sa'
      ? process.env.PRETIX_SA_API_TOKEN || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro'
      : process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro';

  const url = `${PRETIX_API_URL}/api/v1/organizers/${org}/events/${slug}/`;
  const headers = {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Event not found: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
