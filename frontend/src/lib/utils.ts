import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency: string = 'KWD', locale: string = 'en'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const region = currency === 'KWD' ? 'KW' : 'SA';
  return new Intl.NumberFormat(`${locale === 'ar' ? 'ar' : 'en'}-${region}`, {
    style: 'currency',
    currency,
  }).format(num);
}

function parsePretixLocalDate(dateString: string): Date {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return new Date(dateString);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 12), Number(match[5] || 0));
}

export function formatDate(dateString: string | null | undefined, locale: string = 'ar'): string {
  if (!dateString) return locale === 'ar' ? 'التاريخ يحدد قريباً' : 'Date to be announced';
  const date = parsePretixLocalDate(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(dateString: string | null | undefined, locale: string = 'ar'): string {
  if (!dateString) return locale === 'ar' ? 'الوقت يحدد قريباً' : 'Time to be announced';
  const date = parsePretixLocalDate(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTime(dateString: string | null | undefined, locale: string = 'ar'): string {
  return `${formatDate(dateString, locale)} - ${formatTime(dateString, locale)}`;
}

export function getRegionFromSlug(slug: string): 'ksa' | 'kuwait' {
  if (slug.includes('-kw') || slug.includes('-kuwait')) return 'kuwait';
  return 'ksa';
}

export function generateOrderCacheKey(email: string, orderCode?: string): string {
  return orderCode ? `order-${orderCode}` : `orders-${email}`;
}

export function getLocalizedName(name: Record<string, string> | string | undefined, locale: string = 'ar'): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[locale] || name.en || Object.values(name)[0] || '';
}
