export type Market = 'KWT' | 'KSA';

export const MARKETS = {
  KWT: { code: 'KWT' as const, countryCode: 'KW', organizer: 'yadawi', currency: 'KWD', label: 'Kuwait', labelAr: 'الكويت' },
  KSA: { code: 'KSA' as const, countryCode: 'SA', organizer: 'yadawi-sa', currency: 'SAR', label: 'Saudi Arabia', labelAr: 'السعودية' },
} as const;

export function marketFromOrganizer(organizer: string): Market | null {
  if (organizer === MARKETS.KWT.organizer) return 'KWT';
  if (organizer === MARKETS.KSA.organizer) return 'KSA';
  return null;
}

export function recommendMarket(language?: string): Market {
  const normalized = language?.toLowerCase() || '';
  if (normalized.includes('-sa')) return 'KSA';
  return 'KWT';
}
