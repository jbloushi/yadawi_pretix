import { NextRequest, NextResponse } from 'next/server';
import { pretixFetch } from '@/lib/pretix';

export async function GET(request: NextRequest) {
    const role = request.headers.get('x-user-role') || 'viewer';
    const email = request.headers.get('x-user-email');

    if (!email || !['admin', 'viewer', 'usher'].includes(role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const organizers = [
            { slug: 'yadawi', token: process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro' },
            { slug: 'yadawi-sa', token: process.env.PRETIX_SA_API_TOKEN || 'SA_3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceiro' }
        ];
        let totalOrders = 0;
        let totalRevenue = 0;
        let totalWorkshops = 0;
        let todayOrders = 0;
        let todayRevenue = 0;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        console.log('Stats API: Fetching dashboard statistics...');
        for (const org of organizers) {
            try {
                const headers = { 'Authorization': `Token ${org.token}` };
                const eventsData = await pretixFetch<{ results: any[] }>(`organizers/${org.slug}/events/`, { headers });
                totalWorkshops += eventsData.results.length;

                for (const event of eventsData.results) {
                    const ordersData = await pretixFetch<{ results: any[] }>(`organizers/${org.slug}/events/${event.slug}/orders/`, { headers });
                    totalOrders += ordersData.results.length;

                    for (const order of ordersData.results) {
                        const revenue = parseFloat(order.total);
                        totalRevenue += revenue;

                        if (!order.datetime && !order.created_at) continue;

                        const orderDate = new Date(order.datetime || order.created_at);
                        if (orderDate >= new Date(startOfToday)) {
                            todayOrders += 1;
                            todayRevenue += revenue;
                        }
                    }
                }
            } catch (err) {
                console.error(`Error fetching stats for ${org.slug}:`, err);
            }
        }

        return NextResponse.json({
            totalOrders,
            totalRevenue,
            totalWorkshops,
            totalUsers: totalOrders, // Simple estimation for now
            todayOrders,
            todayRevenue,
            ordersChange: 5.2, // Placeholder for trend
            revenueChange: 8.1, // Placeholder for trend
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
