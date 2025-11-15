/**
 * Dashboard API - RTK Query Endpoints
 */

import { baseApi } from '@/shared/api/baseApi';
import type { User } from '@/features/auth/auth.types';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSettings,
  Favorite,
  PropertyAlert,
  CreateAlertRequest,
  UpdateAlertRequest,
  DashboardStats,
  Inquiry,
} from './dashboard.types';

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Paginated response
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Raw API paginated response (meta field)
interface RawPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

function transformPaginatedResponse<T>(raw: RawPaginatedResponse<T>): PaginatedResponse<T> {
  return {
    success: raw.success,
    data: raw.data,
    pagination: {
      page: raw.meta.page,
      limit: raw.meta.limit,
      total: raw.meta.total,
      totalPages: raw.meta.total_pages,
    },
  };
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Profile ====================

    /**
     * Get current user profile
     * Backend: GET /api/v1/public/auth/me
     */
    getProfile: builder.query<User, void>({
      query: () => '/public/auth/me',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['User'],
    }),

    /**
     * Update user profile
     * Backend: PATCH /api/v1/public/auth/me
     */
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: '/public/auth/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['User'],
    }),

    /**
     * Change password
     * Backend: POST /api/v1/public/auth/change-password
     */
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: '/public/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Upload avatar
     * Backend: POST /api/v1/public/users/avatar
     */
    uploadAvatar: builder.mutation<{ avatar_url: string }, FormData>({
      query: (body) => ({
        url: '/public/users/avatar',
        method: 'POST',
        body,
        // Don't set Content-Type for FormData - browser handles it with boundary
        formData: true,
      }),
      transformResponse: (response: ApiResponse<{ avatar_url: string }>) => response.data,
      invalidatesTags: ['User'],
    }),

    /**
     * Delete avatar
     * Backend: DELETE /api/v1/public/users/avatar
     */
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: '/public/users/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // ==================== Settings ====================

    /**
     * Get user settings
     * Backend: GET /api/v1/public/users/settings
     */
    getSettings: builder.query<UserSettings, void>({
      query: () => '/public/users/settings',
      transformResponse: (response: ApiResponse<UserSettings>) => response.data,
      providesTags: ['UserSettings'],
    }),

    /**
     * Update user settings
     * Backend: PATCH /api/v1/public/users/settings
     */
    updateSettings: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (body) => ({
        url: '/public/users/settings',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<UserSettings>) => response.data,
      invalidatesTags: ['UserSettings'],
    }),

    // ==================== Favorites ====================

    /**
     * Get user favorites
     * Backend: GET /api/v1/public/users/favorites
     */
    getFavorites: builder.query<PaginatedResponse<Favorite>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 12 }) => ({
        url: '/public/users/favorites',
        params: { page, limit },
      }),
      transformResponse: (raw: RawPaginatedResponse<Favorite>) => transformPaginatedResponse(raw),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Favorite' as const, id })),
              { type: 'Favorite', id: 'LIST' },
            ]
          : [{ type: 'Favorite', id: 'LIST' }],
    }),

    /**
     * Add to favorites
     * Backend: POST /api/v1/public/users/favorites (body: { property_id })
     */
    addFavorite: builder.mutation<Favorite, string>({
      query: (propertyId) => ({
        url: '/public/users/favorites',
        method: 'POST',
        body: { property_id: propertyId },
      }),
      transformResponse: (response: ApiResponse<Favorite>) => response.data,
      invalidatesTags: [
        { type: 'Favorite', id: 'LIST' },
        { type: 'Favorite', id: 'IDS' },
        'DashboardStats',
      ],
    }),

    /**
     * Remove from favorites
     * Backend: DELETE /api/v1/public/users/favorites/:propertyId
     */
    removeFavorite: builder.mutation<void, string>({
      query: (propertyId) => ({
        url: `/public/users/favorites/${propertyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Favorite', id: 'LIST' },
        { type: 'Favorite', id: 'IDS' },
        'DashboardStats',
      ],
    }),

    /**
     * Check if property is in favorites
     * Backend: GET /api/v1/public/users/favorites/:propertyId
     */
    checkFavorite: builder.query<{ is_favorite: boolean }, string>({
      query: (propertyId) => `/public/users/favorites/${propertyId}`,
      transformResponse: (response: ApiResponse<{ is_favorite: boolean }>) => response.data,
    }),

    // ==================== Alerts ====================

    /**
     * Get user alerts
     * Backend: GET /api/v1/public/users/alerts
     */
    getAlerts: builder.query<PropertyAlert[], void>({
      query: () => '/public/users/alerts',
      transformResponse: (response: ApiResponse<PropertyAlert[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Alert' as const, id })),
              { type: 'Alert', id: 'LIST' },
            ]
          : [{ type: 'Alert', id: 'LIST' }],
    }),

    /**
     * Create alert
     * Backend: POST /api/v1/public/users/alerts
     */
    createAlert: builder.mutation<PropertyAlert, CreateAlertRequest>({
      query: (body) => ({
        url: '/public/users/alerts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<PropertyAlert>) => response.data,
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }, 'DashboardStats'],
    }),

    /**
     * Update alert
     * Backend: PUT /api/v1/public/users/alerts/:id
     */
    updateAlert: builder.mutation<PropertyAlert, { id: string; data: UpdateAlertRequest }>({
      query: ({ id, data }) => ({
        url: `/public/users/alerts/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<PropertyAlert>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Alert', id }],
    }),

    /**
     * Delete alert
     * Backend: DELETE /api/v1/public/users/alerts/:id
     */
    deleteAlert: builder.mutation<void, string>({
      query: (id) => ({
        url: `/public/users/alerts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }, 'DashboardStats'],
    }),

    /**
     * Toggle alert active status
     * Backend: PATCH /api/v1/public/users/alerts/:id/toggle
     */
    toggleAlert: builder.mutation<PropertyAlert, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `/public/users/alerts/${id}/toggle`,
        method: 'PATCH',
        body: { is_active },
      }),
      transformResponse: (response: ApiResponse<PropertyAlert>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Alert', id }, 'DashboardStats'],
    }),

    // ==================== Dashboard Stats ====================

    /**
     * Get favorite property IDs (for quick lookup on listing pages)
     * Backend: GET /api/v1/public/users/favorites/ids
     */
    getFavoriteIds: builder.query<string[], void>({
      query: () => '/public/users/favorites/ids',
      transformResponse: (response: ApiResponse<{ property_ids: string[] }>) =>
        response.data.property_ids,
      providesTags: [{ type: 'Favorite', id: 'IDS' }],
    }),

    /**
     * Get dashboard stats
     * Backend: GET /api/v1/public/users/dashboard/stats
     */
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/public/users/dashboard/stats',
      transformResponse: (response: ApiResponse<DashboardStats>) => response.data,
      providesTags: ['DashboardStats'],
    }),

    // ==================== Inquiries ====================

    /**
     * Get user's own inquiries (leads)
     * Backend: GET /api/v1/public/leads/my-inquiries
     */
    getMyInquiries: builder.query<PaginatedResponse<Inquiry>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/public/leads/my-inquiries',
        params: { page, limit },
      }),
      transformResponse: (raw: RawPaginatedResponse<Inquiry>) => transformPaginatedResponse(raw),
      providesTags: ['Inquiry'],
    }),

    // ==================== Account ====================

    /**
     * Deactivate own account (soft delete)
     * Backend: DELETE /api/v1/public/users/account
     */
    deactivateAccount: builder.mutation<void, void>({
      query: () => ({
        url: '/public/users/account',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  // Profile
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  // Settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  // Favorites
  useGetFavoritesQuery,
  useGetFavoriteIdsQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useCheckFavoriteQuery,
  // Alerts
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
  useToggleAlertMutation,
  // Stats
  useGetDashboardStatsQuery,
  // Inquiries
  useGetMyInquiriesQuery,
  // Account
  useDeactivateAccountMutation,
} = dashboardApi;
