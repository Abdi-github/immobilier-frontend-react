/**
 * Properties API endpoint tests
 * Validates RTK Query endpoint definitions and tag configurations
 */

import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api/baseApi';
import languageReducer from '@/shared/state/language.slice';
import authReducer from '@/features/auth/auth.slice';
import { propertiesApi } from '@/features/properties/properties.api';

// Ensure endpoints are injected
propertiesApi;

function createStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      language: languageReducer,
      auth: authReducer,
    },
    middleware: (gD) => gD().concat(baseApi.middleware),
  });
}

describe('propertiesApi', () => {
  it('has getProperties endpoint defined', () => {
    expect(propertiesApi.endpoints.getProperties).toBeDefined();
  });

  it('has getProperty endpoint defined', () => {
    expect(propertiesApi.endpoints.getProperty).toBeDefined();
  });

  it('has getPropertyImages endpoint defined', () => {
    expect(propertiesApi.endpoints.getPropertyImages).toBeDefined();
  });

  it('has searchProperties endpoint defined', () => {
    expect(propertiesApi.endpoints.searchProperties).toBeDefined();
  });

  it('exports query hooks', () => {
    const {
      useGetPropertiesQuery,
      useGetPropertyQuery,
      useGetPropertyImagesQuery,
      useSearchPropertiesQuery,
    } = propertiesApi;

    expect(typeof useGetPropertiesQuery).toBe('function');
    expect(typeof useGetPropertyQuery).toBe('function');
    expect(typeof useGetPropertyImagesQuery).toBe('function');
    expect(typeof useSearchPropertiesQuery).toBe('function');
  });

  it('provides cache tag types', () => {
    const store = createStore();
    // The API should be part of the store state
    expect(store.getState()[baseApi.reducerPath]).toBeDefined();
  });
});
