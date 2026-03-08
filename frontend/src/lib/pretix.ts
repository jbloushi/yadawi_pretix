import { PretixEvent, PretixItem, PretixOrder } from '@/types/pretix';

const PRETIX_API_URL = process.env.NEXT_PUBLIC_PRETIX_URL || 'http://localhost:8000';
const PRETIX_API_TOKEN = process.env.PRETIX_API_TOKEN || '3ll9f5237hcv96ioakrebef35qvl7qvuurfp3ih46oldfc5i9abmrkdceirozhsz';

export async function pretixFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (PRETIX_API_TOKEN && !(headers as Record<string, string>)['Authorization']) {
    (headers as Record<string, string>)['Authorization'] = `Token ${PRETIX_API_TOKEN}`;
  }

  const response = await fetch(`${PRETIX_API_URL}/api/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function getEvents(organizer?: string): Promise<{ results: PretixEvent[] }> {
  const params = new URLSearchParams();
  if (organizer) params.set('organizer', organizer);
  params.set('ordering', 'date_from');

  const orgSlug = organizer || 'yadawi';
  return pretixFetch<{ results: PretixEvent[] }>(`organizers/${orgSlug}/events/?${params.toString()}`);
}

export async function getEvent(slug: string): Promise<PretixEvent> {
  return pretixFetch<PretixEvent>(`organizers/yadawi/events/${slug}/`);
}

export async function getEventItems(eventSlug: string): Promise<{ results: PretixItem[] }> {
  return pretixFetch<{ results: PretixItem[] }>(`organizers/yadawi/events/${eventSlug}/items/`);
}

export async function getOrder(eventSlug: string, orderCode: string): Promise<PretixOrder> {
  return pretixFetch<PretixOrder>(`events/${eventSlug}/orders/${orderCode}/`);
}

export async function searchOrderByEmail(eventSlug: string, email: string): Promise<{ results: PretixOrder[] }> {
  const params = new URLSearchParams({ email });
  return pretixFetch<{ results: PretixOrder[] }>(`events/${eventSlug}/orders/?${params.toString()}`);
}

export function getCheckoutUrl(eventSlug: string, itemId?: number, variationId?: number, quantity?: number): string {
  const baseUrl = `${PRETIX_API_URL}/checkout/${eventSlug}`;
  const params = new URLSearchParams();

  if (itemId) params.set('item', itemId.toString());
  if (variationId) params.set('variation', variationId.toString());
  if (quantity) params.set('quantity', quantity.toString());

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function getTicketDownloadUrl(eventSlug: string, orderCode: string, positionSecret: string): string {
  return `${PRETIX_API_URL}/events/${eventSlug}/order/${orderCode}/${positionSecret}/download/ticket/`;
}

export function getOrderEditUrl(eventSlug: string, orderCode: string): string {
  return `${PRETIX_API_URL}/events/${eventSlug}/order/${orderCode}/`;
}
