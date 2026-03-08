import { NextRequest, NextResponse } from 'next/server';

function getCookie(name: string, cookies: string | null): string | undefined {
    if (!cookies) return undefined;
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
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
        const token = branch === 'KWT'
            ? process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz'
            : process.env.PRETIX_SA_API_TOKEN || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz';

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
            live: data.status === 'live',
            date_from: `${data.dateFrom}T${data.timeFrom || '00:00'}:00Z`,
            date_to: data.dateTo ? `${data.dateTo}T${data.timeTo || '00:00'}:00Z` : `${data.dateFrom}T${data.timeFrom || '00:00'}:00Z`,
            location: { en: data.location },
            description: { en: JSON.stringify(parsedMeta) }
        };

        const headers = {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        };

        const editEventRes = await fetch(`${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/organizers/${org}/events/${slug}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(eventPayload)
        });

        const editEventData = await editEventRes.json();

        if (!editEventRes.ok) {
            return NextResponse.json({ error: editEventData }, { status: editEventRes.status });
        }

        // Optionally handle items (skip for this simple edit functionality unless they add new ones)

        return NextResponse.json({ success: true, event: editEventData });

    } catch (error) {
        console.error('Edit event error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const role = request.headers.get('x-user-role') || 'viewer';
    const email = request.headers.get('x-user-email');
    const cookies = request.headers.get('cookie');
    const cookieEmail = getCookie('yadawi_email', cookies);
    const cookieRole = getCookie('yadawi_role', cookies);

    const userEmail = email || cookieEmail;
    const userRole = role !== 'viewer' ? role : (cookieRole || 'viewer');

    if (!userEmail || !['admin', 'viewer', 'usher'].includes(userRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allOrganizers = [
        { slug: 'yadawi', token: process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz' },
        { slug: 'yadawi-sa', token: process.env.PRETIX_SA_API_TOKEN || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz' },
    ];

    try {
        let foundEvent = null;
        let foundOrg = null;
        let foundToken = null;

        for (const org of allOrganizers) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/organizers/${org.slug}/events/${slug}/`, {
                headers: { 'Authorization': `Token ${org.token}` }
            });
            if (res.ok) {
                foundEvent = await res.json();
                foundOrg = org.slug;
                foundToken = org.token;
                break;
            }
        }

        if (!foundEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const itemsRes = await fetch(`${process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000'}/api/v1/organizers/${foundOrg}/events/${slug}/items/`, {
            headers: { 'Authorization': `Token ${foundToken}` }
        });

        let items = [];
        if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            items = itemsData.results || [];
        }

        return NextResponse.json({ event: foundEvent, items });

    } catch (error) {
        console.error('Fetch event detail error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
