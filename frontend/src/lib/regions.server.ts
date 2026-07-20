import { MARKETS, Market } from './market';

export interface RegionalPretixConfig {
  market: Market;
  baseUrl: string;
  organizer: string;
  token: string;
  currency: string;
}

export function getRegionalPretixConfig(market: Market): RegionalPretixConfig {
  const definition = MARKETS[market];
  const baseUrl = (process.env.PRETIX_BASE_URL || process.env.NEXT_PUBLIC_PRETIX_URL || '').replace(/\/$/, '');
  const token = market === 'KWT' ? process.env.PRETIX_API_TOKEN : process.env.PRETIX_SA_API_TOKEN;
  if (!baseUrl) throw new Error('PRETIX_BASE_URL is not configured');
  if (!token) throw new Error(`Pretix credentials are not configured for ${market}`);
  return { market, baseUrl, organizer: definition.organizer, token, currency: definition.currency };
}

export function marketFromRequest(value: string | null): Market | null {
  if (value === 'KWT' || value === 'KSA') return value;
  return null;
}

