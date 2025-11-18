/**
 * Property Management API - RTK Query Endpoints
 * Endpoints for agents/owners to manage their properties
 */

import { baseApi } from '@/shared/api/baseApi';
import type {
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyResponse,
  MyPropertiesResponse,
  PropertyImage,
  UploadImageResponse,
  CreateTranslationRequest,
  PropertyTranslation,
  PropertyStats,
} from './property-management.types';

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Query params for my properties
interface MyPropertiesParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const propertyManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== My Properties ====================

    /**
     * Get current user's properties
     */
    getMyProperties: builder.query<MyPropertiesResponse, MyPropertiesParams | void>({
      query: (params) => ({
        url: '/agent/properties',
        params: {
          ...params,
          // Filter by current user (backend should handle this based on token)
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Property' as const, id })),
              { type: 'Property', id: 'MY_LIST' },
            ]
          : [{ type: 'Property', id: 'MY_LIST' }],
    }),

    /**
     * Get single property by ID (for editing)
     */
    getMyProperty: builder.query<PropertyResponse, string>({
      query: (id) => `/agent/properties/${id}`,
      transformResponse: (response: ApiResponse<PropertyResponse>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Property', id }],
    }),

    /**
     * Get property statistics
     */
    getPropertyStats: builder.query<PropertyStats, void>({
      query: () => '/agent/properties/statistics',
      transformResponse: (response: ApiResponse<Record<string, unknown>>) => {
        const data = response.data;
        const byStatus = (data.by_status as Record<string, number>) || {};
        return {
          total: (data.total as number) || 0,
          draft: byStatus.DRAFT ?? 0,
          pending: byStatus.PENDING_APPROVAL ?? 0,
          approved: byStatus.APPROVED ?? 0,
          published: byStatus.PUBLISHED ?? 0,
          rejected: byStatus.REJECTED ?? 0,
          archived: byStatus.ARCHIVED ?? 0,
        };
      },
      providesTags: ['PropertyStats'],
    }),

    // ==================== Property CRUD ====================

    /**
     * Create a new property
     */
    createProperty: builder.mutation<PropertyResponse, CreatePropertyRequest>({
      query: (body) => ({
        url: '/agent/properties',
        method: 'POST',
        body: {
          source_language: body.source_language,
          category_id: body.category_id,
          transaction_type: body.transaction_type,
          price: body.price,
          additional_costs: body.additional_costs,
          canton_id: body.canton_id,
          city_id: body.city_id,
          address: body.address,
          postal_code: body.postal_code,
          rooms: body.rooms,
          surface: body.surface,
          amenities: body.amenities,
          agency_id: body.agency_id,
          owner_id: body.owner_id,
        },
      }),
      transformResponse: (response: ApiResponse<PropertyResponse>) => response.data,
      invalidatesTags: [{ type: 'Property', id: 'MY_LIST' }, 'PropertyStats'],
    }),

    /**
     * Update a property
     */
    updateProperty: builder.mutation<PropertyResponse, { id: string; data: UpdatePropertyRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/agent/properties/${id}`,
          method: 'PUT',
          body: data,
        }),
        transformResponse: (response: ApiResponse<PropertyResponse>) => response.data,
        invalidatesTags: (_result, _error, { id }) => [
          { type: 'Property', id },
          { type: 'Property', id: 'MY_LIST' },
        ],
      }
    ),

    /**
     * Delete a property
     */
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `/agent/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Property', id: 'MY_LIST' }, 'PropertyStats'],
    }),

    /**
     * Submit property for approval
     */
    submitForApproval: builder.mutation<PropertyResponse, string>({
      query: (id) => ({
        url: `/agent/properties/${id}/submit`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<PropertyResponse>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Property', id },
        { type: 'Property', id: 'MY_LIST' },
        'PropertyStats',
      ],
    }),

    /**
     * Archive a property (soft-delete)
     */
    archiveProperty: builder.mutation<PropertyResponse, string>({
      query: (id) => ({
        url: `/agent/properties/${id}/archive`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<PropertyResponse>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Property', id },
        { type: 'Property', id: 'MY_LIST' },
        'PropertyStats',
      ],
    }),

    // ==================== Property Images ====================

    /**
     * Get property images
     */
    getPropertyImages: builder.query<PropertyImage[], string>({
      query: (propertyId) => `/agent/properties/${propertyId}/images`,
      transformResponse: (response: ApiResponse<PropertyImage[]>) => response.data,
      providesTags: (_result, _error, propertyId) => [{ type: 'PropertyImages', id: propertyId }],
    }),

    /**
     * Upload single image
     */
    uploadImage: builder.mutation<UploadImageResponse, { propertyId: string; file: FormData }>({
      query: ({ propertyId, file }) => ({
        url: `/agent/properties/${propertyId}/images/upload`,
        method: 'POST',
        body: file,
      }),
      transformResponse: (response: ApiResponse<UploadImageResponse>) => response.data,
      invalidatesTags: (_result, _error, { propertyId }) => [
        { type: 'PropertyImages', id: propertyId },
        { type: 'Property', id: propertyId },
      ],
    }),

    /**
     * Upload multiple images
     */
    uploadMultipleImages: builder.mutation<
      UploadImageResponse[],
      { propertyId: string; files: FormData }
    >({
      query: ({ propertyId, files }) => ({
        url: `/agent/properties/${propertyId}/images/upload-multiple`,
        method: 'POST',
        body: files,
      }),
      transformResponse: (response: ApiResponse<UploadImageResponse[]>) => response.data,
      invalidatesTags: (_result, _error, { propertyId }) => [
        { type: 'PropertyImages', id: propertyId },
        { type: 'Property', id: propertyId },
      ],
    }),

    /**
     * Delete property image
     */
    deleteImage: builder.mutation<void, { propertyId: string; imageId: string }>({
      query: ({ propertyId, imageId }) => ({
        url: `/agent/properties/${propertyId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [
        { type: 'PropertyImages', id: propertyId },
        { type: 'Property', id: propertyId },
      ],
    }),

    /**
     * Set primary image
     */
    setPrimaryImage: builder.mutation<void, { propertyId: string; imageId: string }>({
      query: ({ propertyId, imageId }) => ({
        url: `/agent/properties/${propertyId}/images/${imageId}`,
        method: 'PUT',
        body: { is_primary: true },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [
        { type: 'PropertyImages', id: propertyId },
        { type: 'Property', id: propertyId },
      ],
    }),

    /**
     * Reorder images
     */
    reorderImages: builder.mutation<void, { propertyId: string; imageIds: string[] }>({
      query: ({ propertyId, imageIds }) => ({
        url: `/agent/properties/${propertyId}/images/reorder`,
        method: 'POST',
        body: { image_ids: imageIds },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [
        { type: 'PropertyImages', id: propertyId },
      ],
    }),

    // ==================== Translations ====================

    /**
     * Create translation for property
     */
    createTranslation: builder.mutation<PropertyTranslation, CreateTranslationRequest>({
      query: (body) => ({
        url: '/admin/translations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<PropertyTranslation>) => response.data,
      invalidatesTags: (_result, _error, { property_id }) => [
        { type: 'Property', id: property_id },
      ],
    }),

    /**
     * Request auto-translation (DeepL)
     */
    requestAutoTranslation: builder.mutation<
      void,
      { propertyId: string; targetLanguages?: string[] }
    >({
      query: ({ propertyId, targetLanguages }) => ({
        url: `/agent/properties/${propertyId}/translations/request`,
        method: 'POST',
        body: { target_languages: targetLanguages },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => [{ type: 'Property', id: propertyId }],
    }),
  }),
});

export const {
  // My Properties
  useGetMyPropertiesQuery,
  useGetMyPropertyQuery,
  useGetPropertyStatsQuery,
  // Property CRUD
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useSubmitForApprovalMutation,
  useArchivePropertyMutation,
  // Images
  useGetPropertyImagesQuery,
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useDeleteImageMutation,
  useSetPrimaryImageMutation,
  useReorderImagesMutation,
  // Translations
  useCreateTranslationMutation,
  useRequestAutoTranslationMutation,
} = propertyManagementApi;
