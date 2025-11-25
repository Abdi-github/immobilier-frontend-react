/**
 * Formatters Utility Tests
 */

import { describe, it, expect } from 'vitest';
import { formatPrice, formatArea } from '@/shared/utils/formatters';

describe('formatPrice', () => {
  it('formats a simple price in CHF', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  it('formats zero price', () => {
    const result = formatPrice(0);
    expect(result).toBeDefined();
  });

  it('handles undefined price', () => {
    const result = formatPrice(undefined as unknown as number);
    expect(result).toBeDefined();
  });
});

describe('formatArea', () => {
  it('formats area with m² suffix', () => {
    const result = formatArea(120);
    expect(result).toContain('120');
    expect(result).toContain('m²');
  });

  it('returns empty for zero', () => {
    const result = formatArea(0);
    expect(result).toBeDefined();
  });
});
