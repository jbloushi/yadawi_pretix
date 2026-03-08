import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency: string = 'KWD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(num);
}

export function formatDate(dateString: string, locale: string = 'ar'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(dateString: string, locale: string = 'ar'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTime(dateString: string, locale: string = 'ar'): string {
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
