import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/admin-auth';

/**
 * Mark an order paid and trigger the customer notification.
 * Proxies to the bot service, which marks the order paid in Pretix and WhatsApps
 * the customer the invoice PDF + calendar invite. Keeps the admin key server-side.
 */
export async function POST(req: NextRequest) {
  // Authorize from the signed session, never from a client-supplied header:
  // an `x-user-role` header can be forged by any caller (curl, DevTools).
  const session = await getServerSession(adminAuthOptions);
  const role = (session?.user as any)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { event, code } = await req.json().catch(() => ({}));
  if (!event || !code) {
    return NextResponse.json({ error: 'event and code are required' }, { status: 400 });
  }

  const botUrl = process.env.BOT_API_URL || 'http://localhost:8123';
  const key = process.env.ADMIN_BOT_KEY || 'yadawi-admin-dev-key';
  try {
    const r = await fetch(`${botUrl}/admin/order-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ event, code }),
    });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (e) {
    return NextResponse.json({ error: `Bot unreachable: ${String(e)}` }, { status: 502 });
  }
}
