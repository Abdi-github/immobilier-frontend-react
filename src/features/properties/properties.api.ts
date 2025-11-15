import { baseApi } from '@/shared/api/baseApi';
import type {
  PropertyImage,
  PropertyQueryParams,
  PropertyListResponse,
  PropertyResponse,
} from './properties.types';

// Helper to remove null/undefined values from params
const cleanParams = (params: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ''
    )
  );
};

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all properties with filters
    getProperties: builder.query<PropertyListResponse, PropertyQueryParams | void>({
      query: (params) => {
        return {
          url: '/public/properties',
          params: params ? cleanParams(params as Record<string, unknown>) : {},
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Property' as const, id })),
              { type: 'Property', id: 'LIST' },
            ]
          : [{ type: 'Property', id: 'LIST' }],
    }),

    // Get single property by ID
    getProperty: builder.query<PropertyResponse, string>({
      query: (id) => `/public/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),

    // Get property images
    getPropertyImages: builder.query<{ success: boolean; data: PropertyImage[] }, string>({
      query: (id) => `/public/properties/${id}/images`,
      providesTags: (_result, _error, id) => [{ type: 'Property', id: `${id}-images` }],
    }),

    // Search properties
    searchProperties: builder.query<PropertyListResponse, PropertyQueryParams>({
      query: (params) => ({
        url: '/public/search',
        params: cleanParams(params as Record<string, unknown>),
      }),
      providesTags: ['Search'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetPropertyImagesQuery,
  useSearchPropertiesQuery,
} = propertiesApi;
