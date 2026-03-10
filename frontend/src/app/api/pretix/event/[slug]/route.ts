import { NextRequest, NextResponse } from 'next/server';

// STATIC VERIFIED TOKENS - Unique prefixes to avoid database duplication crash
const KW_TOKEN = 'KW_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro';
const SA_TOKEN = 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro';
const PRETIX_API_URL = 'https://pretix.mawthook.io';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organizer') || 'yadawi';

  const url = `${PRETIX_API_URL}/api/v1/organizers/${org}/events/${slug}/`;
  const headers = {
    'Authorization': `Token ${org === 'yadawi-sa' ? SA_TOKEN : KW_TOKEN}`,
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
