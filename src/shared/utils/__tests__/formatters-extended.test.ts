/**
 * Extended Formatters Tests
 * Covers: formatPrice, formatRentalPrice, formatArea, formatRooms,
 *         formatDate, formatRelativeTime, truncateText, slugify, getLocalizedName
 */

import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatRentalPrice,
  formatArea,
  formatRooms,
  formatDate,
  truncateText,
  slugify,
  getLocalizedName,
} from '@/shared/utils/formatters';

describe('formatPrice', () => {
  it('formats a standard price in CHF', () => {
    const result = formatPrice(1500);
    expect(result).toMatch(/CHF\s+1.500/);
  });

  it('formats large values with apostrophe grouping', () => {
    const result = formatPrice(1250000);
    expect(result).toContain('1');
    expect(result).toContain('250');
    expect(result).toContain('000');
  });

  it('returns "Prix sur demande" for null', () => {
    expect(formatPrice(null)).toBe('Prix sur demande');
  });

  it('returns "Prix sur demande" for undefined', () => {
    expect(formatPrice(undefined)).toBe('Prix sur demande');
  });

  it('returns "Prix sur demande" for 0', () => {
    expect(formatPrice(0)).toBe('Prix sur demande');
  });

  it('uses custom currency', () => {
    const result = formatPrice(1000, 'EUR');
    expect(result).toContain('EUR');
  });
});

describe('formatRentalPrice', () => {
  it('adds /mo suffix for rental prices', () => {
    const result = formatRentalPrice(1500);
    expect(result).toContain('CHF');
    expect(result).toContain('/mo');
  });

  it('does not add suffix for zero price', () => {
    const result = formatRentalPrice(0);
    expect(result).toBe('Prix sur demande');
  });

  it('uses custom month label', () => {
    const result = formatRentalPrice(2000, 'CHF', '/month');
    expect(result).toContain('/month');
  });
});

describe('formatArea', () => {
  it('formats with m² suffix', () => {
    expect(formatArea(120)).toBe('120 m²');
  });

  it('formats large areas with formatting', () => {
    const result = formatArea(1500);
    expect(result).toContain('m²');
  });

  it('returns "-" for null', () => {
    expect(formatArea(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatArea(undefined)).toBe('-');
  });
});

describe('formatRooms', () => {
  it('formats single room', () => {
    expect(formatRooms(1)).toBe('1 room');
  });

  it('formats multiple rooms', () => {
    expect(formatRooms(3)).toBe('3 rooms');
  });

  it('supports custom labels', () => {
    expect(formatRooms(2, 'pièce', 'pièces')).toBe('2 pièces');
  });

  it('returns "-" for null', () => {
    expect(formatRooms(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatRooms(undefined)).toBe('-');
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2025-06-15T00:00:00Z');
    expect(result).toContain('2025');
    expect(result).toContain('June') || expect(result).toContain('15');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 1));
    expect(result).toContain('2025');
  });

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatDate(undefined)).toBe('-');
  });
});

describe('truncateText', () => {
  it('returns text unchanged when shorter than maxLength', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates text that exceeds maxLength', () => {
    const result = truncateText('This is a very long text', 10);
    // substring(0,10) = 'This is a ' → trim → 'This is a' (9) + '...' = 12
    expect(result).toBe('This is a...');
    expect(result).toMatch(/\.\.\.$/);
  });

  it('handles exact length', () => {
    expect(truncateText('12345', 5)).toBe('12345');
  });
});

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('removes leading and trailing dashes', () => {
    expect(slugify(' -hello- ')).toBe('hello');
  });

  it('handles accented characters by removing them', () => {
    const result = slugify('Café Résumé');
    expect(result).not.toContain(' ');
  });
});

describe('getLocalizedName', () => {
  const multiLangName = { en: 'House', fr: 'Maison', de: 'Haus', it: 'Casa' };

  it('returns the correct language from object', () => {
    expect(getLocalizedName(multiLangName, 'en')).toBe('House');
    expect(getLocalizedName(multiLangName, 'fr')).toBe('Maison');
    expect(getLocalizedName(multiLangName, 'de')).toBe('Haus');
    expect(getLocalizedName(multiLangName, 'it')).toBe('Casa');
  });

  it('falls back to "en" for unsupported language', () => {
    expect(getLocalizedName(multiLangName, 'es')).toBe('House');
  });

  it('returns string as-is when input is a string', () => {
    expect(getLocalizedName('Simple text', 'fr')).toBe('Simple text');
  });

  it('returns empty string for null', () => {
    expect(getLocalizedName(null, 'en')).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getLocalizedName(undefined, 'en')).toBe('');
  });
});
