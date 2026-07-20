import type { RegionalPretixConfig } from './regions.server';

export function localizedValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record.en || record.ar || Object.values(record).find(entry => typeof entry === 'string');
    if (typeof candidate === 'string') return candidate;
  }
  return fallback;
}

export function normalizePretixEvent(event: Record<string, unknown>, region: RegionalPretixConfig) {
  const description = localizedValue(event.description);
  let managed: Record<string, unknown> = {};
  if (description.trim().startsWith('{')) {
    try { managed = JSON.parse(description); } catch { /* Keep ordinary descriptions intact. */ }
  }
  return {
    id: Number(event.id),
    slug: String(event.slug || ''),
    name: event.name || String(event.slug || ''),
    description: typeof managed.description === 'string' ? managed.description : event.description || '',
    date_from: typeof event.date_from === 'string' ? event.date_from : null,
    date_to: typeof event.date_to === 'string' ? event.date_to : null,
    location: localizedValue(event.location),
    organizer: region.organizer,
    currency: region.currency,
    live: event.live !== false,
    sale_enabled: event.sale_enabled !== false,
    presale_has_ended: event.presale_has_ended === true,
    public_url: typeof event.public_url === 'string' ? event.public_url : '',
    coverImage: typeof managed.coverImage === 'string' ? managed.coverImage : '',
    category: typeof managed.category === 'string' ? managed.category : '',
    skillLevel: typeof managed.skillLevel === 'string' ? managed.skillLevel : '',
    ageGroup: typeof managed.ageGroup === 'string' ? managed.ageGroup : '',
    language: typeof managed.language === 'string' ? managed.language : '',
    duration: typeof managed.duration === 'string' ? managed.duration : '',
    instructor: typeof managed.instructor === 'string' ? managed.instructor : '',
  };
}

export function isUpcomingEvent(event: { date_from: string | null; live: boolean; sale_enabled: boolean; presale_has_ended: boolean }, now = new Date()) {
  if (!event.live || !event.sale_enabled || event.presale_has_ended || !event.date_from) return false;
  const date = new Date(event.date_from);
  return !Number.isNaN(date.getTime()) && date.getTime() >= now.getTime();
}

