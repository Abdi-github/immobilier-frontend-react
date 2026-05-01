import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

/**
 * Base API configuration for RTK Query
 * All feature APIs inject their endpoints into this base API
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD
      ? '/api/v1'
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4003/api/v1'),
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;

      // Add language header for i18n support
      headers.set('Accept-Language', state.language.current);

      // Note: Don't set Content-Type here — fetchBaseQuery handles it
      // automatically (application/json for JSON, multipart for FormData)

      // Add auth token if available
      if (state.auth?.token) {
        headers.set('Authorization', `Bearer ${state.auth.token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    'Property',
    'PropertyImages',
    'PropertyStats',
    'Category',
    'Amenity',
    'Canton',
    'City',
    'Agency',
    'Search',
    'Auth',
    'User',
    'UserSettings',
    'Favorite',
    'Alert',
    'DashboardStats',
    'Inquiry',
  ],
  endpoints: () => ({}),
});
