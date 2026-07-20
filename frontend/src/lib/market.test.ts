import { describe, expect, it } from 'vitest';
import { marketFromOrganizer, MARKETS, recommendMarket } from './market';

describe('regional configuration', () => {
  it('maps only known organizers to markets', () => {
    expect(marketFromOrganizer('yadawi')).toBe('KWT');
    expect(marketFromOrganizer('yadawi-sa')).toBe('KSA');
    expect(marketFromOrganizer('unknown')).toBeNull();
  });

  it('keeps currencies and organizers separate', () => {
    expect(MARKETS.KWT.currency).toBe('KWD');
    expect(MARKETS.KSA.currency).toBe('SAR');
    expect(MARKETS.KWT.organizer).not.toBe(MARKETS.KSA.organizer);
  });

  it('uses locale only as a recommendation', () => {
    expect(recommendMarket('ar-SA')).toBe('KSA');
    expect(recommendMarket('ar-KW')).toBe('KWT');
    expect(recommendMarket('en-US')).toBe('KWT');
  });
});

