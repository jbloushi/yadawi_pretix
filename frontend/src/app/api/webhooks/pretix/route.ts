import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.PRETIX_WEBHOOK_SECRET || '';
const CHATWOOT_URL = process.env.CHATWOOT_WEBHOOK_URL || '';

interface PretixWebhookPayload {
  notification_id: string;
  organizer: string;
  event: string;
  code: string;
  action: string;
  data: {
    code: string;
    status: string;
    email: string;
    phone?: string;
    total: string;
    currency: string;
    positions?: Array<{
      attendee_name: string;
      attendee_email: string;
    }>;
  };
}

async function forwardToChatwoot(payload: PretixWebhookPayload) {
  if (!CHATWOOT_URL) return;

  const message = formatChatwootMessage(payload);
  
  try {
    await fetch(CHATWOOT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    console.error('Error forwarding to Chatwoot:', error);
  }
}

function formatChatwootMessage(payload: PretixWebhookPayload): string {
  const { action, data } = payload;
  
  switch (action) {
    case 'pretix.event.order.placed':
      return `🎫 New order received!\n\nOrder: ${data.code}\nEmail: ${data.email}\nTotal: ${data.currency} ${data.total}\n\nThank you for your registration!`;
    case 'pretix.event.order.paid':
      return `✅ Payment confirmed!\n\nOrder: ${data.code}\nTotal: ${data.currency} ${data.total}\n\nYour ticket is confirmed. See you at the event!`;
    case 'pretix.event.order.canceled':
      return `❌ Order canceled\n\nOrder: ${data.code}\n\nIf you have any questions, please contact us.`;
    default:
      return `Order update: ${data.code}\nStatus: ${data.status}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-pretix-signature') || '';
    const body = await request.json();

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(await request.text(), signature, WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Log the webhook
    console.log('Received pretix webhook:', {
      action: body.action,
      organizer: body.organizer,
      event: body.event,
      code: body.code,
    });

    // Process based on action type
    switch (body.action) {
      case 'pretix.event.order.placed':
        await forwardToChatwoot(body);
        break;
      case 'pretix.event.order.paid':
        await forwardToChatwoot(body);
        break;
      case 'pretix.event.order.canceled':
        await forwardToChatwoot(body);
        break;
      case 'pretix.event.checkin.created':
        console.log('Check-in created:', body.data);
        break;
      default:
        console.log('Unhandled action:', body.action);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Pretix webhook endpoint is active' 
  });
}
