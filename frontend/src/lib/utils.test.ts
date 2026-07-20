import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from './utils';

describe('regional presentation', () => {
  it('formats English SAR without Arabic digits', () => {
    expect(formatCurrency(6250, 'SAR', 'en')).toContain('6,250.00');
  });

  it('preserves the Pretix local calendar date across host time zones', () => {
    expect(formatDate('2026-11-01T00:00:00+03:00', 'en')).toContain('November 1, 2026');
  });
});
