'use client';

import type { Market } from './market';

export type AnalyticsEventName =
  | 'market_recommended' | 'market_confirmed' | 'market_changed'
  | 'workshop_list_viewed' | 'workshop_filter_applied' | 'workshop_searched'
  | 'workshop_viewed' | 'workshop_date_selected' | 'workshop_seats_selected'
  | 'attendee_details_started' | 'attendee_details_completed'
  | 'product_added' | 'cart_viewed' | 'cart_updated'
  | 'checkout_started' | 'checkout_failed' | 'order_completed';

export interface AnalyticsPayload {
  market?: Market;
  branch?: string;
  workshop_id?: string;
  product_id?: number;
  category?: string;
  currency?: string;
  value?: number;
  seat_count?: number;
  funnel_step?: string;
  failure_category?: string;
  [key: string]: string | number | boolean | undefined;
}

declare global { interface Window { dataLayer?: Array<Record<string, unknown>>; } }

export function track(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;
  const detail = { event, ...payload, device_class: window.innerWidth < 768 ? 'mobile' : 'desktop' };
  window.dataLayer?.push(detail);
  window.dispatchEvent(new CustomEvent('yadawi:analytics', { detail }));
}
