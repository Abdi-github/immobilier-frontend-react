/**
 * Locations API endpoint tests
 */

import { describe, it, expect } from 'vitest';
import { locationsApi } from '@/features/locations/locations.api';

// Ensure endpoints are injected
locationsApi;

describe('locationsApi', () => {
  it('has getCantons endpoint', () => {
    expect(locationsApi.endpoints.getCantons).toBeDefined();
  });

  it('has getCities endpoint', () => {
    expect(locationsApi.endpoints.getCities).toBeDefined();
  });

  it('has getPopularCities endpoint', () => {
    expect(locationsApi.endpoints.getPopularCities).toBeDefined();
  });

  it('has getCategories endpoint', () => {
    expect(locationsApi.endpoints.getCategories).toBeDefined();
  });

  it('has getAmenities endpoint', () => {
    expect(locationsApi.endpoints.getAmenities).toBeDefined();
  });

  it('exports all query hooks', () => {
    const {
      useGetCantonsQuery,
      useGetCitiesQuery,
      useGetPopularCitiesQuery,
      useGetCategoriesQuery,
      useGetAmenitiesQuery,
    } = locationsApi;

    expect(typeof useGetCantonsQuery).toBe('function');
    expect(typeof useGetCitiesQuery).toBe('function');
    expect(typeof useGetPopularCitiesQuery).toBe('function');
    expect(typeof useGetCategoriesQuery).toBe('function');
    expect(typeof useGetAmenitiesQuery).toBe('function');
  });
});
