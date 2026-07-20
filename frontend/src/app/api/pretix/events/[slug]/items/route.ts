import { NextRequest, NextResponse } from 'next/server';

const PRETIX_API_URL = process.env.NEXT_PUBLIC_PRETIX_URL || 'https://pretix.mawthook.io';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organizer') || 'yadawi';

  const token =
    org === 'yadawi-sa'
      ? process.env.PRETIX_SA_API_TOKEN || ''
      : process.env.PRETIX_API_TOKEN || '';

  try {
    const response = await fetch(`${PRETIX_API_URL}/api/v1/organizers/${org}/events/${slug}/items/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch items', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
