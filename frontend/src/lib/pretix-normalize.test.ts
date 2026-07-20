import { describe, expect, it } from 'vitest';
import { isUpcomingEvent, localizedValue, normalizePretixEvent } from './pretix-normalize';

const region = { market: 'KWT' as const, baseUrl: 'https://pretix.example', organizer: 'yadawi', token: 'secret', currency: 'KWD' };

describe('Pretix normalization', () => {
  it('normalizes localized fields and managed metadata', () => {
    const event = normalizePretixEvent({
      id: 3,
      slug: 'glass',
      name: { en: 'Glass', ar: 'زجاج' },
      description: JSON.stringify({ description: 'Make a glass piece', category: 'Glass', skillLevel: 'Beginner' }),
      date_from: '2030-02-01T10:00:00Z',
      location: { en: 'Salmiya' },
    }, region);
    expect(event.name).toEqual({ en: 'Glass', ar: 'زجاج' });
    expect(event.description).toBe('Make a glass piece');
    expect(event.category).toBe('Glass');
    expect(event.skillLevel).toBe('Beginner');
    expect(event.currency).toBe('KWD');
    expect(event.organizer).toBe('yadawi');
  });

  it('does not expose object noise as copy', () => {
    expect(localizedValue({ en: 'English', ar: 'عربي' })).toBe('English');
    expect(localizedValue({ value: 12 }, 'fallback')).toBe('fallback');
  });

  it('excludes expired, disabled and malformed workshops', () => {
    const now = new Date('2028-01-01T00:00:00Z');
    expect(isUpcomingEvent({ date_from: '2028-02-01T00:00:00Z', live: true, sale_enabled: true, presale_has_ended: false }, now)).toBe(true);
    expect(isUpcomingEvent({ date_from: '2027-02-01T00:00:00Z', live: true, sale_enabled: true, presale_has_ended: false }, now)).toBe(false);
    expect(isUpcomingEvent({ date_from: '2028-02-01T00:00:00Z', live: false, sale_enabled: true, presale_has_ended: false }, now)).toBe(false);
  });
});
