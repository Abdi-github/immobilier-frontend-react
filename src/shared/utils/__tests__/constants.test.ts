/**
 * Constants Tests
 * Verify exported constants have correct shapes and values
 */

import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  RENT_PRICE_RANGES,
  BUY_PRICE_RANGES,
  ROOM_OPTIONS,
  SURFACE_OPTIONS,
  SORT_OPTIONS,
  TRANSACTION_TYPES,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  ROUTES,
  PLACEHOLDER_IMAGE,
} from '@/shared/utils/constants';

describe('constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('includes all 4 Swiss languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en');
      expect(SUPPORTED_LANGUAGES).toContain('fr');
      expect(SUPPORTED_LANGUAGES).toContain('de');
      expect(SUPPORTED_LANGUAGES).toContain('it');
      expect(SUPPORTED_LANGUAGES).toHaveLength(4);
    });
  });

  describe('LANGUAGE_LABELS', () => {
    it('has labels for all supported languages', () => {
      expect(LANGUAGE_LABELS.en).toBe('English');
      expect(LANGUAGE_LABELS.fr).toBe('Français');
      expect(LANGUAGE_LABELS.de).toBe('Deutsch');
      expect(LANGUAGE_LABELS.it).toBe('Italiano');
    });
  });

  describe('LANGUAGE_FLAGS', () => {
    it('has flag emojis for all supported languages', () => {
      expect(LANGUAGE_FLAGS.en).toBe('🇬🇧');
      expect(LANGUAGE_FLAGS.fr).toBe('🇫🇷');
      expect(LANGUAGE_FLAGS.de).toBe('🇩🇪');
      expect(LANGUAGE_FLAGS.it).toBe('🇮🇹');
    });
  });

  describe('pagination', () => {
    it('has valid default page size', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(20);
    });

    it('has sorted page size options', () => {
      expect(PAGE_SIZE_OPTIONS).toEqual([10, 20, 50, 100]);
    });
  });

  describe('filter ranges', () => {
    it('RENT_PRICE_RANGES has "Any" as first option', () => {
      expect(RENT_PRICE_RANGES[0].label).toBe('Any');
      expect(RENT_PRICE_RANGES[0].min).toBeNull();
    });

    it('BUY_PRICE_RANGES has "Any" as first option', () => {
      expect(BUY_PRICE_RANGES[0].label).toBe('Any');
    });

    it('ROOM_OPTIONS has "Any" as first option', () => {
      expect(ROOM_OPTIONS[0].label).toBe('Any');
      expect(ROOM_OPTIONS[0].value).toBeNull();
    });

    it('SURFACE_OPTIONS has "Any" as first option', () => {
      expect(SURFACE_OPTIONS[0].label).toBe('Any');
    });
  });

  describe('SORT_OPTIONS', () => {
    it('has newest first as first option', () => {
      expect(SORT_OPTIONS[0]).toEqual({ value: 'newest', label: 'Newest first' });
    });

    it('includes price sorting both directions', () => {
      const values = SORT_OPTIONS.map((o) => o.value);
      expect(values).toContain('price_asc');
      expect(values).toContain('price_desc');
    });
  });

  describe('TRANSACTION_TYPES', () => {
    it('has both rent and buy', () => {
      expect(TRANSACTION_TYPES).toEqual([
        { value: 'rent', label: 'Rent' },
        { value: 'buy', label: 'Buy' },
      ]);
    });
  });

  describe('ROUTES', () => {
    it('has required routes defined', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.PROPERTIES).toBe('/properties');
      expect(ROUTES.LOGIN).toBe('/login');
      expect(ROUTES.REGISTER).toBe('/register');
    });
  });

  describe('PLACEHOLDER_IMAGE', () => {
    it('has a valid placeholder path', () => {
      expect(PLACEHOLDER_IMAGE).toBeDefined();
      expect(typeof PLACEHOLDER_IMAGE).toBe('string');
    });
  });
});
