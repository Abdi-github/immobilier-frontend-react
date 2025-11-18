import { baseApi } from '@/shared/api/baseApi';

// Multi-language name structure from API
export interface MultiLangName {
  en: string;
  fr: string;
  de: string;
  it: string;
}

export interface Canton {
  id: string;
  _id?: string;
  name: MultiLangName;
  code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  propertyCount?: number;
}

export interface City {
  id: string;
  _id?: string;
  name: MultiLangName;
  postal_code?: string;
  canton_id: string;
  canton?: Canton;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  propertyCount?: number;
}

export interface PopularCity {
  id: string;
  name: string | MultiLangName;
  canton_code: string;
  canton_name: string | MultiLangName;
  image_url?: string;
  rent_count: number;
  buy_count: number;
  total_count: number;
}

export interface Category {
  id: string;
  _id?: string;
  name: MultiLangName;
  slug: string;
  section: string;
  sort_order?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  count?: number;
}

export interface Amenity {
  id: string;
  _id?: string;
  name: MultiLangName;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Cantons - correct endpoint path
    getCantons: builder.query<PaginatedResponse<Canton>, void>({
      query: () => '/public/locations/cantons',
      providesTags: ['Canton'],
    }),

    getCanton: builder.query<ApiResponse<Canton>, string>({
      query: (id) => `/public/locations/cantons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Canton', id }],
    }),

    // Cities - correct endpoint path
    getCities: builder.query<PaginatedResponse<City>, { canton_id?: string } | void>({
      query: (params) => ({
        url: '/public/locations/cities',
        params: params || {},
      }),
      providesTags: ['City'],
    }),

    getCitiesByCanton: builder.query<PaginatedResponse<City>, string>({
      query: (cantonId) => `/public/locations/cantons/${cantonId}/cities`,
      providesTags: (_result, _error, cantonId) => [{ type: 'City', id: `canton-${cantonId}` }],
    }),

    // Popular cities - for homepage tiles
    getPopularCities: builder.query<
      ApiResponse<PopularCity[]>,
      { min_properties?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/public/locations/cities/popular',
        params: params || {},
      }),
      providesTags: [{ type: 'City', id: 'popular' }],
    }),

    // Categories
    getCategories: builder.query<PaginatedResponse<Category>, void>({
      query: () => '/public/categories',
      providesTags: ['Category'],
    }),

    getCategory: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/public/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    // Amenities
    getAmenities: builder.query<PaginatedResponse<Amenity>, void>({
      query: () => '/public/amenities',
      providesTags: ['Amenity'],
    }),
  }),
});

export const {
  useGetCantonsQuery,
  useGetCantonQuery,
  useGetCitiesQuery,
  useGetCitiesByCantonQuery,
  useGetPopularCitiesQuery,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetAmenitiesQuery,
} = locationsApi;
